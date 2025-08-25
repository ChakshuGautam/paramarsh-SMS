import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { CampaignsList } from '@/app/admin/resources/campaigns/List';

const mockData = [{ id: 1, title: 'Test Campaign', status: 'active', branchId: 'dps-main' }];

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const dataProvider = testDataProvider({
    getList: () => Promise.resolve({ data: mockData, total: mockData.length }),
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="campaigns">
            <CampaignsList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<CampaignsList>', () => {
  test('renders campaigns list', async () => {
    renderComponent();
    expect(await screen.findByText('Test Campaign')).toBeInTheDocument();
  });
});