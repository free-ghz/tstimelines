import fs from 'fs'
import { v4 as uuid } from 'uuid'
import yaml from 'yaml'

let inmem = []

function ensureDirectoryExists(base) {
    let dir = `./output/${base}`;
    if (!fs.existsSync(dir)){
        console.log("Creating dir for", base)
        fs.mkdirSync(dir, { recursive: true });
    }
}

function store(response) {
    console.log("writeresponse.")
    inmem.push(response)

    console.log("Writing", response.prompt, "response to disk")
    ensureDirectoryExists(response.prompt)

    let output = yaml.stringify(response)

    fs.promises.writeFile(`./output/${response.prompt}/${response.id}.txt`, output, 'utf8')
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

export default { store, create }