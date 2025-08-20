const glob = require('glob');
const path = require('path');

class VueFileFinder {
  static findVueFiles(targetPath) {
    const targetPathResolved = path.resolve(process.cwd(), targetPath);
    
    // Find all .vue files in subdirectories
    const subdirFiles = glob.sync("**/*.vue", { 
      cwd: targetPathResolved, 
      absolute: true 
    });
    
    // Find .vue files in the current directory
    const currentDirFiles = glob.sync("*.vue", { 
      cwd: targetPathResolved, 
      absolute: true 
    });
    
    // Combine and remove duplicates
    const vueFiles = subdirFiles.concat(currentDirFiles)
      .filter((file, index, arr) => arr.indexOf(file) === index);
    
    return {
      files: vueFiles,
      targetPath: targetPathResolved
    };
  }

  static validateVueFiles(vueFiles) {
    if (vueFiles.length === 0) {
      throw new Error('No .vue files found in the specified directory.');
    }
    return true;
  }
}

module.exports = VueFileFinder;
