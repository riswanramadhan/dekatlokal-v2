/* Never cache account pages, form submissions, or API responses. */
const OFFLINE_CACHE = "dekatlokal-offline-v1";
const OFFLINE_PAGE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_PAGE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("dekatlokal-offline-") && key !== OFFLINE_CACHE).map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.mode !== "navigate") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const fallback = await caches.match(OFFLINE_PAGE);
    return fallback || new Response("Koneksi terputus. Coba lagi saat sudah online.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }));
});
