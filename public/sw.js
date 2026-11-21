// Minimal offline support: hashed build assets are cache-first, everything else network-first.
const CACHE = "clock-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.add("/")).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.headers.has("range")) return; // media range requests: let the network handle

  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (url.pathname.startsWith("/_next/static/")) {
        const hit = await cache.match(req);
        if (hit) return hit;
      }
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        const hit = (await cache.match(req)) || (req.mode === "navigate" ? await cache.match("/") : undefined);
        return hit || Response.error();
      }
    })(),
  );
});
