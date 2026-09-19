// Cache only this application's public static files.
const CACHE_NAME = 'kb-static-v2';
const ASSETS = [
  "/anbudskalkulator.html",
  "/hms.html",
  "/kalender.html",
  "/kb-database.js",
  "/anbudskalkulator-1.js",
  "/anbudskalkulator-2.js",
  "/anbudskalkulator-1.css",
  "/anbudskalkulator-2.css",
  "/anbudskalkulator-3.css",
  "/anbudskalkulator-4.css",
  "/hms-1.js",
  "/hms-1.css",
  "/kalender-1.js",
  "/kalender-1.css",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json"
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME && (key === 'kb-v1' || key.startsWith('kb-static-'))).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(event.request.method !== 'GET' || url.origin !== self.location.origin || !ASSETS.includes(url.pathname)) return;
  event.respondWith(fetch(event.request).catch(async () =>
    (await caches.match(event.request)) || new Response('Ingen nettforbindelse. Koble til nett og prøv igjen.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})
  ));
});
