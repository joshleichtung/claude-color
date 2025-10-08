# Claude Color - API Reference

## CLI Commands

### `claude-color generate`

Generate color palettes with various options.

**Synopsis**:
```bash
claude-color generate [options]
```

**Options**:
- `--scheme <type>` - Color scheme (analogous, complementary, triadic, tetradic, monochromatic, random)
- `--base <color>` - Base color in HEX format (e.g., #3B82F6)
- `--count <n>` - Number of palette variations (3-5, default: 5)
- `--personalized` - Apply user taste profile
- `--explore` - Generate opposite of preferences

**Examples**:
```bash
# Random palette
claude-color generate

# Analogous scheme with base color
claude-color generate --scheme analogous --base "#2563eb"

# Generate 3 variations
claude-color generate --count 3

# Personalized generation
claude-color generate --scheme complementary --personalized
```

---

### `claude-color "<prompt>"`

Generate palettes from natural language descriptions.

**Synopsis**:
```bash
claude-color "<prompt>" [options]
```

**Examples**:
```bash
claude-color "warm sunset vibes for travel blog"
claude-color "professional SaaS dashboard"
claude-color "cyberpunk aesthetic inspired by Blade Runner"
claude-color "cozy coffee shop" --personalized
```

---

### `claude-color from <source>`

Extract colors from URLs or images.

**Synopsis**:
```bash
claude-color from <url|path> [options]
```

**Examples**:
```bash
# From website
claude-color from https://stripe.com
claude-color from https://linear.app

# From local image
claude-color from ./logo.png
claude-color from ~/Desktop/screenshot.jpg
```

---

### `claude-color interactive`

Launch interactive TUI mode.

**Synopsis**:
```bash
claude-color interactive [options]
```

**Keyboard Shortcuts**:
- `←/→` or `h/l` - Navigate between palette suggestions
- `↑/↓` or `j/k` - Adjust selected color
- `Space` - Regenerate unlocked colors
- `L` - Lock/unlock current color
- `S` - Save as favorite
- `E` - Export palette
- `F` - Browse favorites
- `?` - Show help
- `Q` - Quit

**Examples**:
```bash
# Launch interactive mode
claude-color interactive

# Generate and enter interactive mode
claude-color "professional dashboard" --interactive
```

---

### Session Commands

Commands available during active generation session.

#### `next`
Navigate to next palette suggestion.

#### `prev`
Navigate to previous palette suggestion.

#### `select <n>`
Select palette number (1-5).

**Example**:
```bash
claude-color generate --scheme analogous
# Displays 5 palettes
next  # View palette 2
next  # View palette 3
select 1  # Jump back to palette 1
```

#### `refine "<prompt>"`
Refine current palette with additional instructions.

**Examples**:
```bash
refine "make it warmer"
refine "more contrast"
refine "replace the blue with something earthy"
```

---

### `claude-color favorites`

Manage favorite palettes.

#### `favorites list`
List all saved favorites.

**Synopsis**:
```bash
claude-color favorites list [options]
```

**Options**:
- `--tag <tag>` - Filter by tag
- `--sort <field>` - Sort by (name, created, lastUsed, usageCount)

**Examples**:
```bash
claude-color favorites list
claude-color favorites list --tag brand
claude-color favorites list --sort usageCount
```

#### `favorites save`
Save current palette as favorite.

**Synopsis**:
```bash
claude-color favorites save <name> [options]
```

**Options**:
- `--tags <tags>` - Comma-separated tags
- `--notes <text>` - Additional notes

**Examples**:
```bash
claude-color favorites save "My Brand Colors"
claude-color favorites save "Corporate Palette" --tags brand,professional
claude-color favorites save "Summer Theme" --tags seasonal --notes "For summer campaign"
```

#### `favorites search`
Search favorites.

**Synopsis**:
```bash
claude-color favorites search <query>
```

**Examples**:
```bash
claude-color favorites search "brand"
claude-color favorites search "professional"
```

#### `favorites load`
Load a saved favorite.

**Synopsis**:
```bash
claude-color favorites load <name>
```

**Example**:
```bash
claude-color favorites load "My Brand Colors"
```

#### `favorites delete`
Delete a favorite.

**Synopsis**:
```bash
claude-color favorites delete <name>
```

**Example**:
```bash
claude-color favorites delete "Old Theme"
```

#### `favorites export`
Export favorites library.

**Synopsis**:
```bash
claude-color favorites export [options]
```

**Options**:
- `--output <path>` - Output file path (default: favorites-export.json)
- `--format <format>` - Export format (json, css, scss)

**Examples**:
```bash
claude-color favorites export
claude-color favorites export --output my-palettes.json
claude-color favorites export --format css --output all-palettes.css
```

---

### `claude-color export`

Export current palette to various formats.

**Synopsis**:
```bash
claude-color export [options]
```

**Options**:
- `--format <format>` - css, scss, json, js, ts, tailwind, svg (default: css)
- `--output <path>` - Output file path
- `--naming <convention>` - semantic, numeric, custom (default: semantic)

**Naming Conventions**:
- `semantic`: primary, secondary, accent, neutral, background
- `numeric`: color-1, color-2, color-3, color-4, color-5
- `custom`: prompts for custom names

**Examples**:
```bash
# CSS custom properties
claude-color export --format css --output colors.css

# SCSS variables
claude-color export --format scss --output _colors.scss

# JSON
claude-color export --format json --output palette.json

# Tailwind config
claude-color export --format tailwind --output tailwind-colors.js

# With numeric naming
claude-color export --format css --naming numeric
```

**Export Formats**:

**CSS**:
```css
:root {
  --color-primary: #3B82F6;
  --color-secondary: #60A5FA;
  --color-accent: #2563EB;
  --color-neutral: #94A3B8;
  --color-background: #F1F5F9;
}
```

**SCSS**:
```scss
$primary: #3B82F6;
$secondary: #60A5FA;
$accent: #2563EB;
$neutral: #94A3B8;
$background: #F1F5F9;
```

**JSON**:
```json
{
  "primary": "#3B82F6",
  "secondary": "#60A5FA",
  "accent": "#2563EB",
  "neutral": "#94A3B8",
  "background": "#F1F5F9"
}
```

**Tailwind**:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': '#3B82F6',
        'secondary': '#60A5FA',
        'accent': '#2563EB',
        'neutral': '#94A3B8',
        'background': '#F1F5F9'
      }
    }
  }
}
```

---

### `claude-color profile`

Manage user preference profile.

#### `profile show`
Display current taste profile.

**Synopsis**:
```bash
claude-color profile show
```

**Example Output**:
```
🧠 Your Taste Profile (47 interactions, 85% confidence)

Hue Preferences:
  ✓ Preferred: Blues (180-240°)
  ✗ Avoided: Reds (0-60°)

Saturation: 50-75% (muted tones)
Lightness: 40-70% (balanced)
Contrast: High
Temperature: Cool
Favorite Schemes: analogous, monochromatic

Keywords: professional, modern, trustworthy, muted
```

#### `profile reset`
Clear all learning data.

**Synopsis**:
```bash
claude-color profile reset
```

#### `profile export`
Export taste profile.

**Synopsis**:
```bash
claude-color profile export [--output <path>]
```

**Example**:
```bash
claude-color profile export --output my-taste-profile.json
```

#### `profile pause`
Temporarily disable learning.

**Synopsis**:
```bash
claude-color profile pause
```

---

### Global Options

These options work with any command:

- `--personalized` - Apply user taste profile to suggestions
- `--no-personalization` - Disable learning for this session
- `--explore` - Generate opposite of user preferences (exploration mode)
- `--interactive` - Enter interactive TUI mode after generation
- `--help` - Show help for command
- `--version` - Show version number
- `--verbose` - Show detailed output
- `--quiet` - Minimal output

---

## Programmatic API

### Installation

```bash
npm install claude-color
```

### Basic Usage

```typescript
import { ClaudeColor } from 'claude-color';

const cc = new ClaudeColor({
  apiKey: process.env.ANTHROPIC_API_KEY,
  storagePath: '~/.claude-color'
});

// Generate palette
const palettes = await cc.generate({
  scheme: 'analogous',
  baseColor: '#3B82F6',
  count: 5
});

console.log(palettes[0].colors);
// [{ hex: '#3B82F6', rgb: {...}, hsl: {...} }, ...]
```

### API Methods

#### `generate(options)`

Generate color palettes.

**Parameters**:
```typescript
interface GenerateOptions {
  scheme?: ColorScheme;
  baseColor?: string;
  count?: number;
  personalized?: boolean;
}

type ColorScheme =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'monochromatic'
  | 'random';
```

**Returns**: `Promise<Palette[]>`

**Example**:
```typescript
const palettes = await cc.generate({
  scheme: 'triadic',
  baseColor: '#FF6B6B',
  count: 3
});
```

#### `generateFromPrompt(prompt, options)`

Generate from natural language.

**Parameters**:
```typescript
interface PromptOptions {
  count?: number;
  personalized?: boolean;
}
```

**Returns**: `Promise<Palette[]>`

**Example**:
```typescript
const palettes = await cc.generateFromPrompt(
  'warm sunset vibes',
  { count: 5, personalized: true }
);
```

#### `extractFromUrl(url)`

Extract colors from website.

**Returns**: `Promise<Palette[]>`

**Example**:
```typescript
const palettes = await cc.extractFromUrl('https://stripe.com');
```

#### `extractFromImage(path)`

Extract colors from image.

**Returns**: `Promise<Palette[]>`

**Example**:
```typescript
const palettes = await cc.extractFromImage('./logo.png');
```

#### `export(palette, options)`

Export palette to various formats.

**Parameters**:
```typescript
interface ExportOptions {
  format: 'css' | 'scss' | 'json' | 'js' | 'ts' | 'tailwind' | 'svg';
  output?: string;
  naming?: 'semantic' | 'numeric' | 'custom';
}
```

**Returns**: `Promise<string>` (file path or exported content)

**Example**:
```typescript
const cssPath = await cc.export(palettes[0], {
  format: 'css',
  output: './colors.css'
});
```

### Favorites API

```typescript
// Save favorite
await cc.favorites.save('My Brand', palette, {
  tags: ['brand', 'primary'],
  notes: 'Primary brand colors'
});

// List favorites
const favorites = await cc.favorites.list();

// Search
const results = await cc.favorites.search('brand');

// Load
const favorite = await cc.favorites.load('My Brand');

// Delete
await cc.favorites.delete('Old Theme');

// Export library
await cc.favorites.exportAll('./favorites.json');
```

### Profile API

```typescript
// Get taste profile
const profile = await cc.profile.get();

// Reset learning
await cc.profile.reset();

// Export profile
await cc.profile.export('./my-profile.json');

// Pause learning
await cc.profile.pause();

// Resume learning
await cc.profile.resume();
```

### Type Definitions

```typescript
interface Palette {
  id: string;
  colors: Color[];
  scheme: ColorScheme;
  metadata: PaletteMetadata;
}

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  locked?: boolean;
}

interface PaletteMetadata {
  created: Date;
  generationMethod: 'random' | 'prompt' | 'url' | 'image';
  originalPrompt?: string;
  sourceUrl?: string;
  sourceImage?: string;
}

interface Favorite {
  id: string;
  name: string;
  palette: Palette;
  tags: string[];
  metadata: FavoriteMetadata;
}

interface TasteProfile {
  version: number;
  generated: Date;
  lastUpdated: Date;
  interactionCount: number;
  confidence: number;
  preferences: Preferences;
  contextProfiles?: Record<string, Partial<Preferences>>;
}
```

---

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY` - Anthropic API key for AI features
- `CLAUDE_API_KEY` - Alternative name for API key
- `CLAUDE_COLOR_STORAGE` - Custom storage location (default: ~/.claude-color)
- `CLAUDE_COLOR_CACHE_TTL` - Cache TTL in seconds (default: 86400)

### Configuration File

Optional config file at `~/.claude-color/config.json`:

```json
{
  "apiKey": "your-api-key",
  "storagePath": "~/.claude-color",
  "cache": {
    "enabled": true,
    "ttl": 86400
  },
  "learning": {
    "enabled": true,
    "minInteractions": 10
  },
  "defaults": {
    "scheme": "analogous",
    "count": 5,
    "exportFormat": "css"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `ENOAPI` | API key not configured |
| `EAPIERR` | API request failed |
| `EINVCOLOR` | Invalid color format |
| `ENOTFOUND` | Favorite not found |
| `EPERM` | Permission denied for file operation |
| `EINVURL` | Invalid URL format |
| `ETIMGFMT` | Unsupported image format |

---

## Claude Code Integration

### Slash Command

Create `.claude/commands/palette.md`:

```markdown
Execute color palette generation with Claude Color CLI.

Usage: /palette [prompt or command]

Examples:
- /palette "warm sunset vibes"
- /palette from https://stripe.com
- /palette interactive
- /palette generate --scheme analogous
```

### In Conversation

```
User: /palette "professional dashboard colors"

[Claude Color generates palettes and displays in terminal]

User: /palette select 2

[Loads palette 2]

User: /palette export --format css --output src/styles/colors.css

[Exports to project]
```

---

_For more examples, see the examples/ directory in the repository._
