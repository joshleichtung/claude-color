/**
 * Multi-suggestion system for generating palette variations
 *
 * Generates 3-5 related but distinct palette alternatives from a single request
 */

import { nanoid } from 'nanoid';
import { Color, ColorScheme, Palette, PaletteSuggestion, SuggestionSet } from '../types';
import { createColorFromHsl } from './conversions';
import { generatePalette } from './theory';

/**
 * Generate multiple palette suggestions with variations
 *
 * @param baseColor - Starting color for variations
 * @param scheme - Primary color scheme
 * @param count - Number of suggestions to generate (default: 5)
 * @returns Set of palette suggestions with descriptions
 *
 * @example
 * ```typescript
 * const base = createColorFromHex('#FF5733');
 * const suggestions = generateSuggestions(base, 'analogous', 5);
 * // Returns 5 variations: original, hue shifts, saturation variations, etc.
 * ```
 */
export function generateSuggestions(
  baseColor: Color,
  scheme: ColorScheme,
  count: number = 5
): SuggestionSet {
  if (count < 1 || count > 10) {
    throw new Error('Suggestion count must be between 1 and 10');
  }

  const suggestions: PaletteSuggestion[] = [];

  // Suggestion 1: Original request (primary suggestion)
  const originalPalette = createPalette(baseColor, scheme);
  suggestions.push({
    palette: originalPalette,
    description: `Original ${scheme} palette`,
    strategy: 'hue-shift',
    rank: 1,
  });

  if (count >= 2) {
    // Suggestion 2: Higher saturation
    const saturatedColor = adjustSaturation(baseColor, 15);
    const saturatedPalette = createPalette(saturatedColor, scheme);
    suggestions.push({
      palette: saturatedPalette,
      description: `Vibrant ${scheme} (higher saturation)`,
      strategy: 'saturation-variation',
      rank: 2,
    });
  }

  if (count >= 3) {
    // Suggestion 3: Muted/lower saturation
    const mutedColor = adjustSaturation(baseColor, -15);
    const mutedPalette = createPalette(mutedColor, scheme);
    suggestions.push({
      palette: mutedPalette,
      description: `Muted ${scheme} (softer tones)`,
      strategy: 'saturation-variation',
      rank: 3,
    });
  }

  if (count >= 4) {
    // Suggestion 4: Warmer (shift hue toward red/orange)
    const warmerColor = adjustHue(baseColor, -15);
    const warmerPalette = createPalette(warmerColor, scheme);
    suggestions.push({
      palette: warmerPalette,
      description: `Warm ${scheme} (warmer hues)`,
      strategy: 'hue-shift',
      rank: 4,
    });
  }

  if (count >= 5) {
    // Suggestion 5: Cooler (shift hue toward blue)
    const coolerColor = adjustHue(baseColor, 15);
    const coolerPalette = createPalette(coolerColor, scheme);
    suggestions.push({
      palette: coolerPalette,
      description: `Cool ${scheme} (cooler hues)`,
      strategy: 'hue-shift',
      rank: 5,
    });
  }

  if (count >= 6) {
    // Suggestion 6: Lighter
    const lighterColor = adjustLightness(baseColor, 10);
    const lighterPalette = createPalette(lighterColor, scheme);
    suggestions.push({
      palette: lighterPalette,
      description: `Light ${scheme} (brighter tones)`,
      strategy: 'lightness-variation',
      rank: 6,
    });
  }

  if (count >= 7) {
    // Suggestion 7: Darker
    const darkerColor = adjustLightness(baseColor, -10);
    const darkerPalette = createPalette(darkerColor, scheme);
    suggestions.push({
      palette: darkerPalette,
      description: `Dark ${scheme} (deeper tones)`,
      strategy: 'lightness-variation',
      rank: 7,
    });
  }

  if (count >= 8) {
    // Suggestion 8: Alternative scheme (if not random)
    if (scheme !== 'random') {
      const altScheme = getAlternativeScheme(scheme);
      const altPalette = createPalette(baseColor, altScheme);
      suggestions.push({
        palette: altPalette,
        description: `Alternative ${altScheme} scheme`,
        strategy: 'scheme-alternative',
        rank: 8,
      });
    } else {
      // For random, create another random with hue shift
      const shiftedColor = adjustHue(baseColor, 30);
      const shiftedPalette = createPalette(shiftedColor, 'random');
      suggestions.push({
        palette: shiftedPalette,
        description: `Shifted random palette`,
        strategy: 'hue-shift',
        rank: 8,
      });
    }
  }

  if (count >= 9) {
    // Suggestion 9: Hybrid - saturated + warm
    const hybridColor = adjustHue(adjustSaturation(baseColor, 10), -10);
    const hybridPalette = createPalette(hybridColor, scheme);
    suggestions.push({
      palette: hybridPalette,
      description: `Warm vibrant ${scheme} (hybrid)`,
      strategy: 'hybrid',
      rank: 9,
    });
  }

  if (count >= 10) {
    // Suggestion 10: Hybrid - muted + cool
    const hybridColor2 = adjustHue(adjustSaturation(baseColor, -10), 10);
    const hybridPalette2 = createPalette(hybridColor2, scheme);
    suggestions.push({
      palette: hybridPalette2,
      description: `Cool muted ${scheme} (hybrid)`,
      strategy: 'hybrid',
      rank: 10,
    });
  }

  return {
    suggestions: suggestions.slice(0, count),
    baseColor,
    requestedScheme: scheme,
    generatedAt: new Date(),
  };
}

/**
 * Create a palette with metadata
 */
function createPalette(baseColor: Color, scheme: ColorScheme): Palette {
  const colors = generatePalette(baseColor, scheme);
  return {
    id: nanoid(8),
    colors,
    scheme,
    metadata: {
      created: new Date(),
      generationMethod: 'scheme',
    },
  };
}

/**
 * Adjust saturation of a color
 */
function adjustSaturation(color: Color, delta: number): Color {
  const newS = Math.max(0, Math.min(100, color.hsl.s + delta));
  return createColorFromHsl({ ...color.hsl, s: newS });
}

/**
 * Adjust hue of a color
 */
function adjustHue(color: Color, delta: number): Color {
  let newH = color.hsl.h + delta;
  if (newH < 0) {
    newH += 360;
  }
  if (newH >= 360) {
    newH -= 360;
  }
  return createColorFromHsl({ ...color.hsl, h: newH });
}

/**
 * Adjust lightness of a color
 */
function adjustLightness(color: Color, delta: number): Color {
  const newL = Math.max(10, Math.min(90, color.hsl.l + delta));
  return createColorFromHsl({ ...color.hsl, l: newL });
}

/**
 * Get an alternative color scheme
 */
function getAlternativeScheme(scheme: ColorScheme): ColorScheme {
  const alternatives: Record<ColorScheme, ColorScheme> = {
    complementary: 'triadic',
    analogous: 'complementary',
    triadic: 'analogous',
    tetradic: 'complementary',
    monochromatic: 'analogous',
    random: 'analogous',
  };
  return alternatives[scheme] || 'analogous';
}
