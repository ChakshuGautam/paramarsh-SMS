import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { MarksShow } from '@/app/admin/resources/marks/Show';

const mockMark = { id: 1, obtainedMarks: 85, maxMarks: 100, grade: 'A' };

const renderMarksShow = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockMark }),
    getMany: () => Promise.resolve({ data: [] }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={['/marks/1/show']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="marks">
            <Routes>
              <Route path="/marks/:id/show" element={<MarksShow />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<MarksShow>', () => {
  test('renders mark details', async () => {
    renderMarksShow();
    expect(await screen.findByText('Mark Entry Details')).toBeInTheDocument();
  });

  test('displays grade', async () => {
    renderMarksShow();
    expect(await screen.findByText('A')).toBeInTheDocument();
  });
});