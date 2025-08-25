import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { AcademicYearsEdit } from '@/app/admin/resources/academicYears/Edit';

const mockAcademicYear = {
  id: 1,
  name: 'Academic Year 2024-25',
  startDate: '2024-04-01',
  endDate: '2025-03-31',
  isActive: true,
  branchId: 'dps-main'
};

const renderAcademicYearsEdit = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockAcademicYear }),
    update: () => Promise.resolve({ data: mockAcademicYear }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={['/academicYears/1/edit']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="academicYears">
            <Routes>
              <Route path="/academicYears/:id/edit" element={<AcademicYearsEdit />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<AcademicYearsEdit>', () => {
  test('renders edit form with pre-populated data', async () => {
    renderAcademicYearsEdit();

    // Wait for the data to load and component to render
    const cardTitle = await screen.findByText('Academic Year Information');
    expect(cardTitle).toBeInTheDocument();

    // Check for form fields
    const nameInput = await screen.findByLabelText(/Academic Year Name/);
    expect(nameInput).toBeInTheDocument();

    const activeToggle = await screen.findByLabelText(/Set as Active/);
    expect(activeToggle).toBeInTheDocument();

    const startDateInput = await screen.findByLabelText(/Start Date/);
    expect(startDateInput).toBeInTheDocument();

    const endDateInput = await screen.findByLabelText(/End Date/);
    expect(endDateInput).toBeInTheDocument();

    // Check helper texts
    expect(screen.getByText('e.g., 2024-25')).toBeInTheDocument();
    expect(screen.getByText('Only one academic year can be active at a time')).toBeInTheDocument();
  });

  test('handles form fields correctly', async () => {
    renderAcademicYearsEdit();

    // Check that all form inputs are present - use async waits
    const nameInput = await screen.findByLabelText(/Academic Year Name/);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toBeRequired();

    const activeToggle = await screen.findByLabelText(/Set as Active/);
    expect(activeToggle).toBeInTheDocument();

    const startDateInput = await screen.findByLabelText(/Start Date/);
    expect(startDateInput).toBeInTheDocument();

    const endDateInput = await screen.findByLabelText(/End Date/);
    expect(endDateInput).toBeInTheDocument();
  });

  test('renders without errors', async () => {
    renderAcademicYearsEdit();
    
    const cardTitle = await screen.findByText('Academic Year Information');
    expect(cardTitle).toBeInTheDocument();
  });

  test('handles academic year with null dates', async () => {
    const nullDateAcademicYear = {
      ...mockAcademicYear,
      startDate: null,
      endDate: null,
    };

    renderAcademicYearsEdit({
      getOne: () => Promise.resolve({ data: nullDateAcademicYear }),
    });

    const cardTitle = await screen.findByText('Academic Year Information');
    expect(cardTitle).toBeInTheDocument();
    
    // Should not show any date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });
});