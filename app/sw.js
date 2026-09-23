/* Keeps the app shell on the device so it opens instantly and keeps working
   with no signal. There is no backend, so everything the app needs is here.  */
const CACHE = 'backgear-app-v4';
const SHELL = [
  '/app/', '/app/index.html', '/app/manifest.webmanifest',
  '/css/base.css', '/css/app.css', '/css/app-theme.css',
  '/js/config.js', '/js/data/seed.js', '/js/data/store.js',
  '/js/app/main.js', '/js/app/ui.js', '/js/app/install.js',
  '/js/app/views/students.js', '/js/app/views/attendance.js',
  '/js/app/views/fees.js', '/js/app/views/schedule.js', '/js/app/views/more.js',
  '/js/app/views/trainer.js', '/js/app/views/admin-home.js',
  '/js/data/permissions.js',
  '/assets/app-icon-maskable-512.png', '/assets/icons.svg', '/assets/app-icon-192.png', '/assets/app-icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // Activate only when every required offline asset has been saved.
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('backgear-app-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network first so edits show up straight away, falling back to the cache
   when the device is offline. */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}));
        }
        return res;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(e.request);
        if (hit) return hit;
        if (e.request.mode === 'navigate') return (await cache.match('/app/index.html')) || Response.error();
        return Response.error();
      })
  );
});
