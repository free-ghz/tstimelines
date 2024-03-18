import express from 'express'
import pug from 'pug'

function createApi(port) {
    let indexTemplate = pug.compileFile('./views/index.pug')

    let api = express()
    api.use(express.static('./static'))
    api.get("/", (request, response) => {
        response.send(indexTemplate())
    })

    api.listen(port, () => {
        console.log("Röjar ralf på port", port)
    })
}

export default createApi