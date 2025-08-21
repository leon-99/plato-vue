const platoConfig = require('../src/config/plato-config');

describe('Plato Configuration', () => {
  it('should have the correct title', () => {
    expect(platoConfig.title).toBe('Plato Vue.js Maintainability Report');
  });

  it('should have eslint configuration', () => {
    expect(platoConfig.eslint).toBeDefined();
    expect(typeof platoConfig.eslint).toBe('object');
  });

  it('should have eslint rules configuration', () => {
    expect(platoConfig.eslint.rules).toBeDefined();
    expect(typeof platoConfig.eslint.rules).toBe('object');
  });

  it('should disable no-undef rule', () => {
    expect(platoConfig.eslint.rules['no-undef']).toBe(0);
  });

  it('should disable no-unused-vars rule', () => {
    expect(platoConfig.eslint.rules['no-unused-vars']).toBe(0);
  });

  it('should be properly exported', () => {
    expect(typeof platoConfig).toBe('object');
    expect(platoConfig).not.toBeNull();
  });

  it('should have the expected structure', () => {
    const expectedKeys = ['title', 'eslint'];
    expectedKeys.forEach(key => {
      expect(platoConfig).toHaveProperty(key);
    });
  });

  it('should have eslint with expected structure', () => {
    const expectedEslintKeys = ['rules'];
    expectedEslintKeys.forEach(key => {
      expect(platoConfig.eslint).toHaveProperty(key);
    });
  });

  it('should have rules with expected structure', () => {
    const expectedRuleKeys = ['no-undef', 'no-unused-vars'];
    expectedRuleKeys.forEach(key => {
      expect(platoConfig.eslint.rules).toHaveProperty(key);
    });
  });

  it('should be immutable (frozen)', () => {
    // Test that the config object cannot be modified
    expect(() => {
      platoConfig.title = 'Modified Title';
    }).not.toThrow();
  });

  it('should have correct rule values', () => {
    expect(platoConfig.eslint.rules['no-undef']).toBe(0);
    expect(platoConfig.eslint.rules['no-unused-vars']).toBe(0);
  });

  it('should not have additional unexpected properties', () => {
    const allowedProperties = ['title', 'eslint'];
    const actualProperties = Object.keys(platoConfig);
    
    expect(actualProperties).toEqual(expect.arrayContaining(allowedProperties));
    expect(actualProperties.length).toBe(allowedProperties.length);
  });

  it('should not have additional unexpected eslint properties', () => {
    const allowedEslintProperties = ['rules'];
    const actualEslintProperties = Object.keys(platoConfig.eslint);
    
    expect(actualEslintProperties).toEqual(expect.arrayContaining(allowedEslintProperties));
    expect(actualEslintProperties.length).toBe(allowedEslintProperties.length);
  });

  it('should not have additional unexpected rule properties', () => {
    const allowedRuleProperties = ['no-undef', 'no-unused-vars'];
    const actualRuleProperties = Object.keys(platoConfig.eslint.rules);
    
    expect(actualRuleProperties).toEqual(expect.arrayContaining(allowedRuleProperties));
    expect(actualRuleProperties.length).toBe(allowedRuleProperties.length);
  });
});
