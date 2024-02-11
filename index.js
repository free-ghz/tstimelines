import { promises as fs } from 'fs'
import got from 'got'

let baseUrl = "http://192.168.1.175:8080/v1"
baseUrl = "http://192.168.1.174:8080/v1"
let engine = "falcon40"

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
        temperature: 1.05,
        top_k: 40,
        top_p: 0.9,
        frequency_penalty: 0.1,
        stream: true
    }
    let stream = got.stream.post(url, {
        json: request
    })
    let completeText = ""
    return new Promise((resolve, reject) => {
        let handleJson = (json) => {
            if (json == '') return
            let newText = ""
            let finishReason = "dunno"
            let reachedEnd = false
            try {
                let {text, reached_end, finish_reason} = JSON.parse(json)
                newText = text
                finishReason = finish_reason
                reachedEnd = reached_end
            } catch(e) {
                console.log("\nAllright, json error, storing the whole thing, sorry.")
                newText = json
                reachedEnd = true
                // TODO should maybe reject here?
            }
            completeText += newText
            process.stdout.write(newText)
            if (reachedEnd) {
                resolve({
                        finish_reason: finishReason,
                        text: completeText
                })
            }
        }
        stream.on("data", async res => {
            let incomingBuffer = Buffer.from(res)
            let text = ""
            try {
                text += incomingBuffer.toString("utf-8")
            } catch (e) {
                console.log("\n\n last part of buffer weird. sorry")
            }
            let inArray = text.split("\n\n")
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

async function readPrimers() {
    let primers = []
    let primertxt = await fs.readFile("primer.txt", 'utf8')
    primertxt
        .split("\n")
        .filter(row => row.startsWith("^"))
        .forEach(primer => {
            let parts = primer.split("^")
            primers.push({
                key: parts[1].trim(),
                prompt: parts[2].trim()
            })
        })
    return primers
}

async function run() {
    let primers = await readPrimers()
    
    for (let primer of primers) {
        console.log("\n\n∑", primer.key)
        let primerResponse = await completeStream(primer.prompt, 100)
        primer.response = primerResponse.text.trim()
        console.log("\n\n†   (Done.) reason:", primerResponse.finish_reason)
    }


    let promptTemplate = await fs.readFile("prompt.txt", 'utf8')
    let prompt = promptTemplate
    primers.forEach(primer => {
        prompt = promptTemplate.replace("^" + primer.key + "^", primer.response)
    })
    console.log("\n\n∑")
    let promptResponse = (await completeStream(prompt, 1000))
    console.log("\n\n∑   (Done.) reason:", promptResponse.finish_reason)
}

run()