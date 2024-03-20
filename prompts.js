import { parse } from 'yaml'
import fs from 'fs'
import crypto from 'crypto'
const md5 = data => crypto.createHash('md5').update(data).digest("hex")

let inMemoryList = []

async function init() {
    console.log("Initializing prompts store")
    let disk = await readFromDisk()
    disk.forEach(prompt => inMemoryList.push(prompt))
    console.log("Initialized prompts store.")
}

async function readFromDisk() {
    console.log("Reading prompt yamls...")
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
            console.log("Error when parsing yaml", e)
        }
    })

    console.log("Validating prompts...")
    allPrompts = allPrompts.filter(prompt => {
        if (!(prompt.title)) {
            console.log("Ignoring a prompt without title.")
            return false
        }
        if (!(prompt.prompt)) {
            console.log("Ignoring prompt", prompt.title, "without a prompt??")
            return false
        }
        prompt.md5 = md5(prompt.prompt)
        if (prompt.disabled) {
            console.log("Ignoring disabled prompt", prompt.title)
            return false
        }
        if (prompt.requires) {
            for (let required of prompt.requires) {
                if (allPrompts.filter(p => p.title == required && !(p.disabled)).length == 0) {
                    console.log("Prompt", prompt.title, "requires missing or disabled prompt", required, ", ignoring it.")
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
    console.log("Establishing prompt order")
    let orderedPrompts = []
    do {
        let lengthBefore = orderedPrompts.length
        promptlist: for (let prompt of prompts) {
            if (!(prompt.requires) || (prompt.requires.length && prompt.requires.length == 0)) {
                console.log(orderedPrompts.length + 1, "-", prompt.title, ": has no requirements")
                orderedPrompts.push(prompt)
            } else {
                for (let requirement of prompt.requires) {
                    if (!orderedPrompts.map(p => p.title).includes(requirement)) {
                        continue promptlist
                    }
                }
                console.log(orderedPrompts.length + 1, "-", prompt.title, ": now has all requirements fulfilled:", prompt.requires)
                orderedPrompts.push(prompt)
            }
        }

        orderedPrompts.forEach(prompt => {
            prompts = prompts.filter(p => p != prompt)
        })
        
        let lengthAfter = orderedPrompts.length
        if (lengthBefore == lengthAfter) {
            console.log("Can't order", prompts.map(p => p.title), "disregarding.")
            break
        }
    } while (prompts.length > 0)

    return orderedPrompts
}

function list(filters) {
    if (filters == undefined) {
        return inMemoryList
    }
    let filteredList = inMemoryList
    for (let filter of filters) {
        filteredList = filteredList.filter(prompt => {
            return prompt[filter.key] == filter.text
        })
    }
    return filteredList
}

function remove(prompt) {
    inMemoryList.splice(inMemoryList.indexOf(prompt), 1)
    // TODO: actually remove
}

export default { init, list, schedule, remove }