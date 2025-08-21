# Testing Guide for Plato Vue.js Maintainability Analyzer

This document provides comprehensive information about the testing setup, how to run tests, and what each test covers.

## 🧪 Test Overview

The project includes comprehensive unit tests for all modules, covering:

- **FileUtils** - File system operations and utilities
- **VueFileFinder** - Vue and JavaScript file discovery
- **ScriptExtractor** - Vue script block extraction
- **PlatoAnalyzer** - Plato analysis integration
- **ReportGenerator** - Report generation and display
- **CleanupService** - Temporary file cleanup
- **Main Application** - Main workflow integration
- **Configuration** - Plato and Jest configuration validation

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

## 📋 Available Test Commands

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with debug options
npm run test:debug
```

### Advanced Test Commands

```bash
# Run only unit tests with verbose output
npm run test:unit

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:coverage
npm run test:watch
```

### Test Runner Commands

Use npm scripts to run different types of tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run unit tests with verbose output
npm run test:unit

# Debug tests with open handles detection
npm run test:debug
```

## 🏗️ Test Structure

```
project-root/
├── test/                         # All test files
│   ├── index.test.js            # Entry point tests
│   ├── main.test.js             # Main application tests
│   ├── plato-config.test.js     # Configuration tests
│   ├── vue-file-finder.test.js  # File discovery tests
│   ├── script-extractor.test.js # Script extraction tests
│   ├── plato-analyzer.test.js   # Analysis tests
│   ├── report-generator.test.js # Report generation tests
│   ├── cleanup-service.test.js  # Cleanup tests
│   └── file-utils.test.js       # Utility tests
├── src/                          # Source code
├── jest.config.js                # Jest configuration
└── jest.setup.js                 # Jest setup and mocks
```

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

- **Test Environment**: Node.js
- **Test Pattern**: `**/test/**/*.js` and `**/?(*.)+(spec|test).js`
- **Coverage**: Collects from `src/**/*.js` excluding test files
- **Output**: Coverage reports in `text`, `lcov`, and `html` formats
- **Timeout**: 10 seconds per test
- **Setup**: Uses `jest.setup.js` for global configuration

### Jest Setup (`jest.setup.js`)

- Mocks `process.argv` for CLI testing
- Mocks `process.exit` to prevent test termination
- Mocks `process.cwd` for consistent working directory
- Configurable console output suppression

## 📊 Test Coverage

### FileUtils Tests

- **ensureDirectoryExists**: Directory creation and existence checks
- **readFile**: File reading with UTF-8 encoding
- **writeFile**: File writing operations
- **fileExists**: File existence validation
- **deleteFile**: File deletion with existence checks
- **removeDirectory**: Directory removal with error handling
- **getRelativePath**: Path resolution and relative path generation
- **resolvePath**: Absolute path resolution
- **joinPath**: Path joining operations

### VueFileFinder Tests

- **findFiles**: File discovery and categorization
- **scanDirectoryComprehensive**: Directory scanning with error handling
- **scanDirectoryRecursive**: Recursive directory traversal
- **shouldSkipDirectory**: Directory filtering logic
- **isTargetFile**: File type validation
- **validateFiles**: File validation and error handling

### ScriptExtractor Tests

- **extractScriptBlocks**: Vue script extraction and JS file processing
- **createTempFileName**: Temporary file naming conventions
- **validateExtractedScripts**: Script validation and error handling
- **Edge Cases**: Empty scripts, whitespace-only scripts, missing script blocks

### PlatoAnalyzer Tests

- **analyzeFiles**: Plato integration and file analysis
- **processResults**: Result processing and data mapping
- **categorizeMaintainability**: Maintainability index categorization
- **calculateSummary**: Statistical summary calculations
- **Error Handling**: Plato errors, missing data, edge cases

### ReportGenerator Tests

- **displayAnalysisResults**: Analysis result formatting and display
- **displaySummary**: Summary statistics display
- **displayFileDiscovery**: File discovery reporting
- **displayOutputPath**: Output path validation and display
- **displayUsage**: Usage instructions display

### CleanupService Tests

- **cleanupTempFiles**: Temporary file cleanup operations
- **Edge Cases**: Empty arrays, missing properties, various path formats
- **Cross-Platform**: Windows and Unix path handling

### Main Application Tests

- **Constructor**: Argument parsing and initialization
- **Run Method**: Complete workflow execution
- **Error Handling**: Service failures and validation errors
- **Path Handling**: Custom target and output paths

## 🧪 Running Specific Tests

### Run Tests for a Specific Module

```bash
# Run only FileUtils tests
npm test -- --testPathPattern="file-utils"

# Run only VueFileFinder tests
npm test -- --testPathPattern="vue-file-finder"

# Run only service tests
npm test -- --testPathPattern="services"
```

### Run Tests with Specific Patterns

```bash
# Run tests matching a pattern
npm test -- --testNamePattern="should.*extract.*script"

# Run tests in a specific directory
npm test -- --testPathPattern="src/utils"

# Run tests with verbose output
npm test -- --verbose
```

## 📈 Coverage Reports

### Generate Coverage Report

```bash
npm run test:coverage
```

### Coverage Report Locations

- **Text Report**: Console output
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`

### Coverage Metrics

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

## 🐛 Debugging Tests

### Debug Mode

```bash
npm run test:debug
```

### Watch Mode with Debug

```bash
npm run test:watch -- --verbose --detectOpenHandles
```

### Individual Test Debugging

```bash
# Run a specific test file
npm test -- --testPathPattern="file-utils.test.js"

# Run a specific test
npm test -- --testNamePattern="should create directory"
```

## 🔍 Test Validation

### Validate Test Configuration

```bash
npm run test:validate
```

This command checks:
- Required configuration files exist
- Jest configuration is valid
- Package.json scripts are properly configured
- Test dependencies are available

## 📝 Writing New Tests

### Test File Naming

- Test files should be named `*.test.js` or `*.spec.js`
- Place test files in the `test/` directory at the root level
- Follow the existing test structure and patterns
- Use `../src/` import paths for source modules

### Test Structure

```javascript
describe('ModuleName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('methodName', () => {
    it('should do something specific', () => {
      // Test implementation
      expect(result).toBe(expected);
    });
  });
});
```

### Mocking Guidelines

- Mock external dependencies (fs, path, etc.)
- Use Jest's built-in mocking capabilities
- Mock console output to avoid test noise
- Mock process methods for CLI testing

## 🚨 Common Issues and Solutions

### Test Timeout Errors

- Increase timeout in `jest.config.js`
- Check for async operations not properly awaited
- Verify mocks are properly configured

### Mock Errors

- Ensure mocks are defined before importing modules
- Check mock implementation matches expected interface
- Verify mock cleanup in `afterEach` blocks

### Coverage Issues

- Check `collectCoverageFrom` patterns in Jest config
- Ensure test files are not included in coverage
- Verify all source files are being tested

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Node.js Testing Best Practices](https://nodejs.org/en/docs/guides/testing-and-debugging/)
- [JavaScript Testing Patterns](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🤝 Contributing to Tests

When adding new features or fixing bugs:

1. **Write tests first** (TDD approach)
2. **Ensure 100% coverage** for new code
3. **Follow existing test patterns** and naming conventions
4. **Update this documentation** if adding new test types
5. **Run the full test suite** before submitting changes

## 📞 Support

If you encounter issues with tests:

1. Check the test configuration validation: `npm run test:validate`
2. Review Jest configuration in `jest.config.js`
3. Check test setup in `jest.setup.js`
4. Verify all dependencies are installed
5. Check Node.js version compatibility

---

**Happy Testing! 🎯**
