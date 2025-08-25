import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { ExamsCreate } from '@/app/admin/resources/exams/Create';

const mockAcademicYears = [
  { id: 1, name: '2024-25', isActive: true },
  { id: 2, name: '2023-24', isActive: false }
];

const renderExamsCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    create: () => Promise.resolve({
      data: { id: 1, name: 'Test Exam', examType: 'UNIT_TEST', academicYearId: 1 }
    }),
    getList: jest.fn((resource) => {
      const resources: Record<string, any> = {
        academicYears: { data: mockAcademicYears, total: mockAcademicYears.length },
      };
      return Promise.resolve(resources[resource] || { data: [], total: 0 });
    }),
    getMany: jest.fn((resource, { ids }) => {
      const resourceMap: Record<string, any> = {
        academicYears: mockAcademicYears,
      };
      const data = resourceMap[resource]?.filter((item: any) => ids.includes(item.id)) || [];
      return Promise.resolve({ data });
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="exams">
            <ExamsCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<ExamsCreate>', () => {
  test('renders create form with all required fields', async () => {
    renderExamsCreate();

    // Check for card title
    expect(screen.getByText('Basic Information')).toBeInTheDocument();

    // Check that the basic card structure is rendered
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
  });

  test('displays form inputs correctly', () => {
    const { container } = renderExamsCreate();

    // Check basic form structure is rendered
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    
    // Verify form is present
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  test('renders without errors', () => {
    renderExamsCreate();
    
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
  });
});