/* ==========================================================================
   SERVICE WORKER PWA — A.G.O. 2026 AEEMCI SOUS-COMITÉ DE KOUMASSI
   Vitesse extrême & Fonctionnement autonome hors-ligne sur Smartphone
   ========================================================================== */

const CACHE_NAME = 'ago-koumassi-v20261120_v50';
const STATIC_ASSETS = [
  './',
  './index.html',
  './base_de_donnees.html',
  './style.css',
  './mobile-premium.css',
  './base_de_donnees.css',
  './script.js',
  './base_donnees_ago.js',
  './base_de_donnees_page.js',
  './qrcode.min.js',
  './html5-qrcode.min.js',
  './jspdf.umd.min.js',
  './logo-aeemci.jpeg',
  './president-sow-mohamed.jpeg',
  './manifest.json'
];

// Installation : Mise en cache immédiate des assets essentiels
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pré-mise en cache partielle:', err);
      });
    })
  );
});

// Activation : Nettoyage des anciens caches pour libérer la mémoire du smartphone
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch : Stratégie Stale-While-Revalidate pour chargement instantané (0ms)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignorer les requêtes non GET ou vers Supabase en direct
  if (request.method !== 'GET') return;
  if (request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Si présent en cache, servir instantanément
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Mode hors-ligne : renvoyer index.html si navigation
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
