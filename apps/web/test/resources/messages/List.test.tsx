import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { MessagesList } from '@/app/admin/resources/messages/List';

const mockData = [{ id: 1, content: 'Test Message', type: 'sms', branchId: 'dps-main' }];

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const dataProvider = testDataProvider({
    getList: () => Promise.resolve({ data: mockData, total: mockData.length }),
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="messages">
            <MessagesList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<MessagesList>', () => {
  test('renders messages list', async () => {
    renderComponent();
    expect(await screen.findByText('Test Message')).toBeInTheDocument();
  });
});