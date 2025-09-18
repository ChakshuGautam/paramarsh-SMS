import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/page-objects';

test.describe('Debug - Capture Page Source', () => {
  const FRONTEND_URL = 'http://localhost:3001';
  const BACKEND_URL = 'http://localhost:3005/api/v1';
  
  test('capture teachers list page source', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login();
    
    // Navigate to teachers list
    await page.goto(`${FRONTEND_URL}/admin#/teachers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for data to load
    
    // Capture page source
    const pageContent = await page.content();
    
    // Log the table structure
    console.log('=== TEACHERS PAGE STRUCTURE ===');
    
    // Find all visible text elements
    const visibleTexts = await page.locator('*:visible').evaluateAll(elements => {
      return elements
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0 && text.length < 100)
        .slice(0, 50); // First 50 visible text elements
    });
    
    console.log('Visible text elements:', visibleTexts);
    
    // Find table headers
    const headers = await page.locator('th, [role="columnheader"]').allTextContents();
    console.log('Table headers:', headers);
    
    // Find first few rows of data
    const rows = await page.locator('tbody tr, [role="row"]:not([role="columnheader"])').evaluateAll(rows => {
      return rows.slice(0, 3).map(row => {
        const cells = Array.from(row.querySelectorAll('td, [role="cell"]'));
        return cells.map(cell => cell.textContent?.trim() || '');
      });
    });
    console.log('First 3 data rows:', rows);
    
    // Check for specific selectors
    const selectors = {
      searchInput: await page.locator('input[type="search"], input[placeholder*="Search" i], [aria-label*="Search" i]').count(),
      createButton: await page.locator('a[href*="/create"], button:has-text("Create"), button:has-text("Add")').count(),
      nextPageButton: await page.locator('button[aria-label*="next" i], button:has-text("Next")').count(),
      dataTable: await page.locator('table, [role="grid"], .MuiDataGrid-root').count(),
    };
    
    console.log('Element counts:', selectors);
    
    // Get actual teacher names from API
    const apiResponse = await page.request.get(`${BACKEND_URL}/teachers?page=1&pageSize=5`, {
      headers: { 'X-Branch-Id': 'dps-main' }
    });
    
    if (apiResponse.ok()) {
      const data = await apiResponse.json();
      console.log('API teacher data (first 3):', data.data?.slice(0, 3).map((t: any) => ({
        id: t.id,
        name: t.staff ? `${t.staff.firstName} ${t.staff.lastName}` : 'No name',
        employeeId: t.staff?.employeeId || t.id
      })));
    }
  });
  
  test('capture students list page source', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login();
    
    // Navigate to students list
    await page.goto(`${FRONTEND_URL}/admin#/students`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for data to load
    
    console.log('=== STUDENTS PAGE STRUCTURE ===');
    
    // Find table headers
    const headers = await page.locator('th, [role="columnheader"]').allTextContents();
    console.log('Table headers:', headers);
    
    // Find first few rows of data
    const rows = await page.locator('tbody tr, [role="row"]:not([role="columnheader"])').evaluateAll(rows => {
      return rows.slice(0, 3).map(row => {
        const cells = Array.from(row.querySelectorAll('td, [role="cell"]'));
        return cells.map(cell => cell.textContent?.trim() || '');
      });
    });
    console.log('First 3 data rows:', rows);
    
    // Check for specific elements
    const elements = {
      admissionNoColumn: await page.locator('th:has-text("Admission"), [role="columnheader"]:has-text("Admission")').count(),
      nameColumn: await page.locator('th:has-text("Name"), [role="columnheader"]:has-text("Name")').count(),
      classColumn: await page.locator('th:has-text("Class"), [role="columnheader"]:has-text("Class")').count(),
      searchInput: await page.locator('input[type="search"], input[placeholder*="Search" i]').count(),
    };
    
    console.log('Element counts:', elements);
    
    // Get actual student data from API
    const apiResponse = await page.request.get(`${BACKEND_URL}/students?page=1&pageSize=5`, {
      headers: { 'X-Branch-Id': 'dps-main' }
    });
    
    if (apiResponse.ok()) {
      const data = await apiResponse.json();
      console.log('API student data (first 3):', data.data?.slice(0, 3).map((s: any) => ({
        id: s.id,
        admissionNo: s.admissionNo,
        name: `${s.firstName} ${s.lastName}`,
        class: s.class
      })));
    }
  });
  
  test('capture create teacher form structure', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login();
    
    // Navigate to create teacher form
    await page.goto(`${FRONTEND_URL}/admin#/teachers/create`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('=== CREATE TEACHER FORM STRUCTURE ===');
    
    // Find all form inputs
    const inputs = await page.locator('input[name], select[name], textarea[name]').evaluateAll(inputs => {
      return inputs.map(input => ({
        name: input.getAttribute('name'),
        type: input.getAttribute('type') || input.tagName.toLowerCase(),
        id: input.getAttribute('id'),
        placeholder: input.getAttribute('placeholder'),
        required: input.hasAttribute('required'),
        label: input.getAttribute('aria-label') || 
               document.querySelector(`label[for="${input.id}"]`)?.textContent?.trim()
      }));
    });
    
    console.log('Form inputs:', inputs);
    
    // Check for submit button
    const submitButton = await page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').count();
    console.log('Submit buttons found:', submitButton);
    
    // Check validation by submitting empty form
    if (submitButton > 0) {
      await page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first().click();
      await page.waitForTimeout(1000);
      
      // Check for validation errors
      const errors = await page.locator('.error, [role="alert"], .MuiFormHelperText-root.Mui-error, [aria-invalid="true"]').allTextContents();
      console.log('Validation errors:', errors);
    }
  });
});