const dots = document.querySelectorAll('.theme-dot');
const themeText = document.getElementById('theme-text');
const themeIcon = document.getElementById('theme-icon');

var currentTheme = localStorage.getItem('theme');

// Find the current theme dot
var currentThemeDot = Array.from(dots).find(dot => dot.getAttribute('data-mode') === currentTheme);

if (currentThemeDot) {
  // Set the text of the theme text element to the current theme text
  themeText.innerHTML = currentThemeDot.getAttribute('data-text');
}

dots.forEach(dot => {
    dot.addEventListener('mouseenter', () => {
        const text = dot.getAttribute('data-text');
        themeText.innerHTML = text;
        const icon = dot.getAttribute('data-icon');
        themeIcon.src = icon;
    });
    
    dot.addEventListener('mouseleave', () => {
        // Only reset the text if it is not already the text of the hovered dot
        currentTheme = localStorage.getItem('theme');
        currentThemeDot = Array.from(dots).find(dot => dot.getAttribute('data-mode') === currentTheme);
        themeText.innerHTML = currentThemeDot.getAttribute('data-text');
        themeIcon.src = currentThemeDot.getAttribute('data-icon');
    });
});
