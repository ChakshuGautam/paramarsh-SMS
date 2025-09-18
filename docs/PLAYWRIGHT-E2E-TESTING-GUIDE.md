# Playwright E2E Testing Guide for Paramarsh SMS

## 📚 Table of Contents
1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Writing Tests](#writing-tests)
4. [Best Practices](#best-practices)
5. [Common Patterns](#common-patterns)
6. [Debugging](#debugging)
7. [CI/CD Integration](#cicd-integration)

## Overview

This guide provides comprehensive instructions for writing Playwright E2E tests for the Paramarsh SMS system. All E2E tests should follow these patterns for consistency and maintainability.

## Test Structure

### Directory Organization
```
test/
├── e2e/
│   ├── entities/              # CRUD tests for each entity
│   │   ├── students-comprehensive.spec.ts
│   │   ├── teachers-comprehensive.spec.ts
│   │   ├── guardians-comprehensive.spec.ts
│   │   ├── classes-comprehensive.spec.ts
│   │   └── ...
│   ├── workflows/              # User workflow tests
│   │   ├── enrollment-flow.spec.ts
│   │   ├── attendance-marking.spec.ts
│   │   └── fee-payment-flow.spec.ts
│   ├── helpers/
│   │   ├── page-objects.ts    # Page object models
│   │   ├── test-data.ts       # Test data generators
│   │   └── auth-helper.ts     # Authentication utilities
│   └── config/
│       └── test-config.ts     # Test configuration
```

### Standard Test Template

Every comprehensive CRUD test should follow this structure:

```typescript
import { test, expect, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/page-objects';

/**
 * Comprehensive [Entity] CRUD E2E Tests
 * 
 * Tests all CRUD operations for [Entity]:
 * - List: View all records with pagination, filtering, sorting
 * - Create: Add new records with validation
 * - Show: View record details
 * - Edit: Update record information
 * - Delete: Remove records (soft delete)
 * 
 * Coverage:
 * - Multi-branch isolation (dps-main branch)
 * - Form validation
 * - Data relationships
 * - Responsive design
 * - Performance with large datasets
 */

test.describe('[Entity] - Comprehensive CRUD Tests', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  const ENTITY_URL = '/admin/[entities]';
  
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
  });

  test.describe('List Operations', () => {
    test('should load list and display data correctly', async ({ page }) => {
      // Implementation
    });

    test('should support search functionality', async ({ page }) => {
      // Implementation
    });

    test('should support filtering and sorting', async ({ page }) => {
      // Implementation
    });

    test('should handle pagination', async ({ page }) => {
      // Implementation
    });
  });

  test.describe('Create Operations', () => {
    test('should navigate to create form', async ({ page }) => {
      // Implementation
    });

    test('should validate required fields', async ({ page }) => {
      // Implementation
    });

    test('should create record successfully', async ({ page }) => {
      // Implementation
    });
  });

  test.describe('Show Operations', () => {
    test('should display record details', async ({ page }) => {
      // Implementation
    });

    test('should show related data', async ({ page }) => {
      // Implementation
    });
  });

  test.describe('Edit Operations', () => {
    test('should load edit form with data', async ({ page }) => {
      // Implementation
    });

    test('should update record successfully', async ({ page }) => {
      // Implementation
    });
  });

  test.describe('Delete Operations', () => {
    test('should soft delete record', async ({ page }) => {
      // Implementation
    });

    test('should handle delete confirmation', async ({ page }) => {
      // Implementation
    });
  });

  test.describe('Performance & Data Quality', () => {
    test('should handle large datasets', async ({ page }) => {
      // Implementation
    });

    test('should not have console errors', async ({ page }) => {
      // Implementation
    });
  });
});
```

## Writing Tests

### 1. Selector Strategy (Priority Order)

```typescript
// ✅ BEST: Semantic selectors
await page.getByRole('button', { name: 'Save' }).click();
await page.getByLabel('First Name').fill('John');
await page.getByPlaceholder('Search...').fill('test');
await page.getByText('Welcome').click();

// ✅ GOOD: Test IDs (when available)
await page.getByTestId('submit-button').click();

// ✅ OK: Accessible attributes
await page.locator('button[type="submit"]').click();
await page.locator('input[name="firstName"]').fill('John');

// ⚠️ AVOID: Class-based selectors (brittle)
await page.locator('.btn-primary').click();

// ❌ NEVER: Complex CSS or XPath
await page.locator('.container > div:nth-child(2) > button').click();
```

### 2. Waiting Strategies

```typescript
// ✅ CORRECT: Wait for specific conditions
await page.waitForLoadState('networkidle');
await page.waitForSelector('.data-table');
await expect(page.locator('.spinner')).toBeHidden();

// ✅ CORRECT: Wait for API responses
await page.waitForResponse(response => 
  response.url().includes('/api/students') && response.status() === 200
);

// ❌ WRONG: Fixed timeouts
await page.waitForTimeout(5000); // Never use fixed timeouts
```

### 3. Error Handling

```typescript
// ✅ Handle multiple UI variations
try {
  // Try primary approach
  await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  console.log('✅ Table found');
} catch {
  // Fallback for empty state
  console.log('⚠️ No table, checking for empty message');
  const emptyMsg = page.locator('text=/no.*data/i');
  await expect(emptyMsg).toBeVisible();
}

// ✅ Multiple selector fallbacks
const editButton = page.locator(
  'button:has-text("Edit"), a:has-text("Edit"), [aria-label="Edit"]'
);
if (await editButton.count() > 0) {
  await editButton.first().click();
}
```

## Best Practices

### 1. Test Independence
- Each test should be completely independent
- Don't rely on test execution order
- Clean up test data after each test
- Use `test.beforeEach` for common setup

### 2. Meaningful Assertions
```typescript
// ✅ GOOD: Specific assertions
expect(await page.locator('.student-count').textContent()).toBe('2,156 students');
expect(await page.locator('input[name="email"]').inputValue()).toMatch(/^[\w.]+@[\w.]+$/);

// ❌ BAD: Generic assertions
expect(await page.textContent('body')).toContain('student');
```

### 3. Performance Monitoring
```typescript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto(`${FRONTEND_URL}/admin/students`);
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // Should load in < 3 seconds
  console.log(`Page loaded in ${loadTime}ms`);
});
```

### 4. Console Error Monitoring
```typescript
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  // After test, check for critical errors
  test.afterEach(() => {
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('DevTools')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
```

## Common Patterns

### React Admin DataTable Testing
```typescript
// Check if DataTable is loaded
const dataTable = page.locator(
  'table, [role="table"], [role="grid"], .MuiDataGrid-root'
);
await expect(dataTable.first()).toBeVisible();

// Count rows
const rows = page.locator('tbody tr, [role="row"]:not([role="columnheader"])');
const rowCount = await rows.count();
expect(rowCount).toBeGreaterThan(0);

// Click on first row
await rows.first().click();
```

### Form Testing
```typescript
// Fill form fields
await page.locator('input[name="firstName"]').fill('John');
await page.locator('input[name="lastName"]').fill('Doe');
await page.locator('select[name="gender"]').selectOption('MALE');

// Date picker
await page.locator('input[type="date"]').fill('2024-01-15');

// Autocomplete/Reference fields
await page.locator('input[name="guardianId"]').click();
await page.locator('input[name="guardianId"]').fill('Smith');
await page.locator('[role="option"]').first().click();

// Submit form
await page.getByRole('button', { name: 'Save' }).click();
```

### Tab Navigation
```typescript
// React Admin tabs
const tabs = page.locator('[role="tab"]');
await tabs.filter({ hasText: 'Active' }).click();
await page.waitForLoadState('networkidle');

// Custom tabs
await page.locator('button:has-text("Primary (1-5)")').click();
```

### Search and Filter
```typescript
// Search
const searchInput = page.locator('input[placeholder*="search" i]');
await searchInput.fill('John');
await searchInput.press('Enter');
await page.waitForLoadState('networkidle');

// Filters
await page.locator('button:has-text("Filters")').click();
await page.locator('select[name="status"]').selectOption('active');
await page.locator('button:has-text("Apply")').click();
```

## Debugging

### Visual Debugging
```typescript
// Take screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await page.screenshot({
      path: `screenshots/${testInfo.title}.png`,
      fullPage: true
    });
  }
});

// Debug mode
npx playwright test --debug
npx playwright test --headed
```

### Network Debugging
```typescript
// Log all API calls
page.on('request', request => {
  if (request.url().includes('/api/')) {
    console.log('API Request:', request.method(), request.url());
  }
});

page.on('response', response => {
  if (response.url().includes('/api/') && !response.ok()) {
    console.error('API Error:', response.status(), response.url());
  }
});
```

### Trace Viewer
```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions Configuration
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npx playwright test
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Parallel Execution
```typescript
// playwright.config.ts
export default {
  workers: process.env.CI ? 2 : 4,
  fullyParallel: true,
  
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
  ],
};
```

## Test Data Management

### Using Test Database
```typescript
// Before all tests, ensure test data exists
test.beforeAll(async () => {
  // Check if test data exists
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error('API not available');
  }
});
```

### Cleanup Strategy
```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data created during test
  if (testDataIds.length > 0) {
    for (const id of testDataIds) {
      await deleteTestRecord(id);
    }
  }
});
```

## Performance Guidelines

1. **Target Load Times**
   - List pages: < 3 seconds
   - Forms: < 2 seconds
   - Search: < 1 second
   - Navigation: < 500ms

2. **Dataset Sizes**
   - Small: 10-50 records
   - Medium: 100-500 records
   - Large: 1000+ records

3. **Browser Coverage**
   - Chrome/Chromium (primary)
   - Firefox
   - Safari/WebKit
   - Mobile browsers

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Element not found"
**Solution**: Use more robust selectors
```typescript
// Instead of:
await page.locator('.btn').click();

// Use:
await page.getByRole('button', { name: 'Submit' }).click();
```

#### Issue: "Timeout waiting for selector"
**Solution**: Add explicit waits
```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('.data-table', { timeout: 30000 });
```

#### Issue: "Flaky tests"
**Solution**: Add retries and stability checks
```typescript
test.retries(2);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500); // Small delay for animations
```

## Checklist for New Tests

Before submitting E2E tests, ensure:

- [ ] Tests run independently (can run single test)
- [ ] No hardcoded data (use variables/constants)
- [ ] Proper error handling
- [ ] Meaningful test descriptions
- [ ] Console error checking
- [ ] Performance assertions
- [ ] Cross-browser tested
- [ ] Mobile responsive tested
- [ ] Test data cleanup
- [ ] Documentation updated

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Admin Testing Guide](https://marmelab.com/react-admin/Testing.html)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

**Remember**: E2E tests are user-facing tests. Think like a user, test like a user.