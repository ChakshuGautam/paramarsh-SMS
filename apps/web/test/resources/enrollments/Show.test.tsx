import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore, ResourceContextProvider } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EnrollmentsShow } from '@/app/admin/resources/enrollments/Show';

// Mock enrollment data following Indian contextual patterns
const mockEnrollment = {
  id: 1,
  studentId: 1,
  sectionId: 1,
  status: 'active',
  startDate: '2024-04-01',
  endDate: null,
};

// Simple test helper following frontend-testing-guide.md patterns
const renderEnrollmentsShow = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockEnrollment }),
    getMany: () => Promise.resolve({ data: [] }), // For reference fields
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={['/enrollments/1']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="enrollments">
            <Routes>
              <Route path="/enrollments/:id" element={<EnrollmentsShow />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('EnrollmentsShow Component', () => {
  test('should render without errors', async () => {
    renderEnrollmentsShow();

    // Wait for the component to load - check for the ID field display
    expect(await screen.findByText('1')).toBeInTheDocument();
  });

  test('should not display date errors', async () => {
    renderEnrollmentsShow();

    await screen.findByText('1');
    
    // Critical date safety pattern from guide
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('should display enrollment data correctly', async () => {
    renderEnrollmentsShow();

    // Check that enrollment data is displayed
    expect(await screen.findByText('1')).toBeInTheDocument(); // ID
    expect(await screen.findByText('active')).toBeInTheDocument(); // status
    expect(await screen.findByText('2024-04-01')).toBeInTheDocument(); // startDate
  });

  test('should handle null dates safely', async () => {
    const enrollmentWithNullDate = {
      ...mockEnrollment,
      startDate: null,
      endDate: null
    };

    renderEnrollmentsShow({
      getOne: () => Promise.resolve({ data: enrollmentWithNullDate })
    });

    await screen.findByText('1'); // Wait for load

    // Should handle null dates without errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });
});