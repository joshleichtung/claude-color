# Claude Color - Testing Strategy

## Testing Philosophy

### Goals
1. **Correctness**: Color algorithms produce mathematically accurate results
2. **Reliability**: Commands work consistently across platforms
3. **Usability**: UX meets quality standards
4. **Performance**: Operations complete within time budgets
5. **Maintainability**: Tests are clear, fast, and easy to update

### Coverage Targets

- **Overall**: 80%+ code coverage
- **Core Algorithms**: 100% coverage (color theory, conversions)
- **CLI Commands**: 90%+ coverage
- **AI Integration**: 70%+ coverage (mock external APIs)
- **Learning System**: 80%+ coverage

## Testing Pyramid

```
       ┌─────────┐
       │   E2E   │  10% - Complete workflows
       │ 50 tests│
       └─────────┘
      ┌───────────┐
      │Integration│  30% - Command integration
      │ 150 tests │
      └───────────┘
    ┌──────────────┐
    │     Unit     │  60% - Individual functions
    │  300+ tests  │
    └──────────────┘
```

## Test Types

### 1. Unit Tests

Test individual functions and utilities in isolation.

**Tools**: Jest, ts-jest

**Example - Color Conversion**:
```typescript
describe('Color Conversions', () => {
  describe('hexToRgb', () => {
    it('converts 6-digit hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('handles 3-digit hex shorthand', () => {
      expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('throws on invalid hex', () => {
      expect(() => hexToRgb('invalid')).toThrow('Invalid HEX color');
    });
  });

  describe('rgbToHsl', () => {
    it('converts pure red correctly', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    it('converts pure white correctly', () => {
      const result = rgbToHsl({ r: 255, g: 255, b: 255 });
      expect(result.l).toBe(100);
    });
  });
});
```

**Example - Color Theory**:
```typescript
describe('Color Theory Algorithms', () => {
  describe('generateComplementary', () => {
    it('generates opposite hue', () => {
      const base = { h: 180, s: 50, l: 50 };
      const result = generateComplementary(base);

      expect(result).toHaveLength(5);
      expect(result[1].h).toBe(0); // 180 + 180 = 360 = 0
    });

    it('maintains saturation and lightness', () => {
      const base = { h: 120, s: 70, l: 40 };
      const result = generateComplementary(base);

      // Complementary color should have similar s/l
      expect(result[1].s).toBeCloseTo(70, 0);
    });
  });

  describe('generateAnalogous', () => {
    it('generates adjacent hues', () => {
      const base = { h: 180, s: 50, l: 50 };
      const result = generateAnalogous(base);

      expect(result).toHaveLength(5);
      expect(result[0].h).toBe(150); // 180 - 30
      expect(result[2].h).toBe(180); // base
      expect(result[4].h).toBe(210); // 180 + 30
    });
  });

  describe('generateTriadic', () => {
    it('generates evenly spaced hues', () => {
      const base = { h: 0, s: 50, l: 50 };
      const result = generateTriadic(base);

      expect(result[0].h).toBe(0);
      expect(result[1].h).toBe(120);
      expect(result[2].h).toBe(240);
    });
  });
});
```

**Example - WCAG Contrast**:
```typescript
describe('WCAG Contrast Calculations', () => {
  describe('calculateContrastRatio', () => {
    it('white on black is 21:1', () => {
      const white = { r: 255, g: 255, b: 255 };
      const black = { r: 0, g: 0, b: 0 };
      expect(calculateContrastRatio(white, black)).toBe(21);
    });

    it('calculates medium contrast', () => {
      const blue = { r: 59, g: 130, b: 246 };
      const white = { r: 255, g: 255, b: 255 };
      const ratio = calculateContrastRatio(blue, white);
      expect(ratio).toBeGreaterThan(3);
      expect(ratio).toBeLessThan(5);
    });
  });

  describe('checkWCAGCompliance', () => {
    it('identifies AA pass', () => {
      const result = checkWCAGCompliance(4.6);
      expect(result.aa).toBe(true);
      expect(result.aaa).toBe(false);
    });

    it('identifies AAA pass', () => {
      const result = checkWCAGCompliance(7.5);
      expect(result.aa).toBe(true);
      expect(result.aaa).toBe(true);
    });
  });
});
```

### 2. Integration Tests

Test command workflows and component integration.

**Tools**: Jest, mock file system, mock Anthropic API

**Example - CLI Commands**:
```typescript
import { execCLI, mockAnthropicAPI } from './test-utils';

describe('CLI Integration', () => {
  describe('generate command', () => {
    it('generates default random palette', async () => {
      const result = await execCLI('claude-color generate');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Generated 5 palettes');
      expect(result.stdout).toMatch(/#[0-9A-F]{6}/);
    });

    it('generates with specific scheme', async () => {
      const result = await execCLI(
        'claude-color generate --scheme analogous --base "#3B82F6"'
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('analogous');
    });

    it('handles invalid base color', async () => {
      const result = await execCLI(
        'claude-color generate --base "invalid"'
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid HEX color');
    });
  });

  describe('prompt-based generation', () => {
    beforeEach(() => {
      mockAnthropicAPI.reset();
    });

    it('interprets natural language prompt', async () => {
      mockAnthropicAPI.mockPromptInterpretation({
        hues: [180, 200, 220],
        saturation: [60, 80],
        // ...
      });

      const result = await execCLI(
        'claude-color "professional dashboard"'
      );

      expect(result.exitCode).toBe(0);
      expect(mockAnthropicAPI.calls).toHaveLength(1);
    });

    it('uses cache for repeated prompts', async () => {
      mockAnthropicAPI.mockPromptInterpretation({});

      await execCLI('claude-color "test prompt"');
      await execCLI('claude-color "test prompt"');

      expect(mockAnthropicAPI.calls).toHaveLength(1); // Cache hit
    });
  });

  describe('favorites workflow', () => {
    it('saves and recalls favorite', async () => {
      // Generate
      await execCLI('claude-color generate');

      // Save
      const saveResult = await execCLI(
        'claude-color favorites save "Test Palette" --tags test'
      );
      expect(saveResult.exitCode).toBe(0);

      // List
      const listResult = await execCLI('claude-color favorites list');
      expect(listResult.stdout).toContain('Test Palette');

      // Load
      const loadResult = await execCLI(
        'claude-color favorites load "Test Palette"'
      );
      expect(loadResult.exitCode).toBe(0);
    });
  });

  describe('export workflow', () => {
    it('exports to CSS format', async () => {
      const tmpFile = '/tmp/test-colors.css';

      await execCLI('claude-color generate');
      const result = await execCLI(
        `claude-color export --format css --output ${tmpFile}`
      );

      expect(result.exitCode).toBe(0);
      expect(fs.existsSync(tmpFile)).toBe(true);

      const content = fs.readFileSync(tmpFile, 'utf-8');
      expect(content).toContain(':root {');
      expect(content).toContain('--color-primary:');
    });
  });
});
```

**Example - Image Extraction**:
```typescript
describe('Image Color Extraction', () => {
  it('extracts colors from PNG', async () => {
    const testImage = path.join(__dirname, 'fixtures/test-logo.png');
    const result = await extractColorsFromImage(testImage);

    expect(result).toHaveLength(5);
    expect(result[0]).toHaveProperty('hex');
    expect(result[0]).toHaveProperty('rgb');
  });

  it('filters gray colors', async () => {
    const grayImage = path.join(__dirname, 'fixtures/grayscale.png');
    const result = await extractColorsFromImage(grayImage);

    // Should have filtered most grays
    result.forEach(color => {
      expect(isGray(color)).toBe(false);
    });
  });
});
```

### 3. TUI Component Tests

Test interactive terminal interface.

**Tools**: ink-testing-library

**Example**:
```typescript
import { render } from 'ink-testing-library';
import App from '../src/tui/App';

describe('TUI', () => {
  it('renders multiple palettes', () => {
    const palettes = [mockPalette1, mockPalette2, mockPalette3];
    const { lastFrame } = render(<App palettes={palettes} />);

    expect(lastFrame()).toContain('[1/3]');
    expect(lastFrame()).toContain('████'); // Color blocks
  });

  it('navigates with arrow keys', () => {
    const palettes = [mockPalette1, mockPalette2];
    const { lastFrame, stdin } = render(<App palettes={palettes} />);

    expect(lastFrame()).toContain('[1/2]');

    stdin.write('→'); // Next
    expect(lastFrame()).toContain('[2/2]');

    stdin.write('←'); // Previous
    expect(lastFrame()).toContain('[1/2]');
  });

  it('locks colors', () => {
    const palette = mockPalette1;
    const { lastFrame, stdin } = render(<App palettes={[palette]} />);

    stdin.write('l'); // Lock
    expect(lastFrame()).toContain('🔒'); // Lock indicator
  });

  it('shows help overlay', () => {
    const { lastFrame, stdin } = render(<App palettes={[mockPalette1]} />);

    stdin.write('?');
    expect(lastFrame()).toContain('Keyboard Shortcuts');
    expect(lastFrame()).toContain('Space');
  });
});
```

### 4. Learning System Tests

Test preference tracking and profile generation.

**Example**:
```typescript
describe('Preference Learning', () => {
  describe('Interaction Tracking', () => {
    it('records palette selection', async () => {
      const tracker = new InteractionTracker();
      const palette = mockPalette1;

      await tracker.recordInteraction({
        action: 'selected',
        palette,
        context: { /* ... */ },
        decision: {
          timeToDecision: 15,
          viewedAlternatives: 3,
          confidence: 0.8
        }
      });

      const interactions = await tracker.getAll();
      expect(interactions).toHaveLength(1);
      expect(interactions[0].action).toBe('selected');
    });
  });

  describe('Statistical Analysis', () => {
    it('identifies hue preferences', () => {
      const interactions = [
        mockInteraction({ palette: blueishPalette, action: 'selected' }),
        mockInteraction({ palette: bluePalette, action: 'selected' }),
        mockInteraction({ palette: redPalette, action: 'rejected' })
      ];

      const analysis = analyzeStatisticalPreferences(interactions);

      expect(analysis.hues.preferred).toContainEqual(
        expect.arrayContaining([180, 240])
      );
    });
  });

  describe('Taste Profile Generation', () => {
    it('generates profile from interactions', async () => {
      mockAnthropicAPI.mockProfileGeneration({
        preferences: {
          hues: { preferred: [180, 240], avoided: [0, 60] },
          saturation: { range: [50, 75] }
        }
      });

      const interactions = generateMockInteractions(15);
      const profile = await generateTasteProfileViaLLM(interactions);

      expect(profile.preferences.hues.preferred).toBeDefined();
      expect(profile.confidence).toBeGreaterThan(0);
    });
  });

  describe('Context Detection', () => {
    it('detects React project', async () => {
      const context = await detectContext('/path/to/react-app');
      expect(context.projectType).toBe('react_app');
    });

    it('detects time of day', () => {
      const mockDate = new Date('2025-10-08T14:00:00');
      const context = detectTimeContext(mockDate);
      expect(context.timeOfDay).toBe('afternoon');
    });
  });
});
```

### 5. End-to-End Tests

Test complete user workflows.

**Example**:
```typescript
describe('E2E Workflows', () => {
  it('complete palette generation and export workflow', async () => {
    // Generate from prompt
    const gen = await execCLI('claude-color "professional dashboard"');
    expect(gen.exitCode).toBe(0);

    // Navigate to palette 2
    const next = await execCLI('next');
    expect(next.stdout).toContain('[2/5]');

    // Select and export
    await execCLI('select 2');
    const exp = await execCLI(
      'claude-color export --format css --output /tmp/test.css'
    );
    expect(exp.exitCode).toBe(0);

    // Verify file contents
    const content = fs.readFileSync('/tmp/test.css', 'utf-8');
    expect(content).toContain('--color-primary:');
  });

  it('learning workflow improves suggestions', async () => {
    // Initial generation (no profile)
    const initial = await execCLI('claude-color "test"');
    const initialPalettes = parseOutput(initial.stdout);

    // Simulate 15 interactions with blue preference
    for (let i = 0; i < 15; i++) {
      await execCLI('claude-color generate --scheme analogous --base "#3B82F6"');
      await execCLI('select 1'); // Select blue palette
      await execCLI('favorites save "test-' + i + '"');
    }

    // Generate with personalization
    const personalized = await execCLI('claude-color "test" --personalized');
    const personalizedPalettes = parseOutput(personalized.stdout);

    // Should show more blue-ish palettes
    const blueCount = personalizedPalettes.filter(p =>
      hasBlueishHues(p)
    ).length;
    expect(blueCount).toBeGreaterThan(3);
  });
});
```

## Test Fixtures

### Mock Data

Create reusable mock data in `tests/fixtures/`:

**colors.ts**:
```typescript
export const mockColors = {
  blue: { hex: '#3B82F6', rgb: { r: 59, g: 130, b: 246 }, hsl: { h: 217, s: 91, l: 60 } },
  red: { hex: '#EF4444', rgb: { r: 239, g: 68, b: 68 }, hsl: { h: 0, s: 84, l: 60 } },
  green: { hex: '#10B981', rgb: { r: 16, g: 185, b: 129 }, hsl: { h: 160, s: 84, l: 39 } }
};

export const mockPalette1: Palette = {
  id: 'test-1',
  colors: [mockColors.blue, /* ... */],
  scheme: 'analogous',
  metadata: { /* ... */ }
};
```

**interactions.ts**:
```typescript
export function generateMockInteractions(count: number): Interaction[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `interaction-${i}`,
    timestamp: new Date(),
    action: i % 3 === 0 ? 'selected' : 'rejected',
    palette: mockPalette1,
    context: { /* ... */ },
    decision: { /* ... */ }
  }));
}
```

## Test Utilities

### CLI Execution Helper

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function execCLI(command: string): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { exitCode: 0, stdout, stderr };
  } catch (error: any) {
    return {
      exitCode: error.code || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message
    };
  }
}
```

### Mock Anthropic API

```typescript
export const mockAnthropicAPI = {
  calls: [] as any[],

  reset() {
    this.calls = [];
  },

  mockPromptInterpretation(result: PromptInterpretation) {
    jest.spyOn(anthropic.messages, 'create').mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(result) }]
    } as any);
  },

  mockProfileGeneration(profile: Partial<TasteProfile>) {
    jest.spyOn(anthropic.messages, 'create').mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(profile) }]
    } as any);
  }
};
```

## Performance Testing

### Benchmark Tests

```typescript
describe('Performance', () => {
  it('palette generation completes in <1 second', async () => {
    const start = Date.now();
    await generatePalette({ scheme: 'analogous' });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
  });

  it('TUI renders in <16ms (60fps)', () => {
    const start = performance.now();
    render(<App palettes={mockPalettes} />);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(16);
  });

  it('image extraction completes in <2 seconds', async () => {
    const start = Date.now();
    await extractColorsFromImage('./fixtures/test-image.png');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(2000);
  });
});
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- color-theory.test.ts

# Run in watch mode
npm test -- --watch

# Run E2E tests only
npm test -- --testPathPattern=e2e

# Run with verbose output
npm test -- --verbose
```

## Coverage Reports

### Target Coverage

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Exclusions

Files excluded from coverage requirements:
- `src/cli.ts` (entry point)
- `tests/**/*` (test files)
- `*.config.js` (configuration)
- Generated files

## Test Maintenance

### Guidelines

1. **Keep tests fast**: Unit tests <100ms, integration <1s
2. **Keep tests independent**: No shared state between tests
3. **Use descriptive names**: Test name should describe behavior
4. **Test behavior, not implementation**: Focus on what, not how
5. **Mock external dependencies**: API calls, file system, etc.

### Regular Review

- Remove redundant tests
- Update fixtures to match real data
- Refactor slow tests
- Add tests for reported bugs

---

_This testing strategy will be implemented progressively across all development phases._
