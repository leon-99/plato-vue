const FileUtils = require('../src/utils/file-utils');
const ReportGenerator = require('../src/services/report-generator');

// Mock FileUtils module
jest.mock('../src/utils/file-utils');

describe('ReportGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('displayAnalysisResults', () => {
    it('should display analysis results for all files', () => {
      const processedResults = [
        {
          originalName: 'component.vue',
          fileType: 'vue',
          maintainability: 85.5,
          complexity: 2.3,
          sloc: 50,
          category: '🟢 Excellent'
        },
        {
          originalName: 'utils.js',
          fileType: 'js',
          maintainability: 75.2,
          complexity: 3.1,
          sloc: 30,
          category: '🟡 Good'
        }
      ];

      const summary = {
        averageMI: 80.35,
        averageComplexity: 2.7,
        totalFiles: 2
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayAnalysisResults(processedResults, summary);

      expect(console.log).toHaveBeenCalledWith('📊 Plato Analysis Results:\n');
      expect(console.log).toHaveBeenCalledWith('📁 component.vue (Vue):');
      expect(console.log).toHaveBeenCalledWith('   Maintainability Index: 85.50');
      expect(console.log).toHaveBeenCalledWith('   Cyclomatic Complexity: 2.30');
      expect(console.log).toHaveBeenCalledWith('   Lines of Code: 50');
      expect(console.log).toHaveBeenCalledWith('   Status: 🟢 Excellent\n');
      
      expect(console.log).toHaveBeenCalledWith('📁 utils.js (JS):');
      expect(console.log).toHaveBeenCalledWith('   Maintainability Index: 75.20');
      expect(console.log).toHaveBeenCalledWith('   Cyclomatic Complexity: 3.10');
      expect(console.log).toHaveBeenCalledWith('   Lines of Code: 30');
      expect(console.log).toHaveBeenCalledWith('   Status: 🟡 Good\n');

      consoleSpy.mockRestore();
    });

    it('should handle empty results array', () => {
      const processedResults = [];
      const summary = {
        averageMI: 0,
        averageComplexity: 0,
        totalFiles: 0
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayAnalysisResults(processedResults, summary);

      expect(console.log).toHaveBeenCalledWith('📊 Plato Analysis Results:\n');
      // Should still call displaySummary
      expect(console.log).toHaveBeenCalledWith('📈 Summary:');

      consoleSpy.mockRestore();
    });

    it('should handle single result', () => {
      const processedResults = [
        {
          originalName: 'single.vue',
          fileType: 'vue',
          maintainability: 90.0,
          complexity: 1.0,
          sloc: 25,
          category: '🟢 Excellent'
        }
      ];

      const summary = {
        averageMI: 90.0,
        averageComplexity: 1.0,
        totalFiles: 1
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayAnalysisResults(processedResults, summary);

      expect(console.log).toHaveBeenCalledWith('📁 single.vue (Vue):');
      expect(console.log).toHaveBeenCalledWith('   Maintainability Index: 90.00');
      expect(console.log).toHaveBeenCalledWith('   Cyclomatic Complexity: 1.00');
      expect(console.log).toHaveBeenCalledWith('   Lines of Code: 25');
      expect(console.log).toHaveBeenCalledWith('   Status: 🟢 Excellent\n');

      consoleSpy.mockRestore();
    });

    it('should handle results with decimal values', () => {
      const processedResults = [
        {
          originalName: 'decimal.vue',
          fileType: 'vue',
          maintainability: 67.89,
          complexity: 4.56,
          sloc: 123,
          category: '🟡 Good'
        }
      ];

      const summary = {
        averageMI: 67.89,
        averageComplexity: 4.56,
        totalFiles: 1
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayAnalysisResults(processedResults, summary);

      expect(console.log).toHaveBeenCalledWith('   Maintainability Index: 67.89');
      expect(console.log).toHaveBeenCalledWith('   Cyclomatic Complexity: 4.56');

      consoleSpy.mockRestore();
    });
  });

  describe('displaySummary', () => {
    it('should display summary statistics', () => {
      const summary = {
        averageMI: 82.5,
        averageComplexity: 3.2,
        totalFiles: 5
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displaySummary(summary);

      expect(console.log).toHaveBeenCalledWith('📈 Summary:');
      expect(console.log).toHaveBeenCalledWith('   Average Maintainability Index: 82.50');
      expect(console.log).toHaveBeenCalledWith('   Average Cyclomatic Complexity: 3.20');
      expect(console.log).toHaveBeenCalledWith('   Total Files Analyzed: 5');

      consoleSpy.mockRestore();
    });

    it('should handle zero values in summary', () => {
      const summary = {
        averageMI: 0,
        averageComplexity: 0,
        totalFiles: 0
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displaySummary(summary);

      expect(console.log).toHaveBeenCalledWith('   Average Maintainability Index: 0.00');
      expect(console.log).toHaveBeenCalledWith('   Average Cyclomatic Complexity: 0.00');
      expect(console.log).toHaveBeenCalledWith('   Total Files Analyzed: 0');

      consoleSpy.mockRestore();
    });

    it('should handle decimal precision in summary', () => {
      const summary = {
        averageMI: 67.123,
        averageComplexity: 2.789,
        totalFiles: 3
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displaySummary(summary);

      expect(console.log).toHaveBeenCalledWith('   Average Maintainability Index: 67.12');
      expect(console.log).toHaveBeenCalledWith('   Average Cyclomatic Complexity: 2.79');

      consoleSpy.mockRestore();
    });
  });

  describe('displayFileDiscovery', () => {
    beforeEach(() => {
      // Mock process.cwd for consistent testing
      process.cwd.mockReturnValue('/mock/working/directory');
    });

    it('should display Vue files when found', () => {
      const vueFiles = ['/mock/working/directory/src/component.vue', '/mock/working/directory/src/page.vue'];
      const jsFiles = [];
      const tempFiles = [
        { originalName: 'component.vue', fileType: 'vue' },
        { originalName: 'page.vue', fileType: 'vue' }
      ];

      FileUtils.getRelativePath
        .mockReturnValueOnce('src/component.vue')
        .mockReturnValueOnce('src/page.vue');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayFileDiscovery(vueFiles, jsFiles, tempFiles);

      expect(console.log).toHaveBeenCalledWith('🔍 Found 2 Vue file(s):');
      expect(console.log).toHaveBeenCalledWith('   src/component.vue');
      expect(console.log).toHaveBeenCalledWith('   src/page.vue');
      expect(console.log).toHaveBeenCalledWith('📊 Summary: 2 files processed out of 2 total files (Vue + JS)');

      consoleSpy.mockRestore();
    });

    it('should display JavaScript files when found', () => {
      const vueFiles = [];
      const jsFiles = ['/mock/working/directory/src/utils.js', '/mock/working/directory/src/helper.js'];
      const tempFiles = [
        { originalName: 'utils.js', fileType: 'js' },
        { originalName: 'helper.js', fileType: 'js' }
      ];

      FileUtils.getRelativePath
        .mockReturnValueOnce('src/utils.js')
        .mockReturnValueOnce('src/helper.js');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayFileDiscovery(vueFiles, jsFiles, tempFiles);

      expect(console.log).toHaveBeenCalledWith('🔍 Found 2 JavaScript file(s):');
      expect(console.log).toHaveBeenCalledWith('   src/utils.js');
      expect(console.log).toHaveBeenCalledWith('   src/helper.js');
      expect(console.log).toHaveBeenCalledWith('📊 Summary: 2 files processed out of 2 total files (Vue + JS)');

      consoleSpy.mockRestore();
    });

    it('should display both Vue and JavaScript files when found', () => {
      const vueFiles = ['/mock/working/directory/src/component.vue'];
      const jsFiles = ['/mock/working/directory/src/utils.js'];
      const tempFiles = [
        { originalName: 'component.vue', fileType: 'vue' },
        { originalName: 'utils.js', fileType: 'js' }
      ];

      FileUtils.getRelativePath
        .mockReturnValueOnce('src/component.vue')
        .mockReturnValueOnce('src/utils.js');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayFileDiscovery(vueFiles, jsFiles, tempFiles);

      expect(console.log).toHaveBeenCalledWith('🔍 Found 1 Vue file(s):');
      expect(console.log).toHaveBeenCalledWith('   src/component.vue');
      expect(console.log).toHaveBeenCalledWith('🔍 Found 1 JavaScript file(s):');
      expect(console.log).toHaveBeenCalledWith('   src/utils.js');
      expect(console.log).toHaveBeenCalledWith('📊 Summary: 2 files processed out of 2 total files (Vue + JS)');

      consoleSpy.mockRestore();
    });

    it('should handle empty file arrays', () => {
      const vueFiles = [];
      const jsFiles = [];
      const tempFiles = [];

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayFileDiscovery(vueFiles, jsFiles, tempFiles);

      expect(console.log).toHaveBeenCalledWith('📊 Summary: 0 files processed out of 0 total files (Vue + JS)');

      consoleSpy.mockRestore();
    });

    it('should handle mismatched temp files count', () => {
      const vueFiles = ['/mock/working/directory/src/component.vue'];
      const jsFiles = ['/mock/working/directory/src/utils.js'];
      const tempFiles = [
        { originalName: 'component.vue', fileType: 'vue' }
        // Missing utils.js temp file
      ];

      FileUtils.getRelativePath
        .mockReturnValueOnce('src/component.vue')
        .mockReturnValueOnce('src/utils.js');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayFileDiscovery(vueFiles, jsFiles, tempFiles);

      expect(console.log).toHaveBeenCalledWith('📊 Summary: 1 files processed out of 2 total files (Vue + JS)');

      consoleSpy.mockRestore();
    });
  });

  describe('displayOutputPath', () => {
    it('should display HTML report path when file exists', () => {
      const outputPath = '/output/directory';
      const htmlReportPath = '/output/directory/index.html';

      FileUtils.joinPath.mockReturnValue(htmlReportPath);
      FileUtils.fileExists.mockReturnValue(true);
      FileUtils.resolvePath.mockReturnValue('/absolute/path/to/index.html');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayOutputPath(outputPath);

      expect(FileUtils.joinPath).toHaveBeenCalledWith(outputPath, 'index.html');
      expect(FileUtils.fileExists).toHaveBeenCalledWith(htmlReportPath);
      expect(FileUtils.resolvePath).toHaveBeenCalledWith(htmlReportPath);
      expect(console.log).toHaveBeenCalledWith('\n🌐 HTML Report generated at: /absolute/path/to/index.html');
      expect(console.log).toHaveBeenCalledWith('   Open this file in your browser for detailed analysis!');

      consoleSpy.mockRestore();
    });

    it('should not display output path when HTML file does not exist', () => {
      const outputPath = '/output/directory';
      const htmlReportPath = '/output/directory/index.html';

      FileUtils.joinPath.mockReturnValue(htmlReportPath);
      FileUtils.fileExists.mockReturnValue(false);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayOutputPath(outputPath);

      expect(FileUtils.joinPath).toHaveBeenCalledWith(outputPath, 'index.html');
      expect(FileUtils.fileExists).toHaveBeenCalledWith(htmlReportPath);
      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('🌐 HTML Report generated at:'));

      consoleSpy.mockRestore();
    });

    it('should handle different output paths', () => {
      const outputPath = '/custom/output';
      const htmlReportPath = '/custom/output/index.html';

      FileUtils.joinPath.mockReturnValue(htmlReportPath);
      FileUtils.fileExists.mockReturnValue(true);
      FileUtils.resolvePath.mockReturnValue('/custom/absolute/path/index.html');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayOutputPath(outputPath);

      expect(FileUtils.joinPath).toHaveBeenCalledWith(outputPath, 'index.html');
      expect(console.log).toHaveBeenCalledWith('\n🌐 HTML Report generated at: /custom/absolute/path/index.html');

      consoleSpy.mockRestore();
    });
  });

  describe('displayUsage', () => {
    it('should display usage instructions', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      ReportGenerator.displayUsage();

      expect(console.log).toHaveBeenCalledWith('❌ No .vue or .js files found in the specified directory.');
      expect(console.log).toHaveBeenCalledWith('   Usage: plato-vue [source-path] [output-path]');
      expect(console.log).toHaveBeenCalledWith('   Example: plato-vue . plato-report');
      expect(console.log).toHaveBeenCalledWith('   Example: plato-vue src');

      consoleSpy.mockRestore();
    });
  });
});
