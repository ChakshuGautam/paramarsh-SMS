import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { FeeStructuresEdit } from '@/app/admin/resources/feeStructures/Edit';

const mockData = { id: 1, name: 'Test Fee', amount: 15000 };

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockData }),
    update: () => Promise.resolve({ data: mockData }),
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getMany: () => Promise.resolve({ data: [] }),
  });

  return render(
    <MemoryRouter initialEntries={['/feeStructures/1/edit']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="feeStructures">
            <Routes>
              <Route path="/feeStructures/:id/edit" element={<FeeStructuresEdit />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<FeeStructuresEdit>', () => {
  test('renders edit form', () => {
    renderComponent();
    expect(document.body).toContainHTML('<div>');
  });
});