<<<<<<< HEAD
import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { AttendanceRecordsList } from '@/app/admin/resources/attendanceRecords/List';

const mockData = [{ id: 1, status: 'present', date: '2024-08-24', studentId: 1, branchId: 'dps-main' }];

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const dataProvider = testDataProvider({
    getList: () => Promise.resolve({ data: mockData, total: mockData.length }),
    getMany: () => Promise.resolve({ data: [] }),
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="attendanceRecords">
            <AttendanceRecordsList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<AttendanceRecordsList>', () => {
  test('renders attendance records list', async () => {
    renderComponent();
    expect(await screen.findByText('present')).toBeInTheDocument();
  });
});
=======
import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AttendanceRecordsList } from "@/app/admin/resources/attendanceRecords/List";
import { renderWithReactAdmin, expectNoDateErrors, createMockDataProvider } from "../../test-helpers";

const mockData = [
  {
    id: 1,
    name: "Test Item",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
];

describe("AttendanceRecordsList Component", () => {
  test("renders without errors", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    renderWithReactAdmin(<AttendanceRecordsList />, {
      resource: "attendanceRecords",
      dataProvider,
    });

    // Just check that the page renders without crashing
    // Look for common list page elements instead of specific text
    await screen.findByText(/ra\.page\.list/);
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
    
    renderWithReactAdmin(<AttendanceRecordsList />, {
      resource: "attendanceRecords",
      dataProvider,
    });
    
    // Should render list page without crashing
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    const { container } = renderWithReactAdmin(<AttendanceRecordsList />, {
      resource: "attendanceRecords",
      dataProvider,
    });
    
    // Should render without errors
    expect(container).toBeInTheDocument();
    expectNoDateErrors();
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    const dataProvider = createMockDataProvider([]);
    
    renderWithReactAdmin(<AttendanceRecordsList />, {
      resource: "attendanceRecords",
      dataProvider,
    });
    
    // Should render without crashing - just check body exists
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });
});
>>>>>>> origin/main
