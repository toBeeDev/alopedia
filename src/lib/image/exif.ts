import sharp from "sharp";

/** EXIF 메타데이터 완전 제거 + 리사이즈 */
export async function stripExifAndResize(
  buffer: Buffer,
  options?: { maxWidth?: number; maxHeight?: number },
): Promise<Buffer> {
  const maxWidth = options?.maxWidth ?? 1920;
  const maxHeight = options?.maxHeight ?? 1920;

  const result = await sharp(buffer)
    .rotate() // EXIF orientation 적용 후 제거
    .resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .withMetadata({}) // 모든 EXIF/XMP/IPTC 제거 (빈 객체 = 메타데이터 초기화)
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  return result;
}

/** EXIF 제거 검증 — 메타데이터가 남아있는지 확인 */
export async function verifyExifRemoved(buffer: Buffer): Promise<boolean> {
  const metadata = await sharp(buffer).metadata();
  // GPS, EXIF 관련 필드가 없어야 함
  return !metadata.exif && !metadata.xmp && !metadata.iptc;
}

/** 이미지 메타데이터 조회 (해상도 등) */
export async function getImageMetadata(
  buffer: Buffer,
): Promise<{ width: number; height: number; format: string }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    format: metadata.format ?? "unknown",
  };
}
