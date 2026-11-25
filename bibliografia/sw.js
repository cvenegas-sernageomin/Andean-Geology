/* Service worker: instalacion liviana (solo la cascara); los articulos se cachean al usarlos.
   Origen compartido en github.io: solo borra caches con su propio prefijo. */
const PREFIJO = 'biblio-georref-';
const VERSION = PREFIJO + 'v1';
const CASCARA = ['./', 'index.html', 'app.js', 'manifest.json', 'assets/icono.svg', 'assets/icono-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CASCARA)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k.startsWith(PREFIJO) && k !== VERSION).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const propio = url.origin === location.origin;
  /* datos y cascara: red primero (siempre lo ultimo publicado), cache si no hay conexion */
  if (propio) {
    e.respondWith(fetch(e.request, {cache:'no-cache'}).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch:true})));
    return;
  }
  /* librerias del CDN: cache primero */
  if (url.hostname === 'unpkg.com') {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); return r;
    })));
  }
});
