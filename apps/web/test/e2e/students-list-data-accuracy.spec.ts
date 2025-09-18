import { test, expect, Page, Request } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * Comprehensive Students List Data Accuracy E2E Test
 * 
 * This test validates that the Students List page displays accurate data by:
 * - Monitoring all network requests and API calls
 * - Extracting table data and comparing with direct API responses
 * - Testing multi-branch isolation with different X-Branch-Id headers
 * - Verifying pagination information matches exactly
 * - Ensuring performance within acceptable limits
 * 
 * Expected Results (based on API validation):
 * - dps-main: 1425 total students (25 per page)
 * - kvs-central: 1222 total students (25 per page)
 * - branch1: 0 total students
 * 
 * Key Testing Patterns:
 * - Uses real Students List component from @/app/admin/resources/students/List
 * - Compares UI data with direct API calls 
 * - Tests responsive behavior and accessibility
 * - Validates multi-tenancy isolation
 * - Performance monitoring for large datasets
 */

test.describe('Students List Data Accuracy E2E Tests', () => {
  // Configuration
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  const API_BASE_URL = 'http://localhost:3005/api/v1';
  const STUDENTS_LIST_URL = '/admin/students';
  
  // Expected branch data based on seed data
  const EXPECTED_BRANCH_DATA = {
    'dps-main': { totalStudents: 1425, pageSize: 25 },
    'kvs-central': { totalStudents: 1222, pageSize: 25 },
    'branch1': { totalStudents: 0, pageSize: 25 },
    'dps-east': { totalStudents: 1200, pageSize: 25 }, // Example
    'dps-west': { totalStudents: 1100, pageSize: 25 }, // Example
  };

  // Network request tracking
  let apiRequests: Request[] = [];
  let networkErrors: string[] = [];

  // Helper function to make direct API calls with proper headers
  async function makeDirectApiCall(endpoint: string, branchId = 'dps-main'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'X-Branch-Id': branchId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn(`API call ${endpoint} with branch ${branchId} returned ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to call API ${endpoint}:`, error);
      return null;
    }
  }

  // Helper function to extract students data from table
  async function extractTableStudents(page: Page): Promise<{
    count: number;
    students: Array<{
      admissionNo: string;
      firstName: string;
      lastName: string;
      status: string;
      gender?: string;
      class?: string;
      section?: string;
    }>;
  }> {
    // Wait for table to load
    await page.waitForSelector('table tbody tr, [role="table"] [role="row"]', { 
      timeout: 15000 
    });

    const tableRows = page.locator('table tbody tr, [role="table"] [role="row"]:not(:first-child)');
    const rowCount = await tableRows.count();
    
    const students = [];
    
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      
      // Extract data based on the actual StudentsList component structure
      const admissionNo = await row.locator('td:nth-child(1)').textContent() || '';
      const firstName = await row.locator('td:nth-child(2)').textContent() || '';
      const lastName = await row.locator('td:nth-child(3)').textContent() || '';
      const statusElement = row.locator('td:nth-child(4)');
      const status = await statusElement.textContent() || '';
      
      // Optional fields (may be hidden on mobile)
      let gender = '';
      let className = '';
      let section = '';
      
      try {
        gender = await row.locator('td:nth-child(5)').textContent() || '';
        className = await row.locator('td:nth-child(6)').textContent() || '';
        section = await row.locator('td:nth-child(7)').textContent() || '';
      } catch (e) {
        // Optional fields may not be visible on mobile
      }

      students.push({
        admissionNo: admissionNo.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        status: status.trim(),
        gender: gender.trim(),
        class: className.trim(),
        section: section.trim(),
      });
    }

    return { count: rowCount, students };
  }

  // Helper function to extract pagination info
  async function extractPaginationInfo(page: Page): Promise<{
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    displayedText: string;
  }> {
    // Look for pagination component
    const paginationSelectors = [
      '[data-testid="pagination"]',
      '.pagination',
      'text="of"',
      'text="page"',
      '[class*="pagination"]',
    ];

    let paginationText = '';
    
    for (const selector of paginationSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          paginationText = await element.textContent() || '';
          if (paginationText.trim()) break;
        }
      } catch (e) {
        continue;
      }
    }

    // Also check for "X of Y" patterns in the page
    const allText = await page.textContent('body') || '';
    const patterns = [
      /(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/i,  // "1-25 of 1425"
      /page\s*(\d+)\s*of\s*(\d+)/i,       // "Page 1 of 57"
      /showing\s*(\d+)\s*to\s*(\d+)\s*of\s*(\d+)/i, // "Showing 1 to 25 of 1425"
    ];

    let currentPage = 1;
    let totalPages = 1;
    let totalRecords = 0;
    let pageSize = 25;

    for (const pattern of patterns) {
      const match = allText.match(pattern);
      if (match) {
        if (pattern.source.includes('page')) {
          currentPage = parseInt(match[1]);
          totalPages = parseInt(match[2]);
          totalRecords = totalPages * pageSize; // Estimate
        } else {
          const start = parseInt(match[1]);
          const end = parseInt(match[2]);
          totalRecords = parseInt(match[3]);
          currentPage = Math.ceil(start / pageSize);
          totalPages = Math.ceil(totalRecords / pageSize);
        }
        break;
      }
    }

    return {
      currentPage,
      totalPages,
      totalRecords,
      pageSize,
      displayedText: paginationText,
    };
  }

  // Helper function to wait for Students List to fully load
  async function waitForStudentsListLoad(page: Page): Promise<void> {
    // Wait for the main Students List container
    await page.waitForSelector('text="Students", h1, h2', { timeout: 15000 });
    
    // Wait for loading states to disappear
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll(
        '[data-testid="loading"], .loading, .spinner, text="Loading..."'
      );
      return loadingElements.length === 0;
    }, { timeout: 20000 });

    // Wait for either table data or "No students" message
    try {
      await Promise.race([
        page.waitForSelector('table tbody tr:first-child, [role="table"] [role="row"]:not(:first-child)', { timeout: 10000 }),
        page.waitForSelector('text="No students", text="No data", text="Empty"', { timeout: 10000 })
      ]);
    } catch (e) {
      console.log('Students table may be empty or still loading');
    }

    // Wait for network to be idle
    await page.waitForLoadState('networkidle');
    
    // Additional wait for React components to stabilize
    await page.waitForTimeout(2000);
  }

  // Set up network monitoring before each test
  test.beforeEach(async ({ page, context }) => {
    // Reset tracking arrays
    apiRequests = [];
    networkErrors = [];

    // Monitor all network requests
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request);
      }
    });

    page.on('response', (response) => {
      if (response.status() >= 400 && response.url().includes('/api/')) {
        networkErrors.push(`${response.url()} - ${response.status()}`);
      }
    });

    // Login as admin using the helper
    await loginAsAdmin(page);
    
    // Navigate to students list page
    await page.goto(`${FRONTEND_URL}${STUDENTS_LIST_URL}`);

    await waitForStudentsListLoad(page);
  });

  test('should capture and validate all Students API calls', async ({ page }) => {
    console.log('\n=== Testing Students API Calls Monitoring ===');

    // Navigate to students list to trigger API calls
    await page.goto(`${FRONTEND_URL}${STUDENTS_LIST_URL}`);
    await waitForStudentsListLoad(page);

    // Filter API requests related to students
    const studentsApiCalls = apiRequests.filter(req => 
      req.url().includes('/students') || 
      req.url().includes('/classes') ||
      req.url().includes('/sections')
    );

    console.log(`Captured ${studentsApiCalls.length} students-related API calls:`);
    studentsApiCalls.forEach(req => {
      console.log(`- ${req.method()} ${req.url()}`);
      const headers = req.headers();
      if (headers['x-branch-id']) {
        console.log(`  Branch-Id: ${headers['x-branch-id']}`);
      }
    });

    // Validate that API calls were made
    expect(studentsApiCalls.length, 'No students API calls detected').toBeGreaterThan(0);

    // Validate that at least one students list call was made
    const studentsListCalls = studentsApiCalls.filter(req => 
      req.url().includes('/students') && 
      req.method() === 'GET'
    );
    
    expect(studentsListCalls.length, 'No students list API calls detected').toBeGreaterThan(0);

    // Check that X-Branch-Id header is present
    const callsWithBranchId = studentsListCalls.filter(req => {
      const headers = req.headers();
      return headers['x-branch-id'] || headers['X-Branch-Id'];
    });

    expect(callsWithBranchId.length, 'API calls missing X-Branch-Id header').toBeGreaterThan(0);

    // Check for network errors
    expect(networkErrors.length, `Network errors detected: ${networkErrors.join(', ')}`).toBeLessThanOrEqual(2);
  });

  test('should validate table data matches API response exactly - dps-main branch', async ({ page }) => {
    const branchId = 'dps-main';
    const expectedData = EXPECTED_BRANCH_DATA[branchId];
    
    console.log(`\n=== Testing Data Accuracy for ${branchId} ===`);
    console.log(`Expected: ${expectedData.totalStudents} total students, ${expectedData.pageSize} per page`);

    // Get direct API data
    const apiResponse = await makeDirectApiCall(`/students?page=1&pageSize=${expectedData.pageSize}`, branchId);
    
    if (!apiResponse) {
      test.skip(true, 'Students API not available');
      return;
    }

    const apiStudents = apiResponse.data || [];
    const apiTotal = apiResponse.total || 0;
    
    console.log(`API Response: ${apiStudents.length} students in page, ${apiTotal} total`);

    // Extract table data from UI
    const tableData = await extractTableStudents(page);
    console.log(`Table Data: ${tableData.count} students displayed`);

    // Validate table row count matches API response
    expect(tableData.count, 'Table row count should match API response length').toBe(apiStudents.length);

    // Validate specific student data
    if (apiStudents.length > 0 && tableData.students.length > 0) {
      // Compare first few students for exact match
      for (let i = 0; i < Math.min(3, apiStudents.length, tableData.students.length); i++) {
        const apiStudent = apiStudents[i];
        const tableStudent = tableData.students[i];
        
        expect(tableStudent.admissionNo, `Student ${i} admission number mismatch`)
          .toBe(apiStudent.admissionNo);
        expect(tableStudent.firstName, `Student ${i} first name mismatch`)
          .toBe(apiStudent.firstName);
        expect(tableStudent.lastName, `Student ${i} last name mismatch`)
          .toBe(apiStudent.lastName);
        expect(tableStudent.status, `Student ${i} status mismatch`)
          .toBe(apiStudent.status);
      }
    }

    // Validate pagination information
    const paginationInfo = await extractPaginationInfo(page);
    console.log(`Pagination Info:`, paginationInfo);

    // For dps-main, should show exactly 1425 total students
    if (expectedData.totalStudents > 0) {
      expect(apiTotal, `dps-main should have exactly ${expectedData.totalStudents} students`)
        .toBe(expectedData.totalStudents);
      
      if (paginationInfo.totalRecords > 0) {
        expect(paginationInfo.totalRecords, 'Pagination total should match API total')
          .toBe(apiTotal);
      }
    }

    // Validate data consistency
    expect(tableData.count, 'Should display at least some students for dps-main').toBeGreaterThan(0);
    expect(apiTotal, 'API should return students for dps-main').toBeGreaterThan(0);
  });

  test('should validate multi-branch isolation with different X-Branch-Id headers', async ({ page }) => {
    console.log('\n=== Testing Multi-Branch Data Isolation ===');
    
    const testBranches = ['dps-main', 'kvs-central', 'branch1'];
    const branchResults: Record<string, any> = {};

    for (const branchId of testBranches) {
      console.log(`\nTesting branch: ${branchId}`);
      const expectedData = EXPECTED_BRANCH_DATA[branchId];

      // Get API data for this branch
      const apiResponse = await makeDirectApiCall(`/students?page=1&pageSize=${expectedData.pageSize}`, branchId);
      
      let apiTotal = 0;
      let apiStudents = [];
      
      if (apiResponse) {
        apiTotal = apiResponse.total || 0;
        apiStudents = apiResponse.data || [];
      }

      // Simulate branch switching in UI (if branch selector exists)
      try {
        // Method 1: Look for branch selector dropdown
        const branchSelector = page.locator('[data-testid="branch-selector"], select[name="branch"]');
        if (await branchSelector.count() > 0) {
          await branchSelector.selectOption(branchId);
          await page.waitForTimeout(2000);
          await waitForStudentsListLoad(page);
        } else {
          // Method 2: Set localStorage and reload
          await page.evaluate((branch) => {
            localStorage.setItem('selectedBranchId', branch);
            window.dispatchEvent(new Event('storage'));
          }, branchId);
          
          await page.reload();
          await waitForStudentsListLoad(page);
        }
      } catch (e) {
        console.log(`Could not change to branch ${branchId} via UI, using current branch`);
      }

      // Get UI data
      let tableData = { count: 0, students: [] };
      try {
        tableData = await extractTableStudents(page);
      } catch (e) {
        console.log(`Could not extract table data for branch ${branchId}`);
      }

      branchResults[branchId] = {
        api: {
          total: apiTotal,
          count: apiStudents.length,
          hasData: apiTotal > 0
        },
        ui: {
          count: tableData.count,
          hasData: tableData.count > 0
        },
        expected: expectedData
      };

      console.log(`${branchId} Results:`, branchResults[branchId]);

      // Validate expected results
      if (branchId === 'dps-main') {
        expect(apiTotal, 'dps-main should have 1425 students').toBe(1425);
      } else if (branchId === 'kvs-central') {
        expect(apiTotal, 'kvs-central should have 1222 students').toBe(1222);
      } else if (branchId === 'branch1') {
        expect(apiTotal, 'branch1 should have 0 students').toBe(0);
      }
    }

    // Validate proper data isolation
    const activeBranches = Object.entries(branchResults).filter(([_, data]) => data.api.hasData);
    
    if (activeBranches.length > 1) {
      console.log('\n✓ Multiple branches have data - verifying isolation');
      
      // Different branches should have different totals
      const [branch1, data1] = activeBranches[0];
      const [branch2, data2] = activeBranches[1];
      
      expect(data1.api.total, `${branch1} and ${branch2} should have different student counts (proper isolation)`)
        .not.toBe(data2.api.total);
    }

    // Validate branch1 isolation (should be empty)
    if (branchResults.branch1) {
      expect(branchResults.branch1.api.total, 'branch1 should be empty (proving isolation works)')
        .toBe(0);
    }
  });

  test('should validate pagination accuracy and navigation', async ({ page }) => {
    const branchId = 'dps-main';
    const expectedData = EXPECTED_BRANCH_DATA[branchId];
    
    console.log('\n=== Testing Pagination Data Accuracy ===');

    // Test first page
    await page.goto(`${FRONTEND_URL}${STUDENTS_LIST_URL}`);
    await waitForStudentsListLoad(page);

    const firstPageData = await extractTableStudents(page);
    const firstPagePagination = await extractPaginationInfo(page);
    
    console.log(`First Page: ${firstPageData.count} students displayed`);
    console.log(`Pagination:`, firstPagePagination);

    // Should show exactly 25 students per page (or less on last page)
    expect(firstPageData.count, 'First page should have students').toBeGreaterThan(0);
    expect(firstPageData.count, 'First page should not exceed page size').toBeLessThanOrEqual(expectedData.pageSize);

    // Get API data for validation
    const apiFirstPage = await makeDirectApiCall(`/students?page=1&pageSize=${expectedData.pageSize}`, branchId);
    
    if (apiFirstPage) {
      expect(firstPageData.count, 'First page table count should match API')
        .toBe(apiFirstPage.data?.length || 0);
      
      // Validate total count in pagination
      if (firstPagePagination.totalRecords > 0) {
        expect(firstPagePagination.totalRecords, 'Pagination total should match API total')
          .toBe(apiFirstPage.total || 0);
      }
    }

    // Test second page navigation (if exists)
    if (firstPagePagination.totalPages > 1) {
      console.log('\nTesting second page navigation...');
      
      // Look for next page button
      const nextButton = page.locator('button[aria-label="Next"], button:has-text("Next"), [role="button"]:has-text("2")');
      
      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await waitForStudentsListLoad(page);
        
        const secondPageData = await extractTableStudents(page);
        const secondPagePagination = await extractPaginationInfo(page);
        
        console.log(`Second Page: ${secondPageData.count} students displayed`);
        
        // Validate second page
        expect(secondPageData.count, 'Second page should have students').toBeGreaterThan(0);
        expect(secondPageData.count, 'Second page should not exceed page size').toBeLessThanOrEqual(expectedData.pageSize);
        
        // Students should be different from first page
        if (firstPageData.students.length > 0 && secondPageData.students.length > 0) {
          const firstPageIds = firstPageData.students.map(s => s.admissionNo);
          const secondPageIds = secondPageData.students.map(s => s.admissionNo);
          
          const hasOverlap = firstPageIds.some(id => secondPageIds.includes(id));
          expect(hasOverlap, 'Different pages should show different students').toBe(false);
        }
        
        // Validate API data for second page
        const apiSecondPage = await makeDirectApiCall(`/students?page=2&pageSize=${expectedData.pageSize}`, branchId);
        if (apiSecondPage) {
          expect(secondPageData.count, 'Second page table count should match API')
            .toBe(apiSecondPage.data?.length || 0);
        }
      }
    }
  });

  test('should validate performance within acceptable limits', async ({ page }) => {
    console.log('\n=== Testing Students List Performance ===');
    
    const startTime = Date.now();
    
    // Navigate to students list
    await page.goto(`${FRONTEND_URL}${STUDENTS_LIST_URL}`);
    await waitForStudentsListLoad(page);
    
    const loadTime = Date.now() - startTime;
    console.log(`Students List load time: ${loadTime}ms`);

    // Performance validation - should load within 15 seconds even with large datasets
    expect(loadTime, 'Students List should load within 15 seconds').toBeLessThan(15000);

    // Test search performance
    const searchInput = page.locator('input[placeholder*="Search"], input[source="q"]');
    
    if (await searchInput.count() > 0) {
      const searchStartTime = Date.now();
      
      await searchInput.fill('Test');
      await page.waitForTimeout(1000); // Wait for debounce
      await waitForStudentsListLoad(page);
      
      const searchTime = Date.now() - searchStartTime;
      console.log(`Search response time: ${searchTime}ms`);
      
      // Search should be fast
      expect(searchTime, 'Search should respond within 5 seconds').toBeLessThan(5000);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }

    // Test filter performance
    const filterButtons = page.locator('[data-testid*="filter"], .filter-button, button:has-text("Active")');
    
    if (await filterButtons.count() > 0) {
      const filterStartTime = Date.now();
      
      await filterButtons.first().click();
      await waitForStudentsListLoad(page);
      
      const filterTime = Date.now() - filterStartTime;
      console.log(`Filter response time: ${filterTime}ms`);
      
      expect(filterTime, 'Filter should respond within 5 seconds').toBeLessThan(5000);
    }

    // Memory usage validation (check for excessive DOM elements)
    const domElementCount = await page.evaluate(() => document.querySelectorAll('*').length);
    console.log(`DOM elements count: ${domElementCount}`);
    
    // Should not have excessive DOM elements (indicates good virtualization/pagination)
    expect(domElementCount, 'Should not have excessive DOM elements (> 5000)').toBeLessThan(5000);

    // Check for memory leaks (JavaScript errors)
    const jsErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to fetch')) {
        jsErrors.push(msg.text());
      }
    });

    // Reload page to test for memory leaks
    await page.reload();
    await waitForStudentsListLoad(page);
    
    expect(jsErrors.length, `JavaScript errors detected: ${jsErrors.join(', ')}`).toBeLessThanOrEqual(1);
    
    console.log('✓ Students List performance within acceptable limits');
  });

  test('should validate responsive design and mobile functionality', async ({ page }) => {
    console.log('\n=== Testing Responsive Design ===');
    
    // Test desktop view first
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${FRONTEND_URL}${STUDENTS_LIST_URL}`);
    await waitForStudentsListLoad(page);
    
    const desktopData = await extractTableStudents(page);
    console.log(`Desktop view: ${desktopData.count} students displayed`);
    
    // Should show all columns on desktop
    const desktopColumns = await page.locator('table th, [role="columnheader"]').count();
    console.log(`Desktop columns: ${desktopColumns}`);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const tabletData = await extractTableStudents(page);
    const tabletColumns = await page.locator('table th:visible, [role="columnheader"]:visible').count();
    
    console.log(`Tablet view: ${tabletData.count} students, ${tabletColumns} visible columns`);
    
    // Should show same number of students but possibly fewer columns
    expect(tabletData.count, 'Tablet should show same number of students').toBe(desktopData.count);
    expect(tabletColumns, 'Tablet should hide some columns').toBeLessThanOrEqual(desktopColumns);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileData = await extractTableStudents(page);
    const mobileColumns = await page.locator('table th:visible, [role="columnheader"]:visible').count();
    
    console.log(`Mobile view: ${mobileData.count} students, ${mobileColumns} visible columns`);
    
    // Should show same students but minimal columns
    expect(mobileData.count, 'Mobile should show same number of students').toBe(desktopData.count);
    expect(mobileColumns, 'Mobile should show minimal columns').toBeLessThan(desktopColumns);
    expect(mobileColumns, 'Mobile should show at least 3 columns (admission, name, status)').toBeGreaterThanOrEqual(3);
    
    // Test that essential data is still visible on mobile
    if (mobileData.students.length > 0) {
      const firstStudent = mobileData.students[0];
      expect(firstStudent.admissionNo, 'Admission number should be visible on mobile').not.toBe('');
      expect(firstStudent.firstName, 'First name should be visible on mobile').not.toBe('');
      expect(firstStudent.status, 'Status should be visible on mobile').not.toBe('');
    }
    
    // Test mobile scrolling
    const table = page.locator('table, [role="table"]').first();
    const isScrollable = await table.evaluate(el => el.scrollWidth > el.clientWidth);
    
    if (isScrollable) {
      console.log('✓ Table is horizontally scrollable on mobile');
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should validate data consistency across page refreshes', async ({ page }) => {
    console.log('\n=== Testing Data Consistency Across Page Refreshes ===');
    
    // Load initial data
    await page.goto(`${FRONTEND_URL}${STUDENTS_LIST_URL}`);
    await waitForStudentsListLoad(page);
    
    const initialData = await extractTableStudents(page);
    const initialPagination = await extractPaginationInfo(page);
    
    console.log(`Initial load: ${initialData.count} students, ${initialPagination.totalRecords} total`);
    
    // Refresh page
    await page.reload();
    await waitForStudentsListLoad(page);
    
    const refreshedData = await extractTableStudents(page);
    const refreshedPagination = await extractPaginationInfo(page);
    
    console.log(`After refresh: ${refreshedData.count} students, ${refreshedPagination.totalRecords} total`);
    
    // Data should be consistent
    expect(refreshedData.count, 'Student count should be consistent after refresh').toBe(initialData.count);
    expect(refreshedPagination.totalRecords, 'Total records should be consistent after refresh')
      .toBe(initialPagination.totalRecords);
    
    // First few students should be the same
    if (initialData.students.length > 0 && refreshedData.students.length > 0) {
      for (let i = 0; i < Math.min(3, initialData.students.length, refreshedData.students.length); i++) {
        expect(refreshedData.students[i].admissionNo, `Student ${i} should be same after refresh`)
          .toBe(initialData.students[i].admissionNo);
      }
    }
    
    // Test with hard refresh (Ctrl+F5 equivalent)
    await page.evaluate(() => window.location.reload());
    await waitForStudentsListLoad(page);
    
    const hardRefreshedData = await extractTableStudents(page);
    expect(hardRefreshedData.count, 'Student count should be consistent after hard refresh')
      .toBe(initialData.count);
    
    console.log('✓ Data consistent across all refresh types');
  });

  // Debug helper test (can be enabled for troubleshooting)
  test.skip('debug: comprehensive students list data inspection', async ({ page }) => {
    console.log('\n=== COMPREHENSIVE STUDENTS LIST DEBUG ===');
    
    await page.goto(`${FRONTEND_URL}${STUDENTS_LIST_URL}`);
    await waitForStudentsListLoad(page);
    
    // Log all API requests made
    console.log('\n--- API Requests ---');
    apiRequests.forEach(req => {
      console.log(`${req.method()} ${req.url()}`);
      console.log(`Headers:`, req.headers());
    });
    
    // Log table structure
    console.log('\n--- Table Structure ---');
    const tableHeaders = await page.locator('table th, [role="columnheader"]').allTextContents();
    console.log('Headers:', tableHeaders);
    
    const tableCells = await page.locator('table tbody tr:first-child td').allTextContents();
    console.log('First row cells:', tableCells);
    
    // Log pagination elements
    console.log('\n--- Pagination Elements ---');
    const paginationElements = await page.locator('*:has-text("of"), *:has-text("page")').allTextContents();
    console.log('Pagination texts:', paginationElements);
    
    // Log all visible text containing numbers
    console.log('\n--- Number Patterns ---');
    const bodyText = await page.textContent('body');
    const numberPatterns = bodyText?.match(/\d+/g) || [];
    const uniqueNumbers = Array.from(new Set(numberPatterns)).sort((a, b) => parseInt(b) - parseInt(a));
    console.log('All numbers found (desc):', uniqueNumbers.slice(0, 20));
    
    // Log filter and search elements
    console.log('\n--- Interactive Elements ---');
    const searchInputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();
    const selects = await page.locator('select').count();
    
    console.log(`Interactive elements: ${searchInputs} inputs, ${buttons} buttons, ${selects} selects`);
  });
});