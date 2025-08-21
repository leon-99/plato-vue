// Mock plato first to avoid dependency issues
jest.mock('plato', () => ({
  inspect: jest.fn()
}));

const plato = require('plato');
const platoConfig = require('../src/config/plato-config');
const PlatoAnalyzer = require('../src/services/plato-analyzer');

describe('PlatoAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeFiles', () => {
    it('should analyze files using Plato and return results', async () => {
      const tempFilePaths = ['/temp/file1.js', '/temp/file2.js'];
      const outputPath = '/output';
      const mockResults = [
        { complexity: { maintainability: 85, methodAverage: { cyclomatic: 2 } } },
        { complexity: { maintainability: 75, methodAverage: { cyclomatic: 3 } } }
      ];

      // Mock plato.inspect to call callback with results
      plato.inspect.mockImplementation((files, output, config, callback) => {
        callback(null, mockResults);
      });

      const result = await PlatoAnalyzer.analyzeFiles(tempFilePaths, outputPath);

      expect(plato.inspect).toHaveBeenCalledWith(tempFilePaths, outputPath, platoConfig, expect.any(Function));
      expect(result).toEqual(mockResults);
    });

    it('should handle Plato returning results in err parameter', async () => {
      const tempFilePaths = ['/temp/file1.js'];
      const outputPath = '/output';
      const mockResults = [
        { complexity: { maintainability: 80, methodAverage: { cyclomatic: 2 } } }
      ];

      // Mock plato.inspect to call callback with results in err parameter
      plato.inspect.mockImplementation((files, output, config, callback) => {
        callback(mockResults, null);
      });

      const result = await PlatoAnalyzer.analyzeFiles(tempFilePaths, outputPath);

      expect(result).toEqual(mockResults);
    });

    it('should reject promise on actual error', async () => {
      const tempFilePaths = ['/temp/file1.js'];
      const outputPath = '/output';
      const mockError = new Error('Plato analysis failed');

      // Mock plato.inspect to call callback with error
      plato.inspect.mockImplementation((files, output, config, callback) => {
        callback(mockError, null);
      });

      await expect(PlatoAnalyzer.analyzeFiles(tempFilePaths, outputPath))
        .rejects.toThrow('Plato analysis failed');
    });

    it('should handle empty file paths array', async () => {
      const tempFilePaths = [];
      const outputPath = '/output';

      plato.inspect.mockImplementation((files, output, config, callback) => {
        callback(null, []);
      });

      const result = await PlatoAnalyzer.analyzeFiles(tempFilePaths, outputPath);

      expect(plato.inspect).toHaveBeenCalledWith([], outputPath, platoConfig, expect.any(Function));
      expect(result).toEqual([]);
    });
  });

  describe('processResults', () => {
    it('should process Plato results and map them to temp files', () => {
      const results = [
        {
          complexity: {
            maintainability: 85,
            methodAverage: { cyclomatic: 2 },
            lineStart: 1,
            lineEnd: 50
          }
        },
        {
          complexity: {
            maintainability: 75,
            methodAverage: { cyclomatic: 3 },
            lineStart: 1,
            lineEnd: 30
          }
        }
      ];

      const tempFiles = [
        {
          originalFile: '/test/component.vue',
          tempFileName: 'component.js',
          originalName: 'component.vue',
          fileType: 'vue'
        },
        {
          originalFile: '/test/utils.js',
          tempFileName: 'utils.js',
          originalName: 'utils.js',
          fileType: 'js'
        }
      ];

      const processedResults = PlatoAnalyzer.processResults(results, tempFiles);

      expect(processedResults).toHaveLength(2);
      expect(processedResults[0]).toEqual({
        originalName: 'component.vue',
        fileType: 'vue',
        maintainability: 85,
        complexity: 2,
        sloc: 50,
        category: '🟢 Excellent'
      });

      expect(processedResults[1]).toEqual({
        originalName: 'utils.js',
        fileType: 'js',
        maintainability: 75,
        complexity: 3,
        sloc: 30,
        category: '🟡 Good'
      });
    });

    it('should handle results with missing complexity data', () => {
      const results = [
        {
          complexity: {
            maintainability: 85,
            methodAverage: { cyclomatic: 2 },
            lineStart: 1,
            lineEnd: 50
          }
        },
        {
          // Missing complexity data
        },
        {
          complexity: {
            maintainability: 75,
            methodAverage: { cyclomatic: 3 },
            lineStart: 1,
            lineEnd: 30
          }
        }
      ];

      const tempFiles = [
        { originalName: 'component.vue', fileType: 'vue' },
        { originalName: 'missing.js', fileType: 'js' },
        { originalName: 'utils.js', fileType: 'js' }
      ];

      const processedResults = PlatoAnalyzer.processResults(results, tempFiles);

      expect(processedResults).toHaveLength(2);
      expect(processedResults[0]).toBeDefined();
      expect(processedResults[1]).toBeDefined();
    });

    it('should handle empty results array', () => {
      const results = [];
      const tempFiles = [
        { originalName: 'component.vue', fileType: 'vue' }
      ];

      const processedResults = PlatoAnalyzer.processResults(results, tempFiles);

      expect(processedResults).toHaveLength(0);
    });

    it('should handle empty temp files array', () => {
      const results = [
        {
          complexity: {
            maintainability: 85,
            methodAverage: { cyclomatic: 2 },
            lineStart: 1,
            lineEnd: 50
          }
        }
      ];

      const tempFiles = [];

      const processedResults = PlatoAnalyzer.processResults(results, tempFiles);

      expect(processedResults).toHaveLength(0);
    });

    it('should calculate SLOC correctly', () => {
      const results = [
        {
          complexity: {
            maintainability: 85,
            methodAverage: { cyclomatic: 2 },
            lineStart: 10,
            lineEnd: 25
          }
        }
      ];

      const tempFiles = [
        { originalName: 'component.vue', fileType: 'vue' }
      ];

      const processedResults = PlatoAnalyzer.processResults(results, tempFiles);

      expect(processedResults[0].sloc).toBe(16); // 25 - 10 + 1
    });
  });

  describe('categorizeMaintainability', () => {
    it('should categorize excellent maintainability (>= 85)', () => {
      expect(PlatoAnalyzer.categorizeMaintainability(85)).toBe('🟢 Excellent');
      expect(PlatoAnalyzer.categorizeMaintainability(95)).toBe('🟢 Excellent');
      expect(PlatoAnalyzer.categorizeMaintainability(100)).toBe('🟢 Excellent');
    });

    it('should categorize good maintainability (65-84)', () => {
      expect(PlatoAnalyzer.categorizeMaintainability(65)).toBe('🟡 Good');
      expect(PlatoAnalyzer.categorizeMaintainability(75)).toBe('🟡 Good');
      expect(PlatoAnalyzer.categorizeMaintainability(84)).toBe('🟡 Good');
    });

    it('should categorize moderate maintainability (50-64)', () => {
      expect(PlatoAnalyzer.categorizeMaintainability(50)).toBe('🟠 Moderate');
      expect(PlatoAnalyzer.categorizeMaintainability(57)).toBe('🟠 Moderate');
      expect(PlatoAnalyzer.categorizeMaintainability(64)).toBe('🟠 Moderate');
    });

    it('should categorize low maintainability (< 50)', () => {
      expect(PlatoAnalyzer.categorizeMaintainability(49)).toBe('🔴 Low (needs refactoring)');
      expect(PlatoAnalyzer.categorizeMaintainability(25)).toBe('🔴 Low (needs refactoring)');
      expect(PlatoAnalyzer.categorizeMaintainability(0)).toBe('🔴 Low (needs refactoring)');
    });

    it('should handle boundary values', () => {
      expect(PlatoAnalyzer.categorizeMaintainability(84.9)).toBe('🟡 Good');
      expect(PlatoAnalyzer.categorizeMaintainability(64.9)).toBe('🟠 Moderate');
      expect(PlatoAnalyzer.categorizeMaintainability(49.9)).toBe('🔴 Low (needs refactoring)');
    });
  });

  describe('calculateSummary', () => {
    it('should calculate summary from valid results', () => {
      const processedResults = [
        { maintainability: 85, complexity: 2 },
        { maintainability: 75, complexity: 3 },
        { maintainability: 90, complexity: 1 }
      ];

      const summary = PlatoAnalyzer.calculateSummary(processedResults);

      expect(summary).toEqual({
        averageMI: 83.33333333333333,
        averageComplexity: 2,
        totalFiles: 3
      });
    });

    it('should handle results with NaN values', () => {
      const processedResults = [
        { maintainability: 85, complexity: 2 },
        { maintainability: NaN, complexity: 3 },
        { maintainability: 90, complexity: 1 },
        { maintainability: null, complexity: 4 }
      ];

      const summary = PlatoAnalyzer.calculateSummary(processedResults);

      expect(summary).toEqual({
        averageMI: 58.333333333333336, // Only valid results are counted
        averageComplexity: 2.3333333333333335, // Only valid results are counted
        totalFiles: 3
      });
    });

    it('should handle empty results array', () => {
      const processedResults = [];

      const summary = PlatoAnalyzer.calculateSummary(processedResults);

      expect(summary).toEqual({
        averageMI: 0,
        averageComplexity: 0,
        totalFiles: 0
      });
    });

    it('should handle all invalid results', () => {
      const processedResults = [
        { maintainability: NaN, complexity: NaN },
        { maintainability: null, complexity: null },
        { maintainability: undefined, complexity: undefined }
      ];

      const summary = PlatoAnalyzer.calculateSummary(processedResults);

      expect(summary).toEqual({
        averageMI: 0,
        averageComplexity: 0,
        totalFiles: 1
      });
    });

    it('should handle single valid result', () => {
      const processedResults = [
        { maintainability: 85, complexity: 2 }
      ];

      const summary = PlatoAnalyzer.calculateSummary(processedResults);

      expect(summary).toEqual({
        averageMI: 85,
        averageComplexity: 2,
        totalFiles: 1
      });
    });

    it('should handle decimal precision in calculations', () => {
      const processedResults = [
        { maintainability: 85.5, complexity: 2.3 },
        { maintainability: 74.8, complexity: 3.7 }
      ];

      const summary = PlatoAnalyzer.calculateSummary(processedResults);

      expect(summary.averageMI).toBeCloseTo(80.15, 2);
      expect(summary.averageComplexity).toBeCloseTo(3.0, 1);
      expect(summary.totalFiles).toBe(2);
    });
  });
});
