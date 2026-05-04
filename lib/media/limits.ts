// Upload limits + image-processing knobs. Pure constants so the upload
// modal can show them in the UI alongside the form.

export const MEDIA_LIMITS = {
  /** Max upload size in bytes (rejected outright if exceeded). */
  MAX_FILE_BYTES: 25 * 1024 * 1024,
  /** Smallest allowed image — anything below renders poorly on retina screens. */
  MIN_IMAGE_WIDTH: 600,
  MIN_IMAGE_HEIGHT: 400,
  /** Anything wider/taller than this on the long edge is downscaled. */
  MAX_LONG_EDGE: 2400,
  /** Re-encode quality. JPEG uses mozjpeg + progressive. */
  JPEG_QUALITY: 82,
  WEBP_QUALITY: 80,
  /** PNG compression level 0-9 (sharp default 6). 9 = smallest, slower. */
  PNG_COMPRESSION: 9,
} as const;

export const MEDIA_LIMITS_TEXT = {
  maxFile: `${MEDIA_LIMITS.MAX_FILE_BYTES / 1024 / 1024} MB`,
  minDims: `${MEDIA_LIMITS.MIN_IMAGE_WIDTH}×${MEDIA_LIMITS.MIN_IMAGE_HEIGHT}`,
  maxEdge: `${MEDIA_LIMITS.MAX_LONG_EDGE}px`,
};
