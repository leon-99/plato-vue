const FileUtils = require('../utils/file-utils');

class ReportGenerator {
  static displayAnalysisResults(processedResults, summary) {
    console.log("📊 Plato Analysis Results:\n");
    
    processedResults.forEach(result => {
      const fileType = result.fileType === 'vue' ? 'Vue' : 'JS';
      console.log(`📁 ${result.originalName} (${fileType}):`);
      console.log(`   Maintainability Index: ${result.maintainability.toFixed(2)}`);
      console.log(`   Cyclomatic Complexity: ${result.complexity.toFixed(2)}`);
      console.log(`   Lines of Code: ${result.sloc}`);
      console.log(`   Status: ${result.category}\n`);
    });
    
    this.displaySummary(summary);
  }

  static displaySummary(summary) {
    console.log("📈 Summary:");
    console.log(`   Average Maintainability Index: ${summary.averageMI.toFixed(2)}`);
    console.log(`   Average Cyclomatic Complexity: ${summary.averageComplexity.toFixed(2)}`);
    console.log(`   Total Files Analyzed: ${summary.totalFiles}`);
  }

  static displayFileDiscovery(vueFiles, jsFiles, tempFiles) {
    if (vueFiles.length > 0) {
      console.log(`🔍 Found ${vueFiles.length} Vue file(s):`);
      vueFiles.forEach(file => console.log(`   ${FileUtils.getRelativePath(process.cwd(), file)}`));
      console.log();
    }
    
    if (jsFiles.length > 0) {
      console.log(`🔍 Found ${jsFiles.length} JavaScript file(s):`);
      jsFiles.forEach(file => console.log(`   ${FileUtils.getRelativePath(process.cwd(), file)}`));
      console.log();
    }
    
    const totalFiles = vueFiles.length + jsFiles.length;
    console.log(`📊 Summary: ${tempFiles.length} files processed out of ${totalFiles} total files (Vue + JS)`);
  }

  static displayOutputPath(outputPath) {
    const htmlReportPath = FileUtils.joinPath(outputPath, 'index.html');
    if (FileUtils.fileExists(htmlReportPath)) {
      console.log(`\n🌐 HTML Report generated at: ${FileUtils.resolvePath(htmlReportPath)}`);
      console.log("   Open this file in your browser for detailed analysis!");
    }
  }

  static displayUsage() {
    console.log("❌ No .vue or .js files found in the specified directory.");
    console.log("   Usage: plato-vue [source-path] [output-path]");
    console.log("   Example: plato-vue . plato-report");
    console.log("   Example: plato-vue src");
  }
}

module.exports = ReportGenerator;
