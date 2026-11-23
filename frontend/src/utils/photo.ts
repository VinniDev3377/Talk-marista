/** MÓDULO: Redimensiona e comprime fotos selecionadas pelo usuário antes do armazenamento. */
/**
 * Lê uma foto (da câmera ou da galeria) e reduz o tamanho.
 * Fotos de celular têm vários MB; reduzidas ficam com ~50–100 KB,
 * o que cabe no armazenamento do navegador e agiliza o envio.
 
 * @param file — arquivo de imagem escolhido na câmera ou galeria.
 * @param maxSide — dimensão máxima, em pixels, do lado maior da imagem.
 * @param quality — qualidade de compressão JPEG, entre 0 e 1.
 */
export function compressPhoto(file: File, maxSide = 800, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const fail = () => reject(new Error("Não foi possível ler a foto."));
    const reader = new FileReader();
    reader.onerror = fail;
    reader.onload = () => {
      const img = new Image();
      img.onerror = fail;
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return fail();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
