# Claude Color Development Rules

These rules govern the development practices for the Claude Color project, ensuring high quality, consistency, and maintainability throughout all phases.

## Code Quality Standards

### TypeScript Configuration

**Strict Mode Required**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Code Formatting

- **ESLint**: No warnings or errors allowed
- **Prettier**: Automatic formatting on save
- **Line Length**: 100 characters maximum
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing Commas**: ES5 style

### Documentation

**JSDoc Required For**:
- All exported functions
- All exported classes
- All public methods
- Complex algorithms

**Example**:
```typescript
/**
 * Generate a complementary color palette from a base color.
 *
 * @param baseColor - The base color in HSL format
 * @param options - Optional generation parameters
 * @returns Array of 5 colors forming a complementary palette
 * @throws {InvalidColorError} If base color is invalid
 *
 * @example
 * ```typescript
 * const palette = generateComplementary({ h: 180, s: 50, l: 50 });
 * console.log(palette); // [{ h: 180, ... }, { h: 0, ... }, ...]
 * ```
 */
export function generateComplementary(
  baseColor: HSL,
  options?: GenerationOptions
): Color[] {
  // Implementation
}
```

## Testing Requirements

### Coverage Targets

- **Overall**: 80%+ code coverage
- **Core algorithms**: 100% coverage
- **CLI commands**: 90%+ coverage
- **AI integration**: 70%+ coverage
- **TUI components**: 80%+ coverage

### Test Organization

```
tests/
├── unit/
│   ├── color-theory.test.ts
│   ├── conversions.test.ts
│   └── wcag.test.ts
├── integration/
│   ├── cli-commands.test.ts
│   ├── favorites.test.ts
│   └── export.test.ts
├── tui/
│   └── components.test.ts
├── e2e/
│   └── workflows.test.ts
└── fixtures/
    ├── colors.ts
    ├── palettes.ts
    └── images/
```

### Test-Driven Development

**When Implementing New Features**:
1. Write failing test first
2. Implement minimum code to pass
3. Refactor while keeping tests green
4. Add edge case tests
5. Verify coverage targets met

**Test Naming Convention**:
```typescript
describe('Component/Feature', () => {
  describe('method/function', () => {
    it('should do expected behavior', () => {
      // Test implementation
    });

    it('should throw error on invalid input', () => {
      // Error case
    });
  });
});
```

## Git Workflow

### Branch Strategy

- **main**: Production-ready code, protected branch
- **Feature branches**: `phase-{n}-{feature-name}`
- **No direct commits to main**: All changes via PR pattern (self-review)

### Commit Message Format

**Conventional Commits Required**:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `chore`: Changes to build process or auxiliary tools
- `style`: Code style changes (formatting, missing semi-colons, etc.)

**Examples**:
```
feat(color-theory): implement triadic color generation

Add generateTriadic function that creates evenly spaced colors
at 120° intervals on the color wheel.

feat(cli): add export command with multiple formats

Supports CSS, SCSS, JSON, JS, TS, Tailwind, and SVG formats.
Includes --naming flag for semantic or numeric conventions.

fix(wcag): correct contrast ratio calculation for edge cases

Previous implementation didn't handle pure black/white correctly.
Now uses proper relative luminance formula.

test(learning): add preference analysis unit tests

Covers statistical analysis and LLM-based profile generation.

docs: update API reference with new export formats
```

### Commit Frequency

**Incremental Commits**:
- Commit after each logical unit of work
- Commit after adding tests for a feature
- Commit after successful refactoring
- Commit before taking breaks

**Push Frequency**:
- Push after every 2-3 commits
- Push before taking breaks
- Push at end of coding session
- Push after phase completion

### Git Hooks

**Pre-commit** (via Husky):
```bash
#!/bin/sh
npm run lint
npm run format
npm run type-check
```

**Pre-push** (via Husky):
```bash
#!/bin/sh
npm test
```

**Commit-msg** (via commitlint):
```bash
#!/bin/sh
npx --no-install commitlint --edit $1
```

### Phase Tagging

**After Each Phase Completion**:
```bash
# Ensure all tests pass
npm test

# Ensure no lint errors
npm run lint

# Commit final phase work
git commit -m "feat(phase-X): complete phase X deliverables"

# Tag the phase
git tag -a v0.X.0-phaseX-complete -m "Phase X: [description]"

# Push commits and tags
git push origin main
git push origin v0.X.0-phaseX-complete
```

**Tag Naming Convention**:
- Phase 0: `v0.0.0-phase0-complete`
- Phase 1: `v0.1.0-phase1-complete`
- ...
- Phase 10: `v1.0.0-production-ready`

## Decision Logging

### When to Log Decisions

**Required Logging**:
- Architectural choices
- Technology selection
- API design decisions
- Data model changes
- Algorithm implementations
- User-facing behavior

**Optional Logging**:
- Minor implementation details
- Internal refactorings
- Trivial fixes

### Decision Format

Record in `docs/DEVELOPMENT_LOG.md`:

```markdown
### [DECISION-X.Y] {Decision Title}

**Question**: What needs to be decided?

**Options**:
1. Option A
   - Pros: [list]
   - Cons: [list]
2. Option B
   - Pros: [list]
   - Cons: [list]

**Choice**: Selected option

**Status**: ✓ [AUTONOMOUS] / ❓ [USER-INPUT-RECOMMENDED] / ⏸️ [DEFERRED]

**Rationale**: Detailed reasoning for the choice

**Date**: 2025-10-08

**Notes**: Additional context, alternatives considered
```

### User Input Flags

- **✓ [AUTONOMOUS]**: Decision made with high confidence
- **❓ [USER-INPUT-RECOMMENDED]**: Would benefit from user review
- **⏸️ [DEFERRED]**: Postponed to later phase

## Code Organization

### Project Structure

```
claude-color/
├── src/
│   ├── core/
│   │   ├── color-theory.ts      # Color algorithms
│   │   ├── conversions.ts       # Color space conversions
│   │   ├── generator.ts         # Palette generation
│   │   ├── variation.ts         # Variation strategies
│   │   └── wcag.ts              # Accessibility checks
│   ├── ai/
│   │   ├── prompt-interpreter.ts
│   │   ├── comparative-analysis.ts
│   │   └── cache.ts
│   ├── learning/
│   │   ├── interaction-tracker.ts
│   │   ├── statistical-analysis.ts
│   │   ├── profile-generator.ts
│   │   └── context-detector.ts
│   ├── storage/
│   │   ├── favorites.ts
│   │   ├── interactions.ts
│   │   ├── profiles.ts
│   │   └── base.ts
│   ├── cli/
│   │   ├── commands/
│   │   │   ├── generate.ts
│   │   │   ├── favorites.ts
│   │   │   ├── export.ts
│   │   │   └── profile.ts
│   │   ├── parser.ts
│   │   └── output.ts
│   ├── tui/
│   │   ├── components/
│   │   │   ├── PaletteView.tsx
│   │   │   ├── ColorBlock.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── HelpOverlay.tsx
│   │   ├── hooks/
│   │   │   ├── useKeyboard.ts
│   │   │   └── usePaletteState.ts
│   │   └── App.tsx
│   ├── export/
│   │   ├── formats/
│   │   │   ├── css.ts
│   │   │   ├── scss.ts
│   │   │   ├── json.ts
│   │   │   ├── tailwind.ts
│   │   │   └── svg.ts
│   │   └── exporter.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── errors.ts
│   ├── types/
│   │   ├── color.ts
│   │   ├── palette.ts
│   │   ├── profile.ts
│   │   └── index.ts
│   ├── index.ts              # Public API exports
│   └── cli.ts                # CLI entry point
├── tests/
├── docs/
├── examples/
└── scripts/
```

### Naming Conventions

**Files**:
- Lowercase with hyphens: `color-theory.ts`
- React components: PascalCase: `PaletteView.tsx`

**Functions**:
- camelCase: `generateComplementary()`
- Verb-first: `calculateContrastRatio()`, `extractColors()`

**Classes**:
- PascalCase: `InteractionTracker`, `ProfileGenerator`

**Constants**:
- UPPER_SNAKE_CASE: `DEFAULT_PALETTE_SIZE`, `MAX_CACHE_SIZE`

**Types/Interfaces**:
- PascalCase: `Palette`, `TasteProfile`, `InteractionContext`

## Error Handling

### Error Classes

Create custom errors for different scenarios:

```typescript
export class InvalidColorError extends Error {
  constructor(color: string) {
    super(`Invalid color format: ${color}`);
    this.name = 'InvalidColorError';
  }
}

export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

export class StorageError extends Error {
  constructor(message: string, public path: string) {
    super(message);
    this.name = 'StorageError';
  }
}
```

### Error Handling Pattern

```typescript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  if (error instanceof InvalidColorError) {
    // Handle specific error
    logger.error('Invalid color provided', { error });
    throw error; // Re-throw or handle appropriately
  } else if (error instanceof APIError) {
    // Handle API errors
    logger.error('API request failed', { error });
    // Maybe retry or fallback
  } else {
    // Unknown error
    logger.error('Unexpected error', { error });
    throw error;
  }
}
```

### User-Facing Error Messages

**Good**:
```
❌ Invalid HEX color: "invalid"
   Expected format: #RRGGBB or #RGB
   Example: #3B82F6
```

**Bad**:
```
Error: Invalid input
```

## Performance Standards

### Timing Requirements

- **CLI startup**: <500ms
- **Palette generation**: <1 second
- **TUI rendering**: <16ms (60fps)
- **Image extraction**: <2 seconds
- **Website extraction**: <5 seconds
- **Profile generation**: <3 seconds

### Optimization Rules

**Always**:
- Cache expensive operations
- Use lazy loading for optional features
- Minimize bundle size
- Avoid blocking operations

**Never**:
- Premature optimization
- Optimize without measuring
- Trade correctness for speed (without reason)

## Security Rules

### API Key Handling

**Required**:
```typescript
// Read from environment only
const apiKey = process.env.ANTHROPIC_API_KEY;

// NEVER log API keys
logger.debug('Making API request'); // ✓
logger.debug(`API key: ${apiKey}`); // ✗ NEVER

// NEVER commit API keys
// Add to .gitignore
```

### Input Validation

**Always validate user input**:
```typescript
function parseHexColor(input: string): RGB {
  // Validate format
  if (!isValidHex(input)) {
    throw new InvalidColorError(input);
  }

  // Sanitize
  const cleaned = input.trim().toUpperCase();

  return hexToRgb(cleaned);
}
```

### File System Access

**Restrict writes**:
```typescript
const ALLOWED_PATHS = [
  path.join(os.homedir(), '.claude-color'),
  process.cwd() // For exports
];

function validatePath(targetPath: string): void {
  const resolved = path.resolve(targetPath);

  if (!ALLOWED_PATHS.some(allowed => resolved.startsWith(allowed))) {
    throw new SecurityError('Path not allowed');
  }
}
```

## Quality Gates

### Before Commit

**Must Pass**:
- ✓ ESLint (no errors or warnings)
- ✓ Prettier (formatted)
- ✓ TypeScript (no type errors)

### Before Push

**Must Pass**:
- ✓ All pre-commit checks
- ✓ All tests passing
- ✓ Coverage targets met

### Before Phase Tag

**Must Pass**:
- ✓ All pre-push checks
- ✓ Documentation updated
- ✓ DEVELOPMENT_LOG.md updated
- ✓ README.md updated with new features

## Code Review Checklist

When reviewing code (self-review before push):

- [ ] Tests added for new functionality
- [ ] Tests pass locally
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No console.log debugging statements
- [ ] Error handling implemented
- [ ] Type safety maintained
- [ ] Performance considerations addressed
- [ ] Security implications considered
- [ ] Breaking changes documented

## Continuous Improvement

### After Each Phase

**Review**:
- What went well?
- What could be improved?
- What was learned?
- What should be done differently?

**Document**:
- Add lessons learned to DEVELOPMENT_LOG.md
- Update rules if patterns emerge
- Share insights with team/community

### Technical Debt

**Track Technical Debt**:
- Create GitHub issues for known debt
- Label with `tech-debt`
- Prioritize in future phases
- Never let debt accumulate indefinitely

**Refactor Regularly**:
- Small, incremental refactorings
- Keep tests green
- Don't refactor and add features simultaneously

## Development Environment

### Required Tools

- Node.js 18+
- npm 9+
- Git 2.30+
- VS Code (recommended) or equivalent

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Jest
- GitLens

### Editor Configuration

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "jest.autoRun": "off"
}
```

---

## Summary

These rules ensure:
- ✅ High code quality
- ✅ Consistent style
- ✅ Comprehensive testing
- ✅ Clear documentation
- ✅ Traceable decisions
- ✅ Secure implementation
- ✅ Maintainable codebase

**Follow these rules strictly throughout all phases of development.**
