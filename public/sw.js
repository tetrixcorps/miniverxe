// TETRIX PWA Service Worker
// Provides seamless cross-platform transitions and offline capabilities

const CACHE_NAME = 'tetrix-pwa-v1';
const EXTERNAL_DOMAINS = [
  'www.poisonedreligion.ai',
  'www.joromi.ai',
  'tetrixcorp.com'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('TETRIX PWA Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching essential resources...');
        return cache.addAll([
          '/',
          '/about',
          '/contact',
          '/pricing',
          '/manifest.json'
        ]);
      })
      .then(() => {
        console.log('TETRIX PWA Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('TETRIX PWA Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('TETRIX PWA Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with seamless transitions
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle external domain redirects with seamless transition
  if (EXTERNAL_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(
      handleExternalDomainRequest(request)
    );
    return;
  }

  // Handle internal requests with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          console.log('Serving from cache:', request.url);
          return response;
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch((error) => {
            console.log('Fetch failed, serving offline page:', error);
            return caches.match('/offline.html') || new Response('Offline');
          });
      })
  );
});

// Handle external domain requests with seamless transition
async function handleExternalDomainRequest(request) {
  try {
    // Add seamless transition headers
    const modifiedRequest = new Request(request, {
      headers: {
        ...request.headers,
        'X-Seamless-Transition': 'true',
        'X-Source-Platform': 'tetrix'
      }
    });

    const response = await fetch(modifiedRequest);
    
    // Add CORS headers for seamless integration
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Seamless-Transition, X-Source-Platform',
        'X-Seamless-Transition': 'enabled'
      }
    });

    return modifiedResponse;
  } catch (error) {
    console.error('External domain request failed:', error);
    return new Response('External service temporarily unavailable', { status: 503 });
  }
}

// Handle cross-platform communication
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'EXTERNAL_REDIRECT':
      handleExternalRedirect(data);
      break;
    case 'CACHE_UPDATE':
      handleCacheUpdate(data);
      break;
    case 'SEAMLESS_TRANSITION':
      handleSeamlessTransition(data);
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

// Handle external redirects with seamless transition
function handleExternalRedirect(data) {
  const { url, platform } = data;
  console.log(`Seamless redirect to ${platform}:`, url);
  
  // Store transition context
  self.transitionContext = {
    source: 'tetrix',
    target: platform,
    timestamp: Date.now(),
    url: url
  };
}

// Handle cache updates
function handleCacheUpdate(data) {
  const { urls } = data;
  caches.open(CACHE_NAME)
    .then((cache) => {
      return Promise.all(
        urls.map(url => cache.add(url))
      );
    })
    .then(() => {
      console.log('Cache updated successfully');
    })
    .catch((error) => {
      console.error('Cache update failed:', error);
    });
}

// Handle seamless transitions
function handleSeamlessTransition(data) {
  const { from, to, context } = data;
  console.log(`Seamless transition from ${from} to ${to}`, context);
  
  // Store transition state
  self.transitionState = {
    from,
    to,
    context,
    timestamp: Date.now()
  };
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Performing background sync...');
  // Implement background sync logic here
}

// Push notifications for cross-platform updates
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Update',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TETRIX Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('TETRIX PWA Service Worker loaded successfully');
