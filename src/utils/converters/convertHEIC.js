// src/utils/converters/convertHEIC.js
'use strict';

import libheif from 'libheif-js';
import { canvasToBlob, cleanupCanvas } from '../canvasUtils.js';
import { getQuality } from '../constants.js';
import { sanitizeFileName } from '../formatUtils.js';

export default async function convertHEIC(file, targetMime, targetFormat, imageIndex = 0) {
  const buffer = await file.arrayBuffer();
  const canvas = document.createElement('canvas');

  try {
    const decoder = new libheif.HeifDecoder();
    const images = decoder.decode(buffer);
    if (!images?.length) throw new Error('No HEIC images found');
    const image = images[imageIndex];
    const width = image.get_width();
    const height = image.get_height();
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid image dimensions');
    }
    const imageData = new ImageData(width, height);
    await new Promise((resolve, reject) => {
      image.display(imageData, (displayData) => {
        if (!displayData) return reject(new Error('HEIC rendering failed'));
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        resolve();
      });
    });
    const blob = await canvasToBlob(canvas, targetMime, getQuality(targetMime));
    return {
      file: blob,
      newFileName: sanitizeFileName(file.name.replace(/\.heic$/i, '')) + `_${imageIndex}.${targetFormat}`
    };
  } catch (error) {
    throw new Error(`HEIC conversion failed: ${error.message}`);
  } finally {
    cleanupCanvas(canvas);
  }
}
