# Puppeteer Test & Fix Workflow

## 🎯 Overview

This workflow documents the systematic approach for using Puppeteer (or browser automation tools) to identify UI/API data consistency issues and implement comprehensive fixes.

## 📋 Workflow Steps

### Phase 1: Discovery & Investigation

#### 1.1 Initial Network Monitoring
```bash
# Use Puppeteer MCP to monitor network calls
1. Navigate to the page/tab under investigation
2. Set up network interception to capture API calls
3. Extract displayed UI values
4. Document all API endpoints being called
```

**Puppeteer Code Pattern:**
```javascript
// Inject network monitoring
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const callInfo = {
    type: 'fetch',
    url: args[0],
    method: (args[1] || {}).method || 'GET',
    headers: (args[1] || {}).headers || {},
    timestamp: new Date().toISOString()
  };
  window.apiCalls.push(callInfo);
  return originalFetch.apply(this, args);
};
```

#### 1.2 Data Extraction & Comparison
```bash
# Compare frontend display vs API responses
1. Extract UI values using selectors
2. Make direct API calls with same headers/parameters
3. Document discrepancies with specific numbers
4. Identify patterns in the differences
```

### Phase 2: Root Cause Analysis

#### 2.1 Backend Investigation
```bash
# Check API services for consistency
1. Examine service implementations
2. Compare filtering logic between similar APIs
3. Validate database queries
4. Check multi-tenancy (branchId) handling
```

**Common Issues Checklist:**
- [ ] Inconsistent status filtering (`status: 'active'` vs no filter)
- [ ] Missing branch scoping (`X-Branch-Id` header handling)
- [ ] Calculation errors (aggregation vs average)
- [ ] Date range handling issues
- [ ] Soft delete filtering differences

#### 2.2 Database Validation
```sql
-- Use MCP PostgreSQL tools to validate data
SELECT 
  'TotalRecords' as type,
  COUNT(*) as count
FROM "TableName" 
WHERE "branchId" = 'dps-main' 
  AND "deletedAt" IS NULL

UNION ALL

SELECT 
  'ActiveRecords' as type,
  COUNT(*) as count
FROM "TableName" 
WHERE "branchId" = 'dps-main' 
  AND "deletedAt" IS NULL 
  AND "status" = 'active'
```

### Phase 3: Fix Implementation

#### 3.1 Backend Fixes
```bash
# Use specialized agents for fixes
1. Use backend-implementer agent for API fixes
2. Identify the most restrictive/accurate filtering logic
3. Apply consistent filtering across all related services
4. Ensure proper multi-tenancy support
```

**Backend Fix Pattern:**
```typescript
// Override buildWhereClause for consistency
protected buildWhereClause(filter?: Record<string, any>): any {
  const where = super.buildWhereClause(filter);
  
  // Apply consistent active filtering unless explicitly overridden
  if (!filter?.includeAllStatuses && !where.status) {
    where.status = 'active';
  }
  
  return where;
}
```

#### 3.2 Controller Header Handling
```typescript
// Ensure all controllers handle X-Branch-Id properly
@Get()
async getList(
  @Query() query: any,
  @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
) {
  return this.service.getList({
    ...query,
    branchId, // Critical: Pass branchId to service
  });
}
```

### Phase 4: E2E Test Creation

#### 4.1 Test Structure
```bash
# Create comprehensive E2E test
1. Use tester agent for E2E test implementation
2. Test multiple scenarios (branches, date ranges, filters)
3. Include performance and error handling tests
4. Create helper utilities for reusability
```

**Test File Template:**
```typescript
// test/e2e/[module]-data-accuracy.spec.ts
describe('[Module] Data Accuracy', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  test('should match API data with UI display', async () => {
    // 1. Navigate to page
    // 2. Extract UI values
    // 3. Make API calls
    // 4. Compare and assert
  });

  // Add tests for different scenarios
});
```

#### 4.2 Test Scenarios Template
```bash
Essential Test Cases:
- Data consistency (UI vs API)
- Multi-branch support
- Date range filtering
- Performance validation
- Error handling
- Network resilience
```

### Phase 5: Validation & Documentation

#### 5.1 Test Execution
```bash
# Run and validate fixes
1. Execute E2E tests
2. Validate all scenarios pass
3. Check performance metrics
4. Document results
```

#### 5.2 Documentation Update
```bash
# Update project documentation
1. Document the fixes implemented
2. Update API documentation if needed
3. Add troubleshooting guides
4. Create runbook for future issues
```

## 🔧 Reusable Utilities

### Network Monitoring Script
```javascript
// utils/network-monitor.js - Inject into pages
window.apiCalls = [];
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const callInfo = {
    type: 'fetch',
    url: args[0],
    method: (args[1] || {}).method || 'GET',
    headers: (args[1] || {}).headers || {},
    body: (args[1] || {}).body || null,
    timestamp: new Date().toISOString()
  };
  window.apiCalls.push(callInfo);
  return originalFetch.apply(this, args);
};

window.getApiCalls = () => window.apiCalls;
window.clearApiCalls = () => { window.apiCalls = []; };
```

### Data Extraction Helper
```typescript
// utils/data-extraction.ts
export function extractNumber(text: string): number {
  // Remove commas, currency symbols, percentages
  const cleaned = text.replace(/[₹,$%L]/g, '').trim();
  
  // Handle 'L' suffix (Lakhs)
  if (text.includes('L')) {
    return parseFloat(cleaned) * 100000;
  }
  
  return parseFloat(cleaned) || 0;
}

export async function extractUIValue(page: Page, selectors: string[]): Promise<string> {
  for (const selector of selectors) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 2000 });
      const text = await element.textContent();
      if (text?.trim()) return text.trim();
    } catch (e) {
      continue; // Try next selector
    }
  }
  throw new Error(`Could not find element with any of: ${selectors.join(', ')}`);
}
```

### API Testing Helper
```typescript
// utils/api-tester.ts
export async function makeApiCall(
  endpoint: string, 
  branchId: string = 'dps-main',
  params: Record<string, string> = {}
) {
  const url = new URL(`http://localhost:3005/api/v1${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'X-Branch-Id': branchId,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

## 📁 File Structure Template

```
test/e2e/
├── [module]-data-accuracy.spec.ts    # Main test file
├── utils/
│   ├── network-monitor.js            # Network interception
│   ├── data-extraction.ts            # UI value extraction  
│   ├── api-tester.ts                 # API call helpers
│   └── test-helpers.ts               # General utilities
├── configs/
│   ├── branches.json                 # Branch configurations
│   ├── test-data.json                # Test data sets
│   └── selectors.json                # UI selectors
└── README.md                         # Usage instructions
```

## 🚀 Quick Start Commands

```bash
# 1. Create network monitoring session
cd apps/web
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/admin');
  // ... monitoring setup
})();
"

# 2. Run E2E tests
npm run e2e test/e2e/[module]-data-accuracy.spec.ts

# 3. Debug mode
npm run e2e:debug

# 4. Generate reports
npm run e2e -- --reporter=html
```

## 🔍 Troubleshooting Patterns

### Common Issues & Solutions

#### Issue: API returns different count than UI
```bash
Solution Steps:
1. Check if APIs use consistent filtering (status: 'active')
2. Validate branch header handling (X-Branch-Id)
3. Compare database queries between services
4. Look for caching or state management issues in frontend
```

#### Issue: Date filters not working correctly
```bash
Solution Steps:
1. Validate date range calculation logic
2. Check API parameter formatting (date vs startDate/endDate)
3. Ensure timezone consistency
4. Test edge cases (today, week boundaries, month ends)
```

#### Issue: Multi-tenancy data leakage
```bash
Solution Steps:
1. Verify X-Branch-Id header in all API calls
2. Check service-level branch filtering
3. Validate controller header handling
4. Test cross-branch data isolation
```

## 📊 Success Metrics

### Test Coverage Requirements
- [ ] All main data displays tested
- [ ] Multiple branches validated
- [ ] Date range filters working
- [ ] Performance within limits
- [ ] Error scenarios handled
- [ ] Network resilience tested

### Quality Gates
- [ ] Zero data consistency issues
- [ ] All APIs respect multi-tenancy
- [ ] Performance < 15 seconds load time
- [ ] No JavaScript errors
- [ ] Graceful error handling
- [ ] Mobile responsiveness validated

## 🔄 Maintenance

### Regular Tasks
- [ ] Run E2E tests after deployments
- [ ] Update selectors when UI changes
- [ ] Validate new API endpoints
- [ ] Test with fresh seed data
- [ ] Update branch configurations
- [ ] Review and update test scenarios

### Monitoring & Alerts
- [ ] Set up CI/CD integration
- [ ] Create alerts for test failures  
- [ ] Monitor API response times
- [ ] Track data consistency metrics
- [ ] Log and analyze failures

---

This workflow can be applied to any page/tab in the system by following the same systematic approach: Monitor → Analyze → Fix → Test → Validate.