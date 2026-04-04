self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ovaj dio govori pregledniku: "Pokušaj dohvatiti s interneta, ako ne ide, ignoriraj"
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline');
    })
  );
});
