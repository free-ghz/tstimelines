import got from 'got'
import { promises as fs } from 'fs'

let baseUrl = "http://192.168.1.175:8080/v1"
let engine = "mistral7"

async function complete(text, tokens) {
    let url = baseUrl + "/engines/" + engine + "/completions"
    let res = await got.post(url, {
        json: {
            prompt: text,
            max_tokens: tokens,
            temperature: 1,
            top_k: 40,
            top_p: 1,
            stream: false
        }
    }).json()
    console.log(res)
    return res
}

async function makeChat(chat, tokens) {
    let url = baseUrl + "/engines/" + engine + "/chat"
    let res = await got.post(url, {
        json: {
            messages: chat,
            max_tokens: tokens,
            temperature: 1,
            top_k: 40,
            top_p: 0.9,
            stream: false
        }
    }).json()
    console.log(res)
    return res
}

async function run() {
    let primer = await fs.readFile("primer.txt", 'utf8')
    let promptTemplate = await fs.readFile("prompt.txt", 'utf8')
    console.log(">", primer)
    let primerResponse = (await complete(primer, 300)).text
    primerResponse = primer + primerResponse
    console.log("<", primerResponse)
    let prompt = promptTemplate.replace("€", primerResponse)
    console.log(">", prompt)
    let promptResponse = (await complete(prompt, 9999)).text
    console.log("<", promptResponse)
}

run()