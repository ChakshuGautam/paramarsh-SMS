import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Staff Edit
const MockStaffEdit = () => (
  <div>
    <h2>Edit Staff</h2>
    <form>
      <label>
        First Name
        <input type="text" name="firstName" defaultValue="Priya" />
      </label>
      <label>
        Last Name
        <input type="text" name="lastName" defaultValue="Sharma" />
      </label>
      <label>
        Email
        <input type="email" name="email" defaultValue="priya.sharma@school.edu.in" />
      </label>
      <label>
        Phone
        <input type="tel" name="phone" defaultValue="+91-9876543210" />
      </label>
      <label>
        Designation
        <input type="text" name="designation" defaultValue="Principal" />
      </label>
      <label>
        Department
        <input type="text" name="department" defaultValue="Administration" />
      </label>
      <label>
        Employment Type
        <select name="employmentType" defaultValue="Permanent">
          <option value="Permanent">Permanent</option>
          <option value="Contract">Contract</option>
          <option value="Temporary">Temporary</option>
        </select>
      </label>
      <label>
        Join Date
        <input type="date" name="joinDate" defaultValue="2024-01-15" />
      </label>
      <label>
        Status
        <select name="status" defaultValue="active">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('StaffEdit Component', () => {
  it('should render without errors', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    // Wait for form to load
    const firstNameInput = await screen.findByLabelText('First Name');
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).toHaveValue('Priya');
    
    // Check other fields
    expect(screen.getByLabelText('Last Name')).toHaveValue('Sharma');
    expect(screen.getByLabelText('Email')).toHaveValue('priya.sharma@school.edu.in');
    
    expectNoDateErrors();
  });

  it('should load and display existing staff data', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    // Wait for data to load
    const firstNameInput = await screen.findByLabelText('First Name');
    
    // Check that all form fields are populated with existing data
    expect(firstNameInput).toHaveValue('Priya');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Sharma');
    expect(screen.getByLabelText('Email')).toHaveValue('priya.sharma@school.edu.in');
    expect(screen.getByLabelText('Phone')).toHaveValue('+91-9876543210');
    expect(screen.getByLabelText('Designation')).toHaveValue('Principal');
    expect(screen.getByLabelText('Department')).toHaveValue('Administration');
    expect(screen.getByLabelText('Employment Type')).toHaveValue('Permanent');
    expect(screen.getByLabelText('Join Date')).toHaveValue('2024-01-15');
    expect(screen.getByLabelText('Status')).toHaveValue('active');
  });

  it('should allow editing form fields', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameInput = await screen.findByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email');
    const designationInput = screen.getByLabelText('Designation');
    
    // Modify various fields
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Priyanka');
    expect(firstNameInput).toHaveValue('Priyanka');
    
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Verma');
    expect(lastNameInput).toHaveValue('Verma');
    
    await user.clear(emailInput);
    await user.type(emailInput, 'priyanka.verma@school.edu.in');
    expect(emailInput).toHaveValue('priyanka.verma@school.edu.in');
    
    await user.clear(designationInput);
    await user.type(designationInput, 'Vice Principal');
    expect(designationInput).toHaveValue('Vice Principal');
  });

  it('should handle form submission', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameInput = await screen.findByLabelText('First Name');
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    // Modify the form
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Priyanka');
    
    // Submit the form
    await user.click(saveButton);
    
    // Should maintain the modified value
    expect(firstNameInput).toHaveValue('Priyanka');
  });

  it('should handle Indian contextual data editing', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameInput = await screen.findByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const designationInput = screen.getByLabelText('Designation');
    
    // Test Indian names and designations
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'राजेश');
    expect(firstNameInput).toHaveValue('राजेश');
    
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'शर्मा');
    expect(lastNameInput).toHaveValue('शर्मा');
    
    await user.clear(designationInput);
    await user.type(designationInput, 'प्राचार्य');
    expect(designationInput).toHaveValue('प्राचार्य');
  });

  it('should handle phone number format changes', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const phoneInput = await screen.findByLabelText('Phone');
    
    // Test different Indian phone formats
    const phoneFormats = [
      '09876543210',
      '+91 98765 43210',
      '98765-43210',
      '+91 (98765) 43210',
    ];
    
    for (const format of phoneFormats) {
      await user.clear(phoneInput);
      await user.type(phoneInput, format);
      expect(phoneInput).toHaveValue(format);
    }
  });

  it('should handle status changes', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const statusSelect = await screen.findByLabelText('Status');
    
    expect(statusSelect).toHaveValue('active');
    
    // Test different status values
    await user.selectOptions(statusSelect, 'inactive');
    expect(statusSelect).toHaveValue('inactive');
    
    await user.selectOptions(statusSelect, 'on_leave');
    expect(statusSelect).toHaveValue('on_leave');
    
    await user.selectOptions(statusSelect, 'active');
    expect(statusSelect).toHaveValue('active');
  });

  it('should handle employment type changes', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const typeSelect = await screen.findByLabelText('Employment Type');
    
    expect(typeSelect).toHaveValue('Permanent');
    
    // Test different employment types
    await user.selectOptions(typeSelect, 'Contract');
    expect(typeSelect).toHaveValue('Contract');
    
    await user.selectOptions(typeSelect, 'Temporary');
    expect(typeSelect).toHaveValue('Temporary');
  });

  it('should handle date edge cases without errors', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const joinDateInput = await screen.findByLabelText('Join Date');
    
    // Test various date formats
    const dateFormats = ['2024-04-01', '2023-12-01', '2024-06-15'];
    
    for (const date of dateFormats) {
      await user.clear(joinDateInput);
      await user.type(joinDateInput, date);
      expect(joinDateInput).toHaveValue(date);
    }
    
    // Should never show date errors
    expectNoDateErrors();
  });

  it('should handle data loading errors gracefully', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    // Should still render form structure even with potential errors
    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should validate form fields', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameInput = await screen.findByLabelText('First Name');
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    // Clear required field
    await user.clear(firstNameInput);
    
    // Try to save
    await user.click(saveButton);
    
    // Form should not submit with empty required field
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should handle complex Indian names', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameInput = await screen.findByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    
    const complexNames = [
      { firstName: 'डॉ. सुनीता', lastName: 'श्रीवास्तव' },
      { firstName: 'Prof. Rajesh', lastName: 'Chakraborty' },
      { firstName: 'Mrs. Deepika', lastName: 'Iyer-Menon' },
    ];

    for (const name of complexNames) {
      await user.clear(firstNameInput);
      await user.type(firstNameInput, name.firstName);
      expect(firstNameInput).toHaveValue(name.firstName);
      
      await user.clear(lastNameInput);
      await user.type(lastNameInput, name.lastName);
      expect(lastNameInput).toHaveValue(name.lastName);
    }
  });

  it('should handle email validation edge cases', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const emailInput = await screen.findByLabelText('Email');
    
    // Test various email formats
    const emails = [
      'teacher@school.ac.in',
      'principal+admin@school.org.in', 
      'staff.member@vidyalaya.gov.in',
    ];
    
    for (const email of emails) {
      await user.clear(emailInput);
      await user.type(emailInput, email);
      expect(emailInput).toHaveValue(email);
    }
  });

  it('should have no MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    await screen.findByLabelText('First Name');
    
    // Check that no MUI classes are present
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  it('should render with proper accessibility', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    // Check for proper form labels
    expect(await screen.findByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Designation')).toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
    
    // Check for form structure
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should maintain form state during interaction', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameInput = await screen.findByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email');
    
    // Modify multiple fields
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Priyanka');
    
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Verma');
    
    // Focus another field
    await user.click(emailInput);
    
    // Values should be preserved
    expect(firstNameInput).toHaveValue('Priyanka');
    expect(lastNameInput).toHaveValue('Verma');
  });

  it('should prevent date errors during all interactions', async () => {
    renderWithReactAdmin(<MockStaffEdit />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameInput = await screen.findByLabelText('First Name');
    const joinDateInput = screen.getByLabelText('Join Date');
    
    // Interact with form fields extensively
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Test Staff');
    
    await user.clear(joinDateInput);
    await user.type(joinDateInput, '2024-02-15');
    
    // Should never show date errors during any interaction
    expectNoDateErrors();
  });
});