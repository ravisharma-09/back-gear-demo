/* Keeps the app shell on the device so it opens instantly and keeps working
   with no signal. There is no backend, so everything the app needs is here.  */
const CACHE = 'backgear-app-v1';
const SHELL = [
  '/app/', '/app/index.html', '/app/manifest.webmanifest',
  '/css/base.css', '/css/app.css',
  '/js/config.js', '/js/data/seed.js', '/js/data/store.js',
  '/js/app/main.js', '/js/app/ui.js', '/js/app/install.js',
  '/js/app/views/dashboard.js', '/js/app/views/students.js', '/js/app/views/attendance.js',
  '/js/app/views/fees.js', '/js/app/views/lessons.js', '/js/app/views/more.js',
  '/assets/icons.svg', '/assets/app-icon-192.png', '/assets/app-icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // one bad path should not sink the whole install
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
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
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match('/app/index.html')))
  );
});
