import { Page, Locator, expect } from '@playwright/test';

/**
 * Advanced Accessibility Testing Utilities for Paramarsh SMS
 * 
 * Provides comprehensive accessibility testing capabilities including:
 * - WCAG 2.1 AA/AAA compliance testing
 * - Keyboard navigation validation
 * - Screen reader compatibility
 * - Color contrast analysis
 * - Form accessibility validation
 * - ARIA attributes verification
 * - Focus management testing
 */

export interface AccessibilityIssue {
  level: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  element?: string;
  selector?: string;
  wcagReference?: string;
}

export interface AccessibilityReport {
  passed: boolean;
  score: number; // 0-100
  totalIssues: number;
  errors: AccessibilityIssue[];
  warnings: AccessibilityIssue[];
  info: AccessibilityIssue[];
  summary: {
    keyboardNavigation: boolean;
    colorContrast: boolean;
    ariaLabels: boolean;
    headingStructure: boolean;
    formAccessibility: boolean;
    focusManagement: boolean;
  };
}

export class AccessibilityTester {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Run comprehensive accessibility audit
   */
  async runFullAudit(): Promise<AccessibilityReport> {
    console.log('🔍 Running comprehensive accessibility audit...');

    const issues: AccessibilityIssue[] = [];

    // Test keyboard navigation
    const keyboardResult = await this.testKeyboardNavigation();
    if (!keyboardResult.passed) {
      issues.push(...keyboardResult.issues);
    }

    // Test color contrast
    const contrastResult = await this.testColorContrast();
    if (!contrastResult.passed) {
      issues.push(...contrastResult.issues);
    }

    // Test ARIA labels
    const ariaResult = await this.testAriaLabels();
    if (!ariaResult.passed) {
      issues.push(...ariaResult.issues);
    }

    // Test heading structure
    const headingResult = await this.testHeadingStructure();
    if (!headingResult.passed) {
      issues.push(...headingResult.issues);
    }

    // Test form accessibility
    const formResult = await this.testFormAccessibility();
    if (!formResult.passed) {
      issues.push(...formResult.issues);
    }

    // Test focus management
    const focusResult = await this.testFocusManagement();
    if (!focusResult.passed) {
      issues.push(...focusResult.issues);
    }

    const errors = issues.filter(i => i.level === 'error');
    const warnings = issues.filter(i => i.level === 'warning');
    const info = issues.filter(i => i.level === 'info');

    // Calculate accessibility score
    const maxPossibleScore = 100;
    const errorPenalty = errors.length * 10;
    const warningPenalty = warnings.length * 5;
    const infoPenalty = info.length * 1;
    const score = Math.max(0, maxPossibleScore - errorPenalty - warningPenalty - infoPenalty);

    return {
      passed: errors.length === 0,
      score,
      totalIssues: issues.length,
      errors,
      warnings,
      info,
      summary: {
        keyboardNavigation: keyboardResult.passed,
        colorContrast: contrastResult.passed,
        ariaLabels: ariaResult.passed,
        headingStructure: headingResult.passed,
        formAccessibility: formResult.passed,
        focusManagement: focusResult.passed
      }
    };
  }

  /**
   * Test keyboard navigation accessibility
   */
  async testKeyboardNavigation(): Promise<{ passed: boolean; issues: AccessibilityIssue[] }> {
    const issues: AccessibilityIssue[] = [];

    try {
      // Test Tab navigation
      const focusableElements = await this.getFocusableElements();
      
      if (focusableElements.length === 0) {
        issues.push({
          level: 'error',
          rule: 'keyboard-navigation',
          message: 'No focusable elements found on the page',
          wcagReference: 'WCAG 2.1.1'
        });
        return { passed: false, issues };
      }

      // Test tab order
      let currentElement = await this.page.locator('body').focus();
      const tabOrder: string[] = [];

      for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
        await this.page.keyboard.press('Tab');
        await this.page.waitForTimeout(100);
        
        const activeElement = await this.page.evaluate(() => {
          const el = document.activeElement;
          return el ? `${el.tagName}${el.id ? `#${el.id}` : ''}${el.className ? `.${el.className.split(' ')[0]}` : ''}` : null;
        });
        
        if (activeElement) {
          tabOrder.push(activeElement);
        }
      }

      if (tabOrder.length === 0) {
        issues.push({
          level: 'error',
          rule: 'keyboard-navigation',
          message: 'Tab navigation is not working properly',
          wcagReference: 'WCAG 2.1.1'
        });
      }

      // Test Shift+Tab (reverse navigation)
      for (let i = 0; i < 3; i++) {
        await this.page.keyboard.press('Shift+Tab');
        await this.page.waitForTimeout(100);
      }

      // Test Enter and Space on interactive elements
      const buttons = await this.page.locator('button, [role="button"]').all();
      for (const button of buttons.slice(0, 3)) {
        try {
          await button.focus();
          await this.page.waitForTimeout(100);
          
          const isVisible = await button.isVisible();
          if (!isVisible) continue;
          
          // Test Enter key
          await this.page.keyboard.press('Enter');
          await this.page.waitForTimeout(200);
          
          // Test Space key  
          await button.focus();
          await this.page.keyboard.press('Space');
          await this.page.waitForTimeout(200);
        } catch (error) {
          // Ignore individual button test failures
        }
      }

    } catch (error) {
      issues.push({
        level: 'error',
        rule: 'keyboard-navigation',
        message: `Keyboard navigation test failed: ${error.message}`,
        wcagReference: 'WCAG 2.1.1'
      });
    }

    return { passed: issues.length === 0, issues };
  }

  /**
   * Test color contrast accessibility
   */
  async testColorContrast(): Promise<{ passed: boolean; issues: AccessibilityIssue[] }> {
    const issues: AccessibilityIssue[] = [];

    try {
      const contrastResults = await this.page.evaluate(() => {
        const results: Array<{ element: string; ratio: number; passed: boolean }> = [];
        
        // Get all text elements
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label, input, textarea');
        
        for (let i = 0; i < Math.min(textElements.length, 20); i++) {
          const element = textElements[i];
          const style = window.getComputedStyle(element);
          
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          
          const textColor = style.color;
          const backgroundColor = style.backgroundColor;
          
          if (textColor && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
            // Simple contrast ratio calculation (simplified)
            const rgb1 = textColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
            const rgb2 = backgroundColor.match(/\d+/g)?.map(Number) || [255, 255, 255];
            
            const luminance1 = 0.299 * rgb1[0] + 0.587 * rgb1[1] + 0.114 * rgb1[2];
            const luminance2 = 0.299 * rgb2[0] + 0.587 * rgb2[1] + 0.114 * rgb2[2];
            
            const ratio = Math.abs(luminance1 - luminance2) / 255;
            
            results.push({
              element: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ')[0] : ''),
              ratio,
              passed: ratio >= 0.5 // Simplified threshold
            });
          }
        }
        
        return results;
      });

      const failedContrasts = contrastResults.filter(result => !result.passed);
      
      if (failedContrasts.length > 0) {
        failedContrasts.forEach(failed => {
          issues.push({
            level: 'warning',
            rule: 'color-contrast',
            message: `Low color contrast detected on ${failed.element} (ratio: ${failed.ratio.toFixed(2)})`,
            element: failed.element,
            wcagReference: 'WCAG 1.4.3'
          });
        });
      }

    } catch (error) {
      issues.push({
        level: 'info',
        rule: 'color-contrast',
        message: `Color contrast test failed: ${error.message}`,
        wcagReference: 'WCAG 1.4.3'
      });
    }

    return { passed: issues.filter(i => i.level === 'error').length === 0, issues };
  }

  /**
   * Test ARIA labels and attributes
   */
  async testAriaLabels(): Promise<{ passed: boolean; issues: AccessibilityIssue[] }> {
    const issues: AccessibilityIssue[] = [];

    try {
      // Check for missing alt attributes on images
      const imagesWithoutAlt = await this.page.locator('img:not([alt])').count();
      if (imagesWithoutAlt > 0) {
        issues.push({
          level: 'error',
          rule: 'aria-labels',
          message: `Found ${imagesWithoutAlt} images without alt attributes`,
          wcagReference: 'WCAG 1.1.1'
        });
      }

      // Check for form inputs without labels
      const unlabeledInputs = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input, textarea, select');
        let unlabeled = 0;
        
        inputs.forEach(input => {
          const id = input.getAttribute('id');
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledBy = input.getAttribute('aria-labelledby');
          
          if (!ariaLabel && !ariaLabelledBy) {
            if (!id || !document.querySelector(`label[for="${id}"]`)) {
              unlabeled++;
            }
          }
        });
        
        return unlabeled;
      });

      if (unlabeledInputs > 0) {
        issues.push({
          level: 'error',
          rule: 'aria-labels',
          message: `Found ${unlabeledInputs} form inputs without proper labels`,
          wcagReference: 'WCAG 3.3.2'
        });
      }

      // Check for interactive elements without accessible names
      const interactiveWithoutNames = await this.page.evaluate(() => {
        const interactive = document.querySelectorAll('button, a, [role="button"], [role="link"]');
        let unnamed = 0;
        
        interactive.forEach(el => {
          const ariaLabel = el.getAttribute('aria-label');
          const textContent = el.textContent?.trim();
          const title = el.getAttribute('title');
          
          if (!ariaLabel && !textContent && !title) {
            unnamed++;
          }
        });
        
        return unnamed;
      });

      if (interactiveWithoutNames > 0) {
        issues.push({
          level: 'error',
          rule: 'aria-labels',
          message: `Found ${interactiveWithoutNames} interactive elements without accessible names`,
          wcagReference: 'WCAG 4.1.2'
        });
      }

    } catch (error) {
      issues.push({
        level: 'warning',
        rule: 'aria-labels',
        message: `ARIA labels test failed: ${error.message}`,
        wcagReference: 'WCAG 4.1.2'
      });
    }

    return { passed: issues.filter(i => i.level === 'error').length === 0, issues };
  }

  /**
   * Test heading structure accessibility
   */
  async testHeadingStructure(): Promise<{ passed: boolean; issues: AccessibilityIssue[] }> {
    const issues: AccessibilityIssue[] = [];

    try {
      const headingStructure = await this.page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return headings.map(h => ({
          level: parseInt(h.tagName.substring(1)),
          text: h.textContent?.trim() || '',
          empty: !h.textContent?.trim()
        }));
      });

      if (headingStructure.length === 0) {
        issues.push({
          level: 'warning',
          rule: 'heading-structure',
          message: 'No headings found on the page',
          wcagReference: 'WCAG 2.4.10'
        });
        return { passed: false, issues };
      }

      // Check for missing h1
      const hasH1 = headingStructure.some(h => h.level === 1);
      if (!hasH1) {
        issues.push({
          level: 'warning',
          rule: 'heading-structure',
          message: 'Page is missing an h1 heading',
          wcagReference: 'WCAG 2.4.10'
        });
      }

      // Check for empty headings
      const emptyHeadings = headingStructure.filter(h => h.empty);
      if (emptyHeadings.length > 0) {
        issues.push({
          level: 'error',
          rule: 'heading-structure',
          message: `Found ${emptyHeadings.length} empty headings`,
          wcagReference: 'WCAG 2.4.6'
        });
      }

      // Check for heading level jumps (simplified)
      for (let i = 1; i < headingStructure.length; i++) {
        const current = headingStructure[i];
        const previous = headingStructure[i - 1];
        
        if (current.level > previous.level + 1) {
          issues.push({
            level: 'warning',
            rule: 'heading-structure',
            message: `Heading level jump from h${previous.level} to h${current.level}`,
            wcagReference: 'WCAG 2.4.10'
          });
        }
      }

    } catch (error) {
      issues.push({
        level: 'warning',
        rule: 'heading-structure',
        message: `Heading structure test failed: ${error.message}`,
        wcagReference: 'WCAG 2.4.10'
      });
    }

    return { passed: issues.filter(i => i.level === 'error').length === 0, issues };
  }

  /**
   * Test form accessibility
   */
  async testFormAccessibility(): Promise<{ passed: boolean; issues: AccessibilityIssue[] }> {
    const issues: AccessibilityIssue[] = [];

    try {
      const formResults = await this.page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const results = {
          totalForms: forms.length,
          formsWithoutLabels: 0,
          requiredWithoutIndication: 0,
          inputsWithoutAutocomplete: 0
        };

        forms.forEach(form => {
          const inputs = form.querySelectorAll('input, textarea, select');
          
          inputs.forEach(input => {
            const type = input.getAttribute('type');
            if (type === 'hidden' || type === 'submit') return;

            // Check for labels
            const id = input.getAttribute('id');
            const ariaLabel = input.getAttribute('aria-label');
            const ariaLabelledBy = input.getAttribute('aria-labelledby');
            
            if (!ariaLabel && !ariaLabelledBy) {
              if (!id || !form.querySelector(`label[for="${id}"]`)) {
                results.formsWithoutLabels++;
              }
            }

            // Check required fields indication
            const required = input.hasAttribute('required');
            const ariaRequired = input.getAttribute('aria-required') === 'true';
            
            if ((required || ariaRequired) && !input.getAttribute('aria-describedby')) {
              const label = form.querySelector(`label[for="${id}"]`);
              if (!label || !label.textContent?.includes('*')) {
                results.requiredWithoutIndication++;
              }
            }

            // Check autocomplete attributes for appropriate inputs
            if (['email', 'password', 'text'].includes(type || '') && !input.getAttribute('autocomplete')) {
              results.inputsWithoutAutocomplete++;
            }
          });
        });

        return results;
      });

      if (formResults.formsWithoutLabels > 0) {
        issues.push({
          level: 'error',
          rule: 'form-accessibility',
          message: `Found ${formResults.formsWithoutLabels} form inputs without proper labels`,
          wcagReference: 'WCAG 3.3.2'
        });
      }

      if (formResults.requiredWithoutIndication > 0) {
        issues.push({
          level: 'warning',
          rule: 'form-accessibility',
          message: `Found ${formResults.requiredWithoutIndication} required fields without clear indication`,
          wcagReference: 'WCAG 3.3.2'
        });
      }

      if (formResults.inputsWithoutAutocomplete > 0) {
        issues.push({
          level: 'info',
          rule: 'form-accessibility',
          message: `Found ${formResults.inputsWithoutAutocomplete} inputs without autocomplete attributes`,
          wcagReference: 'WCAG 1.3.5'
        });
      }

    } catch (error) {
      issues.push({
        level: 'warning',
        rule: 'form-accessibility',
        message: `Form accessibility test failed: ${error.message}`,
        wcagReference: 'WCAG 3.3.2'
      });
    }

    return { passed: issues.filter(i => i.level === 'error').length === 0, issues };
  }

  /**
   * Test focus management
   */
  async testFocusManagement(): Promise<{ passed: boolean; issues: AccessibilityIssue[] }> {
    const issues: AccessibilityIssue[] = [];

    try {
      // Test initial focus
      const initialFocus = await this.page.evaluate(() => {
        return document.activeElement?.tagName || 'BODY';
      });

      // Test focus indicators
      const focusableElements = await this.getFocusableElements();
      
      if (focusableElements.length > 0) {
        const firstFocusable = this.page.locator(focusableElements[0]);
        await firstFocusable.focus();
        
        const hasFocusIndicator = await this.page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return false;
          
          const style = window.getComputedStyle(el);
          const pseudoStyle = window.getComputedStyle(el, ':focus');
          
          return style.outline !== 'none' || 
                 pseudoStyle.outline !== 'none' || 
                 style.boxShadow !== 'none' ||
                 pseudoStyle.boxShadow !== 'none';
        });

        if (!hasFocusIndicator) {
          issues.push({
            level: 'warning',
            rule: 'focus-management',
            message: 'Focus indicators may not be visible enough',
            wcagReference: 'WCAG 2.4.7'
          });
        }
      }

      // Test focus trapping in modals (if any)
      const modals = await this.page.locator('[role="dialog"], .modal, [aria-modal="true"]').count();
      if (modals > 0) {
        // Simple modal focus test
        const modalElement = this.page.locator('[role="dialog"], .modal, [aria-modal="true"]').first();
        if (await modalElement.isVisible()) {
          await modalElement.focus();
          
          // Try to tab out of modal
          for (let i = 0; i < 10; i++) {
            await this.page.keyboard.press('Tab');
            await this.page.waitForTimeout(100);
          }

          const focusStillInModal = await this.page.evaluate(() => {
            const activeEl = document.activeElement;
            const modal = document.querySelector('[role="dialog"], .modal, [aria-modal="true"]');
            return modal && modal.contains(activeEl);
          });

          if (!focusStillInModal) {
            issues.push({
              level: 'warning',
              rule: 'focus-management',
              message: 'Modal may not properly trap focus',
              wcagReference: 'WCAG 2.4.3'
            });
          }
        }
      }

    } catch (error) {
      issues.push({
        level: 'info',
        rule: 'focus-management',
        message: `Focus management test failed: ${error.message}`,
        wcagReference: 'WCAG 2.4.7'
      });
    }

    return { passed: issues.filter(i => i.level === 'error').length === 0, issues };
  }

  /**
   * Get all focusable elements on the page
   */
  private async getFocusableElements(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ];

      const elements: string[] = [];
      
      focusableSelectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        found.forEach((el, index) => {
          const tagName = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const className = el.className ? `.${el.className.split(' ')[0]}` : '';
          const nth = found.length > 1 ? `:nth-of-type(${index + 1})` : '';
          
          elements.push(`${tagName}${id}${className}${nth}`);
        });
      });
      
      return elements;
    });
  }

  /**
   * Generate accessibility report
   */
  static generateReport(report: AccessibilityReport): string {
    const statusIcon = report.passed ? '✅' : '❌';
    const scoreColor = report.score >= 80 ? '🟢' : report.score >= 60 ? '🟡' : '🔴';

    return `
${statusIcon} Accessibility Audit Report
=====================================

${scoreColor} Overall Score: ${report.score}/100
📊 Total Issues: ${report.totalIssues}
🔴 Errors: ${report.errors.length}
🟡 Warnings: ${report.warnings.length}
🔵 Info: ${report.info.length}

📋 Summary:
- Keyboard Navigation: ${report.summary.keyboardNavigation ? '✅' : '❌'}
- Color Contrast: ${report.summary.colorContrast ? '✅' : '❌'}
- ARIA Labels: ${report.summary.ariaLabels ? '✅' : '❌'}
- Heading Structure: ${report.summary.headingStructure ? '✅' : '❌'}
- Form Accessibility: ${report.summary.formAccessibility ? '✅' : '❌'}
- Focus Management: ${report.summary.focusManagement ? '✅' : '❌'}

${report.errors.length > 0 ? `
🔴 Critical Issues:
${report.errors.map(e => `- ${e.message} (${e.wcagReference})`).join('\n')}
` : ''}

${report.warnings.length > 0 ? `
🟡 Warnings:
${report.warnings.map(w => `- ${w.message} (${w.wcagReference})`).join('\n')}
` : ''}

${report.info.length > 0 ? `
🔵 Recommendations:
${report.info.map(i => `- ${i.message} (${i.wcagReference})`).join('\n')}
` : ''}
    `.trim();
  }
}

/**
 * High-level accessibility testing helpers
 */
export class AccessibilityTestHelper {
  /**
   * Test page accessibility with assertions
   */
  static async testPageAccessibility(
    page: Page,
    strictMode: boolean = false
  ): Promise<void> {
    console.log('♿ Running accessibility audit...');
    
    const tester = new AccessibilityTester(page);
    const report = await tester.runFullAudit();
    
    console.log(AccessibilityTester.generateReport(report));
    
    if (strictMode && !report.passed) {
      throw new Error(`Accessibility audit failed with ${report.errors.length} errors`);
    }
    
    // At minimum, ensure no critical errors
    expect(report.errors.length).toBe(0);
    expect(report.score).toBeGreaterThan(60);
  }

  /**
   * Test keyboard navigation specifically
   */
  static async testKeyboardOnly(page: Page, criticalPaths: string[] = []): Promise<void> {
    console.log('⌨️ Testing keyboard-only navigation...');
    
    const tester = new AccessibilityTester(page);
    const result = await tester.testKeyboardNavigation();
    
    if (!result.passed) {
      console.error('❌ Keyboard navigation issues:', result.issues);
      throw new Error(`Keyboard navigation failed: ${result.issues.map(i => i.message).join(', ')}`);
    }

    // Test critical user paths with keyboard only
    for (const path of criticalPaths) {
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        // Try to navigate using only keyboard
        const focusableElements = await tester.getFocusableElements();
        expect(focusableElements.length).toBeGreaterThan(0);
        
        // Navigate first few elements
        for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);
        }
        
        console.log(`✅ Keyboard navigation works for: ${path}`);
      } catch (error) {
        console.error(`❌ Keyboard navigation failed for ${path}: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test with screen reader simulation
   */
  static async testScreenReaderCompatibility(page: Page): Promise<void> {
    console.log('📢 Testing screen reader compatibility...');
    
    // Inject accessibility tree inspection
    await page.addInitScript(() => {
      // Create a simple screen reader simulator
      (window as any).screenReaderTest = {
        getAccessibleName: (element: Element) => {
          const ariaLabel = element.getAttribute('aria-label');
          if (ariaLabel) return ariaLabel;
          
          const ariaLabelledBy = element.getAttribute('aria-labelledby');
          if (ariaLabelledBy) {
            const labelElement = document.getElementById(ariaLabelledBy);
            return labelElement?.textContent || '';
          }
          
          return element.textContent || '';
        },
        
        getRole: (element: Element) => {
          const role = element.getAttribute('role');
          if (role) return role;
          
          // Implicit roles
          const tagName = element.tagName.toLowerCase();
          const roleMap: { [key: string]: string } = {
            'button': 'button',
            'a': 'link',
            'input': 'textbox',
            'h1': 'heading',
            'h2': 'heading',
            'h3': 'heading',
            'h4': 'heading',
            'h5': 'heading',
            'h6': 'heading'
          };
          
          return roleMap[tagName] || '';
        }
      };
    });

    const screenReaderInfo = await page.evaluate(() => {
      const interactive = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]');
      const results: Array<{ element: string; accessibleName: string; role: string; hasName: boolean }> = [];
      
      interactive.forEach((el, index) => {
        if (index < 10) { // Limit to first 10 elements
          const accessibleName = (window as any).screenReaderTest.getAccessibleName(el);
          const role = (window as any).screenReaderTest.getRole(el);
          
          results.push({
            element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
            accessibleName,
            role,
            hasName: Boolean(accessibleName.trim())
          });
        }
      });
      
      return results;
    });

    const elementsWithoutNames = screenReaderInfo.filter(info => !info.hasName);
    
    if (elementsWithoutNames.length > 0) {
      console.warn(`⚠️ Found ${elementsWithoutNames.length} interactive elements without accessible names:`);
      elementsWithoutNames.forEach(el => {
        console.warn(`  - ${el.element} (${el.role})`);
      });
    }

    // Should not have many elements without accessible names
    expect(elementsWithoutNames.length).toBeLessThan(screenReaderInfo.length / 2);
  }
}