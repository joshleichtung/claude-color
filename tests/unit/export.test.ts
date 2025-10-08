/**
 * Tests for export utilities
 */

import {
  exportAsHexArray,
  exportAsCSS,
  exportAsSCSS,
  exportAsJSON,
  exportAsJS,
  exportAsTS,
  exportAsTailwind,
  exportAsSVG,
  exportPalette,
  getFileExtension,
} from '../../src/utils/export';
import { createColorFromHex } from '../../src/core/conversions';
import { Palette } from '../../src/types';

describe('Export Utilities', () => {
  const colors = [
    createColorFromHex('#FF0000'),
    createColorFromHex('#00FF00'),
    createColorFromHex('#0000FF'),
  ];

  const palette: Palette = {
    id: 'test-123',
    colors,
    scheme: 'triadic',
    metadata: {
      created: new Date('2025-01-01'),
      generationMethod: 'scheme',
    },
  };

  describe('exportAsHexArray', () => {
    it('should export color array as hex strings', () => {
      const result = exportAsHexArray(colors);
      expect(result).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });

    it('should export palette colors as hex strings', () => {
      const result = exportAsHexArray(palette);
      expect(result).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });
  });

  describe('exportAsCSS', () => {
    it('should export as CSS custom properties', () => {
      const result = exportAsCSS(colors);
      expect(result).toContain(':root {');
      expect(result).toContain('--color-1: #FF0000;');
      expect(result).toContain('--color-2: #00FF00;');
      expect(result).toContain('--color-3: #0000FF;');
      expect(result).toContain('}');
    });

    it('should use custom prefix', () => {
      const result = exportAsCSS(colors, 'brand');
      expect(result).toContain('--brand-1: #FF0000;');
      expect(result).toContain('--brand-2: #00FF00;');
    });

    it('should work with palette', () => {
      const result = exportAsCSS(palette);
      expect(result).toContain('--color-1: #FF0000;');
    });
  });

  describe('exportAsSCSS', () => {
    it('should export as SCSS variables', () => {
      const result = exportAsSCSS(colors);
      expect(result).toContain('$color-1: #FF0000;');
      expect(result).toContain('$color-2: #00FF00;');
      expect(result).toContain('$color-3: #0000FF;');
    });

    it('should use custom prefix', () => {
      const result = exportAsSCSS(colors, 'theme');
      expect(result).toContain('$theme-1: #FF0000;');
    });
  });

  describe('exportAsJSON', () => {
    it('should export as JSON with colors', () => {
      const result = exportAsJSON(colors);
      const parsed = JSON.parse(result);

      expect(parsed.colors).toHaveLength(3);
      expect(parsed.colors[0]!.hex).toBe('#FF0000');
      expect(parsed.colors[0]!.rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should export palette with metadata', () => {
      const result = exportAsJSON(palette);
      const parsed = JSON.parse(result);

      expect(parsed.id).toBe('test-123');
      expect(parsed.scheme).toBe('triadic');
      expect(parsed.colors).toHaveLength(3);
      expect(parsed.metadata).toBeDefined();
    });

    it('should support compact format', () => {
      const pretty = exportAsJSON(colors, true);
      const compact = exportAsJSON(colors, false);

      expect(pretty.length).toBeGreaterThan(compact.length);
      expect(pretty).toContain('\n');
      expect(compact).not.toContain('\n');
    });
  });

  describe('exportAsJS', () => {
    it('should export as JavaScript module', () => {
      const result = exportAsJS(colors);

      expect(result).toContain('export const palette =');
      expect(result).toContain('"#FF0000"');
      expect(result).toContain('"#00FF00"');
      expect(result).toContain('"#0000FF"');
    });

    it('should use custom variable name', () => {
      const result = exportAsJS(colors, 'myColors');
      expect(result).toContain('export const myColors =');
    });
  });

  describe('exportAsTS', () => {
    it('should export as TypeScript module', () => {
      const result = exportAsTS(colors);

      expect(result).toContain('export const palette: string[] =');
      expect(result).toContain('"#FF0000"');
    });

    it('should use custom variable name', () => {
      const result = exportAsTS(colors, 'brandColors');
      expect(result).toContain('export const brandColors: string[] =');
    });
  });

  describe('exportAsTailwind', () => {
    it('should export as Tailwind config', () => {
      const result = exportAsTailwind(colors);

      expect(result).toContain('module.exports = {');
      expect(result).toContain('theme:');
      expect(result).toContain('extend:');
      expect(result).toContain('colors:');
      expect(result).toContain('primary:');
      expect(result).toContain("100: '#FF0000'");
      expect(result).toContain("200: '#00FF00'");
      expect(result).toContain("300: '#0000FF'");
    });

    it('should use custom prefix', () => {
      const result = exportAsTailwind(colors, 'accent');
      expect(result).toContain('accent:');
      expect(result).not.toContain('primary:');
    });
  });

  describe('exportAsSVG', () => {
    it('should export as SVG', () => {
      const result = exportAsSVG(colors);

      expect(result).toContain('<svg');
      expect(result).toContain('width="500"');
      expect(result).toContain('height="100"');
      expect(result).toContain('<rect');
      expect(result).toContain('fill="#FF0000"');
      expect(result).toContain('fill="#00FF00"');
      expect(result).toContain('fill="#0000FF"');
      expect(result).toContain('</svg>');
    });

    it('should support custom dimensions', () => {
      const result = exportAsSVG(colors, 300, 50);

      expect(result).toContain('width="300"');
      expect(result).toContain('height="50"');
    });

    it('should divide width evenly among colors', () => {
      const result = exportAsSVG(colors, 300, 100);

      // Each rect should be 100px wide (300 / 3)
      expect(result).toContain('x="0"');
      expect(result).toContain('x="100"');
      expect(result).toContain('x="200"');
      expect(result).toContain('width="100"');
    });
  });

  describe('exportPalette', () => {
    it('should export in hex format', () => {
      const result = exportPalette(colors, 'hex');
      expect(result).toBe('#FF0000\n#00FF00\n#0000FF');
    });

    it('should export in css format', () => {
      const result = exportPalette(colors, 'css');
      expect(result).toContain(':root {');
    });

    it('should export in scss format', () => {
      const result = exportPalette(colors, 'scss');
      expect(result).toContain('$color-1');
    });

    it('should export in json format', () => {
      const result = exportPalette(colors, 'json');
      const parsed = JSON.parse(result);
      expect(parsed.colors).toBeDefined();
    });

    it('should export in js format', () => {
      const result = exportPalette(colors, 'js');
      expect(result).toContain('export const');
    });

    it('should export in ts format', () => {
      const result = exportPalette(colors, 'ts');
      expect(result).toContain(': string[]');
    });

    it('should export in tailwind format', () => {
      const result = exportPalette(colors, 'tailwind');
      expect(result).toContain('module.exports');
    });

    it('should export in svg format', () => {
      const result = exportPalette(colors, 'svg');
      expect(result).toContain('<svg');
    });

    it('should pass options to format functions', () => {
      const result = exportPalette(colors, 'css', { prefix: 'brand' });
      expect(result).toContain('--brand-1');
    });

    it('should throw on unknown format', () => {
      expect(() => {
        exportPalette(colors, 'invalid' as any);
      }).toThrow('Unknown export format: invalid');
    });
  });

  describe('getFileExtension', () => {
    it('should return correct extension for each format', () => {
      expect(getFileExtension('hex')).toBe('.txt');
      expect(getFileExtension('css')).toBe('.css');
      expect(getFileExtension('scss')).toBe('.scss');
      expect(getFileExtension('json')).toBe('.json');
      expect(getFileExtension('js')).toBe('.js');
      expect(getFileExtension('ts')).toBe('.ts');
      expect(getFileExtension('tailwind')).toBe('.js');
      expect(getFileExtension('svg')).toBe('.svg');
    });
  });
});
