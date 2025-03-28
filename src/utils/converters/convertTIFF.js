// src/utils/converters/convertTIFF.js
'use strict';

import UTIF from 'utif';
import { canvasToBlob, cleanupCanvas } from '../canvasUtils.js';
import { getQuality } from '../constants.js';
import { sanitizeFileName } from '../formatUtils.js';

export default async function convertTIFF(file, targetMime, targetFormat, pageIndex = 0) {
  const buffer = await file.arrayBuffer();
  const canvas = document.createElement('canvas');

  try {
    const ifds = UTIF.decode(buffer);
    if (!ifds?.length) throw new Error('No TIFF pages found');
    ifds.forEach(ifd => UTIF.decodeImage(buffer, ifd));
    const page = ifds[pageIndex];
    if (!page) throw new Error('Requested TIFF page not found');
    const rgba = UTIF.toRGBA8(page);
    const width = page.width;
    const height = page.height;
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid image dimensions');
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(rgba);
    ctx.putImageData(imageData, 0, 0);
    const blob = await canvasToBlob(canvas, targetMime, getQuality(targetMime));
    return {
      file: blob,
      newFileName: sanitizeFileName(file.name.replace(/\.(tiff|tif)$/i, '')) + `_page${pageIndex}.${targetFormat}`
    };
  } catch (error) {
    throw new Error(`TIFF conversion failed: ${error.message}`);
  } finally {
    cleanupCanvas(canvas);
  }
}
