// ============================================
// Service Worker - 自媒体发布工具 PWA
// Cache-first for static, network-first for API
// ============================================

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/banana_ios/',
  '/banana_ios/index.html',
  '/banana_ios/css/ios-system.css',
  '/banana_ios/css/components.css',
  '/banana_ios/css/app.css',
  '/banana_ios/manifest.json'
];

// Patterns for routing strategy
const API_PATTERNS = [
  /\/api\//,
  /\/v1\//,
  /\/graphql/
];

const STATIC_EXTENSIONS = [
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
  '.ico'
];

// ----------------------------------------
// Install: Pre-cache static assets
// ----------------------------------------
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${CACHE_VERSION}`);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Activate immediately without waiting
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Pre-cache failed:', error);
      })
  );
});

// ----------------------------------------
// Activate: Clean up old caches
// ----------------------------------------
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${CACHE_VERSION}`);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete caches that don't match current version
              return (
                name.startsWith('static-') ||
                name.startsWith('dynamic-') ||
                name.startsWith('api-')
              ) && name !== STATIC_CACHE
                && name !== DYNAMIC_CACHE
                && name !== API_CACHE;
            })
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// ----------------------------------------
// Fetch: Route requests by strategy
// ----------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine strategy based on request type
  if (isApiRequest(url)) {
    // Network-first for API calls
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (isStaticAsset(url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    // Network-first for HTML pages, with offline fallback
    event.respondWith(networkFirstWithFallback(request));
  }
});

// ----------------------------------------
// Strategy: Cache-first
// ----------------------------------------
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Return cached version, but update cache in background
      refreshCache(request, cacheName);
      return cachedResponse;
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Try cache as last resort
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return offlineFallback();
  }
}

// ----------------------------------------
// Strategy: Network-first
// ----------------------------------------
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return a JSON error for API requests
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: '当前无网络连接，请稍后重试'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ----------------------------------------
// Strategy: Network-first with offline fallback
// ----------------------------------------
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline HTML fallback
    return offlineFallback();
  }
}

// ----------------------------------------
// Background cache refresh (stale-while-revalidate)
// ----------------------------------------
async function refreshCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silently fail - cached version is still valid
  }
}

// ----------------------------------------
// Offline fallback page
// ----------------------------------------
function offlineFallback() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>离线模式 - 发布工具</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      background: #F2F2F7;
      color: #1C1C1E;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      text-align: center;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #000; color: #F2F2F7; }
    }
    .offline-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    .offline-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .offline-desc {
      font-size: 15px;
      color: #8E8E93;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .offline-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 12px 24px;
      border-radius: 12px;
      background: #FF9F0A;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .offline-btn:active { opacity: 0.85; }
  </style>
</head>
<body>
  <div>
    <div class="offline-icon">📡</div>
    <div class="offline-title">无网络连接</div>
    <div class="offline-desc">当前无法访问网络，已保存的草稿仍可查看。<br>请检查网络后重试。</div>
    <button class="offline-btn" onclick="location.reload()">重新连接</button>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// ----------------------------------------
// Helper: Check if request is an API call
// ----------------------------------------
function isApiRequest(url) {
  return API_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

// ----------------------------------------
// Helper: Check if request is a static asset
// ----------------------------------------
function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

// ----------------------------------------
// Message handler for cache management
// ----------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
