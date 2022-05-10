import fs from "fs"
import { Parser } from "htmlparser2"
import { terser } from "rollup-plugin-terser"

const FILES = []

const parser = new Parser({
    onopentag: (tagName, attribs) => {
        if (tagName === "compile") FILES.push(`src/${attribs.include}.js`)
    }
})

parser.write(fs.readFileSync("src/App.fsproj").toString())
parser.end()

// const FILES = glob.sync("src/**/*.js").filter(f => fs.readFileSync(f).toString().replace(/\s/g, ""))

const CONFIGS = FILES.filter(f => fs.readFileSync(f).toString().replace(/\s/g, "").length > 0).map(f => ({
    plugins: [
        terser()
    ],
    input: f,
    output: {
        file: f.replace(/^src/, "dist").replace(/\.fs.js$/, ".js"),
        format: "es"
    }
}))

export default CONFIGS
