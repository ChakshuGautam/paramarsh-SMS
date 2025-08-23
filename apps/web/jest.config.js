/** @type {import('jest').Config} */
const path = require('path');

module.exports = {
  rootDir: __dirname,
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.test.js') }],
  },
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testRegex: '(/test/.*\\.(test|spec)|/__tests__/.*\\.(test|spec))\\.(ts|tsx)$',
  transformIgnorePatterns: [
    'node_modules/(?!(react-admin|ra-core|ra-ui-materialui|react-hotkeys-hook|inflection|ra-language-english|ra-i18n-polyglot|@radix-ui)/)',
  ],
  testTimeout: 10000,
  maxWorkers: 1, // Run tests sequentially to avoid resource conflicts
};
