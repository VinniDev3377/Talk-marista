/** MÓDULO: Resolve imagens remotas e arquivos locais do aplicativo. */
/**
 * Catálogo de fotografias reais do Talk Marista.
 * As URLs apontam para imagens publicadas nas galerias públicas citadas em
 * FOTOGRAFIAS_E_CREDITOS.md. Depois do primeiro carregamento, o service worker
 * tenta manter as fotografias em cache para uso offline.
 */
const remotePhotos: Record<string, string> = {
  // Fachada noturna do edifício — galeria AutImob.
  predio: "https://www.autimob.com.br/storage/media/2021/11/29/9f1b5cb64d44138106f433defbe7e0d3",
  // Fotografias dos ambientes — galeria Seu Imóvel Goiânia.
  "espaco-grill": "https://seuimovelgoiania.com.br/wp-content/uploads/2024/04/talk-marista-14.webp",
  "salao-de-festas": "https://seuimovelgoiania.com.br/wp-content/uploads/2024/04/talk-marista-15.webp",
  "espaco-gourmet": "https://seuimovelgoiania.com.br/wp-content/uploads/2024/04/talk-marista-6.webp",
  brinquedoteca: "https://seuimovelgoiania.com.br/wp-content/uploads/2024/04/talk-marista-11.webp",
  academia: "https://seuimovelgoiania.com.br/wp-content/uploads/2024/04/talk-marista-10.webp",
  // A galeria identifica esta foto como hidromassagem/spa, não como sauna.
  sauna: "https://seuimovelgoiania.com.br/wp-content/uploads/2024/04/talk-marista-7.webp",
  "salao-de-jogos": "https://seuimovelgoiania.com.br/wp-content/uploads/2024/04/talk-marista-13.webp",
  piscina: "https://seuimovelgoiania.com.br/wp-content/uploads/2024/04/talk-marista-8.webp",
};

const localFiles = import.meta.glob("./assets/imagens/*.{jpg,jpeg,png,webp,svg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Retorna a foto real publicada ou, se não houver mapeamento, um arquivo local. 
 * @param name — identificador da imagem no catálogo; também é usado para procurar um arquivo local.
 */
export function image(name: string): string {
  const remote = remotePhotos[name];
  if (remote) return remote;
  for (const ext of ["jpg", "jpeg", "png", "webp", "svg"]) {
    const local = localFiles[`./assets/imagens/${name}.${ext}`];
    if (local) return local;
  }
  return "";
}

/** Caminho local da ilustração SVG original, disponível para fallback futuro na interface. 
 * @param name — nome-base do SVG local que será retornado como alternativa visual.
 */
export function imageFallback(name: string): string {
  return localFiles[`./assets/imagens/${name}.svg`] ?? "";
}
