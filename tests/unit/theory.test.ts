/**
 * Tests for color theory algorithms
 */

import {
  generateComplementary,
  generateAnalogous,
  generateTriadic,
  generateTetradic,
  generateMonochromatic,
  generateRandom,
  generateRandomColor,
  generatePalette,
} from '../../src/core/theory';
import { createColorFromHex } from '../../src/core/conversions';

describe('Color Theory Algorithms', () => {
  describe('generateComplementary', () => {
    it('should generate complementary colors 180° apart', () => {
      const baseColor = createColorFromHex('#FF0000'); // Red, hue: 0
      const colors = generateComplementary(baseColor);

      expect(colors).toHaveLength(2);
      expect(colors[0]).toBe(baseColor);
      expect(colors[1]!.hsl.h).toBe(180); // Cyan
      expect(colors[1]!.hsl.s).toBe(baseColor.hsl.s);
      expect(colors[1]!.hsl.l).toBe(baseColor.hsl.l);
    });

    it('should handle hue wrap-around', () => {
      const baseColor = createColorFromHex('#8000FF'); // Purple, hue: 270
      const colors = generateComplementary(baseColor);

      expect(colors[1]!.hsl.h).toBe(90); // Yellow-green (270 + 180 = 450 % 360 = 90)
    });

    it('should preserve saturation and lightness', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateComplementary(baseColor);

      expect(colors[1]!.hsl.s).toBe(baseColor.hsl.s);
      expect(colors[1]!.hsl.l).toBe(baseColor.hsl.l);
    });
  });

  describe('generateAnalogous', () => {
    it('should generate 3 analogous colors by default', () => {
      const baseColor = createColorFromHex('#FF0000'); // Red, hue: 0
      const colors = generateAnalogous(baseColor);

      expect(colors).toHaveLength(3);
      // Should be sorted by hue
      expect(colors[0]!.hsl.h).toBeLessThan(colors[1]!.hsl.h);
      expect(colors[1]!.hsl.h).toBeLessThan(colors[2]!.hsl.h);
    });

    it('should generate specified number of colors', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateAnalogous(baseColor, 5);

      expect(colors).toHaveLength(5);
    });

    it('should spread colors within ±30° range', () => {
      const baseColor = createColorFromHex('#FF0000'); // Hue: 0
      const colors = generateAnalogous(baseColor, 5);

      // All colors should be within 30° of base
      colors.forEach(color => {
        const hueDiff = Math.abs(color.hsl.h - baseColor.hsl.h);
        // Account for wrap-around (e.g., 350° is 10° from 0°)
        const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
        expect(normalizedDiff).toBeLessThanOrEqual(30);
      });
    });

    it('should preserve saturation and lightness', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateAnalogous(baseColor);

      colors.forEach(color => {
        expect(color.hsl.s).toBe(baseColor.hsl.s);
        expect(color.hsl.l).toBe(baseColor.hsl.l);
      });
    });

    it('should include base color in palette', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateAnalogous(baseColor);

      const hasBaseColor = colors.some(
        color =>
          color.hex === baseColor.hex &&
          color.hsl.h === baseColor.hsl.h &&
          color.hsl.s === baseColor.hsl.s &&
          color.hsl.l === baseColor.hsl.l
      );

      expect(hasBaseColor).toBe(true);
    });
  });

  describe('generateTriadic', () => {
    it('should generate 3 colors 120° apart', () => {
      const baseColor = createColorFromHex('#FF0000'); // Red, hue: 0
      const colors = generateTriadic(baseColor);

      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe(baseColor);
      expect(colors[1]!.hsl.h).toBe(120); // Green
      expect(colors[2]!.hsl.h).toBe(240); // Blue
    });

    it('should handle hue wrap-around', () => {
      const baseColor = createColorFromHex('#00FF00'); // Green, hue: 120
      const colors = generateTriadic(baseColor);

      expect(colors[0]!.hsl.h).toBe(120);
      expect(colors[1]!.hsl.h).toBe(240); // Blue (120 + 120)
      expect(colors[2]!.hsl.h).toBe(0); // Red (120 + 240 = 360 % 360 = 0)
    });

    it('should preserve saturation and lightness', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateTriadic(baseColor);

      colors.forEach(color => {
        expect(color.hsl.s).toBe(baseColor.hsl.s);
        expect(color.hsl.l).toBe(baseColor.hsl.l);
      });
    });
  });

  describe('generateTetradic', () => {
    it('should generate 4 colors forming a rectangle', () => {
      const baseColor = createColorFromHex('#FF0000'); // Red, hue: 0
      const colors = generateTetradic(baseColor);

      expect(colors).toHaveLength(4);
      expect(colors[0]).toBe(baseColor);
      expect(colors[1]!.hsl.h).toBe(30); // Default angle
      expect(colors[2]!.hsl.h).toBe(180); // Complement
      expect(colors[3]!.hsl.h).toBe(210); // Complement + angle
    });

    it('should accept custom angle', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateTetradic(baseColor, 60);

      expect(colors[1]!.hsl.h).toBe(60);
      expect(colors[3]!.hsl.h).toBe(240);
    });

    it('should handle hue wrap-around', () => {
      const baseColor = createColorFromHex('#0000FF'); // Blue, hue: 240
      const colors = generateTetradic(baseColor, 90);

      expect(colors[0]!.hsl.h).toBe(240);
      expect(colors[1]!.hsl.h).toBe(330); // 240 + 90
      expect(colors[2]!.hsl.h).toBe(60); // 240 + 180
      expect(colors[3]!.hsl.h).toBe(150); // 240 + 180 + 90 = 510 % 360
    });

    it('should preserve saturation and lightness', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateTetradic(baseColor);

      colors.forEach(color => {
        expect(color.hsl.s).toBe(baseColor.hsl.s);
        expect(color.hsl.l).toBe(baseColor.hsl.l);
      });
    });
  });

  describe('generateMonochromatic', () => {
    it('should generate 5 monochromatic colors by default', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateMonochromatic(baseColor);

      expect(colors).toHaveLength(5);
    });

    it('should generate specified number of colors', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateMonochromatic(baseColor, 7);

      expect(colors).toHaveLength(7);
    });

    it('should all have the same hue and saturation', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateMonochromatic(baseColor);

      colors.forEach(color => {
        expect(color.hsl.h).toBe(baseColor.hsl.h);
        expect(color.hsl.s).toBe(baseColor.hsl.s);
      });
    });

    it('should vary lightness from dark to light', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateMonochromatic(baseColor);

      // Should be sorted from dark to light
      for (let i = 0; i < colors.length - 1; i++) {
        expect(colors[i]!.hsl.l).toBeLessThan(colors[i + 1]!.hsl.l);
      }
    });

    it('should avoid pure black and pure white', () => {
      const baseColor = createColorFromHex('#FF0000');
      const colors = generateMonochromatic(baseColor);

      colors.forEach(color => {
        expect(color.hsl.l).toBeGreaterThan(10);
        expect(color.hsl.l).toBeLessThan(90);
      });
    });
  });

  describe('generateRandomColor', () => {
    it('should generate a valid color', () => {
      const color = generateRandomColor();

      expect(color).toHaveProperty('hex');
      expect(color).toHaveProperty('rgb');
      expect(color).toHaveProperty('hsl');
      expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('should have high saturation', () => {
      const color = generateRandomColor();

      expect(color.hsl.s).toBeGreaterThanOrEqual(70);
      expect(color.hsl.s).toBeLessThanOrEqual(100);
    });

    it('should have medium lightness', () => {
      const color = generateRandomColor();

      expect(color.hsl.l).toBeGreaterThanOrEqual(40);
      expect(color.hsl.l).toBeLessThanOrEqual(70);
    });

    it('should generate different colors', () => {
      const colors = Array.from({ length: 10 }, () => generateRandomColor());
      const uniqueHexes = new Set(colors.map(c => c.hex));

      // With 10 random colors, we should have at least a few unique ones
      // (extremely unlikely to get duplicates with 360 possible hues)
      expect(uniqueHexes.size).toBeGreaterThan(5);
    });
  });

  describe('generateRandom', () => {
    it('should generate 5 random colors by default', () => {
      const colors = generateRandom();

      expect(colors).toHaveLength(5);
    });

    it('should generate specified number of colors', () => {
      const colors = generateRandom(10);

      expect(colors).toHaveLength(10);
    });

    it('should generate valid colors', () => {
      const colors = generateRandom();

      colors.forEach(color => {
        expect(color).toHaveProperty('hex');
        expect(color).toHaveProperty('rgb');
        expect(color).toHaveProperty('hsl');
        expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
      });
    });
  });

  describe('generatePalette', () => {
    const baseColor = createColorFromHex('#FF0000');

    it('should generate complementary palette', () => {
      const colors = generatePalette(baseColor, 'complementary');

      expect(colors).toHaveLength(2);
      expect(colors[1]!.hsl.h).toBe(180);
    });

    it('should generate analogous palette', () => {
      const colors = generatePalette(baseColor, 'analogous', 5);

      expect(colors).toHaveLength(5);
    });

    it('should generate triadic palette', () => {
      const colors = generatePalette(baseColor, 'triadic');

      expect(colors).toHaveLength(3);
    });

    it('should generate tetradic palette', () => {
      const colors = generatePalette(baseColor, 'tetradic');

      expect(colors).toHaveLength(4);
    });

    it('should generate monochromatic palette', () => {
      const colors = generatePalette(baseColor, 'monochromatic', 7);

      expect(colors).toHaveLength(7);
      colors.forEach(color => {
        expect(color.hsl.h).toBe(baseColor.hsl.h);
      });
    });

    it('should generate random palette', () => {
      const colors = generatePalette(baseColor, 'random', 6);

      expect(colors).toHaveLength(6);
    });

    it('should throw on unknown scheme', () => {
      expect(() => {
        generatePalette(baseColor, 'invalid' as any);
      }).toThrow('Unknown color scheme: invalid');
    });
  });
});
