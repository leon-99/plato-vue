const FileUtils = require('../src/utils/file-utils');
const CleanupService = require('../src/services/cleanup-service');

// Mock FileUtils module
jest.mock('../src/utils/file-utils');

describe('CleanupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanupTempFiles', () => {
    it('should cleanup temporary files and remove temp directory', () => {
      const tempFiles = [
        { tempFile: '/temp/file1.js' },
        { tempFile: '/temp/file2.js' },
        { tempFile: '/temp/file3.js' }
      ];
      const tempDir = '/temp/directory';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      // Verify each temp file is deleted
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/file1.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/file2.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/file3.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(3);

      // Verify temp directory is removed
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/temp/directory');
      expect(FileUtils.removeDirectory).toHaveBeenCalledTimes(1);

      // Verify console messages
      expect(console.log).toHaveBeenCalledWith('\n🧹 Temporary files cleaned up.');
      expect(console.log).toHaveBeenCalledWith('✅ Analysis complete!');

      consoleSpy.mockRestore();
    });

    it('should handle empty temp files array', () => {
      const tempFiles = [];
      const tempDir = '/temp/directory';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      // Should not call deleteFile for empty array
      expect(FileUtils.deleteFile).not.toHaveBeenCalled();

      // Should still remove temp directory
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/temp/directory');

      // Should still display console messages
      expect(console.log).toHaveBeenCalledWith('\n🧹 Temporary files cleaned up.');
      expect(console.log).toHaveBeenCalledWith('✅ Analysis complete!');

      consoleSpy.mockRestore();
    });

    it('should handle single temp file', () => {
      const tempFiles = [
        { tempFile: '/temp/single.js' }
      ];
      const tempDir = '/temp/directory';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/single.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(1);
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/temp/directory');

      consoleSpy.mockRestore();
    });

    it('should handle temp files with different paths', () => {
      const tempFiles = [
        { tempFile: '/temp/analysis/file1.js' },
        { tempFile: '/temp/analysis/subdir/file2.js' },
        { tempFile: '/temp/analysis/deep/nested/file3.js' }
      ];
      const tempDir = '/temp/analysis';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/analysis/file1.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/analysis/subdir/file2.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/analysis/deep/nested/file3.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(3);
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/temp/analysis');

      consoleSpy.mockRestore();
    });

    it('should handle temp files with special characters in paths', () => {
      const tempFiles = [
        { tempFile: '/temp/analysis/file with spaces.js' },
        { tempFile: '/temp/analysis/file-with-dashes.js' },
        { tempFile: '/temp/analysis/file_with_underscores.js' }
      ];
      const tempDir = '/temp/analysis';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/analysis/file with spaces.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/analysis/file-with-dashes.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/analysis/file_with_underscores.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(3);
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/temp/analysis');

      consoleSpy.mockRestore();
    });

    it('should handle temp files with Windows-style paths', () => {
      const tempFiles = [
        { tempFile: 'C:\\temp\\analysis\\file1.js' },
        { tempFile: 'C:\\temp\\analysis\\subdir\\file2.js' }
      ];
      const tempDir = 'C:\\temp\\analysis';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      expect(FileUtils.deleteFile).toHaveBeenCalledWith('C:\\temp\\analysis\\file1.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('C:\\temp\\analysis\\subdir\\file2.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(2);
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('C:\\temp\\analysis');

      consoleSpy.mockRestore();
    });

    it('should handle temp files with Unix-style paths', () => {
      const tempFiles = [
        { tempFile: '/home/user/temp/analysis/file1.js' },
        { tempFile: '/home/user/temp/analysis/subdir/file2.js' }
      ];
      const tempDir = '/home/user/temp/analysis';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/home/user/temp/analysis/file1.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/home/user/temp/analysis/subdir/file2.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(2);
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/home/user/temp/analysis');

      consoleSpy.mockRestore();
    });

    it('should handle temp files with relative paths', () => {
      const tempFiles = [
        { tempFile: './temp/file1.js' },
        { tempFile: '../temp/file2.js' },
        { tempFile: '../../temp/file3.js' }
      ];
      const tempDir = './temp';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      expect(FileUtils.deleteFile).toHaveBeenCalledWith('./temp/file1.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('../temp/file2.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('../../temp/file3.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(3);
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('./temp');

      consoleSpy.mockRestore();
    });

    it('should handle temp files with missing tempFile property', () => {
      const tempFiles = [
        { originalFile: '/test/component.vue', tempFile: '/temp/component.js' },
        { originalFile: '/test/utils.js' }, // Missing tempFile property
        { tempFile: '/temp/helper.js' }
      ];
      const tempDir = '/temp';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      // Should only delete files that have tempFile property
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/component.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/helper.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(3);
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/temp');

      consoleSpy.mockRestore();
    });

    it('should handle temp files with null or undefined tempFile values', () => {
      const tempFiles = [
        { tempFile: '/temp/file1.js' },
        { tempFile: null },
        { tempFile: undefined },
        { tempFile: '/temp/file2.js' }
      ];
      const tempDir = '/temp';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      // Should only delete files that have valid tempFile values
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/file1.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/file2.js');
      expect(FileUtils.deleteFile).toHaveBeenCalledTimes(4);
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/temp');

      consoleSpy.mockRestore();
    });

    it('should handle empty temp directory path', () => {
      const tempFiles = [
        { tempFile: '/temp/file1.js' }
      ];
      const tempDir = '';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/temp/file1.js');
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('');

      consoleSpy.mockRestore();
    });

    it('should handle root temp directory path', () => {
      const tempFiles = [
        { tempFile: '/file1.js' }
      ];
      const tempDir = '/';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      CleanupService.cleanupTempFiles(tempFiles, tempDir);

      expect(FileUtils.deleteFile).toHaveBeenCalledWith('/file1.js');
      expect(FileUtils.removeDirectory).toHaveBeenCalledWith('/');

      consoleSpy.mockRestore();
    });
  });
});
