import express from 'express'
import pug from 'pug'

function createApi(port, prompts, responses) {
    let indexTemplate = pug.compileFile('./views/index.pug')
    let promptTemplate = pug.compileFile('./views/prompt.pug')
    let promptsTemplate = pug.compileFile('./views/prompts.pug')
    let responseTemplate = pug.compileFile('./views/response.pug')

    let api = express()
    api.use(express.static('./static'))
    api.get("/", (request, response) => {
        response.send(indexTemplate())
    })

    api.get("/prompts/:title", (request, response) => {
        let prompt = prompts.list([{key: "title", text: request.params.title}])[0]
        let responsesForPrompt = responses.list([{key: "prompt", text: request.params.title}])
        let html = promptTemplate({prompt, responses: responsesForPrompt})
        response.send(html)
    })

    api.get("/prompts/", (request, response) => {
        let html = promptsTemplate({prompts: prompts.list()})
        response.send(html)
    })

    api.get("/responses/:id", (request, response) => {
        let res = responses.list([{key: "id", text: request.params.id}])[0]
        let html = responseTemplate({response: res})
        response.send(html)
    })

    api.listen(port, () => {
        console.log("Röjar ralf på port", port)
    })
}

export default createApi