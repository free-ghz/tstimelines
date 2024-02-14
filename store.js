import { promises as fs } from 'fs'

function store(prompt) {
    let timestamp = Math.floor(Date.now() / 1000)
    let text = `finish reason: ${prompt.response.finish_reason}\n\n${prompt.response.text}`
    console.log("Writing", prompt.title, "response to disk")
    fs.writeFile(`./output/${timestamp}-${prompt.title}.txt`, text, 'utf8')
}

export default store