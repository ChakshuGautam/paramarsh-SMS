import { Page, Locator, expect } from '@playwright/test';
import { PerformanceMonitor } from './performance-utils';
import { AccessibilityTester } from './accessibility-utils';
import { VisualRegressionTester } from './visual-regression-utils';
import { NetworkSimulator } from './network-simulation-utils';

/**
 * Enhanced Page Objects with Advanced Testing Capabilities
 * 
 * Provides enhanced page objects with built-in:
 * - Error handling and retry mechanisms
 * - Performance monitoring
 * - Accessibility validation
 * - Visual regression testing
 * - Network resilience testing
 * - Data validation and cleanup
 */

export interface PageObjectOptions {
  enablePerformanceMonitoring?: boolean;
  enableAccessibilityTesting?: boolean;
  enableVisualTesting?: boolean;
  enableNetworkTesting?: boolean;
  retryAttempts?: number;
  timeout?: number;
}

export interface ElementInteractionOptions {
  timeout?: number;
  retries?: number;
  waitForNetworkIdle?: boolean;
  performanceCheck?: boolean;
  accessibilityCheck?: boolean;
  visualCheck?: string; // Visual test name
}

export class EnhancedBasePage {
  protected page: Page;
  protected performanceMonitor?: PerformanceMonitor;
  protected accessibilityTester?: AccessibilityTester;
  protected visualTester?: VisualRegressionTester;
  protected networkSimulator?: NetworkSimulator;
  protected options: PageObjectOptions;

  constructor(page: Page, options: PageObjectOptions = {}) {
    this.page = page;
    this.options = {
      enablePerformanceMonitoring: true,
      enableAccessibilityTesting: true,
      enableVisualTesting: false, // Opt-in for visual tests
      enableNetworkTesting: false, // Opt-in for network tests
      retryAttempts: 3,
      timeout: 30000,
      ...options
    };

    this.initializeTesters();
  }

  private initializeTesters(): void {
    if (this.options.enablePerformanceMonitoring) {
      this.performanceMonitor = new PerformanceMonitor(this.page);
    }
    
    if (this.options.enableAccessibilityTesting) {
      this.accessibilityTester = new AccessibilityTester(this.page);
    }
    
    if (this.options.enableVisualTesting) {
      this.visualTester = new VisualRegressionTester(this.page, 'page-objects');
    }
    
    if (this.options.enableNetworkTesting) {
      this.networkSimulator = new NetworkSimulator(this.page);
    }
  }

  /**
   * Enhanced navigation with comprehensive monitoring
   */
  async navigateToWithMonitoring(url: string, testName?: string): Promise<void> {
    console.log(`🧭 Navigating to: ${url}`);
    
    if (this.performanceMonitor) {
      await this.performanceMonitor.startMonitoring();
    }

    const startTime = Date.now();
    
    try {
      await this.page.goto(url);
      await this.page.waitForLoadState('networkidle', { timeout: this.options.timeout });
      
      const loadTime = Date.now() - startTime;
      console.log(`⏱️ Page loaded in ${loadTime}ms`);
      
      // Run accessibility check
      if (this.accessibilityTester) {
        const accessibilityResult = await this.accessibilityTester.runFullAudit();
        if (!accessibilityResult.passed) {
          console.warn(`⚠️ Accessibility issues found: ${accessibilityResult.errors.length} errors`);
        }
      }
      
      // Run visual test if enabled and test name provided
      if (this.visualTester && testName) {
        try {
          await this.visualTester.compareScreenshot(testName);
          console.log(`📸 Visual test passed: ${testName}`);
        } catch (error) {
          console.warn(`📸 Visual differences detected: ${testName}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Navigation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enhanced element interaction with retry logic
   */
  async interactWithElement(
    selector: string, 
    action: 'click' | 'fill' | 'select' | 'hover' | 'focus',
    value?: string,
    options: ElementInteractionOptions = {}
  ): Promise<void> {
    const elementOptions = {
      timeout: this.options.timeout,
      retries: this.options.retryAttempts,
      waitForNetworkIdle: true,
      performanceCheck: false,
      accessibilityCheck: false,
      ...options
    };

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= elementOptions.retries!; attempt++) {
      try {
        console.log(`🎯 Attempt ${attempt}: ${action} on ${selector}`);
        
        const element = this.page.locator(selector);
        
        // Wait for element to be available
        await element.waitFor({ 
          state: 'visible', 
          timeout: elementOptions.timeout 
        });
        
        // Perform the action
        switch (action) {
          case 'click':
            await element.click({ timeout: elementOptions.timeout });
            break;
          case 'fill':
            if (value !== undefined) {
              await element.clear();
              await element.fill(value, { timeout: elementOptions.timeout });
            }
            break;
          case 'select':
            if (value !== undefined) {
              await element.selectOption(value, { timeout: elementOptions.timeout });
            }
            break;
          case 'hover':
            await element.hover({ timeout: elementOptions.timeout });
            break;
          case 'focus':
            await element.focus({ timeout: elementOptions.timeout });
            break;
        }
        
        // Wait for network idle if requested
        if (elementOptions.waitForNetworkIdle) {
          await this.page.waitForLoadState('networkidle', { timeout: 5000 });
        }
        
        // Run performance check if requested
        if (elementOptions.performanceCheck && this.performanceMonitor) {
          const metrics = await this.performanceMonitor.collectMetrics();
          console.log(`📊 Interaction performance: ${metrics.loadTime}ms`);
        }
        
        // Run accessibility check if requested
        if (elementOptions.accessibilityCheck && this.accessibilityTester) {
          const accessibilityResult = await this.accessibilityTester.testFocusManagement();
          if (!accessibilityResult.passed) {
            console.warn(`♿ Focus management issues after ${action}`);
          }
        }
        
        // Run visual check if requested
        if (elementOptions.visualCheck && this.visualTester) {
          try {
            await this.visualTester.compareScreenshot(elementOptions.visualCheck);
          } catch (error) {
            console.warn(`📸 Visual changes detected after ${action}: ${elementOptions.visualCheck}`);
          }
        }
        
        console.log(`✅ ${action} successful on attempt ${attempt}`);
        return;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ ${action} failed on attempt ${attempt}: ${error.message}`);
        
        if (attempt < elementOptions.retries!) {
          // Wait before retry
          await this.page.waitForTimeout(1000 * attempt);
          
          // Try alternative selectors if available
          if (attempt === 2) {
            await this.tryAlternativeSelectors(selector, action, value);
          }
        }
      }
    }
    
    throw new Error(`${action} failed after ${elementOptions.retries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Try alternative selectors for common elements
   */
  private async tryAlternativeSelectors(
    originalSelector: string, 
    action: string,
    value?: string
  ): Promise<boolean> {
    const alternatives: { [key: string]: string[] } = {
      // Button alternatives
      'button[type="submit"]': [
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Save")',
        '[role="button"]:has-text("Submit")',
        '[role="button"]:has-text("Save")'
      ],
      // Input alternatives
      'input[name="firstName"]': [
        'input[placeholder*="First"]',
        'input[aria-label*="First"]',
        'input#firstName'
      ],
      'input[name="email"]': [
        'input[type="email"]',
        'input[placeholder*="email"]',
        'input[aria-label*="Email"]'
      ],
      // Save button alternatives
      'button:has-text("Save")': [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Create")',
        'button:has-text("Update")'
      ]
    };

    for (const [pattern, alts] of Object.entries(alternatives)) {
      if (originalSelector.includes(pattern.split('[')[0])) {
        for (const altSelector of alts) {
          try {
            const element = this.page.locator(altSelector);
            if (await element.count() > 0 && await element.isVisible()) {
              console.log(`🔄 Trying alternative selector: ${altSelector}`);
              
              switch (action) {
                case 'click':
                  await element.click();
                  break;
                case 'fill':
                  if (value !== undefined) {
                    await element.fill(value);
                  }
                  break;
                case 'select':
                  if (value !== undefined) {
                    await element.selectOption(value);
                  }
                  break;
              }
              
              console.log(`✅ Alternative selector worked: ${altSelector}`);
              return true;
            }
          } catch (error) {
            // Continue trying other alternatives
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Enhanced form filling with validation
   */
  async fillFormWithValidation(formData: { [key: string]: string }): Promise<void> {
    console.log('📝 Filling form with enhanced validation...');
    
    const formStartTime = Date.now();
    let fieldsFilled = 0;
    let fieldsSkipped = 0;
    
    for (const [fieldName, value] of Object.entries(formData)) {
      try {
        const fieldSelectors = [
          `input[name="${fieldName}"]`,
          `textarea[name="${fieldName}"]`,
          `select[name="${fieldName}"]`,
          `input#${fieldName}`,
          `input[aria-label*="${fieldName}"]`,
          `input[placeholder*="${fieldName}"]`
        ];
        
        let fieldFound = false;
        
        for (const selector of fieldSelectors) {
          const field = this.page.locator(selector);
          
          if (await field.count() > 0 && await field.isVisible()) {
            console.log(`📋 Filling ${fieldName}: ${value}`);
            
            const tagName = await field.evaluate(el => el.tagName.toLowerCase());
            
            if (tagName === 'select') {
              await field.selectOption(value);
            } else {
              await field.clear();
              await field.fill(value);
            }
            
            // Verify field was filled
            const fieldValue = await field.inputValue();
            if (fieldValue === value || (tagName === 'select' && fieldValue)) {
              fieldsFilled++;
              fieldFound = true;
              break;
            }
          }
        }
        
        if (!fieldFound) {
          console.warn(`⚠️ Field not found or not fillable: ${fieldName}`);
          fieldsSkipped++;
        }
        
      } catch (error) {
        console.error(`❌ Error filling ${fieldName}: ${error.message}`);
        fieldsSkipped++;
      }
    }
    
    const formFillTime = Date.now() - formStartTime;
    console.log(`📊 Form filling summary: ${fieldsFilled} filled, ${fieldsSkipped} skipped in ${formFillTime}ms`);
  }

  /**
   * Enhanced waiting with multiple conditions
   */
  async waitForConditions(conditions: {
    selector?: string;
    networkIdle?: boolean;
    customCondition?: () => Promise<boolean>;
    timeout?: number;
  }): Promise<void> {
    const timeout = conditions.timeout || this.options.timeout!;
    const startTime = Date.now();
    
    try {
      if (conditions.selector) {
        await this.page.waitForSelector(conditions.selector, { timeout });
      }
      
      if (conditions.networkIdle) {
        await this.page.waitForLoadState('networkidle', { timeout });
      }
      
      if (conditions.customCondition) {
        await this.page.waitForFunction(conditions.customCondition, { timeout });
      }
      
      const waitTime = Date.now() - startTime;
      console.log(`⏳ Wait conditions met in ${waitTime}ms`);
      
    } catch (error) {
      console.error(`⏰ Wait conditions timeout after ${timeout}ms: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enhanced error handling with context
   */
  async handleError(error: Error, context: string): Promise<void> {
    console.error(`❌ Error in ${context}: ${error.message}`);
    
    // Take screenshot for debugging
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/errors/${context}-${timestamp}.png`;
    
    try {
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      console.log(`📸 Error screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      console.warn(`📸 Could not save error screenshot: ${screenshotError.message}`);
    }
    
    // Collect page info for debugging
    const url = this.page.url();
    const title = await this.page.title();
    
    console.error(`📍 Error context: URL=${url}, Title=${title}`);
    
    // Check for common error patterns
    await this.diagnoseCommonIssues();
  }

  /**
   * Diagnose common issues
   */
  private async diagnoseCommonIssues(): Promise<void> {
    try {
      // Check for network errors
      const networkErrors = await this.page.evaluate(() => {
        return (window as any).networkErrors || [];
      });
      
      if (networkErrors.length > 0) {
        console.error(`🌐 Network errors detected: ${networkErrors.length}`);
      }
      
      // Check for JavaScript errors
      const jsErrors = await this.page.evaluate(() => {
        return (window as any).jsErrors || [];
      });
      
      if (jsErrors.length > 0) {
        console.error(`💥 JavaScript errors detected: ${jsErrors.length}`);
      }
      
      // Check for missing elements
      const expectedElements = [
        'button[type="submit"]',
        'input[type="submit"]',
        'form',
        '[role="main"]',
        'h1, h2'
      ];
      
      for (const selector of expectedElements) {
        const count = await this.page.locator(selector).count();
        if (count === 0) {
          console.warn(`🔍 Missing expected element: ${selector}`);
        }
      }
      
    } catch (diagnosticError) {
      console.warn(`🔧 Diagnostic check failed: ${diagnosticError.message}`);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up page object resources...');
    
    try {
      // Clear any network simulation
      if (this.networkSimulator) {
        await this.networkSimulator.disableThrottling();
      }
      
      // Clear local storage and session storage
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.warn(`⚠️ Cleanup warning: ${error.message}`);
    }
  }
}

/**
 * Enhanced Students Page Object
 */
export class EnhancedStudentsPage extends EnhancedBasePage {
  private readonly studentsUrl = '/admin/students';
  private readonly createUrl = '/admin/students/create';

  async navigateToList(): Promise<void> {
    await this.navigateToWithMonitoring(this.studentsUrl, 'students-list');
  }

  async navigateToCreate(): Promise<void> {
    await this.navigateToWithMonitoring(this.createUrl, 'students-create-form');
  }

  async createStudent(studentData: {
    admissionNo: string;
    firstName: string;
    lastName: string;
    gender: string;
    [key: string]: string;
  }): Promise<string> {
    console.log('👨‍🎓 Creating student with enhanced validation...');
    
    await this.navigateToCreate();
    
    // Fill form with validation
    await this.fillFormWithValidation(studentData);
    
    // Submit with retry
    await this.interactWithElement(
      'button[type="submit"]',
      'click',
      undefined,
      {
        waitForNetworkIdle: true,
        performanceCheck: true
      }
    );
    
    // Extract student ID from URL or page
    await this.waitForConditions({
      networkIdle: true,
      customCondition: async () => {
        const url = this.page.url();
        return url.includes('/students/') && !url.includes('/create');
      }
    });
    
    const currentUrl = this.page.url();
    const studentId = this.extractIdFromUrl(currentUrl, 'students');
    
    if (studentId) {
      console.log(`✅ Student created successfully: ${studentId}`);
      return studentId;
    } else {
      throw new Error('Could not extract student ID after creation');
    }
  }

  async searchStudent(query: string): Promise<number> {
    console.log(`🔍 Searching for student: ${query}`);
    
    await this.interactWithElement(
      'input[placeholder*="Search"], input[name="search"]',
      'fill',
      query
    );
    
    await this.page.keyboard.press('Enter');
    
    await this.waitForConditions({
      networkIdle: true,
      timeout: 10000
    });
    
    // Count results
    const resultsCount = await this.page.locator('tbody tr, .student-row').count();
    console.log(`📊 Found ${resultsCount} results for "${query}"`);
    
    return resultsCount;
  }

  private extractIdFromUrl(url: string, entityName: string): string | null {
    const pattern = new RegExp(`/${entityName}/(\\d+)`);
    const match = url.match(pattern);
    return match ? match[1] : null;
  }
}

/**
 * Enhanced Guardians Page Object
 */
export class EnhancedGuardiansPage extends EnhancedBasePage {
  private readonly guardiansUrl = '/admin/guardians';
  private readonly createUrl = '/admin/guardians/create';

  async navigateToList(): Promise<void> {
    await this.navigateToWithMonitoring(this.guardiansUrl, 'guardians-list');
  }

  async navigateToCreate(): Promise<void> {
    await this.navigateToWithMonitoring(this.createUrl, 'guardians-create-form');
  }

  async createGuardian(guardianData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    [key: string]: string;
  }): Promise<string> {
    console.log('👨‍👩‍👧‍👦 Creating guardian with enhanced validation...');
    
    await this.navigateToCreate();
    
    // Fill form with validation
    await this.fillFormWithValidation(guardianData);
    
    // Submit with comprehensive monitoring
    await this.interactWithElement(
      'button[type="submit"]',
      'click',
      undefined,
      {
        waitForNetworkIdle: true,
        performanceCheck: true,
        accessibilityCheck: true
      }
    );
    
    // Wait for creation success
    await this.waitForConditions({
      networkIdle: true,
      customCondition: async () => {
        const url = this.page.url();
        return url.includes('/guardians/') && !url.includes('/create');
      }
    });
    
    const currentUrl = this.page.url();
    const guardianId = this.extractIdFromUrl(currentUrl, 'guardians');
    
    if (guardianId) {
      console.log(`✅ Guardian created successfully: ${guardianId}`);
      return guardianId;
    } else {
      throw new Error('Could not extract guardian ID after creation');
    }
  }

  private extractIdFromUrl(url: string, entityName: string): string | null {
    const pattern = new RegExp(`/${entityName}/(\\d+)`);
    const match = url.match(pattern);
    return match ? match[1] : null;
  }
}

/**
 * Factory for creating enhanced page objects
 */
export class EnhancedPageFactory {
  static createStudentsPage(page: Page, options?: PageObjectOptions): EnhancedStudentsPage {
    return new EnhancedStudentsPage(page, options);
  }

  static createGuardiansPage(page: Page, options?: PageObjectOptions): EnhancedGuardiansPage {
    return new EnhancedGuardiansPage(page, options);
  }

  static createBasePage(page: Page, options?: PageObjectOptions): EnhancedBasePage {
    return new EnhancedBasePage(page, options);
  }
}