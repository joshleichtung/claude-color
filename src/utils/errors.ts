/**
 * Custom error classes for Claude Color
 */

/**
 * Error thrown when an invalid color format is provided
 */
export class InvalidColorError extends Error {
  constructor(color: string, expectedFormat?: string) {
    const formatInfo = expectedFormat ? `\nExpected format: ${expectedFormat}` : '';
    super(`Invalid color format: "${color}"${formatInfo}`);
    this.name = 'InvalidColorError';
  }
}

/**
 * Error thrown when color values are out of valid range
 */
export class ColorRangeError extends Error {
  constructor(component: string, value: number, min: number, max: number) {
    super(`Color component "${component}" value ${value} is out of range. Expected ${min}-${max}`);
    this.name = 'ColorRangeError';
  }
}
