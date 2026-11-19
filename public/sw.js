/* Cache local do Talk Marista para permitir reabrir o app após a primeira visita. */
const CACHE_NAME = "talk-marista-static-v2";
const PHOTO_CACHE = "talk-marista-photos-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/talk-marista-192.png", "/icons/talk-marista-512.png"];

// Instalação: pré-carrega os arquivos essenciais para a primeira abertura offline.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

// Ativação: remove caches estáticos antigos e assume o controle das páginas.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("talk-marista-static-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Rede: aplica estratégias de cache diferentes para navegação, arquivos e imagens.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  // Requisições que alteram dados não devem ser interceptadas nem guardadas em cache.
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Fotos externas: cacheia após o primeiro carregamento para reutilizar offline.
  // Fotos externas usam um cache separado para reaproveitamento após o primeiro acesso.
  if (request.destination === "image" && url.origin !== self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(PHOTO_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") await cache.put(request, response.clone());
        return response;
      } catch {
        return cached || Response.error();
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;
  // Navegação usa a rede primeiro e recorre à página em cache se estiver offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(async () => (await caches.match("/index.html")) || (await caches.match("/"))),
    );
    return;
  }
  // Recursos locais usam cache-first: consulta o cache antes de fazer nova requisição.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
