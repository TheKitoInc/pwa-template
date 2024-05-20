const NETWORK_TIMEOUT = 5000
const CACHE_NAME = 'v1'
const CACHE_FILES = ['.']

/// //////////////////////////////CACHE ACCESS///////////////////////////////////
// Init cache
async function initCache () {
  return caches.open(CACHE_NAME).then(function (cache) {
    console.log('Service Worker: Init cache: ' + CACHE_NAME)
    return cache.addAll(CACHE_FILES)
  })
}

// Put response in cache
async function toCache (request, response) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.put(request, response.clone())
  })
}

// Get response from cache
async function fromCache (request) {
  return new Promise(function (fulfill, reject) {
    caches.open(CACHE_NAME).then(function (cache) {
      cache.match(request).then(fulfill, reject)
    }, reject)
  })
}

// Clean older cache
async function cleanCache () {
  caches.keys().then(function (keys) {
    return keys.map(async function (cache) {
      if (cache !== CACHE_NAME) {
        console.log('Service Worker: Removing old cache: ' + cache)
        return await caches.delete(cache)
      }
    })
  })
}
/// //////////////////////////////NETWORK ACCESS/////////////////////////////////
async function fromNetwork (request) {
  return new Promise(function (fulfill, reject) {
    const timeoutId = setTimeout(reject, NETWORK_TIMEOUT)
    fetch(request).then(function (response) {
      clearTimeout(timeoutId)
      toCache(request, response.clone())
      fulfill(response)
    }, reject)
  })
}
/// //////////////////////////NETWORK/CACHE ACCESS///////////////////////////////
async function fromNetworkElseCache (request) {
  return new Promise(function (fulfill, reject) {
    fromNetwork(request).then(fulfill, function () {
      fromCache(request).then(fulfill, reject)
    })
  })
}
async function fromCacheElseNetwork (request) {
  return new Promise(function (fulfill, reject) {
    fromCache(request).then(fulfill, function () {
      fromNetwork(request).then(fulfill, reject)
    })
  })
}
/// /////////////////////////////////////////////////////////////////////////////
// On install, cache the non available resource.
self.addEventListener('install', function (evt) {
  console.log('The service worker is being installed.')
  cleanCache()
  evt.waitUntil(initCache().then(function () {
    return self.skipWaiting()
  }))
})

// On activate
self.addEventListener('activate', function (evt) {
  console.log('The service worker is being activated.')
  evt.waitUntil(self.clients.claim())
})

// On fetch
self.addEventListener('fetch', function (evt) {
  // console.log('The service worker is serving the asset: ' + evt.request.url);
  evt.respondWith(fromNetworkElseCache(evt.request))
  // evt.respondWith(fromCacheElseNetwork(evt.request));
})
