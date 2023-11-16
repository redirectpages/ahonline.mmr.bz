importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "cache-v1";

const offlineFallbackPage = [
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
        "assets/img/logo.webp",
        "assets/vendor/aos/aos.css",
        "assets/vendor/bootstrap/css/bootstrap.min.css",
        "assets/vendor/bootstrap-icons/bootstrap-icons.css",
        "assets/vendor/glightbox/css/glightbox.min.css",
        "assets/vendor/swiper/swiper-bundle.min.css",
        "assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
        "assets/vendor/swiper/swiper-bundle.min.js",
        "assets/vendor/glightbox/js/glightbox.min.js",
        "assets/vendor/swiper/swiper-bundle.min.js",
        "assets/vendor/php-email-form/validate.js",
        "assets/vendor/aos/aos.js",
        "assets/css/style.css",
        "assets/js/main.js",
        "manifese.json",
        "pwa.js",
        "/"
    ];

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

const fromNetwork = (request, timeout) =>
  new Promise((fulfill, reject) => {
    const timeoutId = setTimeout(reject, timeout);
    fetch(request).then(response => {
      clearTimeout(timeoutId);
      fulfill(response);
      update(request);
    }, reject);
  });

const fromCache = request =>
  caches
    .open(CACHE)
    .then(cache =>
      cache
        .match(request)
        .then(matching => matching || cache.match('/'))
    );

const update = request =>
  caches
    .open(CACHE)
    .then(cache =>
      fetch(request).then(response => cache.put(request, response))
    );

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fromNetwork(event.request, 10000).catch(() => fromCache(event.request))
    );
    event.waitUntil(update(event.request));
  }
});