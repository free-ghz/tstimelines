import textsynth from './textsynth.js'
import prompts from './prompts.js'
import store from './store.js'

let defaultBaseUrl = "http://neytiri:8080/v1";
let defaultModel = "falcon40"

let config = readParams()
console.log(config)

let model = textsynth(config.base, config.model)

function readParams() {
    let batched = process.argv.includes("--batch")
    let baseLocation = process.argv.indexOf("--base")
    let baseValue = process.argv[baseLocation + 1]
    let modelLocation = process.argv.indexOf("--model")
    let modelValue = process.argv[modelLocation + 1]

    return {
        batched,
        base: baseLocation >= 0 ? baseValue : defaultBaseUrl,
        model: modelLocation >= 0 ? modelValue : defaultModel
    }
}

async function run() {

    while (true) {
        let allPrompts = await prompts.read()
        let orderedPrompts = prompts.schedule(allPrompts)
        await prompts.runOrder(orderedPrompts, async prompt => {
            console.log("Running prompt", prompt.title)
            return await model(prompt)
        }, async prompt => {
            store(prompt)
        })
        if (!config.batched) {
            console.log(orderedPrompts)
            break
        }
    }
}

run()