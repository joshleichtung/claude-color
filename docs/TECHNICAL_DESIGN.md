# Claude Color - Technical Design Document

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Code CLI                          │
│                  (/palette slash command)                    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                    Claude Color Application                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   CLI Mode   │  │   TUI Mode   │  │  API Mode    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └─────────────────┬┴──────────────────┘             │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐   │
│  │              Application Core                        │   │
│  │                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │  Color   │  │    AI    │  │ Learning │         │   │
│  │  │  Engine  │  │  Layer   │  │  System  │         │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘         │   │
│  │       │             │             │                 │   │
│  │  ┌────┴─────────────┴─────────────┴─────┐         │   │
│  │  │         Storage Layer                 │         │   │
│  │  │  (Favorites, Interactions, Profiles)  │         │   │
│  │  └───────────────────────────────────────┘         │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────┴────┐         ┌────┴────┐        ┌────┴────┐
    │Anthropic│         │Playwright│        │  Local  │
    │   API   │         │  (Web)  │        │ Storage │
    └─────────┘         └─────────┘        └─────────┘
```

### Component Breakdown

#### 1. CLI Layer
- Command parsing (Commander.js)
- Output formatting
- Basic workflows

#### 2. TUI Layer
- Interactive interface (Ink + React)
- Keyboard handling
- Real-time rendering

#### 3. Color Engine
- Color theory algorithms
- Color space conversions
- Palette generation
- Variation strategies

#### 4. AI Layer
- Prompt interpretation
- Comparative analysis
- LLM orchestration
- Caching

#### 5. Learning System
- Interaction tracking
- Statistical analysis
- Profile generation
- Context detection

#### 6. Storage Layer
- Favorites management
- Interaction history
- Taste profiles
- Cache management

## Technology Stack

### Core Technologies

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Language | TypeScript | 5.3+ | Type safety, excellent DX |
| Runtime | Node.js | 18+ | Modern features, wide support |
| Build | esbuild | Latest | Fast compilation |
| Package Manager | npm | 9+ | Standard, widely supported |

### Key Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "chalk": "^5.3.0",
    "chroma-js": "^2.4.2",
    "color-harmony": "^3.0.0",
    "commander": "^11.1.0",
    "ink": "^4.4.1",
    "ink-text-input": "^5.0.1",
    "lowdb": "^7.0.1",
    "node-vibrant": "^3.2.1",
    "playwright": "^1.40.0",
    "sharp": "^0.33.1",
    "uuid": "^9.0.1",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "ink-testing-library": "^3.0.0",
    "@commitlint/cli": "^18.4.4",
    "@commitlint/config-conventional": "^18.4.4"
  }
}
```

### Dependency Rationale

**chalk**: Terminal color rendering, widely adopted, excellent RGB support
**chroma-js**: Color manipulation, comprehensive API, good HSL/LAB support
**color-harmony**: Proven color theory algorithms, MIT licensed
**commander**: Standard CLI framework, excellent DX
**ink**: React for terminal, component-based TUI
**lowdb**: Simple JSON database, perfect for local storage
**node-vibrant**: Image color extraction, battle-tested
**playwright**: Web scraping, powerful browser automation
**sharp**: Fast image processing, native performance

## Data Models

### Palette

```typescript
interface Palette {
  id: string;                    // UUID
  colors: Color[];               // 5 colors
  scheme: ColorScheme;          // analogous, complementary, etc.
  metadata: {
    created: Date;
    generationMethod: 'random' | 'prompt' | 'url' | 'image';
    originalPrompt?: string;
    sourceUrl?: string;
    sourceImage?: string;
  };
}

interface Color {
  hex: string;                  // #RRGGBB
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  locked?: boolean;             // For regeneration
}

type ColorScheme =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'monochromatic'
  | 'random';
```

### Favorite

```typescript
interface Favorite {
  id: string;                   // UUID
  name: string;                 // User-provided name
  palette: Palette;
  tags: string[];
  metadata: {
    created: Date;
    lastUsed: Date;
    usageCount: number;
    exportedFormats: ExportFormat[];
    context?: string;           // work_professional, personal_creative
    notes?: string;
  };
}

type ExportFormat = 'css' | 'scss' | 'json' | 'js' | 'ts' | 'tailwind' | 'svg';
```

### Interaction

```typescript
interface Interaction {
  id: string;
  timestamp: Date;
  action: InteractionAction;
  palette: Palette;
  context: InteractionContext;
  decision: {
    timeToDecision: number;     // seconds
    viewedAlternatives: number;  // how many palettes cycled through
    confidence: number;          // 0.0-1.0
  };
}

type InteractionAction =
  | 'selected'
  | 'rejected'
  | 'saved'
  | 'exported'
  | 'refined'
  | 'locked_color'
  | 'adjusted_color';

interface InteractionContext {
  prompt?: string;
  refinements: string[];        // ["make it warmer", "more contrast"]
  projectType?: string;         // react_app, marketing_site, etc.
  workingDirectory: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}
```

### Taste Profile

```typescript
interface TasteProfile {
  version: number;              // Schema version
  generated: Date;
  lastUpdated: Date;
  interactionCount: number;
  confidence: number;           // 0.0-1.0

  preferences: {
    hues: {
      preferred: number[];      // [180-240] blues
      avoided: number[];        // [0-60] reds
      reasoning: string;
    };
    saturation: {
      range: [number, number];  // [50, 75]
      reasoning: string;
    };
    lightness: {
      range: [number, number];  // [40, 70]
      reasoning: string;
    };
    contrast: 'low' | 'medium' | 'high';
    temperature: 'warm' | 'cool' | 'neutral';
    favoriteSchemes: ColorScheme[];
    keywords: string[];         // ["professional", "modern", "muted"]
  };

  contextProfiles?: {
    [contextKey: string]: Partial<TasteProfile['preferences']>;
  };
}
```

### AI Prompt Interpretation Output

```typescript
interface PromptInterpretation {
  intent: 'mood' | 'url' | 'image';
  characteristics: {
    hues: number[];             // [180, 200, 220] hue values
    saturation: [number, number]; // [60, 80] range
    lightness: [number, number];  // [40, 60] range
    temperature: 'warm' | 'cool' | 'neutral';
    contrast: 'low' | 'medium' | 'high';
    keywords: string[];
  };
  variations: number;           // How many to generate (3-5)
  confidence: number;           // 0.0-1.0
}
```

## Storage Architecture

### File Structure

```
~/.claude-color/
├── favorites.json          # Favorite palettes
├── interactions.json       # Interaction history
├── taste-profile.json      # Learned preferences
├── context-profiles.json   # Context-specific preferences
├── cache/
│   ├── prompts/           # Cached prompt interpretations
│   └── extractions/       # Cached web/image extractions
└── backups/               # Automatic backups
```

### Storage Technology

**lowdb** (JSON-based local database):
- Simple, file-based storage
- Synchronous and async APIs
- Built-in TypeScript support
- Automatic atomic writes

### Backup Strategy

- Automatic backup before modifications
- Keep last 5 backups
- Backup on version changes
- User-initiated export/import

## Core Algorithms

### 1. Color Theory Generation

#### Complementary Colors
```typescript
function generateComplementary(baseColor: Color): Color[] {
  const hsl = rgbToHsl(baseColor);
  return [
    baseColor,
    rotateHue(baseColor, 180),  // Opposite on color wheel
    ...generateShades(baseColor, 3)
  ];
}
```

#### Analogous Colors
```typescript
function generateAnalogous(baseColor: Color): Color[] {
  const hsl = rgbToHsl(baseColor);
  return [
    rotateHue(baseColor, -30),
    rotateHue(baseColor, -15),
    baseColor,
    rotateHue(baseColor, 15),
    rotateHue(baseColor, 30)
  ];
}
```

#### Triadic Colors
```typescript
function generateTriadic(baseColor: Color): Color[] {
  return [
    baseColor,
    rotateHue(baseColor, 120),
    rotateHue(baseColor, 240),
    adjustSaturation(baseColor, -20),
    adjustLightness(baseColor, 20)
  ];
}
```

### 2. Variation Generation

```typescript
function generateVariations(
  baseCharacteristics: PromptInterpretation,
  count: number
): Palette[] {
  const variations: Palette[] = [];

  for (let i = 0; i < count; i++) {
    const variance = {
      hueShift: random(-10, 10),
      saturationShift: random(-10, 10),
      lightnessShift: random(-5, 5),
      contrastAdjustment: random(0.8, 1.2)
    };

    const palette = generatePaletteWithVariance(
      baseCharacteristics,
      variance
    );

    variations.push(palette);
  }

  return ensureDiversity(variations);
}
```

### 3. Image Color Extraction

```typescript
async function extractColorsFromImage(
  imagePath: string,
  count: number = 10
): Promise<Color[]> {
  // Load image with sharp
  const image = sharp(imagePath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  // K-means clustering
  const clusters = kMeans(data, count);

  // Filter grays and normalize
  const filtered = clusters
    .filter(color => !isGray(color))
    .sort((a, b) => b.prominence - a.prominence);

  return filtered.slice(0, 5);
}

function isGray(color: Color): boolean {
  const { r, g, b } = color.rgb;
  const diff = Math.max(r, g, b) - Math.min(r, g, b);
  return diff < 15; // Threshold for gray detection
}
```

### 4. Preference Learning

#### Statistical Analysis
```typescript
function analyzeStatisticalPreferences(
  interactions: Interaction[]
): Partial<TasteProfile['preferences']> {
  const selected = interactions.filter(i => i.action === 'selected');
  const rejected = interactions.filter(i => i.action === 'rejected');

  // Analyze hue distribution
  const selectedHues = selected.flatMap(i =>
    i.palette.colors.map(c => c.hsl.h)
  );
  const rejectedHues = rejected.flatMap(i =>
    i.palette.colors.map(c => c.hsl.h)
  );

  return {
    hues: {
      preferred: findHueRanges(selectedHues),
      avoided: findHueRanges(rejectedHues)
    },
    saturation: {
      range: calculateRange(
        selected.flatMap(i => i.palette.colors.map(c => c.hsl.s))
      )
    },
    // ... similar for other characteristics
  };
}
```

#### LLM-Based Comparative Analysis
```typescript
async function generateTasteProfileViaLLM(
  interactions: Interaction[]
): Promise<TasteProfile> {
  const selected = interactions.filter(i =>
    ['selected', 'saved', 'exported'].includes(i.action)
  );
  const rejected = interactions.filter(i => i.action === 'rejected');

  const prompt = `
Analyze user color palette preferences:

LIKED PALETTES (${selected.length} palettes):
${formatPalettesForAnalysis(selected.map(i => i.palette))}

REJECTED PALETTES (${rejected.length} palettes):
${formatPalettesForAnalysis(rejected.map(i => i.palette))}

REFINEMENT REQUESTS:
${formatRefinements(interactions)}

Extract structured preference profile with reasoning.
Return JSON matching TasteProfile schema.
  `;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(extractJSON(response.content));
}
```

### 5. WCAG Contrast Calculation

```typescript
function calculateContrastRatio(color1: Color, color2: Color): number {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: Color): number {
  const { r, g, b } = color.rgb;

  const [rs, gs, bs] = [r, g, b].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function checkWCAGCompliance(ratio: number): {
  aa: boolean;
  aaa: boolean;
} {
  return {
    aa: ratio >= 4.5,   // AA standard for normal text
    aaa: ratio >= 7.0   // AAA standard for normal text
  };
}
```

## API Design

### CLI Commands

```bash
# Generation
claude-color generate [options]
  --scheme <type>           # analogous, complementary, triadic, etc.
  --base <color>            # Base color in HEX
  --count <n>               # Number of variations (3-5)

# Natural language
claude-color "<prompt>"     # "warm sunset vibes"

# From sources
claude-color from <source>  # URL or image path

# Interactive mode
claude-color interactive

# Navigation (in session)
next                        # Next palette
prev                        # Previous palette
select <n>                  # Select palette number n

# Refinement
refine "<prompt>"           # "make it warmer"

# Favorites
claude-color favorites list
claude-color favorites save <name> [--tags tag1,tag2]
claude-color favorites search <query>
claude-color favorites load <name>
claude-color favorites delete <name>
claude-color favorites export [--output path]

# Export
claude-color export [options]
  --format <format>         # css, scss, json, js, ts, tailwind, svg
  --output <path>           # Output file path
  --naming <convention>     # semantic, numeric, custom

# Profile management
claude-color profile show
claude-color profile reset
claude-color profile export
claude-color profile pause

# Global options
--personalized              # Use taste profile
--no-personalization        # Disable learning for this session
--explore                   # Suggest opposite of preferences
```

### Programmatic API

```typescript
import { ClaudeColor } from 'claude-color';

const cc = new ClaudeColor({
  apiKey: process.env.ANTHROPIC_API_KEY,
  storagePath: '~/.claude-color'
});

// Generate palette
const palettes = await cc.generate({
  prompt: 'warm sunset vibes',
  count: 5
});

// From URL
const extracted = await cc.fromUrl('https://stripe.com');

// With learning
const personalized = await cc.generate({
  prompt: 'professional dashboard',
  personalized: true
});

// Manage favorites
await cc.favorites.save('My Brand', palettes[0], {
  tags: ['brand', 'primary']
});

const saved = await cc.favorites.list();
```

## Testing Strategy

### Unit Tests

```typescript
describe('Color Theory', () => {
  describe('complementary', () => {
    it('generates opposite hue', () => {
      const base = { h: 180, s: 50, l: 50 };
      const comp = generateComplementary(base);
      expect(comp[1].h).toBe(0); // 180 + 180 = 360 = 0
    });
  });

  describe('WCAG contrast', () => {
    it('calculates correct ratio', () => {
      const white = { r: 255, g: 255, b: 255 };
      const black = { r: 0, g: 0, b: 0 };
      expect(calculateContrastRatio(white, black)).toBe(21);
    });
  });
});
```

### Integration Tests

```typescript
describe('CLI Commands', () => {
  it('generates palette from prompt', async () => {
    const result = await execCLI('claude-color "professional dashboard"');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Generated 5 palettes');
  });

  it('saves and recalls favorite', async () => {
    await execCLI('claude-color generate');
    await execCLI('claude-color favorites save "Test"');
    const result = await execCLI('claude-color favorites list');
    expect(result.stdout).toContain('Test');
  });
});
```

### TUI Tests

```typescript
import { render } from 'ink-testing-library';

describe('TUI', () => {
  it('displays multiple palettes', () => {
    const { lastFrame } = render(<App palettes={mockPalettes} />);
    expect(lastFrame()).toContain('[1/5]');
    expect(lastFrame()).toContain('████');
  });

  it('handles keyboard navigation', () => {
    const { stdin, lastFrame } = render(<App />);
    stdin.write('→'); // Next palette
    expect(lastFrame()).toContain('[2/5]');
  });
});
```

## Performance Optimization

### Caching Strategy

```typescript
const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
  updateAgeOnGet: true
});

async function interpretPromptWithCache(prompt: string): Promise<PromptInterpretation> {
  const cacheKey = `prompt:${hash(prompt)}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const result = await interpretPromptViaLLM(prompt);
  cache.set(cacheKey, result);

  return result;
}
```

### Lazy Loading

- Load TUI only when `interactive` command invoked
- Load Playwright only for URL extraction
- Load sharp only for image processing
- Minimize startup time

### Bundle Optimization

- Tree-shaking enabled
- Dynamic imports for optional features
- Minimize dependency count
- Use native modules where possible (sharp)

## Security Considerations

### API Key Handling

```typescript
// Read from environment
const apiKey = process.env.ANTHROPIC_API_KEY
  || process.env.CLAUDE_API_KEY
  || (await promptForApiKey());

// Never log or expose
// Never commit to git (add to .gitignore)
```

### File System Access

- Restrict writes to `~/.claude-color/`
- Validate all file paths
- Check permissions before writing
- Sanitize user input for file names

### Dependency Security

- Use `npm audit` in CI
- Pin versions for reproducibility
- Audit critical dependencies
- Minimal dependency count

## Deployment

### npm Package

```json
{
  "name": "claude-color",
  "version": "1.0.0",
  "main": "dist/index.js",
  "bin": {
    "claude-color": "dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### Installation

```bash
npm install -g claude-color
```

### Claude Code Integration

Create `.claude/commands/palette.md`:
```markdown
Execute color palette generation with Claude Color CLI.

Usage: /palette [prompt or command]

Examples:
- /palette "warm sunset vibes"
- /palette from https://stripe.com
- /palette interactive
```

## Monitoring & Logging

### Error Tracking

```typescript
class ErrorTracker {
  static log(error: Error, context: any) {
    const entry = {
      timestamp: new Date(),
      error: {
        message: error.message,
        stack: error.stack
      },
      context,
      version: VERSION
    };

    appendToFile('~/.claude-color/errors.log', entry);
  }
}
```

### Usage Analytics (Local Only)

```typescript
interface UsageMetrics {
  commandCounts: Record<string, number>;
  averageSessionDuration: number;
  featuresUsed: string[];
  errorRate: number;
}

// Stored locally, never sent externally
```

## Future Technical Enhancements

### MCP Server (v2.0)

- Native Claude Code integration
- Bidirectional communication
- Real-time palette updates
- Deeper context awareness

### Performance (v1.1)

- Worker threads for image processing
- Streaming palette generation
- Progressive rendering

### Advanced AI (v1.2)

- Fine-tuned model for color aesthetics
- Multi-modal input (sketch + prompt)
- Style transfer capabilities
