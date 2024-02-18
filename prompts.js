import { parse } from 'yaml'
import fs from 'fs'


async function read() {
    console.log("reading prompt yamls...")
    let files = await fs.promises.readdir('./prompts/')
    let yamls = files
        .filter(filename => { return filename.endsWith('.yaml') })
        .map(filename => fs.readFileSync('./prompts/' + filename, 'utf8'))
    
    let allPrompts = []
    yamls.forEach(yaml => {
        try {
            let prompts = parse(yaml)
            allPrompts = [...allPrompts, ...prompts]
        } catch (e) {
            console.log("error when parsing yaml")
        }
    })

    console.log("validating prompts...")
    allPrompts = allPrompts.filter(prompt => {
        if (!(prompt.title)) {
            console.log("Prompt without title.")
            return false
        }
        if (!(prompt.prompt)) {
            console.log("Prompt", prompt.title, "without a prompt??")
            return false
        }
        if (prompt.disabled) {
            console.log("Prompt", prompt.title, "has 'disabled' key")
            return false
        }
        if (prompt.requires) {
            for (let required of prompt.requires) {
                if (allPrompts.filter(p => p.title == required && !(p.disabled)).length == 0) {
                    console.log("Prompt", prompt.title, "requires missing or disabled prompt", required)
                    return false
                } 
            }
        }
        return true
    })

    return allPrompts
}

function schedule(unorderedPrompts) {
    let prompts = [...unorderedPrompts]
    console.log("establishing prompt order")
    let orderedPrompts = []
    do {
        let lengthBefore = orderedPrompts.length
        promptlist: for (let prompt of prompts) {
            if (!(prompt.requires) || (prompt.requires.length && prompt.requires.length == 0)) {
                console.log(prompt.title, "has no requirements")
                orderedPrompts.push(prompt)
            } else {
                for (let requirement of prompt.requires) {
                    if (!orderedPrompts.map(p => p.title).includes(requirement)) {
                        continue promptlist
                    }
                }
                console.log(prompt.title, "has all requirements fulfilled:", prompt.requires)
                orderedPrompts.push(prompt)
            }
        }

        orderedPrompts.forEach(prompt => {
            prompts = prompts.filter(p => p != prompt)
        })
        
        let lengthAfter = orderedPrompts.length
        if (lengthBefore == lengthAfter) {
            console.log("can't order", prompts.map(p => p.title), "disregarding.")
            break
        }
    } while (prompts.length > 0)

    return orderedPrompts
}

async function runOrder(orderedPrompts, model, store) {
    for (let prompt of orderedPrompts) {
        prompt.requires && prompt.requires.forEach(required => {
            prompt.prompt = prompt.prompt.replace(
                `^${required}^`,
                orderedPrompts.filter(p => p.title == required)[0].response.text
            )
        })
        prompt.response = await model(prompt)
        store(prompt)
    }
}

export default { read, schedule, runOrder }