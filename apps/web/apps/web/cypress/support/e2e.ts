// ***********************************************************
// This file is processed and loaded automatically before test files.
// ***********************************************************

// Import commands
import './commands';

// Visual regression plugin
import 'cypress-visual-regression/dist/command';

// Snapshot plugin
import '@cypress/snapshot/support';

// Disable uncaught exception handling in tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // This is useful when testing third-party scripts or dealing with known errors
  return false;
});