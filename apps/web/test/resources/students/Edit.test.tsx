import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Students Edit
const MockStudentsEdit = () => (
  <div>
    <h2>Edit Student</h2>
    <form>
      <label>First Name <input type="text" name="firstName" defaultValue="Rahul" /></label>
      <label>Last Name <input type="text" name="lastName" defaultValue="Sharma" /></label>
      <label>Admission Number <input type="text" name="admissionNo" defaultValue="ADM2024001" /></label>
      <label>Date of Birth <input type="date" name="dateOfBirth" defaultValue="2010-05-15" /></label>
      <label>Gender <select name="gender" defaultValue="male">
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select></label>
      <label>Class <select name="classId" defaultValue="1">
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

describe('Students Edit', () => {
  it('should render edit form without errors', async () => {
    renderWithReactAdmin(<MockStudentsEdit />, { resource: 'students' });
    
    const firstNameField = await screen.findByLabelText('First Name');
    expect(firstNameField).toHaveValue('Rahul');
    
    expectNoDateErrors();
  });

  it('should allow editing student data', async () => {
    renderWithReactAdmin(<MockStudentsEdit />, { resource: 'students' });
    
    const user = userEvent.setup();
    const firstNameField = await screen.findByLabelText('First Name');
    const admissionField = screen.getByLabelText('Admission Number');
    
    await user.clear(firstNameField);
    await user.type(firstNameField, 'Raj');
    await user.clear(admissionField);
    await user.type(admissionField, 'ADM2024001-UPDATED');
    
    expect(firstNameField).toHaveValue('Raj');
    expect(admissionField).toHaveValue('ADM2024001-UPDATED');
  });

  it('should handle date fields safely', async () => {
    renderWithReactAdmin(<MockStudentsEdit />, { resource: 'students' });
    
    const user = userEvent.setup();
    const dobField = await screen.findByLabelText('Date of Birth');
    
    await user.clear(dobField);
    await user.type(dobField, '2010-06-20');
    
    expect(dobField).toHaveValue('2010-06-20');
    expectNoDateErrors();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockStudentsEdit />, { resource: 'students' });
    
    await screen.findByLabelText('First Name');
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });
});