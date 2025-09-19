module.exports = {
  displayName: 'Seed Data Manager v3.0',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: '../../coverage/seed',
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/*.test.ts',
    '!**/*.spec.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'], // Handled in individual test files
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^@/seed/(.*)$': '<rootDir>/$1'
  },
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true
};