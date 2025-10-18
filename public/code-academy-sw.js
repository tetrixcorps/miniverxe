// Code Academy Service Worker
// Provides offline functionality and caching for the learning platform

const CACHE_NAME = 'code-academy-v1';
const STATIC_CACHE_URLS = [
  '/code-academy',
  '/code-academy-manifest.json',
  '/images/code-academy-icon-192.png',
  '/images/code-academy-icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Code Academy Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Code Academy Service Worker: Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Code Academy Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Code Academy Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Code Academy Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Code Academy Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Code Academy Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle requests for Code Academy pages
  if (!event.request.url.includes('/code-academy')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Code Academy Service Worker: Serving from cache', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails and no cache, show offline page
            if (event.request.destination === 'document') {
              return caches.match('/code-academy');
            }
          });
      })
  );
});

// Background sync for learning progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'learning-progress-sync') {
    console.log('Code Academy Service Worker: Syncing learning progress');
    event.waitUntil(syncLearningProgress());
  }
});

// Push notifications for learning reminders
self.addEventListener('push', (event) => {
  console.log('Code Academy Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Time for your daily coding practice!',
    icon: '/images/code-academy-icon-192.png',
    badge: '/images/code-academy-icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Start Learning',
        icon: '/images/code-academy-icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/code-academy-icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Code Academy', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Code Academy Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/code-academy')
    );
  }
});

// Sync learning progress function
async function syncLearningProgress() {
  try {
    // Get stored progress from IndexedDB
    const progress = await getStoredProgress();
    
    if (progress && progress.length > 0) {
      // Send progress to server
      const response = await fetch('/api/v1/code-academy/sync-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress })
      });

      if (response.ok) {
        console.log('Code Academy Service Worker: Progress synced successfully');
        // Clear stored progress after successful sync
        await clearStoredProgress();
      }
    }
  } catch (error) {
    console.error('Code Academy Service Worker: Progress sync failed', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredProgress() {
  // Implementation would use IndexedDB to get stored progress
  return [];
}

async function clearStoredProgress() {
  // Implementation would clear stored progress from IndexedDB
  console.log('Code Academy Service Worker: Cleared stored progress');
}
