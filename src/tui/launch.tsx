/**
 * TUI launcher utility
 *
 * Provides a simple function to launch the Ink TUI
 */

import React from 'react';
import { render } from 'ink';
import { PaletteEditor } from './PaletteEditor';
import { Palette } from '../types';

/**
 * Launch the interactive palette editor
 *
 * @param palette - Initial palette to edit
 * @param onSave - Callback when user saves the palette
 * @param onExit - Callback when user exits without saving
 */
export function launchPaletteEditor(
  palette: Palette,
  onSave: (palette: Palette) => void,
  onExit: () => void
): void {
  render(<PaletteEditor palette={palette} onSave={onSave} onExit={onExit} />);
}
