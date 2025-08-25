import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore, ResourceContextProvider } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ClassesEdit } from '@/app/admin/resources/classes/Edit';

// Mock class data following Indian contextual patterns
const mockClass = {
  id: 1,
  name: 'Class 5',
  gradeLevel: 5,
};

// Simple test helper following frontend-testing-guide.md patterns
const renderClassesEdit = (dataProviderOverrides = {}) => {
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
    <MemoryRouter initialEntries={['/classes/1/edit']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="classes">
            <Routes>
              <Route path="/classes/:id/edit" element={<ClassesEdit />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('ClassesEdit Component', () => {
  test('should render without errors', async () => {
    renderClassesEdit();

    // Wait for the component to load
    const nameField = await screen.findByRole('textbox', { name: /name/i });
    expect(nameField).toBeInTheDocument();
    expect(nameField).toHaveValue('Class 5');
  });

  test('should not display date errors', async () => {
    renderClassesEdit();

    await screen.findByRole('textbox', { name: /name/i });
    
    // Critical date safety pattern from guide
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('should load existing data correctly', async () => {
    renderClassesEdit();

    // Check that data is loaded using specific fields
    expect(await screen.findByRole('textbox', { name: /name/i })).toHaveValue('Class 5');
    expect(await screen.findByRole('textbox', { name: /grade/i })).toHaveValue('5');
  });

  test('should handle missing field values', async () => {
    const classWithNullFields = {
      ...mockClass,
      name: null,
      gradeLevel: null
    };

    renderClassesEdit({
      getOne: () => Promise.resolve({ data: classWithNullFields })
    });

    await screen.findByRole('textbox', { name: /name/i }); // Wait for load

    // Should handle null values without errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });
});