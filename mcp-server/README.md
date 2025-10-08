# Claude Color MCP Server

Model Context Protocol server for Claude Color - enables AI assistants to generate and manage color palettes.

## What is MCP?

The Model Context Protocol (MCP) allows AI assistants like Claude to interact with external tools and data sources. This MCP server exposes Claude Color's functionality so Claude can generate palettes, extract colors, and manage favorites directly.

## Features

### Tools

- **generate_palette**: Generate palettes with color theory schemes
- **generate_from_prompt**: AI-powered palette generation from natural language
- **extract_from_image**: Extract dominant colors from images
- **extract_from_url**: Extract colors from websites
- **get_recommendations**: Get personalized palette recommendations
- **list_favorites**: List saved favorite palettes
- **save_favorite**: Save palettes to favorites
- **export_palette**: Export palettes in various formats

### Resources

- **claude-color://favorites**: Access to all saved favorite palettes
- **claude-color://interactions**: User interaction history for preference learning

## Installation

### For Claude Desktop

1. Install the MCP server:
```bash
npm install -g @claude-color/mcp-server
```

2. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "claude-color": {
      "command": "claude-color-mcp"
    }
  }
}
```

3. Restart Claude Desktop

### For Other MCP Clients

Install the server:
```bash
npm install -g @claude-color/mcp-server
```

Run the server:
```bash
claude-color-mcp
```

The server communicates via stdio and implements the Model Context Protocol specification.

## Usage with Claude

Once installed, you can ask Claude to:

- "Generate a complementary color palette"
- "Create a warm autumn color scheme"
- "Extract colors from this image: /path/to/image.png"
- "Get color palette recommendations based on my preferences"
- "Show me my favorite palettes"
- "Export this palette as Tailwind config"

Claude will use the MCP tools to fulfill these requests.

## Tools Reference

### generate_palette

Generate a palette using color theory schemes.

**Parameters:**
- `scheme` (required): Color scheme (complementary, analogous, triadic, tetradic, monochromatic, random)
- `baseColor` (optional): Base color in hex format
- `count` (optional): Number of colors (default: 5)

**Example:**
```json
{
  "scheme": "complementary",
  "baseColor": "#FF5733",
  "count": 5
}
```

### generate_from_prompt

Generate a palette from natural language using AI.

**Parameters:**
- `prompt` (required): Description of desired palette

**Example:**
```json
{
  "prompt": "warm autumn sunset colors with deep oranges and purples"
}
```

### extract_from_image

Extract dominant colors from an image.

**Parameters:**
- `imagePath` (required): Path to image file
- `count` (optional): Number of colors to extract (default: 5)

**Example:**
```json
{
  "imagePath": "/Users/josh/pictures/sunset.jpg",
  "count": 5
}
```

### extract_from_url

Extract colors from a website.

**Parameters:**
- `url` (required): Website URL

**Example:**
```json
{
  "url": "https://example.com"
}
```

### get_recommendations

Get personalized palette recommendations.

**Parameters:**
- `count` (optional): Number of recommendations (default: 5)

**Example:**
```json
{
  "count": 3
}
```

### list_favorites

List saved favorite palettes.

**Parameters:**
- `limit` (optional): Maximum number to return
- `tag` (optional): Filter by tag

**Example:**
```json
{
  "limit": 10,
  "tag": "professional"
}
```

### save_favorite

Save a palette to favorites.

**Parameters:**
- `name` (required): Name for the palette
- `palette` (required): Palette object
- `tags` (optional): Tags for categorization

**Example:**
```json
{
  "name": "My Autumn Palette",
  "palette": { "colors": [...] },
  "tags": ["warm", "autumn"]
}
```

### export_palette

Export a palette in various formats.

**Parameters:**
- `palette` (required): Palette object
- `format` (required): Export format (css, scss, tailwind, json, js, swift, android)

**Example:**
```json
{
  "palette": { "colors": [...] },
  "format": "tailwind"
}
```

## Resources Reference

### claude-color://favorites

Access all saved favorite palettes as JSON.

### claude-color://interactions

Access user interaction history for preference learning as JSON.

## Development

Build the server:
```bash
npm run build
```

Run in development:
```bash
npm run dev
```

## Requirements

- Node.js 18 or higher
- Anthropic API key (set as `ANTHROPIC_API_KEY` environment variable)

## License

MIT
