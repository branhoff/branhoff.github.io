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
    // Get the path prefix from any theme dot's data-icon attribute
    // If we're in posts/, it will be "../images/..." so prefix is "../"
    // If we're in root, it will be "images/..." so prefix is ""
    const anyThemeDot = document.querySelector('.theme-dot[data-icon]');
    const sampleIconPath = anyThemeDot ? anyThemeDot.getAttribute('data-icon') : 'images/';
    const pathPrefix = sampleIconPath.includes('../') ? '../' : '';
    
    if (mode == "light") {
        document.getElementById("theme-style").href = pathPrefix + "themes/default.css"
    }

    if (mode == "nes") {
        document.getElementById("theme-style").href = pathPrefix + "themes/nes.css"
        const themeIcon = document.getElementById("theme-icon");
        if (themeIcon) {
            themeIcon.src = pathPrefix + "images/NES_icon.svg";
        }
    }

    if (mode == "snes") {
        document.getElementById("theme-style").href = pathPrefix + "themes/snes.css"
        const themeIcon = document.getElementById("theme-icon");
        if (themeIcon) {
            themeIcon.src = pathPrefix + "images/SNES_icon.svg";
        }
    }

    if (mode == "n64") {
        document.getElementById("theme-style").href = pathPrefix + "themes/n64.css"
        const themeIcon = document.getElementById("theme-icon");
        if (themeIcon) {
            themeIcon.src = pathPrefix + "images/N64_icon.svg";
        }
    }

    localStorage.setItem("theme", mode)
}