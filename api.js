import express from 'express'
import pug from 'pug'

function createApi(port, prompts, responses) {
    let indexTemplate = pug.compileFile('./views/index.pug')
    let locusTemplate = pug.compileFile('./views/locus.pug')
    let orphanedTemplate = pug.compileFile('./views/orphaned.pug')
    let promptsTemplate = pug.compileFile('./views/prompts.pug')
    let responseTemplate = pug.compileFile('./views/response.pug')

    let renderPrompt = (prompt) => {
        let locus = responses.list([{key: "prompt", text: prompt.title}])

        let stats = [
            {name:"title", val: prompt.title},
            {name:"md5", val: prompt.md5}
        ]
        if (prompt.disabled != undefined) {
                stats.push({name:"disabled 💤", val: prompt.disabled})
        }
        if (prompt.invalid != undefined) {
                stats.push({name:"invalid 💤", val: prompt.invalid})
        }
        return locusTemplate({
            prompt,
            responses: locus,
            stats
        })
    }

    let api = express()
    api.use(express.static('./static'))
    api.get("/", (request, response) => {
        response.send(indexTemplate())
    })

    api.delete("/responses/:id", (request, response) => {
        let res = responses.list([{key: "id", text: request.params.id}])[0]
        let prompt = prompts.list([{
            key: "title",
            text: res.prompt
        }])[0]
        responses.remove(res)
        response.send(renderPrompt(prompt))
    })

    api.get("/locus/:title", (request, response) => {
        let prompt = prompts.list([{key: "title", text: request.params.title}])[0]
        response.send(renderPrompt(prompt))
    })

    api.get("/orphaned/", (request, response) => {
        let res = responses.list().filter(res => !prompts.list().map(p => p.title).includes(res.prompt))
        response.send(orphanedTemplate({responses: res}))
    })

    api.get("/prompts/", (request, response) => {
        let html = promptsTemplate({prompts: prompts.list()})
        response.send(html)
    })

    api.get("/responses/:id", (request, response) => {
        let res = responses.list([{key: "id", text: request.params.id}])[0]
        let html = responseTemplate({
            response: res,
            stats: [
                {name: "finish reason", val: res.finish_reason},
                {name: "prompt md5", val: res.prompt_md5},
                {name: "duration", val: Math.round(res.duration / 60) + " min"},
                {name: "created", val: new Date(res.created)},
            ]
        })
        response.send(html)
    })

    api.listen(port, () => {
        console.log("Röjar ralf på port", port)
    })
}

export default createApi