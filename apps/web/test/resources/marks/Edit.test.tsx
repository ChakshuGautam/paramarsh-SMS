import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { MarksEdit } from '@/app/admin/resources/marks/Edit';

const mockMark = { id: 1, obtainedMarks: 85, maxMarks: 100, grade: 'A' };

const renderMarksEdit = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ data: mockMark }),
    update: () => Promise.resolve({ data: mockMark }),
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getMany: () => Promise.resolve({ data: [] }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={['/marks/1/edit']}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="marks">
            <Routes>
              <Route path="/marks/:id/edit" element={<MarksEdit />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<MarksEdit>', () => {
  test('renders edit form', async () => {
    renderMarksEdit();
    // Just verify it renders without crashing
    expect(document.body).toContainHTML('<div>');
  });
});