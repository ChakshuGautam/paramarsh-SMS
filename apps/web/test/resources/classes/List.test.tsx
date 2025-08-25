import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassesList } from '../../../app/admin/resources/classes/List';
import { renderWithReactAdmin, mockClassData, expectNoDateErrors, createMockDataProvider } from '../../test-helpers';

describe('Classes List', () => {
  const renderClassesList = (dataProviderOverrides = {}) => {
    const dataProvider = createMockDataProvider(mockClassData, dataProviderOverrides);
    return renderWithReactAdmin(<ClassesList />, {
      resource: "classes",
      dataProvider,
    });
  };

  it('should render classes list without date errors', async () => {
    renderClassesList();
    
    // Wait for classes to appear using React Admin pattern
    const class5 = await screen.findByText('Class 5');
    expect(class5).toBeInTheDocument();
    
    // Critical: No date errors should appear
    expectNoDateErrors();
  });

  it('should display grade level tabs', async () => {
    renderClassesList();
    
    // Wait for content to load
    await screen.findByText('Class 5');
    
    // Check for tab structure - they might have different text
    const tabs = document.querySelectorAll('[role="tablist"] button');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('should handle tab clicks for grade level filtering', async () => {
    renderClassesList();
    
    const user = userEvent.setup();
    await screen.findByText('Class 5');
    
    // Find any tab and try to click it
    const tabs = document.querySelectorAll('[role="tablist"] button');
    if (tabs.length > 0) {
      await user.click(tabs[0] as Element);
    }
    
    // Should not crash
    expectNoDateErrors();
  });

  it('should display search and filter inputs', async () => {
    renderClassesList();
    
    await screen.findByText('Class 5');
    
    // Look for search input
    const searchInput = document.querySelector('input[placeholder*="search"], input[placeholder*="Search"]');
    expect(searchInput).toBeInTheDocument();
  });

  it('should display table headers and data', async () => {
    renderClassesList();
    
    await screen.findByText('Class 5');
    
    // Should have table structure
    const tables = document.querySelectorAll('table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should handle comprehensive date edge cases without errors', async () => {
    const classesWithEdgeDates = [
      { ...mockClassData[0], createdAt: null, updatedAt: null },
      { id: 2, name: 'Class 6', gradeLevel: 6, createdAt: 'invalid-date', updatedAt: undefined, sections: [] }
    ];
    
    renderClassesList({
      getList: () => Promise.resolve({ 
        data: classesWithEdgeDates, 
        total: classesWithEdgeDates.length 
      })
    });
    
    await screen.findByText('Class 5');
    
    // Should never show date errors
    expectNoDateErrors();
  });

  it('should handle empty data gracefully', async () => {
    renderClassesList({
      getList: () => Promise.resolve({ data: [], total: 0 })
    });
    
    // Should render without crashing
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
    expectNoDateErrors();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderClassesList();
    
    await screen.findByText('Class 5');
    
    // Should not have MUI classes
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should render efficiently with pagination', async () => {
    renderClassesList();
    
    await screen.findByText('Class 5');
    
    // Should have reasonable DOM structure
    const tableRows = document.querySelectorAll('tr');
    expect(tableRows.length).toBeGreaterThan(0);
    expect(tableRows.length).toBeLessThan(50); // Reasonable limit
  });

  it('should handle all date edge cases safely', async () => {
    const edgeCaseClasses = [
      { ...mockClassData[0], createdAt: null, updatedAt: null },
      { id: 2, name: 'Test Class', gradeLevel: 6, 
        createdAt: 'not-a-date', updatedAt: 1705316400000, sections: [] }
    ];
    
    renderClassesList({
      getList: () => Promise.resolve({ 
        data: edgeCaseClasses, 
        total: edgeCaseClasses.length 
      })
    });
    
    await screen.findByText('Class 5');
    
    // CRITICAL: Should never show date errors
    expectNoDateErrors();
    
    // All classes should render without crashes
    expect(screen.getByText('Test Class')).toBeInTheDocument();
  });
});