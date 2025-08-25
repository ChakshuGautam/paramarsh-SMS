/// <reference types="cypress" />

// Custom commands for the application

// Command to check API health
Cypress.Commands.add('checkApiHealth', () => {
  cy.request({
    url: `${Cypress.env('apiUrl')}/api/v1/health`,
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200) {
      expect(response.body).to.have.property('status');
    }
  });
});

// Command to set multi-tenancy headers
Cypress.Commands.add('setTenantHeaders', (branchId = 'branch1', tenantId = 'tenant1') => {
  cy.intercept('**/*', (req) => {
    req.headers['X-Branch-Id'] = branchId;
    req.headers['X-Tenant-Id'] = tenantId;
  });
});

// Command to take visual snapshot
Cypress.Commands.add('visualSnapshot', (name: string) => {
  cy.compareSnapshot(name, {
    capture: 'viewport',
    errorThreshold: 0.1,
  });
});

// Command to login (mock for now)
Cypress.Commands.add('login', (role = 'admin') => {
  // For now, just set some session data
  // In real implementation, this would handle Clerk authentication
  cy.window().then((win) => {
    win.localStorage.setItem('selectedBranchId', 'branch1');
    win.localStorage.setItem('userRole', role);
  });
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      checkApiHealth(): Chainable<void>;
      setTenantHeaders(branchId?: string, tenantId?: string): Chainable<void>;
      visualSnapshot(name: string): Chainable<void>;
      login(role?: string): Chainable<void>;
    }
  }
}

export {};