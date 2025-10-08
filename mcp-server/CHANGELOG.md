# Change Log

All notable changes to the Claude Color MCP Server will be documented in this file.

## [1.0.0] - 2025-10-08

### Added
- Initial MCP server implementation
- 8 tools for palette generation and management
  - generate_palette: Color theory-based generation
  - generate_from_prompt: AI-powered generation
  - extract_from_image: Image color extraction
  - extract_from_url: Website color extraction
  - get_recommendations: Personalized recommendations
  - list_favorites: Browse saved palettes
  - save_favorite: Save palettes
  - export_palette: Export in multiple formats
- 2 resources for data access
  - claude-color://favorites: Favorite palettes
  - claude-color://interactions: Interaction history
- Claude Desktop integration guide
- Complete tool documentation
- TypeScript implementation with MCP SDK
