var CACHE_NAME = "lfl-v1";
var ASSETS = [
  "/index.html",
  "/css/home.css",
  "/scripts/main.js",
  "/scripts/hamburger.js",
  "/img/lfl.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return (
        cached ||
        fetch(event.request).then(function (response) {
          return response;
        })
      );
    })
  );
});
