importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "cache-v1";

const offlineFallbackPage = [
        "assets/img/logo.webp",
        "assets/vendor/aos/aos.css",
        "assets/vendor/bootstrap/css/bootstrap.min.css",
        "assets/vendor/bootstrap-icons/bootstrap-icons.css",
        "assets/css/style.css",
        "assets/vendor/aos/aos.js",
        "assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
        "assets/js/main.js",
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