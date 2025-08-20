# Plato Vue.js Maintainability Analyzer

A globally installable Node.js package that analyzes Vue.js `.vue` files and generates comprehensive maintainability reports using Plato.

## 🚀 Features

- **Vue.js Support**: Analyzes Vue Single File Components (SFC) by extracting `<script>` blocks
- **Maintainability Index**: Calculates and categorizes code maintainability scores
- **Cyclomatic Complexity**: Measures code complexity for better understanding
- **HTML Reports**: Generates detailed HTML reports with Plato's visualization
- **Global CLI**: Install once, use anywhere in your system
- **Modular Architecture**: Clean, maintainable code following Single Responsibility Principle

## 📦 Installation

```bash
npm install -g plato-vue
```

## 🎯 Usage

### Basic Usage
```bash
# Analyze current directory
plato-vue

# Analyze specific directory
plato-vue src

# Analyze with custom output directory
plato-vue src custom-report
```

### Examples
```bash
# Analyze a Vue.js project
plato-vue "C:\Users\Win Aung\projects\my-vue-project"

# Generate report in specific folder
plato-vue src "reports/maintainability"

# Quick test on current project
plato-vue . test-output
```

## 📈 Maintainability Categories

- **🟢 Excellent (85+)**: High-quality, easily maintainable code
- **🟡 Good (65-84)**: Good quality with room for minor improvements
- **🟠 Moderate (50-64)**: Moderate quality, consider refactoring
- **🔴 Low (<50)**: Poor quality, significant refactoring needed

## 📊 Output

### Console Output
```
🔍 Plato Vue.js Maintainability Analyzer
📁 Analyzing: C:\Users\Win Aung\projects\my-vue-project
📊 Output: C:\Users\Win Aung\projects\my-vue-project\plato-report

🔍 Found 15 Vue file(s):
   src\App.vue
   src\components\Header.vue
   ...

📊 Summary: 15 files with script blocks found out of 15 total Vue files

📊 Plato Analysis Results:

📁 src\App.vue:
   Maintainability Index: 85.50
   Cyclomatic Complexity: 2.10
   Lines of Code: 45
   Status: 🟢 Excellent

📈 Summary:
   Average Maintainability Index: 78.25
   Average Cyclomatic Complexity: 1.85
   Total Files Analyzed: 15

🌐 HTML Report generated at: C:\Users\Win Aung\projects\my-vue-project\plato-report\index.html
   Open this file in your browser for detailed analysis!

🧹 Temporary files cleaned up.
✅ Analysis complete!
```

### HTML Report
Generates a comprehensive HTML report with:
- File-by-file analysis
- Maintainability Index charts
- Complexity metrics
- Code quality insights
- Interactive navigation



## 🔧 Configuration

Edit `src/config/plato-config.js` to customize:
- Report title
- ESLint rules
- Analysis options

```javascript
// Disable specific ESLint rules
eslint: {
  rules: {
    'no-undef': 0,
    'no-unused-vars': 0,
    'no-console': 0
  }
}

// Custom report title
title: 'My Custom Vue.js Analysis Report'
```

## 🐛 Troubleshooting

### Common Issues

**"No .vue files found"**
- Ensure the target directory contains `.vue` files
- Check file permissions
- Verify the path is correct

**"No script blocks found"**
- Vue files must contain `<script>` tags
- Check for proper Vue SFC syntax

**Analysis errors**
- Some modern JavaScript syntax may not be supported by Plato
- Check console for specific error messages
- Verify Node.js version compatibility





## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code structure
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Plato](https://github.com/es-analysis/plato) for code analysis
- Uses [glob](https://github.com/isaacs/node-glob) for file discovery
- Inspired by the need for Vue.js-specific maintainability analysis

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/plato-vue/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/plato-vue/discussions)
- **Documentation**: [GitHub Wiki](https://github.com/yourusername/plato-vue/wiki)
