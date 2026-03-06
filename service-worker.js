const CACHE_VERSION = 'manzoni-pwa-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = './offline.html';

const PRECACHE_URLS = [
  './',
  './index.html',
  './conversione.html',
  './opere.html',
  './provvidenza.html',
  './promessi-sposi.html',
  './personaggi.html',
  './capitoli.html',
  './offline.html',
  './manifest.json',
  './pwa.js',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/img/copertina-manzoni.png',
  './assets/img/conversione-religiosa.png',
  './assets/img/opere-riferimento.png',
  './assets/img/secondo-momento.png',
  './assets/img/promessi-sposi-schema.png',
  './assets/img/personaggi-schema.png',
  './assets/img/capitolo-primo-schema.png',
  './assets/img/fra-cristoforo-schema.png',
  './assets/img/gertrude-schema.png',
  './assets/icons/icon-180.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/docs/lezione%20su%20Manzoni.pdf'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response && response.status === 200) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || networkPromise;
}

async function networkFirstPage(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await caches.match(OFFLINE_URL));
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (['style', 'script', 'worker', 'font', 'image'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (/\.(?:png|jpg|jpeg|webp|gif|svg|pdf|glb|gltf|bin|mp4|webm|woff2?)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
