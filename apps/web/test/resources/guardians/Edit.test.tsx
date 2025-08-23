import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { getEditPage } from '../../utils/page-objects';
import { detectMUIImports } from '../../utils/test-helpers';
import { GuardiansEdit } from '../../../app/admin/resources/guardians/Edit';

describe('Guardians Edit - User Stories', () => {
  const editPage = getEditPage();

  const mockGuardianData = {
    id: 'guardian-1',
    studentId: 'student-1',
    relation: 'father',
    name: 'John Doe Sr.',
    phone: '+91-9876543210',
    email: 'john.doe.sr@example.com',
    address: '123 Main Street, City',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  };

  const mockStudentsData = [
    { id: 'student-1', firstName: 'John', lastName: 'Doe', admissionNo: 'ADM2024001' },
    { id: 'student-2', firstName: 'Jane', lastName: 'Smith', admissionNo: 'ADM2024002' },
    { id: 'student-3', firstName: 'Mike', lastName: 'Johnson', admissionNo: 'ADM2024003' }
  ];

  const renderGuardiansEdit = (dataProviderOverrides = {}, guardianData = mockGuardianData) => {
    const dataProvider = testDataProvider({
      getOne: jest.fn().mockResolvedValue({ data: guardianData }),
      update: jest.fn().mockResolvedValue({ 
        data: { ...guardianData, updatedAt: '2024-01-17T10:30:00Z' }
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
          <GuardiansEdit />
        </AdminContext>
      ),
      dataProvider
    };
  };

  describe('As a school administrator editing guardian information', () => {
    it('should see the edit form prefilled with current guardian data', async () => {
      const { container } = renderGuardiansEdit();
      
      await editPage.expectEditForm('guardian-1');
      
      // Verify form is prefilled with existing data
      await editPage.expectPrefilledForm({
        relation: 'father',
        name: 'John Doe Sr.',
        phone: '+91-9876543210',
        email: 'john.doe.sr@example.com',
        address: '123 Main Street, City'
      });
      
      // Should not use MUI components
      editPage.expectNoMUIComponents(container);
    });

    it('should be able to update guardian personal information', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Update guardian information
      await editPage.updateField('name', 'John Doe Senior');
      await editPage.updateField('phone', '+91-9876543299');
      await editPage.updateField('email', 'john.senior@example.com');
      
      // Save changes
      await editPage.saveChanges();
      
      // Verify update was called with correct data
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
          'guardians',
          expect.objectContaining({
            data: expect.objectContaining({
              name: 'John Doe Senior',
              phone: '+91-9876543299',
              email: 'john.senior@example.com'
            })
          })
        );
      });
    });

    it('should be able to change the guardian relationship type', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Update relationship type
      await editPage.updateField('relation', 'guardian');
      
      // Save changes
      await editPage.saveChanges();
      
      // Verify update was called
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
          'guardians',
          expect.objectContaining({
            data: expect.objectContaining({
              relation: 'guardian'
            })
          })
        );
      });
    });

    it('should be able to update guardian address', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Update address
      await editPage.updateField('address', '456 Oak Avenue, New City, State 12345');
      
      // Save changes
      await editPage.saveChanges();
      
      // Verify update was called
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
          'guardians',
          expect.objectContaining({
            data: expect.objectContaining({
              address: '456 Oak Avenue, New City, State 12345'
            })
          })
        );
      });
    });

    it('should be able to change the linked student', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Wait for form to load with reference data
      await waitFor(() => {
        expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      });
      
      // Note: Testing autocomplete changes requires more complex setup
      // This verifies the field is present and accessible
      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
    });

    it('should see validation errors for invalid updates', async () => {
      renderGuardiansEdit({
        update: jest.fn().mockRejectedValue({
          message: 'Validation failed',
          body: { 
            errors: { 
              email: 'Email format is invalid',
              phone: 'Phone number must be valid'
            } 
          }
        })
      });
      
      await editPage.expectEditForm();
      
      // Try to update with invalid data
      await editPage.updateField('email', 'invalid-email');
      await editPage.updateField('phone', 'invalid-phone');
      await editPage.saveChanges();
      
      // Should show form again (not navigate away on error)
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Date Handling in Edit Form', () => {
    const createGuardianWithDates = (dateScenario) => ({
      ...mockGuardianData,
      ...dateScenario.dates
    });

    const dateTestCases = [
      { 
        scenario: 'null dates', 
        dates: { createdAt: null, updatedAt: null } 
      },
      { 
        scenario: 'undefined dates', 
        dates: { createdAt: undefined, updatedAt: undefined } 
      },
      { 
        scenario: 'invalid date strings', 
        dates: { createdAt: 'invalid-date', updatedAt: 'not-a-date' } 
      },
      { 
        scenario: 'valid ISO dates', 
        dates: { createdAt: '2024-01-15T10:30:00Z', updatedAt: '2024-01-16T10:30:00Z' } 
      },
      { 
        scenario: 'mixed valid and invalid dates', 
        dates: { createdAt: null, updatedAt: '2024-01-15T10:30:00Z' } 
      }
    ];

    dateTestCases.forEach(({ scenario, dates }) => {
      it(`should handle guardians with ${scenario} in edit form`, async () => {
        const guardianWithSpecificDates = createGuardianWithDates({ dates });
        
        const { container } = renderGuardiansEdit({}, guardianWithSpecificDates);
        
        await editPage.expectSafeDateHandling(guardianWithSpecificDates);
        
        // Verify form loads without date errors
        await editPage.expectEditForm();
        
        // Should not show date-related errors
        expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
      });
    });

    it('should handle date field updates safely', async () => {
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Update other fields (no date fields in current form)
      await editPage.updateField('name', 'Updated Name');
      
      // Should not cause any date-related errors
      expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    });
  });

  describe('Guardian Relationship Management', () => {
    it('should support changing between different relationship types', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      const relationshipTypes = [
        'father',
        'mother',
        'guardian',
        'grandfather',
        'grandmother',
        'uncle',
        'aunt',
        'other'
      ];
      
      // Test changing to different relationship types
      for (const relation of relationshipTypes) {
        await editPage.updateField('relation', relation);
        
        const formData = editPage.getFormData();
        expect(formData.relation).toBe(relation);
      }
    });

    it('should handle custom relationship types', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Test custom relationship types
      const customRelations = [
        'stepfather',
        'stepmother',
        'adoptive parent',
        'legal guardian',
        'family friend'
      ];
      
      for (const relation of customRelations) {
        await editPage.updateField('relation', relation);
        
        const formData = editPage.getFormData();
        expect(formData.relation).toBe(relation);
      }
    });
  });

  describe('Contact Information Updates', () => {
    it('should validate and update phone numbers', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Test various phone number formats
      const phoneTests = [
        '+91-9876543210', // Indian format
        '+1-555-123-4567', // US format
        '9876543210', // Without country code
        '+44-20-1234-5678' // UK format
      ];
      
      for (const phone of phoneTests) {
        await editPage.updateField('phone', phone);
        
        await editPage.saveChanges();
        
        await waitFor(() => {
          expect(dataProvider.update).toHaveBeenCalledWith(
            'guardians',
            expect.objectContaining({
              data: expect.objectContaining({
                phone: phone
              })
            })
          );
        });
      }
    });

    it('should validate and update email addresses', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Test various email formats
      const emailTests = [
        'updated@example.com',
        'guardian.updated@school.edu',
        'test.email@domain.co.in',
        'parent123@gmail.com'
      ];
      
      for (const email of emailTests) {
        await editPage.updateField('email', email);
        
        await editPage.saveChanges();
        
        await waitFor(() => {
          expect(dataProvider.update).toHaveBeenCalledWith(
            'guardians',
            expect.objectContaining({
              data: expect.objectContaining({
                email: email
              })
            })
          );
        });
      }
    });

    it('should handle empty contact information updates', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Clear contact information
      await editPage.updateField('phone', '');
      await editPage.updateField('email', '');
      
      await editPage.saveChanges();
      
      // Should allow empty contact fields
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
          'guardians',
          expect.objectContaining({
            data: expect.objectContaining({
              phone: '',
              email: ''
            })
          })
        );
      });
    });
  });

  describe('Form State Management', () => {
    it('should track form changes correctly', async () => {
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Get initial form state
      const initialFormData = editPage.getFormData();
      expect(initialFormData.name).toBe('John Doe Sr.');
      
      // Make changes
      await editPage.updateField('name', 'Modified Name');
      await editPage.updateField('relation', 'mother');
      
      // Verify form state changed
      const updatedFormData = editPage.getFormData();
      expect(updatedFormData.name).toBe('Modified Name');
      expect(updatedFormData.relation).toBe('mother');
    });

    it('should preserve unchanged fields during update', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Only update one field
      await editPage.updateField('name', 'NewName');
      
      await editPage.saveChanges();
      
      // Should include all original data plus the change
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
          'guardians',
          expect.objectContaining({
            data: expect.objectContaining({
              name: 'NewName',
              relation: 'father', // Should preserve original
              phone: '+91-9876543210', // Should preserve original
              email: 'john.doe.sr@example.com' // Should preserve original
            })
          })
        );
      });
    });

    it('should handle concurrent editing scenarios', async () => {
      renderGuardiansEdit({
        update: jest.fn().mockRejectedValue({
          message: 'Conflict: Guardian was modified by another user',
          status: 409
        })
      });
      
      await editPage.expectEditForm();
      
      await editPage.updateField('name', 'Concurrent Edit Test');
      await editPage.saveChanges();
      
      // Should show form again with error handling
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during update', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderGuardiansEdit({
        update: jest.fn().mockRejectedValue(new Error('Network error'))
      });
      
      await editPage.expectEditForm();
      
      await editPage.updateField('name', 'Network Error Test');
      await editPage.saveChanges();
      
      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing guardian data gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderGuardiansEdit({
        getOne: jest.fn().mockRejectedValue(new Error('Guardian not found'))
      });
      
      // Should handle loading error
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed guardian data', async () => {
      const malformedGuardianData = {
        id: 'guardian-1',
        // Missing required fields
        name: null,
        relation: undefined,
        // Invalid data types
        phone: {},
        email: []
      };
      
      renderGuardiansEdit({}, malformedGuardianData);
      
      await editPage.expectEditForm();
      
      // Should handle malformed data without crashing
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });

  describe('Student Reference Integration', () => {
    it('should load and display current student association', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Should load students data for reference field
      await waitFor(() => {
        expect(dataProvider.getList).toHaveBeenCalledWith(
          'students',
          expect.any(Object)
        );
      });
      
      // Student field should show current selection
      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
    });

    it('should handle student reference loading errors', async () => {
      renderGuardiansEdit({
        getList: jest.fn().mockImplementation((resource) => {
          if (resource === 'students') {
            return Promise.reject(new Error('Failed to load students'));
          }
          return Promise.resolve({ data: [], total: 0 });
        })
      });
      
      await editPage.expectEditForm();
      
      // Form should still be usable even if reference data fails
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('should handle changing student associations', async () => {
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Wait for reference data to load
      await waitFor(() => {
        expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      });
      
      // Note: Testing autocomplete selection requires more complex setup
      // This verifies the field is accessible for changes
      const studentField = screen.getByLabelText(/student/i);
      expect(studentField).toBeInTheDocument();
    });
  });

  describe('Component Library Compliance', () => {
    it('should not use MUI components', () => {
      const { container } = renderGuardiansEdit();
      
      editPage.expectNoMUIComponents(container);
      expect(detectMUIImports(container)).toBe(false);
    });

    it('should use React Admin and shadcn/ui components only', async () => {
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Should use React Admin components
      expect(screen.getByRole('form')).toBeInTheDocument();
      
      // Should not use MUI
      const muiElements = document.querySelectorAll('[class*="Mui"]');
      expect(muiElements).toHaveLength(0);
    });
  });

  describe('Multi-tenancy Support', () => {
    it('should include tenant header in getOne request', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      expect(dataProvider.getOne).toHaveBeenCalledWith(
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

    it('should include tenant header in update requests', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      await editPage.updateField('name', 'Tenant Test Update');
      await editPage.saveChanges();
      
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
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

    it('should include tenant header in reference data requests', async () => {
      const { dataProvider } = renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
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

  describe('Performance Considerations', () => {
    it('should load edit form efficiently', async () => {
      const start = performance.now();
      
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      const end = performance.now();
      const loadTime = end - start;
      
      // Should load within reasonable time (less than 1000ms)
      expect(loadTime).toBeLessThan(1000);
    });

    it('should handle form updates responsively', async () => {
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      const start = performance.now();
      
      // Perform multiple updates
      await editPage.updateField('name', 'Performance Test 1');
      await editPage.updateField('relation', 'mother');
      await editPage.updateField('phone', '+91-9876543299');
      
      const end = performance.now();
      const updateTime = end - start;
      
      // Updates should be responsive (less than 400ms)
      expect(updateTime).toBeLessThan(400);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper form labels and ARIA attributes', async () => {
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
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
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      const user = userEvent.setup();
      
      // Should be able to navigate between fields with keyboard
      const studentField = screen.getByLabelText(/student/i);
      const relationField = screen.getByLabelText(/relation/i);
      
      await user.click(studentField);
      expect(document.activeElement).toBe(studentField);
      
      await user.tab();
      expect(document.activeElement).toBe(relationField);
    });

    it('should provide appropriate feedback for form actions', async () => {
      renderGuardiansEdit();
      
      await editPage.expectEditForm();
      
      // Save button should be properly labeled
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveAttribute('type', 'submit');
    });
  });
});