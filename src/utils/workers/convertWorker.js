self.onmessage = async ({ data }) => {
  try {
    const { buffer, fileType, targetMime, quality, maxDimension } = data;
    // Reconstruct the file Blob from the transferred ArrayBuffer.
    const blob = new Blob([buffer], { type: fileType });
    const bitmap = await createImageBitmap(blob, {
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

    const resultBlob = await canvas.convertToBlob({
      type: targetMime,
      quality: quality
    });

    self.postMessage({ blob: resultBlob });
  } catch (error) {
    self.postMessage({
      error: error.message.includes('security')
        ? 'Invalid file content'
        : error.message
    });
  }
};
