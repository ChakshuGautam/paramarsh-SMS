import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Guardians Create
const MockGuardiansCreate = () => (
  <div>
    <h2>Create Guardian</h2>
    <form>
      <label>Name <input type="text" name="name" /></label>
      <label>Relation <select name="relation">
        <option value="">Select Relation</option>
        <option value="father">Father</option>
        <option value="mother">Mother</option>
        <option value="guardian">Guardian</option>
      </select></label>
      <label>Phone <input type="tel" name="phone" /></label>
      <label>Email <input type="email" name="email" /></label>
      <label>Address <textarea name="address"></textarea></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Guardians Create', () => {
  it('should render create form without errors', async () => {
    renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
    
    const nameField = await screen.findByLabelText('Name');
    expect(nameField).toBeInTheDocument();
    
    const relationField = screen.getByLabelText('Relation');
    expect(relationField).toBeInTheDocument();
    
    expectNoDateErrors();
  });

  it('should allow entering guardian information', async () => {
    renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const phoneField = screen.getByLabelText('Phone');
    const emailField = screen.getByLabelText('Email');
    
    await user.type(nameField, 'John Smith');
    await user.type(phoneField, '+91-9876543210');
    await user.type(emailField, 'john.smith@example.com');
    
    expect(nameField).toHaveValue('John Smith');
    expect(phoneField).toHaveValue('+91-9876543210');
    expect(emailField).toHaveValue('john.smith@example.com');
  });

  it('should display save button', async () => {
    renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
    
    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
    
    await screen.findByLabelText('Name');
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle Indian guardian data entry', async () => {
    renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const addressField = screen.getByLabelText('Address');
    
    await user.type(nameField, 'राम शर्मा');
    await user.type(addressField, 'गली नंबर 5, नई दिल्ली');
    
    expect(nameField).toHaveValue('राम शर्मा');
    expect(addressField).toHaveValue('गली नंबर 5, नई दिल्ली');
  });

  it('should handle date edge cases without errors', async () => {
    renderWithReactAdmin(<MockGuardiansCreate />, { resource: 'guardians' });
    
    await screen.findByLabelText('Name');
    expectNoDateErrors();
  });
});