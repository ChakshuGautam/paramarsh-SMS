import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { StaffCreate } from '@/app/admin/resources/staff/Create';

// Simple render helper
const renderStaffCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockDataProvider = testDataProvider({
    getList: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
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
          <ResourceContextProvider value="staff">
            <StaffCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('StaffCreate Component', () => {
  test('renders without errors', async () => {
    renderStaffCreate();
    
    // Wait for the component to render - look for personal info section or form fields
    const personalInfo = await screen.findByText(/Personal Information/i);
    expect(personalInfo).toBeInTheDocument();
  });

  test('displays form fields', async () => {
    renderStaffCreate();
    
    // Wait for component to render
    await screen.findByText(/Personal Information/i);
    
    // Check for form inputs by finding any input elements
    const formInputs = screen.getAllByRole('textbox');
    expect(formInputs.length).toBeGreaterThan(0);
  });

  test('handles no date errors', async () => {
    renderStaffCreate();
    
    // Wait for component to render
    await screen.findByText(/Personal Information/i);
    
    // Check for absence of date errors
    expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  });

  test('displays expected form labels', async () => {
    renderStaffCreate();
    
    // Wait for component to render
    await screen.findByText(/Personal Information/i);
    
    // Check for expected form labels that should be present
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
});