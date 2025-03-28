export const MIME_MAPPING = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif'
};

export const QUALITY_SETTINGS = {
  'image/jpeg': 0.85,
  'image/webp': 0.90,
  'image/png': 1.0,
  'image/gif': 1.0
};

export const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70MB file limit
export const MAX_DIMENSION = 8000;
export const CHUNK_SIZE = 2; // 2 files are enqueued at a time
export const CHUNK_DELAY = 100; // Delay between chunks to let the UI update

/**
 * Get default quality setting (for JPEG/WebP/etc.) based on target MIME type.
 * @param {string} mime
 * @returns {number}
 */
export function getQuality(mime) {
  return QUALITY_SETTINGS[mime] ?? 0.85;
}
