import textsynth from './textsynth.js'
import runner from './runner.js'
import prompts from './prompts.js'
import responses from './responses.js'
import api from './api.js'

let defaultBaseUrl = "http://neytiri:8080/v1";
let defaultModel = "falcon40"
let defaultApiPort = 7005

let config = readParams()
console.log(config)

let model = textsynth(config.base, config.model, config.batched)

function readParams() {
    let batched = process.argv.includes("--batch")
    let baseLocation = process.argv.indexOf("--base")
    let baseValue = process.argv[baseLocation + 1]
    let modelLocation = process.argv.indexOf("--model")
    let modelValue = process.argv[modelLocation + 1]
    let portLocation = process.argv.indexOf("--port")
    let portValue = process.argv[portLocation + 1]

    return {
        batched,
        base: baseLocation >= 0 ? baseValue : defaultBaseUrl,
        model: modelLocation >= 0 ? modelValue : defaultModel,
        port: portLocation >= 0 ? portValue : defaultApiPort
    }
}

async function run() {
    await prompts.init()
    await responses.init()

    api(config.port)
    
    while (false) {
        let allPrompts = prompts.list()
        let orderedPrompts = prompts.schedule(allPrompts)
        await runner.runOrder(orderedPrompts, async prompt => {
            console.log("Running prompt", prompt.title)
            return await model(prompt)
        }, responses)
        if (!config.batched) {
            console.log("Run stop.")
            break
        }
    }
}

run()
