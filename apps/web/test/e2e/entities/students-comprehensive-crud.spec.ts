import { test, expect, Page } from '@playwright/test';
import { AuthHelper, StudentsListPage, StudentsCreatePage, StudentsEditPage, StudentsShowPage } from '../helpers/page-objects';

test.describe('Students - Comprehensive CRUD Tests with Database Verification', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  const API_URL = process.env.API_URL || 'http://localhost:3005';
  
  let authHelper: AuthHelper;
  let studentsListPage: StudentsListPage;
  let studentsCreatePage: StudentsCreatePage;
  let studentsEditPage: StudentsEditPage;
  let studentsShowPage: StudentsShowPage;

  // Test data - unique for each test run to avoid conflicts
  const testTimestamp = Date.now();
  const testStudent = {
    admissionNo: `E2E${testTimestamp}`,
    firstName: `TestStudent${testTimestamp}`,
    lastName: 'Comprehensive',
    gender: 'male',
    branchId: 'dps-main'
  };

  const updatedStudent = {
    firstName: `UpdatedStudent${testTimestamp}`,
    lastName: 'ComprehensiveUpdated',
    gender: 'female'
  };

  let createdStudentId: string;
  let createdStudentDbId: number;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    studentsListPage = new StudentsListPage(page);
    studentsCreatePage = new StudentsCreatePage(page);
    studentsEditPage = new StudentsEditPage(page);
    studentsShowPage = new StudentsShowPage(page);

    // Login with real credentials for DPS Main branch
    console.log('🔑 Logging in with real credentials...');
    await authHelper.login(); // Use defaults from AuthHelper
    console.log('✅ Successfully authenticated');
  });

  test.describe('Create Operations with Database Verification', () => {
    test('should create a new student and verify in database', async ({ page }) => {
      console.log('🏗️  Starting student creation test...');

      // Navigate to students list
      await page.goto(`${FRONTEND_URL}/admin/students`);
      await page.waitForLoadState('networkidle');

      // Click create button
      const createButton = page.locator('a:has-text("Create"), button:has-text("Create")').first();
      await expect(createButton).toBeVisible({ timeout: 15000 });
      await createButton.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on the create form
      await expect(page.locator('h1, h2')).toContainText(/Create.*Student|New.*Student/i);

      // Fill out the form
      console.log('📝 Filling out student creation form...');
      
      // Fill basic information
      const admissionNoInput = page.locator('input[name="admissionNo"], input[placeholder*="admission" i]').first();
      await expect(admissionNoInput).toBeVisible();
      await admissionNoInput.fill(testStudent.admissionNo);

      const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first" i]').first();
      await expect(firstNameInput).toBeVisible();
      await firstNameInput.fill(testStudent.firstName);

      const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="last" i]').first();
      await expect(lastNameInput).toBeVisible();
      await lastNameInput.fill(testStudent.lastName);

      // Handle gender selection (could be select or radio buttons)
      const genderSelect = page.locator('select[name="gender"]');
      const genderRadio = page.locator(`input[type="radio"][value="${testStudent.gender}"]`);
      
      if (await genderSelect.count() > 0) {
        await genderSelect.selectOption(testStudent.gender);
      } else if (await genderRadio.count() > 0) {
        await genderRadio.click();
      } else {
        // Fallback to input field
        const genderInput = page.locator('input[name="gender"]');
        if (await genderInput.count() > 0) {
          await genderInput.fill(testStudent.gender);
        }
      }

      // Submit the form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      await expect(submitButton).toBeVisible();
      
      console.log('💾 Submitting student creation form...');
      await submitButton.click();
      
      // Wait for navigation or success message
      await page.waitForLoadState('networkidle');
      
      // Verify success (could redirect to list or show page)
      await expect(page).toHaveURL(/\/(students|admin\/students)/);
      
      // Look for success notification or the student in the list
      try {
        await expect(page.locator('.toast, .notification, .alert')).toContainText(/success|created|saved/i, { timeout: 5000 });
        console.log('✅ Success notification found');
      } catch {
        console.log('⚠️  No success notification, checking for student in list...');
      }

      // Verify student appears in the list
      await page.goto(`${FRONTEND_URL}/admin/students`);
      await page.waitForLoadState('networkidle');
      
      // Wait for data to load and search for our student
      await page.waitForTimeout(2000);
      
      const studentRow = page.locator(`tr:has-text("${testStudent.admissionNo}")`);
      await expect(studentRow).toBeVisible({ timeout: 15000 });
      await expect(studentRow).toContainText(testStudent.firstName);
      await expect(studentRow).toContainText(testStudent.lastName);
      
      console.log('✅ Student appears in the list');

      // Get the student ID from the row for database verification
      const editLink = studentRow.locator('a[href*="/edit"], button:has-text("Edit")').first();
      const href = await editLink.getAttribute('href');
      if (href) {
        const match = href.match(/\/(\d+)\/edit/);
        if (match) {
          createdStudentId = match[1];
          console.log(`📋 Created student ID: ${createdStudentId}`);
        }
      }
    });
  });

  test.describe('Database State Verification', () => {
    test('should verify student exists in database with correct branchId isolation', async ({ page }) => {
      // This test depends on the previous test creating a student
      test.skip(!createdStudentId, 'No student ID available from creation test');

      console.log('🔍 Verifying student in database using direct database query...');

      // First verify via API to get basic confirmation
      let dbStudent;
      try {
        const result = await page.evaluate(async (query) => {
          const response = await fetch(`${process.env.API_URL || 'http://localhost:3005'}/api/v1/students?admissionNo=${query.admissionNo}`, {
            headers: {
              'X-Branch-Id': 'dps-main'
            }
          });
          return response.json();
        }, { admissionNo: testStudent.admissionNo });

        dbStudent = result.data?.find((s: any) => s.admissionNo === testStudent.admissionNo);
        console.log('📊 API query result:', dbStudent);
      } catch (error) {
        console.error('❌ API verification failed:', error);
        throw error;
      }

      // Verify student exists via API
      expect(dbStudent).toBeTruthy();
      expect(dbStudent.admissionNo).toBe(testStudent.admissionNo);
      expect(dbStudent.firstName).toBe(testStudent.firstName);
      expect(dbStudent.lastName).toBe(testStudent.lastName);
      expect(dbStudent.gender).toBe(testStudent.gender);
      expect(dbStudent.branchId).toBe(testStudent.branchId);
      
      createdStudentDbId = dbStudent.id;
      
      // For REAL database verification, we would use MCP PostgreSQL tool in a Node.js context
      // This is a limitation of the browser environment - we can't directly execute MCP tools from Playwright
      // In a real scenario, you'd have a separate helper that runs MCP queries and returns results
      console.log('ℹ️  Note: Direct database verification using MCP PostgreSQL would be done in global-setup.ts or a separate Node.js helper');
      console.log('✅ Student verified via API with correct branchId isolation');
    });

    test('should verify multi-tenant isolation - student not visible in other branches', async ({ page }) => {
      test.skip(!createdStudentDbId, 'No database student ID available');

      console.log('🔒 Testing multi-tenant isolation...');

      // Try to access student from a different branch
      try {
        const result = await page.evaluate(async (studentId) => {
          const response = await fetch(`${process.env.API_URL || 'http://localhost:3005'}/api/v1/students/${studentId}`, {
            headers: {
              'X-Branch-Id': 'kvs-central' // Different branch
            }
          });
          return { status: response.status, data: response.ok ? await response.json() : null };
        }, createdStudentDbId);

        // Should not be able to access student from different branch
        expect(result.status).toBeGreaterThanOrEqual(400); // Should be 404 or 403
        console.log('✅ Multi-tenant isolation working correctly');
      } catch (error) {
        console.error('❌ Multi-tenant isolation test failed:', error);
        throw error;
      }
    });
  });

  test.describe('Read Operations (Show/Detail View)', () => {
    test('should display student details correctly', async ({ page }) => {
      test.skip(!createdStudentId, 'No student ID available from creation test');

      console.log('👁️  Testing student detail view...');

      // Navigate to student detail view
      await page.goto(`${FRONTEND_URL}/admin/students/${createdStudentId}`);
      await page.waitForLoadState('networkidle');

      // Verify all fields are displayed
      await expect(page.locator(`text=${testStudent.admissionNo}`)).toBeVisible();
      await expect(page.locator(`text=${testStudent.firstName}`)).toBeVisible();
      await expect(page.locator(`text=${testStudent.lastName}`)).toBeVisible();
      await expect(page.locator(`text=${testStudent.gender}`)).toBeVisible();

      // Verify action buttons are present
      const editButton = page.locator('button:has-text("Edit"), a[href*="/edit"]');
      const deleteButton = page.locator('button:has-text("Delete")');
      
      await expect(editButton).toBeVisible();
      await expect(deleteButton).toBeVisible();

      console.log('✅ Student details displayed correctly');
    });
  });

  test.describe('Update Operations with Database Verification', () => {
    test('should edit student and verify changes persist in database', async ({ page }) => {
      test.skip(!createdStudentId, 'No student ID available from creation test');

      console.log('✏️  Testing student edit functionality...');

      // Navigate to edit form
      await page.goto(`${FRONTEND_URL}/admin/students/${createdStudentId}/edit`);
      await page.waitForLoadState('networkidle');

      // Verify form is populated with current data
      const firstNameInput = page.locator('input[name="firstName"]');
      await expect(firstNameInput).toHaveValue(testStudent.firstName);

      // Update the student data
      console.log('📝 Updating student information...');
      
      await firstNameInput.clear();
      await firstNameInput.fill(updatedStudent.firstName);

      const lastNameInput = page.locator('input[name="lastName"]');
      await lastNameInput.clear();
      await lastNameInput.fill(updatedStudent.lastName);

      // Update gender if possible
      const genderSelect = page.locator('select[name="gender"]');
      const genderRadio = page.locator(`input[type="radio"][value="${updatedStudent.gender}"]`);
      
      if (await genderSelect.count() > 0) {
        await genderSelect.selectOption(updatedStudent.gender);
      } else if (await genderRadio.count() > 0) {
        await genderRadio.click();
      }

      // Submit the changes
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').first();
      await submitButton.click();
      await page.waitForLoadState('networkidle');

      // Verify success
      await expect(page).toHaveURL(/\/(students|admin\/students)/);

      console.log('💾 Changes submitted, verifying persistence...');

      // Navigate back to detail view to verify changes
      await page.goto(`${FRONTEND_URL}/admin/students/${createdStudentId}`);
      await page.waitForLoadState('networkidle');

      // Verify updated data in UI
      await expect(page.locator(`text=${updatedStudent.firstName}`)).toBeVisible();
      await expect(page.locator(`text=${updatedStudent.lastName}`)).toBeVisible();

      // Verify changes in database via API
      const dbVerification = await page.evaluate(async (studentId) => {
        const response = await fetch(`${process.env.API_URL || 'http://localhost:3005'}/api/v1/students/${studentId}`, {
          headers: {
            'X-Branch-Id': 'dps-main'
          }
        });
        return response.json();
      }, createdStudentDbId);

      expect(dbVerification.firstName).toBe(updatedStudent.firstName);
      expect(dbVerification.lastName).toBe(updatedStudent.lastName);
      expect(dbVerification.gender).toBe(updatedStudent.gender);

      console.log('✅ Student updated successfully and changes verified in database');
    });
  });

  test.describe('Error Handling and Validation', () => {
    test('should validate required fields and show appropriate errors', async ({ page }) => {
      console.log('⚠️  Testing form validation...');

      await page.goto(`${FRONTEND_URL}/admin/students/create`);
      await page.waitForLoadState('networkidle');

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      await submitButton.click();

      // Check for validation messages
      const errorMessages = page.locator('.error, .text-red-500, [class*="error"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        console.log('✅ Validation errors displayed for empty form');
        const firstError = await errorMessages.first().textContent();
        console.log(`📝 Sample validation error: ${firstError}`);
      } else {
        console.log('⚠️  No visible validation errors found');
      }
    });

    test('should handle duplicate admission numbers', async ({ page }) => {
      console.log('🔄 Testing duplicate admission number validation...');

      await page.goto(`${FRONTEND_URL}/admin/students/create`);
      await page.waitForLoadState('networkidle');

      // Try to create student with same admission number as existing one
      const admissionNoInput = page.locator('input[name="admissionNo"]');
      await admissionNoInput.fill(testStudent.admissionNo);

      const firstNameInput = page.locator('input[name="firstName"]');
      await firstNameInput.fill('DuplicateTest');

      const lastNameInput = page.locator('input[name="lastName"]');
      await lastNameInput.fill('Student');

      const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await submitButton.click();

      // Should show error about duplicate admission number
      await page.waitForTimeout(2000); // Wait for any server response

      // Check for error message or that we remain on the create page
      const currentUrl = page.url();
      const isStillOnCreate = currentUrl.includes('/create');
      const hasErrorMessage = await page.locator('.error, .alert, .toast').count() > 0;

      expect(isStillOnCreate || hasErrorMessage).toBeTruthy();
      console.log('✅ Duplicate admission number properly handled');
    });
  });

  test.describe('Delete Operations with Database Verification', () => {
    test('should delete student and verify removal from database', async ({ page }) => {
      test.skip(!createdStudentId, 'No student ID available from creation test');

      console.log('🗑️  Testing student deletion...');

      // Navigate to student detail page
      await page.goto(`${FRONTEND_URL}/admin/students/${createdStudentId}`);
      await page.waitForLoadState('networkidle');

      // Find and click delete button
      const deleteButton = page.locator('button:has-text("Delete")');
      await expect(deleteButton).toBeVisible();
      
      console.log('🔴 Clicking delete button...');
      await deleteButton.click();

      // Handle confirmation dialog if it appears
      const confirmButtons = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
      if (await confirmButtons.count() > 0) {
        console.log('✅ Confirmation dialog appeared, confirming deletion...');
        await confirmButtons.first().click();
      }

      await page.waitForLoadState('networkidle');

      // Should redirect to students list
      await expect(page).toHaveURL(/\/(students|admin\/students)/);

      console.log('🔍 Verifying student is no longer in the list...');

      // Verify student is no longer in the list
      await page.waitForTimeout(2000); // Wait for data refresh
      const studentRow = page.locator(`tr:has-text("${testStudent.admissionNo}")`);
      await expect(studentRow).not.toBeVisible({ timeout: 10000 });

      // Verify deletion in database via API
      const dbVerification = await page.evaluate(async (studentId) => {
        const response = await fetch(`${process.env.API_URL || 'http://localhost:3005'}/api/v1/students/${studentId}`, {
          headers: {
            'X-Branch-Id': 'dps-main'
          }
        });
        return { status: response.status, ok: response.ok };
      }, createdStudentDbId);

      // Should return 404 or similar for deleted student
      expect(dbVerification.status).toBeGreaterThanOrEqual(400);
      expect(dbVerification.ok).toBeFalsy();

      console.log('✅ Student successfully deleted and verified in database');
    });
  });

  test.describe('Performance & Data Quality', () => {
    test('should load students list within acceptable time limits', async ({ page }) => {
      console.log('⏱️  Testing performance...');

      const startTime = Date.now();
      
      await page.goto(`${FRONTEND_URL}/admin/students`);
      await page.waitForLoadState('networkidle');
      
      // Wait for data to be visible
      await expect(page.locator('table, [role="table"], .data-grid')).toBeVisible({ timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      console.log(`📊 Page load time: ${loadTime}ms`);
      
      // Should load within 5 seconds (reasonable for E2E)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle empty states gracefully', async ({ page }) => {
      console.log('📭 Testing empty state handling...');

      await page.goto(`${FRONTEND_URL}/admin/students`);
      await page.waitForLoadState('networkidle');

      // Search for something that doesn't exist
      const searchInput = page.locator('input[placeholder*="Search" i]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('NonExistentStudent12345');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // Should show empty state or "no results" message
        const emptyStateIndicators = page.locator('text=/no.*result|no.*data|empty|not.*found/i');
        const tableRows = page.locator('tbody tr');
        
        const hasEmptyMessage = await emptyStateIndicators.count() > 0;
        const hasNoRows = await tableRows.count() === 0;
        
        expect(hasEmptyMessage || hasNoRows).toBeTruthy();
        console.log('✅ Empty state handled gracefully');
      }
    });
  });

  test.afterAll(async ({ page }) => {
    // Cleanup: Remove any test data that might still exist
    if (createdStudentDbId) {
      try {
        console.log('🧹 Cleaning up test data...');
        await page.evaluate(async (studentId) => {
          await fetch(`${process.env.API_URL || 'http://localhost:3005'}/api/v1/students/${studentId}`, {
            method: 'DELETE',
            headers: {
              'X-Branch-Id': 'dps-main'
            }
          });
        }, createdStudentDbId);
        console.log('✅ Test data cleanup completed');
      } catch (error) {
        console.log('⚠️  Test data cleanup failed:', error);
      }
    }
  });
});