/**
 * Personalized palette recommendations using preference learning
 *
 * Uses interaction history and LLM-powered analysis to suggest
 * palettes tailored to user's taste.
 */

import Anthropic from '@anthropic-ai/sdk';
import { Palette, Color, ColorScheme } from '../types';
import {
  buildUserPreferences,
  calculatePreferenceScore,
  analyzeColorPreferences,
} from './interactions';
import { UserInteraction } from '../types';
import { createColorFromHex } from '../core/conversions';
import { nanoid } from 'nanoid';

/**
 * Generate personalized palette recommendations
 *
 * @param interactions - User interaction history
 * @param count - Number of recommendations to generate
 * @returns Array of recommended palettes with scores
 */
export async function generatePersonalizedRecommendations(
  interactions: UserInteraction[],
  count: number = 5
): Promise<Array<{ palette: Palette; score: number; reasoning: string }>> {
  if (interactions.length < 3) {
    throw new Error('Need at least 3 interactions to generate personalized recommendations');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const client = new Anthropic({ apiKey });

  // Analyze user preferences
  const preferences = buildUserPreferences(interactions);
  const colorPrefs = analyzeColorPreferences(interactions);

  // Build prompt for LLM
  const prompt = buildRecommendationPrompt(preferences, colorPrefs, count);

  // Get recommendations from Claude
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    system: RECOMMENDATION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract response content
  const content = response.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  // Parse recommendations
  const recommendations = parseRecommendations(content.text);

  // Calculate preference scores
  const scoredRecommendations = recommendations.map(rec => ({
    ...rec,
    score: calculatePreferenceScore(rec.palette, preferences),
  }));

  // Sort by score
  scoredRecommendations.sort((a, b) => b.score - a.score);

  return scoredRecommendations.slice(0, count);
}

/**
 * System prompt for personalized recommendations
 */
const RECOMMENDATION_SYSTEM_PROMPT = `You are an expert color designer specializing in personalized palette recommendations.

Based on a user's interaction history and color preferences, you create tailored palette suggestions that match their unique taste.

Return recommendations as JSON array with this structure:
[
  {
    "colors": ["#FF5733", "#C70039", "#900C3F", "#581845", "#FFC300"],
    "scheme": "analogous",
    "reasoning": "Brief explanation of why this palette suits their taste"
  }
]

Rules:
- Colors must be valid 6-character hex codes with # prefix
- Each palette must have exactly 5 colors
- Scheme must be one of: complementary, analogous, triadic, tetradic, monochromatic, random
- Reasoning should explain how the palette matches the user's preferences
- Make recommendations diverse but aligned with their taste patterns`;

/**
 * Build recommendation prompt from user preferences
 */
function buildRecommendationPrompt(
  preferences: ReturnType<typeof buildUserPreferences>,
  colorPrefs: ReturnType<typeof analyzeColorPreferences>,
  count: number
): string {
  const favoriteScheme =
    Object.entries(preferences.favoriteSchemes).sort(([, a], [, b]) => b - a)[0]?.[0] || 'random';

  const favoriteHues = preferences.favoriteHueRanges
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(r => `${r.name} (${r.min}-${r.max}°)`)
    .join(', ');

  return `Generate ${count} personalized palette recommendations for a user with these preferences:

**Color Scheme Preferences:**
- Favorite scheme: ${favoriteScheme}
- All schemes used: ${Object.keys(preferences.favoriteSchemes).join(', ')}

**Color Preferences:**
- Favorite hue ranges: ${favoriteHues || 'varied'}
- Preferred saturation: ${Math.round(colorPrefs.saturationPreference * 100)}%
- Preferred lightness: ${Math.round(colorPrefs.lightnessPreference * 100)}%
- Saturation range: ${Math.round(preferences.favoriteSaturationRange.min * 100)}-${Math.round(preferences.favoriteSaturationRange.max * 100)}%
- Lightness range: ${Math.round(preferences.favoriteLightnessRange.min * 100)}-${Math.round(preferences.favoriteLightnessRange.max * 100)}%

**Tags Used:**
${
  Object.entries(preferences.commonTags)
    .slice(0, 5)
    .map(([tag, count]) => `- ${tag} (${count}x)`)
    .join('\n') || '- No tags yet'
}

**Activity:**
- Total interactions: ${preferences.totalInteractions}
- Recent activity: ${preferences.recentActivity.length} interactions

Create ${count} diverse palettes that match these preferences. Return ONLY the JSON array, no other text.`;
}

/**
 * Parse recommendation response from LLM
 */
function parseRecommendations(content: string): Array<{ palette: Palette; reasoning: string }> {
  // Extract JSON array from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from AI');
  }

  const data = JSON.parse(jsonMatch[0]) as Array<{
    colors: unknown;
    scheme: unknown;
    reasoning?: string;
  }>;

  const recommendations: Array<{ palette: Palette; reasoning: string }> = [];

  for (const item of data) {
    // Validate
    if (!item.colors || !Array.isArray(item.colors) || item.colors.length !== 5) {
      continue;
    }

    if (!item.scheme || typeof item.scheme !== 'string') {
      continue;
    }

    // Validate hex colors
    const hexRegex = /^#[0-9A-F]{6}$/i;
    const colors: Color[] = [];

    for (const color of item.colors) {
      if (typeof color === 'string' && hexRegex.test(color)) {
        colors.push(createColorFromHex(color));
      }
    }

    if (colors.length === 5) {
      recommendations.push({
        palette: {
          id: nanoid(),
          colors,
          scheme: item.scheme as ColorScheme,
          metadata: {
            created: new Date(),
            generationMethod: 'prompt',
            aiReasoning: item.reasoning || 'Personalized recommendation',
          },
        },
        reasoning: item.reasoning || 'Personalized recommendation',
      });
    }
  }

  return recommendations;
}

/**
 * Get quick recommendation based on recent interactions
 *
 * @param interactions - User interaction history
 * @returns Single recommended palette
 */
export async function getQuickRecommendation(
  interactions: UserInteraction[]
): Promise<{ palette: Palette; score: number; reasoning: string }> {
  const recommendations = await generatePersonalizedRecommendations(interactions, 1);
  const firstRecommendation = recommendations[0];
  if (!firstRecommendation) {
    throw new Error('Failed to generate recommendation');
  }
  return firstRecommendation;
}
