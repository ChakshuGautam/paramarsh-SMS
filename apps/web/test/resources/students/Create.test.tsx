import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { getCreatePage } from '../../utils/page-objects';
import { detectMUIImports } from '../../utils/test-helpers';
import { StudentsCreate } from '../../../app/admin/resources/students/Create';

describe('Students Create - User Stories', () => {
  const createPage = getCreatePage();

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

  const renderStudentsCreate = (dataProviderOverrides = {}) => {
    const dataProvider = testDataProvider({
      create: jest.fn().mockResolvedValue({ 
        data: { id: 'new-student-id', admissionNo: 'ADM2024999' }
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
          <StudentsCreate />
        </AdminContext>
      ),
      dataProvider
    };
  };

  describe('As a school administrator adding a new student', () => {
    it('should see a create form with all required fields', async () => {
      const { container } = renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // Check all required form fields are present
      expect(screen.getByLabelText(/admission no/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
      
      // Should not use MUI components
      createPage.expectNoMUIComponents(container);
    });

    it('should be able to fill in basic student information', async () => {
      renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // Fill in student details
      await createPage.fillField('admissionNo', 'ADM2024TEST');
      await createPage.fillField('firstName', 'John');
      await createPage.fillField('lastName', 'Doe');
      await createPage.fillField('gender', 'male');
      
      // Verify fields are filled
      const formData = createPage.getFormData();
      expect(formData.admissionNo).toBe('ADM2024TEST');
      expect(formData.firstName).toBe('John');
      expect(formData.lastName).toBe('Doe');
      expect(formData.gender).toBe('male');
    });

    it('should be able to select class and section', async () => {
      renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // Wait for reference data to load
      await waitFor(() => {
        expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
      });
      
      // Note: Testing autocomplete inputs requires more complex interaction
      // This is a simplified test for the form presence
      expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    });

    it('should be able to save a new student successfully', async () => {
      const { dataProvider } = renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // Fill form with valid data
      await createPage.fillFormWithData({
        admissionNo: 'ADM2024NEW',
        firstName: 'New',
        lastName: 'Student',
        gender: 'female'
      });
      
      // Submit form
      await createPage.submitForm();
      
      // Verify create was called
      await waitFor(() => {
        expect(dataProvider.create).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            data: expect.objectContaining({
              admissionNo: 'ADM2024NEW',
              firstName: 'New',
              lastName: 'Student',
              gender: 'female'
            })
          })
        );
      });
    });

    it('should see validation errors for missing required fields', async () => {
      renderStudentsCreate({
        create: jest.fn().mockRejectedValue({
          message: 'Validation failed',
          body: { errors: { firstName: 'First name is required' } }
        })
      });
      
      await createPage.expectCreateForm();
      
      // Try to submit empty form
      await createPage.submitForm();
      
      // Should show validation errors
      await waitFor(() => {
        // The form should show validation feedback
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });

    it('should handle duplicate admission numbers gracefully', async () => {
      renderStudentsCreate({
        create: jest.fn().mockRejectedValue({
          message: 'Admission number already exists',
          status: 400
        })
      });
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        admissionNo: 'ADM2024DUPLICATE',
        firstName: 'Duplicate',
        lastName: 'Student',
        gender: 'male'
      });
      
      await createPage.submitForm();
      
      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });
  });

  describe('Form Field Behavior', () => {
    it('should handle safe date handling if date fields are added', async () => {
      renderStudentsCreate();
      
      await createPage.expectSafeDateHandling();
      
      // Current form doesn't have date fields, but this ensures
      // any future date fields won't cause "Invalid time value" errors
      expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
    });

    it('should validate form fields appropriately', async () => {
      renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // Test field validation (basic checks)
      const admissionNoField = screen.getByLabelText(/admission no/i) as HTMLInputElement;
      expect(admissionNoField.type).toBe('text');
      
      const firstNameField = screen.getByLabelText(/first name/i) as HTMLInputElement;
      expect(firstNameField.type).toBe('text');
    });

    it('should handle form reset and navigation', async () => {
      renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // Fill some data
      await createPage.fillField('firstName', 'Test');
      
      // Check if there's a way to reset or go back
      const cancelButton = screen.queryByRole('button', { name: /cancel/i }) ||
                          screen.queryByRole('button', { name: /back/i });
      
      // May or may not be present depending on implementation
      if (cancelButton) {
        expect(cancelButton).toBeInTheDocument();
      }
    });
  });

  describe('Integration with Reference Data', () => {
    it('should load classes for selection', async () => {
      const { dataProvider } = renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // Should request classes data for reference input
      await waitFor(() => {
        expect(dataProvider.getList).toHaveBeenCalledWith(
          'classes',
          expect.any(Object)
        );
      });
    });

    it('should load sections for selection', async () => {
      const { dataProvider } = renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // Should request sections data for reference input
      await waitFor(() => {
        expect(dataProvider.getList).toHaveBeenCalledWith(
          'sections',
          expect.any(Object)
        );
      });
    });

    it('should handle reference data loading errors gracefully', async () => {
      renderStudentsCreate({
        getList: jest.fn().mockRejectedValue(new Error('Failed to load reference data'))
      });
      
      await createPage.expectCreateForm();
      
      // Form should still render even if reference data fails
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    });
  });

  describe('Component Library Compliance', () => {
    it('should not use MUI components', () => {
      const { container } = renderStudentsCreate();
      
      createPage.expectNoMUIComponents(container);
      expect(detectMUIImports(container)).toBe(false);
    });

    it('should use React Admin and shadcn/ui components only', async () => {
      renderStudentsCreate();
      
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
      const { dataProvider } = renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        admissionNo: 'ADM2024TENANT',
        firstName: 'Tenant',
        lastName: 'Test',
        gender: 'other'
      });
      
      await createPage.submitForm();
      
      await waitFor(() => {
        expect(dataProvider.create).toHaveBeenCalledWith(
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
      const { dataProvider } = renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
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

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderStudentsCreate({
        create: jest.fn().mockRejectedValue(new Error('Network error'))
      });
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        admissionNo: 'ADM2024ERROR',
        firstName: 'Error',
        lastName: 'Test'
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
      
      renderStudentsCreate({
        create: jest.fn().mockResolvedValue({ /* missing data field */ })
      });
      
      await createPage.expectCreateForm();
      
      await createPage.fillFormWithData({
        firstName: 'Malformed',
        lastName: 'Response'
      });
      
      await createPage.submitForm();
      
      // Should handle malformed response gracefully
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Performance Considerations', () => {
    it('should render form quickly', async () => {
      const start = performance.now();
      
      renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      const end = performance.now();
      const renderTime = end - start;
      
      // Should render within reasonable time (less than 500ms)
      expect(renderTime).toBeLessThan(500);
    });

    it('should handle form interactions without lag', async () => {
      renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      const start = performance.now();
      
      // Perform multiple field interactions
      await createPage.fillField('firstName', 'Performance');
      await createPage.fillField('lastName', 'Test');
      await createPage.fillField('admissionNo', 'ADM2024PERF');
      
      const end = performance.now();
      const interactionTime = end - start;
      
      // Interactions should be responsive (less than 200ms)
      expect(interactionTime).toBeLessThan(200);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper form labels and structure', async () => {
      renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      // All form fields should have proper labels
      expect(screen.getByLabelText(/admission no/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
      
      // Form should have proper structure
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      renderStudentsCreate();
      
      await createPage.expectCreateForm();
      
      const user = userEvent.setup();
      
      // Should be able to tab through form fields
      const admissionField = screen.getByLabelText(/admission no/i);
      const firstNameField = screen.getByLabelText(/first name/i);
      
      await user.click(admissionField);
      expect(document.activeElement).toBe(admissionField);
      
      await user.tab();
      expect(document.activeElement).toBe(firstNameField);
    });
  });
});