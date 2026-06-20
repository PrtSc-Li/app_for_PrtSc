/**
 * Service Worker — 缓存优先策略 + 离线回退
 *
 * 部署更新时请递增 CACHE_NAME（如 v1 → v2），
 * activate 事件会自动清除旧版本缓存。
 */
const CACHE_NAME = 'pwa-cache-v1';

// 使用 self.registration.scope 动态获取路径前缀，
// 兼容根目录部署和子目录部署（GitHub Pages 项目仓库）
const BASE = self.registration.scope;

const PRECACHE_URLS = [
  BASE,
  BASE + 'index.html',
  BASE + 'offline.html',
  BASE + 'css/style.css',
  BASE + 'js/app.js',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192x192.png',
  BASE + 'icons/icon-512x512.png',
];

/* ===================================================================
 * Install — 预缓存关键资源
 * =================================================================== */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll 中任何一个失败都会导致整个安装失败。
      // 用 Promise.allSettled 逐个添加，可选图标失败不影响安装。
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('SW: 预缓存失败', url, err);
          })
        )
      );
    }).then(() => {
      // skipWaiting 让新 SW 立即激活，不等旧标签页关闭
      return self.skipWaiting();
    })
  );
});

/* ===================================================================
 * Activate — 清除旧缓存，接管所有客户端
 * =================================================================== */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => {
      // claim 让新 SW 立即控制所有页面
      return self.clients.claim();
    })
  );
});

/* ===================================================================
 * Fetch — 缓存优先 + 网络回退 + 后台更新
 * =================================================================== */
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // 只处理 http/https 请求
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // 命中缓存 → 立即返回，同时在后台更新缓存
        fetchAndUpdateCache(event.request);
        return cached;
      }

      // 未命中缓存 → 走网络
      return fetch(event.request)
        .then((response) => {
          // 只缓存成功且同源的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // 网络失败 → 对导航请求返回离线页面
          if (event.request.mode === 'navigate') {
            return caches.match(BASE + 'offline.html');
          }
          // 非导航请求（图片等）返回空响应
          return new Response('', { status: 408 });
        });
    })
  );
});

/**
 * 后台更新缓存（非阻塞，失败不影响用户）
 */
function fetchAndUpdateCache(request) {
  fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response);
        });
      }
    })
    .catch(() => {
      // 静默失败 — 缓存保持旧版本，下次访问时重试
    });
}

/* ===================================================================
 * Message 通道 — 允许页面控制 SW
 * =================================================================== */
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
