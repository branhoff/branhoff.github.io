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
    // Find the theme dot for this mode and read its icon path
    const themeDot = document.querySelector(`[data-mode="${mode}"]`);
    
    if (!themeDot) {
        console.error(`Theme dot not found for mode: ${mode}`);
        return;
    }
    
    // Get the icon path from the HTML data attribute
    const iconPath = themeDot.getAttribute('data-icon');
    
    // Derive the base path from the icon path
    // "../images/NES_icon.svg" → "../"
    // "images/NES_icon.svg" → ""
    const basePath = iconPath.includes('../') ? '../' : '';
    
    // Set theme CSS
    if (mode == "light") {
        document.getElementById("theme-style").href = basePath + "themes/default.css"
    }
    else if (mode == "nes") {
        document.getElementById("theme-style").href = basePath + "themes/nes.css"
    }
    else if (mode == "snes") {
        document.getElementById("theme-style").href = basePath + "themes/snes.css"
    }
    else if (mode == "n64") {
        document.getElementById("theme-style").href = basePath + "themes/n64.css"
    }
    
    // Set theme icon (use the exact path from HTML)
    const themeIcon = document.getElementById("theme-icon");
    if (themeIcon && iconPath) {
        themeIcon.src = iconPath;
    }

    localStorage.setItem("theme", mode)
}