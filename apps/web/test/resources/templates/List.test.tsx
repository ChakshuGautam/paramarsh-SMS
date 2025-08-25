<<<<<<< HEAD
import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { TemplatesList } from '@/app/admin/resources/templates/List';

const mockData = [{ id: 1, name: 'Test Template', type: 'sms', branchId: 'dps-main' }];

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const dataProvider = testDataProvider({
    getList: () => Promise.resolve({ data: mockData, total: mockData.length }),
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="templates">
            <TemplatesList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<TemplatesList>', () => {
  test('renders templates list', async () => {
    renderComponent();
    expect(await screen.findByText('Test Template')).toBeInTheDocument();
  });
});
=======
import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TemplatesList } from "@/app/admin/resources/templates/List";
import { renderWithReactAdmin, expectNoDateErrors, createMockDataProvider } from "../../test-helpers";

const mockData = [
  {
    id: 1,
    name: "Test Templates",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
];

describe("TemplatesList Component", () => {
  test("renders without errors", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    renderWithReactAdmin(<TemplatesList />, {
      resource: "templates",
      dataProvider,
    });

    // Wait for content to appear
    await screen.findByText("Test Templates");
    expectNoDateErrors();
  });

  test("handles date edge cases without errors", async () => {
    const testData = [
      { 
        ...mockData[0], 
        createdAt: null, 
        updatedAt: "invalid"
      }
    ];
    
    const dataProvider = createMockDataProvider(testData);
    
    renderWithReactAdmin(<TemplatesList />, {
      resource: "templates",
      dataProvider,
    });
    
    await screen.findByText("Test Templates");
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    const { container } = renderWithReactAdmin(<TemplatesList />, {
      resource: "templates",
      dataProvider,
    });
    
    await screen.findByText("Test Templates");
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    const dataProvider = createMockDataProvider([]);
    
    renderWithReactAdmin(<TemplatesList />, {
      resource: "templates",
      dataProvider,
    });
    
    // Should render without crashing - just check body exists
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });
});
>>>>>>> origin/main
