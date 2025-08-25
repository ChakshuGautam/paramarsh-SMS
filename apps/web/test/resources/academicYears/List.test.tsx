import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { AcademicYearsList } from '@/app/admin/resources/academicYears/List';

const mockAcademicYears = [
  {
    id: 1,
    name: 'Academic Year 2024-25',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    isActive: true,
    terms: [
      { name: 'Term 1' },
      { name: 'Term 2' }
    ],
    branchId: 'dps-main'
  },
  {
    id: 2,
    name: 'Academic Year 2023-24',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    isActive: false,
    terms: [
      { name: 'Term 1' },
      { name: 'Term 2' },
      { name: 'Term 3' }
    ],
    branchId: 'dps-main'
  }
];

const renderAcademicYearsList = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getList: () => 
      Promise.resolve({
        data: mockAcademicYears,
        total: mockAcademicYears.length,
      }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="academicYears">
            <AcademicYearsList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<AcademicYearsList>', () => {
  test('renders academic years list without date errors', async () => {
    renderAcademicYearsList();

    // Wait for the component to load and find academic year data
    const academicYear2024 = await screen.findByText('Academic Year 2024-25');
    expect(academicYear2024).toBeInTheDocument();

    const academicYear2023 = await screen.findByText('Academic Year 2023-24');
    expect(academicYear2023).toBeInTheDocument();

    // Ensure no date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('displays formatted dates correctly', async () => {
    renderAcademicYearsList();

    // Check formatted dates are displayed
    await screen.findByText('Apr 01, 2024');
    expect(screen.getByText('Mar 31, 2025')).toBeInTheDocument();
    expect(screen.getByText('Apr 01, 2023')).toBeInTheDocument();
    expect(screen.getByText('Mar 31, 2024')).toBeInTheDocument();
  });

  test('displays active status correctly', async () => {
    renderAcademicYearsList();

    // Check active status badges
    const activeStatus = await screen.findByText('Active');
    expect(activeStatus).toBeInTheDocument();

    const inactiveStatus = await screen.findByText('Inactive');
    expect(inactiveStatus).toBeInTheDocument();
  });

  test('displays terms correctly', async () => {
    renderAcademicYearsList();

    // Check terms are displayed
    const term1Badges = await screen.findAllByText('Term 1');
    expect(term1Badges).toHaveLength(2); // Both academic years have Term 1

    const term2Badges = await screen.findAllByText('Term 2');
    expect(term2Badges).toHaveLength(2); // Both academic years have Term 2

    const term3Badge = await screen.findByText('Term 3');
    expect(term3Badge).toBeInTheDocument(); // Only 2023-24 has Term 3
  });

  test('handles academic year with null dates safely', async () => {
    const nullDateData = [
      {
        id: 1,
        name: 'Test Academic Year',
        startDate: null,
        endDate: null,
        isActive: false,
        terms: [],
        branchId: 'dps-main'
      }
    ];

    renderAcademicYearsList({
      getList: () => Promise.resolve({
        data: nullDateData,
        total: 1,
      }),
    });

    await screen.findByText('Test Academic Year');
    
    // Should not show any date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('handles academic year with no terms', async () => {
    const noTermsData = [
      {
        id: 1,
        name: 'Test Academic Year',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        isActive: true,
        terms: [],
        branchId: 'dps-main'
      }
    ];

    renderAcademicYearsList({
      getList: () => Promise.resolve({
        data: noTermsData,
        total: 1,
      }),
    });

    await screen.findByText('Test Academic Year');
    expect(screen.getByText('No terms defined')).toBeInTheDocument();
  });
});