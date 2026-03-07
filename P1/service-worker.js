
const CACHE = 'manzoni-pwa-v1.0.0';
const PRECACHE = [
  './',
  './index.html',
  './conversione.html',
  './primo-momento.html',
  './secondo-momento.html',
  './promessi-sposi.html',
  './capitolo-1.html',
  './fra-cristoforo.html',
  './gertrude-innominato.html',
  './renzo-lazzaretto.html',
  './offline.html',
  './manifest.json',
  './pwa.js',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/icons/icon-180.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/docs/lezione-su-Manzoni.pdf',
  './assets/img/pages/page-01.webp',
  './assets/img/pages/page-03.webp',
  './assets/img/pages/page-04.webp',
  './assets/img/pages/page-06.webp',
  './assets/img/pages/page-10.webp',
  './assets/img/pages/page-11.webp',
  './assets/img/pages/page-14.webp',
  './assets/img/pages/page-15.webp',
  './assets/img/pages/page-18.webp',
  './assets/img/pages/page-22.webp',
  './assets/img/pages/page-24.webp',
  './assets/img/pages/page-25.webp'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || networkPromise;
};
const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    if (request.mode === 'navigate') return caches.match('./offline.html');
    throw new Error('Network error');
  }
};
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(request);
        return cached || caches.match('./offline.html');
      }
    })());
    return;
  }
  if (/(png|jpg|jpeg|webp|gif|svg|pdf|woff2?|ttf|otf|glb|gltf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (/(css|js)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
