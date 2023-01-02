console.log("It's working")

let theme = localStorage.getItem("theme")

if(theme == null) {
    setTheme("light")
}
else {
    setTheme(theme)
}

let themeDots = document.getElementsByClassName('theme-dot')

for(var i = 0; themeDots.length > i; i++) {
    themeDots[i].addEventListener("click", function(){
        let mode = this.dataset.mode
        console.log("Option clicked:", mode)
        setTheme(mode)
    }) 
}

function setTheme(mode) {
    if (mode == "light") {
        document.getElementById("theme-style").href = "themes/default.css"
    }

    if (mode == "nes") {
        document.getElementById("theme-style").href = "themes/nes.css"
        document.getElementById("theme-icon").src = "images/NES_icon.svg"
    }

    if (mode == "snes") {
        document.getElementById("theme-style").href = "themes/snes.css"
        document.getElementById("theme-icon").src = "images/SNES_icon.svg"
    }

    if (mode == "n64") {
        document.getElementById("theme-style").href = "themes/n64.css"
        document.getElementById("theme-icon").src = "images/N64_icon.svg"
    }

    localStorage.setItem("theme", mode)
}