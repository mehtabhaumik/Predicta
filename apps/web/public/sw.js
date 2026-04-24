const VERSION = 'predicta-pwa-v2';
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = '/offline';
const KNOWN_HTML_ROUTES = [
  '/',
  '/pricing',
  '/founder',
  '/dashboard',
  '/dashboard/chat',
  '/dashboard/kundli',
  '/dashboard/charts',
  '/dashboard/report',
  '/dashboard/saved-kundlis',
  '/dashboard/settings',
  '/dashboard/redeem-pass',
  '/dashboard/admin',
  '/dashboard/life-timeline',
  '/dashboard/journal',
  '/dashboard/compatibility',
];

const SHELL_ASSETS = [
  '/',
  '/offline',
  ...KNOWN_HTML_ROUTES.filter(route => route !== '/'),
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/predicta-logo.png',
];

function normalizeRoute(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function isKnownHtmlRoute(pathname) {
  return KNOWN_HTML_ROUTES.includes(normalizeRoute(pathname));
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map(key => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.startsWith('/ai/') || requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok && isKnownHtmlRoute(requestUrl.pathname)) {
            const normalizedPath = normalizeRoute(requestUrl.pathname);
            const copy = response.clone();
            caches.open(SHELL_CACHE).then(cache => cache.put(normalizedPath, copy));
          }

          return response;
        })
        .catch(async () => {
          const normalizedPath = normalizeRoute(requestUrl.pathname);

          if (isKnownHtmlRoute(normalizedPath)) {
            const cached = await caches.match(normalizedPath);
            if (cached) {
              return cached;
            }
          }

          return caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(response => {
          if (
            response &&
            response.status === 200 &&
            ['style', 'script', 'image', 'font'].includes(event.request.destination)
          ) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    }),
  );
});
