import sharp from "sharp";

/** 썸네일 생성 */
export async function createThumbnail(
  buffer: Buffer,
  size: number = 300,
): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
    })
    .withMetadata({})
    .jpeg({ quality: 70 })
    .toBuffer();
}
