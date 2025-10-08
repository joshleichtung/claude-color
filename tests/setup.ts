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

// Mock nanoid to avoid ESM issues
let nanoidCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: (size: number = 21) => {
    nanoidCounter++;
    return `test-id-${nanoidCounter}`.padEnd(size, '0');
  },
}));

// Mock lowdb to avoid ESM issues
// Store data in memory indexed by file path
const mockDatabases = new Map<string, any>();

// Expose mockDatabases globally for test cleanup
(global as any).mockDatabases = mockDatabases;

jest.mock('lowdb', () => {
  class MockLow<T> {
    data: T | null = null;
    private defaultData: T;
    private adapter: any;

    constructor(adapter: any, defaultData: T) {
      this.adapter = adapter;
      this.defaultData = defaultData;
    }

    async read() {
      const filepath = this.adapter.filepath;
      if (mockDatabases.has(filepath)) {
        this.data = mockDatabases.get(filepath);
      } else {
        this.data = JSON.parse(JSON.stringify(this.defaultData)); // Deep clone
      }
    }

    async write() {
      const filepath = this.adapter.filepath;
      if (this.data) {
        mockDatabases.set(filepath, JSON.parse(JSON.stringify(this.data))); // Deep clone
      }
    }
  }

  return {
    Low: MockLow,
  };
});

jest.mock('lowdb/node', () => {
  class MockJSONFile<_T> {
    filepath: string;

    constructor(filepath: string) {
      this.filepath = filepath;
    }
  }

  return {
    JSONFile: MockJSONFile,
  };
});
