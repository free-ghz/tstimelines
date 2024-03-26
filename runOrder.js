
function create(prompts) {
    let remaining = prompts

    function sortRemaining() {
        remaining = schedule(remaining)
    }
    sortRemaining()

    function hasNext() {
        return remaining.length > 0
    }
    let current = null
    async function runNext(runFunction) {
        current = remaining.pop()
        await runFunction(current)
    }

    function add(prompt) {
        remaining.push(prompt)
        sortRemaining()
    }
    function remove(prompt) {
        let index = remaining.indexOf(prompt)
        remaining.splice(index, 1)
        sortRemaining()
    }

    return {hasNext, runNext, add, remove}
}


function schedule(unorderedPrompts) {
    let prompts = [...unorderedPrompts]
    console.log("Establishing prompt order")
    let orderedPrompts = []
    do {
        let lengthBefore = orderedPrompts.length
        promptlist: for (let prompt of prompts) {
            if (!(prompt.requires) || (prompt.requires.length && prompt.requires.length == 0)) {
                console.log(orderedPrompts.length + 1, "-", prompt.title, ": has no requirements")
                orderedPrompts.push(prompt)
            } else {
                for (let requirement of prompt.requires) {
                    if (!orderedPrompts.map(p => p.title).includes(requirement)) {
                        continue promptlist
                    }
                }
                console.log(orderedPrompts.length + 1, "-", prompt.title, ": now has all requirements fulfilled:", prompt.requires)
                orderedPrompts.push(prompt)
            }
        }

        orderedPrompts.forEach(prompt => {
            prompts = prompts.filter(p => p != prompt)
        })
        
        let lengthAfter = orderedPrompts.length
        if (lengthBefore == lengthAfter) {
            console.log("Can't order", prompts.map(p => p.title), "disregarding.")
            break
        }
    } while (prompts.length > 0)

    return orderedPrompts
}

export default {create}