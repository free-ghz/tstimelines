import { promises as fs } from 'fs'
import textsynth from './textsynth.js'

let falcon = textsynth("http://neytiri:8080/v1", "falcon40")

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
        let primerResponse = await falcon(primer.prompt, 100)
        primer.response = primerResponse.text.trim()
        console.log("\n\n†   (Done.) reason:", primerResponse.finish_reason)
    }


    let promptTemplate = await fs.readFile("prompt.txt", 'utf8')
    let prompt = promptTemplate
    primers.forEach(primer => {
        prompt = promptTemplate.replace("^" + primer.key + "^", primer.response)
    })
    console.log("\n\n∑")
    let promptResponse = (await falcon(prompt, 1000))
    console.log("\n\n∑   (Done.) reason:", promptResponse.finish_reason)
}

run()