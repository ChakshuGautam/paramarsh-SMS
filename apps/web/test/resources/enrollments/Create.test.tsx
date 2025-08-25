import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { EnrollmentsCreate } from '@/app/admin/resources/enrollments/Create';

// Simple test data
const mockStudents = [
  { id: 1, firstName: 'Rahul', lastName: 'Sharma' },
  { id: 2, firstName: 'Priya', lastName: 'Patel' },
];

const mockClasses = [
  { id: 1, name: 'Class 5', gradeLevel: 5 },
  { id: 2, name: 'Class 6', gradeLevel: 6 },
];

const mockSections = [
  { id: 1, name: 'Section A', classId: 1 },
  { id: 2, name: 'Section B', classId: 1 },
];

// Simple render helper
const renderEnrollmentsCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockDataProvider = testDataProvider({
    getList: jest.fn((resource) => {
      if (resource === 'students') {
        return Promise.resolve({ data: mockStudents, total: mockStudents.length });
      }
      if (resource === 'classes') {
        return Promise.resolve({ data: mockClasses, total: mockClasses.length });
      }
      if (resource === 'sections') {
        return Promise.resolve({ data: mockSections, total: mockSections.length });
      }
      return Promise.resolve({ data: [], total: 0 });
    }),
    getMany: jest.fn(() => Promise.resolve({ data: [] })),
    create: jest.fn((resource, params) => Promise.resolve({ 
      data: { id: 1, ...params.data } 
    })),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={mockDataProvider} store={memoryStore()}>
          <ResourceContextProvider value="enrollments">
            <EnrollmentsCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('EnrollmentsCreate Component', () => {
  test('renders without errors', async () => {
    renderEnrollmentsCreate();
    
    // Wait for the component to render
    const heading = await screen.findByText(/create/i);
    expect(heading).toBeInTheDocument();
  });

  test('displays form fields', async () => {
    renderEnrollmentsCreate();
    
    // Wait for component to render
    await screen.findByText(/create/i);
    
    // Check for form inputs by finding any input elements
    const formInputs = screen.getAllByRole('textbox');
    expect(formInputs.length).toBeGreaterThan(0);
  });

  test('handles no date errors', async () => {
    renderEnrollmentsCreate();
    
    // Wait for component to render
    await screen.findByText(/create/i);
    
    // Check for absence of date errors
    expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  });

  test('displays expected form labels', async () => {
    renderEnrollmentsCreate();
    
    // Wait for component to render
    await screen.findByText(/create/i);
    
    // Check for expected form labels based on actual component structure
    expect(screen.getByText('Student ID')).toBeInTheDocument();
    expect(screen.getByText('Class ID')).toBeInTheDocument();
    expect(screen.getByText('Section ID')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});