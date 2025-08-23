import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, testDataProvider, ResourceContextProvider } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ClassesCreate } from '../../../app/admin/resources/classes/Create';

describe('Classes Create', () => {
  const renderClassesCreate = (dataProviderOverrides = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    const dataProvider = testDataProvider({
      create: jest.fn(() => Promise.resolve({ 
        data: { id: 1, name: 'Class 1A', gradeLevel: 1 } 
      })),
      getOne: () => Promise.resolve({ data: { id: 1, name: 'Class 1A', gradeLevel: 1 } }),
      ...dataProviderOverrides,
    });

    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AdminContext dataProvider={dataProvider}>
            <ResourceContextProvider value="classes">
              <ClassesCreate />
            </ResourceContextProvider>
          </AdminContext>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  it('should render create form without errors', async () => {
    renderClassesCreate();
    
    // Wait for form to appear
    const nameField = await screen.findByLabelText('Name');
    expect(nameField).toBeInTheDocument();
    
    const gradeField = await screen.findByLabelText('Grade');
    expect(gradeField).toBeInTheDocument();
    
    // Should not show date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  it('should allow entering class name and grade', async () => {
    renderClassesCreate();
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const gradeField = await screen.findByLabelText('Grade');
    
    // Enter class information
    await user.type(nameField, 'Class 2B');
    await user.type(gradeField, '2');
    
    expect(nameField).toHaveValue('Class 2B');
    expect(gradeField).toHaveValue('2');
  });

  it('should display save button', async () => {
    renderClassesCreate();
    
    // Wait for save button to appear
    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should not contain MUI components', async () => {
    const { container } = renderClassesCreate();
    
    await screen.findByLabelText('Name');
    
    // Should not have MUI classes
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should handle form validation', async () => {
    renderClassesCreate();
    
    const user = userEvent.setup();
    const saveButton = await screen.findByRole('button', { name: /save/i });
    
    // Try to submit empty form
    await user.click(saveButton);
    
    // Form should still be present (validation handling)
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const mockCreate = jest.fn(() => Promise.resolve({ 
      data: { id: 1, name: 'Test Class', gradeLevel: 5 } 
    }));
    
    renderClassesCreate({
      create: mockCreate
    });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const gradeField = await screen.findByLabelText('Grade');
    const saveButton = await screen.findByRole('button', { name: /save/i });
    
    // Fill form and submit
    await user.type(nameField, 'Test Class');
    await user.type(gradeField, '5');
    await user.click(saveButton);
    
    // Should attempt to create
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        'classes',
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Class',
            gradeLevel: '5'
          })
        })
      );
    });
  });

  it('should render form fields with proper labels', async () => {
    renderClassesCreate();
    
    // Check that all form fields are present with correct labels
    expect(await screen.findByLabelText('Name')).toBeInTheDocument();
    expect(await screen.findByLabelText('Grade')).toBeInTheDocument();
  });

  it('should handle empty form gracefully', async () => {
    renderClassesCreate();
    
    await screen.findByLabelText('Name');
    
    // Form should render without errors even when empty
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Grade')).toHaveValue('');
  });

  it('should display proper form structure', async () => {
    renderClassesCreate();
    
    await screen.findByLabelText('Name');
    
    // Should have proper form elements
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    // Should have input fields
    const inputs = document.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });
});