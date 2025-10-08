/**
 * Tests for multi-suggestion system
 */

import { generateSuggestions } from '../../src/core/suggestions';
import { createColorFromHex } from '../../src/core/conversions';
import { ColorScheme } from '../../src/types';

describe('Multi-Suggestion System', () => {
  const baseColor = createColorFromHex('#FF5733'); // Orange-red

  describe('generateSuggestions', () => {
    it('should generate requested number of suggestions', () => {
      const result = generateSuggestions(baseColor, 'analogous', 3);
      expect(result.suggestions).toHaveLength(3);
    });

    it('should generate up to 10 suggestions', () => {
      const result = generateSuggestions(baseColor, 'analogous', 10);
      expect(result.suggestions).toHaveLength(10);
    });

    it('should throw error for invalid count', () => {
      expect(() => generateSuggestions(baseColor, 'analogous', 0)).toThrow(
        'Suggestion count must be between 1 and 10'
      );
      expect(() => generateSuggestions(baseColor, 'analogous', 11)).toThrow(
        'Suggestion count must be between 1 and 10'
      );
    });

    it('should default to 5 suggestions', () => {
      const result = generateSuggestions(baseColor, 'analogous');
      expect(result.suggestions).toHaveLength(5);
    });

    it('should include base color in suggestion set', () => {
      const result = generateSuggestions(baseColor, 'complementary');
      expect(result.baseColor).toEqual(baseColor);
    });

    it('should include requested scheme in suggestion set', () => {
      const result = generateSuggestions(baseColor, 'triadic');
      expect(result.requestedScheme).toBe('triadic');
    });

    it('should include generation timestamp', () => {
      const result = generateSuggestions(baseColor, 'analogous');
      expect(result.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Suggestion Rankings', () => {
    it('should rank suggestions from 1 to count', () => {
      const result = generateSuggestions(baseColor, 'analogous', 5);
      const ranks = result.suggestions.map(s => s.rank);
      expect(ranks).toEqual([1, 2, 3, 4, 5]);
    });

    it('should rank first suggestion as primary (rank 1)', () => {
      const result = generateSuggestions(baseColor, 'complementary');
      expect(result.suggestions[0]?.rank).toBe(1);
      expect(result.suggestions[0]?.description).toContain('Original');
    });
  });

  describe('Variation Strategies', () => {
    it('should use different strategies for variety', () => {
      const result = generateSuggestions(baseColor, 'analogous', 5);
      const strategies = result.suggestions.map(s => s.strategy);
      const uniqueStrategies = new Set(strategies);
      expect(uniqueStrategies.size).toBeGreaterThan(1); // More than one strategy used
    });

    it('should include hue-shift strategy', () => {
      const result = generateSuggestions(baseColor, 'complementary', 5);
      const hasHueShift = result.suggestions.some(s => s.strategy === 'hue-shift');
      expect(hasHueShift).toBe(true);
    });

    it('should include saturation-variation strategy', () => {
      const result = generateSuggestions(baseColor, 'analogous', 5);
      const hasSaturationVariation = result.suggestions.some(
        s => s.strategy === 'saturation-variation'
      );
      expect(hasSaturationVariation).toBe(true);
    });

    it('should include lightness-variation strategy when count >= 6', () => {
      const result = generateSuggestions(baseColor, 'triadic', 6);
      const hasLightnessVariation = result.suggestions.some(
        s => s.strategy === 'lightness-variation'
      );
      expect(hasLightnessVariation).toBe(true);
    });

    it('should include scheme-alternative strategy when count >= 8', () => {
      const result = generateSuggestions(baseColor, 'complementary', 8);
      const hasSchemeAlternative = result.suggestions.some(
        s => s.strategy === 'scheme-alternative'
      );
      expect(hasSchemeAlternative).toBe(true);
    });

    it('should include hybrid strategy when count >= 9', () => {
      const result = generateSuggestions(baseColor, 'analogous', 9);
      const hasHybrid = result.suggestions.some(s => s.strategy === 'hybrid');
      expect(hasHybrid).toBe(true);
    });
  });

  describe('Palette Variations', () => {
    it('should create valid palettes for each suggestion', () => {
      const result = generateSuggestions(baseColor, 'triadic', 5);
      result.suggestions.forEach(suggestion => {
        expect(suggestion.palette).toBeDefined();
        expect(suggestion.palette.id).toBeTruthy();
        expect(suggestion.palette.colors).toBeDefined();
        expect(suggestion.palette.colors.length).toBeGreaterThan(0);
      });
    });

    it('should generate unique palette IDs', () => {
      const result = generateSuggestions(baseColor, 'analogous', 5);
      const ids = result.suggestions.map(s => s.palette.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should create palettes with correct scheme', () => {
      const result = generateSuggestions(baseColor, 'complementary', 3);
      // First 3 suggestions should use the requested scheme (or alternative for scheme-alternative)
      result.suggestions.slice(0, 3).forEach(suggestion => {
        if (suggestion.strategy !== 'scheme-alternative') {
          expect(suggestion.palette.scheme).toBe('complementary');
        }
      });
    });
  });

  describe('Description Generation', () => {
    it('should provide descriptive labels for each suggestion', () => {
      const result = generateSuggestions(baseColor, 'analogous', 5);
      result.suggestions.forEach(suggestion => {
        expect(suggestion.description).toBeTruthy();
        expect(suggestion.description.length).toBeGreaterThan(0);
      });
    });

    it('should describe saturation variations', () => {
      const result = generateSuggestions(baseColor, 'triadic', 3);
      const saturationSuggestions = result.suggestions.filter(
        s => s.strategy === 'saturation-variation'
      );
      saturationSuggestions.forEach(suggestion => {
        expect(
          suggestion.description.toLowerCase().includes('vibrant') ||
            suggestion.description.toLowerCase().includes('muted') ||
            suggestion.description.toLowerCase().includes('saturation')
        ).toBe(true);
      });
    });

    it('should describe hue variations', () => {
      const result = generateSuggestions(baseColor, 'complementary', 5);
      const hueShiftSuggestions = result.suggestions.filter(s => s.strategy === 'hue-shift');
      const hasWarmOrCoolDescription = hueShiftSuggestions.some(
        s =>
          s.description.toLowerCase().includes('warm') ||
          s.description.toLowerCase().includes('cool')
      );
      expect(hasWarmOrCoolDescription).toBe(true);
    });
  });

  describe('Color Scheme Variations', () => {
    const schemes: ColorScheme[] = [
      'complementary',
      'analogous',
      'triadic',
      'tetradic',
      'monochromatic',
      'random',
    ];

    schemes.forEach(scheme => {
      it(`should generate suggestions for ${scheme} scheme`, () => {
        const result = generateSuggestions(baseColor, scheme, 5);
        expect(result.suggestions).toHaveLength(5);
        expect(result.requestedScheme).toBe(scheme);
      });
    });
  });

  describe('Alternative Scheme Selection', () => {
    it('should provide alternative scheme when count >= 8', () => {
      const result = generateSuggestions(baseColor, 'complementary', 8);
      const alternativeSuggestion = result.suggestions.find(
        s => s.strategy === 'scheme-alternative'
      );
      expect(alternativeSuggestion).toBeDefined();
      expect(alternativeSuggestion!.palette.scheme).not.toBe('complementary');
    });

    it('should handle random scheme alternative differently', () => {
      const result = generateSuggestions(baseColor, 'random', 8);
      // For random, 8th suggestion should still be created but may use hue-shift
      expect(result.suggestions).toHaveLength(8);
    });
  });

  describe('Performance', () => {
    it('should generate suggestions quickly (< 100ms for 5 suggestions)', () => {
      const start = Date.now();
      generateSuggestions(baseColor, 'analogous', 5);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should generate 10 suggestions quickly (< 200ms)', () => {
      const start = Date.now();
      generateSuggestions(baseColor, 'triadic', 10);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Color Adjustments', () => {
    it('should create different colors for hue variations', () => {
      const result = generateSuggestions(baseColor, 'complementary', 5);
      const originalHue = baseColor.hsl.h;
      const warmerSuggestion = result.suggestions.find(s =>
        s.description.toLowerCase().includes('warm')
      );
      const coolerSuggestion = result.suggestions.find(s =>
        s.description.toLowerCase().includes('cool')
      );

      if (warmerSuggestion && warmerSuggestion.palette.colors[0]) {
        const warmerHue = warmerSuggestion.palette.colors[0].hsl.h;
        expect(warmerHue).not.toBe(originalHue);
      }

      if (coolerSuggestion && coolerSuggestion.palette.colors[0]) {
        const coolerHue = coolerSuggestion.palette.colors[0].hsl.h;
        expect(coolerHue).not.toBe(originalHue);
      }
    });

    it('should create different saturation for saturation variations', () => {
      const result = generateSuggestions(baseColor, 'analogous', 3);
      const originalSat = baseColor.hsl.s;
      const vibrantSuggestion = result.suggestions.find(s =>
        s.description.toLowerCase().includes('vibrant')
      );
      const mutedSuggestion = result.suggestions.find(s =>
        s.description.toLowerCase().includes('muted')
      );

      if (vibrantSuggestion && vibrantSuggestion.palette.colors[0]) {
        const vibrantSat = vibrantSuggestion.palette.colors[0].hsl.s;
        expect(vibrantSat).toBeGreaterThanOrEqual(originalSat);
      }

      if (mutedSuggestion && mutedSuggestion.palette.colors[0]) {
        const mutedSat = mutedSuggestion.palette.colors[0].hsl.s;
        expect(mutedSat).toBeLessThanOrEqual(originalSat);
      }
    });
  });
});
