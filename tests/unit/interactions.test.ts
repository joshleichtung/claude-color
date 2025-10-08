/**
 * Tests for interaction tracking and preference analysis
 */

import { describe, expect, it } from '@jest/globals';
import {
  analyzeColorPreferences,
  analyzeSchemePreferences,
  calculatePreferenceScore,
  buildUserPreferences,
} from '../../src/learning/interactions';
import { UserInteraction, Palette, Color, ColorScheme } from '../../src/types';

describe('Preference Learning - Interactions', () => {
  // Helper to create test colors
  const createTestColor = (h: number, s: number, l: number): Color => ({
    hex: '#FF0000',
    rgb: { r: 255, g: 0, b: 0 },
    hsl: { h, s, l },
  });

  // Helper to create test interactions
  const createTestInteraction = (
    type: 'save' | 'edit' | 'generate' | 'view' | 'search' | 'export' | 'delete',
    scheme: string,
    colors: Color[]
  ): UserInteraction => ({
    id: `test-${Date.now()}`,
    timestamp: new Date(),
    type,
    paletteId: 'test-palette',
    colors,
    scheme,
    metadata: {},
  });

  describe('analyzeColorPreferences', () => {
    it('should return default preferences for empty interactions', () => {
      const result = analyzeColorPreferences([]);

      expect(result.huePreferences).toEqual([]);
      expect(result.saturationPreference).toBe(0.7);
      expect(result.lightnessPreference).toBe(0.5);
    });

    it('should return default preferences when no save/edit interactions', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction(
          'view',
          'complementary',
          [createTestColor(0, 0.8, 0.5)]
        ),
      ];

      const result = analyzeColorPreferences(interactions);

      expect(result.huePreferences).toEqual([]);
      expect(result.saturationPreference).toBe(0.7);
      expect(result.lightnessPreference).toBe(0.5);
    });

    it('should calculate average saturation from saved interactions', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.8, 0.5),
          createTestColor(180, 0.6, 0.5),
        ]),
        createTestInteraction('save', 'analogous', [
          createTestColor(30, 0.9, 0.5),
          createTestColor(60, 0.7, 0.5),
        ]),
      ];

      const result = analyzeColorPreferences(interactions);

      // Average: (0.8 + 0.6 + 0.9 + 0.7) / 4 = 0.75
      expect(result.saturationPreference).toBe(0.75);
    });

    it('should calculate average lightness from edit interactions', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('edit', 'triadic', [
          createTestColor(0, 0.8, 0.6),
          createTestColor(120, 0.8, 0.4),
        ]),
        createTestInteraction('edit', 'tetradic', [
          createTestColor(240, 0.8, 0.5),
          createTestColor(300, 0.8, 0.5),
        ]),
      ];

      const result = analyzeColorPreferences(interactions);

      // Average: (0.6 + 0.4 + 0.5 + 0.5) / 4 = 0.5
      expect(result.lightnessPreference).toBe(0.5);
    });

    it('should extract hue preferences from all colors', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.8, 0.5),
          createTestColor(180, 0.8, 0.5),
        ]),
        createTestInteraction('edit', 'analogous', [
          createTestColor(30, 0.8, 0.5),
        ]),
      ];

      const result = analyzeColorPreferences(interactions);

      expect(result.huePreferences).toEqual([0, 180, 30]);
    });

    it('should handle mixed interaction types', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.9, 0.6),
        ]),
        createTestInteraction('view', 'analogous', [
          createTestColor(180, 0.1, 0.1),
        ]),
        createTestInteraction('edit', 'triadic', [createTestColor(90, 0.5, 0.4)]),
      ];

      const result = analyzeColorPreferences(interactions);

      // Only save and edit should be counted
      expect(result.huePreferences).toEqual([0, 90]);
      expect(result.saturationPreference).toBe(0.7); // (0.9 + 0.5) / 2
      expect(result.lightnessPreference).toBe(0.5); // (0.6 + 0.4) / 2
    });
  });

  describe('analyzeSchemePreferences', () => {
    it('should return empty object for no interactions', () => {
      const result = analyzeSchemePreferences([]);
      expect(result).toEqual({});
    });

    it('should count save interactions by scheme', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', []),
        createTestInteraction('save', 'analogous', []),
        createTestInteraction('save', 'complementary', []),
      ];

      const result = analyzeSchemePreferences(interactions);

      expect(result).toEqual({
        complementary: 2,
        analogous: 1,
      });
    });

    it('should count generate interactions by scheme', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('generate', 'triadic', []),
        createTestInteraction('generate', 'triadic', []),
        createTestInteraction('generate', 'tetradic', []),
      ];

      const result = analyzeSchemePreferences(interactions);

      expect(result).toEqual({
        triadic: 2,
        tetradic: 1,
      });
    });

    it('should ignore non-save/generate interactions', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', []),
        createTestInteraction('edit', 'analogous', []),
        createTestInteraction('view', 'triadic', []),
        createTestInteraction('generate', 'complementary', []),
      ];

      const result = analyzeSchemePreferences(interactions);

      expect(result).toEqual({
        complementary: 2,
      });
    });

    it('should handle multiple schemes', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', []),
        createTestInteraction('save', 'analogous', []),
        createTestInteraction('save', 'triadic', []),
        createTestInteraction('generate', 'tetradic', []),
        createTestInteraction('generate', 'monochromatic', []),
        createTestInteraction('save', 'random', []),
      ];

      const result = analyzeSchemePreferences(interactions);

      expect(result).toEqual({
        complementary: 1,
        analogous: 1,
        triadic: 1,
        tetradic: 1,
        monochromatic: 1,
        random: 1,
      });
    });
  });

  describe('buildUserPreferences', () => {
    it('should build complete preference profile', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.8, 0.5),
          createTestColor(180, 0.8, 0.5),
        ]),
        createTestInteraction('generate', 'analogous', [
          createTestColor(30, 0.7, 0.6),
        ]),
        createTestInteraction('save', 'complementary', [
          createTestColor(120, 0.6, 0.4),
        ]),
      ];

      // Add metadata with tags to first interaction
      if (interactions[0]) {
        interactions[0].metadata = { tags: ['warm', 'professional'] };
      }
      if (interactions[2]) {
        interactions[2].metadata = { tags: ['warm', 'vibrant'] };
      }

      const result = buildUserPreferences(interactions);

      expect(result.totalInteractions).toBe(3);
      expect(result.favoriteSchemes).toEqual({
        complementary: 2,
        analogous: 1,
      });
      expect(result.commonTags).toEqual({
        warm: 2,
        professional: 1,
        vibrant: 1,
      });
      expect(result.recentActivity).toHaveLength(3);
    });

    it('should categorize hues into ranges', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'random', [
          createTestColor(15, 0.8, 0.5), // red-orange
          createTestColor(45, 0.8, 0.5), // yellow
          createTestColor(90, 0.8, 0.5), // green
          createTestColor(150, 0.8, 0.5), // cyan
          createTestColor(210, 0.8, 0.5), // blue
          createTestColor(270, 0.8, 0.5), // purple
          createTestColor(330, 0.8, 0.5), // magenta
        ]),
      ];

      const result = buildUserPreferences(interactions);

      expect(result.favoriteHueRanges).toHaveLength(7);
      expect(result.favoriteHueRanges.find(r => r.name === 'red-orange')?.count).toBe(
        1
      );
      expect(result.favoriteHueRanges.find(r => r.name === 'yellow')?.count).toBe(1);
      expect(result.favoriteHueRanges.find(r => r.name === 'green')?.count).toBe(1);
      expect(result.favoriteHueRanges.find(r => r.name === 'cyan')?.count).toBe(1);
      expect(result.favoriteHueRanges.find(r => r.name === 'blue')?.count).toBe(1);
      expect(result.favoriteHueRanges.find(r => r.name === 'purple')?.count).toBe(1);
      expect(result.favoriteHueRanges.find(r => r.name === 'magenta')?.count).toBe(1);
    });

    it('should calculate saturation and lightness ranges', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.6, 0.5),
        ]),
      ];

      const result = buildUserPreferences(interactions);

      expect(result.favoriteSaturationRange.min).toBeCloseTo(0.4, 2); // 0.6 - 0.2
      expect(result.favoriteSaturationRange.max).toBeCloseTo(0.8, 2); // 0.6 + 0.2
      expect(result.favoriteLightnessRange.min).toBeCloseTo(0.3, 2); // 0.5 - 0.2
      expect(result.favoriteLightnessRange.max).toBeCloseTo(0.7, 2); // 0.5 + 0.2
    });

    it('should limit recent activity to last 20 interactions', () => {
      const interactions: UserInteraction[] = Array.from({ length: 30 }, () =>
        createTestInteraction('save', 'random', [createTestColor(0, 0.8, 0.5)])
      );

      const result = buildUserPreferences(interactions);

      expect(result.totalInteractions).toBe(30);
      expect(result.recentActivity).toHaveLength(20);
    });

    it('should handle edge case saturation/lightness ranges', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.1, 0.9),
        ]),
      ];

      const result = buildUserPreferences(interactions);

      // Min should not go below 0
      expect(result.favoriteSaturationRange.min).toBe(0);
      // Max should not go above 1
      expect(result.favoriteLightnessRange.max).toBe(1);
    });
  });

  describe('calculatePreferenceScore', () => {
    const createTestPalette = (
      scheme: ColorScheme,
      colors: Color[]
    ): Palette => ({
      id: 'test',
      colors,
      scheme,
      metadata: {
        created: new Date(),
        generationMethod: 'scheme',
      },
    });

    it('should return base score of 50 for no matching preferences', () => {
      const palette = createTestPalette('complementary', [
        createTestColor(0, 0.5, 0.5),
      ]);

      const preferences = buildUserPreferences([]);

      const score = calculatePreferenceScore(palette, preferences);

      expect(score).toBe(50);
    });

    it('should add points for matching scheme', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.8, 0.5),
        ]),
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.8, 0.5),
        ]),
      ];

      const preferences = buildUserPreferences(interactions);
      const palette = createTestPalette('complementary', [
        createTestColor(0, 0.8, 0.5),
      ]);

      const score = calculatePreferenceScore(palette, preferences);

      // Base 50 + scheme match (100% of interactions = +20)
      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should add points for matching hues', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'random', [
          createTestColor(10, 0.8, 0.5),
          createTestColor(20, 0.8, 0.5),
        ]),
      ];

      const preferences = buildUserPreferences(interactions);
      const palette = createTestPalette('random', [
        createTestColor(15, 0.8, 0.5), // Within 30° of preferred hues
      ]);

      const score = calculatePreferenceScore(palette, preferences);

      expect(score).toBeGreaterThan(50);
    });

    it('should add points for matching saturation', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'random', [
          createTestColor(0, 0.8, 0.5),
          createTestColor(60, 0.8, 0.5),
        ]),
      ];

      const preferences = buildUserPreferences(interactions);
      const palette = createTestPalette('random', [
        createTestColor(0, 0.8, 0.5), // Exact saturation match
      ]);

      const score = calculatePreferenceScore(palette, preferences);

      expect(score).toBeGreaterThan(50);
    });

    it('should add points for matching lightness', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'random', [
          createTestColor(0, 0.8, 0.6),
          createTestColor(60, 0.8, 0.6),
        ]),
      ];

      const preferences = buildUserPreferences(interactions);
      const palette = createTestPalette('random', [
        createTestColor(0, 0.8, 0.6), // Exact lightness match
      ]);

      const score = calculatePreferenceScore(palette, preferences);

      expect(score).toBeGreaterThan(50);
    });

    it('should clamp score between 0 and 100', () => {
      const interactions: UserInteraction[] = Array.from({ length: 100 }, () =>
        createTestInteraction('save', 'complementary', [
          createTestColor(0, 0.8, 0.5),
        ])
      );

      const preferences = buildUserPreferences(interactions);
      const palette = createTestPalette('complementary', [
        createTestColor(0, 0.8, 0.5),
      ]);

      const score = calculatePreferenceScore(palette, preferences);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle multiple colors in palette', () => {
      const interactions: UserInteraction[] = [
        createTestInteraction('save', 'triadic', [
          createTestColor(0, 0.8, 0.5),
          createTestColor(120, 0.8, 0.5),
          createTestColor(240, 0.8, 0.5),
        ]),
      ];

      const preferences = buildUserPreferences(interactions);
      const palette = createTestPalette('triadic', [
        createTestColor(5, 0.8, 0.5),
        createTestColor(125, 0.8, 0.5),
        createTestColor(245, 0.8, 0.5),
      ]);

      const score = calculatePreferenceScore(palette, preferences);

      expect(score).toBeGreaterThan(50);
    });
  });
});
