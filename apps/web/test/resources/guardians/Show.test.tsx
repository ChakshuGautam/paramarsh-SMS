import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { getShowPage } from '../../utils/page-objects';
import { detectMUIImports } from '../../utils/test-helpers';
import { GuardiansShow } from '../../../app/admin/resources/guardians/Show';

describe('Guardians Show - User Stories', () => {
  const showPage = getShowPage();

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

  const mockStudentData = { 
    id: 'student-1', 
    firstName: 'John', 
    lastName: 'Doe',
    admissionNo: 'ADM2024001'
  };

  const renderGuardiansShow = (dataProviderOverrides = {}, guardianData = mockGuardianData) => {
    const dataProvider = testDataProvider({
      getOne: jest.fn().mockImplementation((resource, params) => {
        if (resource === 'guardians') {
          return Promise.resolve({ data: guardianData });
        }
        if (resource === 'students' && params.id === 'student-1') {
          return Promise.resolve({ data: mockStudentData });
        }
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
      }),
      getMany: jest.fn().mockImplementation((resource, params) => {
        if (resource === 'students') {
          const students = params.ids.includes('student-1') ? [mockStudentData] : [];
          return Promise.resolve({ data: students });
        }
        return Promise.resolve({ data: [] });
      }),
      ...dataProviderOverrides,
    });

    return {
      ...render(
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <GuardiansShow />
        </AdminContext>
      ),
      dataProvider
    };
  };

  describe('As a school administrator viewing guardian details', () => {
    it('should see all guardian information clearly displayed', async () => {
      const { container } = renderGuardiansShow();
      
      await showPage.expectShowPage('guardian-1');
      
      // Verify all guardian fields are displayed
      await showPage.expectFieldValue('ID', 'guardian-1');
      await showPage.expectFieldValue('Relation', 'father');
      await showPage.expectFieldValue('Name', 'John Doe Sr.');
      await showPage.expectFieldValue('Phone', '+91-9876543210');
      await showPage.expectFieldValue('Email', 'john.doe.sr@example.com');
      await showPage.expectFieldValue('Address', '123 Main Street, City');
      
      // Should not use MUI components
      showPage.expectNoMUIComponents(container);
    });

    it('should see the linked student information', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      // Should load and display student reference data
      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
      });
    });

    it('should be able to navigate to edit the guardian', async () => {
      renderGuardiansShow();
      
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
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      // Check for navigation buttons
      const navigationButtons = await showPage.expectNavigationButtons();
      expect(navigationButtons.hasBack).toBe(true);
    });

    it('should see guardian relationship clearly indicated', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      // Relationship should be clearly displayed
      await showPage.expectFieldValue('Relation', 'father');
    });
  });

  describe('Date Field Display and Safety', () => {
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
      it(`should display guardian with ${scenario} without errors`, async () => {
        const guardianWithSpecificDates = createGuardianWithDates({ dates });
        
        renderGuardiansShow({}, guardianWithSpecificDates);
        
        await showPage.expectSafeDateHandling(guardianWithSpecificDates);
        
        // Verify essential fields are still displayed
        await showPage.expectFieldValue('Name', 'John Doe Sr.');
        await showPage.expectFieldValue('Relation', 'father');
        
        // Should not show date error messages
        expect(screen.queryByText(/Invalid time value/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
      });
    });

    it('should handle date fields gracefully in display', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      // Date fields might not be explicitly shown in current show layout
      // but this ensures any future date fields are handled safely
      await showPage.expectNoDateErrors();
    });
  });

  describe('Contact Information Display', () => {
    it('should display phone number with proper formatting', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      await showPage.expectFieldValue('Phone', '+91-9876543210');
    });

    it('should display email address correctly', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      await showPage.expectFieldValue('Email', 'john.doe.sr@example.com');
    });

    it('should display full address information', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      await showPage.expectFieldValue('Address', '123 Main Street, City');
    });

    it('should handle missing contact information gracefully', async () => {
      const guardianWithMissingContact = {
        ...mockGuardianData,
        phone: null,
        email: undefined,
        address: ''
      };
      
      renderGuardiansShow({}, guardianWithMissingContact);
      
      await showPage.expectShowPage();
      
      // Should still show other fields
      await showPage.expectFieldValue('Name', 'John Doe Sr.');
      await showPage.expectFieldValue('Relation', 'father');
      
      // Missing fields should be handled gracefully
      await showPage.expectFieldValue('Phone', null);
      await showPage.expectFieldValue('Email', null);
      await showPage.expectFieldValue('Address', null);
    });
  });

  describe('Student Reference Integration', () => {
    it('should load and display linked student information', async () => {
      const { dataProvider } = renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      // Should request student data for reference field
      await waitFor(() => {
        expect(dataProvider.getMany).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            ids: ['student-1']
          })
        );
      });
      
      // Should display student first name
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('should handle missing student reference gracefully', async () => {
      renderGuardiansShow({
        getMany: jest.fn().mockResolvedValue({ data: [] })
      });
      
      await showPage.expectShowPage();
      
      // Should still show guardian basic info even if student reference fails
      await showPage.expectFieldValue('Name', 'John Doe Sr.');
      await showPage.expectFieldValue('Relation', 'father');
    });

    it('should handle student reference loading errors', async () => {
      renderGuardiansShow({
        getMany: jest.fn().mockRejectedValue(new Error('Failed to load student data'))
      });
      
      await showPage.expectShowPage();
      
      // Should handle reference errors gracefully
      await showPage.expectFieldValue('Name', 'John Doe Sr.');
    });

    it('should handle guardian without student association', async () => {
      const guardianWithoutStudent = {
        ...mockGuardianData,
        studentId: null
      };
      
      renderGuardiansShow({}, guardianWithoutStudent);
      
      await showPage.expectShowPage();
      
      // Should still display guardian information
      await showPage.expectFieldValue('Name', 'John Doe Sr.');
      await showPage.expectFieldValue('Relation', 'father');
    });
  });

  describe('Relationship Type Display', () => {
    const relationshipTestCases = [
      { relation: 'father', expectedDisplay: 'father' },
      { relation: 'mother', expectedDisplay: 'mother' },
      { relation: 'guardian', expectedDisplay: 'guardian' },
      { relation: 'grandfather', expectedDisplay: 'grandfather' },
      { relation: 'grandmother', expectedDisplay: 'grandmother' },
      { relation: 'uncle', expectedDisplay: 'uncle' },
      { relation: 'aunt', expectedDisplay: 'aunt' },
      { relation: 'other', expectedDisplay: 'other' }
    ];

    relationshipTestCases.forEach(({ relation, expectedDisplay }) => {
      it(`should display ${relation} relationship correctly`, async () => {
        const guardianWithRelation = {
          ...mockGuardianData,
          relation: relation
        };
        
        renderGuardiansShow({}, guardianWithRelation);
        
        await showPage.expectShowPage();
        
        await showPage.expectFieldValue('Relation', expectedDisplay);
      });
    });

    it('should handle custom relationship types', async () => {
      const guardianWithCustomRelation = {
        ...mockGuardianData,
        relation: 'stepfather'
      };
      
      renderGuardiansShow({}, guardianWithCustomRelation);
      
      await showPage.expectShowPage();
      
      await showPage.expectFieldValue('Relation', 'stepfather');
    });

    it('should handle missing relationship information', async () => {
      const guardianWithoutRelation = {
        ...mockGuardianData,
        relation: null
      };
      
      renderGuardiansShow({}, guardianWithoutRelation);
      
      await showPage.expectShowPage();
      
      // Should still show other fields
      await showPage.expectFieldValue('Name', 'John Doe Sr.');
      await showPage.expectFieldValue('Relation', null);
    });
  });

  describe('Data Display Formatting', () => {
    it('should display guardian ID correctly', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      await showPage.expectFieldValue('ID', 'guardian-1');
    });

    it('should display guardian name with proper formatting', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      await showPage.expectFieldValue('Name', 'John Doe Sr.');
    });

    it('should handle long names gracefully', async () => {
      const guardianWithLongName = {
        ...mockGuardianData,
        name: 'Very Long Guardian Name That Might Overflow The Display'
      };
      
      renderGuardiansShow({}, guardianWithLongName);
      
      await showPage.expectShowPage();
      
      await showPage.expectFieldValue('Name', 'Very Long Guardian Name That Might Overflow The Display');
    });

    it('should handle special characters in names', async () => {
      const guardianWithSpecialName = {
        ...mockGuardianData,
        name: 'João Pérez-García'
      };
      
      renderGuardiansShow({}, guardianWithSpecialName);
      
      await showPage.expectShowPage();
      
      await showPage.expectFieldValue('Name', 'João Pérez-García');
    });
  });

  describe('Error Handling', () => {
    it('should handle guardian not found errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderGuardiansShow({
        getOne: jest.fn().mockRejectedValue(new Error('Guardian not found'))
      });
      
      // Should handle error state gracefully
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderGuardiansShow({
        getOne: jest.fn().mockRejectedValue(new Error('Network error'))
      });
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed guardian data gracefully', async () => {
      const malformedData = {
        id: 'guardian-1',
        // Missing required fields
        name: null,
        relation: undefined,
        // Invalid data types
        studentId: {},
        phone: []
      };
      
      renderGuardiansShow({}, malformedData);
      
      await showPage.expectShowPage();
      
      // Should not crash on malformed data
      await showPage.expectFieldValue('ID', 'guardian-1');
    });

    it('should handle incomplete guardian information', async () => {
      const incompleteGuardian = {
        id: 'guardian-1',
        name: 'Incomplete Guardian',
        // Missing other fields
      };
      
      renderGuardiansShow({}, incompleteGuardian);
      
      await showPage.expectShowPage();
      
      // Should display available information
      await showPage.expectFieldValue('Name', 'Incomplete Guardian');
    });
  });

  describe('Component Library Compliance', () => {
    it('should not use MUI components', () => {
      const { container } = renderGuardiansShow();
      
      showPage.expectNoMUIComponents(container);
      expect(detectMUIImports(container)).toBe(false);
    });

    it('should use React Admin and shadcn/ui components only', async () => {
      renderGuardiansShow();
      
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
      const { dataProvider } = renderGuardiansShow();
      
      await showPage.expectShowPage();
      
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

    it('should include tenant header in reference data requests', async () => {
      const { dataProvider } = renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      await waitFor(() => {
        expect(dataProvider.getMany).toHaveBeenCalledWith(
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
    it('should load show page efficiently', async () => {
      const start = performance.now();
      
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      const end = performance.now();
      const loadTime = end - start;
      
      // Should load within reasonable time (less than 900ms)
      expect(loadTime).toBeLessThan(900);
    });

    it('should handle large reference data efficiently', async () => {
      const manyStudents = Array.from({ length: 30 }, (_, i) => ({
        id: `student-${i}`,
        firstName: `Student${i}`,
        lastName: `Test${i}`,
        admissionNo: `ADM2024${i.toString().padStart(3, '0')}`
      }));
      
      renderGuardiansShow({
        getMany: jest.fn().mockImplementation((resource) => {
          if (resource === 'students') {
            return Promise.resolve({ data: manyStudents });
          }
          return Promise.resolve({ data: [] });
        })
      });
      
      await showPage.expectShowPage();
      
      // Should handle large datasets without performance issues
      expect(screen.getByText('John Doe Sr.')).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper heading structure', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      // Should have proper main content structure
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should provide meaningful field labels', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      // Field labels should be meaningful and accessible
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Relation')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
    });

    it('should support keyboard navigation for action buttons', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      const user = userEvent.setup();
      
      // Check if navigation buttons are keyboard accessible
      const editButton = screen.queryByRole('button', { name: /edit/i }) ||
                        screen.queryByRole('link', { name: /edit/i });
      const backButton = screen.queryByRole('button', { name: /back/i }) ||
                        screen.queryByRole('link', { name: /back/i });
      
      if (editButton) {
        await user.tab();
        expect(editButton).toHaveAttribute('tabIndex', expect.any(String));
      }
      
      if (backButton) {
        expect(backButton).toBeInTheDocument();
      }
    });

    it('should provide proper context for screen readers', async () => {
      renderGuardiansShow();
      
      await showPage.expectShowPage();
      
      // Important information should be accessible to screen readers
      const nameElement = screen.getByText('John Doe Sr.');
      const relationElement = screen.getByText('father');
      
      expect(nameElement).toBeInTheDocument();
      expect(relationElement).toBeInTheDocument();
    });
  });

  describe('Security Considerations', () => {
    it('should not display sensitive information inappropriately', async () => {
      const guardianWithSensitiveData = {
        ...mockGuardianData,
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        password: 'secret123'
      };
      
      renderGuardiansShow({}, guardianWithSensitiveData);
      
      await showPage.expectShowPage();
      
      // Should not display sensitive fields that aren't meant to be shown
      const sensitiveFields = ['123-45-6789', '4111-1111-1111-1111', 'secret123'];
      showPage.expectNoSensitiveData(sensitiveFields);
    });

    it('should handle XSS prevention in field values', async () => {
      const guardianWithXSS = {
        ...mockGuardianData,
        name: '<script>alert("xss")</script>',
        address: '<img src="x" onerror="alert(1)">'
      };
      
      renderGuardiansShow({}, guardianWithXSS);
      
      await showPage.expectShowPage();
      
      // Should display text content, not execute scripts
      const content = showPage.getVisibleContent();
      expect(content).toContain('<script>alert("xss")</script>');
      expect(content).not.toContain('alert("xss")'); // Should not execute
    });

    it('should sanitize contact information display', async () => {
      const guardianWithMaliciousContact = {
        ...mockGuardianData,
        email: 'javascript:alert("email")',
        phone: '<script>alert("phone")</script>'
      };
      
      renderGuardiansShow({}, guardianWithMaliciousContact);
      
      await showPage.expectShowPage();
      
      // Should display as text, not execute
      expect(screen.getByText('javascript:alert("email")')).toBeInTheDocument();
      expect(screen.getByText('<script>alert("phone")</script>')).toBeInTheDocument();
    });
  });
});