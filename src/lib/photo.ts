const MAX_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 1400;

/** Reads an image file, downscales it, returns a JPEG data URL.
 *  Local-only for now — this is the same shape a signed Supabase Storage
 *  upload will return later, so callers won't change. */
export async function readPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  if (file.size > MAX_BYTES) throw new Error("That photo is over 8MB — try a smaller one.");

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read that photo."));
      el.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't read that photo.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}