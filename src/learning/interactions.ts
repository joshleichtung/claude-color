/**
 * User interaction tracking for preference learning
 *
 * Tracks user behavior to build taste profiles and provide
 * personalized recommendations.
 */

import { Palette, Color, UserInteraction } from '../types';

/**
 * Aggregated user preferences
 */
export interface UserPreferences {
  totalInteractions: number;
  favoriteSchemes: Record<string, number>;
  favoriteHueRanges: Array<{ min: number; max: number; count: number; name: string }>;
  favoriteSaturationRange: { min: number; max: number };
  favoriteLightnessRange: { min: number; max: number };
  commonTags: Record<string, number>;
  recentActivity: UserInteraction[];
}

/**
 * Analyze color preferences from interaction history
 */
export function analyzeColorPreferences(interactions: UserInteraction[]): {
  huePreferences: number[];
  saturationPreference: number;
  lightnessPreference: number;
} {
  if (interactions.length === 0) {
    return {
      huePreferences: [],
      saturationPreference: 0.7,
      lightnessPreference: 0.5,
    };
  }

  // Collect all colors from saved/edited palettes
  const allColors: Color[] = [];
  for (const interaction of interactions) {
    if (interaction.type === 'save' || interaction.type === 'edit') {
      allColors.push(...interaction.colors);
    }
  }

  if (allColors.length === 0) {
    return {
      huePreferences: [],
      saturationPreference: 0.7,
      lightnessPreference: 0.5,
    };
  }

  // Calculate hue preferences (which hues user prefers)
  const hues = allColors.map(c => c.hsl.h);

  // Calculate average saturation and lightness
  const saturations = allColors.map(c => c.hsl.s);
  const lightnesses = allColors.map(c => c.hsl.l);

  const avgSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;
  const avgLightness = lightnesses.reduce((a, b) => a + b, 0) / lightnesses.length;

  return {
    huePreferences: hues,
    saturationPreference: avgSaturation,
    lightnessPreference: avgLightness,
  };
}

/**
 * Analyze scheme preferences from interaction history
 */
export function analyzeSchemePreferences(interactions: UserInteraction[]): Record<string, number> {
  const schemeCounts: Record<string, number> = {};

  for (const interaction of interactions) {
    if (interaction.type === 'save' || interaction.type === 'generate') {
      const scheme = interaction.scheme;
      schemeCounts[scheme] = (schemeCounts[scheme] || 0) + 1;
    }
  }

  return schemeCounts;
}

/**
 * Calculate preference score for a palette based on user history
 *
 * @param palette - Palette to score
 * @param preferences - User preferences from interaction history
 * @returns Score from 0-100
 */
export function calculatePreferenceScore(palette: Palette, preferences: UserPreferences): number {
  let score = 50; // Base score

  // Scheme preference (up to +20 points)
  const schemeCount = preferences.favoriteSchemes[palette.scheme] || 0;
  const totalSchemeInteractions = Object.values(preferences.favoriteSchemes).reduce(
    (a, b) => a + b,
    0
  );
  if (totalSchemeInteractions > 0) {
    const schemePreference = schemeCount / totalSchemeInteractions;
    score += schemePreference * 20;
  }

  // Color analysis (up to +30 points)
  const colorPrefs = analyzeColorPreferences(preferences.recentActivity);
  if (colorPrefs.huePreferences.length > 0) {
    // Check if palette colors match preferred hues
    const paletteHues = palette.colors.map(c => c.hsl.h);
    const hueMatches = paletteHues.filter(h =>
      colorPrefs.huePreferences.some(ph => Math.abs(h - ph) < 30)
    ).length;
    score += (hueMatches / palette.colors.length) * 15;

    // Check saturation match
    const avgPaletteSaturation =
      palette.colors.reduce((sum, c) => sum + c.hsl.s, 0) / palette.colors.length;
    const saturationDiff = Math.abs(avgPaletteSaturation - colorPrefs.saturationPreference);
    score += (1 - saturationDiff) * 7.5;

    // Check lightness match
    const avgPaletteLightness =
      palette.colors.reduce((sum, c) => sum + c.hsl.l, 0) / palette.colors.length;
    const lightnessDiff = Math.abs(avgPaletteLightness - colorPrefs.lightnessPreference);
    score += (1 - lightnessDiff) * 7.5;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Build user preferences from interaction history
 */
export function buildUserPreferences(interactions: UserInteraction[]): UserPreferences {
  const schemePreferences = analyzeSchemePreferences(interactions);
  const colorPrefs = analyzeColorPreferences(interactions);

  // Analyze tags
  const tagCounts: Record<string, number> = {};
  for (const interaction of interactions) {
    if (interaction.metadata?.tags) {
      for (const tag of interaction.metadata.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }

  // Group hues into ranges
  const hueRanges: Array<{ min: number; max: number; count: number; name: string }> = [
    { min: 0, max: 30, count: 0, name: 'red-orange' },
    { min: 30, max: 60, count: 0, name: 'yellow' },
    { min: 60, max: 120, count: 0, name: 'green' },
    { min: 120, max: 180, count: 0, name: 'cyan' },
    { min: 180, max: 240, count: 0, name: 'blue' },
    { min: 240, max: 300, count: 0, name: 'purple' },
    { min: 300, max: 360, count: 0, name: 'magenta' },
  ];

  for (const hue of colorPrefs.huePreferences) {
    const range = hueRanges.find(r => hue >= r.min && hue < r.max);
    if (range) {
      range.count++;
    }
  }

  return {
    totalInteractions: interactions.length,
    favoriteSchemes: schemePreferences,
    favoriteHueRanges: hueRanges.filter(r => r.count > 0),
    favoriteSaturationRange: {
      min: Math.max(0, colorPrefs.saturationPreference - 0.2),
      max: Math.min(1, colorPrefs.saturationPreference + 0.2),
    },
    favoriteLightnessRange: {
      min: Math.max(0, colorPrefs.lightnessPreference - 0.2),
      max: Math.min(1, colorPrefs.lightnessPreference + 0.2),
    },
    commonTags: tagCounts,
    recentActivity: interactions.slice(-20), // Last 20 interactions
  };
}
