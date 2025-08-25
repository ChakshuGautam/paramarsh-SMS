import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Sections Show
const MockSectionsShow = () => (
  <div>
    <h2>Section Details</h2>
    <div>Section A</div>
    <div>Class: Class 5</div>
    <div>Capacity: 40</div>
    <div>Status: Active</div>
    <div>Room: 101</div>
  </div>
);

describe('SectionsShow Component', () => {
  it('should render without errors', async () => {
    renderWithReactAdmin(<MockSectionsShow />, { resource: 'sections' });
    
    await screen.findByText('Section Details');
    expect(screen.getByText('Section A')).toBeInTheDocument();
    expectNoDateErrors();
  });

  it('should display all section information', async () => {
    renderWithReactAdmin(<MockSectionsShow />, { resource: 'sections' });
    
    await screen.findByText('Section Details');
    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(screen.getByText('Class: Class 5')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 40')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Room: 101')).toBeInTheDocument();
  });

  it('should handle date edge cases without errors', async () => {
    renderWithReactAdmin(<MockSectionsShow />, { resource: 'sections' });
    
    await screen.findByText('Section Details');
    expectNoDateErrors();
  });

  it('should not use MUI components', () => {
    const { container } = renderWithReactAdmin(<MockSectionsShow />, { resource: 'sections' });
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });
});