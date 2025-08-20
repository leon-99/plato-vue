const glob = require('glob');
const path = require('path');

class FileFinder {
  static findFiles(targetPath) {
    const targetPathResolved = path.resolve(process.cwd(), targetPath);
    
    // Find all .vue and .js files in subdirectories
    const subdirVueFiles = glob.sync("**/*.vue", { 
      cwd: targetPathResolved, 
      absolute: true 
    });
    
    const subdirJsFiles = glob.sync("**/*.js", { 
      cwd: targetPathResolved, 
      absolute: true 
    });
    
    // Find .vue and .js files in the current directory
    const currentDirVueFiles = glob.sync("*.vue", { 
      cwd: targetPathResolved, 
      absolute: true 
    });
    
    const currentDirJsFiles = glob.sync("*.js", { 
      cwd: targetPathResolved, 
      absolute: true 
    });
    
    // Combine and remove duplicates
    const allFiles = subdirVueFiles.concat(subdirJsFiles)
      .concat(currentDirVueFiles)
      .concat(currentDirJsFiles)
      .filter((file, index, arr) => arr.indexOf(file) === index);
    
    // Separate Vue and JS files
    const vueFiles = allFiles.filter(file => file.endsWith('.vue'));
    const jsFiles = allFiles.filter(file => file.endsWith('.js'));
    
    return {
      vueFiles,
      jsFiles,
      allFiles,
      targetPath: targetPathResolved
    };
  }

  static validateFiles(vueFiles, jsFiles) {
    if (vueFiles.length === 0 && jsFiles.length === 0) {
      throw new Error('No .vue or .js files found in the specified directory.');
    }
    return true;
  }
}

module.exports = FileFinder;
