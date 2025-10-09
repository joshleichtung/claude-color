#!/usr/bin/env node

/**
 * Claude Color CLI entry point
 *
 * Provides commands for generating, viewing, and exporting color palettes
 */

/* eslint-disable no-console */

import 'dotenv/config';
import { Command } from 'commander';
import { VERSION } from './index';
import { createColorFromHex } from './core/conversions';
import { generatePalette, generateRandomColor } from './core/theory';
import { generateSuggestions } from './core/suggestions';
import { renderPalette, renderPaletteWithMetadata, renderSuggestionSet } from './terminal/renderer';
import { exportPalette, type ExportFormat } from './utils/export';
import { ColorScheme, Palette, FavoritesDatabase } from './types';
import { writeFileSync, readFileSync } from 'fs';
import { nanoid } from 'nanoid';
import { getFavoritesManager } from './storage/favorites';
import { generateFromPrompt, validateApiKey } from './ai/prompt';
import { extractFromUrl, validateUrl } from './extraction/web';
import { extractFromImage, validateImagePath, getSupportedFormats } from './extraction/image';
import { launchPaletteEditor } from './tui';
import { buildUserPreferences, analyzeColorPreferences } from './learning/interactions';
import { generatePersonalizedRecommendations } from './learning/recommendations';

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
  save?: string;
  tags?: string;
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
  .option('--save <name>', 'Save palette as favorite with given name')
  .option('--tags <tags>', 'Comma-separated tags for saved favorite')
  .action(async (options: GenerateOptions) => {
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

      // Track interaction
      const favManager = getFavoritesManager();
      await favManager.trackInteraction({
        type: 'generate',
        paletteId: palette.id,
        colors: palette.colors,
        scheme: palette.scheme,
      });

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

        // Track export interaction
        await favManager.trackInteraction({
          type: 'export',
          paletteId: palette.id,
          colors: palette.colors,
          scheme: palette.scheme,
          metadata: { exportFormat: format },
        });
      }

      // Save as favorite if requested
      if (options.save) {
        const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
        await favManager.saveFavorite(palette, options.save, tags);
        console.log(`\n✓ Saved as favorite: "${options.save}"`);

        // Track save interaction
        await favManager.trackInteraction({
          type: 'save',
          paletteId: palette.id,
          colors: palette.colors,
          scheme: palette.scheme,
          metadata: { tags },
        });
      }
    } else {
      // Multiple suggestions
      const suggestionSet = generateSuggestions(baseColor, scheme, numSuggestions);
      console.log(renderSuggestionSet(suggestionSet, renderOptions));

      // Track interactions for each suggestion
      const favManager = getFavoritesManager();
      for (const suggestion of suggestionSet.suggestions) {
        await favManager.trackInteraction({
          type: 'generate',
          paletteId: suggestion.palette.id,
          colors: suggestion.palette.colors,
          scheme: suggestion.palette.scheme,
        });
      }

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

        // Track export interaction
        await favManager.trackInteraction({
          type: 'export',
          paletteId: suggestionSet.suggestions[0].palette.id,
          colors: suggestionSet.suggestions[0].palette.colors,
          scheme: suggestionSet.suggestions[0].palette.scheme,
          metadata: { exportFormat: format },
        });
      }

      // Save first suggestion as favorite if requested
      if (options.save && suggestionSet.suggestions[0]) {
        const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
        await favManager.saveFavorite(suggestionSet.suggestions[0].palette, options.save, tags);
        console.log(`\n✓ Saved first suggestion as favorite: "${options.save}"`);

        // Track save interaction
        await favManager.trackInteraction({
          type: 'save',
          paletteId: suggestionSet.suggestions[0].palette.id,
          colors: suggestionSet.suggestions[0].palette.colors,
          scheme: suggestionSet.suggestions[0].palette.scheme,
          metadata: { tags },
        });
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

/**
 * Prompt command - AI-powered palette generation
 */
program
  .command('prompt <description>')
  .description('Generate a palette from a natural language description using AI')
  .option('--save <name>', 'Save palette as favorite with given name')
  .option('--tags <tags>', 'Comma-separated tags for saved favorite')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action(
    async (
      description: string,
      options: { save?: string; tags?: string; hex: boolean; rgb: boolean; hsl: boolean }
    ) => {
      try {
        // Validate API key
        if (!validateApiKey()) {
          console.error('Error: ANTHROPIC_API_KEY environment variable is required');
          console.error('Get your API key from https://console.anthropic.com/');
          console.error('\nSet it using:');
          console.error('  export ANTHROPIC_API_KEY=your-key-here');
          console.error('Or create a .env file with: ANTHROPIC_API_KEY=your-key-here');
          process.exit(1);
        }

        console.log(`\n🤖 Generating palette from: "${description}"\n`);

        // Generate palette from AI
        const palette = await generateFromPrompt(description);

        // Display palette
        console.log(
          renderPaletteWithMetadata(palette, {
            showHex: options.hex,
            showRgb: options.rgb,
            showHsl: options.hsl,
          })
        );

        // Show AI reasoning if available
        if (palette.metadata.aiReasoning) {
          console.log(`\n💡 AI Reasoning: ${palette.metadata.aiReasoning}\n`);
        }

        // Track interaction
        const favManager = getFavoritesManager();
        await favManager.trackInteraction({
          type: 'generate',
          paletteId: palette.id,
          colors: palette.colors,
          scheme: palette.scheme,
          metadata: { prompt: description },
        });

        // Save as favorite if requested
        if (options.save) {
          const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
          await favManager.saveFavorite(palette, options.save, tags);
          console.log(`✓ Saved as favorite: "${options.save}"`);

          // Track save interaction
          await favManager.trackInteraction({
            type: 'save',
            paletteId: palette.id,
            colors: palette.colors,
            scheme: palette.scheme,
            metadata: { tags, prompt: description },
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        }
        process.exit(1);
      }
    }
  );

/**
 * From URL command - extract colors from a website
 */
program
  .command('from-url <url>')
  .alias('url')
  .description('Extract color palette from a website')
  .option('--save <name>', 'Save palette as favorite with given name')
  .option('--tags <tags>', 'Comma-separated tags for saved favorite')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action(
    async (
      url: string,
      options: { save?: string; tags?: string; hex: boolean; rgb: boolean; hsl: boolean }
    ) => {
      try {
        // Validate URL
        if (!validateUrl(url)) {
          console.error('Error: Invalid URL. Must be http:// or https://');
          process.exit(1);
        }

        console.log(`\n🌐 Extracting colors from: ${url}\n`);

        // Extract palette from URL
        const palette = await extractFromUrl(url);

        // Display palette
        console.log(
          renderPaletteWithMetadata(palette, {
            showHex: options.hex,
            showRgb: options.rgb,
            showHsl: options.hsl,
          })
        );

        console.log('');

        // Track interaction
        const favManager = getFavoritesManager();
        await favManager.trackInteraction({
          type: 'generate',
          paletteId: palette.id,
          colors: palette.colors,
          scheme: palette.scheme,
        });

        // Save as favorite if requested
        if (options.save) {
          const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
          await favManager.saveFavorite(palette, options.save, tags);
          console.log(`✓ Saved as favorite: "${options.save}"\n`);

          // Track save interaction
          await favManager.trackInteraction({
            type: 'save',
            paletteId: palette.id,
            colors: palette.colors,
            scheme: palette.scheme,
            metadata: { tags },
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        }
        process.exit(1);
      }
    }
  );

/**
 * From image command - extract colors from an image file
 */
program
  .command('from-image <path>')
  .alias('img')
  .description('Extract color palette from an image file')
  .option('--save <name>', 'Save palette as favorite with given name')
  .option('--tags <tags>', 'Comma-separated tags for saved favorite')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action(
    async (
      imagePath: string,
      options: { save?: string; tags?: string; hex: boolean; rgb: boolean; hsl: boolean }
    ) => {
      try {
        // Validate image path
        const isValid = await validateImagePath(imagePath);
        if (!isValid) {
          console.error(`Error: Cannot read image file: ${imagePath}`);
          console.error(`Supported formats: ${getSupportedFormats().join(', ')}`);
          process.exit(1);
        }

        console.log(`\n🖼️  Extracting colors from: ${imagePath}\n`);

        // Extract palette from image
        const palette = await extractFromImage(imagePath);

        // Display palette
        console.log(
          renderPaletteWithMetadata(palette, {
            showHex: options.hex,
            showRgb: options.rgb,
            showHsl: options.hsl,
          })
        );

        console.log('');

        // Track interaction
        const favManager = getFavoritesManager();
        await favManager.trackInteraction({
          type: 'generate',
          paletteId: palette.id,
          colors: palette.colors,
          scheme: palette.scheme,
        });

        // Save as favorite if requested
        if (options.save) {
          const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
          await favManager.saveFavorite(palette, options.save, tags);
          console.log(`✓ Saved as favorite: "${options.save}"\n`);

          // Track save interaction
          await favManager.trackInteraction({
            type: 'save',
            paletteId: palette.id,
            colors: palette.colors,
            scheme: palette.scheme,
            metadata: { tags },
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        }
        process.exit(1);
      }
    }
  );

/**
 * Edit command - interactive palette editor
 */
program
  .command('edit <colors...>')
  .description('Interactively edit a color palette')
  .option('--scheme <type>', 'Color scheme for the palette', 'random')
  .action((colorHexes: string[], options: { scheme: string }) => {
    try {
      // Parse colors
      const colors = colorHexes.map(hex => createColorFromHex(hex));

      // Ensure we have exactly 5 colors
      if (colors.length > 5) {
        console.error('Error: Maximum 5 colors allowed');
        process.exit(1);
      }

      // Pad with random colors if less than 5
      while (colors.length < 5) {
        colors.push(generateRandomColor());
      }

      // Create initial palette
      const palette: Palette = {
        id: nanoid(),
        colors,
        scheme: options.scheme as ColorScheme,
        metadata: {
          created: new Date(),
          generationMethod: 'scheme',
        },
      };

      // Launch interactive editor
      launchPaletteEditor(
        palette,
        (editedPalette: Palette) => {
          // Save the edited palette
          console.log('\n✓ Palette saved!\n');
          console.log(
            renderPaletteWithMetadata(editedPalette, {
              showHex: true,
              showRgb: false,
              showHsl: false,
            })
          );

          // Save as favorite and track interactions (non-blocking)
          void (async () => {
            const favManager = getFavoritesManager();
            await favManager.saveFavorite(editedPalette, `edited-${editedPalette.id.slice(0, 8)}`, [
              'edited',
            ]);

            // Track edit and save interactions
            await favManager.trackInteraction({
              type: 'edit',
              paletteId: editedPalette.id,
              colors: editedPalette.colors,
              scheme: editedPalette.scheme,
            });
            await favManager.trackInteraction({
              type: 'save',
              paletteId: editedPalette.id,
              colors: editedPalette.colors,
              scheme: editedPalette.scheme,
              metadata: { tags: ['edited'] },
            });
          })();

          console.log('\nSaved to favorites. Use "claude-color favorites" to view.');
        },
        () => {
          console.log('\n✓ Exited without saving');
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

/**
 * Favorites command - list saved palettes
 */
program
  .command('favorites')
  .alias('fav')
  .description('List favorite palettes')
  .option('-l, --limit <number>', 'Maximum number to show', '10')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action(async (options: { limit: string; hex: boolean; rgb: boolean; hsl: boolean }) => {
    try {
      const favManager = getFavoritesManager();
      const limit = parseInt(options.limit, 10);
      const favorites = await favManager.listFavorites(limit);

      if (favorites.length === 0) {
        console.log('\nNo favorite palettes saved yet.');
        console.log('Use --save option when generating palettes to save them.');
        return;
      }

      console.log(`\n📚 Your Favorite Palettes (${await favManager.count()} total)\n`);

      favorites.forEach(fav => {
        console.log(`🎨 ${fav.name} (${fav.id})`);
        if (fav.tags.length > 0) {
          console.log(`   Tags: ${fav.tags.join(', ')}`);
        }
        console.log(`   Scheme: ${fav.scheme} | Used: ${fav.usageCount} times`);
        console.log(
          renderPalette(fav.colors, {
            showHex: options.hex,
            showRgb: options.rgb,
            showHsl: options.hsl,
          })
        );
        console.log('');
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

/**
 * Search command - search favorite palettes
 */
program
  .command('search <query>')
  .description('Search favorite palettes by name, tag, or color')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action(async (query: string, options: { hex: boolean; rgb: boolean; hsl: boolean }) => {
    try {
      const favManager = getFavoritesManager();
      const results = await favManager.searchFavorites(query);

      // Track search interaction
      const firstResult = results[0];
      if (firstResult) {
        await favManager.trackInteraction({
          type: 'search',
          paletteId: firstResult.id,
          colors: firstResult.colors,
          scheme: firstResult.scheme,
          metadata: { searchQuery: query },
        });
      }

      if (results.length === 0) {
        console.log(`\nNo favorites found matching "${query}"`);
        return;
      }

      console.log(`\n🔍 Search Results for "${query}" (${results.length} found)\n`);

      results.forEach(fav => {
        console.log(`🎨 ${fav.name} (${fav.id})`);
        if (fav.tags.length > 0) {
          console.log(`   Tags: ${fav.tags.join(', ')}`);
        }
        console.log(
          renderPalette(fav.colors, {
            showHex: options.hex,
            showRgb: options.rgb,
            showHsl: options.hsl,
          })
        );
        console.log('');
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

/**
 * Delete favorite command
 */
program
  .command('delete-favorite <id>')
  .alias('del-fav')
  .description('Delete a favorite palette by ID')
  .action(async (id: string) => {
    try {
      const favManager = getFavoritesManager();
      const favorite = await favManager.getFavorite(id);
      const deleted = await favManager.deleteFavorite(id);

      if (deleted && favorite) {
        // Track delete interaction
        await favManager.trackInteraction({
          type: 'delete',
          paletteId: favorite.id,
          colors: favorite.colors,
          scheme: favorite.scheme,
        });
        console.log(`\n✓ Deleted favorite: ${id}`);
      } else {
        console.error(`\nError: No favorite found with ID: ${id}`);
        process.exit(1);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

/**
 * Export favorites command
 */
program
  .command('export-favorites <file>')
  .description('Export all favorites to a JSON file')
  .action(async (file: string) => {
    try {
      const favManager = getFavoritesManager();
      const data = await favManager.exportAll();

      writeFileSync(file, JSON.stringify(data, null, 2));
      console.log(`\n✓ Exported ${data.favorites.length} favorites to ${file}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

/**
 * Import favorites command
 */
program
  .command('import-favorites <file>')
  .description('Import favorites from a JSON file')
  .option('--overwrite', 'Overwrite existing favorites with same ID', false)
  .action(async (file: string, options: { overwrite: boolean }) => {
    try {
      const content = readFileSync(file, 'utf-8');
      const data: unknown = JSON.parse(content);

      // Validate imported data structure
      if (
        !data ||
        typeof data !== 'object' ||
        !('favorites' in data) ||
        !Array.isArray((data as { favorites: unknown }).favorites)
      ) {
        throw new Error('Invalid favorites file format');
      }

      const favManager = getFavoritesManager();
      await favManager.importFavorites(data as FavoritesDatabase, options.overwrite);

      const count = await favManager.count();
      console.log(`\n✓ Import complete. Total favorites: ${count}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

/**
 * Preferences command - view user taste profile
 */
program
  .command('preferences')
  .alias('prefs')
  .description('View your color palette preferences and taste profile')
  .action(async () => {
    try {
      const favManager = getFavoritesManager();
      const interactions = await favManager.getInteractions();

      if (interactions.length < 3) {
        console.log('\n📊 Not enough data to build preferences yet.');
        console.log(
          `You have ${interactions.length} interaction(s). Need at least 3 to analyze preferences.`
        );
        console.log('\nGenerate, save, and explore more palettes to build your taste profile!\n');
        return;
      }

      const preferences = buildUserPreferences(interactions);
      const colorPrefs = analyzeColorPreferences(interactions);

      console.log('\n🎨 Your Color Palette Preferences\n');
      console.log(`Total Interactions: ${preferences.totalInteractions}`);
      console.log(`Recent Activity: ${preferences.recentActivity.length} interactions\n`);

      // Favorite schemes
      console.log('📐 Favorite Color Schemes:');
      const sortedSchemes = Object.entries(preferences.favoriteSchemes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
      sortedSchemes.forEach(([scheme, count]) => {
        console.log(`  • ${scheme}: ${count} times`);
      });
      console.log('');

      // Favorite hue ranges
      if (preferences.favoriteHueRanges.length > 0) {
        console.log('🌈 Favorite Color Ranges:');
        preferences.favoriteHueRanges
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .forEach(range => {
            console.log(`  • ${range.name} (${range.min}°-${range.max}°): ${range.count} colors`);
          });
        console.log('');
      }

      // Color preferences
      console.log('🎯 Color Characteristics:');
      console.log(`  • Saturation: ${Math.round(colorPrefs.saturationPreference * 100)}%`);
      console.log(`  • Lightness: ${Math.round(colorPrefs.lightnessPreference * 100)}%`);
      console.log('');

      // Tags
      if (Object.keys(preferences.commonTags).length > 0) {
        console.log('🏷️  Common Tags:');
        Object.entries(preferences.commonTags)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .forEach(([tag, count]) => {
            console.log(`  • ${tag}: ${count} times`);
          });
        console.log('');
      }

      console.log(
        '💡 Tip: Use "claude-color recommend" to get personalized palette suggestions!\n'
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

/**
 * Recommend command - generate personalized recommendations
 */
program
  .command('recommend')
  .alias('rec')
  .description('Get personalized palette recommendations based on your taste')
  .option('-c, --count <number>', 'Number of recommendations (1-10)', '3')
  .option('--hex', 'Show hex values', true)
  .option('--rgb', 'Show RGB values', false)
  .option('--hsl', 'Show HSL values', false)
  .action(async (options: { count: string; hex: boolean; rgb: boolean; hsl: boolean }) => {
    try {
      // Validate API key
      if (!validateApiKey()) {
        console.error('Error: ANTHROPIC_API_KEY environment variable is required');
        console.error('Get your API key from https://console.anthropic.com/');
        console.error('\nSet it using:');
        console.error('  export ANTHROPIC_API_KEY=your-key-here');
        console.error('Or create a .env file with: ANTHROPIC_API_KEY=your-key-here');
        process.exit(1);
      }

      const favManager = getFavoritesManager();
      const interactions = await favManager.getInteractions();

      if (interactions.length < 3) {
        console.log('\n📊 Not enough data for personalized recommendations yet.');
        console.log(
          `You have ${interactions.length} interaction(s). Need at least 3 to generate recommendations.`
        );
        console.log('\nGenerate, save, and explore more palettes to build your taste profile!\n');
        return;
      }

      const count = Math.min(10, Math.max(1, parseInt(options.count, 10)));
      console.log(
        `\n🤖 Generating ${count} personalized recommendation(s) based on your taste...\n`
      );

      const recommendations = await generatePersonalizedRecommendations(interactions, count);

      console.log(`✨ Your Personalized Recommendations\n`);

      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. Score: ${rec.score}/100`);
        if (rec.reasoning) {
          console.log(`   💡 ${rec.reasoning}`);
        }
        console.log(
          renderPalette(rec.palette.colors, {
            showHex: options.hex,
            showRgb: options.rgb,
            showHsl: options.hsl,
          })
        );
        console.log('');
      });

      console.log(
        '💡 Tip: Use --save option with generate/prompt commands to save palettes you like!\n'
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
