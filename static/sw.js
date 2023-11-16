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
    event.respondWith(
      (async () => {
        try {
          const cachedResp = await caches.match(event.request);
          if (cachedResp) {
            return cachedResp;
          }
        } catch (error) {
          // Handle cache errors, if needed
        }

        try {
          const networkResp = await fetch(event.request);
          if (networkResp && networkResp.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResp.clone());
            return networkResp;
          }
        } catch (error) {
          // Handle network errors, if needed
        }
          
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })()
    );
  }
});

