import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Visual regression plugin
      require('cypress-visual-regression/dist/plugin').default(on, config);
      
      // Snapshot plugin
      require('@cypress/snapshot/cypress-snapshot-plugin').registerPlugin(on, config);
      
      return config;
    },
    env: {
      // Visual regression settings
      visualRegressionType: 'regression',
      visualRegressionBaseDirectory: 'cypress/snapshots/base',
      visualRegressionDiffDirectory: 'cypress/snapshots/diff',
      visualRegressionGenerateDiff: 'fail',
      
      // API URL
      apiUrl: 'http://localhost:8080',
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
  
  // Component testing config (if needed later)
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});