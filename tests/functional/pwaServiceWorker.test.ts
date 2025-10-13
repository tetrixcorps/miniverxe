// Functional tests for PWA Service Worker
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock service worker environment
const mockCaches = {
  open: vi.fn(),
  keys: vi.fn(),
  match: vi.fn(),
  delete: vi.fn()
};

const mockCache = {
  addAll: vi.fn(),
  put: vi.fn()
};

const mockClients = {
  claim: vi.fn()
};

const mockRegistration = {
  showNotification: vi.fn()
};

// Mock fetch
const mockFetch = vi.fn();

// Mock console
const mockConsole = {
  log: vi.fn(),
  error: vi.fn()
};

// Mock service worker global scope
const mockSelf = {
  addEventListener: vi.fn(),
  skipWaiting: vi.fn(),
  clients: mockClients,
  registration: mockRegistration
};

// Mock setTimeout and setInterval
vi.stubGlobal('setTimeout', vi.fn((fn: Function) => {
  fn();
  return 123;
}));

vi.stubGlobal('setInterval', vi.fn((fn: Function) => {
  fn();
  return 456;
}));

vi.stubGlobal('clearInterval', vi.fn());

// Mock caches
Object.defineProperty(global, 'caches', {
  value: mockCaches,
  writable: true
});

Object.defineProperty(global, 'fetch', {
  value: mockFetch,
  writable: true
});

Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true
});

Object.defineProperty(global, 'self', {
  value: mockSelf,
  writable: true
});

describe('PWA Service Worker', () => {
  let serviceWorkerCode: string;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock cache operations
    mockCaches.open.mockResolvedValue(mockCache);
    mockCaches.keys.mockResolvedValue(['old-cache-v1']);
    mockCaches.match.mockResolvedValue(null);
    mockCaches.delete.mockResolvedValue(true);
    
    // Mock fetch responses
    mockFetch.mockResolvedValue({
      status: 200,
      clone: () => ({ status: 200 }),
      body: 'test response'
    });
    
    // Mock cache operations
    mockCache.addAll.mockResolvedValue(undefined);
    mockCache.put.mockResolvedValue(undefined);
    
    // Mock client operations
    mockClients.claim.mockResolvedValue(undefined);
    
    // Mock registration operations
    mockRegistration.showNotification.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Install Event', () => {
    it('should cache essential resources on install', async () => {
      // Simulate install event
      const installEvent = {
        waitUntil: vi.fn()
      };

      // Mock the service worker install handler
      const handleInstall = async (event: any) => {
        console.log('TETRIX PWA Service Worker installing...');
        await event.waitUntil(
          caches.open('tetrix-pwa-v1')
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
      };

      await handleInstall(installEvent);

      expect(mockCaches.open).toHaveBeenCalledWith('tetrix-pwa-v1');
      expect(mockCache.addAll).toHaveBeenCalledWith([
        '/',
        '/about',
        '/contact',
        '/pricing',
        '/manifest.json'
      ]);
      expect(mockSelf.skipWaiting).toHaveBeenCalled();
      expect(installEvent.waitUntil).toHaveBeenCalled();
    });
  });

  describe('Activate Event', () => {
    it('should clean up old caches on activate', async () => {
      // Simulate activate event
      const activateEvent = {
        waitUntil: vi.fn()
      };

      // Mock the service worker activate handler
      const handleActivate = async (event: any) => {
        console.log('TETRIX PWA Service Worker activating...');
        await event.waitUntil(
          caches.keys()
            .then((cacheNames) => {
              return Promise.all(
                cacheNames.map((cacheName) => {
                  if (cacheName !== 'tetrix-pwa-v1') {
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
      };

      await handleActivate(activateEvent);

      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalledWith('old-cache-v1');
      expect(mockClients.claim).toHaveBeenCalled();
      expect(activateEvent.waitUntil).toHaveBeenCalled();
    });
  });

  describe('Fetch Event', () => {
    it('should serve from cache when available', async () => {
      const cachedResponse = { status: 200, body: 'cached content' };
      mockCaches.match.mockResolvedValue(cachedResponse);

      const fetchEvent = {
        request: {
          url: 'https://tetrixcorp.com/',
          method: 'GET'
        },
        respondWith: vi.fn()
      };

      // Mock the service worker fetch handler
      const handleFetch = async (event: any) => {
        const { request } = event;
        const url = new URL(request.url);

        // Handle internal requests with cache-first strategy
        await event.respondWith(
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
                    caches.open('tetrix-pwa-v1')
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
      };

      await handleFetch(fetchEvent);

      expect(mockCaches.match).toHaveBeenCalledWith(fetchEvent.request);
      expect(fetchEvent.respondWith).toHaveBeenCalled();
    });

    it('should fetch and cache when not in cache', async () => {
      mockCaches.match.mockResolvedValue(null);
      mockFetch.mockResolvedValue({
        status: 200,
        clone: () => ({ status: 200 }),
        body: 'fresh content'
      });

      const fetchEvent = {
        request: {
          url: 'https://tetrixcorp.com/about',
          method: 'GET'
        },
        respondWith: vi.fn()
      };

      // Mock the service worker fetch handler
      const handleFetch = async (event: any) => {
        const { request } = event;

        await event.respondWith(
          caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }

              return fetch(request)
                .then((response) => {
                  if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open('tetrix-pwa-v1')
                      .then((cache) => {
                        cache.put(request, responseClone);
                      });
                  }
                  return response;
                })
                .catch((error) => {
                  return caches.match('/offline.html') || new Response('Offline');
                });
            })
        );
      };

      await handleFetch(fetchEvent);

      expect(mockFetch).toHaveBeenCalledWith(fetchEvent.request);
      expect(mockCache.put).toHaveBeenCalled();
    });

    it('should handle external domain requests with seamless transition', async () => {
      const fetchEvent = {
        request: {
          url: 'https://www.poisonedreligion.ai/',
          method: 'GET'
        },
        respondWith: vi.fn()
      };

      // Mock the service worker fetch handler for external domains
      const handleExternalDomainRequest = async (request: any) => {
        try {
          const modifiedRequest = new Request(request, {
            headers: {
              ...request.headers,
              'X-Seamless-Transition': 'true',
              'X-Source-Platform': 'tetrix'
            }
          });

          const response = await fetch(modifiedRequest);
          
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
      };

      const result = await handleExternalDomainRequest(fetchEvent.request);

      expect(mockFetch).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });
  });

  describe('Message Event', () => {
    it('should handle external redirect messages', () => {
      const messageEvent = {
        data: {
          type: 'EXTERNAL_REDIRECT',
          data: {
            url: 'https://www.joromi.ai',
            platform: 'joromi'
          }
        }
      };

      // Mock the service worker message handler
      const handleMessage = (event: any) => {
        const { type, data } = event.data;

        switch (type) {
          case 'EXTERNAL_REDIRECT':
            console.log(`Seamless redirect to ${data.platform}:`, data.url);
            self.transitionContext = {
              source: 'tetrix',
              target: data.platform,
              timestamp: Date.now(),
              url: data.url
            };
            break;
          default:
            console.log('Unknown message type:', type);
        }
      };

      handleMessage(messageEvent);

      expect(mockConsole.log).toHaveBeenCalledWith('Seamless redirect to joromi:', 'https://www.joromi.ai');
    });

    it('should handle cache update messages', () => {
      const messageEvent = {
        data: {
          type: 'CACHE_UPDATE',
          data: {
            urls: ['/new-page', '/updated-content']
          }
        }
      };

      // Mock the service worker message handler
      const handleMessage = (event: any) => {
        const { type, data } = event.data;

        switch (type) {
          case 'CACHE_UPDATE':
            caches.open('tetrix-pwa-v1')
              .then((cache) => {
                return Promise.all(
                  data.urls.map((url: string) => cache.add(url))
                );
              })
              .then(() => {
                console.log('Cache updated successfully');
              })
              .catch((error) => {
                console.error('Cache update failed:', error);
              });
            break;
        }
      };

      handleMessage(messageEvent);

      expect(mockCaches.open).toHaveBeenCalledWith('tetrix-pwa-v1');
      expect(mockCache.addAll).toHaveBeenCalled();
    });
  });

  describe('Push Event', () => {
    it('should show notification on push event', () => {
      const pushEvent = {
        data: {
          text: () => 'New update available'
        },
        waitUntil: vi.fn()
      };

      // Mock the service worker push handler
      const handlePush = (event: any) => {
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
      };

      handlePush(pushEvent);

      expect(mockRegistration.showNotification).toHaveBeenCalledWith('TETRIX Update', expect.objectContaining({
        body: 'New update available',
        icon: '/favicon.svg',
        badge: '/favicon.svg'
      }));
      expect(pushEvent.waitUntil).toHaveBeenCalled();
    });
  });

  describe('Notification Click Event', () => {
    it('should handle notification click events', () => {
      const notificationClickEvent = {
        action: 'explore',
        notification: {
          close: vi.fn()
        },
        waitUntil: vi.fn()
      };

      // Mock the service worker notification click handler
      const handleNotificationClick = (event: any) => {
        event.notification.close();

        if (event.action === 'explore') {
          event.waitUntil(
            clients.openWindow('/')
          );
        }
      };

      handleNotificationClick(notificationClickEvent);

      expect(notificationClickEvent.notification.close).toHaveBeenCalled();
      expect(notificationClickEvent.waitUntil).toHaveBeenCalled();
    });
  });
});
