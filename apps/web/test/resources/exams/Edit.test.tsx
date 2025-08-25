import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { ExamsEdit } from '@/app/admin/resources/exams/Edit';

const mockExam = {
  id: 1,
  name: 'Mathematics Unit Test',
  examType: 'UNIT_TEST',
  academicYearId: 1,
  term: 1,
  startDate: '2024-09-15',
  endDate: '2024-09-15',
  branchId: 'dps-main'
};

const mockAcademicYears = [
  { id: 1, name: '2024-25', isActive: true }
];

const renderExamsEdit = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockExam }),
    update: () => Promise.resolve({ data: mockExam }),
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
    <MemoryRouter initialEntries={['/exams/1/edit']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="exams">
            <Routes>
              <Route path="/exams/:id/edit" element={<ExamsEdit />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<ExamsEdit>', () => {
  test('renders edit form with pre-populated data', async () => {
    renderExamsEdit();

    // Check for card title
    const cardTitle = await screen.findByText('Basic Information');
    expect(cardTitle).toBeInTheDocument();

    // Check for form fields
    const nameInput = await screen.findByLabelText(/Exam Name/);
    expect(nameInput).toBeInTheDocument();

    const examTypeSelect = await screen.findByLabelText(/Exam Type/);
    expect(examTypeSelect).toBeInTheDocument();
  });

  test('renders without date errors', async () => {
    renderExamsEdit();
    
    await screen.findByText('Basic Information');
    
    // Should not show any date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('handles exam with null dates', async () => {
    const nullDateExam = {
      ...mockExam,
      startDate: null,
      endDate: null,
    };

    renderExamsEdit({
      getOne: () => Promise.resolve({ data: nullDateExam }),
    });

    const cardTitle = await screen.findByText('Basic Information');
    expect(cardTitle).toBeInTheDocument();
    
    // Should not show any date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });
});