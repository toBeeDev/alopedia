/** Scan session related types */

export interface CapturedImage {
  id: string;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
}

export const MIN_IMAGE_WIDTH = 1280;
export const MIN_IMAGE_HEIGHT = 720;
export const MIN_IMAGES = 1;
export const MAX_IMAGES = 6;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];
