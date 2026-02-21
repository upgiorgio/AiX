const CACHE_NAME = "x-articles-studio-v11";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=20260221-6",
  "/app.js?v=20260221-6",
  "/md-lab",
  "/md-lab/index.html",
  "/md-lab/styles.css?v=20260221-2",
  "/md-lab/app.js?v=20260221-3",
  "/card-suite",
  "/card-suite/index.html",
  "/card-suite/copy-studio",
  "/card-suite/copy-studio.html",
  "/card-suite/card-designer",
  "/card-suite/card-designer.html",
  "/card-suite/publish-hub",
  "/card-suite/publish-hub.html",
  "/card-suite/strategy",
  "/card-suite/strategy.html",
  "/card-suite/common.css?v=20260222-1",
  "/card-suite/common.js?v=20260222-1",
  "/card-suite/copy-studio.js?v=20260222-2",
  "/card-suite/card-designer.js?v=20260222-2",
  "/card-suite/publish-hub.js?v=20260222-1",
  "/card-suite/strategy.js?v=20260222-1",
  "/manifest.webmanifest",
  "/icon-192.svg",
  "/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
