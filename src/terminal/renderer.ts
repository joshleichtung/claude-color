/**
 * Terminal color rendering utilities
 *
 * Renders color palettes in the terminal using ANSI colors
 */

import chalk from 'chalk';
import { Color, Palette, SuggestionSet } from '../types';

/**
 * Options for rendering colors in the terminal
 */
export interface RenderOptions {
  /** Show hex values below colors */
  showHex?: boolean;
  /** Show RGB values below colors */
  showRgb?: boolean;
  /** Show HSL values below colors */
  showHsl?: boolean;
  /** Width of each color block */
  blockWidth?: number;
  /** Height of each color block */
  blockHeight?: number;
}

/**
 * Render a single color as a colored block in the terminal
 *
 * @param color - Color to render
 * @param options - Rendering options
 * @returns String with ANSI color codes
 *
 * @example
 * ```typescript
 * const color = createColorFromHex('#FF0000');
 * console.log(renderColor(color, { showHex: true }));
 * ```
 */
export function renderColor(color: Color, options: RenderOptions = {}): string {
  const { showHex = true, showRgb = false, showHsl = false, blockWidth = 12 } = options;

  const lines: string[] = [];

  // Create colored block using background color
  const colorBlock = chalk.bgHex(color.hex)(' '.repeat(blockWidth));
  lines.push(colorBlock);

  // Add color information below block
  const info: string[] = [];

  if (showHex) {
    info.push(chalk.gray(color.hex.padEnd(blockWidth)));
  }

  if (showRgb) {
    const rgbText = `rgb(${color.rgb.r},${color.rgb.g},${color.rgb.b})`;
    info.push(chalk.gray(rgbText.padEnd(blockWidth)));
  }

  if (showHsl) {
    const hslText = `hsl(${color.hsl.h},${color.hsl.s}%,${color.hsl.l}%)`;
    info.push(chalk.gray(hslText.padEnd(blockWidth)));
  }

  if (color.locked) {
    info.push(chalk.yellow('🔒 Locked'.padEnd(blockWidth)));
  }

  return lines.concat(info).join('\n');
}

/**
 * Render a palette of colors side by side
 *
 * @param colors - Array of colors to render
 * @param options - Rendering options
 * @returns String with ANSI color codes for entire palette
 *
 * @example
 * ```typescript
 * const colors = generateComplementary(baseColor);
 * console.log(renderPalette(colors, { showHex: true, showRgb: true }));
 * ```
 */
export function renderPalette(colors: Color[], options: RenderOptions = {}): string {
  const {
    showHex = true,
    showRgb = false,
    showHsl = false,
    blockWidth = 12,
    blockHeight = 3,
  } = options;

  if (colors.length === 0) {
    return chalk.gray('(empty palette)');
  }

  const lines: string[] = [];

  // Render color blocks
  for (let i = 0; i < blockHeight; i++) {
    const row = colors.map(color => chalk.bgHex(color.hex)(' '.repeat(blockWidth))).join('');
    lines.push(row);
  }

  // Add hex values
  if (showHex) {
    const hexRow = colors.map(color => color.hex.padEnd(blockWidth)).join('');
    lines.push(chalk.gray(hexRow));
  }

  // Add RGB values
  if (showRgb) {
    const rgbRow = colors
      .map(color => {
        const text = `${color.rgb.r},${color.rgb.g},${color.rgb.b}`;
        return text.padEnd(blockWidth);
      })
      .join('');
    lines.push(chalk.gray(rgbRow));
  }

  // Add HSL values
  if (showHsl) {
    const hslRow = colors
      .map(color => {
        const text = `${color.hsl.h}°,${color.hsl.s}%,${color.hsl.l}%`;
        return text.padEnd(blockWidth);
      })
      .join('');
    lines.push(chalk.gray(hslRow));
  }

  // Add locked indicators
  const lockedColors = colors.filter(c => c.locked);
  if (lockedColors.length > 0) {
    const lockRow = colors.map(color => (color.locked ? '🔒' : '  ').padEnd(blockWidth)).join('');
    lines.push(chalk.yellow(lockRow));
  }

  return lines.join('\n');
}

/**
 * Render a complete palette with metadata
 *
 * @param palette - Palette to render
 * @param options - Rendering options
 * @returns Formatted string with palette and metadata
 *
 * @example
 * ```typescript
 * const palette = { id: '123', colors: [...], scheme: 'complementary', metadata: {...} };
 * console.log(renderPaletteWithMetadata(palette));
 * ```
 */
export function renderPaletteWithMetadata(palette: Palette, options: RenderOptions = {}): string {
  const lines: string[] = [];

  // Title
  lines.push(chalk.bold.white(`\n🎨 Palette: ${palette.id}`));
  lines.push(chalk.gray(`Scheme: ${palette.scheme}`));

  // Metadata
  if (palette.metadata.originalPrompt) {
    lines.push(chalk.gray(`Prompt: "${palette.metadata.originalPrompt}"`));
  }
  if (palette.metadata.sourceUrl) {
    lines.push(chalk.gray(`Source: ${palette.metadata.sourceUrl}`));
  }

  lines.push(''); // Empty line before colors

  // Render colors
  lines.push(renderPalette(palette.colors, options));

  lines.push(''); // Empty line after colors

  return lines.join('\n');
}

/**
 * Create a simple color swatch for display
 *
 * @param color - Color to display
 * @returns Colored square with hex value
 */
export function colorSwatch(color: Color): string {
  return `${chalk.bgHex(color.hex)('  ')} ${chalk.gray(color.hex)}`;
}

/**
 * Render multiple palettes for comparison
 *
 * @param palettes - Array of palettes to compare
 * @param options - Rendering options
 * @returns Formatted string with all palettes
 */
export function renderMultiplePalettes(palettes: Palette[], options: RenderOptions = {}): string {
  if (palettes.length === 0) {
    return chalk.gray('No palettes to display');
  }

  return palettes
    .map((palette, index) => {
      const header = chalk.bold.cyan(`\nOption ${index + 1}/${palettes.length}`);
      return `${header}\n${renderPaletteWithMetadata(palette, options)}`;
    })
    .join('\n');
}

/**
 * Render a suggestion set with all variations
 *
 * @param suggestionSet - Set of palette suggestions
 * @param options - Rendering options
 * @returns Formatted string with all suggestions
 *
 * @example
 * ```typescript
 * const suggestions = generateSuggestions(baseColor, 'analogous', 5);
 * console.log(renderSuggestionSet(suggestions));
 * ```
 */
export function renderSuggestionSet(
  suggestionSet: SuggestionSet,
  options: RenderOptions = {}
): string {
  const lines: string[] = [];

  // Header
  lines.push(chalk.bold.white(`\n🎨 ${suggestionSet.suggestions.length} Palette Variations`));
  lines.push(
    chalk.gray(`Scheme: ${suggestionSet.requestedScheme} | Base: ${suggestionSet.baseColor.hex}`)
  );
  lines.push('');

  // Render each suggestion
  suggestionSet.suggestions.forEach(suggestion => {
    const rank = chalk.bold.cyan(`[${suggestion.rank}]`);
    const description = chalk.white(suggestion.description);
    const strategy = chalk.gray(`(${suggestion.strategy})`);

    lines.push(`${rank} ${description} ${strategy}`);
    lines.push(renderPalette(suggestion.palette.colors, options));
    lines.push(''); // Empty line between suggestions
  });

  return lines.join('\n');
}
