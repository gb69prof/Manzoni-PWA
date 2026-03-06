(() => {
  const drawer = document.querySelector('[data-drawer]');
  const overlay = document.querySelector('[data-overlay]');
  const toggles = document.querySelectorAll('[data-menu-toggle]');
  const closeDrawer = () => {
    drawer?.classList.remove('open');
    overlay?.classList.remove('show');
    document.body.style.overflow = '';
  };
  const openDrawer = () => {
    drawer?.classList.add('open');
    overlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
  };
  toggles.forEach(btn => btn.addEventListener('click', () => drawer?.classList.contains('open') ? closeDrawer() : openDrawer()));
  overlay?.addEventListener('click', closeDrawer);
  document.querySelectorAll('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
})();
