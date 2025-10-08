/**
 * AI-powered prompt interpretation for palette generation
 *
 * Uses Anthropic Claude to interpret natural language descriptions
 * and generate color palettes based on aesthetic intent.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createColorFromHex } from '../core/conversions';
import { Palette, ColorScheme } from '../types';
import { nanoid } from 'nanoid';

/**
 * Initialize Anthropic client
 */
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is required. ' +
        'Get your API key from https://console.anthropic.com/'
    );
  }

  return new Anthropic({ apiKey });
}

/**
 * System prompt for palette generation
 */
const SYSTEM_PROMPT = `You are a professional color designer who creates beautiful color palettes based on descriptions.

When given a description, you will:
1. Understand the mood, theme, and aesthetic intent
2. Generate a harmonious color palette of exactly 5 colors
3. Return ONLY a JSON object with this exact structure:

{
  "colors": ["#FF5733", "#C70039", "#900C3F", "#581845", "#FFC300"],
  "scheme": "analogous",
  "reasoning": "Brief explanation of color choices"
}

Rules:
- Colors must be valid 6-character hex codes with # prefix
- Always provide exactly 5 colors
- Scheme must be one of: complementary, analogous, triadic, tetradic, monochromatic, random
- Choose schemes that match the description's harmony needs
- Reasoning should be 1-2 sentences explaining the aesthetic intent

Examples:
- "warm sunset vibes" → warm oranges, reds, yellows (analogous)
- "ocean depths" → deep blues, teals, navy (monochromatic)
- "forest in spring" → various greens, earth tones (analogous)
- "vibrant and energetic" → bold contrasting colors (triadic or complementary)`;

/**
 * AI response structure
 */
interface AIPaletteResponse {
  colors: unknown;
  scheme?: unknown;
  reasoning?: string;
}

/**
 * Parse Claude's response to extract palette data
 */
function parsePaletteResponse(content: string): {
  colors: string[];
  scheme: ColorScheme;
  reasoning: string;
} {
  // Try to extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Invalid response format from AI');
  }

  const data = JSON.parse(jsonMatch[0]) as AIPaletteResponse;

  // Validate response structure
  if (!data.colors || !Array.isArray(data.colors) || data.colors.length !== 5) {
    throw new Error('Response must contain exactly 5 colors');
  }

  if (!data.scheme || typeof data.scheme !== 'string') {
    throw new Error('Response must include a color scheme');
  }

  // Validate hex colors
  const hexRegex = /^#[0-9A-F]{6}$/i;
  const colors: string[] = [];

  for (const color of data.colors) {
    if (typeof color !== 'string' || !hexRegex.test(color)) {
      throw new Error(`Invalid hex color: ${String(color)}`);
    }
    colors.push(color);
  }

  return {
    colors,
    scheme: data.scheme as ColorScheme,
    reasoning: data.reasoning || '',
  };
}

/**
 * Generate a color palette from a natural language prompt
 *
 * @param prompt - Natural language description of desired palette
 * @returns Generated palette with AI metadata
 */
export async function generateFromPrompt(prompt: string): Promise<Palette> {
  const client = getAnthropicClient();

  // Call Claude API
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
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

  // Parse palette data
  const { colors: hexColors, scheme, reasoning } = parsePaletteResponse(content.text);

  // Convert hex colors to full Color objects
  const colors = hexColors.map(hex => createColorFromHex(hex));

  // Create palette
  const palette: Palette = {
    id: nanoid(),
    colors,
    scheme,
    metadata: {
      created: new Date(),
      generationMethod: 'prompt',
      originalPrompt: prompt,
      aiReasoning: reasoning,
    },
  };

  return palette;
}

/**
 * Validate API key without making a request
 */
export function validateApiKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
