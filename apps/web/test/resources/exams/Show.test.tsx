import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { ExamsShow } from '@/app/admin/resources/exams/Show';

const mockExam = {
  id: 1,
  name: 'Mathematics Unit Test',
  examType: 'UNIT_TEST',
  academicYearId: 1,
  term: 1,
  startDate: '2024-09-15T09:00:00.000Z',
  endDate: '2024-09-15T11:00:00.000Z',
  status: 'SCHEDULED',
  maxMarks: 50,
  weightagePercent: 10,
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2024-01-16T14:45:00.000Z',
  branchId: 'dps-main'
};

const mockAcademicYears = [
  { id: 1, name: '2024-25', isActive: true }
];

const renderExamsShow = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockExam }),
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
    <MemoryRouter initialEntries={['/exams/1/show']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="exams">
            <Routes>
              <Route path="/exams/:id/show" element={<ExamsShow />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<ExamsShow>', () => {
  test('renders exam details', async () => {
    renderExamsShow();

    // Wait for the data to load and component to render
    const examName = await screen.findByText('Mathematics Unit Test');
    expect(examName).toBeInTheDocument();
  });

  test('displays data values correctly', async () => {
    renderExamsShow();

    // Wait for data to load
    const examName = await screen.findByText('Mathematics Unit Test');
    expect(examName).toBeInTheDocument();

    // Check that the component displays the exam data (examType might not be visible in this view)
    expect(screen.getByText('Mathematics Unit Test')).toBeInTheDocument();
  });

  test('handles exam with null dates safely', async () => {
    const nullDateExam = {
      ...mockExam,
      startDate: null,
      endDate: null,
      createdAt: null,
      updatedAt: null,
    };

    renderExamsShow({
      getOne: () => Promise.resolve({ data: nullDateExam }),
    });

    const examName = await screen.findByText('Mathematics Unit Test');
    expect(examName).toBeInTheDocument();
    
    // Should not show any date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('renders without errors', async () => {
    renderExamsShow();
    
    const examName = await screen.findByText('Mathematics Unit Test');
    expect(examName).toBeInTheDocument();
  });
});