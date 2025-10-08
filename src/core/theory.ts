/**
 * Color theory algorithms for generating harmonious color palettes
 *
 * Implements various color harmony rules based on color wheel relationships
 */

import { Color, ColorScheme } from '../types';
import { createColorFromHsl } from './conversions';

/**
 * Normalize hue to 0-360 range
 *
 * @param hue - Hue value in degrees
 * @returns Normalized hue between 0-360
 */
function normalizeHue(hue: number): number {
  let normalized = hue % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Generate a complementary color palette
 *
 * Creates two colors opposite on the color wheel (180° apart)
 *
 * @param baseColor - Base color to generate complement from
 * @returns Array of 2 complementary colors
 *
 * @example
 * ```typescript
 * const colors = generateComplementary({ hex: '#FF0000', rgb: {...}, hsl: {...} });
 * // Returns [original red, complementary cyan]
 * ```
 */
export function generateComplementary(baseColor: Color): Color[] {
  const baseHsl = baseColor.hsl;
  const complementHue = normalizeHue(baseHsl.h + 180);

  const complement = createColorFromHsl({
    h: complementHue,
    s: baseHsl.s,
    l: baseHsl.l,
  });

  return [baseColor, complement];
}

/**
 * Generate an analogous color palette
 *
 * Creates colors adjacent on the color wheel (±30° from base)
 *
 * @param baseColor - Base color to generate analogous colors from
 * @param count - Number of colors to generate (default: 3)
 * @returns Array of analogous colors
 *
 * @example
 * ```typescript
 * const colors = generateAnalogous({ hex: '#FF0000', rgb: {...}, hsl: {...} }, 5);
 * // Returns 5 colors spread ±30° from red
 * ```
 */
export function generateAnalogous(baseColor: Color, count: number = 3): Color[] {
  const baseHsl = baseColor.hsl;
  const colors: Color[] = [baseColor];

  // Calculate step size based on count
  // For 3 colors: -30°, base, +30°
  // For 5 colors: -30°, -15°, base, +15°, +30°
  const angleRange = 30;
  const step = count > 1 ? (angleRange * 2) / (count - 1) : 0;
  const startAngle = -angleRange;

  for (let i = 0; i < count; i++) {
    if (i === Math.floor(count / 2)) {
      // Skip the middle position (base color already added)
      continue;
    }

    const angle = startAngle + i * step;
    const hue = normalizeHue(baseHsl.h + angle);

    colors.push(
      createColorFromHsl({
        h: hue,
        s: baseHsl.s,
        l: baseHsl.l,
      })
    );
  }

  return colors.sort((a, b) => a.hsl.h - b.hsl.h);
}

/**
 * Generate a triadic color palette
 *
 * Creates three colors evenly spaced on the color wheel (120° apart)
 *
 * @param baseColor - Base color to generate triadic colors from
 * @returns Array of 3 triadic colors
 *
 * @example
 * ```typescript
 * const colors = generateTriadic({ hex: '#FF0000', rgb: {...}, hsl: {...} });
 * // Returns [red, green, blue] - primary triad
 * ```
 */
export function generateTriadic(baseColor: Color): Color[] {
  const baseHsl = baseColor.hsl;

  const color2 = createColorFromHsl({
    h: normalizeHue(baseHsl.h + 120),
    s: baseHsl.s,
    l: baseHsl.l,
  });

  const color3 = createColorFromHsl({
    h: normalizeHue(baseHsl.h + 240),
    s: baseHsl.s,
    l: baseHsl.l,
  });

  return [baseColor, color2, color3];
}

/**
 * Generate a tetradic (rectangular) color palette
 *
 * Creates four colors forming a rectangle on the color wheel
 * Two complementary pairs
 *
 * @param baseColor - Base color to generate tetradic colors from
 * @param angle - Angle to the second color (default: 30°)
 * @returns Array of 4 tetradic colors
 *
 * @example
 * ```typescript
 * const colors = generateTetradic({ hex: '#FF0000', rgb: {...}, hsl: {...} });
 * // Returns 4 colors forming a rectangle on color wheel
 * ```
 */
export function generateTetradic(baseColor: Color, angle: number = 30): Color[] {
  const baseHsl = baseColor.hsl;

  const color2 = createColorFromHsl({
    h: normalizeHue(baseHsl.h + angle),
    s: baseHsl.s,
    l: baseHsl.l,
  });

  const color3 = createColorFromHsl({
    h: normalizeHue(baseHsl.h + 180),
    s: baseHsl.s,
    l: baseHsl.l,
  });

  const color4 = createColorFromHsl({
    h: normalizeHue(baseHsl.h + 180 + angle),
    s: baseHsl.s,
    l: baseHsl.l,
  });

  return [baseColor, color2, color3, color4];
}

/**
 * Generate a monochromatic color palette
 *
 * Creates variations of a single hue by varying lightness
 *
 * @param baseColor - Base color to generate monochromatic variations from
 * @param count - Number of colors to generate (default: 5)
 * @returns Array of monochromatic colors
 *
 * @example
 * ```typescript
 * const colors = generateMonochromatic({ hex: '#FF0000', rgb: {...}, hsl: {...} }, 5);
 * // Returns 5 shades of red from dark to light
 * ```
 */
export function generateMonochromatic(baseColor: Color, count: number = 5): Color[] {
  const baseHsl = baseColor.hsl;
  const colors: Color[] = [];

  // Generate lightness values from dark to light
  // Avoid pure black (0) and pure white (100) for better usability
  const minLightness = 15;
  const maxLightness = 85;
  const step = (maxLightness - minLightness) / (count - 1);

  for (let i = 0; i < count; i++) {
    const lightness = minLightness + i * step;

    colors.push(
      createColorFromHsl({
        h: baseHsl.h,
        s: baseHsl.s,
        l: Math.round(lightness),
      })
    );
  }

  return colors;
}

/**
 * Generate a random color
 *
 * @returns Random color with full saturation and medium lightness
 */
export function generateRandomColor(): Color {
  return createColorFromHsl({
    h: Math.floor(Math.random() * 360),
    s: 70 + Math.floor(Math.random() * 30), // 70-100% saturation
    l: 40 + Math.floor(Math.random() * 30), // 40-70% lightness
  });
}

/**
 * Generate a random color palette
 *
 * @param count - Number of colors to generate (default: 5)
 * @returns Array of random colors
 */
export function generateRandom(count: number = 5): Color[] {
  const colors: Color[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(generateRandomColor());
  }
  return colors;
}

/**
 * Generate a color palette based on a color scheme
 *
 * @param baseColor - Base color to generate palette from
 * @param scheme - Color scheme to use
 * @param count - Number of colors to generate (used for analogous, monochromatic, random)
 * @returns Array of colors following the specified scheme
 *
 * @example
 * ```typescript
 * const colors = generatePalette(baseColor, 'complementary');
 * const colors = generatePalette(baseColor, 'analogous', 5);
 * ```
 */
export function generatePalette(
  baseColor: Color,
  scheme: ColorScheme,
  count: number = 5
): Color[] {
  switch (scheme) {
    case 'complementary':
      return generateComplementary(baseColor);
    case 'analogous':
      return generateAnalogous(baseColor, count);
    case 'triadic':
      return generateTriadic(baseColor);
    case 'tetradic':
      return generateTetradic(baseColor);
    case 'monochromatic':
      return generateMonochromatic(baseColor, count);
    case 'random':
      return generateRandom(count);
    default:
      throw new Error(`Unknown color scheme: ${String(scheme)}`);
  }
}
