/** 클라이언트 사이드 이미지 압축 (Canvas API) — Vercel 4.5MB 제한 대응 */
export async function compressImage(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<Blob> {
  const maxWidth = options?.maxWidth ?? 1920;
  const maxHeight = options?.maxHeight ?? 1920;
  const quality = options?.quality ?? 0.8;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // 비율 유지 리사이즈
  let targetW = width;
  let targetH = height;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    targetW = Math.round(width * ratio);
    targetH = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  return blob;
}
