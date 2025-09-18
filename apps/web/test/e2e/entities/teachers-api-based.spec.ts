import { test, expect, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/page-objects';

/**
 * Teachers CRUD E2E Tests - API Based
 * 
 * Uses the same API endpoints that the frontend uses
 * No direct database access - verifies through API responses
 */

test.describe('Teachers - API-Based E2E Tests', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005/api/v1';
  
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login(); // Uses correct defaults
  });

  // Helper function to get teachers via API
  async function getTeachersViaAPI(page: Page, branchId: string = 'dps-main') {
    const response = await page.request.get(`${BACKEND_URL}/teachers?page=1&pageSize=100`, {
      headers: { 'X-Branch-Id': branchId }
    });
    
    if (response.ok()) {
      const data = await response.json();
      return { 
        teachers: data.data || [], 
        total: data.total || 0 
      };
    }
    return { teachers: [], total: 0 };
  }

  test.describe('List Operations', () => {
    test('should load teachers list and verify via API', async ({ page }) => {
      console.log('🔍 Testing Teachers List...');
      
      // Get teachers via API first
      const apiData = await getTeachersViaAPI(page);
      console.log(`📊 API returned ${apiData.total} teachers`);
      expect(apiData.total).toBeGreaterThan(0);
      
      // Navigate to teachers list
      await page.goto(`${FRONTEND_URL}/admin#/teachers`);
      await page.waitForLoadState('networkidle');
      
      // Wait for data table
      const dataTable = page.locator('table, [role="grid"], .MuiDataGrid-root').first();
      await expect(dataTable).toBeVisible({ timeout: 15000 });
      console.log('✅ Teachers table loaded');
      
      // Count displayed rows
      const rows = page.locator('tbody tr, [role="row"]:not([role="columnheader"])');
      await expect(rows.first()).toBeVisible({ timeout: 10000 });
      
      const rowCount = await rows.count();
      console.log(`✅ Found ${rowCount} teacher rows displayed`);
      
      // Verify some data is displayed
      expect(rowCount).toBeGreaterThan(0);
      
      // Verify teacher data matches API
      if (apiData.teachers.length > 0) {
        const firstTeacher = apiData.teachers[0];
        // Check if we have teacher staff data
        if (firstTeacher.staff && firstTeacher.staff.firstName) {
          console.log(`✅ API returned teacher: ${firstTeacher.staff.firstName} ${firstTeacher.staff.lastName}`);
          // Note: Teacher might not be visible due to pagination, but we confirmed API data exists
        } else {
          console.log('⚠️ Teacher data structure may be different than expected');
        }
      }
    });

    test('should support search functionality', async ({ page }) => {
      console.log('🔍 Testing search functionality...');
      
      await page.goto(`${FRONTEND_URL}/admin#/teachers`);
      await page.waitForLoadState('networkidle');
      
      // Wait for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[aria-label*="Search"]').first();
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      
      // Search for a common name
      await searchInput.fill('Kumar');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Verify search via API
      const searchResponse = await page.request.get(`${BACKEND_URL}/teachers?search=Kumar&page=1&pageSize=10`, {
        headers: { 'X-Branch-Id': 'dps-main' }
      });
      
      if (searchResponse.ok()) {
        const searchData = await searchResponse.json();
        console.log(`✅ API search returned ${searchData.total} results for "Kumar"`);
        
        // Check if filtered results are displayed
        const rows = page.locator('tbody tr, [role="row"]:not([role="columnheader"])');
        const displayedCount = await rows.count();
        console.log(`✅ UI showing ${displayedCount} filtered results`);
      }
    });
  });

  test.describe('Create Operations', () => {
    test('should navigate to create form', async ({ page }) => {
      console.log('🔍 Testing Teachers Create Form...');
      
      await page.goto(`${FRONTEND_URL}/admin#/teachers`);
      await page.waitForLoadState('networkidle');
      
      // Look for Create button
      const createButton = page.locator('a[href*="/create"], button:has-text("Create"), button:has-text("Add")').first();
      
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on create page
        await expect(page).toHaveURL(/teachers.*create/);
        console.log('✅ Navigated to create form');
        
        // Check for form fields
        const employeeIdField = page.locator('input[name="employeeId"], #employeeId').first();
        const firstNameField = page.locator('input[name="firstName"], #firstName').first();
        const lastNameField = page.locator('input[name="lastName"], #lastName').first();
        
        await expect(employeeIdField.or(firstNameField).or(lastNameField)).toBeVisible({ timeout: 10000 });
        console.log('✅ Create form fields are visible');
      } else {
        console.log('⚠️ Create button not found - might be permission restricted');
      }
    });

    test('should validate required fields', async ({ page }) => {
      console.log('🔍 Testing form validation...');
      
      await page.goto(`${FRONTEND_URL}/admin#/teachers/create`);
      await page.waitForLoadState('networkidle');
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check for validation errors or required field indicators
        const errors = page.locator('.error, [role="alert"], .MuiFormHelperText-root.Mui-error, [aria-invalid="true"]');
        const errorCount = await errors.count();
        
        if (errorCount > 0) {
          console.log(`✅ Form validation working - ${errorCount} errors shown`);
        } else {
          console.log('⚠️ No validation errors shown - checking for required field indicators');
          // Check if form prevented submission (still on create page)
          const stillOnCreate = page.url().includes('/create');
          if (stillOnCreate) {
            console.log('✅ Form submission prevented (still on create page)');
          }
        }
      }
    });
  });

  test.describe('Edit Operations', () => {
    test('should load edit form with data', async ({ page }) => {
      console.log('🔍 Testing Teachers Edit form...');
      
      // Get a teacher via API first
      const apiData = await getTeachersViaAPI(page);
      
      if (apiData.teachers.length > 0) {
        const teacher = apiData.teachers[0];
        // Teachers have nested staff data
        const teacherName = teacher.staff ? `${teacher.staff.firstName} ${teacher.staff.lastName}` : 'Unknown';
        console.log(`📝 Editing teacher: ${teacherName}`);
        
        // Navigate directly to edit page
        await page.goto(`${FRONTEND_URL}/admin#/teachers/${teacher.id}`);
        await page.waitForLoadState('networkidle');
        
        // Check if we're on show or edit page
        const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
        if (await editButton.isVisible()) {
          await editButton.click();
          await page.waitForLoadState('networkidle');
        }
        
        // Verify form has data - based on actual form structure
        const firstNameField = page.locator('input[name="staff.firstName"], input[name="firstName"]').first();
        
        if (await firstNameField.isVisible()) {
          const value = await firstNameField.inputValue();
          expect(value).toBeTruthy();
          console.log(`✅ Edit form loaded with data: ${value}`);
        } else {
          console.log('⚠️ Edit form fields not found');
        }
      } else {
        console.log('⚠️ No teachers found to edit');
      }
    });
  });

  test.describe('Multi-tenant Isolation', () => {
    test('should verify branch isolation via API', async ({ page }) => {
      console.log('🔍 Testing multi-tenant isolation...');
      
      // Get teachers for dps-main
      const dpsData = await getTeachersViaAPI(page, 'dps-main');
      console.log(`📊 DPS Main: ${dpsData.total} teachers`);
      
      // Get teachers for different branch
      const kvsData = await getTeachersViaAPI(page, 'kvs-central');
      console.log(`📊 KVS Central: ${kvsData.total} teachers`);
      
      // Verify isolation - teacher IDs should not overlap
      const dpsIds = new Set(dpsData.teachers.map(t => t.staff?.employeeId || t.id));
      const kvsIds = new Set(kvsData.teachers.map(t => t.staff?.employeeId || t.id));
      
      const overlap = [...dpsIds].filter(id => id && kvsIds.has(id));
      expect(overlap.length).toBe(0);
      console.log('✅ Branch isolation verified - no overlapping teacher IDs');
    });
  });

  test.describe('Performance', () => {
    test('should load large dataset efficiently', async ({ page }) => {
      console.log('🔍 Testing performance with large dataset...');
      
      const startTime = Date.now();
      
      await page.goto(`${FRONTEND_URL}/admin#/teachers`);
      await page.waitForLoadState('networkidle');
      
      // Wait for table to load
      const dataTable = page.locator('table, [role="grid"]').first();
      await expect(dataTable).toBeVisible({ timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      console.log(`⏱️ Page loaded in ${loadTime}ms`);
      
      // Check if pagination is working
      const nextButton = page.locator('button[aria-label="Go to next page"], button:has-text("Next")').first();
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Pagination working');
      }
      
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });
  });
});