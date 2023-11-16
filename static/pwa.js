if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
            if (registration.active) {
                const data = {
                    type: 'CACHE_URLS',
                    payload: [
                        location.href,
                        ...performance.getEntriesByType('resource').map((r) => r.name)
                    ]
                };
                registration.active.postMessage(data);
            } else {
                console.log('No active service worker available');
            }
        })
        .catch((err) => console.log('SW registration FAIL:', err));
}
