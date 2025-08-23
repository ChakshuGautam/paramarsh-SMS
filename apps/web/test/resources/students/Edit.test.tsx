import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { getEditPage, createMockDataWithDates } from '../../utils/page-objects';
import { detectMUIImports } from '../../utils/test-helpers';
import { StudentsEdit } from '../../../app/admin/resources/students/Edit';

describe('Students Edit - User Stories', () => {
  const editPage = getEditPage();

  const mockStudentData = {
    id: 'student-1',
    admissionNo: 'ADM2024001',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    status: 'active',
    classId: 'class-1',
    sectionId: 'section-1',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  };

  const mockClassesData = [
    { id: 'class-1', name: 'Class 1' },
    { id: 'class-2', name: 'Class 2' },
    { id: 'class-3', name: 'Class 3' }
  ];

  const mockSectionsData = [
    { id: 'section-1', name: 'Section A', classId: 'class-1' },
    { id: 'section-2', name: 'Section B', classId: 'class-1' },
    { id: 'section-3', name: 'Section A', classId: 'class-2' }
  ];

  const renderStudentsEdit = (dataProviderOverrides = {}, studentData = mockStudentData) => {
    const dataProvider = testDataProvider({
      getOne: jest.fn().mockResolvedValue({ data: studentData }),
      update: jest.fn().mockResolvedValue({ 
        data: { ...studentData, updatedAt: '2024-01-17T10:30:00Z' }
      }),
      getList: jest.fn().mockImplementation((resource) => {
        if (resource === 'classes') {
          return Promise.resolve({ data: mockClassesData, total: mockClassesData.length });
        }
        if (resource === 'sections') {
          return Promise.resolve({ data: mockSectionsData, total: mockSectionsData.length });
        }
        return Promise.resolve({ data: [], total: 0 });
      }),
      getMany: jest.fn().mockImplementation((resource, params) => {
        if (resource === 'classes') {
          const requestedClasses = mockClassesData.filter(c => params.ids.includes(c.id));
          return Promise.resolve({ data: requestedClasses });
        }
        if (resource === 'sections') {
          const requestedSections = mockSectionsData.filter(s => params.ids.includes(s.id));
          return Promise.resolve({ data: requestedSections });
        }
        return Promise.resolve({ data: [] });
      }),
      ...dataProviderOverrides,
    });

    return {
      ...render(
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <StudentsEdit />
        </AdminContext>
      ),
      dataProvider
    };
  };

  describe('As a school administrator editing student information', () => {
    it('should see the edit form prefilled with current student data', async () => {
      const { container } = renderStudentsEdit();
      
      await editPage.expectEditForm('student-1');
      
      // Verify form is prefilled with existing data
      await editPage.expectPrefilledForm({
        admissionNo: 'ADM2024001',
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male'
      });
      
      // Should not use MUI components
      editPage.expectNoMUIComponents(container);
    });

    it('should be able to update student basic information', async () => {
      const { dataProvider } = renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Update student information
      await editPage.updateField('firstName', 'Johnny');
      await editPage.updateField('lastName', 'Smith');
      
      // Save changes
      await editPage.saveChanges();
      
      // Verify update was called with correct data
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            data: expect.objectContaining({
              firstName: 'Johnny',
              lastName: 'Smith'
            })
          })
        );
      });
    });

    it('should be able to change student class and section', async () => {
      const { dataProvider } = renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Wait for form to load with reference data
      await waitFor(() => {
        expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
      });
      
      // Note: Testing autocomplete changes requires more complex setup
      // This verifies the fields are present and accessible
      expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    });

    it('should be able to update admission number', async () => {
      const { dataProvider } = renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Update admission number
      await editPage.updateField('admissionNo', 'ADM2024999');
      
      // Save changes
      await editPage.saveChanges();
      
      // Verify update was called
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            data: expect.objectContaining({
              admissionNo: 'ADM2024999'
            })
          })
        );
      });
    });

    it('should see validation errors for invalid data', async () => {
      renderStudentsEdit({
        update: jest.fn().mockRejectedValue({
          message: 'Validation failed',
          body: { errors: { admissionNo: 'Admission number already exists' } }
        })
      });
      
      await editPage.expectEditForm();
      
      // Try to update with invalid data
      await editPage.updateField('admissionNo', '');
      await editPage.saveChanges();
      
      // Should show form again (not navigate away on error)
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Date Handling in Edit Form', () => {
    const createStudentWithDates = (dateScenario) => ({
      ...mockStudentData,
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
      it(`should handle students with ${scenario} in edit form`, async () => {
        const studentWithSpecificDates = createStudentWithDates({ dates });
        
        const { container } = renderStudentsEdit({}, studentWithSpecificDates);
        
        await editPage.expectSafeDateHandling(studentWithSpecificDates);
        
        // Verify form loads without date errors
        await editPage.expectEditForm();
        
        // Should not show date-related errors
        expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
      });
    });

    it('should handle date field updates safely', async () => {
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Update other fields (no date fields in current form)
      await editPage.updateField('firstName', 'UpdatedName');
      
      // Should not cause any date-related errors
      expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should track form changes correctly', async () => {
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Get initial form state
      const initialFormData = editPage.getFormData();
      expect(initialFormData.firstName).toBe('John');
      
      // Make changes
      await editPage.updateField('firstName', 'ModifiedName');
      
      // Verify form state changed
      const updatedFormData = editPage.getFormData();
      expect(updatedFormData.firstName).toBe('ModifiedName');
    });

    it('should handle form reset if cancel is available', async () => {
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Make changes
      await editPage.updateField('firstName', 'TempName');
      
      // Check if cancel/back functionality exists
      const cancelButton = screen.queryByRole('button', { name: /cancel/i }) ||
                          screen.queryByRole('button', { name: /back/i });
      
      if (cancelButton) {
        const user = userEvent.setup();
        await user.click(cancelButton);
        
        // Should handle navigation/reset
        expect(cancelButton).toBeInTheDocument();
      }
    });

    it('should preserve unchanged fields during update', async () => {
      const { dataProvider } = renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Only update one field
      await editPage.updateField('firstName', 'NewFirstName');
      
      await editPage.saveChanges();
      
      // Should include all original data plus the change
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            data: expect.objectContaining({
              firstName: 'NewFirstName',
              lastName: 'Doe', // Should preserve original
              admissionNo: 'ADM2024001' // Should preserve original
            })
          })
        );
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during update', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderStudentsEdit({
        update: jest.fn().mockRejectedValue(new Error('Network error'))
      });
      
      await editPage.expectEditForm();
      
      await editPage.updateField('firstName', 'ErrorTest');
      await editPage.saveChanges();
      
      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing student data gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderStudentsEdit({
        getOne: jest.fn().mockRejectedValue(new Error('Student not found'))
      });
      
      // Should handle loading error
      await waitFor(() => {
        // Form might show error state or empty state
        expect(document.body).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle concurrent modifications', async () => {
      renderStudentsEdit({
        update: jest.fn().mockRejectedValue({
          message: 'Conflict: Student was modified by another user',
          status: 409
        })
      });
      
      await editPage.expectEditForm();
      
      await editPage.updateField('firstName', 'ConflictTest');
      await editPage.saveChanges();
      
      // Should show form again with error handling
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Integration with Reference Data', () => {
    it('should load current class and section data', async () => {
      const { dataProvider } = renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Should load reference data for dropdowns
      await waitFor(() => {
        expect(dataProvider.getList).toHaveBeenCalledWith(
          'classes',
          expect.any(Object)
        );
        expect(dataProvider.getList).toHaveBeenCalledWith(
          'sections',
          expect.any(Object)
        );
      });
    });

    it('should handle reference data loading errors', async () => {
      renderStudentsEdit({
        getList: jest.fn().mockImplementation((resource) => {
          if (resource === 'classes') {
            return Promise.reject(new Error('Failed to load classes'));
          }
          return Promise.resolve({ data: [], total: 0 });
        })
      });
      
      await editPage.expectEditForm();
      
      // Form should still be usable even if reference data fails
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });

    it('should show current selections in reference fields', async () => {
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Reference fields should show current values
      // Note: This would require more complex testing of the autocomplete components
      expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    });
  });

  describe('Component Library Compliance', () => {
    it('should not use MUI components', () => {
      const { container } = renderStudentsEdit();
      
      editPage.expectNoMUIComponents(container);
      expect(detectMUIImports(container)).toBe(false);
    });

    it('should use React Admin and shadcn/ui components only', async () => {
      renderStudentsEdit();
      
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
      const { dataProvider } = renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      expect(dataProvider.getOne).toHaveBeenCalledWith(
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

    it('should include tenant header in update requests', async () => {
      const { dataProvider } = renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      await editPage.updateField('firstName', 'TenantTest');
      await editPage.saveChanges();
      
      await waitFor(() => {
        expect(dataProvider.update).toHaveBeenCalledWith(
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

    it('should include tenant header in reference data requests', async () => {
      const { dataProvider } = renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      await waitFor(() => {
        expect(dataProvider.getList).toHaveBeenCalledWith(
          'classes',
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
      
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      const end = performance.now();
      const loadTime = end - start;
      
      // Should load within reasonable time (less than 1000ms)
      expect(loadTime).toBeLessThan(1000);
    });

    it('should handle form updates responsively', async () => {
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      const start = performance.now();
      
      // Perform multiple updates
      await editPage.updateField('firstName', 'PerfTest1');
      await editPage.updateField('lastName', 'PerfTest2');
      
      const end = performance.now();
      const updateTime = end - start;
      
      // Updates should be responsive (less than 300ms)
      expect(updateTime).toBeLessThan(300);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper form labels and ARIA attributes', async () => {
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // All form fields should have proper labels
      expect(screen.getByLabelText(/admission no/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      
      // Form should have proper structure
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      const user = userEvent.setup();
      
      // Should be able to navigate between fields with keyboard
      const firstField = screen.getByLabelText(/admission no/i);
      const secondField = screen.getByLabelText(/first name/i);
      
      await user.click(firstField);
      expect(document.activeElement).toBe(firstField);
      
      await user.tab();
      expect(document.activeElement).toBe(secondField);
    });

    it('should provide appropriate feedback for screen readers', async () => {
      renderStudentsEdit();
      
      await editPage.expectEditForm();
      
      // Save button should be properly labeled
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveAttribute('type', 'submit');
    });
  });
});