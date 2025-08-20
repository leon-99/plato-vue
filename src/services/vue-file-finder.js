const glob = require('glob');
const path = require('path');
const fs = require('fs');

class FileFinder {
  static findFiles(targetPath) {
    const targetPathResolved = path.resolve(process.cwd(), targetPath);
    
    console.log(`🔍 Searching in: ${targetPathResolved}`);
    
    // Try glob first, but fall back to manual recursive search if needed
    let vueFiles = [];
    let jsFiles = [];
    
    try {
      // Use glob with recursive pattern
      vueFiles = glob.sync("**/*.vue", { 
        cwd: targetPathResolved, 
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        dot: false,
        follow: false,
        strict: false
      });
      
      jsFiles = glob.sync("**/*.js", { 
        cwd: targetPathResolved, 
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        dot: false,
        follow: false,
        strict: false
      });
      
      console.log(`   Glob found: ${vueFiles.length} Vue files, ${jsFiles.length} JS files`);
    } catch (error) {
      console.log(`   Glob search failed: ${error.message}`);
    }
    
    // If glob didn't find many files, use manual recursive search as backup
    if (jsFiles.length < 10) { // Arbitrary threshold to detect if glob is working
      console.log(`   Using manual recursive search as backup...`);
      const manualResults = this.recursiveFileSearch(targetPathResolved);
      
      // Merge results, preferring glob results but adding any missing files
      const allVueFiles = new Set([...vueFiles, ...manualResults.vueFiles]);
      const allJsFiles = new Set([...jsFiles, ...manualResults.jsFiles]);
      
      vueFiles = Array.from(allVueFiles);
      jsFiles = Array.from(allJsFiles);
      
      console.log(`   Manual search added: ${manualResults.vueFiles.length} Vue files, ${manualResults.jsFiles.length} JS files`);
    }
    
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

  static recursiveFileSearch(dir, results = { vueFiles: [], jsFiles: [] }) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Skip certain directories
            if (!['node_modules', 'dist', 'build', '.git', 'test-output', 'plato-report'].includes(item)) {
              this.recursiveFileSearch(fullPath, results);
            }
          } else if (item.endsWith('.vue')) {
            results.vueFiles.push(fullPath);
          } else if (item.endsWith('.js')) {
            results.jsFiles.push(fullPath);
          }
        } catch (statError) {
          // Skip files we can't stat (like broken symlinks)
          continue;
        }
      }
    } catch (error) {
      // Skip directories we can't read
      return results;
    }
    
    return results;
  }

  static validateFiles(vueFiles, jsFiles) {
    if (vueFiles.length === 0 && jsFiles.length === 0) {
      throw new Error('No .vue or .js files found in the specified directory.');
    }
    return true;
  }
}

module.exports = FileFinder;
