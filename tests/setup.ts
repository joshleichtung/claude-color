/**
 * Jest setup file
 *
 * Global test configuration and setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
};

// Mock chalk to avoid ESM issues
jest.mock('chalk', () => {
  const passthrough = (text: string) => text;
  const chalkMock: any = Object.assign(passthrough, {
    bold: Object.assign(passthrough, {
      white: passthrough,
      cyan: passthrough,
    }),
    white: passthrough,
    gray: passthrough,
    yellow: passthrough,
    cyan: passthrough,
    bgHex: (_hex: string) => passthrough,
    hex: (_hex: string) => passthrough,
  });

  return {
    default: chalkMock,
    __esModule: true,
  };
});
