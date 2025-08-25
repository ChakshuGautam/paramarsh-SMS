import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { FeeStructuresList } from '@/app/admin/resources/feeStructures/List';

const mockFeeStructures = [
  { id: 1, name: 'Class 5 Fee Structure', amount: 15000, classId: 1, branchId: 'dps-main' },
  { id: 2, name: 'Class 6 Fee Structure', amount: 16000, classId: 2, branchId: 'dps-main' }
];

const renderComponent = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  const dataProvider = testDataProvider({
    getList: () => Promise.resolve({ data: mockFeeStructures, total: mockFeeStructures.length }),
    getMany: () => Promise.resolve({ data: [] }),
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    ...dataProviderOverrides
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="feeStructures">
            <FeeStructuresList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<FeeStructuresList>', () => {
  test('renders fee structures list', async () => {
    renderComponent();
    
    // Wait for list to load and check for content
    const items = await screen.findAllByText(/Fee Structure/);
    expect(items.length).toBeGreaterThan(0);
    
    // Verify no date errors
    expect(document.body.textContent).not.toMatch(/Invalid time value/i);
    expect(document.body.textContent).not.toMatch(/Invalid Date/i);
  });

  test('handles null values safely', async () => {
    const nullData = [{ id: 1, name: null, amount: null, classId: null, branchId: 'dps-main' }];
    renderComponent({ getList: () => Promise.resolve({ data: nullData, total: 1 }) });
    
    // Should render without errors
    expect(document.body.textContent).not.toMatch(/Invalid time value/i);
  });
});