import sharp from 'sharp';
import { MEDIA_LIMITS } from './limits';

// Server-side image normalization for /api/admin/media-assets uploads.
// Goals:
//   - Reject anything over the size cap or below the minimum image
//     dimensions, so the library stays curated.
//   - Auto-rotate by EXIF orientation (phone uploads often arrive
//     sideways).
//   - Downscale anything wider/taller than MAX_LONG_EDGE.
//   - Re-encode at a sensible quality so a 12 MB phone photo lands
//     as a ~400 KB web-ready file with no visible quality loss.
//   - Pass non-image files through untouched.

export type ProcessedMedia = {
  buffer: Buffer;
  contentType: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  /** True if we resized or re-encoded. False for pass-through (PDF, video, SVG, GIF, …). */
  processed: boolean;
};

export class MediaValidationError extends Error {
  status = 400;
  constructor(msg: string) { super(msg); this.name = 'MediaValidationError'; }
}

const PASS_THROUGH_MIME = new Set([
  'image/svg+xml',
  'image/gif',
  'image/avif',
]);

export async function processUpload(file: File): Promise<ProcessedMedia> {
  if (file.size === 0) {
    throw new MediaValidationError('Empty file');
  }
  if (file.size > MEDIA_LIMITS.MAX_FILE_BYTES) {
    throw new MediaValidationError(
      `File is ${(file.size / 1024 / 1024).toFixed(1)} MB · max is ${MEDIA_LIMITS.MAX_FILE_BYTES / 1024 / 1024} MB.`,
    );
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // Non-image (PDF, video, etc): pass through. Vector images (SVG) and
  // animated formats (GIF, AVIF) also pass through — sharp can handle
  // them but we'd lose either crispness or animation.
  if (!file.type.startsWith('image/') || PASS_THROUGH_MIME.has(file.type)) {
    return {
      buffer: inputBuffer,
      contentType: file.type,
      size_bytes: file.size,
      width: null,
      height: null,
      processed: false,
    };
  }

  let image = sharp(inputBuffer, { failOn: 'truncated' });
  const meta = await image.metadata();
  const origW = meta.width ?? 0;
  const origH = meta.height ?? 0;

  if (origW < MEDIA_LIMITS.MIN_IMAGE_WIDTH || origH < MEDIA_LIMITS.MIN_IMAGE_HEIGHT) {
    throw new MediaValidationError(
      `Image is ${origW}×${origH} · minimum is ${MEDIA_LIMITS.MIN_IMAGE_WIDTH}×${MEDIA_LIMITS.MIN_IMAGE_HEIGHT}.`,
    );
  }

  // Honor EXIF orientation, then downscale if needed.
  image = image.rotate();
  const longEdge = Math.max(origW, origH);
  if (longEdge > MEDIA_LIMITS.MAX_LONG_EDGE) {
    image = image.resize({
      width:  origW >= origH ? MEDIA_LIMITS.MAX_LONG_EDGE : undefined,
      height: origH >  origW ? MEDIA_LIMITS.MAX_LONG_EDGE : undefined,
      withoutEnlargement: true,
    });
  }

  // Re-encode at the appropriate quality. Keep the original format so
  // any code referencing the storage path by extension keeps working.
  let outBuffer: Buffer;
  let outType = file.type;
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    outBuffer = await image
      .jpeg({ quality: MEDIA_LIMITS.JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();
    outType = 'image/jpeg';
  } else if (file.type === 'image/png') {
    outBuffer = await image
      .png({ compressionLevel: MEDIA_LIMITS.PNG_COMPRESSION })
      .toBuffer();
  } else if (file.type === 'image/webp') {
    outBuffer = await image.webp({ quality: MEDIA_LIMITS.WEBP_QUALITY }).toBuffer();
  } else {
    // Unknown image type — pass the (potentially rotated) buffer through.
    outBuffer = await image.toBuffer();
  }

  const outMeta = await sharp(outBuffer).metadata();
  return {
    buffer: outBuffer,
    contentType: outType,
    size_bytes: outBuffer.length,
    width:  outMeta.width  ?? null,
    height: outMeta.height ?? null,
    processed: true,
  };
}
