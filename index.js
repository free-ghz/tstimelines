import textsynth from './textsynth.js'
import prompts from './prompts.js'
import store from './store.js'

let falcon = textsynth("http://neytiri:8080/v1", "falcon40")

async function run() {
    let batched = process.argv.includes("--batch")
    while (true) {
        let allPrompts = await prompts.read()
        let orderedPrompts = prompts.schedule(allPrompts)
        await prompts.runOrder(orderedPrompts, async prompt => {
            console.log("Running prompt", prompt.title)
            return await falcon(prompt)
        }, async prompt => {
            store(prompt)
        })
        if (!batched) {
            console.log(orderedPrompts)
            break
        }
    }
}

run()