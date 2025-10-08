# Claude Color 🎨

> AI-powered terminal color palette generator with preference learning

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Status**: 🚧 **In Development** - Phase 1 Complete

## Vision

Bring the power of [coolors.co](https://coolors.co) to your terminal with AI intelligence that learns your aesthetic preferences over time. Claude Color is an interactive color palette generator that integrates seamlessly with [Claude Code](https://claude.ai/code) workflows.

## Planned Features

- 🎨 **Multi-Modal Generation**: Natural language prompts, URL extraction, or image analysis
- 🤖 **AI-Powered**: Understands aesthetic intent and mood through natural language
- 🧠 **Learns Preferences**: Gets smarter with every palette you choose
- 🖥️ **Interactive TUI**: Beautiful terminal interface with real-time adjustments
- 💾 **Favorites Library**: Save and organize your color palettes
- 📤 **Multiple Exports**: CSS, SCSS, JSON, Tailwind, and more
- ♿ **Accessibility**: WCAG contrast checking built-in
- 🔒 **Privacy-First**: All data stored locally

## Installation

_Coming soon after v1.0.0 release_

```bash
npm install -g claude-color
```

## Quick Start

```bash
# Natural language generation
claude-color "warm sunset vibes"

# From a website
claude-color from https://stripe.com

# Interactive mode
claude-color interactive
```

## Development Status

Currently in **Phase 1**: Complete! Core color engine with comprehensive tests.

See [Development Log](docs/DEVELOPMENT_LOG.md) for detailed progress.

### Phase Progress

- ✅ Phase 0: Project setup and documentation
- ✅ Phase 1: Core color engine (RGB/HSL/HEX conversions, color theory algorithms)
- ⏳ Phase 2: Basic CLI
- ⏳ Phase 3: Multi-suggestion system
- ⏳ Phase 4: Favorites system
- ⏳ Phase 5: AI prompt interpretation
- ⏳ Phase 6: Web & image extraction
- ⏳ Phase 7: Interactive TUI
- ⏳ Phase 8-9: Preference learning
- ⏳ Phase 10: Production ready

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
