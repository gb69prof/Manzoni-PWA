
const toggle = document.querySelector('.menu-toggle');
const drawer = document.querySelector('#drawer');
const backdrop = document.querySelector('.drawer-backdrop');
if (toggle && drawer && backdrop) {
  const setOpen = (open) => {
    drawer.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
  backdrop.addEventListener('click', () => setOpen(false));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
}
