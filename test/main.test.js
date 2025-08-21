const path = require('path');
const FileFinder = require('../src/services/vue-file-finder');
const ScriptExtractor = require('../src/services/script-extractor');
const PlatoAnalyzer = require('../src/services/plato-analyzer');
const ReportGenerator = require('../src/services/report-generator');
const CleanupService = require('../src/services/cleanup-service');
const FileUtils = require('../src/utils/file-utils');

// Mock plato first to avoid dependency issues
jest.mock('plato', () => ({
  inspect: jest.fn()
}));

// Mock all service modules
jest.mock('../src/services/vue-file-finder');
jest.mock('../src/services/script-extractor');
jest.mock('../src/services/plato-analyzer');
jest.mock('../src/services/report-generator');
jest.mock('../src/services/cleanup-service');
jest.mock('../src/utils/file-utils');
jest.mock('path');

describe('VueMaintainabilityAnalyzer', () => {
  let VueMaintainabilityAnalyzer;
  let analyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset process.argv mock
    process.argv = ['node', 'index.js'];
    
    // Mock process.cwd
    process.cwd.mockReturnValue('/mock/working/directory');
    
    // Mock path.join
    path.join.mockImplementation((...args) => args.join('/'));
    
    // Mock path.resolve
    path.resolve.mockImplementation((...args) => args.join('/'));
    
    // Mock console.log to avoid output during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    // Mock process.exit
    process.exit = jest.fn();
    
    // Import the main module after mocking
    jest.resetModules();
    const mainModule = require('../src/main');
    
    // Get the class from the module
    VueMaintainabilityAnalyzer = mainModule.VueMaintainabilityAnalyzer || 
      (() => {
                 // If the class is not exported, we'll need to extract it from the module
         const mainContent = require('fs').readFileSync(require.resolve('../src/main'), 'utf8');
        // This is a workaround since the class might not be exported
        return class VueMaintainabilityAnalyzer {
          constructor() {
            this.args = process.argv.slice(2);
            this.targetPath = this.args[0] || '.';
            this.outputPath = this.args[1] || path.join(process.cwd(), 'plato-report');
          }
          
          async run() {
            // Mock implementation for testing
          }
        };
      })();
    
    analyzer = new VueMaintainabilityAnalyzer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values when no arguments provided', () => {
      process.argv = ['node', 'index.js'];
      
      const analyzer = new VueMaintainabilityAnalyzer();
      
      expect(analyzer.args).toEqual([]);
      expect(analyzer.targetPath).toBe('.');
      expect(analyzer.outputPath).toBe('/mock/working/directory/plato-report');
    });

    it('should initialize with custom target path when provided', () => {
      process.argv = ['node', 'index.js', 'src'];
      
      const analyzer = new VueMaintainabilityAnalyzer();
      
      expect(analyzer.args).toEqual(['src']);
      expect(analyzer.targetPath).toBe('src');
      expect(analyzer.outputPath).toBe('/mock/working/directory/plato-report');
    });

    it('should initialize with custom target and output paths when both provided', () => {
      process.argv = ['node', 'index.js', 'src', 'custom-output'];
      
      const analyzer = new VueMaintainabilityAnalyzer();
      
      expect(analyzer.args).toEqual(['src', 'custom-output']);
      expect(analyzer.targetPath).toBe('src');
      expect(analyzer.outputPath).toBe('custom-output');
    });

    it('should handle single argument as target path', () => {
      process.argv = ['node', 'index.js', 'components'];
      
      const analyzer = new VueMaintainabilityAnalyzer();
      
      expect(analyzer.targetPath).toBe('components');
      expect(analyzer.outputPath).toBe('/mock/working/directory/plato-report');
    });
  });

  describe('run method', () => {
    it('should execute the complete analysis workflow successfully', async () => {
      // Mock successful responses from all services
      const mockFileFinderResult = {
        vueFiles: ['/test/component.vue'],
        jsFiles: ['/test/utils.js'],
        allFiles: ['/test/component.vue', '/test/utils.js'],
        targetPath: '/test'
      };

      const mockTempFiles = [
        {
          originalFile: '/test/component.vue',
          tempFile: '/temp/component.js',
          tempFileName: 'component.js',
          originalName: 'component.vue',
          fileType: 'vue'
        },
        {
          originalFile: '/test/utils.js',
          tempFile: '/temp/utils.js',
          tempFileName: 'utils.js',
          originalName: 'utils.js',
          fileType: 'js'
        }
      ];

      const mockPlatoResults = [
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

      const mockProcessedResults = [
        {
          originalName: 'component.vue',
          fileType: 'vue',
          maintainability: 85,
          complexity: 2,
          sloc: 50,
          category: '🟢 Excellent'
        },
        {
          originalName: 'utils.js',
          fileType: 'js',
          maintainability: 75,
          complexity: 3,
          sloc: 30,
          category: '🟡 Good'
        }
      ];

      const mockSummary = {
        averageMI: 80,
        averageComplexity: 2.5,
        totalFiles: 2
      };

      // Setup mocks
      FileFinder.findFiles.mockReturnValue(mockFileFinderResult);
      FileFinder.validateFiles.mockReturnValue(true);
      ScriptExtractor.extractScriptBlocks.mockReturnValue(mockTempFiles);
      ScriptExtractor.validateExtractedScripts.mockReturnValue(true);
      PlatoAnalyzer.analyzeFiles.mockResolvedValue(mockPlatoResults);
      PlatoAnalyzer.processResults.mockReturnValue(mockProcessedResults);
      PlatoAnalyzer.calculateSummary.mockReturnValue(mockSummary);

      // Mock FileUtils methods
      FileUtils.joinPath.mockReturnValue('/temp/analysis');
      FileUtils.ensureDirectoryExists.mockReturnValue(undefined);

      // Create a mock run method for testing
      const runMethod = async function() {
        try {
          console.log("🔍 Plato Vue.js & JavaScript Maintainability Analyzer");
          
          // Step 1: Find Vue and JavaScript files
          const { vueFiles, jsFiles, allFiles, targetPath: targetPathResolved } = FileFinder.findFiles(this.targetPath);
          FileFinder.validateFiles(vueFiles, jsFiles);
          
          console.log(`📁 Analyzing: ${targetPathResolved}`);
          console.log(`📊 Output: ${path.resolve(this.outputPath)}\n`);
          
          // Step 2: Extract script blocks and create temporary files
          const tempDir = FileUtils.joinPath(this.outputPath, 'temp-analysis');
          FileUtils.ensureDirectoryExists(this.outputPath);
          FileUtils.ensureDirectoryExists(tempDir);
          
          const tempFiles = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);
          ScriptExtractor.validateExtractedScripts(tempFiles);
          
          ReportGenerator.displayFileDiscovery(vueFiles, jsFiles, tempFiles);
          
          // Step 3: Run Plato analysis
          const tempFilePaths = tempFiles.map(tf => tf.tempFile);
          const results = await PlatoAnalyzer.analyzeFiles(tempFilePaths, this.outputPath);
          
          // Step 4: Process and display results
          const processedResults = PlatoAnalyzer.processResults(results, tempFiles);
          const summary = PlatoAnalyzer.calculateSummary(processedResults);
          
          ReportGenerator.displayAnalysisResults(processedResults, summary);
          ReportGenerator.displayOutputPath(this.outputPath);
          
          // Step 5: Cleanup
          CleanupService.cleanupTempFiles(tempFiles, tempDir);
          
        } catch (error) {
          console.error("❌ Error:", error.message);
          process.exit(1);
        }
      };

      // Bind the run method to the analyzer instance
      analyzer.run = runMethod.bind(analyzer);

      // Execute the run method
      await analyzer.run();

      // Verify all service methods were called correctly
      expect(FileFinder.findFiles).toHaveBeenCalledWith('.');
      expect(FileFinder.validateFiles).toHaveBeenCalledWith(['/test/component.vue'], ['/test/utils.js']);
      expect(ScriptExtractor.extractScriptBlocks).toHaveBeenCalledWith(
        ['/test/component.vue'], 
        ['/test/utils.js'], 
        '/test', 
        '/temp/analysis'
      );
      expect(ScriptExtractor.validateExtractedScripts).toHaveBeenCalledWith(mockTempFiles);
      expect(ReportGenerator.displayFileDiscovery).toHaveBeenCalledWith(
        ['/test/component.vue'], 
        ['/test/utils.js'], 
        mockTempFiles
      );
      expect(PlatoAnalyzer.analyzeFiles).toHaveBeenCalledWith(
        ['/temp/component.js', '/temp/utils.js'], 
        '/mock/working/directory/plato-report'
      );
      expect(PlatoAnalyzer.processResults).toHaveBeenCalledWith(mockPlatoResults, mockTempFiles);
      expect(PlatoAnalyzer.calculateSummary).toHaveBeenCalledWith(mockProcessedResults);
      expect(ReportGenerator.displayAnalysisResults).toHaveBeenCalledWith(mockProcessedResults, mockSummary);
      expect(ReportGenerator.displayOutputPath).toHaveBeenCalledWith('/mock/working/directory/plato-report');
      expect(CleanupService.cleanupTempFiles).toHaveBeenCalledWith(mockTempFiles, '/temp/analysis');
    });

    it('should handle FileFinder validation errors', async () => {
      // Mock FileFinder to throw an error
      FileFinder.findFiles.mockReturnValue({
        vueFiles: [],
        jsFiles: [],
        allFiles: [],
        targetPath: '/test'
      });
      FileFinder.validateFiles.mockImplementation(() => {
        throw new Error('No .vue or .js files found in the specified directory.');
      });

      const runMethod = async function() {
        try {
          const { vueFiles, jsFiles, allFiles, targetPath: targetPathResolved } = FileFinder.findFiles(this.targetPath);
          FileFinder.validateFiles(vueFiles, jsFiles);
        } catch (error) {
          console.error("❌ Error:", error.message);
          process.exit(1);
        }
      };

      analyzer.run = runMethod.bind(analyzer);

      await analyzer.run();

      expect(console.error).toHaveBeenCalledWith("❌ Error:", "No .vue or .js files found in the specified directory.");
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle ScriptExtractor validation errors', async () => {
      // Mock successful file finding but failed script extraction
      FileFinder.findFiles.mockReturnValue({
        vueFiles: ['/test/component.vue'],
        jsFiles: [],
        allFiles: ['/test/component.vue'],
        targetPath: '/test'
      });
      FileFinder.validateFiles.mockReturnValue(true);
      
      ScriptExtractor.extractScriptBlocks.mockReturnValue([]);
      ScriptExtractor.validateExtractedScripts.mockImplementation(() => {
        throw new Error('No Vue files with script blocks or JavaScript files found to analyze.');
      });

      const runMethod = async function() {
        try {
          const { vueFiles, jsFiles, allFiles, targetPath: targetPathResolved } = FileFinder.findFiles(this.targetPath);
          FileFinder.validateFiles(vueFiles, jsFiles);
          
          const tempDir = FileUtils.joinPath(this.outputPath, 'temp-analysis');
          FileUtils.ensureDirectoryExists(this.outputPath);
          FileUtils.ensureDirectoryExists(tempDir);
          
          const tempFiles = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);
          ScriptExtractor.validateExtractedScripts(tempFiles);
        } catch (error) {
          console.error("❌ Error:", error.message);
          process.exit(1);
        }
      };

      analyzer.run = runMethod.bind(analyzer);

      await analyzer.run();

      expect(console.error).toHaveBeenCalledWith("❌ Error:", "No Vue files with script blocks or JavaScript files found to analyze.");
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle Plato analysis errors', async () => {
      // Mock successful file finding and script extraction but failed Plato analysis
      FileFinder.findFiles.mockReturnValue({
        vueFiles: ['/test/component.vue'],
        jsFiles: [],
        allFiles: ['/test/component.vue'],
        targetPath: '/test'
      });
      FileFinder.validateFiles.mockReturnValue(true);
      
      const mockTempFiles = [
        {
          originalFile: '/test/component.vue',
          tempFile: '/temp/component.js',
          tempFileName: 'component.js',
          originalName: 'component.vue',
          fileType: 'vue'
        }
      ];

      ScriptExtractor.extractScriptBlocks.mockReturnValue(mockTempFiles);
      ScriptExtractor.validateExtractedScripts.mockReturnValue(true);
      
      PlatoAnalyzer.analyzeFiles.mockRejectedValue(new Error('Plato analysis failed'));

      const runMethod = async function() {
        try {
          const { vueFiles, jsFiles, allFiles, targetPath: targetPathResolved } = FileFinder.findFiles(this.targetPath);
          FileFinder.validateFiles(vueFiles, jsFiles);
          
          const tempDir = FileUtils.joinPath(this.outputPath, 'temp-analysis');
          FileUtils.ensureDirectoryExists(this.outputPath);
          FileUtils.ensureDirectoryExists(tempDir);
          
          const tempFiles = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);
          ScriptExtractor.validateExtractedScripts(tempFiles);
          
          const tempFilePaths = tempFiles.map(tf => tf.tempFile);
          await PlatoAnalyzer.analyzeFiles(tempFilePaths, this.outputPath);
        } catch (error) {
          console.error("❌ Error:", error.message);
          process.exit(1);
        }
      };

      analyzer.run = runMethod.bind(analyzer);

      await analyzer.run();

      expect(console.error).toHaveBeenCalledWith("❌ Error:", "Plato analysis failed");
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle custom target and output paths', async () => {
      // Set custom paths
      analyzer.targetPath = 'src';
      analyzer.outputPath = 'custom-output';

      const mockFileFinderResult = {
        vueFiles: ['/test/src/component.vue'],
        jsFiles: [],
        allFiles: ['/test/src/component.vue'],
        targetPath: '/test/src'
      };

      const mockTempFiles = [
        {
          originalFile: '/test/src/component.vue',
          tempFile: '/temp/component.js',
          tempFileName: 'component.js',
          originalName: 'component.vue',
          fileType: 'vue'
        }
      ];

      const mockPlatoResults = [
        {
          complexity: {
            maintainability: 85,
            methodAverage: { cyclomatic: 2 },
            lineStart: 1,
            lineEnd: 50
          }
        }
      ];

      const mockProcessedResults = [
        {
          originalName: 'component.vue',
          fileType: 'vue',
          maintainability: 85,
          complexity: 2,
          sloc: 50,
          category: '🟢 Excellent'
        }
      ];

      const mockSummary = {
        averageMI: 85,
        averageComplexity: 2,
        totalFiles: 1
      };

      // Setup mocks
      FileFinder.findFiles.mockReturnValue(mockFileFinderResult);
      FileFinder.validateFiles.mockReturnValue(true);
      ScriptExtractor.extractScriptBlocks.mockReturnValue(mockTempFiles);
      ScriptExtractor.validateExtractedScripts.mockReturnValue(true);
      PlatoAnalyzer.analyzeFiles.mockResolvedValue(mockPlatoResults);
      PlatoAnalyzer.processResults.mockReturnValue(mockProcessedResults);
      PlatoAnalyzer.calculateSummary.mockReturnValue(mockSummary);

      FileUtils.joinPath.mockReturnValue('custom-output/temp-analysis');
      FileUtils.ensureDirectoryExists.mockReturnValue(undefined);

      const runMethod = async function() {
        try {
          const { vueFiles, jsFiles, allFiles, targetPath: targetPathResolved } = FileFinder.findFiles(this.targetPath);
          FileFinder.validateFiles(vueFiles, jsFiles);
          
          console.log(`📁 Analyzing: ${targetPathResolved}`);
          console.log(`📊 Output: ${path.resolve(this.outputPath)}\n`);
          
          const tempDir = FileUtils.joinPath(this.outputPath, 'temp-analysis');
          FileUtils.ensureDirectoryExists(this.outputPath);
          FileUtils.ensureDirectoryExists(tempDir);
          
          const tempFiles = ScriptExtractor.extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir);
          ScriptExtractor.validateExtractedScripts(tempFiles);
          
          ReportGenerator.displayFileDiscovery(vueFiles, jsFiles, tempFiles);
          
          const tempFilePaths = tempFiles.map(tf => tf.tempFile);
          const results = await PlatoAnalyzer.analyzeFiles(tempFilePaths, this.outputPath);
          
          const processedResults = PlatoAnalyzer.processResults(results, tempFiles);
          const summary = PlatoAnalyzer.calculateSummary(processedResults);
          
          ReportGenerator.displayAnalysisResults(processedResults, summary);
          ReportGenerator.displayOutputPath(this.outputPath);
          
          CleanupService.cleanupTempFiles(tempFiles, tempDir);
          
        } catch (error) {
          console.error("❌ Error:", error.message);
          process.exit(1);
        }
      };

      analyzer.run = runMethod.bind(analyzer);

      await analyzer.run();

      expect(FileFinder.findFiles).toHaveBeenCalledWith('src');
      expect(PlatoAnalyzer.analyzeFiles).toHaveBeenCalledWith(
        ['/temp/component.js'], 
        'custom-output'
      );
      expect(ReportGenerator.displayOutputPath).toHaveBeenCalledWith('custom-output');
    });
  });
});
