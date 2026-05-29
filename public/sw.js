const CACHE_NAME = 'quran-v1';
const STATIC_CACHE = 'quran-static-v1';
 
const STATIC_ASSETS = [
  '/',
  '/khatma',
  '/juz',
  '/bookmarks',
  '/search',
];
 
// Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});
 
// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
// Fetch
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
 
  // Cache API responses from alquran.cloud
  if (url.hostname === 'api.alquran.cloud') {
    e.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const response = await fetch(e.request);
          if (response.ok) cache.put(e.request, response.clone());
          return response;
        } catch {
          return new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
    return;
  }
 
  // Cache audio files
  if (url.hostname === 'cdn.islamic.network' && url.pathname.includes('/audio/')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const response = await fetch(e.request);
          if (response.ok) cache.put(e.request, response.clone());
          return response;
        } catch {
          return Response.error();
        }
      })
    );
    return;
  }
 
  // Network first for pages
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
 
