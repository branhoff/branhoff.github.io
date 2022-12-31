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
    }

    if (mode == "snes") {
        document.getElementById("theme-style").href = "themes/snes.css"
    }

    if (mode == "n64") {
        document.getElementById("theme-style").href = "themes/n64.css"
    }

    localStorage.setItem("theme", mode)
}