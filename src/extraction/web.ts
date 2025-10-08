/**
 * Web color extraction using Playwright and node-vibrant
 *
 * Extracts dominant colors from websites by taking screenshots
 * and analyzing them with color extraction algorithms.
 */

import { chromium } from 'playwright';
import { Vibrant } from 'node-vibrant/node';
import { createColorFromHex } from '../core/conversions';
import { Palette, Color } from '../types';
import { nanoid } from 'nanoid';

/**
 * Extract colors from a website URL
 *
 * @param url - Website URL to extract colors from
 * @returns Palette with extracted colors and metadata
 */
export async function extractFromUrl(url: string): Promise<Palette> {
  // Launch browser in headless mode
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to URL with timeout
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);

    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: false });

    // Extract colors from screenshot
    const vibrant = new Vibrant(screenshot);
    const palette = await vibrant.getPalette();

    // Convert vibrant swatches to our Color format
    const colors: Color[] = [];
    const swatchNames = ['Vibrant', 'DarkVibrant', 'LightVibrant', 'Muted', 'DarkMuted'] as const;

    for (const name of swatchNames) {
      const swatch = palette[name];
      if (swatch) {
        colors.push(createColorFromHex(swatch.hex));
      }
    }

    // If we don't have 5 colors yet, add LightMuted if available
    if (colors.length < 5 && palette.LightMuted) {
      colors.push(createColorFromHex(palette.LightMuted.hex));
    }

    // Ensure we have exactly 5 colors (pad with variations if needed)
    while (colors.length < 5 && colors.length > 0) {
      // Duplicate the first color as a fallback
      const firstColor = colors[0];
      if (firstColor) {
        colors.push(firstColor);
      } else {
        break;
      }
    }

    // If we still don't have any colors, throw an error
    if (colors.length === 0) {
      throw new Error('No colors could be extracted from the website');
    }

    // Limit to 5 colors
    const finalColors = colors.slice(0, 5);

    return {
      id: nanoid(),
      colors: finalColors,
      scheme: 'random', // Extracted colors don't follow a specific scheme
      metadata: {
        created: new Date(),
        generationMethod: 'url',
        sourceUrl: url,
      },
    };
  } finally {
    // Always close the browser
    await browser.close();
  }
}

/**
 * Validate a URL format
 *
 * @param url - URL string to validate
 * @returns True if valid URL
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
