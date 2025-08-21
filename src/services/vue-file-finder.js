const path = require('path');
const fs = require('fs');

class FileFinder {
  static findFiles(targetPath) {
    const targetPathResolved = path.resolve(process.cwd(), targetPath);
    
    console.log(`🔍 Searching in: ${targetPathResolved}`);
    
    // Use the proven working logic from the test script
    console.log(`   Using comprehensive Node.js recursive search...`);
    const results = this.scanDirectoryComprehensive(targetPathResolved);
    
    const vueFiles = results.vueFiles;
    const jsFiles = results.jsFiles;
    
    console.log(`   Comprehensive search found: ${vueFiles.length} Vue files, ${jsFiles.length} JS files`);
    
    // Debug: Log what we found
    console.log(`🔍 File discovery results:`);
    console.log(`   Vue files found: ${vueFiles.length}`);
    console.log(`   JavaScript files found: ${jsFiles.length}`);
    
    if (vueFiles.length > 0) {
      console.log(`   Vue files: ${vueFiles.slice(0, 5).map(f => path.relative(targetPathResolved, f)).join(', ')}${vueFiles.length > 5 ? '...' : ''}`);
    }
    
    if (jsFiles.length > 0) {
      console.log(`   JS files: ${jsFiles.slice(0, 5).map(f => path.relative(targetPathResolved, f)).join(', ')}${jsFiles.length > 5 ? '...' : ''}`);
    }
    
    // Combine all files
    const allFiles = [...vueFiles, ...jsFiles];
    
    return {
      vueFiles,
      jsFiles,
      allFiles,
      targetPath: targetPathResolved
    };
  }

  static scanDirectoryComprehensive(dir) {
    const vueFiles = [];
    const jsFiles = [];
    
    try {
      this.scanDirectoryRecursive(dir, vueFiles, jsFiles);
    } catch (error) {
      console.log(`   Error during comprehensive search: ${error.message}`);
    }
    
    return { vueFiles, jsFiles };
  }

  static scanDirectoryRecursive(dir, vueFiles, jsFiles, depth = 0) {
    // Safety guard to avoid pathological or cyclic recursion
    if (depth > 50) {
      return;
    }
    try {
      const items = fs.readdirSync(dir);
      console.log(`   Debug: Scanning ${path.basename(dir)} (depth ${depth}) - found ${items.length} items`);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Skip certain directories
            if (!this.shouldSkipDirectory(item)) {
              console.log(`   Debug: Entering subdirectory: ${item} at depth ${depth}`);
              // Recursively scan subdirectories
              this.scanDirectoryRecursive(fullPath, vueFiles, jsFiles, depth + 1);
            } else {
              console.log(`   Debug: Skipping directory: ${item}`);
            }
          } else if (this.isTargetFile(item)) {
            // Add file to appropriate array
            if (item.endsWith('.vue')) {
              vueFiles.push(fullPath);
              console.log(`   Debug: Added Vue file: ${item} at depth ${depth}`);
            } else if (item.endsWith('.js')) {
              jsFiles.push(fullPath);
              console.log(`   Debug: Added JS file: ${item} at depth ${depth}`);
            }
          }
        } catch (statError) {
          // Skip files we can't stat (like broken symlinks)
          console.log(`   Debug: Could not stat ${item}: ${statError.message}`);
          continue;
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.log(`   Debug: Could not read directory ${dir}: ${error.message}`);
      return;
    }
  }

  static shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules', 'dist', 'build', '.git', 'test-output', 
      'plato-report', '.vscode', '.idea', 'coverage', 'temp',
      'tmp', 'cache', 'logs', 'uploads', 'downloads'
    ];
    return skipDirs.includes(dirName);
  }

  static isTargetFile(fileName) {
    return fileName.endsWith('.vue') || fileName.endsWith('.js');
  }

  static validateFiles(vueFiles, jsFiles) {
    if (vueFiles.length === 0 && jsFiles.length === 0) {
      throw new Error('No .vue or .js files found in the specified directory.');
    }
    return true;
  }
}

module.exports = FileFinder;
