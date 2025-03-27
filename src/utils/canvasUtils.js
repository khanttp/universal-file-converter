import {getQuality} from './constants';


export async function drawToCanvas(bitmap) {
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return canvas;
}

export function cleanupCanvas(canvas) {
  canvas.width = 1;
  canvas.height = 1;
  canvas.remove();
}

export function canvasToBlob(canvas, mime, quality = 1.0) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Blob conversion failed'))),
      mime,
      quality
    );
  });
}
