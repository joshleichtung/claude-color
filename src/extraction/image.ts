/**
 * Image color extraction using Sharp and node-vibrant
 *
 * Extracts dominant colors from image files by analyzing
 * them with color extraction algorithms.
 */

import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { Vibrant } from 'node-vibrant/node';
import { createColorFromHex } from '../core/conversions';
import { Palette, Color } from '../types';
import { nanoid } from 'nanoid';
import path from 'path';

/**
 * Supported image formats
 */
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];

/**
 * Extract colors from an image file
 *
 * @param imagePath - Path to image file
 * @returns Palette with extracted colors and metadata
 */
export async function extractFromImage(imagePath: string): Promise<Palette> {
  // Validate file exists
  try {
    await access(imagePath, constants.R_OK);
  } catch {
    throw new Error(`Cannot read image file: ${imagePath}`);
  }

  // Validate file format
  const ext = path.extname(imagePath).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(ext)) {
    throw new Error(
      `Unsupported image format: ${ext}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
    );
  }

  // Read image file
  const imageBuffer = await readFile(imagePath);

  // Extract colors using node-vibrant
  const vibrant = new Vibrant(imageBuffer);
  const palette = await vibrant.getPalette();

  // Convert vibrant swatches to our Color format
  const colors: Color[] = [];
  const swatchNames = ['Vibrant', 'DarkVibrant', 'LightVibrant', 'Muted', 'DarkMuted'] as const;

  for (const name of swatchNames) {
    const swatch = palette[name];
    if (swatch) {
      colors.push(createColorFromHex(swatch.hex));
    }
  }

  // If we don't have 5 colors yet, add LightMuted if available
  if (colors.length < 5 && palette.LightMuted) {
    colors.push(createColorFromHex(palette.LightMuted.hex));
  }

  // Ensure we have exactly 5 colors (pad with variations if needed)
  while (colors.length < 5 && colors.length > 0) {
    // Duplicate the first color as a fallback
    const firstColor = colors[0];
    if (firstColor) {
      colors.push(firstColor);
    } else {
      break;
    }
  }

  // If we still don't have any colors, throw an error
  if (colors.length === 0) {
    throw new Error('No colors could be extracted from the image');
  }

  // Limit to 5 colors
  const finalColors = colors.slice(0, 5);

  return {
    id: nanoid(),
    colors: finalColors,
    scheme: 'random', // Extracted colors don't follow a specific scheme
    metadata: {
      created: new Date(),
      generationMethod: 'image',
      sourceImage: imagePath,
    },
  };
}

/**
 * Validate image file path and format
 *
 * @param imagePath - Path to image file
 * @returns True if valid image path
 */
export async function validateImagePath(imagePath: string): Promise<boolean> {
  // Check format
  const ext = path.extname(imagePath).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(ext)) {
    return false;
  }

  // Check file exists and is readable
  try {
    await access(imagePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of supported image formats
 */
export function getSupportedFormats(): string[] {
  return [...SUPPORTED_FORMATS];
}
