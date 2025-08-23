import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export class ShowPage {
  async waitForDataToLoad() {
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  }

  expectNoMUIComponents(container: HTMLElement) {
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  }

  async expectNoDateErrors() {
    await waitFor(() => {
      expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
    });
  }

  async expectShowPage(recordId?: string | number) {
    await this.waitForDataToLoad();
    
    // Check for show/detail view structure
    const mainContent = screen.getByRole('main') || 
                       screen.getByTestId('show-page') ||
                       document.querySelector('[class*="show"], [class*="detail"]');
    
    expect(mainContent).toBeInTheDocument();

    // If recordId provided, verify we're viewing the right record
    if (recordId) {
      // Look for the ID in content or URL
      const content = mainContent?.textContent || '';
      expect(content).toContain(recordId.toString());
    }
  }

  async expectFieldValue(fieldLabel: string, expectedValue: string | null) {
    await this.waitForDataToLoad();
    
    if (expectedValue === null || expectedValue === undefined) {
      // For null/undefined values, expect either empty display or "Not set" type message
      const fieldElement = this.findFieldByLabel(fieldLabel);
      if (fieldElement) {
        const value = fieldElement.textContent || '';
        expect(value).toMatch(/^$|not set|n\/a|none|empty/i);
      }
    } else {
      // Look for the field and its value
      const fieldElement = this.findFieldByLabel(fieldLabel);
      if (fieldElement) {
        expect(fieldElement.textContent).toContain(expectedValue);
      } else {
        // Alternative: look for the value directly
        expect(screen.getByText(expectedValue)).toBeInTheDocument();
      }
    }
  }

  private findFieldByLabel(fieldLabel: string): HTMLElement | null {
    // Try to find field by label
    const labelElement = screen.queryByText(new RegExp(`${fieldLabel}:?`, 'i'));
    if (labelElement) {
      // Look for value in next sibling or nearby element
      const valueElement = labelElement.nextElementSibling || 
                          labelElement.parentElement?.nextElementSibling ||
                          labelElement.closest('[class*="field"]')?.querySelector('[class*="value"]');
      return valueElement as HTMLElement;
    }

    // Try to find by data attributes
    return document.querySelector(`[data-field="${fieldLabel}"]`) ||
           document.querySelector(`[data-label*="${fieldLabel}"]`) as HTMLElement;
  }

  async expectDateFieldSafeRendering(fieldLabel: string, originalDate: any) {
    await this.waitForDataToLoad();
    await this.expectNoDateErrors();
    
    const fieldElement = this.findFieldByLabel(fieldLabel);
    if (fieldElement) {
      const displayedValue = fieldElement.textContent || '';
      
      if (originalDate === null || originalDate === undefined || originalDate === '') {
        // Null dates should display as empty or "Not set"
        expect(displayedValue).toMatch(/^$|not set|n\/a|none|empty|-/i);
      } else if (originalDate === 'invalid-date' || originalDate === 'not-a-date') {
        // Invalid dates should not crash the component
        expect(displayedValue).not.toContain('Invalid time value');
        expect(displayedValue).not.toContain('Invalid Date');
      } else {
        // Valid dates should display in a readable format
        expect(displayedValue).toBeTruthy();
        expect(displayedValue).not.toContain('Invalid');
      }
    }
  }

  async expectAllFieldsRendered(expectedData: Record<string, any>) {
    await this.waitForDataToLoad();
    
    for (const [fieldName, expectedValue] of Object.entries(expectedData)) {
      if (expectedValue !== null && expectedValue !== undefined) {
        await this.expectFieldValue(fieldName, expectedValue.toString());
      }
    }
  }

  async clickEditButton() {
    const user = userEvent.setup();
    const editButton = screen.getByRole('button', { name: /edit/i }) ||
                      screen.getByRole('link', { name: /edit/i });
    await user.click(editButton);
  }

  async clickDeleteButton() {
    const user = userEvent.setup();
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    // Handle confirmation dialog
    await waitFor(async () => {
      const confirmButton = screen.queryByRole('button', { name: /confirm/i }) ||
                           screen.queryByRole('button', { name: /delete/i });
      if (confirmButton) {
        await user.click(confirmButton);
      }
    });
  }

  async goBack() {
    const user = userEvent.setup();
    const backButton = screen.getByRole('button', { name: /back/i }) ||
                      screen.getByRole('link', { name: /back/i }) ||
                      screen.getByRole('link', { name: /list/i });
    await user.click(backButton);
  }

  async expectRelatedData(relationName: string, expectedItems: any[]) {
    await this.waitForDataToLoad();
    
    // Look for related data section
    const relationSection = screen.queryByText(new RegExp(relationName, 'i'))?.closest('[class*="section"]') ||
                           document.querySelector(`[data-relation="${relationName}"]`);
    
    if (relationSection && expectedItems.length > 0) {
      expectedItems.forEach(item => {
        if (item.name || item.title) {
          expect(screen.getByText(item.name || item.title)).toBeInTheDocument();
        }
      });
    }
  }

  async expectErrorState() {
    const errorMessage = screen.getByText(/error/i) || 
                        screen.getByText(/failed/i) ||
                        screen.getByText(/not found/i) ||
                        screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
  }

  async expectLoadingState() {
    const loadingElement = screen.getByText(/loading/i) ||
                          screen.getByRole('progressbar') ||
                          screen.getByTestId('loading');
    expect(loadingElement).toBeInTheDocument();
  }

  // Helper to test show page with complex date scenarios
  async expectSafeDateHandling(testData: Record<string, any>) {
    await this.waitForDataToLoad();
    await this.expectNoDateErrors();
    
    // Test each date field for safe rendering
    Object.keys(testData).forEach(async (key) => {
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
        await this.expectDateFieldSafeRendering(key, testData[key]);
      }
    });
  }

  // Helper to get all visible content for debugging
  getVisibleContent(): string {
    const main = screen.getByRole('main') || document.body;
    return main.textContent || '';
  }

  // Helper to verify no sensitive data is displayed
  expectNoSensitiveData(sensitiveFields: string[]) {
    const content = this.getVisibleContent();
    
    sensitiveFields.forEach(sensitiveField => {
      expect(content).not.toContain(sensitiveField);
    });
  }

  // Helper to check if all navigation buttons are working
  async expectNavigationButtons() {
    await this.waitForDataToLoad();
    
    const editButton = screen.queryByRole('button', { name: /edit/i }) ||
                      screen.queryByRole('link', { name: /edit/i });
    const deleteButton = screen.queryByRole('button', { name: /delete/i });
    const backButton = screen.queryByRole('button', { name: /back/i }) ||
                      screen.queryByRole('link', { name: /back/i });
    
    // At least back button should be present
    expect(backButton).toBeInTheDocument();
    
    return {
      hasEdit: !!editButton,
      hasDelete: !!deleteButton,
      hasBack: !!backButton
    };
  }
}

export const getShowPage = () => new ShowPage();