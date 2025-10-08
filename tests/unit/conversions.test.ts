/**
 * Tests for color space conversions
 */

import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  createColorFromHex,
  createColorFromRgb,
  createColorFromHsl,
} from '../../src/core/conversions';
import { InvalidColorError, ColorRangeError } from '../../src/utils/errors';

describe('Color Space Conversions', () => {
  describe('hexToRgb', () => {
    it('should convert 6-digit hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle hex without # prefix', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert 3-digit hex shorthand', () => {
      expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#0F0')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#00F')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle lowercase hex', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    });

    it('should throw on invalid hex format', () => {
      expect(() => hexToRgb('invalid')).toThrow(InvalidColorError);
      expect(() => hexToRgb('#GG0000')).toThrow(InvalidColorError);
      expect(() => hexToRgb('#FF')).toThrow(InvalidColorError);
      expect(() => hexToRgb('#FFFFFFF')).toThrow(InvalidColorError);
    });

    it('should convert white correctly', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert black correctly', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to 6-digit uppercase hex', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#FF0000');
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00FF00');
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000FF');
    });

    it('should handle values that need padding', () => {
      expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe('#010203');
    });

    it('should round decimal values', () => {
      expect(rgbToHex({ r: 255.4, g: 128.3, b: 64.5 })).toBe('#FF8041');
    });

    it('should throw on out-of-range red', () => {
      expect(() => rgbToHex({ r: 256, g: 0, b: 0 })).toThrow(ColorRangeError);
      expect(() => rgbToHex({ r: -1, g: 0, b: 0 })).toThrow(ColorRangeError);
    });

    it('should throw on out-of-range green', () => {
      expect(() => rgbToHex({ r: 0, g: 256, b: 0 })).toThrow(ColorRangeError);
      expect(() => rgbToHex({ r: 0, g: -1, b: 0 })).toThrow(ColorRangeError);
    });

    it('should throw on out-of-range blue', () => {
      expect(() => rgbToHex({ r: 0, g: 0, b: 256 })).toThrow(ColorRangeError);
      expect(() => rgbToHex({ r: 0, g: 0, b: -1 })).toThrow(ColorRangeError);
    });
  });

  describe('rgbToHsl', () => {
    it('should convert pure red', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    it('should convert pure green', () => {
      const result = rgbToHsl({ r: 0, g: 255, b: 0 });
      expect(result.h).toBe(120);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    it('should convert pure blue', () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 255 });
      expect(result.h).toBe(240);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    it('should convert white', () => {
      const result = rgbToHsl({ r: 255, g: 255, b: 255 });
      expect(result.h).toBe(0); // Hue is 0 for achromatic colors
      expect(result.s).toBe(0);
      expect(result.l).toBe(100);
    });

    it('should convert black', () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 0 });
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBe(0);
    });

    it('should convert gray', () => {
      const result = rgbToHsl({ r: 128, g: 128, b: 128 });
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBe(50);
    });

    it('should handle cyan', () => {
      const result = rgbToHsl({ r: 0, g: 255, b: 255 });
      expect(result.h).toBe(180);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    it('should handle magenta', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 255 });
      expect(result.h).toBe(300);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    it('should handle yellow', () => {
      const result = rgbToHsl({ r: 255, g: 255, b: 0 });
      expect(result.h).toBe(60);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });
  });

  describe('hslToRgb', () => {
    it('should convert pure red', () => {
      const result = hslToRgb({ h: 0, s: 100, l: 50 });
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert pure green', () => {
      const result = hslToRgb({ h: 120, s: 100, l: 50 });
      expect(result).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert pure blue', () => {
      const result = hslToRgb({ h: 240, s: 100, l: 50 });
      expect(result).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should convert white', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 100 });
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert black', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 0 });
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert gray (achromatic)', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 50 });
      expect(result.r).toBe(128);
      expect(result.g).toBe(128);
      expect(result.b).toBe(128);
    });
  });

  describe('Round-trip conversions', () => {
    it('should maintain values through RGB → HSL → RGB', () => {
      const original = { r: 123, g: 45, b: 67 };
      const hsl = rgbToHsl(original);
      const result = hslToRgb(hsl);

      // Allow small rounding differences
      expect(Math.abs(result.r - original.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.g - original.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.b - original.b)).toBeLessThanOrEqual(1);
    });

    it('should maintain values through HEX → RGB → HEX', () => {
      const original = '#3B82F6';
      const rgb = hexToRgb(original);
      const result = rgbToHex(rgb);
      expect(result).toBe(original);
    });

    it('should maintain values through HSL → RGB → HSL', () => {
      const original = { h: 217, s: 91, l: 60 };
      const rgb = hslToRgb(original);
      const result = rgbToHsl(rgb);

      // Allow small rounding differences
      expect(Math.abs(result.h - original.h)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.s - original.s)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.l - original.l)).toBeLessThanOrEqual(1);
    });
  });

  describe('hexToHsl', () => {
    it('should convert hex directly to HSL', () => {
      const result = hexToHsl('#FF0000');
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });
  });

  describe('hslToHex', () => {
    it('should convert HSL directly to hex', () => {
      const result = hslToHex({ h: 0, s: 100, l: 50 });
      expect(result).toBe('#FF0000');
    });
  });

  describe('createColorFromHex', () => {
    it('should create complete Color object from hex', () => {
      const color = createColorFromHex('#3B82F6');

      expect(color.hex).toBe('#3B82F6');
      expect(color.rgb).toEqual({ r: 59, g: 130, b: 246 });
      expect(color.hsl.h).toBe(217);
      expect(color.hsl.s).toBe(91);
      expect(color.hsl.l).toBe(60);
    });

    it('should normalize shorthand hex', () => {
      const color = createColorFromHex('#F00');
      expect(color.hex).toBe('#FF0000');
    });
  });

  describe('createColorFromRgb', () => {
    it('should create complete Color object from RGB', () => {
      const color = createColorFromRgb({ r: 59, g: 130, b: 246 });

      expect(color.hex).toBe('#3B82F6');
      expect(color.rgb).toEqual({ r: 59, g: 130, b: 246 });
      expect(color.hsl.h).toBe(217);
    });
  });

  describe('createColorFromHsl', () => {
    it('should create complete Color object from HSL', () => {
      const color = createColorFromHsl({ h: 0, s: 100, l: 50 });

      expect(color.hex).toBe('#FF0000');
      expect(color.rgb).toEqual({ r: 255, g: 0, b: 0 });
      expect(color.hsl).toEqual({ h: 0, s: 100, l: 50 });
    });
  });
});
