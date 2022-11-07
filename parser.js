function warn(warning) {
    console.warn(warning)
}
class MelodiiParser {
    static parse(content) {
        return new Promise((resolve, reject) => {
            let readingButtons = false
            let readingFlags = false
            const selectedFlags = []
            const selectedButtons = {
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
            let currentButtonGroup = "unknown"
            const _sca_ = String(content).replace(/\r/gmi, "").split("\n")
            for (let i = 0; i < _sca_.length; i++) {
                const dirtyChartCode = _sca_[i]
                const cleanChartCode = dirtyChartCode.replace(/[\t ]*/gmi, "")
                if (cleanChartCode.startsWith("#")) {
                    continue
                }
                if (cleanChartCode == "end;") {
                    readingButtons = false
                    readingFlags = false
                }
                if (readingFlags) {
                    selectedFlags.push(cleanChartCode)
                }
                if (cleanChartCode == "Flags:") {
                    readingButtons = false
                    readingFlags = true
                }
                if (readingButtons) {
                    if (isNaN(Number(cleanChartCode)) || Number(cleanChartCode) < 0 || Number(cleanChartCode) == Infinity) return reject("Sample Time or Seconds must be a number that is 0 or above and below Infinity.")
                    let sampleTime = 0
                    sampleTime = Number(cleanChartCode) * 44100
                    if (selectedFlags.includes("interpretAsSampleTime")) {
                        sampleTime = Number(cleanChartCode)
                    }
                    selectedButtons[currentButtonGroup].push(sampleTime)
                }
                if (!readingButtons) {
                    readingButtons = true
                    currentButtonGroup = ((((cleanChartCode.replace("Button", "")).replace("Scratch", "")).replace(":", "")).toLowerCase())
                    if (["a", "b", "x", "y", "l", "r", "up", "down", "left", "right"].includes(currentButtonGroup) == false) {
                        readingButtons = false
                        currentButtonGroup = ""
                    }
                }
            }
            resolve({ flags: selectedFlags, buttons: selectedButtons })
        })
    }
    static package(object) {
        return new Promise((resolve, reject) => {
            const chartTextLines = []
            if (typeof object != "object") return reject("You must package an Object.")
            if (object.flags == null) return reject("Flags do not exist. To have no flags, send an empty array.")
            if (object.buttons == null) return reject("Buttons do not exist. To have no buttons, send an empty array for each button group.")
            if (object.buttons.a == null) return reject("Button group A does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.b == null) return reject("Button group B does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.x == null) return reject("Button group X does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.y == null) return reject("Button group Y does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.l == null) return reject("Button group L does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.r == null) return reject("Button group R does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.up == null) return reject("Button group Up does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.down == null) return reject("Button group Down does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.left == null) return reject("Button group Left does not exist. To have no buttons in this group, send an empty array.")
            if (object.buttons.right == null) return reject("Button group Right does not exist. To have no buttons in this group, send an empty array.")
            chartTextLines.push("Flags:")
            for (let i = 0; i < object.flags.length; i++) {
                chartTextLines.push("\t" + object.flags[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ButtonA:")
            for (let i = 0; i < object.buttons.a.length; i++) {
                chartTextLines.push("\t" + object.buttons.a[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ButtonB:")
            for (let i = 0; i < object.buttons.b.length; i++) {
                chartTextLines.push("\t" + object.buttons.b[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ButtonX:")
            for (let i = 0; i < object.buttons.x.length; i++) {
                chartTextLines.push("\t" + object.buttons.x[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ButtonY:")
            for (let i = 0; i < object.buttons.y.length; i++) {
                chartTextLines.push("\t" + object.buttons.y[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ButtonL:")
            for (let i = 0; i < object.buttons.l.length; i++) {
                chartTextLines.push("\t" + object.buttons.l[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ButtonR:")
            for (let i = 0; i < object.buttons.r.length; i++) {
                chartTextLines.push("\t" + object.buttons.r[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ScratchUp:")
            for (let i = 0; i < object.buttons.up.length; i++) {
                chartTextLines.push("\t" + object.buttons.up[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ScratchDown:")
            for (let i = 0; i < object.buttons.down.length; i++) {
                chartTextLines.push("\t" + object.buttons.down[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ScratchLeft:")
            for (let i = 0; i < object.buttons.left.length; i++) {
                chartTextLines.push("\t" + object.buttons.left[i])
            }
            chartTextLines.push("end;")
            chartTextLines.push("ScratchRight:")
            for (let i = 0; i < object.buttons.right.length; i++) {
                chartTextLines.push("\t" + object.buttons.right[i])
            }
            chartTextLines.push("end;")
            resolve(chartTextLines.join("\n"))
        })
    }
}
window.MelodiiParser = MelodiiParser