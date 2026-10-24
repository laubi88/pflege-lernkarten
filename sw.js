/* Offline-Speicher: App-Dateien vorab, Valentino-Aufnahmen beim ersten Abspielen. */
const VERSION = 'lk-v4';
const KERN = ['./', './index.html', './karten.js', './vokabeln.js', './hoerbuch.js', './termine.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(KERN))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSION).map(n => caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('.mp3')) {
    e.respondWith(caches.open(VERSION).then(async c => {
      const treffer = await c.match(e.request);
      if (treffer) return treffer;
      const antwort = await fetch(e.request);
      if (antwort.ok) c.put(e.request, antwort.clone());
      return antwort;
    }));
    return;
  }
  e.respondWith(fetch(e.request).then(a => { const k = a.clone(); caches.open(VERSION).then(c => c.put(e.request, k)); return a; })
    .catch(() => caches.match(e.request)));
});
