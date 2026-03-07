
(() => {
  if (!('serviceWorker' in navigator)) return;
  let refreshing = false;
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./service-worker.js');
      const toast = document.getElementById('update-toast');
      const reloadBtn = document.getElementById('reload-app');

      const showUpdate = () => {
        if (!toast) return;
        toast.hidden = false;
        if (reloadBtn) {
          reloadBtn.onclick = () => {
            if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          };
        }
      };

      if (reg.waiting) showUpdate();

      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdate();
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch (err) {
      console.warn('SW registration failed', err);
    }
  });
})();
