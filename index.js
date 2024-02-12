import textsynth from './textsynth.js'
import prompts from './prompts.js'

let falcon = textsynth("http://neytiri:8080/v1", "falcon40")

async function run() {
    let allPrompts = await prompts.read()
    let orderedPrompts = prompts.schedule(allPrompts)
    await prompts.runOrder(orderedPrompts, async prompt => {
        console.log("Running prompt", prompt.title)
        return await falcon(prompt)
    })
    console.log(orderedPrompts)
}

run()