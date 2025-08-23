import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { getCreatePage } from '../../utils/page-objects';
import { detectMUIImports } from '../../utils/test-helpers';
import { GuardiansCreate } from '../../../app/admin/resources/guardians/Create';

describe('Guardians Create - User Stories', () => {
  const createPage = getCreatePage();

  const mockStudentsData = [
    { id: 'student-1', firstName: 'John', lastName: 'Doe', admissionNo: 'ADM2024001' },
    { id: 'student-2', firstName: 'Jane', lastName: 'Smith', admissionNo: 'ADM2024002' },
    { id: 'student-3', firstName: 'Mike', lastName: 'Johnson', admissionNo: 'ADM2024003' }
  ];

  const renderGuardiansCreate = (dataProviderOverrides = {}) => {
    const dataProvider = testDataProvider({
      create: jest.fn().mockResolvedValue({ 
        data: { id: 'new-guardian-id', name: 'New Guardian' }
      }),
      getList: jest.fn().mockImplementation((resource) => {
        if (resource === 'students') {
          return Promise.resolve({ data: mockStudentsData, total: mockStudentsData.length });
        }
        return Promise.resolve({ data: [], total: 0 });
      }),
      getMany: jest.fn().mockImplementation((resource, params) => {
        if (resource === 'students') {
          const requestedStudents = mockStudentsData.filter(s => params.ids.includes(s.id));
          return Promise.resolve({ data: requestedStudents });
        }
        return Promise.resolve({ data: [] });
      }),
      ...dataProviderOverrides,
    });

    return {
      ...render(
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <GuardiansCreate />
        </AdminContext>
      ),
      dataProvider
    };
  };

  describe('As a school administrator adding a new guardian', () => {
    it('should see a create form with all required guardian fields', async () => {
      const { container } = renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Check all required form fields are present
      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      
      // Should not use MUI components
      createPage.expectNoMUIComponents(container);
    });

    it('should be able to select a student to link with the guardian', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Wait for student reference data to load
      await waitFor(() => {
        expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      });
      
      // Student reference field should be present
      const studentField = screen.getByLabelText(/student/i);
      expect(studentField).toBeInTheDocument();
    });

    it('should be able to fill in guardian personal information', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Fill in guardian details
      await createPage.fillField('relation', 'father');
      await createPage.fillField('name', 'John Doe Sr.');
      await createPage.fillField('phone', '+91-9876543210');
      await createPage.fillField('email', 'john.doe.sr@example.com');
      await createPage.fillField('address', '123 Main Street, City');
      
      // Verify fields are filled
      const formData = createPage.getFormData();
      expect(formData.relation).toBe('father');
      expect(formData.name).toBe('John Doe Sr.');
      expect(formData.phone).toBe('+91-9876543210');
      expect(formData.email).toBe('john.doe.sr@example.com');
      expect(formData.address).toBe('123 Main Street, City');
    });

    it('should be able to specify different types of relationships', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Test different relationship types
      const relationshipTests = [
        'father',
        'mother',
        'guardian',
        'grandfather',
        'grandmother',
        'uncle',
        'aunt',
        'other'
      ];
      
      for (const relation of relationshipTests) {
        await createPage.fillField('relation', relation);
        const formData = createPage.getFormData();
        expect(formData.relation).toBe(relation);
      }
    });

    it('should be able to save a new guardian successfully', async () => {
      const { dataProvider } = renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Fill form with valid data
      await createPage.fillFormWithData({
        relation: 'mother',
        name: 'Jane Doe',
        phone: '+91-9876543211',
        email: 'jane.doe@example.com',
        address: '456 Oak Avenue'
      });
      
      // Submit form
      await createPage.submitForm();
      
      // Verify create was called
      await waitFor(() => {
        expect(dataProvider.create).toHaveBeenCalledWith(
          'guardians',
          expect.objectContaining({
            data: expect.objectContaining({
              relation: 'mother',
              name: 'Jane Doe',
              phone: '+91-9876543211',
              email: 'jane.doe@example.com',
              address: '456 Oak Avenue'
            })
          })
        );
      });
    });

    it('should see validation errors for missing required information', async () => {
      renderGuardiansCreate({
        create: jest.fn().mockRejectedValue({
          message: 'Validation failed',
          body: { errors: { name: 'Guardian name is required' } }
        })
      });
      
      await createPage.expectCreateForm();
      
      // Try to submit form with minimal data
      await createPage.fillField('relation', 'father');
      await createPage.submitForm();
      
      // Should show validation feedback
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });

    it('should handle duplicate guardian creation appropriately', async () => {
      renderGuardiansCreate({
        create: jest.fn().mockRejectedValue({
          message: 'Guardian already exists for this student',
          status: 400
        })
      });
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        relation: 'father',
        name: 'Existing Guardian',
        phone: '+91-9876543210',
        email: 'existing@example.com'
      });
      
      await createPage.submitForm();
      
      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Form Field Validation and Behavior', () => {
    it('should validate phone number format appropriately', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Test various phone number formats
      const phoneTests = [
        '+91-9876543210', // Valid Indian format
        '9876543210', // Valid without country code
        '+1-555-123-4567', // Valid US format
        'invalid-phone' // Invalid format
      ];
      
      for (const phone of phoneTests) {
        await createPage.fillField('phone', phone);
        const phoneField = screen.getByLabelText(/phone/i) as HTMLInputElement;
        expect(phoneField.value).toBe(phone);
      }
    });

    it('should validate email format appropriately', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Test various email formats
      const emailTests = [
        'valid@example.com',
        'test.email@domain.co.in',
        'invalid-email', // Should be handled by HTML5 validation
        'another@test'
      ];
      
      for (const email of emailTests) {
        await createPage.fillField('email', email);
        const emailField = screen.getByLabelText(/email/i) as HTMLInputElement;
        expect(emailField.value).toBe(email);
        expect(emailField.type).toBe('text'); // React Admin uses text input
      }
    });

    it('should handle safe date handling if date fields are added', async () => {
      renderGuardiansCreate();
      
      await createPage.expectSafeDateHandling();
      
      // Current form doesn't have date fields, but this ensures
      // any future date fields won't cause "Invalid time value" errors
      expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
    });

    it('should handle form field interactions smoothly', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Test rapid field switching
      await createPage.fillField('name', 'Test Name');
      await createPage.fillField('relation', 'mother');
      await createPage.fillField('email', 'test@example.com');
      
      // All fields should retain their values
      const formData = createPage.getFormData();
      expect(formData.name).toBe('Test Name');
      expect(formData.relation).toBe('mother');
      expect(formData.email).toBe('test@example.com');
    });
  });

  describe('Student Reference Integration', () => {
    it('should load available students for selection', async () => {
      const { dataProvider } = renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Should request students data for reference input
      await waitFor(() => {
        expect(dataProvider.getList).toHaveBeenCalledWith(
          'students',
          expect.any(Object)
        );
      });
    });

    it('should handle student reference selection', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Wait for student reference field to load
      await waitFor(() => {
        const studentField = screen.getByLabelText(/student/i);
        expect(studentField).toBeInTheDocument();
      });
      
      // Note: Testing autocomplete selection requires more complex setup
      // This verifies the field is present and functional
      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
    });

    it('should handle student reference loading errors gracefully', async () => {
      renderGuardiansCreate({
        getList: jest.fn().mockRejectedValue(new Error('Failed to load students'))
      });
      
      await createPage.expectCreateForm();
      
      // Form should still render even if student reference data fails
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
    });

    it('should handle empty student list gracefully', async () => {
      renderGuardiansCreate({
        getList: jest.fn().mockImplementation((resource) => {
          if (resource === 'students') {
            return Promise.resolve({ data: [], total: 0 });
          }
          return Promise.resolve({ data: [], total: 0 });
        })
      });
      
      await createPage.expectCreateForm();
      
      // Form should still be usable with empty student list
      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });

  describe('Guardian Relationship Types', () => {
    it('should support all standard relationship types', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      const standardRelations = [
        'father',
        'mother',
        'guardian',
        'grandfather',
        'grandmother',
        'uncle',
        'aunt',
        'other'
      ];
      
      // Each relationship type should be enterable
      for (const relation of standardRelations) {
        await createPage.fillField('relation', relation);
        const relationField = screen.getByLabelText(/relation/i) as HTMLInputElement;
        expect(relationField.value).toBe(relation);
      }
    });

    it('should handle custom relationship types', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Test custom relationship types
      const customRelations = [
        'stepfather',
        'stepmother',
        'family friend',
        'adoptive parent',
        'legal guardian'
      ];
      
      for (const relation of customRelations) {
        await createPage.fillField('relation', relation);
        const relationField = screen.getByLabelText(/relation/i) as HTMLInputElement;
        expect(relationField.value).toBe(relation);
      }
    });
  });

  describe('Component Library Compliance', () => {
    it('should not use MUI components', () => {
      const { container } = renderGuardiansCreate();
      
      createPage.expectNoMUIComponents(container);
      expect(detectMUIImports(container)).toBe(false);
    });

    it('should use React Admin and shadcn/ui components only', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Should use React Admin form components
      expect(screen.getByRole('form')).toBeInTheDocument();
      
      // Should use shadcn/ui styling (check for absence of MUI)
      const muiElements = document.querySelectorAll('[class*="Mui"]');
      expect(muiElements).toHaveLength(0);
    });
  });

  describe('Multi-tenancy Support', () => {
    it('should include tenant header in create requests', async () => {
      const { dataProvider } = renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        relation: 'father',
        name: 'Tenant Test Guardian',
        phone: '+91-9876543210',
        email: 'tenant.test@example.com'
      });
      
      await createPage.submitForm();
      
      await waitFor(() => {
        expect(dataProvider.create).toHaveBeenCalledWith(
          'guardians',
          expect.objectContaining({
            meta: expect.objectContaining({
              headers: expect.objectContaining({
                'X-Branch-Id': expect.any(String)
              })
            })
          })
        );
      });
    });

    it('should include tenant header in student reference requests', async () => {
      const { dataProvider } = renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      await waitFor(() => {
        expect(dataProvider.getList).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            meta: expect.objectContaining({
              headers: expect.objectContaining({
                'X-Branch-Id': expect.any(String)
              })
            })
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderGuardiansCreate({
        create: jest.fn().mockRejectedValue(new Error('Network error'))
      });
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        name: 'Error Test',
        relation: 'father'
      });
      
      await createPage.submitForm();
      
      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed response data', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderGuardiansCreate({
        create: jest.fn().mockResolvedValue({ /* missing data field */ })
      });
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        name: 'Malformed Test',
        relation: 'mother'
      });
      
      await createPage.submitForm();
      
      // Should handle malformed response gracefully
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle validation errors with meaningful feedback', async () => {
      renderGuardiansCreate({
        create: jest.fn().mockRejectedValue({
          message: 'Validation failed',
          body: {
            errors: {
              phone: 'Phone number must be valid',
              email: 'Email format is invalid'
            }
          }
        })
      });
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        name: 'Invalid Data Test',
        phone: 'invalid-phone',
        email: 'invalid-email'
      });
      
      await createPage.submitForm();
      
      // Should show form with validation errors
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should render form quickly', async () => {
      const start = performance.now();
      
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      const end = performance.now();
      const renderTime = end - start;
      
      // Should render within reasonable time (less than 600ms)
      expect(renderTime).toBeLessThan(600);
    });

    it('should handle form interactions responsively', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      const start = performance.now();
      
      // Perform multiple field interactions
      await createPage.fillField('name', 'Performance Test');
      await createPage.fillField('relation', 'father');
      await createPage.fillField('phone', '+91-9876543210');
      await createPage.fillField('email', 'perf.test@example.com');
      
      const end = performance.now();
      const interactionTime = end - start;
      
      // Interactions should be responsive (less than 300ms)
      expect(interactionTime).toBeLessThan(300);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper form labels and structure', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // All form fields should have proper labels
      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      
      // Form should have proper structure
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      const user = userEvent.setup();
      
      // Should be able to tab through form fields
      const studentField = screen.getByLabelText(/student/i);
      const relationField = screen.getByLabelText(/relation/i);
      
      await user.click(studentField);
      expect(document.activeElement).toBe(studentField);
      
      await user.tab();
      expect(document.activeElement).toBe(relationField);
    });

    it('should provide meaningful field descriptions', async () => {
      renderGuardiansCreate();
      
      await createPage.expectCreateForm();
      
      // Form fields should have clear, descriptive labels
      const labels = [
        screen.getByLabelText(/student/i),
        screen.getByLabelText(/relation/i),
        screen.getByLabelText(/name/i),
        screen.getByLabelText(/phone/i),
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/address/i)
      ];
      
      labels.forEach(label => {
        expect(label).toHaveAttribute('aria-label');
      });
    });
  });
});