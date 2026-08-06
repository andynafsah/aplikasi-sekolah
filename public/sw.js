/**
 * Enterprise ERP Sekolah & Pesantren - Production Service Worker
 * Version: erp-pwa-v1.0.0
 */

const CACHE_NAME = 'erp-static-v1';
const API_CACHE_NAME = 'erp-api-cache-v1';
const IMAGE_CACHE_NAME = 'erp-image-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// 1. Install Event: Pre-cache static shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching Enterprise PWA Shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
});

// 2. Activate Event: Clean up stale caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME && name !== IMAGE_CACHE_NAME)
          .map((name) => {
            console.log('[SW] Clearing Stale Cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intelligent Strategy per Request Type
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-HTTP/HTTPS requests (e.g. chrome-extension://, data:)
  if (!url.protocol.startsWith('http')) return;

  // A. Handle API GET requests (Network-first with Cache Fallback)
  if (url.pathname.startsWith('/api/')) {
    // DO NOT cache mutation requests (POST, PUT, DELETE, PATCH)
    if (request.method !== 'GET') {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, attempt to serve cached API GET response
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({
                success: false,
                offline: true,
                message: 'Mode Offline: Menggunakan data cache lokal terdekat.'
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // B. Handle Image / Media requests (Cache-first with Network Fallback)
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/i)) {
    event.respondWith(
      caches.match(request).then((cachedImage) => {
        if (cachedImage) return cachedImage;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(IMAGE_CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => {
          // Return default icon if image fetch fails
          return caches.match('/icons/icon-192x192.svg');
        });
      })
    );
    return;
  }

  // C. Handle Navigation / HTML Requests (Network-first with Offline Fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedPage) => {
            if (cachedPage) return cachedPage;
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // D. Static Assets (JS, CSS, Fonts): Stale-while-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Message Event: Handle Skip Waiting and Client Communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 5. Background Sync Event: Process Offline Submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance-queue' || event.tag === 'sync-offline-queue') {
    console.log('[SW] Executing Background Sync for Offline Queue:', event.tag);
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC_TRIGGERED',
            tag: event.tag
          });
        });
      })
    );
  }
});

// 6. Push Notification Event: Display Enterprise Broadcasts
self.addEventListener('push', (event) => {
  let data = { title: 'Enterprise ERP Sekolah', body: 'Notifikasi sistem terbaru tersedia.', icon: '/icons/icon-192x192.svg' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Buka Aplikasi' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 7. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
