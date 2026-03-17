const CACHE_NAME = "fitgunluk-v1";
const ASSETS = [
  "/",
  "/index.html",
];

// Kurulum: uygulama kabuğunu önbelleğe al
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Aktivasyon: eski önbellekleri temizle
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: önce ağdan dene, başarısız olursa önbellekten sun
self.addEventListener("fetch", (e) => {
  // Sadece GET isteklerini yakala
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Başarılı yanıtı önbelleğe kopyala
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => {
        // Ağ yok, önbellekten sun
        return caches.match(e.request).then(
          (cached) => cached || caches.match("/index.html")
        );
      })
  );
});
