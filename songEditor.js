function createElement(tag, parent, cb) {
    const e = document.createElement(tag)
    if (parent) parent.append(e)
    if (cb) cb(e)
    return e
}
function createBeatElement(image, parent, x, y) {
    return createElement("img", parent, img => {
        img.src = "assets/images/" + image + ".png"
        img.style.position = "absolute"
        img.style.left = x + "px"
        img.style.top = y + "px"
        img.style.width = "16px"
        img.style.height = "16px"
        img.draggable = false
    })
}
function createNoteElement(image, parent, x, y) {
    return createElement("img", parent, img => {
        img.src = "assets/images/note_" + image + ".png"
        img.style.position = "absolute"
        img.style.left = (x - 18) + "px"
        img.style.top = (y - 18) + "px"
        img.style.width = "36px"
        img.style.height = "36px"
        img.draggable = false
    })
}
function createDecoratedButton(text, parent) {
    return createElement("button", parent, button => {
        button.innerHTML = text
        button.style.backgroundColor = "#f570ff"
        button.style.outlineWidth = "0px"
        button.style.borderWidth = "0px"
        button.style.color = "white"
    })
}
function createNewLine(parent) {
    return createElement("br", parent)
}
function removeElementChildren(element) {
    const children = []
    for (let i = 0; i < element.children.length; i++) {
        children.push(element.children.item(i))
    }
    children.forEach(element => {
        element.remove()
    })
}
function forEachArrayInObject(object, cb) {
    Object.getOwnPropertyNames(object).forEach(name => {
        object[name].forEach(value => cb({ name: name, value: value }))
    })
}
function forEachArrayInArray(array, cb) {
    array.forEach(array2 => {
        array2.forEach(cb)
    })
}
class SongEditor {
    constructor(chart, songType, parent) {
        console.log("creating SongEditor, please wait...")
        if (!parent.append) throw new Error("Cannot append song editor to parent (function does not exist)")
        if (typeof parent.append != "function") throw new Error("Cannot append song editor to parent (parent.append is not a function)")
        MelodiiParser.package(chart).then(() => {
            this.audioPlayer = new Audio("assets/audio/song/" + songType + ".ogg")
            this.lineData = {
                _display_startSample: 0,
                _display_endSample: 0,
                lines: []
            }
            this.deleteOriginalNotesFlag = false
            SMEnums.SongLineInfo[songType].forEach(line => {
                const lineToPush = []
                if (chart.flags.includes("deleteAllOriginalKeys")) this.deleteOriginalNotesFlag = true
                forEachArrayInObject(chart.buttons, object => {
                    if (object.value >= line.start && object.value <= line.end) {
                        lineToPush.push({ key: object.name, time: object.value })
                    }
                })
                this.lineData.lines.push(lineToPush)
            })
            this.element = createElement("div", parent, (div) => {
                div.style.position = "absolute"
                div.style.left = "0px"
                div.style.top = "0px"
                div.style.width = "100%"
                div.style.height = "100%"
            })
            this.element.editorPositionStandby = createElement("div", this.element, display => {
                display.style.position = "absolute"
                display.style.left = "0px"
                display.style.top = "0px"
                display.style.width = "64px"
                display.style.height = "200px"
                display.style.backgroundColor = "#454545"
            })
            this.element.editorPositionStandby.inactiveIcon = createElement("img", this.element.editorPositionStandby, img => {
                img.src = "assets/images/editorIcon_inactive.png"
                img.draggable = false
                img.style.position = "absolute"
                img.style.left = "8px"
                img.style.top = "32px"
                img.style.width = "48px"
                img.style.height = "48px"
            })
            this.element.lineDisplay = createElement("div", this.element, display => {
                display.style.position = "absolute"
                display.style.left = "64px"
                display.style.top = "0px"
                display.style.width = "592px"
                display.style.height = "200px"
                display.style.background = "radial-gradient(circle, rgba(63,105,251,0.639093137254902) 0%, rgba(70,110,252,0.9612219887955182) 100%)"
            })
            this.element.lineDisplay.placedNotesLine1 = createElement("div", this.element.lineDisplay, display => {
                display.style.position = "absolute"
                display.style.left = "0px"
                display.style.top = "32px"
                display.style.width = "100%"
                display.style.height = "36px"
                display.style.zIndex = 20
            })
            this.element.lineDisplay.placedNotesLine2 = createElement("div", this.element.lineDisplay, display => {
                display.style.position = "absolute"
                display.style.left = "0px"
                display.style.top = "132px"
                display.style.width = "100%"
                display.style.height = "36px"
                display.style.zIndex = 20
            })
            this.element.lineDisplay.editorIcon = createElement("img", this.element.lineDisplay, img => {
                img.src = "assets/images/editorIcon.png"
                img.draggable = false
                img.style.position = "absolute"
                img.style.left = "-24px"
                img.style.top = "26px"
                img.style.width = "48px"
                img.style.height = "48px"
                img.style.zIndex = 10
            })
            this.renderLineNotes = (line) => {
                removeElementChildren(this.element.lineDisplay.placedNotesLine1)
                removeElementChildren(this.element.lineDisplay.placedNotesLine2)
                this.lineData._display_startSample = SMEnums.SongLineInfo[songType][line - 1].start
                this.lineData._display_endSample = SMEnums.SongLineInfo[songType][line - 1].end
                this.lineData.lines[line - 1].forEach(button => {
                    const buttonLine = Number(button.time >= this.lineData._display_startSample + ((this.lineData._display_endSample - this.lineData._display_startSample) / 2)) + 1
                    const x = (((button.time - this.lineData._display_startSample) / (this.lineData._display_endSample - this.lineData._display_startSample)) * 1168) - (584 * (buttonLine - 1))
                    createNoteElement(button.key, this.element.lineDisplay["placedNotesLine" + buttonLine], x, 18)
                })
                const editorIconLine = Number(this.audioPlayer.currentTime * 44100 >= this.lineData._display_startSample + ((this.lineData._display_endSample - this.lineData._display_startSample) / 2))
                const x = (((this.audioPlayer.currentTime * 44100 - this.lineData._display_startSample) / (this.lineData._display_endSample - this.lineData._display_startSample)) * 1168) - (584 * (editorIconLine))
                const icon = this.element.lineDisplay.editorIcon
                icon.style.left = (x - 24) + "px"
                icon.style.top = 26 + (editorIconLine * 100) + "px"
            }
            this.element.lineDisplay.divider = createElement("div", this.element.lineDisplay, divider => {
                divider.style.position = "absolute"
                divider.style.left = "0px"
                divider.style.top = "99px"
                divider.style.width = "100%"
                divider.style.height = "2px"
                divider.style.backgroundColor = "white"
            })
            this.element.lineDisplay.line1 = createElement("div", this.element.lineDisplay, divider => {
                divider.style.position = "absolute"
                divider.style.left = "0px"
                divider.style.top = "0px"
                divider.style.width = "100%"
                divider.style.height = "100px"
            })
            this.element.lineDisplay.line2 = createElement("div", this.element.lineDisplay, divider => {
                divider.style.position = "absolute"
                divider.style.left = "0px"
                divider.style.top = "100px"
                divider.style.width = "100%"
                divider.style.height = "100px"
            })
            this.element.lineDisplay.line1.beatDisplay = createElement("div", this.element.lineDisplay.line1, divider => {
                divider.style.position = "absolute"
                divider.style.left = "0px"
                divider.style.top = "42px"
                divider.style.width = "100%"
                divider.style.height = "16px"
            })
            this.element.lineDisplay.line2.beatDisplay = createElement("div", this.element.lineDisplay.line2, divider => {
                divider.style.position = "absolute"
                divider.style.left = "0px"
                divider.style.top = "42px"
                divider.style.width = "100%"
                divider.style.height = "16px"
            })
            for (let i = 1; i < 3; i++) {
                const target = this.element.lineDisplay["line" + i].beatDisplay
                for (let offset = 0; offset < 4; offset++) {
                    createBeatElement("star", target, (0 + (offset * 128)) + 72, 0)
                    createBeatElement("beat", target, (16 + (offset * 128)) + 72, 0)
                    createBeatElement("beat", target, (32 + (offset * 128)) + 72, 0)
                    createBeatElement("beat", target, (48 + (offset * 128)) + 72, 0)
                    createBeatElement("beat2", target, (64 + (offset * 128)) + 72, 0)
                    createBeatElement("beat", target, (80 + (offset * 128)) + 72, 0)
                    createBeatElement("beat", target, (96 + (offset * 128)) + 72, 0)
                    createBeatElement("beat", target, (112 + (offset * 128)) + 72, 0)
                }
            }
            this.element.buttonArea = createElement("div", this.element, div => {
                div.style.position = "absolute"
                div.style.left = "0px"
                div.style.top = "256px"
                div.style.width = "100%"
                div.style.height = "100%"
            })
            this.currentLine = 1
            this.lastPossibleLine = SMEnums.SongLineInfo[songType].length
            let lineDisplay = null
            createDecoratedButton("<", this.element.buttonArea).onclick = () => {
                console.log("previous line")
                this.currentLine--
                if (this.currentLine < 1) this.currentLine = this.lastPossibleLine
                lineDisplay.innerHTML = "Line " + this.currentLine
                this.renderLineNotes(this.currentLine)
            }
            lineDisplay = createDecoratedButton("Line 1", this.element.buttonArea)
            createDecoratedButton(">", this.element.buttonArea).onclick = () => {
                console.log("next line")
                this.currentLine++
                if (this.currentLine > this.lastPossibleLine) this.currentLine = 1
                lineDisplay.innerHTML = "Line " + this.currentLine
                this.renderLineNotes(this.currentLine)
            }
            createNewLine(this.element.buttonArea)
            createNewLine(this.element.buttonArea)
            createDecoratedButton("Play BG Song", this.element.buttonArea).onclick = () => {
                this.audioPlayer.play()
            }
            createDecoratedButton("Stop BG Song", this.element.buttonArea).onclick = () => {
                this.audioPlayer.pause()
                if (this.menuSoundFunction) this.menuSoundFunction()
            }
            createDecoratedButton("Skip to Line position in Song", this.element.buttonArea).onclick = () => {
                this.audioPlayer.currentTime = SMEnums.SongLineInfo[songType][this.currentLine - 1].start / 44100
                this.renderLineNotes(this.currentLine)
            }
            createNewLine(this.element.buttonArea)
            createDecoratedButton("Set song speed", this.element.buttonArea).onclick = () => {
                const speed = prompt("Audio Speed Percentage?", this.audioPlayer.playbackRate * 100)
                this.audioPlayer.playbackRate = isNaN(speed) || speed == Infinity ? 1 : speed / 100
                if (this.menuSoundFunction) this.menuSoundFunction()
            }
            createNewLine(this.element.buttonArea)
            createNewLine(this.element.buttonArea)
            createDecoratedButton("0.01 Seconds", this.element.buttonArea)
            createDecoratedButton("<", this.element.buttonArea).onclick = () => { this.audioPlayer.currentTime -= 0.01; this.renderLineNotes(this.currentLine) }
            createDecoratedButton(">", this.element.buttonArea).onclick = () => { this.audioPlayer.currentTime += 0.01; this.renderLineNotes(this.currentLine) }
            createNewLine(this.element.buttonArea)
            createDecoratedButton("0.1 Seconds", this.element.buttonArea)
            createDecoratedButton("<", this.element.buttonArea).onclick = () => { this.audioPlayer.currentTime -= 0.1; this.renderLineNotes(this.currentLine) }
            createDecoratedButton(">", this.element.buttonArea).onclick = () => { this.audioPlayer.currentTime += 0.1; this.renderLineNotes(this.currentLine) }
            createNewLine(this.element.buttonArea)
            createDecoratedButton("1 Second", this.element.buttonArea)
            createDecoratedButton("<", this.element.buttonArea).onclick = () => { this.audioPlayer.currentTime -= 1; this.renderLineNotes(this.currentLine) }
            createDecoratedButton(">", this.element.buttonArea).onclick = () => { this.audioPlayer.currentTime += 1; this.renderLineNotes(this.currentLine) }
            createNewLine(this.element.buttonArea)
            createNewLine(this.element.buttonArea)
            createDecoratedButton("Clear Line", this.element.buttonArea).onclick = () => {
                if (confirm("Are you sure you want to clear this line?")) {
                    this.lineData.lines[this.currentLine - 1] = []
                    this.renderLineNotes(this.currentLine)
                    if (this.menuSoundFunction) this.menuSoundFunction()
                }
            }
            createNewLine(this.element.buttonArea)
            createNewLine(this.element.buttonArea)
            const deleteOriginalNotesFlag = createElement("input", this.element.buttonArea, button => {
                button.type = "checkbox"
                button.checked = this.deleteOriginalNotesFlag
            })
            createDecoratedButton("Delete notes in the Original song", this.element.buttonArea).onclick = () => {
                deleteOriginalNotesFlag.checked = !deleteOriginalNotesFlag.checked
                this.deleteOriginalNotesFlag = deleteOriginalNotesFlag.checked
            }
            createNewLine(this.element.buttonArea)
            createDecoratedButton("Export to .smc chart file", this.element.buttonArea).onclick = () => {
                if (this.menuSoundFunction) this.menuSoundFunction()
                this.deleteOriginalNotesFlag = deleteOriginalNotesFlag.checked
                const ChartObject = {
                    flags: ["interpretAsSampleTime"],
                    buttons: {
                        a: [],
                        b: [],
                        x: [],
                        y: [],
                        l: [],
                        r: [],
                        up: [],
                        down: [],
                        left: [],
                        right: [],
                        unknown: []
                    }
                }
                if (this.deleteOriginalNotesFlag) {
                    ChartObject.flags.push("deleteAllOriginalKeys")
                    ChartObject.flags.push("deleteAllPlayerKeys")
                }
                forEachArrayInArray(this.lineData.lines, button => {
                    const buttonArray = ChartObject.buttons[button.key]
                    buttonArray.push(button.time)
                })
                MelodiiParser.package(ChartObject).then(chartText => {
                    console.log("Exported chart!")
                    console.log(chartText)
                }).catch(err => {
                    if (this.errorFunction) this.errorFunction(err)
                })
            }
            this.audioPlayer.ontimeupdate = () => this.renderLineNotes(this.currentLine)
            window.onkeydown = (e) => {
                let targetNote = "unknown"
                switch (e.key) {
                    case 'q': targetNote = "l"; break;
                    case 'e': targetNote = "r"; break;
                    case 'w': targetNote = "y"; break;
                    case 'a': targetNote = "x"; break;
                    case 's': targetNote = "a"; break;
                    case 'd': targetNote = "b"; break;
                    case 'ArrowUp': targetNote = "up"; break;
                    case 'ArrowDown': targetNote = "down"; break;
                    case 'ArrowLeft': targetNote = "left"; break;
                    case 'ArrowRight': targetNote = "right"; break;
                }
                if (targetNote == "unknown") return
                if (this.menuSoundFunction) this.menuSoundFunction()
                this.renderLineNotes(this.currentLine)
                this.lineData.lines[this.currentLine - 1].push({ key: targetNote, time: this.audioPlayer.currentTime * 44100 })
                this.renderLineNotes(this.currentLine)
            }
        }).catch((err) => {
            throw new Error("Song Editor cannot use an unpackagable chart.\n" + err)
        })
    }
}
window.SongEditor = SongEditor