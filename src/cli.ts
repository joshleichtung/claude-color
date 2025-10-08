#!/usr/bin/env node

/**
 * Claude Color CLI entry point
 *
 * Provides commands for generating, viewing, and exporting color palettes
 */

/* eslint-disable no-console */

import { Command } from 'commander';
import { VERSION } from './index';
import { createColorFromHex } from './core/conversions';
import { generatePalette, generateRandomColor } from './core/theory';
import { generateSuggestions } from './core/suggestions';
import {
  renderPalette,
  renderPaletteWithMetadata,
  renderSuggestionSet,
} from './terminal/renderer';
import { exportPalette, type ExportFormat } from './utils/export';
import { ColorScheme, Palette } from './types';
import { writeFileSync } from 'fs';
import { nanoid } from 'nanoid';

/**
 * Command option types
 */
interface GenerateOptions {
  scheme: string;
  count: string;
  base?: string;
  suggestions: string;
  hex: boolean;
  rgb: boolean;
  hsl: boolean;
  export?: string;
  output?: string;
}

interface RandomOptions {
  count: string;
  hex: boolean;
  rgb: boolean;
  hsl: boolean;
}

interface DisplayOptions {
  hex: boolean;
  rgb: boolean;
  hsl: boolean;
}

interface MonochromaticOptions extends DisplayOptions {
  count: string;
}

interface AnalogousOptions extends DisplayOptions {
  count: string;
}

interface ExportOptions {
  format: string;
  output?: string;
  prefix: string;
}

const program = new Command();

program
  .name('claude-color')
  .description('AI-powered terminal color palette generator')
  .version(VERSION);

/**
 * Generate command - create color palettes
 */
program
  .command('generate')
  .alias('gen')
  .description('Generate color palette(s) with variations')
  .option(
    '-s, --scheme <type>',
    'Color scheme (complementary, analogous, triadic, tetradic, monochromatic, random)',
    'random'
  )
  .option('-c, --count <number>', 'Number of colors per palette', '5')
  .option('-b, --base <color>', 'Base color in hex format (e.g., #FF0000)')
  .option(
    '--suggestions <number>',
    'Number of palette variations to generate (1-10, default: 1)',
    '1'
  )
  .option('--hex', 'Show hex values (default: true)', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .option('-e, --export <format>', 'Export format (hex, css, scss, json, js, ts, tailwind, svg)')
  .option('-o, --output <file>', 'Output file for export')
  .action((options: GenerateOptions) => {
    const scheme = options.scheme as ColorScheme;
    const count = parseInt(options.count, 10);
    const numSuggestions = parseInt(options.suggestions, 10);

    // Validate scheme
    const validSchemes: ColorScheme[] = [
      'complementary',
      'analogous',
      'triadic',
      'tetradic',
      'monochromatic',
      'random',
    ];
    if (!validSchemes.includes(scheme)) {
      console.error(`Error: Invalid scheme "${scheme}". Valid options: ${validSchemes.join(', ')}`);
      process.exit(1);
    }

    // Validate suggestions count
    if (numSuggestions < 1 || numSuggestions > 10) {
      console.error('Error: Suggestions count must be between 1 and 10');
      process.exit(1);
    }

    // Get or generate base color
    let baseColor;
    if (options.base) {
      try {
        baseColor = createColorFromHex(options.base);
      } catch (error) {
        console.error(`Error: Invalid base color "${options.base}". Use hex format like #FF0000`);
        process.exit(1);
      }
    } else {
      baseColor = generateRandomColor();
    }

    const renderOptions = {
      showHex: options.hex,
      showRgb: options.rgb,
      showHsl: options.hsl,
    };

    // Generate and display based on suggestions count
    if (numSuggestions === 1) {
      // Single palette (original behavior)
      const colors = generatePalette(baseColor, scheme, count);
      const palette: Palette = {
        id: nanoid(8),
        colors,
        scheme,
        metadata: {
          created: new Date(),
          generationMethod: 'scheme',
        },
      };

      console.log(renderPaletteWithMetadata(palette, renderOptions));

      // Export if requested
      if (options.export) {
        const format = options.export as ExportFormat;
        const content = exportPalette(palette, format);

        if (options.output) {
          writeFileSync(options.output, content);
          console.log(`\n✓ Exported to ${options.output}`);
        } else {
          console.log('\n--- Export ---');
          console.log(content);
        }
      }
    } else {
      // Multiple suggestions
      const suggestionSet = generateSuggestions(baseColor, scheme, numSuggestions);
      console.log(renderSuggestionSet(suggestionSet, renderOptions));

      // Export if requested (exports first suggestion)
      if (options.export && suggestionSet.suggestions[0]) {
        const format = options.export as ExportFormat;
        const content = exportPalette(suggestionSet.suggestions[0].palette, format);

        if (options.output) {
          writeFileSync(options.output, content);
          console.log(`✓ Exported first suggestion to ${options.output}`);
        } else {
          console.log('\n--- Export (First Suggestion) ---');
          console.log(content);
        }
      }
    }
  });

/**
 * Random command - quickly generate a random palette
 */
program
  .command('random')
  .description('Generate a random color palette')
  .option('-c, --count <number>', 'Number of colors', '5')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action((options: RandomOptions) => {
    const count = parseInt(options.count, 10);
    const colors = generatePalette(generateRandomColor(), 'random', count);

    console.log('\n🎲 Random Palette\n');
    console.log(
      renderPalette(colors, {
        showHex: options.hex,
        showRgb: options.rgb,
        showHsl: options.hsl,
      })
    );
    console.log('');
  });

/**
 * Complementary command - generate complementary colors
 */
program
  .command('complementary <color>')
  .description('Generate complementary color palette')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action((colorHex: string, options: DisplayOptions) => {
    try {
      const baseColor = createColorFromHex(colorHex);
      const colors = generatePalette(baseColor, 'complementary');

      console.log('\n🎨 Complementary Colors\n');
      console.log(
        renderPalette(colors, {
          showHex: options.hex,
          showRgb: options.rgb,
          showHsl: options.hsl,
        })
      );
      console.log('');
    } catch (error) {
      console.error(`Error: Invalid color "${colorHex}". Use hex format like #FF0000`);
      process.exit(1);
    }
  });

/**
 * Analogous command - generate analogous colors
 */
program
  .command('analogous <color>')
  .description('Generate analogous color palette')
  .option('-c, --count <number>', 'Number of colors', '5')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action((colorHex: string, options: AnalogousOptions) => {
    try {
      const baseColor = createColorFromHex(colorHex);
      const count = parseInt(options.count, 10);
      const colors = generatePalette(baseColor, 'analogous', count);

      console.log('\n🎨 Analogous Colors\n');
      console.log(
        renderPalette(colors, {
          showHex: options.hex,
          showRgb: options.rgb,
          showHsl: options.hsl,
        })
      );
      console.log('');
    } catch (error) {
      console.error(`Error: Invalid color "${colorHex}". Use hex format like #FF0000`);
      process.exit(1);
    }
  });

/**
 * Triadic command - generate triadic colors
 */
program
  .command('triadic <color>')
  .description('Generate triadic color palette')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action((colorHex: string, options: DisplayOptions) => {
    try {
      const baseColor = createColorFromHex(colorHex);
      const colors = generatePalette(baseColor, 'triadic');

      console.log('\n🎨 Triadic Colors\n');
      console.log(
        renderPalette(colors, {
          showHex: options.hex,
          showRgb: options.rgb,
          showHsl: options.hsl,
        })
      );
      console.log('');
    } catch (error) {
      console.error(`Error: Invalid color "${colorHex}". Use hex format like #FF0000`);
      process.exit(1);
    }
  });

/**
 * Monochromatic command - generate monochromatic palette
 */
program
  .command('monochromatic <color>')
  .alias('mono')
  .description('Generate monochromatic color palette')
  .option('-c, --count <number>', 'Number of shades', '5')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action((colorHex: string, options: MonochromaticOptions) => {
    try {
      const baseColor = createColorFromHex(colorHex);
      const count = parseInt(options.count, 10);
      const colors = generatePalette(baseColor, 'monochromatic', count);

      console.log('\n🎨 Monochromatic Palette\n');
      console.log(
        renderPalette(colors, {
          showHex: options.hex,
          showRgb: options.rgb,
          showHsl: options.hsl,
        })
      );
      console.log('');
    } catch (error) {
      console.error(`Error: Invalid color "${colorHex}". Use hex format like #FF0000`);
      process.exit(1);
    }
  });

/**
 * Export command - export a palette to a file
 */
program
  .command('export <colors...>')
  .description('Export colors to a file')
  .requiredOption(
    '-f, --format <type>',
    'Export format (hex, css, scss, json, js, ts, tailwind, svg)'
  )
  .option('-o, --output <file>', 'Output file (if not specified, prints to stdout)')
  .option('-p, --prefix <name>', 'Variable/color name prefix', 'color')
  .action((colorHexes: string[], options: ExportOptions) => {
    try {
      // Parse colors
      const colors = colorHexes.map(hex => createColorFromHex(hex));

      // Export
      const format = options.format as ExportFormat;
      const content = exportPalette(colors, format, {
        prefix: options.prefix,
        pretty: true,
      });

      if (options.output) {
        writeFileSync(options.output, content);
        console.log(`✓ Exported ${colors.length} colors to ${options.output}`);
      } else {
        console.log(content);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
