async function runOrder(orderedPrompts, model, responses) {
    for (let prompt of orderedPrompts) {
        prompt.requires && prompt.requires.forEach(required => {
            prompt.prompt = prompt.prompt.replace(
                `^${required}^`,
                orderedPrompts.filter(p => p.title == required)[0].response.text
            )
            prompt.prompt = prompt.prompt.replace(
                `∞${required}∞`,
                orderedPrompts.filter(p => p.title == required)[0].prompt
            )
        })
        let res = await model(prompt)
        if (prompt.store == undefined || prompt.store == true) {
            let response = responses.create(res, prompt)
            responses.store(response)
        }
    }
}

export default { runOrder }