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
            let prompt = parse(yaml)
            allPrompts.push(prompt)
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
        let changed = false
        do {
            changed = false
            if (prompt.requires && prompt.invalid == null) {
                for (let required of prompt.requires) {
                    if (allPrompts.filter(p => p.title == required && !(p.disabled)).length == 0) {
                        console.log("Prompt", prompt.title, "requires missing or disabled prompt", required, ", ignoring it.")
                        prompt.invalid = "Requires missing/disabled"
                        prompt.disabled = true
                        changed = true
                    } 
                }
            }
        } while (changed == true) // since disabling one might make another invalid
        return true
    })

    return allPrompts
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

export default { init, list, remove }