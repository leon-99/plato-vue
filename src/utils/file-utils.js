const fs = require('fs');
const path = require('path');

class FileUtils {
  static ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  static writeFile(filePath, content) {
    fs.writeFileSync(filePath, content);
  }

  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  static deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  static removeDirectory(dirPath) {
    try {
      fs.rmdirSync(dirPath);
    } catch (e) {
      // Directory not empty or already removed
    }
  }

  static getRelativePath(basePath, fullPath) {
    return path.relative(basePath, fullPath);
  }

  static resolvePath(basePath, relativePath) {
    if (relativePath === undefined) {
      return path.resolve(basePath);
    }
    return path.resolve(basePath, relativePath);
  }

  static joinPath(...paths) {
    return path.join(...paths);
  }
}

module.exports = FileUtils;
