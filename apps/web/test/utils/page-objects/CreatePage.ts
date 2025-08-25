import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export class CreatePage {
  async waitForFormToLoad() {
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  }

  expectNoMUIComponents(container: HTMLElement) {
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  }

  async expectCreateForm() {
    await this.waitForFormToLoad();
    
    // Check for form elements
    const form = screen.getByRole('form') || 
                 screen.getByTestId('create-form') ||
                 document.querySelector('form');
    
    expect(form).toBeInTheDocument();
    
    // Check for save/submit button
    const saveButton = screen.getByRole('button', { name: /save/i }) ||
                      screen.getByRole('button', { name: /create/i }) ||
                      screen.getByRole('button', { name: /submit/i });
    expect(saveButton).toBeInTheDocument();
  }

  async fillField(fieldName: string, value: string) {
    const user = userEvent.setup();
    
    // Try multiple ways to find the field
    let field = screen.queryByRole('textbox', { name: new RegExp(fieldName, 'i') }) ||
                screen.queryByRole('textbox') ||
                screen.queryByLabelText(new RegExp(fieldName, 'i')) ||
                screen.queryByPlaceholderText(new RegExp(fieldName, 'i')) ||
                screen.queryByDisplayValue('') ||
                document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement ||
                document.querySelector(`input[id*="${fieldName}"]`) as HTMLInputElement ||
                document.querySelector(`textarea[name="${fieldName}"]`) as HTMLTextAreaElement;

    if (field) {
      await user.clear(field);
      await user.type(field, value);
    } else {
      // If field not found, log available fields for debugging
      const allInputs = screen.getAllByRole('textbox');
      console.warn(`Field "${fieldName}" not found. Available inputs:`, allInputs.length);
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

  async checkCheckbox(fieldName: string, checked = true) {
    const user = userEvent.setup();
    
    const checkbox = screen.queryByRole('checkbox', { name: new RegExp(fieldName, 'i') }) ||
                     screen.queryByLabelText(new RegExp(fieldName, 'i')) ||
                     document.querySelector(`input[name="${fieldName}"][type="checkbox"]`) as HTMLInputElement;

    if (checkbox && checkbox.checked !== checked) {
      await user.click(checkbox);
    }
  }

  async fillDateField(fieldName: string, dateValue: string) {
    const user = userEvent.setup();
    
    const dateField = screen.queryByLabelText(new RegExp(fieldName, 'i')) ||
                      document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement ||
                      document.querySelector(`input[type="date"]`) as HTMLInputElement;

    if (dateField) {
      await user.clear(dateField);
      await user.type(dateField, dateValue);
    }
  }

  async submitForm() {
    const user = userEvent.setup();
    
    const submitButton = screen.getByRole('button', { name: /save/i }) ||
                        screen.getByRole('button', { name: /create/i }) ||
                        screen.getByRole('button', { name: /submit/i });
    
    await user.click(submitButton);
    
    // Wait for potential navigation or success message
    await waitFor(() => {
      // Form should either be submitted (disappeared) or show success/error
      const isStillSubmitting = screen.queryByText(/saving/i) || 
                               screen.queryByText(/creating/i);
      expect(isStillSubmitting).not.toBeInTheDocument();
    }, { timeout: 5000 });
  }

  async expectValidationError(fieldName?: string, errorMessage?: string) {
    await waitFor(() => {
      if (fieldName && errorMessage) {
        // Look for specific field error
        const error = screen.getByText(new RegExp(errorMessage, 'i'));
        expect(error).toBeInTheDocument();
      } else if (fieldName) {
        // Look for any error near the field
        const fieldElement = screen.getByLabelText(new RegExp(fieldName, 'i'));
        const fieldContainer = fieldElement.closest('[class*="field"]') || fieldElement.parentElement;
        const errorInContainer = fieldContainer?.querySelector('[class*="error"]') || 
                                fieldContainer?.querySelector('[role="alert"]');
        expect(errorInContainer).toBeInTheDocument();
      } else {
        // Look for any validation error
        const error = screen.getByRole('alert') ||
                     screen.getByText(/required/i) ||
                     screen.getByText(/invalid/i);
        expect(error).toBeInTheDocument();
      }
    });
  }

  async expectSuccessMessage() {
    await waitFor(() => {
      const success = screen.getByText(/created/i) ||
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

  // Helper method to fill a complete form with test data
  async fillFormWithData(formData: Record<string, any>) {
    await this.waitForFormToLoad();
    
    for (const [fieldName, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        if (fieldName.toLowerCase().includes('date')) {
          await this.fillDateField(fieldName, value);
        } else {
          await this.fillField(fieldName, value);
        }
      } else if (typeof value === 'boolean') {
        await this.checkCheckbox(fieldName, value);
      }
    }
  }

  // Helper to test form with date fields safely
  async expectSafeDateHandling() {
    await this.waitForFormToLoad();
    
    // Check that no date errors are shown in form
    expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  }

  // Helper to get all form field values for verification
  getFormData(): Record<string, any> {
    const formData: Record<string, any> = {};
    
    // Get all input values
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
}

export const getCreatePage = () => new CreatePage();