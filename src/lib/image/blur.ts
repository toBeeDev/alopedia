import sharp from "sharp";
import type { ScalpRegion } from "@/types/analysis";

/**
 * 두피 영역 외 부분을 blur 처리.
 * region은 정규화된 좌표(0~1). 해당 영역은 선명하게, 나머지는 blur.
 */
export async function blurOutsideRegion(
  buffer: Buffer,
  region: ScalpRegion,
  blurRadius: number = 30,
): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width === 0 || height === 0) return buffer;

  // 정규화 좌표 → 픽셀 좌표
  const rx = Math.round(region.x * width);
  const ry = Math.round(region.y * height);
  const rw = Math.min(Math.round(region.w * width), width - rx);
  const rh = Math.min(Math.round(region.h * height), height - ry);

  if (rw <= 0 || rh <= 0) return buffer;

  // 1. 전체 이미지를 blur
  const blurred = await sharp(buffer)
    .blur(blurRadius)
    .toBuffer();

  // 2. 원본에서 두피 영역만 crop
  const scalpCrop = await sharp(buffer)
    .extract({ left: rx, top: ry, width: rw, height: rh })
    .toBuffer();

  // 3. blur 이미지 위에 원본 두피 영역을 composite
  const result = await sharp(blurred)
    .composite([
      {
        input: scalpCrop,
        left: rx,
        top: ry,
      },
    ])
    .jpeg({ quality: 85 })
    .toBuffer();

  return result;
}
