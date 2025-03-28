// src/utils/workers/convertWorker.js
import libheif from 'libheif-js';
import UTIF from 'utif';

self.onmessage = async ({ data }) => {
  try {
    const { buffer, fileType, targetMime, quality, maxDimension } = data;
    let blob;

    // --- Advanced conversion for HEIC ---
    if (fileType === 'image/heic' || fileType === 'image/heif') {
      const decoder = new libheif.HeifDecoder();
      const images = decoder.decode(buffer);
      if (!images?.length) throw new Error('No HEIC images found');
      const image = images[0]; // use the first image
      const width = image.get_width();
      const height = image.get_height();
      if (width > maxDimension || height > maxDimension) {
        throw new Error(`Image dimensions exceed ${maxDimension}px limit`);
      }
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const imageData = new ImageData(width, height);
      await new Promise((resolve, reject) => {
        image.display(imageData, (displayData) => {
          if (!displayData) return reject(new Error('HEIC rendering failed'));
          ctx.putImageData(imageData, 0, 0);
          resolve();
        });
      });
      blob = await canvas.convertToBlob({ type: targetMime, quality });
    }
    // --- Advanced conversion for TIFF ---
    else if (fileType === 'image/tiff' || fileType === 'image/tif') {
      const ifds = UTIF.decode(buffer);
      if (!ifds?.length) throw new Error('No TIFF pages found');
      ifds.forEach(ifd => UTIF.decodeImage(buffer, ifd));
      const page = ifds[0]; // use the first page
      const rgba = UTIF.toRGBA8(page);
      const width = page.width;
      const height = page.height;
      if (width > maxDimension || height > maxDimension) {
        throw new Error(`Image dimensions exceed ${maxDimension}px limit`);
      }
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const imageData = new ImageData(new Uint8ClampedArray(rgba), width, height);
      ctx.putImageData(imageData, 0, 0);
      blob = await canvas.convertToBlob({ type: targetMime, quality });
    }
    // --- Generic conversion for other image types ---
    else {
      const blobSource = new Blob([buffer], { type: fileType });
      const bitmap = await createImageBitmap(blobSource, {
        premultiplyAlpha: 'none',
        colorSpaceConversion: 'none'
      });
      if (bitmap.width > maxDimension || bitmap.height > maxDimension) {
        throw new Error(`Image dimensions exceed ${maxDimension}px limit`);
      }
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      blob = await canvas.convertToBlob({ type: targetMime, quality });
    }
    self.postMessage({ blob });
  } catch (error) {
    self.postMessage({
      error: error.message.includes('security') ? 'Invalid file content' : error.message
    });
  }
};
