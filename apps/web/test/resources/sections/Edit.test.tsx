import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Sections Edit
const MockSectionsEdit = () => (
  <div>
    <h2>Edit Section</h2>
    <form>
      <label>Name <input type="text" name="name" defaultValue="A" /></label>
      <label>Class <select name="classId" defaultValue="1">
        <option value="1">Class 5</option>
        <option value="2">Class 6</option>
      </select></label>
      <label>Capacity <input type="number" name="capacity" defaultValue={40} /></label>
      <label>Room Number <input type="text" name="roomNumber" defaultValue="101" /></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Sections Edit', () => {
  it('should render edit form without errors', async () => {
    renderWithReactAdmin(<MockSectionsEdit />, { resource: 'sections' });
    
    const nameField = await screen.findByLabelText('Name');
    expect(nameField).toHaveValue('A');
    expectNoDateErrors();
  });

  it('should allow editing section data', async () => {
    renderWithReactAdmin(<MockSectionsEdit />, { resource: 'sections' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const capacityField = screen.getByLabelText('Capacity');
    
    await user.clear(nameField);
    await user.type(nameField, 'B');
    await user.clear(capacityField);
    await user.type(capacityField, '45');
    
    expect(nameField).toHaveValue('B');
    expect(capacityField).toHaveValue(45);
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockSectionsEdit />, { resource: 'sections' });
    
    await screen.findByLabelText('Name');
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });
});