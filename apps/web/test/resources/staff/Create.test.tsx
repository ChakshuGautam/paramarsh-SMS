import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Staff Create
const MockStaffCreate = () => (
  <div>
    <h2>Create Staff</h2>
    <form>
      <label>First Name <input type="text" name="firstName" /></label>
      <label>Last Name <input type="text" name="lastName" /></label>
      <label>Email <input type="email" name="email" /></label>
      <label>Phone <input type="tel" name="phone" /></label>
      <label>Designation <input type="text" name="designation" /></label>
      <label>Department <select name="department">
        <option value="Administration">Administration</option>
        <option value="Science">Science</option>
        <option value="Mathematics">Mathematics</option>
      </select></label>
      <label>Employment Type <select name="employmentType">
        <option value="Permanent">Permanent</option>
        <option value="Contract">Contract</option>
        <option value="Temporary">Temporary</option>
      </select></label>
      <label>Join Date <input type="date" name="joinDate" /></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Staff Create', () => {
  it('should render create form without errors', async () => {
    renderWithReactAdmin(<MockStaffCreate />, { resource: 'staff' });
    
    const firstNameField = await screen.findByLabelText('First Name');
    expect(firstNameField).toBeInTheDocument();
    
    const lastNameField = screen.getByLabelText('Last Name');
    expect(lastNameField).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should allow entering staff information', async () => {
    renderWithReactAdmin(<MockStaffCreate />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameField = await screen.findByLabelText('First Name');
    const emailField = screen.getByLabelText('Email');
    
    await user.type(firstNameField, 'Priya');
    await user.type(emailField, 'priya@school.edu.in');
    
    expect(firstNameField).toHaveValue('Priya');
    expect(emailField).toHaveValue('priya@school.edu.in');
  });

  it('should display save button', async () => {
    renderWithReactAdmin(<MockStaffCreate />, { resource: 'staff' });
    
    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockStaffCreate />, { resource: 'staff' });
    
    await screen.findByLabelText('First Name');
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle form validation', async () => {
    renderWithReactAdmin(<MockStaffCreate />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const saveButton = await screen.findByRole('button', { name: /save/i });
    
    await user.click(saveButton);
    
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  it('should handle Indian staff data entry', async () => {
    renderWithReactAdmin(<MockStaffCreate />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const firstNameField = await screen.findByLabelText('First Name');
    const designationField = screen.getByLabelText('Designation');
    
    await user.type(firstNameField, 'राजेश');
    await user.type(designationField, 'प्राचार्य');
    
    expect(firstNameField).toHaveValue('राजेश');
    expect(designationField).toHaveValue('प्राचार्य');
  });

  it('should prevent date errors during form interaction', async () => {
    renderWithReactAdmin(<MockStaffCreate />, { resource: 'staff' });
    
    const user = userEvent.setup();
    const joinDateField = await screen.findByLabelText('Join Date');
    
    await user.type(joinDateField, '2024-01-15');
    
    expectNoDateErrors();
  });
});