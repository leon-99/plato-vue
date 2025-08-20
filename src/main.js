#!/usr/bin/env node

const path = require('path');
const VueFileFinder = require('./services/vue-file-finder');
const ScriptExtractor = require('./services/script-extractor');
const PlatoAnalyzer = require('./services/plato-analyzer');
const ReportGenerator = require('./services/report-generator');
const CleanupService = require('./services/cleanup-service');
const FileUtils = require('./utils/file-utils');

class VueMaintainabilityAnalyzer {
  constructor() {
    this.args = process.argv.slice(2);
    this.targetPath = this.args[0] || '.';
    this.outputPath = this.args[1] || path.join(process.cwd(), 'plato-report');
  }

  async run() {
    try {
      console.log("🔍 Plato Vue.js Maintainability Analyzer");
      
      // Step 1: Find Vue files
      const { files: vueFiles, targetPath: targetPathResolved } = VueFileFinder.findVueFiles(this.targetPath);
      VueFileFinder.validateVueFiles(vueFiles);
      
      console.log(`📁 Analyzing: ${targetPathResolved}`);
      console.log(`📊 Output: ${FileUtils.resolvePath(this.outputPath)}\n`);
      
      // Step 2: Extract script blocks and create temporary files
      const tempDir = FileUtils.joinPath(this.outputPath, 'temp-analysis');
      FileUtils.ensureDirectoryExists(this.outputPath);
      FileUtils.ensureDirectoryExists(tempDir);
      
      const tempFiles = ScriptExtractor.extractScriptBlocks(vueFiles, targetPathResolved, tempDir);
      ScriptExtractor.validateExtractedScripts(tempFiles);
      
      ReportGenerator.displayFileDiscovery(vueFiles, tempFiles);
      
      // Step 3: Run Plato analysis
      const tempFilePaths = tempFiles.map(tf => tf.tempFile);
      const results = await PlatoAnalyzer.analyzeFiles(tempFilePaths, this.outputPath);
      
      // Step 4: Process and display results
      const processedResults = PlatoAnalyzer.processResults(results, tempFiles);
      const summary = PlatoAnalyzer.calculateSummary(processedResults);
      
      ReportGenerator.displayAnalysisResults(processedResults, summary);
      ReportGenerator.displayOutputPath(this.outputPath);
      
      // Step 5: Cleanup
      CleanupService.cleanupTempFiles(tempFiles, tempDir);
      
    } catch (error) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  }
}

// Run the analyzer
const analyzer = new VueMaintainabilityAnalyzer();
analyzer.run();
