const CACHE_NAME = 'ostore-static-v1';
const STATIC_ASSETS = [
  './index.html',
  './css/style.css',
  './js/custom.js',
  './vender/bootstrap/css/bootstrap.min.css',
  './vender/bootstrap/js/bootstrap.bundle.min.js',
  './vender/jquery/jquery.min.js',
  './vender/slick/slick/slick.min.js',
  './vender/sidebar/hc-offcanvas-nav.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(cacheNames.filter(function (cacheName) {
        return cacheName !== CACHE_NAME;
      }).map(function (cacheName) {
        return caches.delete(cacheName);
      }));
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      return cachedResponse || fetch(event.request);
    })
  );
});
