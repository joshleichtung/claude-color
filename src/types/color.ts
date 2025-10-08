/**
 * Color type definitions
 */

/**
 * RGB color representation with values 0-255
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color representation
 * - h: Hue (0-360 degrees)
 * - s: Saturation (0-100%)
 * - l: Lightness (0-100%)
 */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Complete color representation with all formats
 */
export interface Color {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  locked?: boolean;
}

/**
 * Color scheme types based on color theory
 */
export type ColorScheme =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'monochromatic'
  | 'random';

/**
 * Palette metadata
 */
export interface PaletteMetadata {
  created: Date;
  generationMethod: 'random' | 'prompt' | 'url' | 'image' | 'scheme';
  originalPrompt?: string;
  sourceUrl?: string;
  sourceImage?: string;
  aiReasoning?: string;
}

/**
 * A color palette containing multiple colors
 */
export interface Palette {
  id: string;
  colors: Color[];
  scheme: ColorScheme;
  metadata: PaletteMetadata;
}

/**
 * Options for palette generation
 */
export interface GenerationOptions {
  scheme?: ColorScheme;
  baseColor?: Color;
  count?: number;
  personalized?: boolean;
}

/**
 * Variation strategy for generating palette alternatives
 */
export type VariationStrategy =
  | 'hue-shift' // Shift base color hue
  | 'saturation-variation' // Vary saturation levels
  | 'lightness-variation' // Vary lightness levels
  | 'scheme-alternative' // Use different color scheme
  | 'hybrid'; // Combination of strategies

/**
 * A single palette suggestion with metadata
 */
export interface PaletteSuggestion {
  palette: Palette;
  description: string;
  strategy: VariationStrategy;
  rank: number; // 1-based ranking (1 = primary suggestion)
}

/**
 * A set of palette suggestions generated from one request
 */
export interface SuggestionSet {
  suggestions: PaletteSuggestion[];
  baseColor: Color;
  requestedScheme: ColorScheme;
  generatedAt: Date;
}

/**
 * A favorite palette saved by the user
 */
export interface FavoritePalette extends Palette {
  name: string;
  tags: string[];
  usageCount: number;
  savedAt: Date;
  lastUsed?: Date;
}

/**
 * Favorites database schema
 */
export interface FavoritesDatabase {
  favorites: FavoritePalette[];
  metadata: {
    version: string;
    lastModified: Date;
  };
}
