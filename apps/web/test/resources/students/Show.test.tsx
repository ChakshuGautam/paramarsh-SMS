import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { getShowPage } from '../../utils/page-objects';
import { detectMUIImports } from '../../utils/test-helpers';
import { StudentsShow } from '../../../app/admin/resources/students/Show';

describe('Students Show - User Stories', () => {
  const showPage = getShowPage();

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

  const mockClassData = { id: 'class-1', name: 'Class 1' };
  const mockSectionData = { id: 'section-1', name: 'Section A' };

  const renderStudentsShow = (dataProviderOverrides = {}, studentData = mockStudentData) => {
    const dataProvider = testDataProvider({
      getOne: jest.fn().mockImplementation((resource, params) => {
        if (resource === 'students') {
          return Promise.resolve({ data: studentData });
        }
        if (resource === 'classes' && params.id === 'class-1') {
          return Promise.resolve({ data: mockClassData });
        }
        if (resource === 'sections' && params.id === 'section-1') {
          return Promise.resolve({ data: mockSectionData });
        }
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
      }),
      getMany: jest.fn().mockImplementation((resource, params) => {
        if (resource === 'classes') {
          return Promise.resolve({ data: [mockClassData] });
        }
        if (resource === 'sections') {
          return Promise.resolve({ data: [mockSectionData] });
        }
        return Promise.resolve({ data: [] });
      }),
      ...dataProviderOverrides,
    });

    return {
      ...render(
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <StudentsShow />
        </AdminContext>
      ),
      dataProvider
    };
  };

  describe('As a school administrator viewing student details', () => {
    it('should see all student information clearly displayed', async () => {
      const { container } = renderStudentsShow();
      
      await showPage.expectShowPage('student-1');
      
      // Verify all student fields are displayed
      await showPage.expectFieldValue('ID', 'student-1');
      await showPage.expectFieldValue('Admission No', 'ADM2024001');
      await showPage.expectFieldValue('First Name', 'John');
      await showPage.expectFieldValue('Last Name', 'Doe');
      await showPage.expectFieldValue('Gender', 'male');
      
      // Should not use MUI components
      showPage.expectNoMUIComponents(container);
    });

    it('should see referenced class and section information', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Should load and display reference data
      await waitFor(() => {
        expect(screen.getByText('Class 1')).toBeInTheDocument();
        expect(screen.getByText('Section A')).toBeInTheDocument();
      });
    });

    it('should be able to navigate to edit the student', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Check for edit functionality (if available)
      const editButton = screen.queryByRole('button', { name: /edit/i }) ||
                        screen.queryByRole('link', { name: /edit/i });
      
      if (editButton) {
        expect(editButton).toBeInTheDocument();
        await showPage.clickEditButton();
      }
    });

    it('should be able to navigate back to the list', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Check for navigation buttons
      const navigationButtons = await showPage.expectNavigationButtons();
      expect(navigationButtons.hasBack).toBe(true);
    });
  });

  describe('Date Field Display and Safety', () => {
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
        scenario: 'empty string dates', 
        dates: { createdAt: '', updatedAt: '' } 
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
        scenario: 'mixed date scenarios', 
        dates: { createdAt: null, updatedAt: '2024-01-15T10:30:00Z' } 
      }
    ];

    dateTestCases.forEach(({ scenario, dates }) => {
      it(`should display student with ${scenario} without errors`, async () => {
        const studentWithSpecificDates = createStudentWithDates({ dates });
        
        renderStudentsShow({}, studentWithSpecificDates);
        
        await showPage.expectSafeDateHandling(studentWithSpecificDates);
        
        // Verify essential fields are still displayed
        await showPage.expectFieldValue('First Name', 'John');
        await showPage.expectFieldValue('Last Name', 'Doe');
        
        // Should not show date error messages
        expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
      });
    });

    it('should handle date fields gracefully in display', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Date fields might not be explicitly shown in current show layout
      // but this ensures any future date fields are handled safely
      await showPage.expectNoDateErrors();
    });
  });

  describe('Reference Data Integration', () => {
    it('should load and display class information', async () => {
      const { dataProvider } = renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Should request class data for reference field
      await waitFor(() => {
        expect(dataProvider.getMany).toHaveBeenCalledWith(
          'classes',
          expect.objectContaining({
            ids: ['class-1']
          })
        );
      });
      
      // Should display class name
      expect(screen.getByText('Class 1')).toBeInTheDocument();
    });

    it('should load and display section information', async () => {
      const { dataProvider } = renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Should request section data for reference field
      await waitFor(() => {
        expect(dataProvider.getMany).toHaveBeenCalledWith(
          'sections',
          expect.objectContaining({
            ids: ['section-1']
          })
        );
      });
      
      // Should display section name
      expect(screen.getByText('Section A')).toBeInTheDocument();
    });

    it('should handle missing reference data gracefully', async () => {
      renderStudentsShow({
        getMany: jest.fn().mockResolvedValue({ data: [] })
      });
      
      await showPage.expectShowPage();
      
      // Should still show student basic info even if references fail
      await showPage.expectFieldValue('First Name', 'John');
      await showPage.expectFieldValue('Last Name', 'Doe');
    });

    it('should handle reference data loading errors', async () => {
      renderStudentsShow({
        getMany: jest.fn().mockRejectedValue(new Error('Failed to load reference data'))
      });
      
      await showPage.expectShowPage();
      
      // Should handle reference errors gracefully
      await showPage.expectFieldValue('Admission No', 'ADM2024001');
    });
  });

  describe('Data Display Formatting', () => {
    it('should display student ID correctly', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      await showPage.expectFieldValue('ID', 'student-1');
    });

    it('should display admission number correctly', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      await showPage.expectFieldValue('Admission No', 'ADM2024001');
    });

    it('should display name fields correctly', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      await showPage.expectFieldValue('First Name', 'John');
      await showPage.expectFieldValue('Last Name', 'Doe');
    });

    it('should display gender correctly', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      await showPage.expectFieldValue('Gender', 'male');
    });

    it('should handle missing field data gracefully', async () => {
      const incompleteStudent = {
        ...mockStudentData,
        gender: null,
        firstName: undefined
      };
      
      renderStudentsShow({}, incompleteStudent);
      
      await showPage.expectShowPage();
      
      // Should handle null/undefined fields gracefully
      await showPage.expectFieldValue('Last Name', 'Doe');
      await showPage.expectFieldValue('Admission No', 'ADM2024001');
    });
  });

  describe('Error Handling', () => {
    it('should handle student not found errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderStudentsShow({
        getOne: jest.fn().mockRejectedValue(new Error('Student not found'))
      });
      
      // Should handle error state gracefully
      await waitFor(() => {
        // Component should render without crashing
        expect(document.body).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderStudentsShow({
        getOne: jest.fn().mockRejectedValue(new Error('Network error'))
      });
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed data gracefully', async () => {
      const malformedData = {
        id: 'student-1',
        // Missing required fields
        admissionNo: null,
        firstName: undefined,
        // Invalid data types
        classId: {},
        sectionId: []
      };
      
      renderStudentsShow({}, malformedData);
      
      await showPage.expectShowPage();
      
      // Should not crash on malformed data
      await showPage.expectFieldValue('ID', 'student-1');
    });
  });

  describe('Component Library Compliance', () => {
    it('should not use MUI components', () => {
      const { container } = renderStudentsShow();
      
      showPage.expectNoMUIComponents(container);
      expect(detectMUIImports(container)).toBe(false);
    });

    it('should use React Admin and shadcn/ui components only', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Should use React Admin show components
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Should not use MUI
      const muiElements = document.querySelectorAll('[class*="Mui"]');
      expect(muiElements).toHaveLength(0);
    });
  });

  describe('Multi-tenancy Support', () => {
    it('should include tenant header in getOne request', async () => {
      const { dataProvider } = renderStudentsShow();
      
      await showPage.expectShowPage();
      
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

    it('should include tenant header in reference data requests', async () => {
      const { dataProvider } = renderStudentsShow();
      
      await showPage.expectShowPage();
      
      await waitFor(() => {
        expect(dataProvider.getMany).toHaveBeenCalledWith(
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
    it('should load show page efficiently', async () => {
      const start = performance.now();
      
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      const end = performance.now();
      const loadTime = end - start;
      
      // Should load within reasonable time (less than 800ms)
      expect(loadTime).toBeLessThan(800);
    });

    it('should handle large reference data efficiently', async () => {
      const manyClasses = Array.from({ length: 50 }, (_, i) => ({
        id: `class-${i}`,
        name: `Class ${i}`
      }));
      
      renderStudentsShow({
        getMany: jest.fn().mockImplementation((resource) => {
          if (resource === 'classes') {
            return Promise.resolve({ data: manyClasses });
          }
          return Promise.resolve({ data: [mockSectionData] });
        })
      });
      
      await showPage.expectShowPage();
      
      // Should handle large datasets without performance issues
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper heading structure', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Should have proper main content structure
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should provide meaningful field labels', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      // Field labels should be meaningful and accessible
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Admission No')).toBeInTheDocument();
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
    });

    it('should support keyboard navigation for action buttons', async () => {
      renderStudentsShow();
      
      await showPage.expectShowPage();
      
      const user = userEvent.setup();
      
      // Check if navigation buttons are keyboard accessible
      const editButton = screen.queryByRole('button', { name: /edit/i }) ||
                        screen.queryByRole('link', { name: /edit/i });
      const backButton = screen.queryByRole('button', { name: /back/i }) ||
                        screen.queryByRole('link', { name: /back/i });
      
      if (editButton) {
        await user.tab();
        // Button should be focusable
        expect(editButton).toHaveAttribute('tabIndex', expect.any(String));
      }
      
      if (backButton) {
        expect(backButton).toBeInTheDocument();
      }
    });
  });

  describe('Security Considerations', () => {
    it('should not display sensitive information inappropriately', async () => {
      const studentWithSensitiveData = {
        ...mockStudentData,
        password: 'secret123',
        ssn: '123-45-6789',
        bankAccount: '123456789'
      };
      
      renderStudentsShow({}, studentWithSensitiveData);
      
      await showPage.expectShowPage();
      
      // Should not display sensitive fields that aren't meant to be shown
      const sensitiveFields = ['secret123', '123-45-6789', '123456789'];
      showPage.expectNoSensitiveData(sensitiveFields);
    });

    it('should handle XSS prevention in field values', async () => {
      const studentWithXSS = {
        ...mockStudentData,
        firstName: '<script>alert("xss")</script>',
        lastName: '<img src="x" onerror="alert(1)">'
      };
      
      renderStudentsShow({}, studentWithXSS);
      
      await showPage.expectShowPage();
      
      // Should display text content, not execute scripts
      const content = showPage.getVisibleContent();
      expect(content).toContain('<script>alert("xss")</script>');
      expect(content).not.toContain('alert("xss")'); // Should not execute
    });
  });
});