import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MIN_IMAGE_WIDTH,
  MIN_IMAGE_HEIGHT,
  type AllowedMimeType,
} from "@/types/scan";

/** Magic bytes로 실제 파일 형식 검증 */
const MAGIC_BYTES: Record<AllowedMimeType, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF
};

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateMimeType(contentType: string): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(contentType as AllowedMimeType)) {
    return { valid: false, error: `허용되지 않는 파일 형식이에요. JPEG, PNG, WebP만 가능합니다.` };
  }
  return { valid: true, error: null };
}

export function validateFileSize(size: number): ValidationResult {
  if (size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `파일 크기가 너무 커요. 최대 10MB까지 가능합니다.` };
  }
  if (size === 0) {
    return { valid: false, error: `빈 파일은 업로드할 수 없어요.` };
  }
  return { valid: true, error: null };
}

export function validateMagicBytes(
  buffer: ArrayBuffer,
  declaredType: string,
): ValidationResult {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  const patterns = MAGIC_BYTES[declaredType as AllowedMimeType];

  if (!patterns) {
    return { valid: false, error: `지원하지 않는 파일 형식이에요.` };
  }

  const matches = patterns.some((pattern) =>
    pattern.every((byte, i) => bytes[i] === byte),
  );

  if (!matches) {
    return { valid: false, error: `파일 형식이 올바르지 않아요. 실제 이미지 파일을 업로드해주세요.` };
  }

  return { valid: true, error: null };
}

export function validateResolution(
  width: number,
  height: number,
): ValidationResult {
  if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
    return {
      valid: false,
      error: `해상도가 부족해요. 최소 ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} 이상이 필요합니다.`,
    };
  }
  return { valid: true, error: null };
}

/** 스크린샷 감지 (EXIF Software 필드 기반) */
export function isScreenshot(exifSoftware: string | undefined): boolean {
  if (!exifSoftware) return false;
  const screenshotKeywords = [
    "screenshot",
    "screen capture",
    "snipping",
    "grab",
    "스크린샷",
  ];
  const lower = exifSoftware.toLowerCase();
  return screenshotKeywords.some((kw) => lower.includes(kw));
}

/** 전체 검증 파이프라인 (서버사이드) */
export async function validateImageFile(
  buffer: ArrayBuffer,
  contentType: string,
  fileName: string,
): Promise<ValidationResult> {
  // 1. MIME 타입
  const mimeResult = validateMimeType(contentType);
  if (!mimeResult.valid) return mimeResult;

  // 2. 파일 크기
  const sizeResult = validateFileSize(buffer.byteLength);
  if (!sizeResult.valid) return sizeResult;

  // 3. Magic bytes
  const magicResult = validateMagicBytes(buffer, contentType);
  if (!magicResult.valid) return magicResult;

  // 4. 파일명 스크린샷 감지
  const lowerName = fileName.toLowerCase();
  if (
    lowerName.includes("screenshot") ||
    lowerName.includes("screen shot") ||
    lowerName.includes("스크린샷")
  ) {
    return { valid: false, error: "스크린샷은 업로드할 수 없어요. 직접 촬영한 사진을 사용해주세요." };
  }

  return { valid: true, error: null };
}
