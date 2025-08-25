import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { AttendanceRecordsList } from '@/app/admin/resources/attendanceRecords/List';

const mockData = [{ id: 1, status: 'present', date: '2024-08-24', studentId: 1, branchId: 'dps-main' }];

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const dataProvider = testDataProvider({
    getList: () => Promise.resolve({ data: mockData, total: mockData.length }),
    getMany: () => Promise.resolve({ data: [] }),
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="attendanceRecords">
            <AttendanceRecordsList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<AttendanceRecordsList>', () => {
  test('renders attendance records list', async () => {
    renderComponent();
    expect(await screen.findByText('present')).toBeInTheDocument();
  });
});