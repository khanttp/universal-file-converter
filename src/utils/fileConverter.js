// Entry Point
import { convertSVG, convertHEIC, convertTIFF } from './converters';
import workerPool from './workers/convertWorkerPool';
import {
  MIME_MAPPING,
  MAX_FILE_SIZE,
  MAX_DIMENSION,
  getQuality
} from './constants';

import {
  getExtension,
  sanitizeFileName,
  isImage,
  isFormatSupported
} from './formatUtils';

import { convertInMainThread } from './convertInMainThread';

export async function convertFile(file, targetFormat) {
  try {
    const currentExt = getExtension(file.name);
    const targetLower = targetFormat.toLowerCase();

    if (currentExt === targetLower && MIME_MAPPING[currentExt] === file.type) {
      return { file, newFileName: file.name };
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    const targetMime = MIME_MAPPING[targetLower];
    if (!targetMime) throw new Error(`Unsupported format: ${targetFormat}`);

    // Advanced formats
    if (currentExt === 'svg') {
      return await convertSVG(file, targetMime, targetFormat);
    }
    if (currentExt === 'heic') {
      return await convertHEIC(file, targetMime, targetFormat);
    }
    if (['tif', 'tiff'].includes(currentExt)) {
      return await convertTIFF(file, targetMime, targetFormat);
    }

    // Non-images fallback
    if (!isImage(file)) {
      throw new Error(`Unsupported non-image file: ${file.type}`);
    }

    if (!isFormatSupported(targetMime)) {
      throw new Error(`Browser doesn't support ${targetFormat} encoding`);
    }

    if (typeof OffscreenCanvas !== 'undefined') {
      const buffer = await file.arrayBuffer();
      const taskData = {
        buffer,
        fileType: file.type,
        targetMime,
        quality: getQuality(targetMime),
        maxDimension: MAX_DIMENSION,
      };

      const blob = await workerPool.runTask(taskData);
      return {
        file: blob,
        newFileName: file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat,
      };
    }

    return convertInMainThread(file, targetMime, targetFormat);
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}

export async function converter(files, targetFormat, onProgress = () => { }) {
  const concurrencyLimit = 4;
  const successes = [];
  const failures = [];
  let completed = 0;
  let index = 0;

  async function worker() {
    while (index < files.length) {
      const currentIndex = index++;
      const file = files[currentIndex];
      try {
        const result = await convertFile(file, targetFormat);
        successes.push({ file, result });
      } catch (error) {
        failures.push({ file, error });
      } finally {
        completed++;
        onProgress(completed, files.length, file.name);
      }
    }
  }

  const workers = Array.from({ length: concurrencyLimit }, () => worker());
  await Promise.all(workers);
  return { successes, failures };
}
