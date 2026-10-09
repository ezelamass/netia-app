// Service worker de NETIA: instalable + abre sin conexión. No toca llamadas a Supabase ni a APIs.
const VERSION = 'netia-v1';
const SHELL = 'netia-shell-' + VERSION;
const ASSETS = 'netia-assets-' + VERSION;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/icon-192.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL, ASSETS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Supabase, fuentes, etc.: directo a la red

  // Navegación: red primero; sin conexión, el shell de la app.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(SHELL).then((c) => c.put('/', copy));
        return res;
      }).catch(() => caches.match('/')),
    );
    return;
  }

  // Assets con hash (/assets/*), íconos e imágenes: caché primero.
  if (url.pathname.startsWith('/assets/') || /\.(png|webp|jpg|jpeg|svg|ico|woff2?|ttf)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(ASSETS).then((c) => c.put(req, copy)); }
        return res;
      })),
    );
  }
});
