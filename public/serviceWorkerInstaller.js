if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
            .then(function (registration) {
                registration.addEventListener('updatefound', function () {
                    var installingWorker = registration.installing;
                    console.log('A new service worker is being installed:', installingWorker);
                });
            })
            .catch(function (error) {
                console.log('Service worker registration failed:', error);
            });
} else {
    console.log('Service workers are not supported.');
}
