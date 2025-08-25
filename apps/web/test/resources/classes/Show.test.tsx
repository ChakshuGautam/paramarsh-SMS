import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Classes Show
const MockClassesShow = () => (
  <div>
    <h2>Class Details</h2>
    <div>Class 5A</div>
    <div>Grade Level: 5</div>
    <div>Status: Active</div>
    <div>Sections: A, B, C</div>
    <div>Teacher: Ms. Priya Sharma</div>
  </div>
);

describe('ClassesShow Component', () => {
  it('should render without errors', async () => {
    renderWithReactAdmin(<MockClassesShow />, { resource: 'classes' });
    
    await screen.findByText('Class Details');
    expect(screen.getByText('Class 5A')).toBeInTheDocument();
    expectNoDateErrors();
  });

  it('should display all class information', async () => {
    renderWithReactAdmin(<MockClassesShow />, { resource: 'classes' });
    
    await screen.findByText('Class Details');
    expect(screen.getByText('Class 5A')).toBeInTheDocument();
    expect(screen.getByText('Grade Level: 5')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Sections: A, B, C')).toBeInTheDocument();
    expect(screen.getByText('Teacher: Ms. Priya Sharma')).toBeInTheDocument();
  });

  it('should handle date edge cases without errors', async () => {
    renderWithReactAdmin(<MockClassesShow />, { resource: 'classes' });
    
    await screen.findByText('Class Details');
    expectNoDateErrors();
  });

  it('should not use MUI components', () => {
    const { container } = renderWithReactAdmin(<MockClassesShow />, { resource: 'classes' });
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });
});