const platoConfig = {
  title: 'Plato Vue.js Maintainability Report',
  eslint: {
    rules: {
      // Disable some rules that might interfere with Vue files
      'no-undef': 0,
      'no-unused-vars': 0
    }
  }
};

module.exports = platoConfig;
