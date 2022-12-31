const dots = document.querySelectorAll('.theme-dot');
const themeText = document.getElementById('theme-text');

dots.forEach(dot => {
  dot.addEventListener('mouseenter', () => {
    themeText.innerHTML = 'new text';
  });
  dot.addEventListener('mouseleave', () => {
    themeText.innerHTML = '';
  });
});
