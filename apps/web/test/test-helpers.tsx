import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AdminContext, ResourceContextProvider, testDataProvider } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Test wrapper component for React Admin tests
interface TestWrapperProps {
  children: React.ReactNode;
  resource?: string;
  dataProvider?: any;
}

const TestWrapper = ({ children, resource = 'test', dataProvider }: TestWrapperProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  const defaultDataProvider = testDataProvider({
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getOne: () => Promise.resolve({ data: {} }),
    getMany: () => Promise.resolve({ data: [] }),
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    create: () => Promise.resolve({ data: {} }),
    update: () => Promise.resolve({ data: {} }),
    updateMany: () => Promise.resolve({ data: [] }),
    delete: () => Promise.resolve({ data: {} }),
    deleteMany: () => Promise.resolve({ data: [] }),
  });

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider || defaultDataProvider}>
          <ResourceContextProvider value={resource}>
            {children}
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

// Custom render function for React Admin components
export const renderWithReactAdmin = (
  ui: React.ReactElement,
  options: RenderOptions & {
    resource?: string;
    dataProvider?: any;
  } = {}
) => {
  const { resource, dataProvider, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper resource={resource} dataProvider={dataProvider}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  });
};

// Mock data generators for different resources
export const mockStudentData = [
  {
    id: 1,
    admissionNo: 'ADM2024001',
    firstName: 'Rahul',
    lastName: 'Sharma',
    gender: 'male',
    status: 'active',
    classId: 1,
    sectionId: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
    class: { id: 1, name: 'Class 5', gradeLevel: 5 },
    section: { id: 1, name: 'A' },
    guardians: [
      {
        id: 1,
        isPrimary: true,
        relation: 'Father',
        guardian: {
          id: 1,
          phoneNumber: '+91-9876543210',
          alternatePhoneNumber: '+91-9876543211'
        }
      }
    ]
  },
  {
    id: 2,
    admissionNo: 'ADM2024002',
    firstName: 'Priya',
    lastName: 'Kumar',
    gender: 'female',
    status: 'active',
    classId: 1,
    sectionId: 2,
    createdAt: null,
    updatedAt: null,
    class: { id: 1, name: 'Class 5', gradeLevel: 5 },
    section: { id: 2, name: 'B' },
    guardians: []
  }
];

export const mockClassData = [
  {
    id: 1,
    name: 'Class 5',
    gradeLevel: 5,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
    sections: [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' }
    ]
  }
];

export const mockTimetableData = [
  {
    id: 1,
    name: 'A',
    classId: 1,
    sectionId: 1,
    academicYearId: 1,
    status: 'active',
    effectiveFrom: '2024-04-01',
    branchId: 'branch1',
    class: { id: 1, name: 'Class 5', gradeLevel: 5 },
    section: { id: 1, name: 'A' },
    academicYear: { id: 1, name: '2024-25' },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  }
];

// Date-safe test utilities
export const expectNoDateErrors = () => {
  expect(document.body.textContent).not.toMatch(/Invalid time value/i);
  expect(document.body.textContent).not.toMatch(/Invalid Date/i);
  expect(document.body.textContent).not.toMatch(/NaN/i);
};

// Mock data provider generator
export const createMockDataProvider = (mockData: any[] = [], overrides = {}) => {
  const mockGetList = jest.fn(() => Promise.resolve({ 
    data: mockData, 
    total: mockData.length 
  }));

  return testDataProvider({
    getList: mockGetList,
    getOne: () => Promise.resolve({ data: mockData[0] || {} }),
    getMany: () => Promise.resolve({ data: [] }),
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    create: () => Promise.resolve({ data: {} }),
    update: () => Promise.resolve({ data: {} }),
    updateMany: () => Promise.resolve({ data: [] }),
    delete: () => Promise.resolve({ data: {} }),
    deleteMany: () => Promise.resolve({ data: [] }),
    ...overrides,
  });
};

// Simplified component test patterns
export const testComponentRendering = async (
  component: React.ReactElement,
  expectedTexts: string[],
  resource = 'test',
  mockData: any[] = []
) => {
  const dataProvider = createMockDataProvider(mockData);
  
  const { findByText } = renderWithReactAdmin(component, {
    resource,
    dataProvider,
  });

  // Check that expected texts are rendered
  for (const text of expectedTexts) {
    await findByText(text);
  }

  // Verify no date errors
  expectNoDateErrors();
};