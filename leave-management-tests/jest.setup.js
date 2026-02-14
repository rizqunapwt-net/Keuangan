// ============================================================================
// JEST SETUP - Backend Tests
// Global test configuration and mocks
// ============================================================================

// Extend Jest matchers if needed
// require('@testing-library/jest-dom');

// Set timezone for consistent date testing
process.env.TZ = 'UTC';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: console.warn, // Keep warnings
  error: console.error, // Keep errors
};

// Global beforeEach - runs before each test
beforeEach(() => {
  // Reset any global state if needed
});

// Global afterEach - runs after each test
afterEach(() => {
  // Clean up any global state if needed
  jest.clearAllTimers();
});
