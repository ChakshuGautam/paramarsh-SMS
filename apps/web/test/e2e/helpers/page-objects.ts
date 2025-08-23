import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object for common functionality
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  async checkNoDateErrors() {
    // Check for common date error patterns
    const body = await this.page.textContent('body');
    expect(body).not.toContain('Invalid time value');
    expect(body).not.toContain('Invalid Date');
    expect(body).not.toContain('NaN');
  }

  async checkNoMUIComponents() {
    // Check that no MUI components are present
    const muiElements = await this.page.locator('[class*="Mui"]').count();
    expect(muiElements).toBe(0);
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    const images = await this.page.locator('img').count();
    const imagesWithAlt = await this.page.locator('img[alt]').count();
    
    // Images should have alt attributes
    if (images > 0) {
      expect(imagesWithAlt).toBe(images);
    }
    
    // Should have proper heading structure
    expect(headings).toBeGreaterThanOrEqual(1);
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * Students List Page Object
 */
export class StudentsListPage extends BasePage {
  readonly searchInput: Locator;
  readonly activeTab: Locator;
  readonly inactiveTab: Locator;
  readonly graduatedTab: Locator;
  readonly createButton: Locator;
  readonly studentsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('input[placeholder*="Search" i]');
    this.activeTab = page.locator('text=Active');
    this.inactiveTab = page.locator('text=Inactive');
    this.graduatedTab = page.locator('text=Graduated');
    this.createButton = page.locator('text=Create', { hasText: /create/i }).first();
    this.studentsTable = page.locator('table, [role="table"]');
  }

  async goto() {
    await super.goto('/students');
    await this.waitForPageLoad();
  }

  async waitForStudentsToLoad() {
    await this.page.waitForSelector('text=Rahul, text=Priya, text=Arjun', { timeout: 10000 });
  }

  async searchForStudent(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.waitForNetworkIdle();
  }

  async switchToTab(tabName: 'Active' | 'Inactive' | 'Graduated') {
    const tab = tabName === 'Active' ? this.activeTab : 
                tabName === 'Inactive' ? this.inactiveTab : this.graduatedTab;
    await tab.click();
    await this.waitForNetworkIdle();
  }

  async getStudentCount() {
    const rows = await this.studentsTable.locator('tbody tr').count();
    return rows;
  }

  async clickStudent(name: string) {
    await this.page.locator(`text=${name}`).first().click();
  }

  async getDisplayedStudents() {
    const studentNames = await this.studentsTable.locator('tbody tr td:nth-child(2)').allTextContents();
    return studentNames;
  }

  async clickCreateButton() {
    await this.createButton.click();
    await this.waitForNetworkIdle();
  }

  async verifyStudentInList(admissionNo: string, firstName: string, lastName: string) {
    await expect(this.page.locator(`text=${admissionNo}`)).toBeVisible();
    await expect(this.page.locator(`text=${firstName}`)).toBeVisible();
    await expect(this.page.locator(`text=${lastName}`)).toBeVisible();
  }
}

/**
 * Students Create Page Object
 */
export class StudentsCreatePage extends BasePage {
  readonly admissionNoInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly genderInput: Locator;
  readonly classSelect: Locator;
  readonly sectionSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.admissionNoInput = page.locator('label:has-text("Admission No") ~ input, input[name="admissionNo"]');
    this.firstNameInput = page.locator('label:has-text("First Name") ~ input, input[name="firstName"]');
    this.lastNameInput = page.locator('label:has-text("Last Name") ~ input, input[name="lastName"]');
    this.genderInput = page.locator('label:has-text("Gender") ~ input, input[name="gender"]');
    this.classSelect = page.locator('label:has-text("Class") ~ select, select[name="classId"]');
    this.sectionSelect = page.locator('label:has-text("Section") ~ select, select[name="sectionId"]');
    this.saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async goto() {
    await super.goto('/students/create');
    await this.waitForPageLoad();
  }

  async waitForFormToLoad() {
    await this.admissionNoInput.waitFor({ state: 'visible' });
    await this.firstNameInput.waitFor({ state: 'visible' });
    await this.lastNameInput.waitFor({ state: 'visible' });
  }

  async fillStudentForm(student: {
    admissionNo: string;
    firstName: string;
    lastName: string;
    gender: string;
    classId?: string;
    sectionId?: string;
  }) {
    await this.admissionNoInput.fill(student.admissionNo);
    await this.firstNameInput.fill(student.firstName);
    await this.lastNameInput.fill(student.lastName);
    await this.genderInput.fill(student.gender);
    
    if (student.classId) {
      await this.classSelect.selectOption(student.classId);
    }
    
    if (student.sectionId) {
      await this.sectionSelect.selectOption(student.sectionId);
    }
  }

  async submitForm() {
    await this.saveButton.click();
    await this.waitForNetworkIdle();
  }

  async verifyFormValidation(field: string, expectedError?: string) {
    const errorLocator = this.page.locator(`[data-testid="${field}-error"], .error, .text-red-500`);
    
    if (expectedError) {
      await expect(errorLocator).toContainText(expectedError);
    } else {
      await expect(errorLocator).toBeVisible();
    }
  }

  async clearForm() {
    await this.admissionNoInput.clear();
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.genderInput.clear();
  }
}

/**
 * Students Edit Page Object
 */
export class StudentsEditPage extends BasePage {
  readonly admissionNoInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly genderInput: Locator;
  readonly classSelect: Locator;
  readonly sectionSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.admissionNoInput = page.locator('label:has-text("Admission No") ~ input, input[name="admissionNo"]');
    this.firstNameInput = page.locator('label:has-text("First Name") ~ input, input[name="firstName"]');
    this.lastNameInput = page.locator('label:has-text("Last Name") ~ input, input[name="lastName"]');
    this.genderInput = page.locator('label:has-text("Gender") ~ input, input[name="gender"]');
    this.classSelect = page.locator('label:has-text("Class") ~ select, select[name="classId"]');
    this.sectionSelect = page.locator('label:has-text("Section") ~ select, select[name="sectionId"]');
    this.saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async goto(studentId: number | string) {
    await super.goto(`/students/${studentId}/edit`);
    await this.waitForPageLoad();
  }

  async waitForFormToLoad() {
    await this.firstNameInput.waitFor({ state: 'visible' });
    // Wait for form to be populated with existing data
    await this.page.waitForFunction(() => {
      const firstName = document.querySelector('input[name="firstName"]') as HTMLInputElement;
      return firstName && firstName.value.length > 0;
    }, { timeout: 10000 });
  }

  async getCurrentValues() {
    return {
      admissionNo: await this.admissionNoInput.inputValue(),
      firstName: await this.firstNameInput.inputValue(),
      lastName: await this.lastNameInput.inputValue(),
      gender: await this.genderInput.inputValue(),
    };
  }

  async updateStudent(updates: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    classId?: string;
    sectionId?: string;
  }) {
    if (updates.firstName) {
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(updates.firstName);
    }
    
    if (updates.lastName) {
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(updates.lastName);
    }
    
    if (updates.gender) {
      await this.genderInput.clear();
      await this.genderInput.fill(updates.gender);
    }
    
    if (updates.classId) {
      await this.classSelect.selectOption(updates.classId);
    }
    
    if (updates.sectionId) {
      await this.sectionSelect.selectOption(updates.sectionId);
    }
  }

  async submitForm() {
    await this.saveButton.click();
    await this.waitForNetworkIdle();
  }

  async verifyFormIsPopulated() {
    await expect(this.firstNameInput).not.toHaveValue('');
    await expect(this.lastNameInput).not.toHaveValue('');
    await expect(this.admissionNoInput).not.toHaveValue('');
  }
}

/**
 * Students Show Page Object
 */
export class StudentsShowPage extends BasePage {
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editButton = page.locator('button:has-text("Edit"), a[href*="/edit"]');
    this.deleteButton = page.locator('button:has-text("Delete")');
    this.backButton = page.locator('button:has-text("Back"), a[href*="/students"]');
  }

  async goto(studentId: number | string) {
    await super.goto(`/students/${studentId}/show`);
    await this.waitForPageLoad();
  }

  async waitForStudentToLoad(studentName: string) {
    await this.page.waitForSelector(`text=${studentName}`, { timeout: 10000 });
  }

  async getFieldValue(fieldLabel: string) {
    const fieldElement = this.page.locator(`text=${fieldLabel}`).first();
    const fieldValue = fieldElement.locator('xpath=following-sibling::*[1]');
    return await fieldValue.textContent();
  }

  async verifyStudentDetails(student: {
    id?: string | number;
    admissionNo: string;
    firstName: string;
    lastName: string;
    gender: string;
  }) {
    if (student.id) {
      await expect(this.page.locator(`text=${student.id}`)).toBeVisible();
    }
    await expect(this.page.locator(`text=${student.admissionNo}`)).toBeVisible();
    await expect(this.page.locator(`text=${student.firstName}`)).toBeVisible();
    await expect(this.page.locator(`text=${student.lastName}`)).toBeVisible();
    await expect(this.page.locator(`text=${student.gender}`)).toBeVisible();
  }

  async clickEdit() {
    await this.editButton.click();
    await this.waitForNetworkIdle();
  }

  async clickDelete() {
    await this.deleteButton.click();
    // Handle confirmation dialog if it appears
    await this.page.locator('button:has-text("Confirm"), button:has-text("Delete")').click();
    await this.waitForNetworkIdle();
  }

  async clickBack() {
    await this.backButton.click();
    await this.waitForNetworkIdle();
  }

  async verifyAllFieldsDisplayed() {
    // Check that all expected fields are displayed
    await expect(this.page.locator('text=ID')).toBeVisible();
    await expect(this.page.locator('text=Admission No')).toBeVisible();
    await expect(this.page.locator('text=First Name')).toBeVisible();
    await expect(this.page.locator('text=Last Name')).toBeVisible();
    await expect(this.page.locator('text=Gender')).toBeVisible();
  }
}

/**
 * Authentication helper
 */
export class AuthHelper {
  constructor(private page: Page) {}

  async login(username: string = 'admin@test.com', password: string = 'password') {
    // Check if already logged in
    const isLoggedIn = await this.page.locator('text=Dashboard, text=Students').first().isVisible().catch(() => false);
    
    if (isLoggedIn) {
      return; // Already logged in
    }

    // Go to login page
    await this.page.goto('/login');
    
    // Fill login form
    await this.page.locator('input[name="email"], input[type="email"]').fill(username);
    await this.page.locator('input[name="password"], input[type="password"]').fill(password);
    
    // Submit login
    await this.page.locator('button:has-text("Login"), button[type="submit"]').click();
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  async logout() {
    const logoutButton = this.page.locator('button:has-text("Logout"), text=Logout');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await this.page.waitForURL('**/login');
    }
  }
}

/**
 * API helper for test data management
 */
export class ApiHelper {
  constructor(private page: Page) {}

  async createTestStudent(student: {
    admissionNo: string;
    firstName: string;
    lastName: string;
    gender: string;
    status?: string;
    branchId?: string;
  }) {
    const response = await this.page.request.post('http://localhost:8080/api/students', {
      headers: {
        'Content-Type': 'application/json',
        'X-Branch-Id': student.branchId || 'branch1'
      },
      data: {
        ...student,
        status: student.status || 'active',
        branchId: student.branchId || 'branch1'
      }
    });

    if (!response.ok()) {
      throw new Error(`Failed to create test student: ${response.status()}`);
    }

    return await response.json();
  }

  async deleteTestStudent(studentId: number | string, branchId: string = 'branch1') {
    const response = await this.page.request.delete(`http://localhost:8080/api/students/${studentId}`, {
      headers: {
        'X-Branch-Id': branchId
      }
    });

    if (!response.ok() && response.status() !== 404) {
      throw new Error(`Failed to delete test student: ${response.status()}`);
    }

    return response.ok();
  }

  async getStudent(studentId: number | string, branchId: string = 'branch1') {
    const response = await this.page.request.get(`http://localhost:8080/api/students/${studentId}`, {
      headers: {
        'X-Branch-Id': branchId
      }
    });

    if (!response.ok()) {
      return null;
    }

    return await response.json();
  }

  async listStudents(filters: { status?: string; branchId?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);

    const response = await this.page.request.get(`http://localhost:8080/api/students?${params.toString()}`, {
      headers: {
        'X-Branch-Id': filters.branchId || 'branch1'
      }
    });

    if (!response.ok()) {
      throw new Error(`Failed to list students: ${response.status()}`);
    }

    return await response.json();
  }
}