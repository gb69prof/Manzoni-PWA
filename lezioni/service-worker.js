
const CACHE_NAME = 'manzoni-pwa-v2';
const APP_SHELL = [
  "index.html",
  "vita.html",
  "conversione.html",
  "provvidenza.html",
  "prima-fase.html",
  "giansenismo.html",
  "opere-prima-fase.html",
  "tragedie.html",
  "coro.html",
  "cinque-maggio.html",
  "seconda-fase.html",
  "promessi-sposi.html",
  "poetica-sposi.html",
  "provvida-sventura.html",
  "capitoli.html",
  "cap1.html",
  "cap4.html",
  "cap9.html",
  "cap10.html",
  "innominato.html",
  "conclusione.html",
  "schemi.html",
  "video.html",
  "test.html",
  "app.css",
  "app.js",
  "pwa.js",
  "manifest.json",
  "service-worker.js",
  "offline.html",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "assets/Cinque-maggio.PNG",
  "assets/Conversione.PNG",
  "assets/Giansenismo-cattolicesimo.PNG",
  "assets/Manzoni-copertina.PNG",
  "assets/Manzoni-giansenismo.PNG",
  "assets/Promessi-sposi-trama.PNG",
  "assets/Provvida-sventura.PNG",
  "assets/Provvidenza-primo-momento.PNG",
  "assets/Provvidenza-secondo-momento.PNG",
  "assets/Tragedia-manzoniana.PNG",
  "assets/Vero-utile-interessante-promessi sposi.PNG"
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./offline.html')))
    );
    return;
  }

  const isAsset = ['image','font','style','script'].includes(req.destination) ||
    /\.(png|jpg|jpeg|webp|svg|gif|glb|gltf|pdf|woff2?|css|js)$/i.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match('./offline.html')))
    );
  }
});
