// File: src/utils/advancedConversions.js
// This module contains advanced conversion functions to convert SVG, HEIC, and TIFF files
// to common raster formats (PNG, JPEG, etc.) using dedicated libraries and the Canvas API.
// Each function reads the input file, renders or decodes it, and then exports it as a Blob.

import { Canvg } from 'canvg';
import libheif from 'libheif-js';
import UTIF from 'utif';
import DOMPurify from 'dompurify'; // For SVG sanitization
import {getQuality} from './constants';

// Supported MIME types for validation
const VALID_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

// Helper: Clean up unused canvases to prevent memory leaks
function cleanupCanvas(canvas) {
  canvas.width = 1;
  canvas.height = 1;
  canvas.remove();
}

// Helper: Validate target MIME type
function validateMimeType(mime) {
  if (!VALID_MIMES.includes(mime)) {
    throw new Error(`Unsupported MIME type: ${mime}`);
  }
}

// --- SVG Conversion ---
export async function convertSVG(file, targetMime, targetFormat) {
  validateMimeType(targetMime);
  const svgText = await file.text();
  const cleanSVG = DOMPurify.sanitize(svgText); // XSS protection
  const canvas = document.createElement('canvas');
  let width = 300, height = 150;

  try {
    // Parse SVG dimensions safely
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanSVG, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (svgEl) {
      width = parseInt(svgEl.getAttribute('width')) || width;
      height = parseInt(svgEl.getAttribute('height')) || height;
      const viewBox = svgEl.getAttribute('viewBox');
      if (viewBox) {
        const [,, w, h] = viewBox.split(/\s+|,/).map(Number);
        if (!isNaN(w)) width = w;
        if (!isNaN(h)) height = h;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Render with Canvg
    const v = await Canvg.fromString(ctx, cleanSVG);
    await v.render();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, targetMime, getQuality(targetMime))
    );

    if (!blob) throw new Error('Blob generation failed');
    return {
      file: blob,
      newFileName: file.name.replace(/\.svg$/i, '') + '.' + targetFormat
    };
  } catch (error) {
    throw new Error(`SVG conversion failed: ${error.message}`);
  } finally {
    cleanupCanvas(canvas); // Prevent memory leaks
  }
}

// --- HEIC Conversion ---
export async function convertHEIC(file, targetMime, targetFormat, imageIndex = 0) {
  validateMimeType(targetMime);
  const buffer = await file.arrayBuffer();
  const canvas = document.createElement('canvas');

  try {
    const decoder = new libheif.HeifDecoder();
    const data = decoder.decode(buffer);
    if (!data?.length) throw new Error('No HEIC images found');

    const heifImage = data[imageIndex];
    const width = heifImage.get_width();
    const height = heifImage.get_height();

    // Create ImageData from HEIC
    const imageData = new ImageData(width, height);
    await new Promise((resolve, reject) => {
      heifImage.display(imageData, (displayData) => {
        if (!displayData) {
          reject(new Error('HEIC display failed'));
          return;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').putImageData(imageData, 0, 0);
        resolve();
      });
    });

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, targetMime, getQuality(targetMime))
    );

    if (!blob) throw new Error('Blob generation failed');
    return {
      file: blob,
      newFileName: `${file.name.replace(/\.heic$/i, '')}_${imageIndex}.${targetFormat}`
    };
  } catch (error) {
    throw new Error(`HEIC conversion failed (image ${imageIndex}): ${error.message}`);
  } finally {
    cleanupCanvas(canvas);
  }
}

// --- TIFF Conversion ---
export async function convertTIFF(file, targetMime, targetFormat, pageIndex = 0) {
  validateMimeType(targetMime);
  const buffer = await file.arrayBuffer();
  const canvas = document.createElement('canvas');

  try {
    const ifds = UTIF.decode(buffer);
    if (!ifds?.length) throw new Error('No TIFF pages found');

    // Decode all pages using the updated API
    ifds.forEach(ifd => UTIF.decodeImage(buffer, ifd));

    const page = ifds[pageIndex]; // Support multi-page TIFF
    const rgba = UTIF.toRGBA8(page);
    canvas.width = page.width;
    canvas.height = page.height;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(page.width, page.height);
    imageData.data.set(rgba);
    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, targetMime, getQuality(targetMime))
    );

    if (!blob) throw new Error('Blob generation failed');
    return {
      file: blob,
      newFileName: `${file.name.replace(/\.(tiff|tif)$/i, '')}_page${pageIndex}.${targetFormat}`
    };
  } catch (error) {
    throw new Error(`TIFF conversion failed (page ${pageIndex}): ${error.message}`);
  } finally {
    cleanupCanvas(canvas);
  }
}
