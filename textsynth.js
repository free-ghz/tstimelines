import got from 'got'

function textsynthInstance(baseUrl, engine) {
    function completeStream(text, maxTokens) {
        let url = baseUrl + "/engines/" + engine + "/completions"
        let request = {
            prompt: text,
            max_tokens: maxTokens,
            temperature: 1.05,
            top_k: 40,
            top_p: 0.9,
            frequency_penalty: 0.1,
            stream: true
        }
        let stream = got.stream.post(url, {
            json: request
        })
        let completeText = ""
        let previous = ""
        return new Promise((resolve, reject) => {
            let handleJson = (json) => {
                if (json == '') return
                let newText = ""
                let finishReason = "dunno"
                let reachedEnd = false
                try {
                    json = previous + json
                    let {text, reached_end, finish_reason} = JSON.parse(json)
                    previous = ""
                    newText = text
                    finishReason = finish_reason
                    reachedEnd = reached_end
                    completeText += newText
                    process.stdout.write(newText)
                    if (reachedEnd) {
                        resolve({
                                finish_reason: finishReason,
                                text: completeText
                        })
                    }
                } catch(e) {
                    // if there's an error, likely we just received part of a json object.
                    // store it and combine with next
                    console.log('°')
                    previous += json
                }
            }
            
            stream.on("data", async res => {
                let incomingBuffer = Buffer.from(res)
                let text = ""
                try {
                    text += incomingBuffer.toString("utf-8")
                } catch (e) {
                    console.log("\n\n last part of buffer weird. sorry")
                }
                let inArray = text.split("\n\n")
                inArray.forEach(handleJson)
            })
        })
    }
    return completeStream
}

export default textsynthInstance