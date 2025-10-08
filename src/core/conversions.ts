/**
 * Color space conversion utilities
 *
 * Provides accurate conversions between RGB, HSL, and HEX color formats
 */

import { RGB, HSL, Color } from '../types';
import { InvalidColorError, ColorRangeError } from '../utils/errors';

/**
 * Convert HEX color string to RGB
 *
 * @param hex - HEX color string (#RRGGBB or #RGB)
 * @returns RGB color object
 * @throws {InvalidColorError} If hex format is invalid
 *
 * @example
 * ```typescript
 * hexToRgb('#FF0000') // { r: 255, g: 0, b: 0 }
 * hexToRgb('#F00')    // { r: 255, g: 0, b: 0 }
 * ```
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleaned = hex.replace(/^#/, '');

  // Validate hex format
  if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleaned)) {
    throw new InvalidColorError(hex, '#RRGGBB or #RGB');
  }

  // Expand shorthand (e.g., #F00 -> #FF0000)
  const fullHex =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map(char => char + char)
          .join('')
      : cleaned;

  // Parse RGB values
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Convert RGB to HEX color string
 *
 * @param rgb - RGB color object
 * @returns HEX color string (#RRGGBB)
 * @throws {ColorRangeError} If RGB values are out of range (0-255)
 *
 * @example
 * ```typescript
 * rgbToHex({ r: 255, g: 0, b: 0 }) // '#FF0000'
 * ```
 */
export function rgbToHex(rgb: RGB): string {
  // Round values first
  const r = Math.round(rgb.r);
  const g = Math.round(rgb.g);
  const b = Math.round(rgb.b);

  // Validate ranges after rounding
  if (r < 0 || r > 255) {
    throw new ColorRangeError('r', r, 0, 255);
  }
  if (g < 0 || g > 255) {
    throw new ColorRangeError('g', g, 0, 255);
  }
  if (b < 0 || b > 255) {
    throw new ColorRangeError('b', b, 0, 255);
  }

  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 *
 * @param rgb - RGB color object
 * @returns HSL color object
 *
 * @example
 * ```typescript
 * rgbToHsl({ r: 255, g: 0, b: 0 }) // { h: 0, s: 100, l: 50 }
 * ```
 */
export function rgbToHsl(rgb: RGB): HSL {
  // Normalize RGB values to 0-1
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    // Calculate saturation
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    // Calculate hue
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 *
 * @param hsl - HSL color object
 * @returns RGB color object
 *
 * @example
 * ```typescript
 * hslToRgb({ h: 0, s: 100, l: 50 }) // { r: 255, g: 0, b: 0 }
 * ```
 */
export function hslToRgb(hsl: HSL): RGB {
  // Normalize HSL values
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    // Achromatic (gray)
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert HEX to HSL
 *
 * @param hex - HEX color string
 * @returns HSL color object
 *
 * @example
 * ```typescript
 * hexToHsl('#FF0000') // { h: 0, s: 100, l: 50 }
 * ```
 */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Convert HSL to HEX
 *
 * @param hsl - HSL color object
 * @returns HEX color string
 *
 * @example
 * ```typescript
 * hslToHex({ h: 0, s: 100, l: 50 }) // '#FF0000'
 * ```
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Create a complete Color object from HEX string
 *
 * @param hex - HEX color string
 * @returns Complete Color object with all formats
 *
 * @example
 * ```typescript
 * createColorFromHex('#FF0000')
 * // {
 * //   hex: '#FF0000',
 * //   rgb: { r: 255, g: 0, b: 0 },
 * //   hsl: { h: 0, s: 100, l: 50 }
 * // }
 * ```
 */
export function createColorFromHex(hex: string): Color {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const normalizedHex = rgbToHex(rgb); // Normalize to uppercase 6-digit format

  return {
    hex: normalizedHex,
    rgb,
    hsl,
  };
}

/**
 * Create a complete Color object from RGB
 *
 * @param rgb - RGB color object
 * @returns Complete Color object with all formats
 */
export function createColorFromRgb(rgb: RGB): Color {
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);

  return {
    hex,
    rgb,
    hsl,
  };
}

/**
 * Create a complete Color object from HSL
 *
 * @param hsl - HSL color object
 * @returns Complete Color object with all formats
 */
export function createColorFromHsl(hsl: HSL): Color {
  const rgb = hslToRgb(hsl);
  const hex = rgbToHex(rgb);

  return {
    hex,
    rgb,
    hsl,
  };
}
