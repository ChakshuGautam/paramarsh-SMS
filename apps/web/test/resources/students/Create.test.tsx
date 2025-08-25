import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { StudentsCreate } from '@/app/admin/resources/students/Create';

// Simple test data
const mockClasses = [
  { id: 1, name: 'Class 5', gradeLevel: 5 },
  { id: 2, name: 'Class 6', gradeLevel: 6 },
];

const mockSections = [
  { id: 1, name: 'Section A', classId: 1 },
  { id: 2, name: 'Section B', classId: 1 },
];

const mockGuardians = [
  { id: 1, firstName: 'Ramesh', lastName: 'Sharma' },
  { id: 2, firstName: 'Suresh', lastName: 'Patel' },
];

// Simple render helper
const renderStudentsCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockDataProvider = testDataProvider({
    getList: jest.fn((resource) => {
      if (resource === 'classes') {
        return Promise.resolve({ data: mockClasses, total: mockClasses.length });
      }
      if (resource === 'sections') {
        return Promise.resolve({ data: mockSections, total: mockSections.length });
      }
      if (resource === 'guardians') {
        return Promise.resolve({ data: mockGuardians, total: mockGuardians.length });
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
          <ResourceContextProvider value="students">
            <StudentsCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('StudentsCreate Component', () => {
  test('renders without errors', async () => {
    renderStudentsCreate();
    
    // Wait for the component to render - look for personal info section
    const personalInfo = await screen.findByText(/Personal Information/i);
    expect(personalInfo).toBeInTheDocument();
  });

  test('handles no date errors', async () => {
    renderStudentsCreate();
    
    // Wait for component to render
    await screen.findByText(/Personal Information/i);
    
    // Check for absence of date errors
    expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  });

  test('displays form sections', async () => {
    renderStudentsCreate();
    
    // Wait for component to render
    await screen.findByText(/Personal Information/i);
    
    // Check for expected form sections that are actually present
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    
    // Check for some expected form fields
    expect(screen.getByText('Admission No')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    
    // Should not show any errors
    expect(document.body.textContent).not.toMatch(/Invalid time value/i);
    expect(document.body.textContent).not.toMatch(/Invalid Date/i);
  });
});