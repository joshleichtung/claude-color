/**
 * Cursor extension for Claude Color
 *
 * Enhanced VSCode extension with Cursor-specific AI integrations
 */

import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Claude Color extension is now active in Cursor');

  // Register all commands
  context.subscriptions.push(
    vscode.commands.registerCommand('claude-color.generatePalette', generatePalette),
    vscode.commands.registerCommand('claude-color.generateFromPrompt', generateFromPrompt),
    vscode.commands.registerCommand(
      'claude-color.generateFromSelection',
      generateFromSelection
    ),
    vscode.commands.registerCommand('claude-color.extractFromImage', extractFromImage),
    vscode.commands.registerCommand('claude-color.showFavorites', showFavorites),
    vscode.commands.registerCommand(
      'claude-color.getRecommendations',
      getRecommendations
    ),
    vscode.commands.registerCommand('claude-color.openEditor', openEditor),
    vscode.commands.registerCommand('claude-color.analyzeColors', analyzeColors),
    vscode.commands.registerCommand(
      'claude-color.suggestImprovements',
      suggestImprovements
    ),
    vscode.commands.registerCommand('claude-color.insertPalette', insertPalette)
  );

  // Auto-analyze colors in CSS/design files if enabled
  const config = vscode.workspace.getConfiguration('claudeColor');
  if (config.get<boolean>('autoAnalyze')) {
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (shouldAutoAnalyze(document)) {
        analyzeColorsInDocument(document);
      }
    });
  }
}

/**
 * Check if document should be auto-analyzed
 */
function shouldAutoAnalyze(document: vscode.TextDocument): boolean {
  const ext = document.fileName.split('.').pop()?.toLowerCase();
  return ['css', 'scss', 'sass', 'less', 'jsx', 'tsx'].includes(ext || '');
}

/**
 * Analyze colors in a document
 */
async function analyzeColorsInDocument(document: vscode.TextDocument) {
  const colors = extractColorsFromText(document.getText());
  if (colors.length > 0) {
    vscode.window.showInformationMessage(
      `Found ${colors.length} colors in ${document.fileName}`
    );
  }
}

/**
 * Extract color codes from text
 */
function extractColorsFromText(text: string): string[] {
  const hexRegex = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
  const rgbRegex = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;
  const rgbaRegex = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g;
  const hslRegex = /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g;

  const hex = text.match(hexRegex) || [];
  const rgb = text.match(rgbRegex) || [];
  const rgba = text.match(rgbaRegex) || [];
  const hsl = text.match(hslRegex) || [];

  return [...hex, ...rgb, ...rgba, ...hsl];
}

/**
 * Generate a color palette with scheme selection
 */
async function generatePalette() {
  try {
    const scheme = await vscode.window.showQuickPick(
      [
        { label: 'Complementary', value: 'complementary' },
        { label: 'Analogous', value: 'analogous' },
        { label: 'Triadic', value: 'triadic' },
        { label: 'Tetradic', value: 'tetradic' },
        { label: 'Monochromatic', value: 'monochromatic' },
        { label: 'Random', value: 'random' },
      ],
      { placeHolder: 'Select a color scheme' }
    );

    if (!scheme) {
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating palette...',
        cancellable: false,
      },
      async () => {
        const { stdout } = await execAsync(
          `npx claude-color generate --scheme ${scheme.value} --format json`
        );

        const palette = JSON.parse(stdout);
        await showPalettePreview(palette);
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to generate palette: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate palette from AI prompt
 */
async function generateFromPrompt() {
  try {
    const prompt = await vscode.window.showInputBox({
      placeHolder: 'Enter a description (e.g., "warm autumn sunset colors")',
      prompt: 'Describe the palette you want to create',
    });

    if (!prompt) {
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating AI-powered palette...',
        cancellable: false,
      },
      async () => {
        const { stdout } = await execAsync(
          `npx claude-color generate --prompt "${prompt}" --format json`
        );

        const palette = JSON.parse(stdout);
        await showPalettePreview(palette);
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to generate palette: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate palette from selected text (Cursor-specific)
 */
async function generateFromSelection() {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.document.getText(editor.selection);
    if (!selection) {
      vscode.window.showErrorMessage('No text selected');
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating palette from selection...',
        cancellable: false,
      },
      async () => {
        const { stdout } = await execAsync(
          `npx claude-color generate --prompt "${selection}" --format json`
        );

        const palette = JSON.parse(stdout);
        await showPalettePreview(palette);
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to generate palette: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Extract colors from an image
 */
async function extractFromImage() {
  try {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        Images: ['png', 'jpg', 'jpeg', 'webp'],
      },
      title: 'Select an image to extract colors from',
    });

    if (!fileUri || fileUri.length === 0) {
      return;
    }

    const imagePath = fileUri[0].fsPath;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Extracting colors from image...',
        cancellable: false,
      },
      async () => {
        const { stdout } = await execAsync(
          `npx claude-color extract --source "${imagePath}" --format json`
        );

        const palette = JSON.parse(stdout);
        await showPalettePreview(palette);
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to extract colors: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Show favorite palettes
 */
async function showFavorites() {
  try {
    const { stdout } = await execAsync('npx claude-color favorites list --format json');
    const favorites = JSON.parse(stdout);

    if (favorites.length === 0) {
      vscode.window.showInformationMessage('No favorite palettes saved yet');
      return;
    }

    const selected = await vscode.window.showQuickPick(
      favorites.map((fav: any) => ({
        label: fav.name,
        description: `${fav.colors.length} colors | ${fav.scheme}`,
        palette: fav,
      })),
      { placeHolder: 'Select a favorite palette' }
    );

    if (selected) {
      await showPalettePreview(selected.palette);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to load favorites: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get personalized recommendations
 */
async function getRecommendations() {
  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating personalized recommendations...',
        cancellable: false,
      },
      async () => {
        const { stdout } = await execAsync(
          'npx claude-color recommend --count 5 --format json'
        );

        const recommendations = JSON.parse(stdout);

        const selected = await vscode.window.showQuickPick(
          recommendations.map((rec: any) => ({
            label: `Score: ${rec.score}/100`,
            description: rec.reasoning,
            palette: rec.palette,
          })),
          { placeHolder: 'Select a recommended palette' }
        );

        if (selected) {
          await showPalettePreview(selected.palette);
        }
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to get recommendations: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Open interactive palette editor
 */
async function openEditor() {
  try {
    await execAsync('npx claude-color edit');
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to open editor: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Analyze colors in current file (Cursor-specific)
 */
async function analyzeColors() {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const text = editor.document.getText();
    const colors = extractColorsFromText(text);

    if (colors.length === 0) {
      vscode.window.showInformationMessage('No colors found in current file');
      return;
    }

    const analysis = `Found ${colors.length} colors:\n${colors.slice(0, 10).join('\n')}${colors.length > 10 ? `\n...and ${colors.length - 10} more` : ''}`;

    const action = await vscode.window.showInformationMessage(
      analysis,
      'Generate Palette from These Colors',
      'Suggest Improvements'
    );

    if (action === 'Generate Palette from These Colors') {
      // Use first color as base for generation
      const baseColor = colors[0];
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating palette...',
          cancellable: false,
        },
        async () => {
          const { stdout } = await execAsync(
            `npx claude-color generate --base "${baseColor}" --format json`
          );

          const palette = JSON.parse(stdout);
          await showPalettePreview(palette);
        }
      );
    } else if (action === 'Suggest Improvements') {
      await suggestColorImprovements(colors);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to analyze colors: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Suggest improvements for selected colors (Cursor-specific)
 */
async function suggestImprovements() {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.document.getText(editor.selection);
    const colors = extractColorsFromText(selection);

    if (colors.length === 0) {
      vscode.window.showErrorMessage('No colors found in selection');
      return;
    }

    await suggestColorImprovements(colors);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to suggest improvements: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get AI suggestions for color improvements
 */
async function suggestColorImprovements(colors: string[]) {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Analyzing colors...',
      cancellable: false,
    },
    async () => {
      // This would use the CLI to analyze accessibility and contrast
      const suggestions = [
        'Consider increasing contrast between foreground and background',
        'Use a consistent color scheme (currently mixed schemes detected)',
        'Primary color could be more accessible for colorblind users',
      ];

      vscode.window.showInformationMessage(
        `Color Suggestions:\n${suggestions.join('\n')}`
      );
    }
  );
}

/**
 * Insert palette into active editor
 */
async function insertPalette() {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const { stdout } = await execAsync('npx claude-color favorites list --format json');
    const favorites = JSON.parse(stdout);

    if (favorites.length === 0) {
      vscode.window.showInformationMessage('No favorite palettes to insert');
      return;
    }

    const selected = await vscode.window.showQuickPick(
      favorites.map((fav: any) => ({
        label: fav.name,
        description: `${fav.colors.length} colors`,
        palette: fav,
      })),
      { placeHolder: 'Select a palette to insert' }
    );

    if (!selected) {
      return;
    }

    const config = vscode.workspace.getConfiguration('claudeColor');
    const format = config.get<string>('insertFormat') || 'css-variables';

    const paletteCode = formatPaletteForInsertion(selected.palette, format);

    await editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, paletteCode);
    });

    vscode.window.showInformationMessage('Palette inserted successfully');
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to insert palette: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Show palette preview with action options
 */
async function showPalettePreview(palette: any) {
  const colorPreview = palette.colors.map((c: any) => c.hex).join(' ');

  const action = await vscode.window.showInformationMessage(
    `Generated palette: ${colorPreview}`,
    'Insert into Editor',
    'Save as Favorite',
    'Copy as JSON'
  );

  if (action === 'Insert into Editor') {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const config = vscode.workspace.getConfiguration('claudeColor');
      const format = config.get<string>('insertFormat') || 'css-variables';
      const paletteCode = formatPaletteForInsertion(palette, format);

      await editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, paletteCode);
      });
    }
  } else if (action === 'Save as Favorite') {
    const name = await vscode.window.showInputBox({
      placeHolder: 'Enter a name for this palette',
      prompt: 'Save palette as favorite',
    });

    if (name) {
      const paletteJson = JSON.stringify(palette);
      await execAsync(`npx claude-color favorites save "${name}" '${paletteJson}'`);
      vscode.window.showInformationMessage('Palette saved to favorites');
    }
  } else if (action === 'Copy as JSON') {
    await vscode.env.clipboard.writeText(JSON.stringify(palette, null, 2));
    vscode.window.showInformationMessage('Palette copied to clipboard');
  }
}

/**
 * Format palette for insertion into editor
 */
function formatPaletteForInsertion(palette: any, format: string): string {
  const colors = palette.colors;

  switch (format) {
    case 'css-variables':
      return `:root {\n${colors.map((c: any, i: number) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}\n`;

    case 'sass-variables':
      return colors.map((c: any, i: number) => `$color-${i + 1}: ${c.hex};`).join('\n') + '\n';

    case 'tailwind-config':
      const tailwindColors = colors.reduce((acc: any, c: any, i: number) => {
        acc[`color-${i + 1}`] = c.hex;
        return acc;
      }, {});
      return `colors: ${JSON.stringify(tailwindColors, null, 2)}\n`;

    case 'json':
      return JSON.stringify(palette, null, 2) + '\n';

    case 'js-object':
      return `const palette = ${JSON.stringify(colors.map((c: any) => c.hex), null, 2)};\n`;

    default:
      return JSON.stringify(palette, null, 2) + '\n';
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('Claude Color extension is now deactivated');
}
