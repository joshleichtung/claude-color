/**
 * Export utilities for color palettes
 *
 * Provides functions to export palettes in various formats
 */

import { Color, Palette } from '../types';

/**
 * Export format type
 */
export type ExportFormat = 'hex' | 'css' | 'scss' | 'json' | 'js' | 'ts' | 'tailwind' | 'svg';

/**
 * Export a palette as an array of hex strings
 *
 * @param palette - Palette to export
 * @returns Array of hex color strings
 *
 * @example
 * ```typescript
 * exportAsHexArray(palette)
 * // ['#FF0000', '#00FF00', '#0000FF']
 * ```
 */
export function exportAsHexArray(palette: Palette | Color[]): string[] {
  const colors = Array.isArray(palette) ? palette : palette.colors;
  return colors.map(color => color.hex);
}

/**
 * Export a palette as CSS custom properties
 *
 * @param palette - Palette to export
 * @param prefix - Variable name prefix (default: 'color')
 * @returns CSS custom properties string
 *
 * @example
 * ```typescript
 * exportAsCSS(palette)
 * // :root {
 * //   --color-1: #FF0000;
 * //   --color-2: #00FF00;
 * // }
 * ```
 */
export function exportAsCSS(palette: Palette | Color[], prefix: string = 'color'): string {
  const colors = Array.isArray(palette) ? palette : palette.colors;
  const lines = [':root {'];

  colors.forEach((color, index) => {
    lines.push(`  --${prefix}-${index + 1}: ${color.hex};`);
  });

  lines.push('}');
  return lines.join('\n');
}

/**
 * Export a palette as SCSS variables
 *
 * @param palette - Palette to export
 * @param prefix - Variable name prefix (default: 'color')
 * @returns SCSS variables string
 *
 * @example
 * ```typescript
 * exportAsSCSS(palette)
 * // $color-1: #FF0000;
 * // $color-2: #00FF00;
 * ```
 */
export function exportAsSCSS(palette: Palette | Color[], prefix: string = 'color'): string {
  const colors = Array.isArray(palette) ? palette : palette.colors;
  return colors.map((color, index) => `$${prefix}-${index + 1}: ${color.hex};`).join('\n');
}

/**
 * Export a palette as JSON
 *
 * @param palette - Palette to export
 * @param pretty - Use pretty printing (default: true)
 * @returns JSON string
 *
 * @example
 * ```typescript
 * exportAsJSON(palette)
 * // {
 * //   "colors": [
 * //     { "hex": "#FF0000", "rgb": {...}, "hsl": {...} }
 * //   ]
 * // }
 * ```
 */
export function exportAsJSON(palette: Palette | Color[], pretty: boolean = true): string {
  if (Array.isArray(palette)) {
    return JSON.stringify({ colors: palette }, null, pretty ? 2 : 0);
  }

  return JSON.stringify(
    {
      id: palette.id,
      scheme: palette.scheme,
      colors: palette.colors,
      metadata: palette.metadata,
    },
    null,
    pretty ? 2 : 0
  );
}

/**
 * Export a palette as JavaScript module
 *
 * @param palette - Palette to export
 * @param varName - Variable name (default: 'palette')
 * @returns JavaScript module string
 *
 * @example
 * ```typescript
 * exportAsJS(palette)
 * // export const palette = ['#FF0000', '#00FF00'];
 * ```
 */
export function exportAsJS(palette: Palette | Color[], varName: string = 'palette'): string {
  const colors = Array.isArray(palette) ? palette : palette.colors;
  const hexArray = colors.map(c => c.hex);
  return `export const ${varName} = ${JSON.stringify(hexArray, null, 2)};`;
}

/**
 * Export a palette as TypeScript module
 *
 * @param palette - Palette to export
 * @param varName - Variable name (default: 'palette')
 * @returns TypeScript module string
 *
 * @example
 * ```typescript
 * exportAsTS(palette)
 * // export const palette: string[] = ['#FF0000', '#00FF00'];
 * ```
 */
export function exportAsTS(palette: Palette | Color[], varName: string = 'palette'): string {
  const colors = Array.isArray(palette) ? palette : palette.colors;
  const hexArray = colors.map(c => c.hex);
  return `export const ${varName}: string[] = ${JSON.stringify(hexArray, null, 2)};`;
}

/**
 * Export a palette as Tailwind config
 *
 * @param palette - Palette to export
 * @param prefix - Color name prefix (default: 'primary')
 * @returns Tailwind config string
 *
 * @example
 * ```typescript
 * exportAsTailwind(palette)
 * // module.exports = {
 * //   theme: {
 * //     extend: {
 * //       colors: {
 * //         primary: { 100: '#FF0000', 200: '#00FF00' }
 * //       }
 * //     }
 * //   }
 * // }
 * ```
 */
export function exportAsTailwind(palette: Palette | Color[], prefix: string = 'primary'): string {
  const colors = Array.isArray(palette) ? palette : palette.colors;

  const colorEntries = colors
    .map((color, index) => {
      const weight = (index + 1) * 100;
      return `        ${weight}: '${color.hex}',`;
    })
    .join('\n');

  return `module.exports = {
  theme: {
    extend: {
      colors: {
        ${prefix}: {
${colorEntries}
        },
      },
    },
  },
};`;
}

/**
 * Export a palette as SVG
 *
 * @param palette - Palette to export
 * @param width - SVG width (default: 500)
 * @param height - SVG height (default: 100)
 * @returns SVG string
 *
 * @example
 * ```typescript
 * exportAsSVG(palette)
 * // <svg>...</svg>
 * ```
 */
export function exportAsSVG(
  palette: Palette | Color[],
  width: number = 500,
  height: number = 100
): string {
  const colors = Array.isArray(palette) ? palette : palette.colors;
  const rectWidth = width / colors.length;

  const rects = colors
    .map((color, index) => {
      const x = index * rectWidth;
      return `  <rect x="${x}" y="0" width="${rectWidth}" height="${height}" fill="${color.hex}" />`;
    })
    .join('\n');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${rects}
</svg>`;
}

/**
 * Options for exportPalette function
 */
export interface ExportPaletteOptions {
  prefix?: string;
  pretty?: boolean;
  varName?: string;
  width?: number;
  height?: number;
}

/**
 * Export a palette in the specified format
 *
 * @param palette - Palette to export
 * @param format - Export format
 * @param options - Format-specific options
 * @returns Formatted string
 *
 * @example
 * ```typescript
 * exportPalette(palette, 'css', { prefix: 'brand' })
 * exportPalette(palette, 'json', { pretty: false })
 * ```
 */
export function exportPalette(
  palette: Palette | Color[],
  format: ExportFormat,
  options: ExportPaletteOptions = {}
): string {
  switch (format) {
    case 'hex':
      return exportAsHexArray(palette).join('\n');
    case 'css':
      return exportAsCSS(palette, options.prefix);
    case 'scss':
      return exportAsSCSS(palette, options.prefix);
    case 'json':
      return exportAsJSON(palette, options.pretty);
    case 'js':
      return exportAsJS(palette, options.varName);
    case 'ts':
      return exportAsTS(palette, options.varName);
    case 'tailwind':
      return exportAsTailwind(palette, options.prefix);
    case 'svg':
      return exportAsSVG(palette, options.width, options.height);
    default:
      throw new Error(`Unknown export format: ${String(format)}`);
  }
}

/**
 * Get file extension for export format
 *
 * @param format - Export format
 * @returns File extension including dot
 */
export function getFileExtension(format: ExportFormat): string {
  const extensions: Record<ExportFormat, string> = {
    hex: '.txt',
    css: '.css',
    scss: '.scss',
    json: '.json',
    js: '.js',
    ts: '.ts',
    tailwind: '.js',
    svg: '.svg',
  };

  return extensions[format] || '.txt';
}
