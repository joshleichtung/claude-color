/**
 * Tests for terminal renderer
 */

import {
  renderColor,
  renderPalette,
  renderPaletteWithMetadata,
  colorSwatch,
  renderMultiplePalettes,
} from '../../src/terminal/renderer';
import { createColorFromHex } from '../../src/core/conversions';
import { Palette } from '../../src/types';

describe('Terminal Renderer', () => {
  const redColor = createColorFromHex('#FF0000');
  const greenColor = createColorFromHex('#00FF00');
  const blueColor = createColorFromHex('#0000FF');

  const colors = [redColor, greenColor, blueColor];

  const palette: Palette = {
    id: 'test-123',
    colors,
    scheme: 'triadic',
    metadata: {
      created: new Date('2025-01-01'),
      generationMethod: 'scheme',
      originalPrompt: 'vibrant colors',
    },
  };

  describe('renderColor', () => {
    it('should return a string', () => {
      const result = renderColor(redColor);
      expect(typeof result).toBe('string');
    });

    it('should include hex value by default', () => {
      const result = renderColor(redColor);
      expect(result).toContain('#FF0000');
    });

    it('should include RGB when requested', () => {
      const result = renderColor(redColor, { showRgb: true });
      expect(result).toContain('255');
      expect(result).toContain('0');
    });

    it('should include HSL when requested', () => {
      const result = renderColor(redColor, { showHsl: true });
      expect(result).toContain('0'); // hue
      expect(result).toContain('100'); // saturation
      expect(result).toContain('50'); // lightness
    });

    it('should show locked indicator for locked colors', () => {
      const lockedColor = { ...redColor, locked: true };
      const result = renderColor(lockedColor);
      expect(result).toContain('🔒');
      expect(result).toContain('Locked');
    });

    it('should not show hex when disabled', () => {
      const result = renderColor(redColor, { showHex: false });
      expect(result).not.toContain('#FF0000');
    });
  });

  describe('renderPalette', () => {
    it('should return a string', () => {
      const result = renderPalette(colors);
      expect(typeof result).toBe('string');
    });

    it('should handle empty palette', () => {
      const result = renderPalette([]);
      expect(result).toContain('empty palette');
    });

    it('should include all color hex values by default', () => {
      const result = renderPalette(colors);
      expect(result).toContain('#FF0000');
      expect(result).toContain('#00FF00');
      expect(result).toContain('#0000FF');
    });

    it('should include RGB when requested', () => {
      const result = renderPalette(colors, { showRgb: true });
      expect(result).toContain('255,0,0');
      expect(result).toContain('0,255,0');
      expect(result).toContain('0,0,255');
    });

    it('should include HSL when requested', () => {
      const result = renderPalette(colors, { showHsl: true });
      expect(result).toContain('0°'); // red hue
      expect(result).toContain('120°'); // green hue
      expect(result).toContain('240°'); // blue hue
    });

    it('should show locked indicators', () => {
      const colorsWithLocked = [
        redColor,
        { ...greenColor, locked: true },
        blueColor,
      ];
      const result = renderPalette(colorsWithLocked);
      expect(result).toContain('🔒');
    });
  });

  describe('renderPaletteWithMetadata', () => {
    it('should return a string', () => {
      const result = renderPaletteWithMetadata(palette);
      expect(typeof result).toBe('string');
    });

    it('should include palette ID', () => {
      const result = renderPaletteWithMetadata(palette);
      expect(result).toContain('test-123');
    });

    it('should include color scheme', () => {
      const result = renderPaletteWithMetadata(palette);
      expect(result).toContain('triadic');
    });

    it('should include original prompt if present', () => {
      const result = renderPaletteWithMetadata(palette);
      expect(result).toContain('vibrant colors');
    });

    it('should include source URL if present', () => {
      const paletteWithUrl: Palette = {
        ...palette,
        metadata: {
          ...palette.metadata,
          sourceUrl: 'https://example.com',
        },
      };
      const result = renderPaletteWithMetadata(paletteWithUrl);
      expect(result).toContain('https://example.com');
    });

    it('should include colors', () => {
      const result = renderPaletteWithMetadata(palette);
      expect(result).toContain('#FF0000');
      expect(result).toContain('#00FF00');
      expect(result).toContain('#0000FF');
    });
  });

  describe('colorSwatch', () => {
    it('should return a string', () => {
      const result = colorSwatch(redColor);
      expect(typeof result).toBe('string');
    });

    it('should include hex value', () => {
      const result = colorSwatch(redColor);
      expect(result).toContain('#FF0000');
    });
  });

  describe('renderMultiplePalettes', () => {
    const palette1: Palette = {
      id: 'palette-1',
      colors: [redColor, greenColor],
      scheme: 'complementary',
      metadata: {
        created: new Date('2025-01-01'),
        generationMethod: 'scheme',
      },
    };

    const palette2: Palette = {
      id: 'palette-2',
      colors: [blueColor, greenColor],
      scheme: 'complementary',
      metadata: {
        created: new Date('2025-01-02'),
        generationMethod: 'scheme',
      },
    };

    it('should handle empty array', () => {
      const result = renderMultiplePalettes([]);
      expect(result).toContain('No palettes');
    });

    it('should render single palette', () => {
      const result = renderMultiplePalettes([palette1]);
      expect(result).toContain('Option 1/1');
      expect(result).toContain('palette-1');
    });

    it('should render multiple palettes', () => {
      const result = renderMultiplePalettes([palette1, palette2]);
      expect(result).toContain('Option 1/2');
      expect(result).toContain('Option 2/2');
      expect(result).toContain('palette-1');
      expect(result).toContain('palette-2');
    });

    it('should include all palette metadata', () => {
      const result = renderMultiplePalettes([palette1, palette2]);
      expect(result).toContain('complementary');
    });
  });
});
