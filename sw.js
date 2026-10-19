/* Visit My Jaipur – offline support (v2, multi-page).
   Change VERSION whenever you upload changed files so visitors get the update. */
const VERSION = 'vmj-v2-2026-10-17b';
const CORE = ["./", "./index.html", "./news.html", "./heritage.html", "./visit.html", "./plan.html", "./tools.html", "./map.html", "./food.html", "./festivals.html", "./travel.html", "./help.html", "./guide.html", "./about.html", "./collab.html", "./contact.html", "./privacy.html", "./404.html", "./assets/css/style.css", "./assets/js/app.js", "./assets/img/sprite.svg", "./assets/img/logo.png", "./assets/search.json", "./manifest.webmanifest", "./favicon.ico", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./og-image.jpg"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // live data (weather, air quality, news sheet, analytics) and map tiles: always from the network
  if (/open-meteo\.com$|basemaps\.cartocdn\.com$|tile\.openstreetmap\.org$|docs\.google\.com$|googleusercontent\.com$|drive\.google\.com$|googletagmanager\.com$|google-analytics\.com$/.test(url.hostname)) return;
  // pages: network first so updates show, saved copy when offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (res.ok && url.origin === location.origin) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  // search index: network first (it changes with new pages)
  if (url.origin === location.origin && url.pathname.endsWith('/assets/search.json')) {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
    return;
  }
  // everything else (styles, script, icons, PDFs, fonts, map library): saved copy first
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok && (url.origin === location.origin || /cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.hostname))) {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy));
    }
    return res;
  })));
});
