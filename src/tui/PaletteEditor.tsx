/**
 * Interactive palette editor TUI component
 *
 * Provides real-time color editing with keyboard navigation
 */

import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { Palette, Color } from '../types';
import { createColorFromHsl, hslToHex } from '../core/conversions';

interface PaletteEditorProps {
  palette: Palette;
  onSave: (palette: Palette) => void;
  onExit: () => void;
}

type EditMode = 'navigate' | 'edit-hue' | 'edit-saturation' | 'edit-lightness';

export const PaletteEditor: React.FC<PaletteEditorProps> = ({
  palette: initialPalette,
  onSave,
  onExit,
}) => {
  const [palette, setPalette] = useState(initialPalette);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<EditMode>('navigate');
  const [editValue, setEditValue] = useState('');
  const { exit } = useApp();

  // Handle keyboard navigation and mode switching
  useInput((input, key) => {
    if (mode === 'navigate') {
      // Navigation mode
      if (key.leftArrow && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      } else if (key.rightArrow && selectedIndex < palette.colors.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      } else if (input === 'h') {
        // Edit hue
        const color = palette.colors[selectedIndex];
        if (color) {
          setEditValue(Math.round(color.hsl.h).toString());
          setMode('edit-hue');
        }
      } else if (input === 's') {
        // Edit saturation
        const color = palette.colors[selectedIndex];
        if (color) {
          setEditValue(Math.round(color.hsl.s * 100).toString());
          setMode('edit-saturation');
        }
      } else if (input === 'l') {
        // Edit lightness
        const color = palette.colors[selectedIndex];
        if (color) {
          setEditValue(Math.round(color.hsl.l * 100).toString());
          setMode('edit-lightness');
        }
      } else if (input === 'w') {
        // Save and exit
        onSave(palette);
        exit();
      } else if (input === 'q' || (key.escape && !key.ctrl)) {
        // Exit without saving
        onExit();
        exit();
      }
    }
  });

  // Apply color edit
  const applyEdit = (value: string): void => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      return;
    }

    const currentColor = palette.colors[selectedIndex];
    if (!currentColor) {
      return;
    }

    let newColor: Color;

    switch (mode) {
      case 'edit-hue': {
        const h = Math.max(0, Math.min(360, numValue));
        newColor = createColorFromHsl({
          h,
          s: currentColor.hsl.s,
          l: currentColor.hsl.l,
        });
        break;
      }
      case 'edit-saturation': {
        const s = Math.max(0, Math.min(100, numValue)) / 100;
        newColor = createColorFromHsl({
          h: currentColor.hsl.h,
          s,
          l: currentColor.hsl.l,
        });
        break;
      }
      case 'edit-lightness': {
        const l = Math.max(0, Math.min(100, numValue)) / 100;
        newColor = createColorFromHsl({
          h: currentColor.hsl.h,
          s: currentColor.hsl.s,
          l,
        });
        break;
      }
      default:
        return;
    }

    // Update palette with new color
    const newColors = [...palette.colors];
    newColors[selectedIndex] = newColor;
    setPalette({ ...palette, colors: newColors });

    // Reset mode
    setMode('navigate');
    setEditValue('');
  };

  const currentColor = palette.colors[selectedIndex];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>🎨 Interactive Palette Editor</Text>
      <Text dimColor>Use ← → to navigate • h/s/l to edit • w to save • q to quit</Text>
      <Box marginTop={1} />

      {/* Color swatches */}
      <Box>
        {palette.colors.map((color, index) => {
          const isSelected = index === selectedIndex;
          const hex = hslToHex(color.hsl);

          return (
            <Box key={index} marginRight={1}>
              <Text
                backgroundColor={hex}
                color={color.hsl.l > 0.5 ? '#000000' : '#FFFFFF'}
                bold={isSelected}
              >
                {isSelected ? ` ${hex} ` : `  ${hex.slice(0, 4)}  `}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1} />

      {/* Selected color details */}
      {currentColor && (
        <Box flexDirection="column">
          <Text bold>
            Color {selectedIndex + 1} / {palette.colors.length}
          </Text>
          <Box marginTop={1} />

          <Box flexDirection="column">
            <Box>
              <Box width={15}>
                <Text>Hue (h):</Text>
              </Box>
              {mode === 'edit-hue' ? (
                <Box>
                  <TextInput
                    value={editValue}
                    onChange={setEditValue}
                    onSubmit={applyEdit}
                    placeholder="0-360"
                  />
                  <Text dimColor> (0-360°)</Text>
                </Box>
              ) : (
                <Text>{Math.round(currentColor.hsl.h)}°</Text>
              )}
            </Box>

            <Box>
              <Box width={15}>
                <Text>Saturation (s):</Text>
              </Box>
              {mode === 'edit-saturation' ? (
                <Box>
                  <TextInput
                    value={editValue}
                    onChange={setEditValue}
                    onSubmit={applyEdit}
                    placeholder="0-100"
                  />
                  <Text dimColor> (0-100%)</Text>
                </Box>
              ) : (
                <Text>{Math.round(currentColor.hsl.s * 100)}%</Text>
              )}
            </Box>

            <Box>
              <Box width={15}>
                <Text>Lightness (l):</Text>
              </Box>
              {mode === 'edit-lightness' ? (
                <Box>
                  <TextInput
                    value={editValue}
                    onChange={setEditValue}
                    onSubmit={applyEdit}
                    placeholder="0-100"
                  />
                  <Text dimColor> (0-100%)</Text>
                </Box>
              ) : (
                <Text>{Math.round(currentColor.hsl.l * 100)}%</Text>
              )}
            </Box>
          </Box>
        </Box>
      )}

      <Box marginTop={1} />
      <Text dimColor>
        {mode === 'navigate'
          ? 'Press h/s/l to edit values'
          : 'Enter value and press Enter to apply, Esc to cancel'}
      </Text>
    </Box>
  );
};
