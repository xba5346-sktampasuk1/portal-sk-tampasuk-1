/**
 * Service Worker untuk Sistem e-OPR SK Tampasuk 1 Kota Belud
 * Menyokong pemuatan pantas dan penggunaan luar talian (offline)
 */

const CACHE_NAME = "eopr-sktampasuk1-v2.6";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/config.js",
  "./js/image-tool.js",
  "./js/storage.js",
  "./js/ai-assistant.js",
  "./js/app.js",
  "./assets/logo-sekolah.png",
  "./assets/logo-sekolah.svg",
  "./assets/jata-negara.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  const isCode = url.pathname.endsWith(".html") || 
                 url.pathname.endsWith(".js") || 
                 url.pathname.endsWith(".css") || 
                 url.pathname === "/" || 
                 url.pathname.endsWith("/e-opr/") ||
                 url.pathname.endsWith("/e-opr");

  // Network-First untuk fail kod & dokumen HTML supaya sentiasa menerima versi terkini
  if (isCode) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-First untuk imej dan font statik
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
