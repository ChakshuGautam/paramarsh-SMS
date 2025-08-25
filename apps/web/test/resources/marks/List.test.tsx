import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { MarksList } from '@/app/admin/resources/marks/List';

const mockMarks = [
  {
    id: 1,
    totalMarks: 85,
    grade: 'A',
    examId: 1,
    studentId: 1,
    subjectId: 1,
    branchId: 'dps-main',
    isAbsent: false,
    exam: { maxMarks: 100, minPassingMarks: 35 }
  },
  {
    id: 2,
    totalMarks: 92,
    grade: 'A+',
    examId: 1,
    studentId: 2,
    subjectId: 1,
    branchId: 'dps-main',
    isAbsent: false,
    exam: { maxMarks: 100, minPassingMarks: 35 }
  }
];

const renderMarksList = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getList: () => 
      Promise.resolve({
        data: mockMarks,
        total: mockMarks.length,
      }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="marks">
            <MarksList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<MarksList>', () => {
  test('renders marks list without errors', async () => {
    renderMarksList();
    
    // Wait for the component to render - look for marks in correct format "XX / 100"
    expect(await screen.findByText('85 / 100')).toBeInTheDocument();
    expect(screen.getByText('92 / 100')).toBeInTheDocument();
  });

  test('displays grade information', async () => {
    renderMarksList();
    
    const gradeA = await screen.findByText('A');
    expect(gradeA).toBeInTheDocument();
    
    const gradeAPlus = screen.getByText('A+');
    expect(gradeAPlus).toBeInTheDocument();
  });

  test('handles marks with null values safely', async () => {
    const nullMarks = [{
      id: 1,
      totalMarks: null,
      grade: null,
      examId: 1,
      studentId: 1,
      subjectId: 1,
      branchId: 'dps-main',
      isAbsent: false,
      exam: { maxMarks: 100, minPassingMarks: 35 }
    }];

    renderMarksList({
      getList: () => Promise.resolve({ data: nullMarks, total: 1 }),
    });

    // Should render without errors - check that list is displayed
    expect(await screen.findByText('0 / 100')).toBeInTheDocument(); // null totalMarks shows as 0
  });
});