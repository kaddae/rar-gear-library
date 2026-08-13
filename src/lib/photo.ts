/** Photos ride inside Community Cloud documents, and a document caps at 32KB —
 *  so a photo has a hard budget, not just a maximum size. We step the edge and
 *  the JPEG quality down until the encoded string fits with room left over for
 *  the story it travels with. Crisp at the size stories actually render; soft
 *  only if someone blows one up full-screen.
 *
 *  Swapping in object storage later means returning a URL from here and
 *  changing nothing else in the app. */

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const EDGES = [480, 400, 320, 260, 200, 150];
const QUALITIES = [0.72, 0.56, 0.42];

/** Characters of data URL a photo may use. A document is 32KB; the rest of a
 *  story (text, ids, dates) never comes near the remaining 8. */
export const PHOTO_BUDGET = 24_000;

function encode(img: HTMLImageElement, edge: number, quality: number) {
  const scale = Math.min(1, edge / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't read that photo.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function readPhoto(file: File, budget = PHOTO_BUDGET): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("That photo is over 8MB — try a smaller one.");

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read that photo."));
      el.src = url;
    });

    let smallest = "";
    for (const edge of EDGES) {
      for (const quality of QUALITIES) {
        const encoded = encode(img, edge, quality);
        if (encoded.length <= budget) return encoded;
        smallest = encoded;
      }
    }
    // Nothing fit — hand back the smallest we made rather than losing the photo.
    if (smallest) return smallest;
    throw new Error("Couldn't shrink that photo down far enough.");
  } finally {
    URL.revokeObjectURL(url);
  }
}