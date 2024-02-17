import fs from 'fs'

let versions = new Map()
function getNextVersion(base) {
    if (versions.get(base)) {
        let next = Number(versions.get(base)) + 1
        versions.set(base, next)
        return next
    }

    console.log("No in-mem filename history for", base)
    let files = fs.readdirSync(`./output/${base}/`)
        .filter(f => f.startsWith(base))
        .filter(f => f.endsWith(".txt"))
        .map(f => f.substring(base.length))
        .map(f => f.substring(0, f.length - 4))
        .sort()
    if (files.length == 0) {
        console.log("I think this is the first stored", base, " ...starting at 1")
        versions.set(base, 1)
        return 1
    }

    let next = Number(files[files.length - 1]) + 1
    versions.set(base, next)
    console.log("using", next)
    return next
}

function ensureDirectoryExists(base) {
    let dir = `./output/${base}`;
    if (!fs.existsSync(dir)){
        console.log("Creating dir for", base)
        fs.mkdirSync(dir, { recursive: true });
    }
}

function store(prompt) {
    console.log("Writing", prompt.title, "response to disk")
    ensureDirectoryExists(prompt.title)

    let frontmatter = "-- finish reason: " + prompt.response.finish_reason
    frontmatter += "\n-- generated: " + new Date().toString()
    frontmatter += "\n-- duration: " + Math.round(prompt.response.duration / 60) + " min"
    
    let text = `${frontmatter}\n\n${prompt.response.text}\n`
    let version = getNextVersion(prompt.title)
    fs.promises.writeFile(`./output/${prompt.title}/${prompt.title}${version}.txt`, text, 'utf8')
}

export default store