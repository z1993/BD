const CACHE_NAME = 'boardgame-tracker-v1';
const ASSETS_TO_CACHE = [
    '/BD/boardgame-tracker/',
    '/BD/boardgame-tracker/index.html',
    '/BD/boardgame-tracker/css/style.css',
    '/BD/boardgame-tracker/js/app.js',
    '/BD/boardgame-tracker/js/ui.js',
    '/BD/boardgame-tracker/js/data.js',
    '/BD/boardgame-tracker/manifest.json',
    '/BD/boardgame-tracker/img/icon-192.png',
    '/BD/boardgame-tracker/img/icon-512.png',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 处理请求
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果在缓存中找到响应，则返回缓存的响应
                if (response) {
                    return response;
                }

                // 否则发送网络请求
                return fetch(event.request)
                    .then((response) => {
                        // 检查是否收到有效的响应
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 克隆响应
                        const responseToCache = response.clone();

                        // 将响应添加到缓存
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
}); 