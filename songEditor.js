function createElement(tag, parent, cb) {
    const e = document.createElement(tag)
    if (parent) parent.append(e)
    if (cb) cb(e)
    return e
}
class SongEditor {
    constructor(chart, songType, parent) {
        console.log("creating SongEditor, please wait...")
        if (!parent.append) throw new Error("Cannot append song editor to parent (function does not exist)")
        if (typeof parent.append != "function") throw new Error("Cannot append song editor to parent (parent.append is not a function)")
        MelodiiParser.package(chart).then(() => {
            this.audioPlayer = new Audio("assets/audio/song/" + songType + ".ogg")
            this.element = createElement("div", parent, (div) => {
                div.style.position = "absolute"
                div.style.left = "0px"
                div.style.top = "0px"
                div.style.width = "100%"
                div.style.height = "100%"
            })
            this.element.lineDisplay = createElement("div", this.element, display => {
                display.style.position = "absolute"
                display.style.left = "0px"
                display.style.top = "0px"
                display.style.width = "640px"
                display.style.height = "200px"
                display.style.backgroundColor = "dodgerblue"
            })
            this.element.lineDisplay.divider = createElement("div", this.element.lineDisplay, divider => {
                divider.style.position = "absolute"
                divider.style.left = "0px"
                divider.style.top = "99px"
                divider.style.width = "100%"
                divider.style.height = "2px"
                divider.style.backgroundColor = "white"
            })
        }).catch((err) => {
            throw new Error("Song Editor cannot use an unpackagable chart.\n" + err)
        })
    }
}
window.SongEditor = SongEditor