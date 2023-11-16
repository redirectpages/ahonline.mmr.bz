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

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const cachedResp = await fromCache(event.request);
        if (cachedResp) {
          return cachedResp;
        }
      } catch (error) {
        // Handle cache errors, if needed
      }

      try {
        const networkResp = await fromNetwork(event.request, 5000);
        if (networkResp && networkResp.status === 200) {
          event.waitUntil(update(event.request.clone(), networkResp.clone()));
          return networkResp;
        }
      } catch (error) {
        // Handle network errors, if needed
      }

      // If both cache and network fail, respond with a generic offline message
      return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    })());
  }
});

const update = (request, response) =>
  caches.open(KEY).then((cache) => cache.put(request, response));

const fromNetwork = (request, timeout) =>
  new Promise((fulfill, reject) => {
    const timeoutId = setTimeout(reject, timeout);
    fetch(request)
      .then((response) => {
        clearTimeout(timeoutId);
        fulfill(response);
      })
      .catch(reject);
  });

const fromCache = (request) =>
  caches
    .open(KEY)
    .then((cache) =>
      cache.match(request).then((matching) => matching || cache.match('/'))
    );
