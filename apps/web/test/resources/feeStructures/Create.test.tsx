import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { FeeStructuresCreate } from '@/app/admin/resources/feeStructures/Create';

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const dataProvider = testDataProvider({
    create: () => Promise.resolve({ data: { id: 1, name: 'Test Fee' } }),
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getMany: () => Promise.resolve({ data: [] }),
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="feeStructures">
            <FeeStructuresCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<FeeStructuresCreate>', () => {
  test('renders create form', async () => {
    renderComponent();
    
    // Wait for the form to load and verify it renders without errors
    const gradeField = await screen.findByLabelText(/Grade/i);
    expect(gradeField).toBeInTheDocument();
    
    // Verify no date errors
    expect(document.body.textContent).not.toMatch(/Invalid time value/i);
    expect(document.body.textContent).not.toMatch(/Invalid Date/i);
  });
});