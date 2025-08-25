import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore, ResourceContextProvider } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EnrollmentsEdit } from '@/app/admin/resources/enrollments/Edit';

// Mock enrollment data following Indian contextual patterns
const mockEnrollment = {
  id: 1,
  studentId: '1',
  classId: '1',
  sectionId: '1',
  status: 'active',
  startDate: '2024-04-01',
  endDate: null,
};

// Simple test helper following frontend-testing-guide.md patterns
const renderEnrollmentsEdit = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockEnrollment }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={['/enrollments/1/edit']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="enrollments">
            <Routes>
              <Route path="/enrollments/:id/edit" element={<EnrollmentsEdit />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('EnrollmentsEdit Component', () => {
  test('should render without errors', async () => {
    renderEnrollmentsEdit();

    // Wait for the component to load using the disabled field (studentId)
    const studentIdField = await screen.findByRole('textbox', { name: /student id/i });
    expect(studentIdField).toBeInTheDocument();
    expect(studentIdField).toHaveValue('1');
  });

  test('should not display date errors', async () => {
    renderEnrollmentsEdit();

    await screen.findByRole('textbox', { name: /student id/i });
    
    // Critical date safety pattern from guide
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('should load existing data correctly', async () => {
    renderEnrollmentsEdit();

    // Check that data is loaded using specific fields
    expect(await screen.findByRole('textbox', { name: /student id/i })).toHaveValue('1');
    expect(await screen.findByRole('textbox', { name: /start date/i })).toHaveValue('2024-04-01');
    expect(await screen.findByRole('textbox', { name: /class id/i })).toHaveValue('1');
  });

  test('should handle null dates safely', async () => {
    const enrollmentWithNullDate = {
      ...mockEnrollment,
      endDate: null,
      startDate: null
    };

    renderEnrollmentsEdit({
      getOne: () => Promise.resolve({ data: enrollmentWithNullDate })
    });

    await screen.findByRole('textbox', { name: /student id/i }); // Wait for load

    // Should handle null dates without errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });
});