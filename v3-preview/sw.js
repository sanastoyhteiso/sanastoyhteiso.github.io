/* Scoped /v3-preview/ network-only worker: no caching/fetch intercept or root-cache deletion. */
self.addEventListener('install',function(e){e.waitUntil(self.skipWaiting());});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
