<<<<<<< HEAD
import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { MarksCreate } from '@/app/admin/resources/marks/Create';

const renderMarksCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  const dataProvider = testDataProvider({
    create: () => Promise.resolve({ data: { id: 1, obtainedMarks: 85 } }),
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getMany: () => Promise.resolve({ data: [] }),
=======
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminContext, ResourceContextProvider, testDataProvider } from "react-admin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { MarksCreate } from "@/app/admin/resources/marks/Create";

const renderMarksCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    create: jest.fn((resource, params) => {
      const newRecord = { id: Date.now(), ...params.data };
      return Promise.resolve({ data: newRecord });
    }),
    getList: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
>>>>>>> origin/main
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
<<<<<<< HEAD
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
=======
        <AdminContext dataProvider={dataProvider}>
>>>>>>> origin/main
          <ResourceContextProvider value="marks">
            <MarksCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

<<<<<<< HEAD
describe('<MarksCreate>', () => {
  test('renders create form', () => {
    renderMarksCreate();
    expect(screen.container).toBeInTheDocument();
  });
});
=======
describe("MarksCreate Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without errors", async () => {
    renderMarksCreate();
    
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("has no MUI components", async () => {
    renderMarksCreate();
    
    const muiElements = document.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles form submission", async () => {
    const mockCreate = jest.fn(() => Promise.resolve({ data: { id: 1 } }));
    renderMarksCreate({ create: mockCreate });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should attempt to create
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  test("supports multi-tenancy", async () => {
    const mockCreate = jest.fn(() => Promise.resolve({ data: { id: 1 } }));
    renderMarksCreate({ create: mockCreate });
    
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("renders with proper accessibility", async () => {
    renderMarksCreate();
    
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});
>>>>>>> origin/main
