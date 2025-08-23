import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export class EditPage {
  async waitForFormToLoad() {
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  }

  expectNoMUIComponents(container: HTMLElement) {
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  }

  async expectEditForm(recordId?: string | number) {
    await this.waitForFormToLoad();
    
    // Check for form elements
    const form = screen.getByRole('form') || 
                 screen.getByTestId('edit-form') ||
                 document.querySelector('form');
    
    expect(form).toBeInTheDocument();
    
    // Check for save/update button
    const saveButton = screen.getByRole('button', { name: /save/i }) ||
                      screen.getByRole('button', { name: /update/i });
    expect(saveButton).toBeInTheDocument();

    // If recordId provided, verify we're editing the right record
    if (recordId) {
      // Look for the ID in form or URL
      const idField = document.querySelector('input[name="id"]') as HTMLInputElement;
      if (idField) {
        expect(idField.value).toBe(recordId.toString());
      }
    }
  }

  async expectPrefilledForm(expectedData: Record<string, any>) {
    await this.waitForFormToLoad();
    
    for (const [fieldName, expectedValue] of Object.entries(expectedData)) {
      if (expectedValue !== null && expectedValue !== undefined) {
        const field = this.findFormField(fieldName);
        
        if (field) {
          if (field.type === 'checkbox') {
            expect((field as HTMLInputElement).checked).toBe(Boolean(expectedValue));
          } else {
            expect(field.value).toBe(expectedValue.toString());
          }
        }
      }
    }
  }

  private findFormField(fieldName: string): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
    return (
      screen.queryByRole('textbox', { name: new RegExp(fieldName, 'i') }) ||
      screen.queryByLabelText(new RegExp(fieldName, 'i')) ||
      screen.queryByDisplayValue(/.+/) ||
      document.querySelector(`input[name="${fieldName}"]`) ||
      document.querySelector(`select[name="${fieldName}"]`) ||
      document.querySelector(`textarea[name="${fieldName}"]`)
    ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  }

  async updateField(fieldName: string, newValue: string) {
    const user = userEvent.setup();
    const field = this.findFormField(fieldName);
    
    if (field) {
      await user.clear(field);
      await user.type(field, newValue);
    } else {
      console.warn(`Field "${fieldName}" not found for update`);
    }
  }

  async selectOption(fieldName: string, optionValue: string) {
    const user = userEvent.setup();
    
    const select = screen.queryByRole('combobox', { name: new RegExp(fieldName, 'i') }) ||
                   screen.queryByLabelText(new RegExp(fieldName, 'i')) ||
                   document.querySelector(`select[name="${fieldName}"]`) as HTMLSelectElement;

    if (select) {
      await user.selectOptions(select, optionValue);
    }
  }

  async toggleCheckbox(fieldName: string) {
    const user = userEvent.setup();
    
    const checkbox = screen.queryByRole('checkbox', { name: new RegExp(fieldName, 'i') }) ||
                     screen.queryByLabelText(new RegExp(fieldName, 'i')) ||
                     document.querySelector(`input[name="${fieldName}"][type="checkbox"]`) as HTMLInputElement;

    if (checkbox) {
      await user.click(checkbox);
    }
  }

  async updateDateField(fieldName: string, dateValue: string) {
    const user = userEvent.setup();
    
    const dateField = screen.queryByLabelText(new RegExp(fieldName, 'i')) ||
                      document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement ||
                      document.querySelector(`input[type="date"]`) as HTMLInputElement;

    if (dateField) {
      await user.clear(dateField);
      await user.type(dateField, dateValue);
    }
  }

  async saveChanges() {
    const user = userEvent.setup();
    
    const saveButton = screen.getByRole('button', { name: /save/i }) ||
                      screen.getByRole('button', { name: /update/i });
    
    await user.click(saveButton);
    
    // Wait for save completion
    await waitFor(() => {
      const isSaving = screen.queryByText(/saving/i) || 
                       screen.queryByText(/updating/i);
      expect(isSaving).not.toBeInTheDocument();
    }, { timeout: 5000 });
  }

  async deleteRecord() {
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
    
    // Wait for deletion completion
    await waitFor(() => {
      const isDeleting = screen.queryByText(/deleting/i);
      expect(isDeleting).not.toBeInTheDocument();
    }, { timeout: 5000 });
  }

  async expectValidationError(fieldName?: string, errorMessage?: string) {
    await waitFor(() => {
      if (fieldName && errorMessage) {
        const error = screen.getByText(new RegExp(errorMessage, 'i'));
        expect(error).toBeInTheDocument();
      } else if (fieldName) {
        const fieldElement = screen.getByLabelText(new RegExp(fieldName, 'i'));
        const fieldContainer = fieldElement.closest('[class*="field"]') || fieldElement.parentElement;
        const errorInContainer = fieldContainer?.querySelector('[class*="error"]') || 
                                fieldContainer?.querySelector('[role="alert"]');
        expect(errorInContainer).toBeInTheDocument();
      } else {
        const error = screen.getByRole('alert') ||
                     screen.getByText(/required/i) ||
                     screen.getByText(/invalid/i);
        expect(error).toBeInTheDocument();
      }
    });
  }

  async expectSuccessMessage() {
    await waitFor(() => {
      const success = screen.getByText(/updated/i) ||
                     screen.getByText(/saved/i) ||
                     screen.getByText(/success/i) ||
                     screen.getByRole('alert');
      expect(success).toBeInTheDocument();
    });
  }

  async goBack() {
    const user = userEvent.setup();
    
    const backButton = screen.getByRole('button', { name: /back/i }) ||
                      screen.getByRole('button', { name: /cancel/i }) ||
                      screen.getByRole('link', { name: /back/i });
    
    await user.click(backButton);
  }

  // Helper method to update multiple fields at once
  async updateFormWithData(updateData: Record<string, any>) {
    await this.waitForFormToLoad();
    
    for (const [fieldName, value] of Object.entries(updateData)) {
      if (typeof value === 'string') {
        if (fieldName.toLowerCase().includes('date')) {
          await this.updateDateField(fieldName, value);
        } else {
          await this.updateField(fieldName, value);
        }
      } else if (typeof value === 'boolean') {
        const field = this.findFormField(fieldName);
        if (field && field.type === 'checkbox') {
          const currentValue = (field as HTMLInputElement).checked;
          if (currentValue !== value) {
            await this.toggleCheckbox(fieldName);
          }
        }
      }
    }
  }

  // Helper to test edit form with date fields safely
  async expectSafeDateHandling(originalData: Record<string, any>) {
    await this.waitForFormToLoad();
    
    // Check that no date errors are shown in form
    expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
    
    // Verify date fields are handled properly
    Object.keys(originalData).forEach(key => {
      if (key.toLowerCase().includes('date')) {
        const dateField = this.findFormField(key);
        if (dateField) {
          // Date field should either be empty or have a valid formatted date
          expect(dateField.value).not.toContain('Invalid');
        }
      }
    });
  }

  // Helper to compare form state before and after changes
  getFormData(): Record<string, any> {
    const formData: Record<string, any> = {};
    
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const element = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (element.name) {
        if (element.type === 'checkbox') {
          formData[element.name] = (element as HTMLInputElement).checked;
        } else {
          formData[element.name] = element.value;
        }
      }
    });
    
    return formData;
  }

  async expectFormFieldValue(fieldName: string, expectedValue: string | boolean) {
    const field = this.findFormField(fieldName);
    
    if (field) {
      if (typeof expectedValue === 'boolean') {
        expect((field as HTMLInputElement).checked).toBe(expectedValue);
      } else {
        expect(field.value).toBe(expectedValue);
      }
    } else {
      throw new Error(`Field "${fieldName}" not found`);
    }
  }
}

export const getEditPage = () => new EditPage();