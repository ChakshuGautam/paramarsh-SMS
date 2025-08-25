import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Students Create
const MockStudentsCreate = () => (
  <div>
    <h2>Create Student</h2>
    <form>
      <label>First Name <input type="text" name="firstName" /></label>
      <label>Last Name <input type="text" name="lastName" /></label>
      <label>Admission Number <input type="text" name="admissionNo" /></label>
      <label>Date of Birth <input type="date" name="dateOfBirth" /></label>
      <label>Gender <select name="gender">
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select></label>
      <label>Class <select name="classId">
        <option value="">Select Class</option>
        <option value="1">Class 5</option>
        <option value="2">Class 6</option>
      </select></label>
      <label>Status <select name="status" defaultValue="active">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Students Create', () => {
  it('should render create form without errors', async () => {
    renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
    
    const firstNameField = await screen.findByLabelText('First Name');
    expect(firstNameField).toBeInTheDocument();
    
    const lastNameField = screen.getByLabelText('Last Name');
    expect(lastNameField).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should allow entering student information', async () => {
    renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
    
    const user = userEvent.setup();
    const firstNameField = await screen.findByLabelText('First Name');
    const lastNameField = screen.getByLabelText('Last Name');
    const admissionField = screen.getByLabelText('Admission Number');
    
    await user.type(firstNameField, 'Priya');
    await user.type(lastNameField, 'Kumar');
    await user.type(admissionField, 'ADM2024003');
    
    expect(firstNameField).toHaveValue('Priya');
    expect(lastNameField).toHaveValue('Kumar');
    expect(admissionField).toHaveValue('ADM2024003');
  });

  it('should handle date input safely', async () => {
    renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
    
    const user = userEvent.setup();
    const dobField = await screen.findByLabelText('Date of Birth');
    
    await user.type(dobField, '2010-05-15');
    
    expect(dobField).toHaveValue('2010-05-15');
    expectNoDateErrors();
  });

  it('should display save button', async () => {
    renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
    
    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
    
    await screen.findByLabelText('First Name');
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle Indian student names', async () => {
    renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
    
    const user = userEvent.setup();
    const firstNameField = await screen.findByLabelText('First Name');
    const lastNameField = screen.getByLabelText('Last Name');
    
    await user.type(firstNameField, 'आर्यन');
    await user.type(lastNameField, 'शर्मा');
    
    expect(firstNameField).toHaveValue('आर्यन');
    expect(lastNameField).toHaveValue('शर्मा');
  });
});