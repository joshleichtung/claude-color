/**
 * Basic setup test to verify Jest configuration
 */

import { VERSION } from '../../src/index';

describe('Project Setup', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBeDefined();
    expect(typeof VERSION).toBe('string');
  });

  it('should have correct initial version', () => {
    expect(VERSION).toBe('1.0.0');
  });
});
