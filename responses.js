import fs from 'fs'
import { v4 as uuid } from 'uuid'
import yaml from 'yaml'

let inMemoryList = []

async function init() {
    console.log("Initializing response store")
    let disk = await readFromDisk()
    disk.forEach(prompt => inMemoryList.push(prompt))
    console.log("Initialized response store.")
}

async function readFromDisk() {
    console.log("Reading response yamls...")
    let files = await fs.promises.readdir('./output/', {recursive: true})

    let yamls = files
        .filter(filename => { return filename.endsWith('.yaml') })
        .map(filename => fs.readFileSync('./output/' + filename, 'utf8'))
    
    let responses = []
    yamls.forEach(text => {
        try {
            let response = yaml.parse(text)
            responses.push(response)
        } catch (e) {
            console.log("Error when parsing yaml", e)
        }
    })

    return responses
}

function ensureDirectoryExists(base) {
    let dir = `./output/${base}`;
    if (!fs.existsSync(dir)){
        console.log("Creating dir for", base)
        fs.mkdirSync(dir, { recursive: true });
    }
}

function store(response) {
    console.log("writeresponse.")
    inMemoryList.push(response)

    console.log("Writing", response.prompt, "response to disk")
    ensureDirectoryExists(response.prompt)

    let output = yaml.stringify(response)

    fs.promises.writeFile(`./output/${response.prompt}/${response.id}.yaml`, output, 'utf8')
}

function create(response, prompt) {
    console.log("createresponse.")
    return {
        id: uuid(),
        text: response.text,
        finish_reason: response.finish_reason,
        duration: response.duration,
        created: new Date().getDate(),
        prompt: prompt.title,
        prompt_md5: prompt.md5
    }
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

export default { store, create, list, init }