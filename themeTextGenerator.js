const dots = document.querySelectorAll('.theme-dot');
const themeText = document.getElementById('theme-text');

const currentTheme = localStorage.getItem('currentTheme');

// Find the current theme dot
const currentThemeDot = Array.from(dots).find(dot => dot.getAttribute('data-mode') === currentTheme);

if (currentThemeDot) {
  // Set the text of the theme text element to the current theme text
  themeText.innerHTML = currentThemeDot.getAttribute('data-text');
}

dots.forEach(dot => {
    dot.addEventListener('mouseenter', () => {
        const text = dot.getAttribute('data-text');
        themeText.innerHTML = text;
    });
    
    dot.addEventListener('mouseleave', () => {
        // Only reset the text if it is not already the text of the hovered dot
        if (themeText.innerHTML !== dot.getAttribute('data-text')) {
          themeText.innerHTML = currentThemeDot.getAttribute('data-text');
        }
    });
});
