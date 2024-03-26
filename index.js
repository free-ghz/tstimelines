import textsynth from './textsynth.js'
import runner from './runner.js'
import runOrder from './runOrder.js'
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

    api(config.port, prompts, responses)

    let allPrompts = prompts.list().filter(p => p.disabled == undefined || p.disabled == false)
    let currentRun = runOrder.create(allPrompts)

    while (true) {
        while (currentRun.hasNext()) {
            await currentRun.runNext(async prompt => {
                await runner.runOrder(prompt, async prompt => {
                    console.log("Running prompt", prompt.title)
                    let a = await model(prompt)
                    return a
                }, responses)
            })
        }
        let allPrompts = prompts.list().filter(p => p.disabled == undefined || p.disabled == false)
        if (allPrompts.length > 0) {
            currentRun = runOrder.create(allPrompts)
            continue
        } else {
            console.log("°")
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

run()
