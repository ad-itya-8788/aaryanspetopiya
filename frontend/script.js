const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    nav.style.width = '100%';
    nav.style.order = '3';
    nav.style.justifyContent = 'center';
    nav.style.flexWrap = 'wrap';
    nav.style.padding = '12px 16px';
  });
}
