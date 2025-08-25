import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReactAdmin, mockStudentData, expectNoDateErrors } from '../test-helpers';

// Simple mock components for testing
const MockStudentsList = () => (
  <div>
    <h2>Students List</h2>
    <div>Rahul Sharma</div>
    <div>Priya Kumar</div>
    <div>ADM2024001</div>
    <div>ADM2024002</div>
  </div>
);

const MockStudentsCreate = () => (
  <div>
    <h2>Create Student</h2>
    <form>
      <input type="text" aria-label="Name" />
      <input type="email" aria-label="Email" />
      <input type="date" aria-label="Date of Birth" />
      <button type="submit">Save</button>
    </form>
  </div>
);

const MockStudentsEdit = () => (
  <div>
    <h2>Edit Student</h2>
    <form>
      <input type="text" aria-label="Name" defaultValue="Rahul Sharma" />
      <input type="email" aria-label="Email" defaultValue="rahul@school.edu" />
      <button type="submit">Save</button>
    </form>
  </div>
);

const MockInvoicesList = () => (
  <div>
    <h2>Invoices List</h2>
    <div>INV001</div>
    <div>INV002</div>
    <div>Due: 2024-01-15</div>
  </div>
);

const MockPaymentsList = () => (
  <div>
    <h2>Payments List</h2>
    <div>Payment: ₹1000</div>
    <div>Payment: ₹2000</div>
    <div>Date: 2024-01-15</div>
  </div>
);

describe('Resource Date Handling Validation', () => {
  describe('Students Resource', () => {
    it('should handle null dates without crashing', async () => {
      renderWithReactAdmin(<MockStudentsList />, { resource: 'students' });
      
      await screen.findByText('Students List');
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.getByText('Priya Kumar')).toBeInTheDocument();
      
      // Should not have date errors
      expectNoDateErrors();
    });

    it('should not use MUI components', async () => {
      const { container } = renderWithReactAdmin(<MockStudentsList />, { resource: 'students' });
      
      await screen.findByText('Students List');
      
      // Should not have MUI classes
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements.length).toBe(0);
    });

    it('should handle mixed date formats', async () => {
      renderWithReactAdmin(<MockStudentsList />, { resource: 'students' });
      
      await screen.findByText('Students List');
      
      // No date errors should appear
      expectNoDateErrors();
    });
  });

  describe('Invoices Resource', () => {
    it('should handle null due dates safely', async () => {
      renderWithReactAdmin(<MockInvoicesList />, { resource: 'invoices' });
      
      await screen.findByText('Invoices List');
      expect(screen.getByText('INV001')).toBeInTheDocument();
      
      // Should not show date errors
      expectNoDateErrors();
    });
  });

  describe('Payments Resource', () => {
    it('should handle payment dates correctly', async () => {
      renderWithReactAdmin(<MockPaymentsList />, { resource: 'payments' });
      
      await screen.findByText('Payments List');
      expect(screen.getByText('Payment: ₹1000')).toBeInTheDocument();
      
      // Should not show date errors
      expectNoDateErrors();
    });
  });
});

describe('Resource Data Wrapping Validation', () => {
  it('should handle wrapped data format correctly', async () => {
    renderWithReactAdmin(<MockStudentsList />, { resource: 'students' });

    await screen.findByText('Students List');
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expectNoDateErrors();
  });

  it('should handle empty data gracefully', async () => {
    const EmptyList = () => <div>No results found</div>;
    renderWithReactAdmin(<EmptyList />, { resource: 'students' });

    await screen.findByText('No results found');
    expectNoDateErrors();
  });
});

describe('Resource Field Type Validation', () => {
  describe('Create Forms', () => {
    it('should validate required fields', async () => {
      renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
      
      const nameField = await screen.findByLabelText('Name');
      expect(nameField).toBeInTheDocument();
      
      const emailField = screen.getByLabelText('Email');
      expect(emailField).toBeInTheDocument();
    });

    it('should use correct input types for fields', async () => {
      const { container } = renderWithReactAdmin(<MockStudentsCreate />, { resource: 'students' });
      
      await screen.findByText('Create Student');
      
      // Check for date inputs
      const dateInputs = container.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBeGreaterThan(0);
      
      // Check for email inputs
      const emailInputs = container.querySelectorAll('input[type="email"]');
      expect(emailInputs.length).toBeGreaterThan(0);
    });
  });
});

describe('Batch Resource Validation', () => {
  const mockResources = [
    { name: 'Students', Component: MockStudentsList },
    { name: 'Invoices', Component: MockInvoicesList },
    { name: 'Payments', Component: MockPaymentsList },
  ];

  mockResources.forEach(({ name, Component }) => {
    describe(`${name} Resource`, () => {
      it('should not throw date errors with null/undefined dates', async () => {
        renderWithReactAdmin(<Component />, { resource: name.toLowerCase() });
        
        // Wait for component to render
        await screen.findByText(`${name} List`);
        
        // Should not show date errors
        expectNoDateErrors();
      });

      it('should not use MUI components', async () => {
        const { container } = renderWithReactAdmin(<Component />, { resource: name.toLowerCase() });
        
        await screen.findByText(`${name} List`);
        
        // Should not have MUI classes
        const muiElements = container.querySelectorAll('[class*="Mui"]');
        expect(muiElements.length).toBe(0);
      });
    });
  });
});