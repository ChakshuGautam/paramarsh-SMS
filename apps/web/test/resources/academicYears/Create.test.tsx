import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { AcademicYearsCreate } from '@/app/admin/resources/academicYears/Create';

const renderAcademicYearsCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    create: () => Promise.resolve({
      data: { id: 1, name: 'Test Academic Year', startDate: '2024-04-01', endDate: '2025-03-31', isActive: true }
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="academicYears">
            <AcademicYearsCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<AcademicYearsCreate>', () => {
  test('renders create form with all required fields', async () => {
    renderAcademicYearsCreate();

    // Check for card title
    expect(screen.getByText('Academic Year Information')).toBeInTheDocument();

    // Check for required form fields
    expect(screen.getByLabelText(/Academic Year Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set as Active/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/)).toBeInTheDocument();

    // Check helper texts
    expect(screen.getByText('e.g., 2024-25')).toBeInTheDocument();
    expect(screen.getByText('Only one academic year can be active at a time')).toBeInTheDocument();
  });

  test('displays form inputs correctly', () => {
    renderAcademicYearsCreate();

    // Check that all form inputs are present - focusing on presence not DOM attributes
    const nameInput = screen.getByLabelText(/Academic Year Name/);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toBeRequired();

    // Boolean input is rendered as a button/toggle
    const activeToggle = screen.getByLabelText(/Set as Active/);
    expect(activeToggle).toBeInTheDocument();

    // Date inputs are rendered as date pickers
    const startDateInput = screen.getByLabelText(/Start Date/);
    expect(startDateInput).toBeInTheDocument();

    const endDateInput = screen.getByLabelText(/End Date/);
    expect(endDateInput).toBeInTheDocument();
  });

  test('renders without errors', () => {
    renderAcademicYearsCreate();
    
    // Basic rendering test - just ensure no crashes
    expect(screen.getByText('Academic Year Information')).toBeInTheDocument();
  });
});