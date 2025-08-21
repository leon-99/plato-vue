const fs = require('fs');
const path = require('path');
const FileUtils = require('../src/utils/file-utils');

// Mock fs module
jest.mock('fs');
jest.mock('path');

describe('FileUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockReturnValue(undefined);

      FileUtils.ensureDirectoryExists('/test/directory');

      expect(fs.existsSync).toHaveBeenCalledWith('/test/directory');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/test/directory', { recursive: true });
    });

    it('should not create directory if it already exists', () => {
      fs.existsSync.mockReturnValue(true);

      FileUtils.ensureDirectoryExists('/test/directory');

      expect(fs.existsSync).toHaveBeenCalledWith('/test/directory');
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('readFile', () => {
    it('should read file with utf8 encoding', () => {
      const mockContent = 'test content';
      fs.readFileSync.mockReturnValue(mockContent);

      const result = FileUtils.readFile('/test/file.txt');

      expect(fs.readFileSync).toHaveBeenCalledWith('/test/file.txt', 'utf8');
      expect(result).toBe(mockContent);
    });
  });

  describe('writeFile', () => {
    it('should write content to file', () => {
      const content = 'test content';
      fs.writeFileSync.mockReturnValue(undefined);

      FileUtils.writeFile('/test/file.txt', content);

      expect(fs.writeFileSync).toHaveBeenCalledWith('/test/file.txt', content);
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', () => {
      fs.existsSync.mockReturnValue(true);

      const result = FileUtils.fileExists('/test/file.txt');

      expect(fs.existsSync).toHaveBeenCalledWith('/test/file.txt');
      expect(result).toBe(true);
    });

    it('should return false if file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = FileUtils.fileExists('/test/file.txt');

      expect(fs.existsSync).toHaveBeenCalledWith('/test/file.txt');
      expect(result).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('should delete file if it exists', () => {
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(undefined);

      FileUtils.deleteFile('/test/file.txt');

      expect(fs.existsSync).toHaveBeenCalledWith('/test/file.txt');
      expect(fs.unlinkSync).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should not delete file if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      FileUtils.deleteFile('/test/file.txt');

      expect(fs.existsSync).toHaveBeenCalledWith('/test/file.txt');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('removeDirectory', () => {
    it('should remove directory successfully', () => {
      fs.rmdirSync.mockReturnValue(undefined);

      FileUtils.removeDirectory('/test/directory');

      expect(fs.rmdirSync).toHaveBeenCalledWith('/test/directory');
    });

    it('should handle errors gracefully when removing directory', () => {
      fs.rmdirSync.mockImplementation(() => {
        throw new Error('Directory not empty');
      });

      expect(() => {
        FileUtils.removeDirectory('/test/directory');
      }).not.toThrow();

      expect(fs.rmdirSync).toHaveBeenCalledWith('/test/directory');
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path from base path', () => {
      const basePath = '/base/path';
      const fullPath = '/base/path/sub/file.txt';
      const expectedRelative = 'sub/file.txt';
      
      path.relative.mockReturnValue(expectedRelative);

      const result = FileUtils.getRelativePath(basePath, fullPath);

      expect(path.relative).toHaveBeenCalledWith(basePath, fullPath);
      expect(result).toBe(expectedRelative);
    });
  });

  describe('resolvePath', () => {
    it('should resolve path when relativePath is provided', () => {
      const basePath = '/base/path';
      const relativePath = 'sub/file.txt';
      const expectedResolved = '/base/path/sub/file.txt';
      
      path.resolve.mockReturnValue(expectedResolved);

      const result = FileUtils.resolvePath(basePath, relativePath);

      expect(path.resolve).toHaveBeenCalledWith(basePath, relativePath);
      expect(result).toBe(expectedResolved);
    });

    it('should resolve only basePath when relativePath is undefined', () => {
      const basePath = '/base/path';
      const expectedResolved = '/base/path';
      
      path.resolve.mockReturnValue(expectedResolved);

      const result = FileUtils.resolvePath(basePath, undefined);

      expect(path.resolve).toHaveBeenCalledWith(basePath);
      expect(result).toBe(expectedResolved);
    });
  });

  describe('joinPath', () => {
    it('should join multiple path segments', () => {
      const paths = ['/base', 'sub', 'file.txt'];
      const expectedJoined = '/base/sub/file.txt';
      
      path.join.mockReturnValue(expectedJoined);

      const result = FileUtils.joinPath(...paths);

      expect(path.join).toHaveBeenCalledWith(...paths);
      expect(result).toBe(expectedJoined);
    });

    it('should handle single path', () => {
      const singlePath = '/base';
      path.join.mockReturnValue(singlePath);

      const result = FileUtils.joinPath(singlePath);

      expect(path.join).toHaveBeenCalledWith(singlePath);
      expect(result).toBe(singlePath);
    });
  });
});
