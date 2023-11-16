// Service Worker Register 
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('//'+window.location.hostname+'/sworker.js')
            .then(registration => {
        })
            .catch(err => {
        });
    });
}