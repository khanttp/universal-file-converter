import { MIME_MAPPING, QUALITY_SETTINGS } from './constants.js';

/**
 * Extract the file extension from a filename (e.g., "photo.jpg" → "jpg").
 * @param {string} filename
 * @returns {string}
 */
export function getExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Sanitize a filename to remove unsafe/special characters.
 * Retains alphanumerics, hyphens, underscores, dots, and spaces.
 * @param {string} name
 * @returns {string}
 */
export function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9.\-_ ]/gi, '_');
}

/**
 * Get MIME type based on file extension (e.g., "png" → "image/png").
 * @param {string} ext
 * @returns {string|null}
 */
export function getTargetMime(ext) {
  if (!ext) return null;
  return MIME_MAPPING[ext.toLowerCase()] || null;
}

/**
 * Determine if the file is an image based on MIME type.
 * @param {File} file
 * @returns {boolean}
 */
export function isImage(file) {
  return file?.type?.startsWith('image/');
}

/**
 * Check if the browser can encode to the given MIME type via Canvas.
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isFormatSupported(mimeType) {
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL(mimeType).startsWith(`data:${mimeType}`);
  } catch {
    return false;
  }
}
