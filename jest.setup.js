// Jest setup file
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(),
};

// Mock process.argv for CLI testing
process.argv = ['node', 'index.js'];

// Mock process.exit to prevent tests from exiting
process.exit = jest.fn();

// Mock process.cwd
process.cwd = jest.fn(() => '/mock/working/directory');
