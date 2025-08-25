import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PaymentsCreate } from '@/app/admin/resources/payments/Create';

// Simple test data
const mockInvoices = [
  { id: 1, invoiceNumber: 'INV/2024/001', amount: 15000 },
  { id: 2, invoiceNumber: 'INV/2024/002', amount: 25000 },
];

// Simple render helper
const renderPaymentsCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockDataProvider = testDataProvider({
    getList: jest.fn((resource) => {
      if (resource === 'invoices') {
        return Promise.resolve({ data: mockInvoices, total: mockInvoices.length });
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
          <ResourceContextProvider value="payments">
            <PaymentsCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('PaymentsCreate Component', () => {
  test('renders without errors', async () => {
    renderPaymentsCreate();
    
    // Wait for the component to render
    const heading = await screen.findByText(/create/i);
    expect(heading).toBeInTheDocument();
  });

  test('displays form fields', async () => {
    renderPaymentsCreate();
    
    // Wait for component to render
    await screen.findByText(/create/i);
    
    // Check for form inputs by finding any input elements
    const formInputs = screen.getAllByRole('textbox');
    expect(formInputs.length).toBeGreaterThan(0);
  });

  test('handles no date errors', async () => {
    renderPaymentsCreate();
    
    // Wait for component to render
    await screen.findByText(/create/i);
    
    // Check for absence of date errors
    expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  });

  test('displays expected form labels', async () => {
    renderPaymentsCreate();
    
    // Wait for component to render
    await screen.findByText(/create/i);
    
    // Check for expected form labels based on actual component structure
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Method')).toBeInTheDocument();
  });
});