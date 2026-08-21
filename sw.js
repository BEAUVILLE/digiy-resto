/* DIGIY RESTO — PWA léger
   Installation permanente, sans cache de page afin d'éviter les liens périmés.
*/

const DIGIY_RESTO_PWA_VERSION = 'digiy-resto-pwa-20260821-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request));
});
