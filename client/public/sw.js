const CACHE_NAME = 'all-in-one-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// Perform installation caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old service worker cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache intercept and query fetch pipeline
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Serve from cache
      }
      return fetch(event.request).catch((err) => {
        // Fallback for offline conditions - ONLY return index.html for page navigation!
        if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('/index.html');
        }
        // Let other assets (js, css, images) fail naturally to prevent SyntaxError: Unexpected token '<' crashes
        return Promise.reject(err);
      });
    })
  );
});
