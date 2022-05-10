const axios = require("axios").default
const fs = require("fs/promises")
const childProcess = require("child_process")

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        shell: {
            "build-fable": "dotnet fable src",
            "build-rollup": "rollup --config rollup.config.js",
            "cleanup": "rm -rf src/*.fs.js src/Bitburner.fs src/.fable src/bin src/obj dist"
        }
    })

    grunt.loadNpmTasks("grunt-shell")

    grunt.registerTask("build", [ "shell:build-fable", "shell:build-rollup" ])
    grunt.registerTask("cleanup", [ "shell:cleanup" ])
    grunt.registerTask("get-types", "Get bitburner typings.", async function() {
        const done = this.async()
        /** @type {string} */
        const tsData = await (await axios.get("https://raw.githubusercontent.com/danielyxie/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts")).data
        await fs.writeFile("NetscriptDefinitions.d.ts", tsData)
        childProcess.execSync("yarn ts2fable NetscriptDefinitions.d.ts Bitburner.fs")
        await fs.rm("NetscriptDefinitions.d.ts")
        const fableData = await (await fs.readFile("Bitburner.fs")).toString()
        await fs.rm("Bitburner.fs")
        
        const fableDataProcessed = fableData
            .replace(/type\sToastVariantValues\s=$/m, "type ToastVariantValues = ToastVariant")

        await fs.writeFile("src/Bitburner.fs", fableDataProcessed)
        done()
    })
    grunt.registerTask("default", [ "build" ])
}