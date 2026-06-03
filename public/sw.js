const STATIC_CACHE = 'quran-static-v3';
const API_CACHE = 'quran-api-v3';
const TAJWEED_CACHE = 'quran-tajweed-v1';

const STATIC_ASSETS = [
  '/', '/khatma', '/juz', '/bookmarks', '/search',
  '/athkar', '/tasbih', '/contact', '/about', '/stats',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => ![STATIC_CACHE, API_CACHE, TAJWEED_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Quran API — Cache First
  if (url.hostname === 'api.alquran.cloud') {
    e.respondWith(
      caches.open(API_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          return new Response(JSON.stringify({error:'offline'}), {headers:{'Content-Type':'application/json'}});
        }
      })
    );
    return;
  }

  // Tajweed data — Cache First
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('tajweed')) {
    e.respondWith(
      caches.open(TAJWEED_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          return Response.error();
        }
      })
    );
    return;
  }

  // Audio — Cache after play
  if (url.hostname === 'cdn.islamic.network') {
    e.respondWith(
      caches.open(STATIC_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch { return Response.error(); }
      })
    );
    return;
  }

  // Fonts — Cache First
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(
      caches.open(STATIC_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      })
    );
    return;
  }

  // Pages — Network first
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          caches.open(STATIC_CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
