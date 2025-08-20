const FileUtils = require('../utils/file-utils');

class ReportGenerator {
  static displayAnalysisResults(processedResults, summary) {
    console.log("📊 Plato Analysis Results:\n");
    
    processedResults.forEach(result => {
      console.log(`📁 ${result.originalName}:`);
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

  static displayFileDiscovery(vueFiles, tempFiles) {
    console.log(`🔍 Found ${vueFiles.length} Vue file(s):`);
    vueFiles.forEach(file => console.log(`   ${file}`));
    console.log();
    
    console.log(`📊 Summary: ${tempFiles.length} files with script blocks found out of ${vueFiles.length} total Vue files`);
  }

  static displayOutputPath(outputPath) {
    const htmlReportPath = FileUtils.joinPath(outputPath, 'index.html');
    if (FileUtils.fileExists(htmlReportPath)) {
      console.log(`\n🌐 HTML Report generated at: ${FileUtils.resolvePath(htmlReportPath)}`);
      console.log("   Open this file in your browser for detailed analysis!");
    }
  }

  static displayUsage() {
    console.log("❌ No .vue files found in the specified directory.");
    console.log("   Usage: plato-vue [source-path] [output-path]");
    console.log("   Example: plato-vue . plato-report");
    console.log("   Example: plato-vue src");
  }
}

module.exports = ReportGenerator;
