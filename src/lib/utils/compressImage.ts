// ponytail: client-side canvas compression, resulting data URL stored inline
// in projects.draft_json/published_json (jsonb). Upgrade path: upload the
// compressed blob to Supabase Storage (PRD 9.6) and store its URL instead.
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 800,
  quality = 0.72,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}
