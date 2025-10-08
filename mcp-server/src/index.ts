#!/usr/bin/env node

/**
 * Claude Color MCP Server
 *
 * Exposes color palette generation capabilities via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP Server for Claude Color
 */
class ClaudeColorServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'claude-color',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  /**
   * Set up tool handlers
   */
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_palette',
          description:
            'Generate a color palette using a specific color scheme (complementary, analogous, triadic, tetradic, monochromatic, random)',
          inputSchema: {
            type: 'object',
            properties: {
              scheme: {
                type: 'string',
                enum: [
                  'complementary',
                  'analogous',
                  'triadic',
                  'tetradic',
                  'monochromatic',
                  'random',
                ],
                description: 'Color scheme to use for palette generation',
              },
              baseColor: {
                type: 'string',
                description: 'Optional base color in hex format (e.g., #FF5733)',
              },
              count: {
                type: 'number',
                description: 'Number of colors to generate (default: 5)',
                default: 5,
              },
            },
            required: ['scheme'],
          },
        },
        {
          name: 'generate_from_prompt',
          description:
            'Generate a color palette from a natural language description using AI',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description:
                  'Natural language description of desired palette (e.g., "warm autumn sunset colors")',
              },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'extract_from_image',
          description: 'Extract dominant colors from an image file',
          inputSchema: {
            type: 'object',
            properties: {
              imagePath: {
                type: 'string',
                description: 'Path to image file (png, jpg, jpeg, webp)',
              },
              count: {
                type: 'number',
                description: 'Number of colors to extract (default: 5)',
                default: 5,
              },
            },
            required: ['imagePath'],
          },
        },
        {
          name: 'extract_from_url',
          description: 'Extract colors from a website URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'Website URL to extract colors from',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'get_recommendations',
          description:
            'Get personalized palette recommendations based on user interaction history',
          inputSchema: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: 'Number of recommendations to generate (default: 5)',
                default: 5,
              },
            },
          },
        },
        {
          name: 'list_favorites',
          description: 'List saved favorite palettes',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of favorites to return',
              },
              tag: {
                type: 'string',
                description: 'Filter favorites by tag',
              },
            },
          },
        },
        {
          name: 'save_favorite',
          description: 'Save a palette as a favorite',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name for the favorite palette',
              },
              palette: {
                type: 'object',
                description: 'Palette object to save',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for categorizing the palette',
              },
            },
            required: ['name', 'palette'],
          },
        },
        {
          name: 'export_palette',
          description: 'Export a palette in various formats',
          inputSchema: {
            type: 'object',
            properties: {
              palette: {
                type: 'object',
                description: 'Palette object to export',
              },
              format: {
                type: 'string',
                enum: ['css', 'scss', 'tailwind', 'json', 'js', 'swift', 'android'],
                description: 'Export format',
              },
            },
            required: ['palette', 'format'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_palette':
            return await this.generatePalette(args);
          case 'generate_from_prompt':
            return await this.generateFromPrompt(args);
          case 'extract_from_image':
            return await this.extractFromImage(args);
          case 'extract_from_url':
            return await this.extractFromUrl(args);
          case 'get_recommendations':
            return await this.getRecommendations(args);
          case 'list_favorites':
            return await this.listFavorites(args);
          case 'save_favorite':
            return await this.saveFavorite(args);
          case 'export_palette':
            return await this.exportPalette(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Set up resource handlers
   */
  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'claude-color://favorites',
          name: 'Favorite Palettes',
          description: 'List of all saved favorite palettes',
          mimeType: 'application/json',
        },
        {
          uri: 'claude-color://interactions',
          name: 'User Interactions',
          description: 'History of user interactions for preference learning',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'claude-color://favorites') {
        // Return favorites data
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({ favorites: [] }), // Placeholder
            },
          ],
        };
      } else if (uri === 'claude-color://interactions') {
        // Return interactions data
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({ interactions: [] }), // Placeholder
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  /**
   * Generate palette tool implementation
   */
  private async generatePalette(args: any) {
    const { scheme, baseColor, count = 5 } = args;

    // Placeholder implementation - would call CLI or use library directly
    const palette = {
      id: 'generated',
      scheme,
      colors: Array.from({ length: count }, (_, i) => ({
        hex: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
        rgb: { r: 0, g: 0, b: 0 },
        hsl: { h: 0, s: 0, l: 0 },
      })),
      metadata: {
        created: new Date(),
        generationMethod: 'scheme',
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(palette, null, 2),
        },
      ],
    };
  }

  /**
   * Generate from prompt tool implementation
   */
  private async generateFromPrompt(args: any) {
    const { prompt } = args;

    // Placeholder - would use AI generation
    return {
      content: [
        {
          type: 'text',
          text: `Generating palette for prompt: "${prompt}"`,
        },
      ],
    };
  }

  /**
   * Extract from image tool implementation
   */
  private async extractFromImage(args: any) {
    const { imagePath, count = 5 } = args;

    // Placeholder - would use image extraction
    return {
      content: [
        {
          type: 'text',
          text: `Extracting ${count} colors from image: ${imagePath}`,
        },
      ],
    };
  }

  /**
   * Extract from URL tool implementation
   */
  private async extractFromUrl(args: any) {
    const { url } = args;

    // Placeholder - would use web extraction
    return {
      content: [
        {
          type: 'text',
          text: `Extracting colors from URL: ${url}`,
        },
      ],
    };
  }

  /**
   * Get recommendations tool implementation
   */
  private async getRecommendations(args: any) {
    const { count = 5 } = args;

    // Placeholder - would use recommendation engine
    return {
      content: [
        {
          type: 'text',
          text: `Generating ${count} personalized recommendations`,
        },
      ],
    };
  }

  /**
   * List favorites tool implementation
   */
  private async listFavorites(args: any) {
    const { limit, tag } = args;

    // Placeholder - would query favorites database
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ favorites: [] }, null, 2),
        },
      ],
    };
  }

  /**
   * Save favorite tool implementation
   */
  private async saveFavorite(args: any) {
    const { name, palette, tags = [] } = args;

    // Placeholder - would save to database
    return {
      content: [
        {
          type: 'text',
          text: `Saved palette "${name}" to favorites`,
        },
      ],
    };
  }

  /**
   * Export palette tool implementation
   */
  private async exportPalette(args: any) {
    const { palette, format } = args;

    // Placeholder - would export in specified format
    return {
      content: [
        {
          type: 'text',
          text: `Exported palette in ${format} format`,
        },
      ],
    };
  }

  /**
   * Start the server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Claude Color MCP server running on stdio');
  }
}

/**
 * Main entry point
 */
const server = new ClaudeColorServer();
server.run().catch(console.error);
