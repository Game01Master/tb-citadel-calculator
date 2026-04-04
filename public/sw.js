self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(['./index.html']); // Minimalno keširanje
    })
  );
  self.skipWaiting(); // Prisili instalaciju odmah
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Odmah preuzmi kontrolu
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
