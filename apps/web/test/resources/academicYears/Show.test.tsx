import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { AcademicYearsShow } from '@/app/admin/resources/academicYears/Show';

const mockAcademicYear = {
  id: 1,
  name: 'Academic Year 2024-25',
  startDate: '2024-04-01T00:00:00.000Z',
  endDate: '2025-03-31T00:00:00.000Z',
  isActive: true,
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2024-01-16T14:45:00.000Z',
  branchId: 'dps-main'
};

const renderAcademicYearsShow = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockAcademicYear }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={['/academicYears/1/show']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="academicYears">
            <Routes>
              <Route path="/academicYears/:id/show" element={<AcademicYearsShow />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<AcademicYearsShow>', () => {
  test('renders academic year details', async () => {
    renderAcademicYearsShow();

    // Wait for the data to load and component to render
    const cardTitle = await screen.findByText('Academic Year Details');
    expect(cardTitle).toBeInTheDocument();

    // Check that academic year name is displayed
    const academicYearName = await screen.findByText('Academic Year 2024-25');
    expect(academicYearName).toBeInTheDocument();

    // Check that the data values are displayed (labels might not be visible in this implementation)
    expect(screen.getByText('Academic Year 2024-25')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('2024-04-01T00:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('2025-03-31T00:00:00.000Z')).toBeInTheDocument();
  });

  test('displays data values correctly', async () => {
    renderAcademicYearsShow();

    // Wait for data to load
    const academicYearName = await screen.findByText('Academic Year 2024-25');
    expect(academicYearName).toBeInTheDocument();

    // Should display boolean value
    const activeStatus = await screen.findByText('true');
    expect(activeStatus).toBeInTheDocument();

    // Check date fields are present in ISO format
    expect(screen.getByText('2024-04-01T00:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('2025-03-31T00:00:00.000Z')).toBeInTheDocument();
  });

  test('handles academic year with null dates safely', async () => {
    const nullDateAcademicYear = {
      ...mockAcademicYear,
      startDate: null,
      endDate: null,
      createdAt: null,
      updatedAt: null,
    };

    renderAcademicYearsShow({
      getOne: () => Promise.resolve({ data: nullDateAcademicYear }),
    });

    const cardTitle = await screen.findByText('Academic Year Details');
    expect(cardTitle).toBeInTheDocument();

    const academicYearName = await screen.findByText('Academic Year 2024-25');
    expect(academicYearName).toBeInTheDocument();
    
    // Should not show any date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('renders without errors', async () => {
    renderAcademicYearsShow();
    
    const cardTitle = await screen.findByText('Academic Year Details');
    expect(cardTitle).toBeInTheDocument();
  });

  test('handles inactive academic year', async () => {
    const inactiveAcademicYear = {
      ...mockAcademicYear,
      isActive: false,
    };

    renderAcademicYearsShow({
      getOne: () => Promise.resolve({ data: inactiveAcademicYear }),
    });

    const cardTitle = await screen.findByText('Academic Year Details');
    expect(cardTitle).toBeInTheDocument();

    // Should display false for inactive status
    const inactiveStatus = await screen.findByText('false');
    expect(inactiveStatus).toBeInTheDocument();
  });
});