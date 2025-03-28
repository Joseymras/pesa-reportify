
// Service Worker for PesaLytics PWA

const CACHE_NAME = 'pesalytics-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  // Don't cache API calls to Supabase
  if (event.request.url.includes('/supabase/') || 
      event.request.url.includes('/auth/') ||
      event.request.url.includes('/rest/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response so we can save it in cache and return it
        const responseClone = response.clone();
        
        // Only cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network request fails, try to serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache and network is down, return offline fallback
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});

// Handle background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Function to sync stored form submissions when back online
async function syncForms() {
  try {
    const db = await openDB();
    const pendingForms = await db.getAll('pending-forms');
    
    for (const form of pendingForms) {
      try {
        const response = await fetch(form.url, {
          method: form.method,
          headers: form.headers,
          body: form.body
        });
        
        if (response.ok) {
          await db.delete('pending-forms', form.id);
        }
      } catch (error) {
        console.error('Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing forms:', error);
  }
}

// Open IndexedDB for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pesalytics-offline', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('pending-forms', { keyPath: 'id', autoIncrement: true });
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}
