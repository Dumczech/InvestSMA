'use client';

// Client-side metadata probe for files about to be uploaded. Used by
// the media-library upload modal so we can capture video duration +
// dimensions without paying the 25+ MB cost of bundling ffprobe in a
// serverless function.
//
// For videos: loads the file via an off-screen <video> element with
// preload='metadata' (browsers fetch only the moov/mvhd box) and reads
// duration / videoWidth / videoHeight.
// Returns { ...nulls } if the format isn't decodable or probe times out.

const PROBE_TIMEOUT_MS = 10_000;

export type ProbedMedia = {
  duration_ms: number | null;
  width: number | null;
  height: number | null;
};

const NULLS: ProbedMedia = { duration_ms: null, width: null, height: null };

export function probeVideo(file: File): Promise<ProbedMedia> {
  if (!file.type.startsWith('video/')) return Promise.resolve(NULLS);
  if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve(NULLS);

  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    let settled = false;

    const finish = (result: ProbedMedia) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
      resolve(result);
    };

    video.addEventListener('loadedmetadata', () => {
      finish({
        duration_ms: Number.isFinite(video.duration) ? Math.round(video.duration * 1000) : null,
        width:  video.videoWidth  || null,
        height: video.videoHeight || null,
      });
    });
    video.addEventListener('error', () => finish(NULLS));
    setTimeout(() => finish(NULLS), PROBE_TIMEOUT_MS);

    video.src = url;
  });
}
