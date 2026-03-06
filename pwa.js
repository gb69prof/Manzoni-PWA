(() => {
  if (!('serviceWorker' in navigator)) return;
  const banner = document.getElementById('update-banner');
  const reloadBtn = document.getElementById('reload-app');
  let waitingWorker = null;

  const showBanner = () => banner?.classList.add('show');

  window.addEventListener('load', async () => {
    try {
      const swUrl = new URL('./service-worker.js', window.location.href).toString();
      const registration = await navigator.serviceWorker.register(swUrl, { scope: './' });

      const promptUpdate = () => {
        if (registration.waiting) {
          waitingWorker = registration.waiting;
          showBanner();
        }
      };

      if (registration.waiting) promptUpdate();

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorker = newWorker;
            showBanner();
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      reloadBtn?.addEventListener('click', () => {
        waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
      });

      setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    } catch (error) {
      console.warn('Service worker non registrato:', error);
    }
  });
})();
