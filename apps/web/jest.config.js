/** @type {import('jest').Config} */
const path = require('path');

module.exports = {
  rootDir: __dirname,
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.js') }],
  },
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testRegex: '(/__tests__/.*\\.(test|spec))\\.(ts|tsx)$',
};
