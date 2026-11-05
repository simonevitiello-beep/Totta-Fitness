// Alzare il numero a ogni pubblicazione: e' quello che fa comparire "Aggiorna ora" sul telefono.
const CACHE = "totta-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./leopard.jpg",
  "./icon-192.png", "./icon-512.png", "./icon-192-maskable.png", "./icon-512-maskable.png", "./apple-touch-icon.png",
  "./fonts/oswald-latin-500-normal.woff2", "./fonts/oswald-latin-700-normal.woff2", "./fonts/playfair-display-latin-700-italic.woff2"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Cancella solo le cache di Totta: sullo stesso dominio c'e' anche Hustler, che non va toccato.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("totta-") && k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// In cache finiscono solo le risposte buone: un errore temporaneo di GitHub Pages non resta per sempre.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { cacheName: CACHE }).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((resp) => {
          if (resp && (resp.ok || resp.type === "opaque")) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return resp;
        })
        .catch(() => cached);
    })
  );
});
