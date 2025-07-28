const CACHE_NAME = 'newsai-v1';
const urlsToCache = [
  '/',
  '/static/css/index.css',
  '/static/js/index.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push event - handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New breaking news available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'breaking-news',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Article',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NewsAI - Breaking News', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions when back online
      console.log('Background sync triggered')
    );
  }
});