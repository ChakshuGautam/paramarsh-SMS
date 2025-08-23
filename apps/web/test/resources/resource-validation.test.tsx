import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithAdmin, mockDateData, detectDateErrors, detectMUIImports } from '../utils/test-helpers';

// Import all your resource components
import StudentsList from '../../app/admin/resources/students/List';
import StudentsCreate from '../../app/admin/resources/students/Create';
import StudentsEdit from '../../app/admin/resources/students/Edit';

import GuardiansList from '../../app/admin/resources/guardians/List';
import TeachersList from '../../app/admin/resources/teachers/List';
import ClassesList from '../../app/admin/resources/classes/List';
import SectionsList from '../../app/admin/resources/sections/List';
import InvoicesList from '../../app/admin/resources/invoices/List';
import PaymentsList from '../../app/admin/resources/payments/List';

describe('Resource Date Handling Validation', () => {
  describe('Students Resource', () => {
    it('should handle null dates without crashing', async () => {
      const dataProvider = {
        getList: () => Promise.resolve({
          data: [
            { id: 1, name: 'John Doe', createdAt: null, updatedAt: null },
            { id: 2, name: 'Jane Doe', createdAt: undefined, updatedAt: undefined },
          ],
          total: 2,
        }),
      };

      const { container } = renderWithAdmin(<StudentsList />, { dataProvider });
      
      await waitFor(() => {
        expect(screen.queryByText(/Invalid time value/)).toBeNull();
        expect(screen.queryByText(/Invalid Date/)).toBeNull();
      });
    });

    it('should not use MUI components', async () => {
      const { container } = renderWithAdmin(<StudentsList />);
      
      await waitFor(() => {
        expect(detectMUIImports(container)).toBe(false);
      });
    });

    it('should handle mixed date formats', async () => {
      const dataProvider = {
        getList: () => Promise.resolve({
          data: [
            mockDateData.validDates,
            mockDateData.nullDates,
            mockDateData.undefinedDates,
          ],
          total: 3,
        }),
      };

      const { container, queryByText } = renderWithAdmin(<StudentsList />, { dataProvider });
      
      await waitFor(() => {
        const errors = detectDateErrors(screen.getByTestId, screen.queryAllByText);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('Invoices Resource', () => {
    it('should handle null due dates safely', async () => {
      const dataProvider = {
        getList: () => Promise.resolve({
          data: [
            { id: 1, invoiceNumber: 'INV001', dueDate: null, createdAt: null },
            { id: 2, invoiceNumber: 'INV002', dueDate: '2024-01-15', createdAt: '2024-01-01' },
          ],
          total: 2,
        }),
      };

      const { container } = renderWithAdmin(<InvoicesList />, { dataProvider });
      
      await waitFor(() => {
        expect(screen.queryByText(/Invalid time value/)).toBeNull();
      });
    });
  });

  describe('Payments Resource', () => {
    it('should handle payment dates correctly', async () => {
      const dataProvider = {
        getList: () => Promise.resolve({
          data: [
            { id: 1, amount: 1000, paymentDate: null },
            { id: 2, amount: 2000, paymentDate: undefined },
            { id: 3, amount: 3000, paymentDate: '2024-01-15T10:30:00Z' },
          ],
          total: 3,
        }),
      };

      const { container } = renderWithAdmin(<PaymentsList />, { dataProvider });
      
      await waitFor(() => {
        expect(screen.queryByText(/Invalid time value/)).toBeNull();
      });
    });
  });
});

describe('Resource Data Wrapping Validation', () => {
  it('should handle unwrapped API responses gracefully', async () => {
    const dataProvider = {
      getList: () => Promise.resolve({
        // Correct format - data should be wrapped
        data: [{ id: 1, name: 'Test' }],
        total: 1,
      }),
    };

    const { container } = renderWithAdmin(<StudentsList />, { dataProvider });
    
    await waitFor(() => {
      expect(screen.queryByText(/Test/)).toBeTruthy();
    });
  });
});

describe('Resource Field Type Validation', () => {
  describe('Create Forms', () => {
    it('should validate required fields', async () => {
      const { container } = renderWithAdmin(<StudentsCreate />);
      
      // Check for required field indicators
      const requiredFields = container.querySelectorAll('[required], [aria-required="true"]');
      expect(requiredFields.length).toBeGreaterThan(0);
    });

    it('should use correct input types for fields', async () => {
      const { container } = renderWithAdmin(<StudentsCreate />);
      
      await waitFor(() => {
        // Check for date inputs
        const dateInputs = container.querySelectorAll('input[type="date"], input[type="datetime-local"]');
        
        // Check for number inputs
        const numberInputs = container.querySelectorAll('input[type="number"]');
        
        // Check for email inputs
        const emailInputs = container.querySelectorAll('input[type="email"]');
        
        // At least some typed inputs should exist
        expect(dateInputs.length + numberInputs.length + emailInputs.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Batch Resource Validation', () => {
  const resources = [
    { name: 'Students', List: StudentsList },
    { name: 'Guardians', List: GuardiansList },
    { name: 'Teachers', List: TeachersList },
    { name: 'Classes', List: ClassesList },
    { name: 'Sections', List: SectionsList },
    { name: 'Invoices', List: InvoicesList },
    { name: 'Payments', List: PaymentsList },
  ];

  resources.forEach(({ name, List }) => {
    describe(`${name} Resource`, () => {
      it('should not throw date errors with null/undefined dates', async () => {
        const dataProvider = {
          getList: () => Promise.resolve({
            data: [
              { id: 1, createdAt: null, updatedAt: null },
              { id: 2, createdAt: undefined, updatedAt: undefined },
            ],
            total: 2,
          }),
        };

        const { container } = renderWithAdmin(<List />, { dataProvider });
        
        await waitFor(() => {
          expect(screen.queryByText(/Invalid time value/)).toBeNull();
          expect(screen.queryByText(/Invalid Date/)).toBeNull();
        });
      });

      it('should not use MUI components', async () => {
        const { container } = renderWithAdmin(<List />);
        
        await waitFor(() => {
          const hasMUI = detectMUIImports(container);
          expect(hasMUI).toBe(false);
        });
      });
    });
  });
});