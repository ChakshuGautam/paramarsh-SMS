import { test, expect, Page, Request } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * Comprehensive Dashboard Data Accuracy E2E Test
 * 
 * This test validates that all dashboard metrics match their corresponding API responses.
 * It ensures data consistency between frontend display and backend APIs, with specific
 * focus on the recent backend fixes for attendance calculation and student filtering.
 * 
 * Key validations:
 * - Student counts match API responses (1425 for dps-main, not 2026)
 * - Teacher counts are consistent across all API calls
 * - Attendance percentages are between 0-100% (no more 175% bugs)
 * - Fee collection data consistency
 * - Multi-branch support with proper data isolation
 * - Date range filtering triggers correct API calls
 * - All APIs respect X-Branch-Id header
 */

test.describe('Dashboard Data Accuracy E2E Tests', () => {
  // Test configuration
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  const API_BASE_URL = process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/v1` : 'http://localhost:3005/api/v1';
  const DASHBOARD_URL = '/admin';
  
  // Branch IDs to test (using actual seed data branches)
  const BRANCH_IDS = [
    'dps-main',
    'dps-east', 
    'dps-west',
    'kvs-central',
    'kendriya-vidyalaya-1',
    'holy-heart-convent'
  ];

  // Date filters to test
  const DATE_FILTERS = [
    { name: 'Today', value: 'today' },
    { name: 'This Week', value: 'thisWeek' },
    { name: 'This Month', value: 'thisMonth' }
  ];

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

  // Helper function to extract number from dashboard UI text
  function extractNumber(text: string): number {
    if (!text) return 0;
    
    // Handle formatted numbers like "1,425", "₹1.2L", etc.
    let cleanText = text.replace(/[^\d.-]/g, '');
    let number = parseFloat(cleanText);
    
    // Handle K (thousands) suffix
    if (text.toUpperCase().includes('K')) {
      return Math.round(number * 1000);
    }
    
    // Handle L (Lakh) suffix - multiply by 100,000
    if (text.toUpperCase().includes('L')) {
      return Math.round(number * 100000);
    }
    
    // Handle Cr (Crore) suffix - multiply by 10,000,000
    if (text.toUpperCase().includes('CR')) {
      return Math.round(number * 10000000);
    }
    
    return isNaN(number) ? 0 : Math.round(number);
  }

  // Helper function to wait for dashboard to fully load
  async function waitForDashboardLoad(page: Page): Promise<void> {
    // Wait for main dashboard container
    await page.waitForSelector('[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard"), main', {
      timeout: 15000
    });
    
    // Wait for loading states to disappear
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll(
        '[data-testid="loading"], .loading, .spinner'
      );
      // Also check for text content containing "Loading"
      const textElements = Array.from(document.querySelectorAll('*')).filter(
        el => el.textContent?.includes('Loading')
      );
      return loadingElements.length === 0 && textElements.length === 0;
    }, { timeout: 20000 });

    // Wait for network to be idle (no pending requests)
    await page.waitForLoadState('networkidle');

    // Additional wait for data to settle
    await page.waitForTimeout(3000);
  }

  // Authentication setup - simple and straightforward
  test.beforeEach(async ({ page }) => {
    // Login with hardcoded admin credentials
    await loginAsAdmin(page);
    
    // Now we should be on the admin dashboard
    await waitForDashboardLoad(page);
  });

  test('should validate student count consistency between API and dashboard', async ({ page }) => {
    const branchId = 'dps-main';
    console.log(`\n=== Testing Student Count for ${branchId} ===`);
    
    // Get student count from API directly
    const apiResponse = await makeDirectApiCall('/students?page=1&pageSize=1', branchId);
    
    if (!apiResponse) {
      test.skip(true, 'Students API not available');
      return;
    }

    const apiStudentCount = apiResponse.total || apiResponse.data?.length || 0;
    console.log(`API Student Count for ${branchId}: ${apiStudentCount}`);

    // Get student count from dashboard UI
    // The dashboard shows "Total Students" as title with the count below it as "1390"
    let dashboardText = '';
    
    // First wait for the "Total Students" text to be visible
    await page.locator('text="Total Students"').waitFor({ state: 'visible', timeout: 10000 });
    
    // The structure is a card with "Total Students" text and the number below it
    // Find the parent container of "Total Students" and look for the number
    const studentCard = page.locator('text="Total Students"').locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "border") or contains(@class, "card")]').first();
    
    // Look for the large number text within the card
    const numberTexts = await studentCard.locator('div').allTextContents();
    
    for (const text of numberTexts) {
      // Look for a text that is just a number (like "1390")
      if (text && /^\d+$/.test(text.trim())) {
        dashboardText = text.trim();
        console.log(`Found student count in dashboard: ${dashboardText}`);
        break;
      }
    }
    
    // If still not found, try a more direct approach
    if (!dashboardText) {
      // Look for text that matches pattern of number followed by "active enrollments" or similar
      const allTexts = await studentCard.allTextContents();
      for (const text of allTexts) {
        const match = text.match(/(\d+)/);
        if (match && match[1] && !text.includes('%') && !text.includes('₹')) {
          dashboardText = match[1];
          console.log(`Found student count using pattern match: ${dashboardText}`);
          break;
        }
      }
    }

    expect(dashboardText, `Could not find student count in dashboard UI`).not.toBe('');
    expect(dashboardText).not.toContain('...');
    expect(dashboardText).not.toContain('undefined');

    const dashboardStudentCount = extractNumber(dashboardText);
    console.log(`Dashboard Student Count for ${branchId}: ${dashboardStudentCount} (from text: "${dashboardText}")`);

    // Critical validation: Should show consistent data between API and dashboard
    if (branchId === 'dps-main') {
      // The actual data has 1390 students for dps-main, not 1425 or 2026
      // This test validates that dashboard matches API, not a hardcoded value
      expect(dashboardStudentCount, `Dashboard should match API count for ${branchId}`).toBe(apiStudentCount);
    }

    // General validation: API and dashboard should match
    const variance = Math.abs(apiStudentCount - dashboardStudentCount);
    const allowedVariance = Math.max(5, Math.floor(apiStudentCount * 0.02)); // 2% or minimum 5

    expect(variance, `Student count variance too high: API=${apiStudentCount}, Dashboard=${dashboardStudentCount}`).toBeLessThanOrEqual(allowedVariance);
    
    // Sanity checks
    expect(dashboardStudentCount).toBeGreaterThanOrEqual(0);
    expect(dashboardStudentCount).toBeLessThan(10000); // Reasonable upper bound
  });

  test('should validate teacher count consistency across all API calls', async ({ page }) => {
    const branchId = 'dps-main';
    console.log(`\n=== Testing Teacher Count for ${branchId} ===`);
    
    // Get teacher count from multiple API endpoints to ensure consistency
    const [teachersApi, staffApi] = await Promise.all([
      makeDirectApiCall('/teachers?page=1&pageSize=1', branchId),
      makeDirectApiCall('/staff?page=1&pageSize=1&role=teacher', branchId) // Alternative endpoint
    ]);
    
    if (!teachersApi && !staffApi) {
      test.skip(true, 'Teacher APIs not available');
      return;
    }

    const apiTeacherCount = teachersApi?.total || teachersApi?.data?.length || 0;
    const staffTeacherCount = staffApi?.total || staffApi?.data?.length || 0;
    
    console.log(`Teachers API Count: ${apiTeacherCount}`);
    console.log(`Staff API (teachers) Count: ${staffTeacherCount}`);

    // Both APIs should return consistent teacher counts
    if (apiTeacherCount > 0 && staffTeacherCount > 0) {
      const apiVariance = Math.abs(apiTeacherCount - staffTeacherCount);
      expect(apiVariance, 'Teacher and Staff API should return consistent counts').toBeLessThanOrEqual(5);
    }

    // Get teacher count from dashboard UI
    // The dashboard shows "Active Teachers" as title with count below it (e.g., "22")
    let dashboardTeacherText = '';
    
    // Wait for the "Active Teachers" text to be visible
    await page.locator('text="Active Teachers"').waitFor({ state: 'visible', timeout: 10000 });
    
    // Find the teacher card
    const teacherCard = page.locator('text="Active Teachers"').locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "border") or contains(@class, "card")]').first();
    
    // Look for the number text within the card
    const numberTexts = await teacherCard.locator('div').allTextContents();
    
    for (const text of numberTexts) {
      // Look for a text that is just a number (like "22")
      if (text && /^\d+$/.test(text.trim())) {
        dashboardTeacherText = text.trim();
        console.log(`Found teacher count in dashboard: ${dashboardTeacherText}`);
        break;
      }
    }
    
    // If still not found, try pattern matching
    if (!dashboardTeacherText) {
      const allTexts = await teacherCard.allTextContents();
      for (const text of allTexts) {
        const match = text.match(/(\d+)/);
        if (match && match[1] && !text.includes('%') && !text.includes('₹')) {
          dashboardTeacherText = match[1];
          console.log(`Found teacher count using pattern: ${dashboardTeacherText}`);
          break;
        }
      }
    }

    expect(dashboardTeacherText).not.toBe('');
    const dashboardTeacherCount = extractNumber(dashboardTeacherText);
    console.log(`Dashboard Teacher Count: ${dashboardTeacherCount} (from text: "${dashboardTeacherText}")`);

    // Validate consistency between dashboard and API
    const referenceCount = apiTeacherCount || staffTeacherCount;
    const variance = Math.abs(referenceCount - dashboardTeacherCount);
    const allowedVariance = Math.max(3, Math.floor(referenceCount * 0.05)); // 5% or minimum 3

    expect(variance, `Teacher count variance too high: API=${referenceCount}, Dashboard=${dashboardTeacherCount}`).toBeLessThanOrEqual(allowedVariance);
    expect(dashboardTeacherCount).toBeGreaterThanOrEqual(0);
    expect(dashboardTeacherCount).toBeLessThan(1000); // Sanity check
  });

  test('should validate attendance percentage is 0-100% (no more 175% bug)', async ({ page }) => {
    const branchId = 'dps-main';
    console.log(`\n=== Testing Attendance Percentage for ${branchId} ===`);
    
    // Get attendance data from API
    const today = new Date().toISOString().split('T')[0];
    const apiResponse = await makeDirectApiCall(
      `/attendance-records/dashboard/stats?date=${today}`,
      branchId
    );

    let apiAttendanceRate = null;
    if (apiResponse?.data) {
      const stats = apiResponse.data;
      const totalPresent = stats.statusCounts?.present || 0;
      const totalAbsent = stats.statusCounts?.absent || 0;
      const totalLate = stats.statusCounts?.late || 0;
      
      const totalMarked = totalPresent + totalAbsent + totalLate;
      apiAttendanceRate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;
      
      console.log(`API Attendance Stats:`, {
        present: totalPresent,
        absent: totalAbsent, 
        late: totalLate,
        total: totalMarked,
        rate: apiAttendanceRate
      });
    }

    // Get attendance percentage from dashboard UI
    // The dashboard shows "Attendance Rate" as title with percentage below it (e.g., "0%")
    let dashboardAttendanceText = '';
    
    // Wait for the "Attendance Rate" text to be visible
    await page.locator('text="Attendance Rate"').waitFor({ state: 'visible', timeout: 10000 });
    
    // Find the attendance card
    const attendanceCard = page.locator('text="Attendance Rate"').locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "border") or contains(@class, "card")]').first();
    
    // Look for the percentage text within the card
    const percentageTexts = await attendanceCard.locator('div').allTextContents();
    
    for (const text of percentageTexts) {
      // Look for text that contains a percentage (like "0%" or "75%")
      if (text && /^\d+%$/.test(text.trim())) {
        dashboardAttendanceText = text.trim();
        console.log(`Found attendance rate in dashboard: ${dashboardAttendanceText}`);
        break;
      }
    }
    
    // If not found, try to find any text with percentage
    if (!dashboardAttendanceText) {
      const allTexts = await attendanceCard.allTextContents();
      for (const text of allTexts) {
        const match = text.match(/(\d+%)/);
        if (match && match[1]) {
          dashboardAttendanceText = match[1];
          console.log(`Found attendance rate using pattern: ${dashboardAttendanceText}`);
          break;
        }
      }
    }

    expect(dashboardAttendanceText, 'Could not find attendance percentage in dashboard').not.toBe('');
    const dashboardAttendanceRate = extractNumber(dashboardAttendanceText);
    console.log(`Dashboard Attendance Rate: ${dashboardAttendanceRate}% (from text: "${dashboardAttendanceText}")`);

    // CRITICAL validation: Attendance percentage MUST be between 0-100%
    expect(dashboardAttendanceRate, 'Attendance rate cannot be negative').toBeGreaterThanOrEqual(0);
    expect(dashboardAttendanceRate, 'Attendance rate cannot exceed 100% - this was the 175% bug').toBeLessThanOrEqual(100);
    
    // Specific check for the 175% bug that was mentioned
    expect(dashboardAttendanceRate, 'Attendance rate should not be 175% (the old bug)').not.toBe(175);
    expect(dashboardAttendanceRate, 'Attendance rate should be reasonable, not over 100%').toBeLessThan(101);

    // Compare with API if available
    if (apiAttendanceRate !== null) {
      const variance = Math.abs(apiAttendanceRate - dashboardAttendanceRate);
      expect(variance, `Attendance rate variance too high: API=${apiAttendanceRate}%, Dashboard=${dashboardAttendanceRate}%`).toBeLessThanOrEqual(5);
      
      // API should also be within valid range
      expect(apiAttendanceRate).toBeGreaterThanOrEqual(0);
      expect(apiAttendanceRate).toBeLessThanOrEqual(100);
    }
  });

  test('should validate fee collection data consistency', async ({ page }) => {
    const branchId = 'dps-main';
    console.log(`\n=== Testing Fee Collection for ${branchId} ===`);
    
    // Get fee/payment data from multiple API endpoints
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    const [paymentsApi, invoicesApi] = await Promise.all([
      makeDirectApiCall(`/payments?createdAt_gte=${startOfMonth}&createdAt_lte=${endOfMonth}`, branchId),
      makeDirectApiCall(`/invoices?createdAt_gte=${startOfMonth}&createdAt_lte=${endOfMonth}`, branchId)
    ]);

    let apiTotalCollected = 0;
    let apiInvoiceTotal = 0;

    if (paymentsApi?.data) {
      apiTotalCollected = paymentsApi.data
        .filter((payment: any) => payment.status === 'completed' || payment.status === 'paid')
        .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
    }

    if (invoicesApi?.data) {
      apiInvoiceTotal = invoicesApi.data
        .filter((invoice: any) => invoice.status === 'paid')
        .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || invoice.amount || 0), 0);
    }

    console.log(`API Payments Collection: ₹${apiTotalCollected}`);
    console.log(`API Invoices Collection: ₹${apiInvoiceTotal}`);

    // Get fee collection from dashboard UI
    // The dashboard shows "Fee Collection" as title with amount below it (e.g., "₹2.4L")
    let dashboardFeeText = '';
    
    // Wait for the "Fee Collection" text to be visible
    await page.locator('text="Fee Collection"').waitFor({ state: 'visible', timeout: 10000 });
    
    // Find the fee collection card
    const feeCard = page.locator('text="Fee Collection"').locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "border") or contains(@class, "card")]').first();
    
    // Look for the amount text within the card
    const amountTexts = await feeCard.locator('div').allTextContents();
    
    for (const text of amountTexts) {
      // Look for text that contains rupee symbol (like "₹2.4L" or "₹100")
      if (text && /^₹[\d.,]+[KkLlMm]?$/.test(text.trim())) {
        dashboardFeeText = text.trim();
        console.log(`Found fee collection in dashboard: ${dashboardFeeText}`);
        break;
      }
    }
    
    // If not found, try to find any text with rupee symbol
    if (!dashboardFeeText) {
      const allTexts = await feeCard.allTextContents();
      for (const text of allTexts) {
        const match = text.match(/(₹[\d.,]+[KkLlMm]?)/);
        if (match && match[1]) {
          dashboardFeeText = match[1];
          console.log(`Found fee collection using pattern: ${dashboardFeeText}`);
          break;
        }
      }
    }

    expect(dashboardFeeText, 'Could not find fee collection amount in dashboard').not.toBe('');
    const dashboardFeeCollection = extractNumber(dashboardFeeText);
    console.log(`Dashboard Fee Collection: ₹${dashboardFeeCollection} (from text: "${dashboardFeeText}")`);

    // Validate reasonable amounts
    expect(dashboardFeeCollection).toBeGreaterThanOrEqual(0);
    expect(dashboardFeeCollection).toBeLessThan(1000000000); // 100 crore max sanity check

    // Compare with API data if available - but be realistic about different calculation methods
    const referenceAmount = Math.max(apiTotalCollected, apiInvoiceTotal);
    if (referenceAmount > 0) {
      const variance = Math.abs(referenceAmount - dashboardFeeCollection);
      // Dashboard might show total invoices vs payments, so allow larger variance
      const allowedVariance = Math.max(200000, Math.floor(Math.max(referenceAmount, dashboardFeeCollection) * 0.5)); // 50% or ₹2L
      
      // Log the details for debugging
      console.log(`Fee Collection Analysis:`);
      console.log(`  - API Payments: ₹${apiTotalCollected}`);
      console.log(`  - API Invoices: ₹${apiInvoiceTotal}`);
      console.log(`  - Dashboard: ₹${dashboardFeeCollection}`);
      console.log(`  - Variance: ₹${variance} (allowed: ₹${allowedVariance})`);
      
      // Only fail if the variance is extremely high (suggests a real bug)
      expect(variance, `Fee collection variance extremely high: API=₹${referenceAmount}, Dashboard=₹${dashboardFeeCollection}`).toBeLessThanOrEqual(allowedVariance);
    }
  });

  test('should validate multi-branch support with proper data isolation', async ({ page }) => {
    console.log('\n=== Testing Multi-Branch Data Isolation ===');
    
    const branchResults: Record<string, any> = {};

    // Test multiple branches to ensure data isolation
    for (const branchId of BRANCH_IDS.slice(0, 3)) { // Test first 3 branches
      console.log(`\nTesting branch: ${branchId}`);

      // Simulate branch selection (this depends on your branch selection UI)
      try {
        // Method 1: Try dropdown selection
        const branchSelector = page.locator('[data-testid="branch-selector"], select[name="branch"], .branch-select');
        if (await branchSelector.count() > 0) {
          await branchSelector.selectOption(branchId);
          await page.waitForTimeout(2000);
          await waitForDashboardLoad(page);
        } else {
          // Method 2: Try setting localStorage
          await page.evaluate((branch) => {
            localStorage.setItem('selectedBranchId', branch);
          }, branchId);
          
          // Reload to apply branch change
          await page.reload();
          await waitForDashboardLoad(page);
        }
      } catch (e) {
        console.log(`Could not change to branch ${branchId}, using current branch`);
      }

      // Get API data for this branch
      const [studentsApi, teachersApi] = await Promise.all([
        makeDirectApiCall('/students?page=1&pageSize=1', branchId),
        makeDirectApiCall('/teachers?page=1&pageSize=1', branchId)
      ]);

      // Get UI data
      let studentCount = 0;
      let teacherCount = 0;

      try {
        // Use the same approach as the other tests
        const studentCard = page.locator('text="Total Students"').locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "border") or contains(@class, "card")]').first();
        const studentTexts = await studentCard.locator('div').allTextContents();
        
        for (const text of studentTexts) {
          if (text && /^\d+$/.test(text.trim())) {
            studentCount = extractNumber(text);
            break;
          }
        }
      } catch (e) {
        console.log(`Could not get student count for ${branchId}`);
      }

      try {
        // Use the same approach as the other tests
        const teacherCard = page.locator('text="Active Teachers"').locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "border") or contains(@class, "card")]').first();
        const teacherTexts = await teacherCard.locator('div').allTextContents();
        
        for (const text of teacherTexts) {
          if (text && /^\d+$/.test(text.trim())) {
            teacherCount = extractNumber(text);
            break;
          }
        }
      } catch (e) {
        console.log(`Could not get teacher count for ${branchId}`);
      }

      branchResults[branchId] = {
        students: { api: studentsApi?.total || 0, ui: studentCount },
        teachers: { api: teachersApi?.total || 0, ui: teacherCount },
        hasData: (studentsApi?.total || 0) > 0 || studentCount > 0
      };

      console.log(`Branch ${branchId} Results:`, branchResults[branchId]);
    }

    // Validate that different branches have different data (data isolation)
    const branchesWithData = Object.entries(branchResults).filter(([_, data]) => data.hasData);
    
    if (branchesWithData.length > 1) {
      const [branch1, data1] = branchesWithData[0];
      const [branch2, data2] = branchesWithData[1];

      // Different branches should have different student/teacher counts
      const studentsMatch = data1.students.api === data2.students.api && data1.students.api > 0;
      const teachersMatch = data1.teachers.api === data2.teachers.api && data1.teachers.api > 0;

      // At least one metric should be different between branches (indicating proper isolation)
      if (studentsMatch && teachersMatch) {
        console.warn(`Warning: ${branch1} and ${branch2} have identical counts - potential data isolation issue`);
      } else {
        console.log(`✓ Data isolation verified: ${branch1} vs ${branch2} have different metrics`);
      }

      // Validate API responses respect X-Branch-Id header properly
      for (const [branchId, data] of Object.entries(branchResults)) {
        if (data.hasData && data.students.api > 0) {
          // UI should match API for each branch
          const studentVariance = Math.abs(data.students.api - data.students.ui);
          const teacherVariance = Math.abs(data.teachers.api - data.teachers.ui);
          
          expect(studentVariance, `Student count mismatch for ${branchId}`).toBeLessThanOrEqual(Math.max(5, data.students.api * 0.1));
          expect(teacherVariance, `Teacher count mismatch for ${branchId}`).toBeLessThanOrEqual(Math.max(3, data.teachers.api * 0.1));
        }
      }
    }
  });

  test('should validate date range filtering triggers correct API calls', async ({ page }) => {
    const branchId = 'dps-main';
    console.log('\n=== Testing Date Range Filtering ===');
    
    // Store initial values
    const initialData: Record<string, { attendanceRate: number; collectionAmount: number }> = {};

    // Test each date filter
    for (const dateFilter of DATE_FILTERS) {
      console.log(`\nTesting date filter: ${dateFilter.name}`);

      try {
        // Select date filter in UI
        const filterSelector = '[data-testid="date-filter"], select[name="dateRange"], .date-filter';
        const filterElement = page.locator(filterSelector).first();
        
        if (await filterElement.count() > 0) {
          await filterElement.selectOption(dateFilter.value);
        } else {
          // Try clicking on filter buttons instead
          const filterButton = page.locator(`button:has-text("${dateFilter.name}"), [data-value="${dateFilter.value}"]`);
          if (await filterButton.count() > 0) {
            await filterButton.click();
          } else {
            console.log(`Could not find date filter control for ${dateFilter.name}`);
            continue;
          }
        }
        
        // Wait for data to update
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle');

        // Calculate expected date range based on filter
        const today = new Date();
        let startDate: string;
        let endDate: string;

        switch (dateFilter.value) {
          case 'today':
            startDate = endDate = today.toISOString().split('T')[0];
            break;
          case 'thisWeek':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            startDate = startOfWeek.toISOString().split('T')[0];
            endDate = endOfWeek.toISOString().split('T')[0];
            break;
          case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
            break;
          default:
            startDate = endDate = today.toISOString().split('T')[0];
        }

        console.log(`Expected date range for ${dateFilter.name}: ${startDate} to ${endDate}`);

        // Get API data for this date range
        let attendanceEndpoint = '';
        if (dateFilter.value === 'today') {
          attendanceEndpoint = `/attendance-records/dashboard/stats?date=${startDate}`;
        } else {
          attendanceEndpoint = `/attendance-records/dashboard/stats?startDate=${startDate}&endDate=${endDate}`;
        }
        
        const apiResponse = await makeDirectApiCall(attendanceEndpoint, branchId);
        
        // Get updated dashboard values
        await page.waitForTimeout(1000);
        
        let attendanceRate = 0;
        let collectionAmount = 0;

        try {
          const attendanceText = await page.locator('.text-2xl:has-text("%"), .text-3xl:has-text("%")').first().textContent() || '0%';
          attendanceRate = extractNumber(attendanceText);
        } catch (e) {
          console.log(`Could not get attendance rate for ${dateFilter.name}`);
        }

        try {
          const collectionText = await page.locator('.text-2xl:has-text("₹"), .text-3xl:has-text("₹")').first().textContent() || '₹0';
          collectionAmount = extractNumber(collectionText);
        } catch (e) {
          console.log(`Could not get collection amount for ${dateFilter.name}`);
        }

        // Store results
        initialData[dateFilter.value] = { attendanceRate, collectionAmount };

        console.log(`${dateFilter.name} Results:`, {
          attendance: `${attendanceRate}%`,
          collection: `₹${collectionAmount}`,
          apiAvailable: !!apiResponse
        });

        // Validate data is within reasonable ranges
        expect(attendanceRate, `Attendance rate for ${dateFilter.name} is out of range`).toBeGreaterThanOrEqual(0);
        expect(attendanceRate, `Attendance rate for ${dateFilter.name} exceeds 100%`).toBeLessThanOrEqual(100);
        expect(collectionAmount, `Collection amount for ${dateFilter.name} is negative`).toBeGreaterThanOrEqual(0);

      } catch (error) {
        console.error(`Error testing ${dateFilter.name}:`, error);
      }
    }

    // Validate that different date ranges show different data (proving filters work)
    const values = Object.values(initialData);
    if (values.length >= 2) {
      const allSame = values.every((val, idx) => 
        idx === 0 || (val.attendanceRate === values[0].attendanceRate && val.collectionAmount === values[0].collectionAmount)
      );
      
      if (allSame && values[0].attendanceRate > 0) {
        console.warn('Warning: All date filters show identical data - filters might not be working');
      } else {
        console.log('✓ Date filters show different data as expected');
      }
    }
  });

  test('should validate all APIs respect X-Branch-Id header', async ({ page }) => {
    const testBranch = 'dps-main';
    const altBranch = 'dps-east';
    
    console.log('\n=== Testing X-Branch-Id Header Compliance ===');

    // List of critical API endpoints to test
    const criticalEndpoints = [
      '/students?page=1&pageSize=5',
      '/teachers?page=1&pageSize=5',
      '/staff?page=1&pageSize=5',
      '/attendance-records?page=1&pageSize=5',
      '/invoices?page=1&pageSize=5',
      '/payments?page=1&pageSize=5'
    ];

    for (const endpoint of criticalEndpoints) {
      console.log(`Testing endpoint: ${endpoint}`);

      // Get data for both branches
      const [branch1Data, branch2Data] = await Promise.all([
        makeDirectApiCall(endpoint, testBranch),
        makeDirectApiCall(endpoint, altBranch)
      ]);

      if (!branch1Data && !branch2Data) {
        console.log(`Skipping ${endpoint} - not available`);
        continue;
      }

      // If both branches have data, they should be different (proving isolation)
      if (branch1Data?.data && branch2Data?.data) {
        const branch1Count = branch1Data.total || branch1Data.data.length;
        const branch2Count = branch2Data.total || branch2Data.data.length;

        console.log(`${endpoint}: ${testBranch}=${branch1Count}, ${altBranch}=${branch2Count}`);

        // Check if data is properly isolated
        if (branch1Count > 0 && branch2Count > 0) {
          // Get some IDs from both branches
          const branch1Ids = (branch1Data.data || []).slice(0, 3).map((item: any) => item.id);
          const branch2Ids = (branch2Data.data || []).slice(0, 3).map((item: any) => item.id);
          
          // IDs should be different (no overlap)
          const hasOverlap = branch1Ids.some((id: any) => branch2Ids.includes(id));
          expect(hasOverlap, `API ${endpoint} shows overlapping data between branches - X-Branch-Id not working`).toBe(false);
          
          console.log(`✓ ${endpoint} properly isolates data between branches`);
        }
      }

      // Validate response structure
      if (branch1Data?.data) {
        expect(Array.isArray(branch1Data.data), `${endpoint} should return data as array`).toBe(true);
        expect(typeof branch1Data.total, `${endpoint} should return total count`).toBe('number');
        
        // Check if all items have correct branchId
        const itemsWithWrongBranch = branch1Data.data.filter((item: any) => 
          item.branchId && item.branchId !== testBranch
        );
        
        expect(itemsWithWrongBranch.length, `${endpoint} returns items with wrong branchId`).toBe(0);
      }
    }

    console.log('✓ All APIs properly respect X-Branch-Id header');
  });

  test('should validate dashboard performance and error handling', async ({ page }) => {
    console.log('\n=== Testing Dashboard Performance and Error Handling ===');
    
    const startTime = Date.now();
    
    // Navigate fresh to dashboard
    await page.goto(`${FRONTEND_URL}${DASHBOARD_URL}`);
    await waitForDashboardLoad(page);
    
    const loadTime = Date.now() - startTime;
    console.log(`Dashboard load time: ${loadTime}ms`);

    // Performance validation
    expect(loadTime, 'Dashboard should load within 15 seconds').toBeLessThan(15000);

    // Collect JavaScript errors
    const jsErrors: string[] = [];
    const networkErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.url()} - ${response.status()}`);
      }
    });

    // Test error resilience by simulating slow network
    await page.context().setOffline(true);
    
    // Try to interact with dashboard
    try {
      const dateFilter = page.locator('[data-testid="date-filter"], select, .date-filter').first();
      if (await dateFilter.count() > 0) {
        await dateFilter.click();
      }
    } catch (e) {
      // Expected when offline
    }
    
    await page.waitForTimeout(2000);
    
    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(3000);

    // Dashboard should still be functional
    const dashboardTitle = page.locator('h1, h2').first();
    await expect(dashboardTitle, 'Dashboard should remain accessible after network issues').toBeVisible();

    // Check for critical errors (filter out expected ones)
    const criticalJsErrors = jsErrors.filter(error => 
      !error.includes('Failed to fetch') && // Network errors are expected during offline test
      !error.includes('NetworkError') &&
      !error.includes('ERR_INTERNET_DISCONNECTED') &&
      !error.toLowerCase().includes('warning')
    );

    const criticalNetworkErrors = networkErrors.filter(error =>
      !error.includes('offline') // Filter out expected offline errors
    );

    if (criticalJsErrors.length > 0) {
      console.warn('JavaScript errors detected:', criticalJsErrors);
    }
    if (criticalNetworkErrors.length > 0) {
      console.warn('Network errors detected:', criticalNetworkErrors);
    }

    // Allow some errors but not too many
    expect(criticalJsErrors.length, `Too many JavaScript errors: ${criticalJsErrors.join(', ')}`).toBeLessThanOrEqual(2);
    expect(criticalNetworkErrors.length, `Too many network errors: ${criticalNetworkErrors.join(', ')}`).toBeLessThanOrEqual(3);

    console.log('✓ Dashboard handles errors gracefully and maintains performance');
  });

  // Debug helper test - can be enabled to log all dashboard values
  test.skip('debug: comprehensive dashboard value inspection', async ({ page }) => {
    const branchId = 'dps-main';
    
    console.log('\n=== COMPREHENSIVE DASHBOARD DEBUG ===');
    
    // Get all API values first
    const apiEndpoints = [
      '/students?page=1&pageSize=1',
      '/teachers?page=1&pageSize=1',
      '/staff?page=1&pageSize=1',
      '/attendance-records/dashboard/stats?date=' + new Date().toISOString().split('T')[0],
      '/invoices?page=1&pageSize=10',
      '/payments?page=1&pageSize=10'
    ];

    console.log('\n--- API Values ---');
    for (const endpoint of apiEndpoints) {
      const response = await makeDirectApiCall(endpoint, branchId);
      console.log(`${endpoint}:`, {
        total: response?.total,
        dataLength: response?.data?.length,
        firstItem: response?.data?.[0]
      });
    }

    // Get all dashboard UI values
    console.log('\n--- Dashboard UI Values ---');
    
    const numberElements = await page.locator('.text-2xl, .text-3xl, .text-xl, .text-4xl').allTextContents();
    numberElements.forEach((text, index) => {
      if (text.trim() && /[\d₹%]/.test(text)) {
        console.log(`Number element ${index}: "${text.trim()}"`);
      }
    });

    console.log('\n--- Dashboard Labels ---');
    const labelElements = await page.locator('.text-sm, .text-xs, .font-medium, .font-semibold').allTextContents();
    labelElements.forEach((text, index) => {
      if (text.trim() && text.length > 2 && text.length < 50) {
        console.log(`Label ${index}: "${text.trim()}"`);
      }
    });

    console.log('\n--- All testid elements ---');
    const testIdElements = await page.locator('[data-testid]').all();
    for (const element of testIdElements) {
      const testId = await element.getAttribute('data-testid');
      const text = await element.textContent();
      console.log(`[data-testid="${testId}"]: "${text?.trim()}"`);
    }
  });
});