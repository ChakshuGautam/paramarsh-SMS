import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { InvoicesCreate } from '@/app/admin/resources/invoices/Create';

// Simple test data
const mockStudents = [
  { id: 1, firstName: 'Rahul', lastName: 'Sharma' },
  { id: 2, firstName: 'Priya', lastName: 'Kumar' },
];

// Simple render helper
const renderInvoicesCreate = (dataProviderOverrides = {}) => {
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
          <ResourceContextProvider value="invoices">
            <InvoicesCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('InvoicesCreate Component', () => {
  test('renders without errors', async () => {
    renderInvoicesCreate();
    
    // Wait for the component to render
    const heading = await screen.findByText(/create/i);
    expect(heading).toBeInTheDocument();
  });

  test('displays form fields', async () => {
    renderInvoicesCreate();
    
    // Wait for form to render - check for form element by tag
    const formElements = await screen.findAllByDisplayValue('');
    expect(formElements.length).toBeGreaterThan(0);
  });

  test('handles no date errors', async () => {
    renderInvoicesCreate();
    
    // Wait for component to render
    await screen.findByText(/create/i);
    
    // Check for absence of date errors
    expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  });

  test('displays expected form labels', async () => {
    renderInvoicesCreate();
    
    // Wait for component to render
    await screen.findByText(/create/i);
    
    // Check for expected form labels based on actual DOM structure
    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Due')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});