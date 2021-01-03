import fs from "fs"
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const word = require("./words.json");

export const updateLang = (lang) => {
    words.selected = lang

    fs.writeFile(name, JSON.stringify(words), (err) => {
        if (err) {
            console.log(err)
        }
    })
}

export const getLines = (phrase) => {
    const index = words.languages.indexOf(words.selected)

    return words.phrases[index][phrase]
}