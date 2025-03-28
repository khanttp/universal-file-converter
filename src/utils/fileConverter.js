// src/utils/fileConverter.js
import { convertSVG } from './converters';
import workerPool from './workers/convertWorkerPool.js';

import {
  MIME_MAPPING,
  MAX_FILE_SIZE,
  MAX_DIMENSION,
  getQuality,
  CHUNK_DELAY,
  CHUNK_SIZE,
} from './constants.js';

import {
  getExtension,
  sanitizeFileName,
  isImage,
  isFormatSupported
} from './formatUtils.js';
import { convertInMainThread } from './convertInMainThread.js';


/**
 * Converts a single file to the specified format.
 * Offloads conversion to a web worker if supported.
 */
export async function convertFile(file, targetFormat, signal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const currentExt = getExtension(file.name);
  const targetLower = targetFormat.toLowerCase();
  const targetMime = MIME_MAPPING[targetLower];

  // Return file as-is if already in target format.
  if (currentExt === targetLower && MIME_MAPPING[currentExt] === file.type) {
    return { file, newFileName: file.name };
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
  if (!targetMime) throw new Error(`Unsupported format: ${targetFormat}`);

  // For SVG, keep conversion on the main thread (uses DOM APIs).
  if (currentExt === 'svg') {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return await convertSVG(file, targetMime, targetFormat);
  }

  // Use the worker pool if OffscreenCanvas is supported.
  if (OffscreenCanvas !== 'undefined') {
    const buffer = await file.arrayBuffer();
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const taskData = {
      buffer,
      fileType: file.type,
      targetMime,
      quality: getQuality(targetMime),
      maxDimension: MAX_DIMENSION,
    };
    const blob = await workerPool.runTask(taskData);
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return {
      file: blob,
      newFileName: sanitizeFileName(file.name.replace(/\.[^/.]+$/, '')) + '.' + targetFormat
    };
  }

  // Fallback: use dynamic import for advanced conversions when OffscreenCanvas isn’t available.
  if (currentExt === 'heic') {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const { default: convertHEIC } = await import('./converters/convertHEIC.js');
    return await convertHEIC(file, targetMime, targetFormat);
  }
  if (['tif', 'tiff'].includes(currentExt)) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const { default: convertTIFF } = await import('./converters/convertTIFF.js');
    return await convertTIFF(file, targetMime, targetFormat);
  }

  // Fallback for other images.
  if (!isImage(file)) {
    throw new Error(`Unsupported non-image file: ${file.type}`);
  }
  if (!isFormatSupported(targetMime)) {
    throw new Error(`Browser doesn't support ${targetFormat} encoding`);
  }
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  return await convertInMainThread(file, targetMime, targetFormat, signal);
}

/**
 * Converts multiple files in chunks with delays so that the UI remains responsive.
 */
export async function converter(files, targetFormat, onProgress = () => { }, signal) {
  const successes = [];
  const failures = [];
  let completed = 0;

  for (let i = 0; i < files.length; i += CHUNK_SIZE) {
    if (signal?.aborted) break;
    const chunk = files.slice(i, i + CHUNK_SIZE);
    const chunkPromises = chunk.map(async (file) => {
      try {
        const result = await convertFile(file, targetFormat, signal);
        if (signal?.aborted) return;
        successes.push({ file, result });
      } catch (error) {
        if (!signal?.aborted) failures.push({ file, error });
      } finally {
        completed++;
        requestAnimationFrame(() => {
          onProgress(completed, files.length, file?.name || '');
        });
      }
    });
    await Promise.all(chunkPromises);
    if (i + CHUNK_SIZE < files.length && !signal?.aborted) {
      await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY));
    }
  }
  return { successes, failures };
}
