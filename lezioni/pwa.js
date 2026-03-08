
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.register('./service-worker.js').then(reg => {
    function showUpdate(worker) {
      const banner = document.getElementById('update-banner');
      if (!banner) return;
      banner.style.display = 'block';
      const btn = document.getElementById('reload-app');
      if (btn) {
        btn.onclick = () => worker.postMessage({ type: 'SKIP_WAITING' });
      }
    }

    if (reg.waiting) showUpdate(reg.waiting);

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdate(newWorker);
        }
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }).catch(err => console.error('SW registration failed', err));
}
