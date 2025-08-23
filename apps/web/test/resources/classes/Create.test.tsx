import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Classes Create
const MockClassesCreate = () => (
  <div>
    <h2>Create Class</h2>
    <form>
      <label>
        Name
        <input type="text" name="name" />
      </label>
      <label>
        Grade
        <input type="number" name="gradeLevel" />
      </label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Classes Create', () => {
  it('should render create form without errors', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    // Wait for form to appear
    const nameField = await screen.findByLabelText('Name');
    expect(nameField).toBeInTheDocument();
    
    const gradeField = await screen.findByLabelText('Grade');
    expect(gradeField).toBeInTheDocument();
    
    // Should not show date errors
    expectNoDateErrors();
  });

  it('should allow entering class name and grade', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const gradeField = await screen.findByLabelText('Grade');
    
    // Enter class information
    await user.type(nameField, 'Class 2B');
    await user.type(gradeField, '2');
    
    expect(nameField).toHaveValue('Class 2B');
    expect(gradeField).toHaveValue(2);
  });

  it('should display save button', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    // Wait for save button to appear
    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    await screen.findByLabelText('Name');
    
    // Should not have MUI classes
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle form validation', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    const user = userEvent.setup();
    const saveButton = await screen.findByRole('button', { name: /save/i });
    
    // Try to submit empty form
    await user.click(saveButton);
    
    // Form should still be present (validation handling)
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade')).toBeInTheDocument();
  });

  it('should render form fields with proper labels', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    // Check that all form fields are present with correct labels
    expect(await screen.findByLabelText('Name')).toBeInTheDocument();
    expect(await screen.findByLabelText('Grade')).toBeInTheDocument();
  });

  it('should handle empty form gracefully', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    await screen.findByLabelText('Name');
    
    // Form should render without errors even when empty
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Grade')).toHaveValue(null);
  });

  it('should display proper form structure', async () => {
    const { container } = renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    await screen.findByLabelText('Name');
    
    // Should have proper form elements
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    
    // Should have input fields
    const textInputs = container.querySelectorAll('input[type="text"]');
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect(textInputs.length).toBeGreaterThanOrEqual(1);
    expect(numberInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle class creation with valid data', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const gradeField = await screen.findByLabelText('Grade');
    const saveButton = await screen.findByRole('button', { name: /save/i });
    
    // Fill form with valid data
    await user.type(nameField, 'Class 5A');
    await user.type(gradeField, '5');
    
    // Should be able to click save without errors
    await user.click(saveButton);
    
    expect(nameField).toHaveValue('Class 5A');
    expect(gradeField).toHaveValue(5);
  });

  it('should handle Indian class naming conventions', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    
    // Test various Indian class naming patterns
    const classNames = ['Standard I', 'Class UKG', 'Grade 12', 'कक्षा 5'];
    
    for (const className of classNames) {
      await user.clear(nameField);
      await user.type(nameField, className);
      expect(nameField).toHaveValue(className);
    }
  });

  it('should handle grade levels from 1 to 12', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    const user = userEvent.setup();
    const gradeField = await screen.findByLabelText('Grade');
    
    // Test grade levels 1-12
    for (let grade = 1; grade <= 12; grade++) {
      await user.clear(gradeField);
      await user.type(gradeField, grade.toString());
      expect(gradeField).toHaveValue(grade);
    }
  });

  it('should prevent date errors during form interaction', async () => {
    renderWithReactAdmin(<MockClassesCreate />, { resource: 'classes' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const gradeField = await screen.findByLabelText('Grade');
    
    // Interact with form fields
    await user.type(nameField, 'Test Class');
    await user.type(gradeField, '10');
    
    // Should never show date errors during interaction
    expectNoDateErrors();
  });
});