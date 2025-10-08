# Claude Color for VS Code

AI-powered color palette generator integrated directly into Visual Studio Code.

## Features

- **Generate Palettes**: Create color palettes using various color schemes (complementary, analogous, triadic, etc.)
- **AI-Powered Creation**: Describe your desired palette in natural language and let AI generate it
- **Image Extraction**: Extract dominant colors from any image
- **Personalized Recommendations**: Get palette suggestions based on your usage patterns
- **Favorites Management**: Save and quickly access your favorite palettes
- **Multiple Export Formats**: Insert palettes as CSS variables, Sass, Tailwind config, JSON, or JS objects

## Commands

Access commands via the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- **Claude Color: Generate Color Palette** - Create a palette with scheme selection
- **Claude Color: Generate Palette from Prompt** - AI-powered palette from description
- **Claude Color: Extract Colors from Image** - Extract colors from an image file
- **Claude Color: Show Favorite Palettes** - Browse and use your saved palettes
- **Claude Color: Get Personalized Recommendations** - AI recommendations based on your preferences
- **Claude Color: Open Palette Editor** - Launch the interactive TUI editor
- **Claude Color: Insert Palette as CSS Variables** - Insert current palette into editor

## Configuration

Configure the extension via VS Code settings:

- `claudeColor.apiKey`: Your Anthropic API key for AI features
- `claudeColor.defaultScheme`: Default color scheme for generation
- `claudeColor.autoTrackInteractions`: Enable preference learning
- `claudeColor.insertFormat`: Default format for palette insertion

## Requirements

- Node.js 18 or higher
- Anthropic API key (for AI-powered features)

## Usage

1. Install the extension
2. Set your Anthropic API key in settings
3. Open the Command Palette and run any Claude Color command
4. Generate, save, and use beautiful color palettes!

## Extension Settings

This extension contributes the following settings:

* `claudeColor.apiKey`: Anthropic API key
* `claudeColor.defaultScheme`: Default color scheme
* `claudeColor.autoTrackInteractions`: Track usage for recommendations
* `claudeColor.insertFormat`: Palette insertion format

## Release Notes

### 1.0.0

Initial release with:
- Color palette generation with multiple schemes
- AI-powered palette creation from natural language
- Image color extraction
- Personalized recommendations with preference learning
- Favorites management
- Multiple export formats

## License

MIT
