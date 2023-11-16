importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const KEY = 'key';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(KEY)
                .then( (cache) => {
                    return cache.addAll(event.data.payload);
                })
        );
    }
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
    .open(KEY)
    .then(cache =>
      cache
        .match(request)
        .then(matching => matching || cache.match('/'))
    );

const update = request =>
  caches
    .open(KEY)
    .then(cache =>
      fetch(request).then(response => cache.put(request, response))
    );

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        if(networkResp) {
          return networkResp;
        } else {
          const cache = await caches.open(KEY);
          const cachedResp = await cache.match(offlineFallbackPage);
          return cachedResp;
        }
    })());
  }
});