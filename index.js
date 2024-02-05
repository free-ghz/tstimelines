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


function completeStream(text, tokens) {
    let url = baseUrl + "/engines/" + engine + "/completions"
    let request = {
        prompt: text,
        max_tokens: tokens,
        temperature: 1,
        top_k: 40,
        top_p: 1,
        stream: true
    }
    let stream = got.stream.post(url, {
        json: request
    })
    let completeText = ""
    return new Promise((resolve, reject) => {
        let handleJson = (json) => {
            if (json == '') return
            let {text, reached_end, finish_reason} = JSON.parse(json)
            completeText += text
            process.stdout.write(text)
            if (reached_end) {
                resolve({
                        finish_reason: finish_reason,
                        text: completeText
                })
            }
        }
        stream.on("data", async res => {
            let incoming = Buffer.from(res).toString("utf-8")
            let inArray = incoming.split("\n\n")
            inArray.forEach(handleJson)
        })
    })
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
    let primerResponse = await completeStream(primer, 400)
    console.log("\n\n∑   (Done.) reason:", primerResponse.finish_reason)
    let prompt = promptTemplate.replace("€", primerResponse.text)
    let promptResponse = (await completeStream(prompt, 9999))
    console.log("\n\n∑   (Done.) reason:", promptResponse.finish_reason)
}

run()