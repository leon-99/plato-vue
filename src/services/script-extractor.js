const FileUtils = require('../utils/file-utils');

class ScriptExtractor {
  static extractScriptBlocks(vueFiles, targetPathResolved, tempDir) {
    const tempFiles = [];
    
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
          vueFile,
          tempFile: tempFilePath,
          tempFileName,
          originalName: relativePath
        });
        
        console.log(`✅ Processed: ${relativePath}`);
      } else {
        console.log(`⚠️  ${FileUtils.getRelativePath(targetPathResolved, vueFile)}: (no <script> block found)`);
      }
    });
    
    return tempFiles;
  }

  static createTempFileName(relativePath) {
    return relativePath.replace(/[\/\\]/g, '_').replace('.vue', '.js');
  }

  static validateExtractedScripts(tempFiles) {
    if (tempFiles.length === 0) {
      throw new Error('No Vue files with script blocks found to analyze.');
    }
    return true;
  }
}

module.exports = ScriptExtractor;
