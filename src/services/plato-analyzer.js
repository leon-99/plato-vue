const plato = require('plato');
const platoConfig = require('../config/plato-config');

class PlatoAnalyzer {
  static analyzeFiles(tempFilePaths, outputPath) {
    return new Promise((resolve, reject) => {
      plato.inspect(tempFilePaths, outputPath, platoConfig, (err, report) => {
        if (err && !Array.isArray(err)) {
          reject(err);
          return;
        }
        
        // Plato sometimes returns results in the err parameter
        const results = Array.isArray(err) ? err : report;
        resolve(results);
      });
    });
  }

  static processResults(results, tempFiles) {
    const processedResults = [];
    
    tempFiles.forEach(({ originalFile, tempFileName, originalName, fileType }, index) => {
      const fileReport = results[index];
      
      if (fileReport && fileReport.complexity) {
        const mi = fileReport.complexity.maintainability;
        const complexity = fileReport.complexity.methodAverage.cyclomatic;
        const sloc = fileReport.complexity.lineEnd - fileReport.complexity.lineStart + 1;
        
        processedResults.push({
          originalName,
          fileType,
          maintainability: mi,
          complexity,
          sloc,
          category: this.categorizeMaintainability(mi)
        });
      }
    });
    
    return processedResults;
  }

  static categorizeMaintainability(mi) {
    if (mi >= 85) return "🟢 Excellent";
    if (mi >= 65) return "🟡 Good";
    if (mi >= 50) return "🟠 Moderate";
    return "🔴 Low (needs refactoring)";
  }

  static calculateSummary(processedResults) {
    const validResults = processedResults.filter(r => r && !isNaN(r.maintainability));
    
    if (validResults.length === 0) {
      return {
        averageMI: 0,
        averageComplexity: 0,
        totalFiles: 0
      };
    }
    
    const avgMI = validResults.reduce((sum, r) => sum + r.maintainability, 0) / validResults.length;
    const avgComplexity = validResults.reduce((sum, r) => sum + r.complexity, 0) / validResults.length;
    
    return {
      averageMI: avgMI,
      averageComplexity: avgComplexity,
      totalFiles: validResults.length
    };
  }
}

module.exports = PlatoAnalyzer;
