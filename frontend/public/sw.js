// AASRA Progressive Web App Service Worker v3
const CACHE_NAME = "aasra-cache-v3";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/journal",
  "/architecture",
  "/offline.html",
  "/manifest.json",
  "/images/aasra_logo.png",
  "/aasra-logo.png"
];

// Install: Pre-cache App Shell & core routes
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Some assets failed to precache:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache generations
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Evicting outdated cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart routing & offline resilience
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and dynamic API telemetry calls
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) {
    return;
  }

  // Navigation requests (HTML pages): Network-first with cache & offline fallback
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offlinePage = await caches.match("/offline.html");
          if (offlinePage) return offlinePage;
          return caches.match("/");
        })
    );
    return;
  }

  // Static assets (scripts, styles, images, fonts): Cache-first with background revalidation
  if (
    url.origin === location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
     url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|css|js)$/))
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
  }
});
