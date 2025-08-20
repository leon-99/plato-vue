const FileUtils = require('../utils/file-utils');

class CleanupService {
  static cleanupTempFiles(tempFiles, tempDir) {
    // Remove temporary files
    tempFiles.forEach(({ tempFile }) => {
      FileUtils.deleteFile(tempFile);
    });
    
    // Remove temp directory if empty
    FileUtils.removeDirectory(tempDir);
    
    console.log("\n🧹 Temporary files cleaned up.");
    console.log("✅ Analysis complete!");
  }
}

module.exports = CleanupService;
