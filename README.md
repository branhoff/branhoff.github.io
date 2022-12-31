
## References:
fonts.google.com  
cssmatic.com/box-shadow  
css-tricks.com/snippets/css/a-guide-to-flexbox  
https://www.ginifab.com/feeds/pms/color_picker_from_image.php

## Steps to add new theme color
Create a theme color css file. See existing example like `snes.css`. As an example let's call our new theme `new_theme.css`.

For testing purposes let's add the html command `<link id="theme-style" rel="stylesheet" type="text/css" href="new_theme.css">` below our java script call so we can see our theme color choices without having to make additional changes to the code base.

```html
...
    <script type="text/javascript" src="script.js"></script>
    <link id="theme-style" rel="stylesheet" type="text/css" href="new_theme.css">
</body>
</html>

```

Once we've set the `:root` variables to configure our `new_theme.css` as we'd like let's make the necessary changes so our theme can be selected on the running `index.html` page.

First let's delete the `<link id="theme-style" rel="stylesheet" type="text/css" href="new_theme.css">` so we can confirm our next few changes will take effect.

Now in our `theme-options-wrapper` div, let's add new `theme-dot` reference we can utilize in our `default.css` and `script.js` files. It would look something like this:

```html
<div id="theme-options-wrapper">
	<div data-mode="light" data-text="Default" id="light-mode" class="theme-dot"></div>
    <div data-mode="nes" data-text="NES" id="nes-mode" class="theme-dot"></div>
    <div data-mode="snes" data-text="SNES" id="snes-mode" class="theme-dot"></div>
    <div data-mode="new_theme" data-text="New theme" id="new_theme-mode" class="theme-dot"></div>
```
*Our `data-mode` and `data-text` parameters are used by the `script.js` and `themeTextGenerator.js` to set the theme and displayed theme text name respectively.

Then in our `default.css` let's add an implementation for what the `new_theme-mode` color should be:

```css
#light-mode {
    background-color: #fff;
}

#nes-mode {
    background-color: #d9d9d9;
}

#snes-mode {
    background-color: #604baf;
}

#new_theme-mode {
    background-color: #db0714;
}
```

At this point we should see that this new button under the "Personalize theme" heading has been added, but it won't change anything when selected. To do that, we need to update the `script.js`.

Let's add to our script a conditional for our `new_theme` to be initialized when the corresponding button is selected:

```javascript
function setTheme(mode) {
    if (mode == "light") {
        document.getElementById("theme-style").href = "default.css"
    }

    if (mode == "nes") {
        document.getElementById("theme-style").href = "nes.css"
    }

    if (mode == "snes") {
        document.getElementById("theme-style").href = "snes.css"
    }

    if (mode == "new_theme") {
        document.getElementById("theme-style").href = "new_theme.css"
    }

    localStorage.setItem("theme", mode)
}
```

## TODO
- Update variable references so that text displayed on different color backgrounds can be changed appropriately
- Add variables for controlling headers and regular text colors
- Update color on dividing line between More about me and Top Expertise
- Change Top Expertise title to Top expertise
- Change Personalize Theme to Personalize theme
- Add variable for theme buttons border color
- Add appropriate thumbnails or project page
- Add Find me on background picture
- Consider combining the data-mode and data-text attributes into one to simplify script and themeTextGenerator codebase
- Consider refactoring script.js to have fewer conditionals and simplify structure
