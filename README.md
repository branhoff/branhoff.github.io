# Brandon Hoffman - Portfolio Website

A responsive portfolio website showcasing software engineering projects and blog posts, featuring retro gaming console themes.

## Features

- **Gaming Console Themes**: Switch between Default, NES, SNES, and N64 themes
- **Dynamic Blog System**: JSON-driven blog with automatic post loading
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Theme Persistence**: Your theme choice is remembered between visits
- **Project Showcase**: Highlighting Python courses and development projects

## Local Development

### Prerequisites

- Docker installed on your machine
- Access to personal Docker image `dev-base:latest`
- Git for version control

### Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd branhoff.github.io
   ```

2. **Start the development environment**

   ```bash
   # Make the script executable (first time only)
   chmod +x run-dev.sh

   # Start the development container
   ./run-dev.sh
   ```

3. **Access your site**
   - **Basic server**: <http://localhost:8000>
   - **Live-reload server**: <http://localhost:8080> (recommended for development)

4. **Start development server with auto-refresh**

   ```bash
   # Open a shell in the container
   docker exec -it branhoff-web-dev /bin/zsh

   # Start live-server for auto-refresh
   webdev live
   ```

5. **Make changes**
   - Edit files in your local directory
   - Changes automatically sync to the container
   - Browser refreshes automatically when using live-server

6. **Stop development environment**

   ```bash
   ./stop-dev.sh
   ```

### Development Commands

Inside the container, you can use these helpful commands:

```bash
webdev serve    # Start basic HTTP server on port 8000
webdev live     # Start live-server with auto-refresh on port 8080
webdev format   # Format HTML/CSS/JS files with Prettier
webdev validate # Validate JSON files (like blog-posts.json)
```

## References

fonts.google.com  
cssmatic.com/box-shadow  
css-tricks.com/snippets/css/a-guide-to-flexbox  
<https://www.ginifab.com/feeds/pms/color_picker_from_image.php>
<https://codepen.io/sosuke/pen/Pjoqqp>  
<https://thenounproject.com/browse/collection-icon/video-games-10232/?p=1>

## Adding Content

### Adding a New Blog Post

1. **Create the blog post HTML file**

   ```bash
   # Create in posts/ directory
   touch posts/my-new-post.html
   ```

2. **Add metadata to blog-posts.json**

   ```json
   {
     "id": "my-new-post",
     "title": "My New Post Title",
     "date": "2025-07-29",
     "tags": ["Technology", "DevOps"],
     "excerpt": "Brief description of the post...",
     "file": "posts/my-new-post.html"
   }
   ```

3. **The post will automatically appear** on both the homepage and blog listing page

## Steps to add new theme color

Create a theme color css file in the `themes` directory. See an existing example like `snes.css`. As an example let's call our new theme `new_theme.css`.

Note that in order to set a new icon color for the theme you need set the filter attribute for the img tag id `theme-icon`. To get a hex equivalent filter attribute utilize the website <https://codepen.io/sosuke/pen/Pjoqqp>

For testing purposes, let's add the html command `<link id="theme-style" rel="stylesheet" type="text/css" href="new_theme.css">` below our java script call so we can see our theme color choices without having to make additional changes to the code base.

```html
...
    <script type="text/javascript" src="scripts/setThemeForGivenDotClick.js"></script>
    <script type="text/javascript" src="scripts/setHoverOnDotEffects.js"></script>
    <link id="theme-style" rel="stylesheet" type="text/css" href="themes/new_theme.css">
</body>
</html>

```

Once we've set the `:root` variables to configure our `new_theme.css` as we'd like let's make the necessary changes so our theme can be selected on the running `index.html` page.

First let's delete the `<link id="theme-style" rel="stylesheet" type="text/css" href="new_theme.css">` so we can confirm our next few changes will take effect.

Now in our `theme-options-wrapper` div, let's add a new `theme-dot` reference that we can reference in our `themes/default.css` and `scripts` files. It would look something like this:

```html
<div id="theme-options-wrapper">
 <div data-mode="light" data-text="Default" data-icon="images/Switch_icon.svg" id="light-mode" class="theme-dot"></div>
    <div data-mode="nes" data-text="NES" data-icon="images/NES_icon.svg" id="nes-mode" class="theme-dot"></div>
    <div data-mode="snes" data-text="SNES" data-icon="images/SNES_icon.svg" id="snes-mode" class="theme-dot"></div>
    <div data-mode="new_theme" data-text="New theme" data-icon="images/NewTheme_icon.svg" id="new_theme-mode" class="theme-dot"></div>
```

*Our `data-mode`, `data-text`, and `data-icon` parameters are used by the `setThemeForGivenDotClick.js` and `setHoverOnDotEffects.js` in our scripts directory to set the theme and displayed theme text and icon name respectively.

Then in our `themes/default.css` let's add an implementation for what the `new_theme-mode` color should be:

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

At this point we should see that this new button under the "Personalize theme" heading has been added, but it won't change anything when selected. To do that, we need to update the `setThemeForGivenDotClick.js`.

Let's add a conditional to the `setThemeForGivenDotClick` for our `new_theme` to be initialized when the corresponding button is selected:

```javascript
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

    if (mode == "new_theme") {
        document.getElementById("theme-style").href = "themes/new_theme.css"
        document.getElementById("theme-icon").src = "images/NewTheme_icon.svg"
    }

    localStorage.setItem("theme", mode)
}
```

## TODO

- Update color on dividing line between More about me and Top Expertise
- Add Find me on background picture
- Consider combining the data-mode and data-text attributes into one to simplify `setThemeForGivenDotClick` and `setHoverOnDotEffects` modules
- Consider refactoring `setThemeForGivenDotClick.js` to have fewer conditionals and simplify structure
