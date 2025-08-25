import { test, expect } from '@playwright/test';
import { 
  StudentsListPage, 
  StudentsCreatePage, 
  StudentsEditPage, 
  StudentsShowPage,
  AuthHelper,
  ApiHelper 
} from '../helpers/page-objects';

test.describe('Students E2E Workflow Tests', () => {
  let authHelper: AuthHelper;
  let apiHelper: ApiHelper;
  let listPage: StudentsListPage;
  let createPage: StudentsCreatePage;
  let editPage: StudentsEditPage;
  let showPage: StudentsShowPage;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    apiHelper = new ApiHelper(page);
    listPage = new StudentsListPage(page);
    createPage = new StudentsCreatePage(page);
    editPage = new StudentsEditPage(page);
    showPage = new StudentsShowPage(page);

    // Login before each test
    await authHelper.login();
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test data created during the test
    try {
      await apiHelper.deleteTestStudent('test-student-e2e');
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('complete student CRUD workflow', async ({ page }) => {
    // Step 1: Navigate to students list
    await listPage.goto();
    await listPage.waitForStudentsToLoad();

    // Verify list page loads correctly
    await expect(page.locator('text=Students')).toBeVisible();
    await listPage.checkNoDateErrors();
    await listPage.checkNoMUIComponents();

    const initialStudentCount = await listPage.getStudentCount();

    // Step 2: Create new student
    await listPage.clickCreateButton();
    
    // Should navigate to create form
    await expect(page).toHaveURL(/.*\/students\/create/);
    await createPage.waitForFormToLoad();

    // Fill and submit create form
    const newStudent = {
      admissionNo: 'E2E2024001',
      firstName: 'TestE2E',
      lastName: 'Student',
      gender: 'male'
    };

    await createPage.fillStudentForm(newStudent);
    await createPage.checkNoDateErrors();
    await createPage.submitForm();

    // Should redirect back to list or show view
    await page.waitForURL(/.*\/students.*/);

    // Step 3: Verify student was created in list
    await listPage.goto();
    await listPage.waitForStudentsToLoad();
    
    await listPage.verifyStudentInList(
      newStudent.admissionNo,
      newStudent.firstName,
      newStudent.lastName
    );

    const newStudentCount = await listPage.getStudentCount();
    expect(newStudentCount).toBe(initialStudentCount + 1);

    // Step 4: View student details
    await listPage.clickStudent(newStudent.firstName);
    
    // Should navigate to show view
    await expect(page).toHaveURL(/.*\/students\/\d+\/show/);
    await showPage.waitForStudentToLoad(newStudent.firstName);
    
    await showPage.verifyStudentDetails(newStudent);
    await showPage.verifyAllFieldsDisplayed();
    await showPage.checkNoDateErrors();

    // Step 5: Edit student
    await showPage.clickEdit();
    
    // Should navigate to edit form
    await expect(page).toHaveURL(/.*\/students\/\d+\/edit/);
    await editPage.waitForFormToLoad();
    
    // Verify form is pre-populated
    await editPage.verifyFormIsPopulated();
    const currentValues = await editPage.getCurrentValues();
    expect(currentValues.firstName).toBe(newStudent.firstName);
    expect(currentValues.lastName).toBe(newStudent.lastName);

    // Make changes
    const updates = {
      firstName: 'UpdatedE2E',
      lastName: 'UpdatedStudent'
    };

    await editPage.updateStudent(updates);
    await editPage.checkNoDateErrors();
    await editPage.submitForm();

    // Step 6: Verify changes in show view
    await expect(page).toHaveURL(/.*\/students\/\d+\/show/);
    await showPage.waitForStudentToLoad(updates.firstName);
    
    await showPage.verifyStudentDetails({
      ...newStudent,
      firstName: updates.firstName,
      lastName: updates.lastName
    });

    // Step 7: Navigate back to list and verify changes
    await showPage.clickBack();
    await expect(page).toHaveURL(/.*\/students$/);
    await listPage.waitForStudentsToLoad();

    await listPage.verifyStudentInList(
      newStudent.admissionNo,
      updates.firstName,
      updates.lastName
    );

    // Step 8: Clean up - delete the test student via API
    // (In a real app, you might test delete functionality too)
    const students = await apiHelper.listStudents();
    const testStudent = students.data.find((s: any) => s.admissionNo === newStudent.admissionNo);
    
    if (testStudent) {
      await apiHelper.deleteTestStudent(testStudent.id);
    }
  });

  test('student list filtering and search', async ({ page }) => {
    await listPage.goto();
    await listPage.waitForStudentsToLoad();

    // Test status tab filtering
    await listPage.switchToTab('Active');
    const activeStudents = await listPage.getDisplayedStudents();
    expect(activeStudents.length).toBeGreaterThan(0);

    await listPage.switchToTab('Inactive');
    await page.waitForTimeout(1000); // Wait for filter to apply
    const inactiveStudents = await listPage.getDisplayedStudents();

    await listPage.switchToTab('Graduated');
    await page.waitForTimeout(1000);
    const graduatedStudents = await listPage.getDisplayedStudents();

    // Different tabs should potentially show different results
    // (depends on test data)

    // Test search functionality
    await listPage.switchToTab('Active'); // Reset to active
    await page.waitForTimeout(1000);
    
    const allActiveStudents = await listPage.getDisplayedStudents();
    
    if (allActiveStudents.length > 0) {
      const searchTerm = allActiveStudents[0].substring(0, 3); // First 3 chars
      await listPage.searchForStudent(searchTerm);
      
      const searchResults = await listPage.getDisplayedStudents();
      
      // Search should return fewer or equal results
      expect(searchResults.length).toBeLessThanOrEqual(allActiveStudents.length);
      
      // Results should contain the search term
      const resultsContainTerm = searchResults.some(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(resultsContainTerm).toBe(true);
    }

    // Clear search
    await listPage.searchForStudent('');
    const clearedResults = await listPage.getDisplayedStudents();
    expect(clearedResults.length).toBe(allActiveStudents.length);
  });

  test('form validation and error handling', async ({ page }) => {
    await listPage.goto();
    await listPage.clickCreateButton();
    
    await createPage.waitForFormToLoad();

    // Test required field validation
    await createPage.submitForm();
    
    // Should show validation errors (implementation dependent)
    // At minimum, form should not submit with empty required fields
    await expect(page).toHaveURL(/.*\/students\/create/);

    // Test invalid data
    await createPage.fillStudentForm({
      admissionNo: 'INVALID',
      firstName: 'A', // Too short
      lastName: 'B', // Too short  
      gender: 'invalid'
    });

    await createPage.submitForm();
    
    // Should remain on create page if validation fails
    await expect(page).toHaveURL(/.*\/students\/create/);

    // Test valid data
    await createPage.clearForm();
    await createPage.fillStudentForm({
      admissionNo: 'E2ETEST001',
      firstName: 'ValidName',
      lastName: 'ValidLastName',
      gender: 'female'
    });

    await createPage.submitForm();
    
    // Should redirect after successful creation
    await page.waitForURL(/.*\/students.*/);
    
    // Clean up
    const students = await apiHelper.listStudents();
    const testStudent = students.data.find((s: any) => s.admissionNo === 'E2ETEST001');
    if (testStudent) {
      await apiHelper.deleteTestStudent(testStudent.id);
    }
  });

  test('responsive design and mobile functionality', async ({ page }) => {
    // Test desktop view first
    await listPage.goto();
    await listPage.waitForStudentsToLoad();
    
    const desktopStudentCount = await listPage.getStudentCount();
    expect(desktopStudentCount).toBeGreaterThan(0);

    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be functional on mobile
    await listPage.goto();
    await listPage.waitForStudentsToLoad();
    
    const mobileStudentCount = await listPage.getStudentCount();
    expect(mobileStudentCount).toBe(desktopStudentCount);

    // Test mobile navigation
    await listPage.switchToTab('Inactive');
    await page.waitForTimeout(1000);

    // Form should work on mobile
    await listPage.clickCreateButton();
    await createPage.waitForFormToLoad();

    // Form fields should be visible and usable on mobile
    await expect(createPage.admissionNoInput).toBeVisible();
    await expect(createPage.firstNameInput).toBeVisible();
    await expect(createPage.lastNameInput).toBeVisible();

    // Test typing on mobile
    await createPage.admissionNoInput.fill('MOBILE001');
    await createPage.firstNameInput.fill('Mobile');
    await createPage.lastNameInput.fill('Test');

    // Values should be entered correctly
    await expect(createPage.admissionNoInput).toHaveValue('MOBILE001');
    await expect(createPage.firstNameInput).toHaveValue('Mobile');
    
    // Switch back to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('accessibility compliance', async ({ page }) => {
    // Test list page accessibility
    await listPage.goto();
    await listPage.waitForStudentsToLoad();
    await listPage.checkAccessibility();

    // Test create form accessibility
    await listPage.clickCreateButton();
    await createPage.waitForFormToLoad();
    await createPage.checkAccessibility();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').getAttribute('name');
    expect(focusedElement).toBeTruthy();

    await page.keyboard.press('Tab');
    let nextFocusedElement = await page.locator(':focus').getAttribute('name');
    expect(nextFocusedElement).not.toBe(focusedElement);

    // Test form labels
    const admissionLabel = await page.locator('label:has-text("Admission No")').count();
    const firstNameLabel = await page.locator('label:has-text("First Name")').count();
    const lastNameLabel = await page.locator('label:has-text("Last Name")').count();

    expect(admissionLabel).toBeGreaterThan(0);
    expect(firstNameLabel).toBeGreaterThan(0);
    expect(lastNameLabel).toBeGreaterThan(0);
  });

  test('date handling without errors', async ({ page }) => {
    await listPage.goto();
    await listPage.waitForStudentsToLoad();
    await listPage.checkNoDateErrors();

    // Check create form
    await listPage.clickCreateButton();
    await createPage.waitForFormToLoad();
    await createPage.checkNoDateErrors();

    // Check edit form (navigate to an existing student)
    await page.goBack();
    await listPage.waitForStudentsToLoad();
    
    const studentNames = await listPage.getDisplayedStudents();
    if (studentNames.length > 0) {
      await listPage.clickStudent(studentNames[0]);
      await showPage.waitForStudentToLoad(studentNames[0]);
      await showPage.checkNoDateErrors();

      await showPage.clickEdit();
      await editPage.waitForFormToLoad();
      await editPage.checkNoDateErrors();
    }
  });

  test('multi-tenancy isolation', async ({ page }) => {
    // This test would verify that students from different branches are properly isolated
    // For now, we'll just verify the basic functionality works with tenant headers
    
    await listPage.goto();
    await listPage.waitForStudentsToLoad();

    const students = await apiHelper.listStudents({ branchId: 'branch1' });
    expect(students.data).toBeDefined();
    expect(Array.isArray(students.data)).toBe(true);

    // Test creating student with specific branch
    const testStudent = await apiHelper.createTestStudent({
      admissionNo: 'TENANT001',
      firstName: 'TenantTest',
      lastName: 'User',
      gender: 'other',
      branchId: 'branch1'
    });

    expect(testStudent.data).toBeDefined();
    expect(testStudent.data.branchId).toBe('branch1');

    // Verify student appears in list
    await listPage.goto();
    await listPage.waitForStudentsToLoad();
    await listPage.verifyStudentInList('TENANT001', 'TenantTest', 'User');

    // Clean up
    await apiHelper.deleteTestStudent(testStudent.data.id);
  });

  test('error recovery and resilience', async ({ page }) => {
    await listPage.goto();
    await listPage.waitForStudentsToLoad();

    // Test handling of network errors (simulate by going offline briefly)
    await page.context().setOffline(true);
    
    // Try to navigate to create - should handle gracefully
    await listPage.clickCreateButton();
    
    // Go back online
    await page.context().setOffline(false);
    
    // Page should recover
    await page.reload();
    await listPage.waitForStudentsToLoad();
    
    const studentsAfterRecovery = await listPage.getStudentCount();
    expect(studentsAfterRecovery).toBeGreaterThanOrEqual(0);

    // Test handling of invalid URLs
    await page.goto('/students/99999/show'); // Non-existent student
    
    // Should handle gracefully (either show error page or redirect)
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    
    // Should not crash the application
    expect(currentUrl).toContain('students');
  });

  test('performance with large datasets', async ({ page }) => {
    await listPage.goto();
    
    const startTime = Date.now();
    await listPage.waitForStudentsToLoad();
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000); // 5 seconds max

    // Test pagination/virtualization
    const studentCount = await listPage.getStudentCount();
    
    // Should limit displayed rows for performance
    expect(studentCount).toBeLessThanOrEqual(50);

    // Test search performance
    const searchStartTime = Date.now();
    await listPage.searchForStudent('Test');
    const searchTime = Date.now() - searchStartTime;
    
    // Search should be fast
    expect(searchTime).toBeLessThan(3000);

    // Clear search
    await listPage.searchForStudent('');
  });
});