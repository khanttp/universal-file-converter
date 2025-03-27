import { MAX_DIMENSION } from './constants.js';
import {getQuality} from './constants';
import { drawToCanvas, canvasToBlob } from './canvasUtils.js';

export async function convertInMainThread(file, targetMime, targetFormat) {
  try {
    const bitmap = await createImageBitmap(file, {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none'
    });

    if (bitmap.width > MAX_DIMENSION || bitmap.height > MAX_DIMENSION) {
      bitmap.close();
      throw new Error(`Image dimensions exceed ${MAX_DIMENSION}px limit`);
    }

    const canvas = await drawToCanvas(bitmap);
    const blob = await canvasToBlob(canvas, targetMime, getQuality(targetMime));
    canvas.width = 0;
    canvas.height = 0;

    return {
      file: blob,
      newFileName: file.name.replace(/\.[^/.]+$/, "") + "." + targetFormat
    };
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}
