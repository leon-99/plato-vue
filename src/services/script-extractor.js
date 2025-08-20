const FileUtils = require('../utils/file-utils');

class ScriptExtractor {
  static extractScriptBlocks(vueFiles, jsFiles, targetPathResolved, tempDir) {
    const tempFiles = [];
    
    // Process Vue files - extract script blocks
    vueFiles.forEach((vueFile) => {
      const content = FileUtils.readFile(vueFile);
      const match = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      
      if (match && match[1].trim()) {
        const scriptContent = match[1];
        const relativePath = FileUtils.getRelativePath(targetPathResolved, vueFile);
        const tempFileName = this.createTempFileName(relativePath);
        const tempFilePath = FileUtils.joinPath(tempDir, tempFileName);
        
        // Write script content to temporary JS file
        FileUtils.writeFile(tempFilePath, scriptContent);
        
        tempFiles.push({
          originalFile: vueFile,
          tempFile: tempFilePath,
          tempFileName,
          originalName: relativePath,
          fileType: 'vue'
        });
        
        console.log(`✅ Processed Vue: ${relativePath}`);
      } else {
        console.log(`⚠️  ${FileUtils.getRelativePath(targetPathResolved, vueFile)}: (no <script> block found)`);
      }
    });
    
    // Process JavaScript files - copy them directly
    jsFiles.forEach((jsFile) => {
      const relativePath = FileUtils.getRelativePath(targetPathResolved, jsFile);
      const tempFileName = this.createTempFileName(relativePath);
      const tempFilePath = FileUtils.joinPath(tempDir, tempFileName);
      
      // Copy the entire JS file content
      const jsContent = FileUtils.readFile(jsFile);
      FileUtils.writeFile(tempFilePath, jsContent);
      
      tempFiles.push({
        originalFile: jsFile,
        tempFile: tempFilePath,
        tempFileName,
        originalName: relativePath,
        fileType: 'js'
      });
      
      console.log(`✅ Processed JS: ${relativePath}`);
    });
    
    return tempFiles;
  }

  static createTempFileName(relativePath) {
    return relativePath.replace(/[\/\\]/g, '_').replace(/\.(vue|js)$/, '.js');
  }

  static validateExtractedScripts(tempFiles) {
    if (tempFiles.length === 0) {
      throw new Error('No Vue files with script blocks or JavaScript files found to analyze.');
    }
    return true;
  }
}

module.exports = ScriptExtractor;
