# Claude Color for Cursor

AI-powered color palette generator with deep Cursor integration and enhanced AI features.

## Features

All VS Code features plus Cursor-specific enhancements:

### Core Features
- **Generate Palettes**: Create color palettes using various color schemes
- **AI-Powered Creation**: Natural language palette generation
- **Image Extraction**: Extract dominant colors from images
- **Personalized Recommendations**: AI suggestions based on your preferences
- **Favorites Management**: Save and access your favorite palettes
- **Multiple Export Formats**: CSS, Sass, Tailwind, JSON, JS

### Cursor-Specific Features
- **Generate from Selection**: Highlight text and generate palettes from it
- **Auto Color Analysis**: Automatically analyze colors when opening CSS/design files
- **Color Improvement Suggestions**: AI-powered accessibility and design suggestions
- **Context Menu Integration**: Right-click on selected text for palette generation
- **Deep AI Integration**: Leverages Cursor's AI capabilities for smarter suggestions

## Commands

Access via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- **Claude Color: Generate Color Palette** - Create palette with scheme selection
- **Claude Color: Generate Palette from Prompt** - AI-powered generation
- **Claude Color: Generate Palette from Selected Text** - Use selection as prompt
- **Claude Color: Extract Colors from Image** - Extract from image file
- **Claude Color: Show Favorite Palettes** - Browse saved palettes
- **Claude Color: Get Personalized Recommendations** - AI recommendations
- **Claude Color: Open Palette Editor** - Interactive TUI editor
- **Claude Color: Analyze Colors in Current File** - Find and analyze all colors
- **Claude Color: Suggest Color Improvements** - Get accessibility suggestions
- **Claude Color: Insert Palette** - Insert palette into editor

## Context Menu

Right-click on selected text for quick access:
- Generate Palette from Selection
- Suggest Color Improvements

## Configuration

Configure via Cursor settings:

- `claudeColor.apiKey`: Anthropic API key
- `claudeColor.defaultScheme`: Default color scheme
- `claudeColor.autoTrackInteractions`: Enable preference learning
- `claudeColor.insertFormat`: Palette insertion format
- `claudeColor.cursorIntegration`: Enable Cursor-specific features
- `claudeColor.autoAnalyze`: Auto-analyze colors in design files

## Requirements

- Node.js 18 or higher
- Anthropic API key (for AI features)
- Cursor editor (for enhanced features)

## Usage

1. Install the extension in Cursor
2. Set your Anthropic API key in settings
3. Use Command Palette or context menu to access features
4. Generate, analyze, and use beautiful color palettes!

## Cursor Integration

This extension takes full advantage of Cursor's AI capabilities:

- **Smart Context Understanding**: Understands your project context
- **Enhanced AI Suggestions**: Better color recommendations based on your codebase
- **Auto-Analysis**: Automatically analyzes colors in CSS and design files
- **Selection-Based Generation**: Generate palettes from any selected text
- **Accessibility Checks**: AI-powered accessibility analysis

## Release Notes

### 1.0.0

Initial release with:
- All VSCode extension features
- Cursor-specific AI integrations
- Context menu commands
- Auto color analysis
- Selection-based palette generation
- Color improvement suggestions

## License

MIT
