# Claude Color 🎨

> AI-powered terminal color palette generator with preference learning

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Status**: 🚀 **Production Ready** - All phases complete!

## Vision

Bring the power of [coolors.co](https://coolors.co) to your terminal with AI intelligence that learns your aesthetic preferences over time. Claude Color is an interactive color palette generator that integrates seamlessly with [Claude Code](https://claude.ai/code) workflows.

## Features

- 🎨 **Multi-Modal Generation**: Natural language prompts, URL extraction, image analysis, and algorithmic schemes
- 🤖 **AI-Powered**: Claude AI understands aesthetic intent and generates palettes from descriptions
- 🧠 **Learns Your Taste**: Preference learning system that gets smarter with every palette interaction
- 🖥️ **Interactive TUI**: Beautiful Ink-based terminal interface with real-time palette editing
- 💾 **Favorites Library**: Save, search, tag, and organize your color palettes locally
- 📤 **8 Export Formats**: HEX, CSS, SCSS, JSON, JavaScript, TypeScript, Tailwind, and SVG
- 🎯 **Personalized Recommendations**: AI-powered suggestions based on your color preferences
- 🔒 **Privacy-First**: All data stored locally in `~/.claude-color/favorites.json`

## Installation

```bash
# Global installation (recommended)
npm install -g claude-color

# Or use with npx (no installation)
npx claude-color random
```

### Setup for AI Features

To use AI-powered palette generation and personalized recommendations, you need an Anthropic API key:

```bash
# Get your API key from https://console.anthropic.com/
export ANTHROPIC_API_KEY=your-key-here

# Or create a .env file
echo "ANTHROPIC_API_KEY=your-key-here" > .env
```

## Quick Start

### Basic Palette Generation

```bash
# Generate a random palette
claude-color random

# Generate with a specific scheme
claude-color generate --scheme complementary --base "#FF6B6B"

# Natural language AI generation (requires ANTHROPIC_API_KEY)
claude-color prompt "warm sunset over the ocean"

# Extract colors from a website
claude-color from-url https://stripe.com

# Extract colors from an image
claude-color from-image ~/Desktop/photo.jpg
```

### Preference Learning & Recommendations

```bash
# View your color preferences (learns from your interactions)
claude-color preferences

# Get personalized palette recommendations
claude-color recommend --count 5
```

### Working with Favorites

```bash
# Save a generated palette
claude-color generate --scheme analogous --save "My Cool Palette" --tags "blue,professional"

# List your favorites
claude-color favorites

# Search favorites
claude-color search "professional"

# Export all favorites to JSON
claude-color export-favorites ~/my-palettes.json
```

### Interactive Editing

```bash
# Edit a palette interactively
claude-color edit "#FF6B6B" "#4ECDC4" "#45B7D1" "#FFA07A" "#98D8C8"
```

## CLI Reference

### Generation Commands

```bash
# Generate palette with specific scheme
claude-color generate [options]
  -s, --scheme <type>        Color scheme (complementary, analogous, triadic, tetradic, monochromatic, random)
  -c, --count <number>       Number of colors (default: 5)
  -b, --base <color>         Base color in hex format
  --suggestions <number>     Generate multiple variations (1-10, default: 1)
  --save <name>              Save as favorite with given name
  --tags <tags>              Comma-separated tags
  -e, --export <format>      Export format (hex, css, scss, json, js, ts, tailwind, svg)
  -o, --output <file>        Output file for export

# Quick random palette
claude-color random [options]
  -c, --count <number>       Number of colors (default: 5)

# Specific scheme commands
claude-color complementary <color> [options]
claude-color analogous <color> [options]
claude-color triadic <color> [options]
claude-color monochromatic <color> [options]
```

### AI & Extraction Commands

```bash
# AI-powered generation from natural language
claude-color prompt <description> [options]
  --save <name>              Save as favorite
  --tags <tags>              Comma-separated tags

# Extract colors from website
claude-color from-url <url> [options]
  --save <name>              Save as favorite
  --tags <tags>              Comma-separated tags

# Extract colors from image
claude-color from-image <path> [options]
  --save <name>              Save as favorite
  --tags <tags>              Comma-separated tags
```

### Preference Learning Commands

```bash
# View your taste profile
claude-color preferences
claude-color prefs             # Alias

# Get personalized recommendations
claude-color recommend [options]
claude-color rec               # Alias
  -c, --count <number>         Number of recommendations (1-10, default: 3)
```

### Favorites Management

```bash
# List all favorites
claude-color favorites [options]
claude-color fav               # Alias
  -l, --limit <number>         Maximum number to show (default: 10)

# Search favorites
claude-color search <query>

# Delete a favorite
claude-color delete-favorite <id>
claude-color del-fav <id>      # Alias

# Export favorites to JSON
claude-color export-favorites <file>

# Import favorites from JSON
claude-color import-favorites <file> [options]
  --overwrite                  Overwrite existing favorites with same ID
```

### Interactive Editor

```bash
# Edit palette interactively (TUI)
claude-color edit <colors...> [options]
  --scheme <type>              Color scheme for the palette
```

### Export Command

```bash
# Export colors to various formats
claude-color export <colors...> [options]
  -f, --format <type>          Export format (required)
  -o, --output <file>          Output file
  -p, --prefix <name>          Variable/color name prefix (default: 'color')
```

### Global Options

All commands support:
- `--hex` - Show hex values (default: true)
- `--rgb` - Show RGB values (default: false)
- `--hsl` - Show HSL values (default: false)

## Development Status

**All phases complete!** Ready for v1.0.0 release.

See [Development Log](docs/DEVELOPMENT_LOG.md) for detailed progress.

### Phase Progress

- ✅ Phase 0: Project setup and documentation
- ✅ Phase 1: Core color engine (RGB/HSL/HEX conversions, color theory algorithms)
- ✅ Phase 2: Basic CLI (7 commands, terminal rendering, 8 export formats)
- ✅ Phase 3: Multi-suggestion system (3-10 palette variations per request)
- ✅ Phase 4: Favorites system (save, search, tag, import/export)
- ✅ Phase 5: AI prompt interpretation (Claude AI integration)
- ✅ Phase 6: Web & image extraction (Playwright + Sharp)
- ✅ Phase 7: Interactive TUI (Ink-based palette editor)
- ✅ Phase 8-9: Preference learning & personalized recommendations
- ✅ Phase 10: Production polish & comprehensive documentation

### Phase 8-9 Highlights: Preference Learning 🧠

✅ Automatic interaction tracking (generate, save, edit, search, export, delete)
✅ User preference analysis (favorite schemes, color ranges, saturation/lightness preferences)
✅ AI-powered personalized recommendations using Claude
✅ Preference scoring algorithm (0-100 score based on user history)
✅ Two new CLI commands (preferences, recommend)
✅ Learns from 7 different interaction types
✅ Requires minimum 3 interactions for recommendations
✅ Stores up to 500 interactions to prevent database bloat

### Phase 7 Highlights: Interactive TUI

✅ Ink-based React terminal UI
✅ Real-time color editing with visual preview
✅ Keyboard navigation and controls
✅ Live palette updates
✅ Integration with favorites system

### Phase 5-6 Highlights: AI & Extraction

✅ Claude AI integration for natural language palette generation
✅ Web color extraction with Playwright
✅ Image color extraction with Sharp
✅ Supports PNG, JPEG, WEBP, GIF image formats
✅ Automatic color palette extraction and clustering

### Phase 3 Highlights

**160 tests passing** with **100% statement/function/line coverage, 92.1% branch coverage**

✅ Multi-suggestion generator (3-10 variations per request)
✅ 5 variation strategies (hue-shift, saturation, lightness, scheme-alternative, hybrid)
✅ 10 variation types (original, vibrant, muted, warm, cool, light, dark, alternative, 2× hybrid)
✅ CLI --suggestions flag for palette variations
✅ Terminal rendering for multiple suggestions
✅ Performance: <100ms for 5 suggestions

### Phase 2 Highlights

**127 tests passing** with **100% statement/function/line coverage, 92.1% branch coverage**

✅ 7 CLI commands (generate, random, complementary, analogous, triadic, monochromatic, export)
✅ Terminal color rendering with chalk
✅ 8 export formats (HEX, CSS, SCSS, JSON, JS, TS, Tailwind, SVG)
✅ Configurable display options (hex, RGB, HSL values)
✅ Palette metadata display
✅ TypeScript strict mode compliance

### Phase 1 Highlights

**73 tests passing** with **100% statement coverage**

✅ Color conversions (RGB ↔ HSL ↔ HEX)
✅ Complementary palettes (180° color wheel)
✅ Analogous palettes (±30° spread)
✅ Triadic palettes (120° spacing)
✅ Tetradic palettes (rectangular)
✅ Monochromatic variations
✅ Random palette generation

## Documentation

- [Product Requirements](docs/PRD.md)
- [Technical Design](docs/TECHNICAL_DESIGN.md)
- [API Reference](docs/API_REFERENCE.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)
- [Development Log](docs/DEVELOPMENT_LOG.md)

## Development

### Prerequisites

- Node.js 18+
- npm 9+
- Git 2.30+

### Setup

```bash
# Clone repository
git clone https://github.com/joshleichtung/claude-color.git
cd claude-color

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

### Development Commands

```bash
npm run dev          # Development mode with watch
npm run build        # Production build
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

## Architecture

Built with:
- TypeScript for type safety
- Ink for terminal UI
- Anthropic Claude for AI intelligence
- Chroma.js for color manipulation
- Playwright for web scraping
- Sharp for image processing

See [Technical Design](docs/TECHNICAL_DESIGN.md) for detailed architecture.

## Claude Code Integration

Use as a slash command in Claude Code:

```bash
# In Claude Code
/palette "cozy coffee shop vibe"
/palette from https://linear.app
/palette interactive
```

## Contributing

This project follows strict development practices. See:
- [Development Rules](.claude/rules/claude-color-dev.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)

Contributions welcome after v1.0.0 release!

## Roadmap

### v1.0.0 (Current Target)
- Core palette generation
- AI prompt interpretation
- Interactive TUI
- Preference learning
- Multiple export formats

### v1.1
- Color blindness simulation
- Gradient generation
- Preset themes

### v2.0
- MCP server integration
- Team palette libraries
- Animation color transitions

See [PRD](docs/PRD.md) for complete feature roadmap.

## License

MIT © [Josh Leichtung](https://github.com/joshleichtung)

## Acknowledgments

- Inspired by [coolors.co](https://coolors.co)
- Built for [Claude Code](https://claude.ai/code)
- Color theory from [color-harmony](https://github.com/skratchdot/color-harmony)

---

**Note**: This project is under active development. APIs and features may change before v1.0.0 release.
