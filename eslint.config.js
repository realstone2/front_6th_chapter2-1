import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        parseInt: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-trailing-spaces': 'error',
      'comma-dangle': ['error', 'es5'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
  prettier,
];
