import got from 'got'

let baseUrl = "http://192.168.1.175:8080/v1"
let engine = "mistral7"

async function complete(text, tokens) {
    let url = baseUrl + "/engines/" + engine + "/completions"
    let res = await got.post(url, {
        json: {
            prompt: text,
            max_tokens: tokens
        }
    }).json()
    console.log(res)
}

complete("Suck my", 1)