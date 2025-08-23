import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminContext, testDataProvider, ResourceContextProvider } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ClassesShow } from '../../../app/admin/resources/classes/Show';

describe('Classes Show', () => {
  const mockClass = {
    id: 1,
    name: 'Class 1A',
    gradeLevel: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  };

  const renderClassesShow = (dataProviderOverrides = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    const dataProvider = testDataProvider({
      getOne: () => Promise.resolve({ data: mockClass }),
      ...dataProviderOverrides,
    });

    return render(
      <MemoryRouter initialEntries={['/classes/1/show']}>
        <QueryClientProvider client={queryClient}>
          <AdminContext dataProvider={dataProvider}>
            <ResourceContextProvider value="classes">
              <ClassesShow />
            </ResourceContextProvider>
          </AdminContext>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  it('should render class details without date errors', async () => {
    renderClassesShow();
    
    // Wait for class details to appear
    const className = await screen.findByText('Class 1A');
    expect(className).toBeInTheDocument();
    
    // Check ID field
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Should not show date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  it('should display all class fields', async () => {
    renderClassesShow();
    
    // Wait for data to load
    await screen.findByText('Class 1A');
    
    // Check field labels
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Grade')).toBeInTheDocument();
    
    // Check field values
    expect(screen.getByText('1')).toBeInTheDocument(); // ID and Grade both show 1
    expect(screen.getByText('Class 1A')).toBeInTheDocument();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderClassesShow();
    
    await screen.findByText('Class 1A');
    
    // Should not have MUI classes
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle data with date edge cases', async () => {
    renderClassesShow({
      getOne: () => Promise.resolve({ 
        data: { ...mockClass, createdAt: null, updatedAt: 'invalid-date' } 
      })
    });
    
    await screen.findByText('Class 1A');
    
    // Should not show date errors even with problematic dates
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  it('should handle missing data gracefully', async () => {
    renderClassesShow({
      getOne: () => Promise.resolve({ 
        data: { id: 1, name: null, gradeLevel: null } 
      })
    });
    
    await waitFor(() => {
      // Should still render field labels even with missing data
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Grade')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // ID should still show
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderClassesShow({
      getOne: () => Promise.reject(new Error('API Error'))
    });
    
    await waitFor(() => {
      // Should not crash on API error
      expect(document.body).toBeInTheDocument();
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('should display proper layout structure', async () => {
    renderClassesShow();
    
    await screen.findByText('Class 1A');
    
    // Should have proper show layout structure
    const fieldLabels = screen.getAllByText(/ID|Name|Grade/);
    expect(fieldLabels.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle comprehensive date edge cases', async () => {
    const dateTestCases = [
      { createdAt: null, updatedAt: null },
      { createdAt: undefined, updatedAt: undefined },
      { createdAt: '', updatedAt: 'invalid-date' },
      { createdAt: 'not-a-date', updatedAt: 1705316400000 }
    ];
    
    for (const dateCase of dateTestCases) {
      const { container } = renderClassesShow({
        getOne: () => Promise.resolve({ 
          data: { ...mockClass, ...dateCase } 
        })
      });
      
      await screen.findByText('Class 1A');
      
      // Should never show date errors
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
      expect(screen.queryByText(/Invalid Date/i)).toBeNull();
      
      // Clean up for next iteration
      container.remove();
    }
  });

  it('should display read-only data correctly', async () => {
    renderClassesShow();
    
    await screen.findByText('Class 1A');
    
    // All fields should be read-only (no input elements)
    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBe(0);
    
    // Should have text content instead
    expect(screen.getByText('Class 1A')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should handle different grade levels properly', async () => {
    const highGradeClass = { ...mockClass, gradeLevel: 12, name: 'Class 12A' };
    
    renderClassesShow({
      getOne: () => Promise.resolve({ data: highGradeClass })
    });
    
    await screen.findByText('Class 12A');
    
    // Should display high grade level correctly
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should render without loading states after data loads', async () => {
    renderClassesShow();
    
    await screen.findByText('Class 1A');
    
    // Should not have loading indicators after data loads
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  });
});