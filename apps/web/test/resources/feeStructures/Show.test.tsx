import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { FeeStructuresShow } from '@/app/admin/resources/feeStructures/Show';

const mockData = { id: 1, name: 'Test Fee Structure', amount: 15000 };

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockData }),
    getMany: () => Promise.resolve({ data: [] }),
  });

  return render(
    <MemoryRouter initialEntries={['/feeStructures/1/show']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="feeStructures">
            <Routes>
              <Route path="/feeStructures/:id/show" element={<FeeStructuresShow />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<FeeStructuresShow>', () => {
  test('renders show view', async () => {
    renderComponent();
    expect(await screen.findByText('Test Fee Structure')).toBeInTheDocument();
  });
});