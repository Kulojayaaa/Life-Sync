const CACHE_NAME = 'lifesync-v5';
const APP_SHELL = ['/', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

function cachedOrError(request) {
  return caches.match(request).then((cached) => cached || Response.error());
}

function cacheCopy(request, response) {
  if (!response.ok) return;

  try {
    const copy = response.clone();
    return caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
  } catch {
    return undefined;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isSupabaseProxy = isSameOrigin && url.pathname.startsWith('/supabase/');
  const isVersionedAsset = isSameOrigin && url.pathname.startsWith('/assets/');

  if (!isSameOrigin || isSupabaseProxy) {
    event.respondWith(fetch(event.request).catch(() => Response.error()));
    return;
  }

  if (isVersionedAsset || event.request.destination === 'script' || event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
        event.waitUntil(cacheCopy(event.request, response));
        return response;
      }).catch(() => cachedOrError(event.request))),
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/').then((cached) => cached || Response.error())),
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => cachedOrError(event.request)),
  );
});