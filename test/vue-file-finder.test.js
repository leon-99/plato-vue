// Mock fs and path modules BEFORE requiring them or the module under test
jest.mock('fs');
jest.mock('path');

const fs = require('fs');
const path = require('path');
const FileFinder = require('../src/services/vue-file-finder');

describe('FileFinder', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    // Reset process.cwd mock
    process.cwd.mockReturnValue('/mock/working/directory');
    
    // Mock path.resolve
    path.resolve.mockImplementation((cwd, targetPath) => {
      if (targetPath === '.') return cwd;
      return `${cwd}/${targetPath}`;
    });
  });

  describe('findFiles', () => {
    it('should find Vue and JavaScript files in target directory', () => {
      const targetPath = '.';
      const mockResults = {
        vueFiles: ['/mock/working/directory/file1.vue', '/mock/working/directory/file2.vue'],
        jsFiles: ['/mock/working/directory/script1.js', '/mock/working/directory/script2.js']
      };

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock scanDirectoryComprehensive
      jest.spyOn(FileFinder, 'scanDirectoryComprehensive').mockReturnValue(mockResults);

      const result = FileFinder.findFiles(targetPath);

      expect(path.resolve).toHaveBeenCalledWith('/mock/working/directory', targetPath);
      expect(FileFinder.scanDirectoryComprehensive).toHaveBeenCalledWith('/mock/working/directory');
      expect(result).toEqual({
        vueFiles: mockResults.vueFiles,
        jsFiles: mockResults.jsFiles,
        allFiles: [...mockResults.vueFiles, ...mockResults.jsFiles],
        targetPath: '/mock/working/directory'
      });

      consoleSpy.mockRestore();
    });

    it('should handle custom target path', () => {
      const targetPath = 'src';
      const mockResults = {
        vueFiles: ['/mock/working/directory/src/component.vue'],
        jsFiles: ['/mock/working/directory/src/utils.js']
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(FileFinder, 'scanDirectoryComprehensive').mockReturnValue(mockResults);

      const result = FileFinder.findFiles(targetPath);

      expect(path.resolve).toHaveBeenCalledWith('/mock/working/directory', targetPath);
      expect(result.targetPath).toBe('/mock/working/directory/src');

      consoleSpy.mockRestore();
    });
  });

  describe('scanDirectoryComprehensive', () => {
    it('should scan directory and return file arrays', () => {
      const dir = '/test/directory';
      // Provide a fast mock implementation for a single directory
      fs.readdirSync.mockReturnValueOnce([]);

      const result = FileFinder.scanDirectoryComprehensive(dir);

      expect(result).toHaveProperty('vueFiles');
      expect(result).toHaveProperty('jsFiles');
      expect(Array.isArray(result.vueFiles)).toBe(true);
      expect(Array.isArray(result.jsFiles)).toBe(true);
    });

    it('should handle errors during scanning gracefully', () => {
      const dir = '/test/directory';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      fs.readdirSync.mockImplementation(() => { throw new Error('boom'); });

      const result = FileFinder.scanDirectoryComprehensive(dir);

      expect(result).toHaveProperty('vueFiles');
      expect(result).toHaveProperty('jsFiles');
      expect(Array.isArray(result.vueFiles)).toBe(true);
      expect(Array.isArray(result.jsFiles)).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('scanDirectoryRecursive', () => {
    it('should scan directory recursively and categorize files', () => {
      const dir = '/test/directory';
      const vueFiles = [];
      const jsFiles = [];
      
      // Mock fs.readdirSync to return test items only for root, and empty for subdirectories
      const mockItems = ['file1.vue', 'file2.js', 'subdir'];
      fs.readdirSync.mockImplementation((p) => p === dir ? mockItems : []);
      
      // Mock fs.statSync for different item types
      fs.statSync.mockImplementation((itemPath) => {
        if (itemPath.endsWith('/subdir')) {
          return { isDirectory: () => true };
        }
        return { isDirectory: () => false };
      });

      // Mock path.join to work correctly
      const path = require('path');
      path.join.mockImplementation((...parts) => parts.join('/'));
      path.basename.mockImplementation((filePath) => filePath.split('/').pop());

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock only shouldSkipDirectory to not skip anything; use real isTargetFile
      const skipSpy = jest.spyOn(FileFinder, 'shouldSkipDirectory').mockReturnValue(false);

      FileFinder.scanDirectoryRecursive(dir, vueFiles, jsFiles);

      expect(fs.readdirSync).toHaveBeenCalledWith(dir);
      expect(vueFiles).toContain('/test/directory/file1.vue');
      expect(jsFiles).toContain('/test/directory/file2.js');

      skipSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should skip directories that should be skipped', () => {
      const dir = '/test/directory';
      const vueFiles = [];
      const jsFiles = [];
      
      const mockItems = ['node_modules', 'file.vue'];
      fs.readdirSync.mockReturnValue(mockItems);
      
      fs.statSync.mockImplementation((itemPath) => {
        if (itemPath.includes('node_modules')) {
          return { isDirectory: () => true };
        } else {
          return { isDirectory: () => false };
        }
      });

      // Mock path.join to work correctly
      const path = require('path');
      path.join.mockImplementation((...parts) => parts.join('/'));
      path.basename.mockImplementation((filePath) => filePath.split('/').pop());

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock the static methods
      const originalShouldSkip = FileFinder.shouldSkipDirectory;
      const originalIsTarget = FileFinder.isTargetFile;
      
      FileFinder.shouldSkipDirectory = jest.fn().mockImplementation((dirName) => {
        return dirName === 'node_modules';
      });
      FileFinder.isTargetFile = jest.fn().mockReturnValue(true);

      FileFinder.scanDirectoryRecursive(dir, vueFiles, jsFiles);

      expect(FileFinder.shouldSkipDirectory).toHaveBeenCalledWith('node_modules');
      expect(vueFiles).toContain('/test/directory/file.vue');

      // Restore original methods
      FileFinder.shouldSkipDirectory = originalShouldSkip;
      FileFinder.isTargetFile = originalIsTarget;
      consoleSpy.mockRestore();
    });

    it('should handle readdir errors gracefully', () => {
      const dir = '/test/directory';
      const vueFiles = [];
      const jsFiles = [];
      
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      FileFinder.scanDirectoryRecursive(dir, vueFiles, jsFiles);

      expect(console.log).toHaveBeenCalledWith('   Debug: Could not read directory /test/directory: Permission denied');
      expect(vueFiles).toHaveLength(0);
      expect(jsFiles).toHaveLength(0);

      consoleSpy.mockRestore();
    });

    it('should handle stat errors gracefully', () => {
      const dir = '/test/directory';
      const vueFiles = [];
      const jsFiles = [];
      
      const mockItems = ['broken-symlink'];
      fs.readdirSync.mockReturnValue(mockItems);
      
      fs.statSync.mockImplementation(() => {
        throw new Error('Broken symlink');
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      FileFinder.scanDirectoryRecursive(dir, vueFiles, jsFiles);

      expect(console.log).toHaveBeenCalledWith('   Debug: Could not stat broken-symlink: Broken symlink');
      expect(vueFiles).toHaveLength(0);
      expect(jsFiles).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });

  describe('shouldSkipDirectory', () => {
    it('should return true for directories that should be skipped', () => {
      const skipDirs = ['node_modules', 'dist', 'build', '.git', 'test-output', 'plato-report', '.vscode', '.idea', 'coverage', 'temp', 'tmp', 'cache', 'logs', 'uploads', 'downloads'];
      skipDirs.forEach(dirName => {
        expect(FileFinder.shouldSkipDirectory(dirName)).toBe(true);
      });
    });

    it('should return false for directories that should not be skipped', () => {
      const keepDirs = ['src', 'components', 'utils', 'tests'];
      keepDirs.forEach(dirName => {
        expect(FileFinder.shouldSkipDirectory(dirName)).toBe(false);
      });
    });
  });

  describe('isTargetFile', () => {
    it('should return true for .vue files', () => {
      expect(FileFinder.isTargetFile('component.vue')).toBe(true);
      expect(FileFinder.isTargetFile('Component.vue')).toBe(true);
      expect(FileFinder.isTargetFile('path/to/file.vue')).toBe(true);
    });

    it('should return true for .js files', () => {
      expect(FileFinder.isTargetFile('script.js')).toBe(true);
      expect(FileFinder.isTargetFile('Script.js')).toBe(true);
      expect(FileFinder.isTargetFile('path/to/file.js')).toBe(true);
    });

    it('should return false for other file types', () => {
      expect(FileFinder.isTargetFile('file.txt')).toBe(false);
      expect(FileFinder.isTargetFile('style.css')).toBe(false);
      expect(FileFinder.isTargetFile('image.png')).toBe(false);
      expect(FileFinder.isTargetFile('document.pdf')).toBe(false);
    });
  });

  describe('validateFiles', () => {
    it('should return true when files are found', () => {
      const vueFiles = ['file1.vue'];
      const jsFiles = ['file2.js'];

      const result = FileFinder.validateFiles(vueFiles, jsFiles);
      expect(result).toBe(true);
    });

    it('should return true when only Vue files are found', () => {
      const vueFiles = ['file1.vue', 'file2.vue'];
      const jsFiles = [];

      const result = FileFinder.validateFiles(vueFiles, jsFiles);
      expect(result).toBe(true);
    });

    it('should return true when only JavaScript files are found', () => {
      const vueFiles = [];
      const jsFiles = ['file1.js', 'file2.js'];

      const result = FileFinder.validateFiles(vueFiles, jsFiles);
      expect(result).toBe(true);
    });

    it('should throw error when no files are found', () => {
      const vueFiles = [];
      const jsFiles = [];

      expect(() => {
        FileFinder.validateFiles(vueFiles, jsFiles);
      }).toThrow('No .vue or .js files found in the specified directory.');
    });
  });
});
