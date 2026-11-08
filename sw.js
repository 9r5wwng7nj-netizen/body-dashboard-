// Body Dashboard shell only. Bump GENERATION whenever shell HTML/CSS/assets change.
// No skipWaiting: an update waits until all controlled Body pages close. Logging is never reloaded.
const GENERATION = 'beta-89214bab54d4';
const SCOPE = new URL('./', self.location).href, INDEX = SCOPE + 'index.html';
const PREFIX = 'bd-shell-' + encodeURIComponent(new URL(SCOPE).pathname) + '-';
const CACHE = PREFIX + GENERATION;
const SHELL = [
  './index.html', './assets/app.css', './manifest.webmanifest',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/apple-touch-icon.png',
  './vendor/lucide/lucide-1.55.0.min.js', './vendor/sheetjs/xlsx-0.20.3.full.min.js',
  './vendor/zxing/zxing-library-0.23.0.min.js', './assets/icons/icon.svg',
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(url => new Request(new URL(url, SCOPE), { cache: 'reload' })))));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'BD_OFFLINE_STATUS') event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const ready = (await Promise.all(SHELL.map(url => cache.match(new URL(url, SCOPE))))).every(Boolean);
    event.ports[0]?.postMessage({ ready, generation: GENERATION });
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || !url.href.startsWith(SCOPE)) return;
  const page = url.origin + url.pathname;
  const key = page === SCOPE || page === INDEX ? INDEX : page;
  if (key !== INDEX && !SHELL.some(item => new URL(item, SCOPE).href === key) && !url.pathname.startsWith(new URL('assets/whatsnew/', SCOPE).pathname)) return;
  event.respondWith((async () => {
    // A generation never reads assets from another generation's cache.
    const cache = await caches.open(CACHE), saved = await cache.match(key);
    if (saved) return saved;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await cache.put(key, response.clone());
    return response;
  })());
});
