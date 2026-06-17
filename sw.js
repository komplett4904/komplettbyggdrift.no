// Komplett Byggdrift Service Worker
const CACHE_NAME = 'kb-v1';
const ASSETS = [
  '/anbudskalkulator.html',
  '/kalender.html',
  '/hms.html',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Bare GET-requester
  if (e.request.method !== 'GET') return;
  // La Supabase, Google Calendar, CDN-er gå rett til nett
  const url = new URL(e.request.url);
  if (!url.hostname.includes('komplettbyggdrift.no') &&
      url.hostname !== self.location.hostname) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
