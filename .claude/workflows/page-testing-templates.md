# Page Testing Templates

## 🎯 Ready-to-Use Templates for Different Page Types

### Template 1: Dashboard/Overview Pages

**Use Case:** Pages with summary statistics, charts, and key metrics

**Network Monitoring Script:**
```javascript
// dashboard-network-monitor.js
window.dashboardApiCalls = [];
window.originalFetch = window.fetch;
window.fetch = function(...args) {
  const callInfo = {
    type: 'dashboard-api',
    url: args[0],
    method: (args[1] || {}).method || 'GET',
    headers: (args[1] || {}).headers || {},
    timestamp: new Date().toISOString(),
    params: new URL(args[0]).searchParams.toString()
  };
  window.dashboardApiCalls.push(callInfo);
  return window.originalFetch.apply(this, args);
};

// Helper to extract metrics
window.extractDashboardMetrics = () => {
  const metrics = {};
  
  // Common dashboard selectors
  const selectors = {
    totalStudents: ['[data-testid="total-students"]', '.stat-card:has-text("Students") .stat-number'],
    totalTeachers: ['[data-testid="total-teachers"]', '.stat-card:has-text("Teachers") .stat-number'],
    attendanceRate: ['[data-testid="attendance-rate"]', '.stat-card:has-text("Attendance") .percentage'],
    feeCollection: ['[data-testid="fee-collection"]', '.stat-card:has-text("Fee") .amount']
  };
  
  Object.entries(selectors).forEach(([key, selectorList]) => {
    for (const selector of selectorList) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          metrics[key] = element.textContent.trim();
          break;
        }
      } catch (e) {
        continue;
      }
    }
  });
  
  return metrics;
};
```

**E2E Test Template:**
```typescript
// test/e2e/dashboard-data-accuracy.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Dashboard Data Accuracy', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/admin/dashboard');
    
    // Inject monitoring
    await page.addScriptTag({ path: 'test/utils/dashboard-network-monitor.js' });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display accurate student count', async () => {
    // Extract UI value
    const uiValue = await page.locator('[data-testid="total-students"]').textContent();
    const studentCount = extractNumber(uiValue || '0');

    // Get API response
    const apiResponse = await fetch('http://localhost:3005/api/v1/students', {
      headers: { 'X-Branch-Id': 'dps-main' }
    });
    const { total: apiCount } = await apiResponse.json();

    // Compare
    expect(studentCount).toBe(apiCount);
  });

  // Add more tests...
});
```

### Template 2: List/Table Pages

**Use Case:** Pages with data tables, pagination, filtering

**Network Monitoring Script:**
```javascript
// list-network-monitor.js
window.listApiCalls = [];
window.originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = new URL(args[0]);
  const callInfo = {
    type: 'list-api',
    endpoint: url.pathname,
    method: (args[1] || {}).method || 'GET',
    headers: (args[1] || {}).headers || {},
    params: Object.fromEntries(url.searchParams),
    timestamp: new Date().toISOString()
  };
  window.listApiCalls.push(callInfo);
  return window.originalFetch.apply(this, args);
};

// Helper to extract table data
window.extractTableData = () => {
  const table = document.querySelector('table, [role="table"]');
  if (!table) return { rows: 0, data: [] };

  const rows = Array.from(table.querySelectorAll('tbody tr, [role="row"]:not(:first-child)'));
  const data = rows.map(row => {
    const cells = Array.from(row.querySelectorAll('td, [role="cell"]'));
    return cells.map(cell => cell.textContent?.trim());
  });

  return {
    totalRows: rows.length,
    displayedData: data,
    paginationInfo: extractPaginationInfo()
  };
};

window.extractPaginationInfo = () => {
  const paginationText = document.querySelector('.pagination-info, [data-testid="pagination"]')?.textContent;
  const match = paginationText?.match(/(\d+)-(\d+) of (\d+)/);
  return match ? {
    start: parseInt(match[1]),
    end: parseInt(match[2]), 
    total: parseInt(match[3])
  } : null;
};
```

**E2E Test Template:**
```typescript
// test/e2e/[module]-list-accuracy.spec.ts
import { test, expect } from '@playwright/test';

test.describe('[Module] List Data Accuracy', () => {
  test('should match table data with API response', async ({ page }) => {
    await page.goto('/admin/[module]');
    await page.addScriptTag({ path: 'test/utils/list-network-monitor.js' });
    
    // Wait for data to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Extract table data
    const tableData = await page.evaluate(() => window.extractTableData());
    
    // Get API calls made
    const apiCalls = await page.evaluate(() => window.listApiCalls);
    const listCall = apiCalls.find(call => call.endpoint.includes('[module]'));
    
    // Make direct API call
    const apiResponse = await fetch(`http://localhost:3005${listCall.endpoint}`, {
      headers: { 'X-Branch-Id': 'dps-main', ...listCall.headers }
    });
    const { data: apiData, total: apiTotal } = await apiResponse.json();
    
    // Validate
    expect(tableData.totalRows).toBe(Math.min(apiData.length, 25)); // Default page size
    expect(tableData.paginationInfo?.total).toBe(apiTotal);
  });

  test('should handle pagination correctly', async ({ page }) => {
    // Test pagination, filtering, sorting...
  });
});
```

### Template 3: Form/Detail Pages

**Use Case:** Pages with forms, detail views, CRUD operations

**Network Monitoring Script:**
```javascript
// form-network-monitor.js
window.formApiCalls = [];
window.originalFetch = window.fetch;
window.fetch = function(...args) {
  const callInfo = {
    type: 'form-api',
    url: args[0],
    method: (args[1] || {}).method || 'GET',
    headers: (args[1] || {}).headers || {},
    body: (args[1] || {}).body,
    timestamp: new Date().toISOString(),
    isWrite: ['POST', 'PUT', 'PATCH', 'DELETE'].includes((args[1] || {}).method)
  };
  window.formApiCalls.push(callInfo);
  return window.originalFetch.apply(this, args);
};

// Helper to extract form data
window.extractFormData = () => {
  const form = document.querySelector('form');
  if (!form) return {};

  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  return data;
};

// Helper to extract displayed values
window.extractDisplayedValues = () => {
  const values = {};
  
  // Common display patterns
  const selectors = [
    '[data-testid*="display"]',
    '.display-value',
    '.readonly-field',
    'dd', // Definition list values
    '.field-value'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, index) => {
      const label = el.getAttribute('data-testid') || 
                   el.previousElementSibling?.textContent || 
                   `field_${index}`;
      values[label] = el.textContent?.trim();
    });
  });

  return values;
};
```

**E2E Test Template:**
```typescript
// test/e2e/[module]-form-accuracy.spec.ts
import { test, expect } from '@playwright/test';

test.describe('[Module] Form/Detail Accuracy', () => {
  test('should display data matching API response', async ({ page }) => {
    const recordId = 'test-record-id';
    await page.goto(`/admin/[module]/${recordId}`);
    await page.addScriptTag({ path: 'test/utils/form-network-monitor.js' });
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Extract displayed values
    const displayedValues = await page.evaluate(() => window.extractDisplayedValues());
    
    // Get API response directly
    const apiResponse = await fetch(`http://localhost:3005/api/v1/[module]/${recordId}`, {
      headers: { 'X-Branch-Id': 'dps-main' }
    });
    const { data: apiData } = await apiResponse.json();
    
    // Compare key fields
    Object.keys(displayedValues).forEach(key => {
      if (apiData[key] !== undefined) {
        expect(displayedValues[key]).toBe(String(apiData[key]));
      }
    });
  });

  test('should handle form submissions correctly', async ({ page }) => {
    // Test form submission, validation, error handling...
  });
});
```

### Template 4: Analytics/Report Pages

**Use Case:** Pages with charts, graphs, analytics data

**Network Monitoring Script:**
```javascript
// analytics-network-monitor.js
window.analyticsApiCalls = [];
window.chartData = {};

// Monitor fetch calls
window.originalFetch = window.fetch;
window.fetch = function(...args) {
  const callInfo = {
    type: 'analytics-api',
    url: args[0],
    method: (args[1] || {}).method || 'GET',
    headers: (args[1] || {}).headers || {},
    timestamp: new Date().toISOString(),
    isAnalytics: args[0].includes('analytics') || args[0].includes('reports')
  };
  window.analyticsApiCalls.push(callInfo);
  
  // Store response for charts
  return window.originalFetch.apply(this, args).then(response => {
    if (callInfo.isAnalytics) {
      response.clone().json().then(data => {
        window.chartData[args[0]] = data;
      });
    }
    return response;
  });
};

// Helper to extract chart data
window.extractChartData = () => {
  const charts = {};
  
  // Look for common chart libraries
  const chartSelectors = [
    'canvas', // Chart.js, D3
    '.recharts-wrapper', // Recharts
    '[data-testid*="chart"]',
    '.chart-container'
  ];

  chartSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((chart, index) => {
      const chartId = chart.id || chart.getAttribute('data-testid') || `chart_${index}`;
      
      // Try to extract data from common chart libraries
      if (chart.tagName === 'CANVAS') {
        // Chart.js or similar
        const ctx = chart.getContext('2d');
        if (ctx && ctx.chart) {
          charts[chartId] = ctx.chart.data;
        }
      }
      
      // For Recharts, data is usually in React props
      const reactKey = Object.keys(chart).find(key => key.startsWith('__reactInternalInstance'));
      if (reactKey && chart[reactKey]) {
        const props = chart[reactKey].memoizedProps;
        if (props && props.data) {
          charts[chartId] = props.data;
        }
      }
    });
  });

  return charts;
};
```

**E2E Test Template:**
```typescript
// test/e2e/[module]-analytics-accuracy.spec.ts
import { test, expect } from '@playwright/test';

test.describe('[Module] Analytics Data Accuracy', () => {
  test('should display charts matching analytics API', async ({ page }) => {
    await page.goto('/admin/analytics/[module]');
    await page.addScriptTag({ path: 'test/utils/analytics-network-monitor.js' });
    
    // Wait for charts to render
    await page.waitForSelector('[data-testid*="chart"]', { timeout: 15000 });
    await page.waitForTimeout(2000); // Allow charts to fully render
    
    // Extract chart data
    const chartData = await page.evaluate(() => window.extractChartData());
    const apiCalls = await page.evaluate(() => window.analyticsApiCalls);
    
    // Validate each analytics API call
    const analyticsApis = apiCalls.filter(call => call.isAnalytics);
    
    for (const apiCall of analyticsApis) {
      // Make direct API call
      const response = await fetch(apiCall.url, {
        headers: { 'X-Branch-Id': 'dps-main', ...apiCall.headers }
      });
      const apiData = await response.json();
      
      // Find corresponding chart
      const chartKey = Object.keys(chartData).find(key => 
        chartData[key] && JSON.stringify(chartData[key]).includes(JSON.stringify(apiData.data))
      );
      
      expect(chartKey).toBeDefined();
    }
  });

  test('should handle date range filters in analytics', async ({ page }) => {
    // Test date filters, aggregations, drill-downs...
  });
});
```

---

## 🔧 Common Helper Functions

### Data Extraction Utilities
```typescript
// test/utils/extraction-helpers.ts
export function extractNumber(text: string): number {
  const cleaned = text.replace(/[₹,$%LKM]/g, '').trim();
  
  if (text.includes('L')) return parseFloat(cleaned) * 100000;      // Lakhs
  if (text.includes('K')) return parseFloat(cleaned) * 1000;       // Thousands  
  if (text.includes('M')) return parseFloat(cleaned) * 1000000;    // Millions
  
  return parseFloat(cleaned) || 0;
}

export function extractPercentage(text: string): number {
  const match = text.match(/(\d+(?:\.\d+)?)%/);
  return match ? parseFloat(match[1]) : 0;
}

export function extractCurrency(text: string): number {
  const cleaned = text.replace(/[₹,$]/g, '');
  return extractNumber(cleaned);
}

export async function waitForApiCalls(page: any, expectedCalls: number, timeout = 10000): Promise<any[]> {
  return page.waitForFunction(
    (count) => window.apiCalls && window.apiCalls.length >= count,
    expectedCalls,
    { timeout }
  ).then(() => page.evaluate(() => window.apiCalls));
}
```

### API Testing Utilities
```typescript
// test/utils/api-helpers.ts
export async function makeApiCall(endpoint: string, options: {
  branchId?: string;
  method?: string;
  body?: any;
  params?: Record<string, string>;
} = {}) {
  const { branchId = 'dps-main', method = 'GET', body, params = {} } = options;
  
  const url = new URL(`http://localhost:3005/api/v1${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'X-Branch-Id': branchId,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function validateApiResponse(response: any, expectedStructure: any) {
  Object.keys(expectedStructure).forEach(key => {
    expect(response).toHaveProperty(key);
    if (typeof expectedStructure[key] === 'object') {
      validateApiResponse(response[key], expectedStructure[key]);
    }
  });
}
```

---

## 📋 Page-Specific Checklists

### Dashboard Pages ✅
- [ ] All summary statistics match API responses
- [ ] Charts display correct data points
- [ ] Date filters trigger correct API calls
- [ ] Branch selection updates all metrics
- [ ] Performance metrics are reasonable

### List Pages ✅
- [ ] Table row count matches API total
- [ ] Pagination info is accurate
- [ ] Sorting triggers correct API calls
- [ ] Filters work correctly
- [ ] Search functionality validated

### Form Pages ✅
- [ ] Displayed values match API response
- [ ] Form submissions send correct data
- [ ] Validation messages are appropriate
- [ ] Error handling is graceful
- [ ] Success states are correct

### Analytics Pages ✅
- [ ] Chart data matches analytics APIs
- [ ] Aggregations are mathematically correct
- [ ] Date ranges filter properly
- [ ] Drill-down functionality works
- [ ] Export features validated

---

This template library provides ready-to-use patterns for testing any page type in your application systematically and thoroughly! 🚀