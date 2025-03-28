// src/utils/converters/convertSVG.js
'use strict';

import { Canvg } from 'canvg';
import DOMPurify from 'dompurify';
import { canvasToBlob, cleanupCanvas } from '../canvasUtils.js';
import { getQuality } from '../constants.js';
import { sanitizeFileName } from '../formatUtils.js';

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 150;

function extractDimensions(svgEl) {
  let width = parseInt(svgEl.getAttribute('width')) || DEFAULT_WIDTH;
  let height = parseInt(svgEl.getAttribute('height')) || DEFAULT_HEIGHT;
  const viewBox = svgEl.getAttribute('viewBox');
  if (viewBox) {
    const [, , w, h] = viewBox.split(/\s+|,/).map(Number);
    if (!isNaN(w)) width = w;
    if (!isNaN(h)) height = h;
  }
  return { width, height };
}

export default async function convertSVG(file, targetMime, targetFormat) {
  const svgText = await file.text();
  // Sanitize SVG to mitigate XSS risks.
  const cleanSVG = DOMPurify.sanitize(svgText);
  const canvas = document.createElement('canvas');

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanSVG, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) throw new Error('Invalid SVG structure');
    const { width, height } = extractDimensions(svgEl);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const v = await Canvg.fromString(ctx, cleanSVG);
    await v.render();
    const blob = await canvasToBlob(canvas, targetMime, getQuality(targetMime));
    return {
      file: blob,
      newFileName: sanitizeFileName(file.name.replace(/\.svg$/i, '')) + '.' + targetFormat
    };
  } catch (error) {
    throw new Error(`SVG conversion failed: ${error.message}`);
  } finally {
    cleanupCanvas(canvas);
  }
}
