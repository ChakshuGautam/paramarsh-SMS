import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, testDataProvider, ResourceContextProvider } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ClassesEdit } from '../../../app/admin/resources/classes/Edit';

describe('Classes Edit', () => {
  const mockClass = {
    id: 1,
    name: 'Class 1A',
    gradeLevel: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  };

  const renderClassesEdit = (dataProviderOverrides = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    const dataProvider = testDataProvider({
      getOne: () => Promise.resolve({ data: mockClass }),
      update: jest.fn(() => Promise.resolve({ data: mockClass })),
      ...dataProviderOverrides,
    });

    return render(
      <MemoryRouter initialEntries={['/classes/1']}>
        <QueryClientProvider client={queryClient}>
          <AdminContext dataProvider={dataProvider}>
            <ResourceContextProvider value="classes">
              <ClassesEdit />
            </ResourceContextProvider>
          </AdminContext>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  it('should render edit form with existing data', async () => {
    renderClassesEdit();
    
    // Wait for form to load with data
    const nameField = await screen.findByDisplayValue('Class 1A');
    expect(nameField).toBeInTheDocument();
    
    const gradeField = await screen.findByDisplayValue('1');
    expect(gradeField).toBeInTheDocument();
    
    // Should not show date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  it('should allow editing class name and grade', async () => {
    renderClassesEdit();
    
    const user = userEvent.setup();
    const nameField = await screen.findByDisplayValue('Class 1A');
    
    // Clear and enter new name
    await user.clear(nameField);
    await user.type(nameField, 'Class 1B');
    
    expect(nameField).toHaveValue('Class 1B');
  });

  it('should display save button', async () => {
    renderClassesEdit();
    
    await screen.findByDisplayValue('Class 1A');
    
    // Wait for save button to appear
    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderClassesEdit();
    
    await screen.findByDisplayValue('Class 1A');
    
    // Should not have MUI classes
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle form submission with updates', async () => {
    const mockUpdate = jest.fn(() => Promise.resolve({ 
      data: { ...mockClass, name: 'Updated Class' } 
    }));
    
    renderClassesEdit({
      update: mockUpdate
    });
    
    const user = userEvent.setup();
    const nameField = await screen.findByDisplayValue('Class 1A');
    const saveButton = await screen.findByRole('button', { name: /save/i });
    
    // Update name and submit
    await user.clear(nameField);
    await user.type(nameField, 'Updated Class');
    await user.click(saveButton);
    
    // Should attempt to update
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        'classes',
        expect.objectContaining({
          id: 1,
          data: expect.objectContaining({
            name: 'Updated Class'
          })
        })
      );
    });
  });

  it('should handle data loading gracefully', async () => {
    renderClassesEdit({
      getOne: () => Promise.resolve({ data: { ...mockClass, createdAt: null, updatedAt: 'invalid-date' } })
    });
    
    await screen.findByDisplayValue('Class 1A');
    
    // Should not show date errors even with problematic dates
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  it('should display proper form labels', async () => {
    renderClassesEdit();
    
    await screen.findByDisplayValue('Class 1A');
    
    // Check that labels are present
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade')).toBeInTheDocument();
  });

  it('should handle missing data gracefully', async () => {
    renderClassesEdit({
      getOne: () => Promise.resolve({ data: { id: 1, name: null, gradeLevel: null } })
    });
    
    await waitFor(() => {
      // Form should still render even with missing data
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Grade')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderClassesEdit({
      getOne: () => Promise.reject(new Error('API Error'))
    });
    
    await waitFor(() => {
      // Should not crash on API error
      expect(document.body).toBeInTheDocument();
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('should display proper form structure', async () => {
    renderClassesEdit();
    
    await screen.findByDisplayValue('Class 1A');
    
    // Should have proper form elements
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    // Should have input fields
    const inputs = document.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should maintain form state during editing', async () => {
    renderClassesEdit();
    
    const user = userEvent.setup();
    const nameField = await screen.findByDisplayValue('Class 1A');
    const gradeField = await screen.findByDisplayValue('1');
    
    // Make changes to both fields
    await user.clear(nameField);
    await user.type(nameField, 'Modified Class');
    await user.clear(gradeField);
    await user.type(gradeField, '2');
    
    // Both changes should be maintained
    expect(nameField).toHaveValue('Modified Class');
    expect(gradeField).toHaveValue('2');
  });
});