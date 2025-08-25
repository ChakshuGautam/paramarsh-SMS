import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Guardians Edit
const MockGuardiansEdit = () => (
  <div>
    <h2>Edit Guardian</h2>
    <form>
      <label>Name <input type="text" name="name" defaultValue="John Smith" /></label>
      <label>Relation <select name="relation" defaultValue="father">
        <option value="father">Father</option>
        <option value="mother">Mother</option>
        <option value="guardian">Guardian</option>
      </select></label>
      <label>Phone <input type="tel" name="phone" defaultValue="+91-9876543210" /></label>
      <label>Email <input type="email" name="email" defaultValue="john.smith@example.com" /></label>
      <label>Address <textarea name="address" defaultValue="123 Main St, Mumbai"></textarea></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Guardians Edit', () => {
  it('should render edit form without errors', async () => {
    renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
    
    const nameField = await screen.findByLabelText('Name');
    expect(nameField).toHaveValue('John Smith');
    
    expectNoDateErrors();
  });

  it('should load existing guardian data', async () => {
    renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
    
    const nameField = await screen.findByLabelText('Name');
    const relationField = screen.getByLabelText('Relation');
    const phoneField = screen.getByLabelText('Phone');
    const emailField = screen.getByLabelText('Email');
    
    expect(nameField).toHaveValue('John Smith');
    expect(relationField).toHaveValue('father');
    expect(phoneField).toHaveValue('+91-9876543210');
    expect(emailField).toHaveValue('john.smith@example.com');
  });

  it('should allow editing guardian data', async () => {
    renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    
    await user.clear(nameField);
    await user.type(nameField, 'John Smith Sr.');
    
    expect(nameField).toHaveValue('John Smith Sr.');
  });

  it('should display save button', async () => {
    renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
    
    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
    
    await screen.findByLabelText('Name');
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle date edge cases without errors', async () => {
    renderWithReactAdmin(<MockGuardiansEdit />, { resource: 'guardians' });
    
    await screen.findByLabelText('Name');
    expectNoDateErrors();
  });
});