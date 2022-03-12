(function ()
{
    if (('serviceWorker' in navigator))
    {
        navigator.serviceWorker.register('serviceWorker.js')
                .then(function (registration) {
                    
                    registration.addEventListener('updatefound', function ()
                    {
                        var installingWorker = registration.installing;
                        console.log('A new service worker is being installed:', installingWorker);
                        window.setTimeout(function ()
                        {
                            location.reload();
                        }, 1000);
                    });
                    
                })
                .catch(function (error) {
                    console.log('Service worker registration failed:', error);
                });
    }
}());