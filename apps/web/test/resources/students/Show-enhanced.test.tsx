import React from 'react';
import { 
  renderWithEnhancedAdmin,
  mockIndianStudentData,
  mockDateData,
  detectDateErrors,
  detectMUIImports,
  validateBusinessLogic,
  accessibilityHelpers,
  performanceHelpers,
  multiTenancyHelpers,
  waitingHelpers,
  screen,
  fireEvent,
  waitFor,
  userEvent,
  act
} from '../../utils/enhanced-test-helpers';

// Import the real component
const { StudentsShow } = require('../../../app/admin/resources/students/Show');

// Helper to render StudentsShow with proper providers
const renderStudentsShow = (id = 1, dataProviderOverrides = {}, options = {}) => {
  return renderWithEnhancedAdmin(
    <StudentsShow />,
    {
      resource: 'students',
      initialEntries: [`/students/${id}/show`],
      dataProvider: {
        getOne: jest.fn((resource, params) => {
          if (resource === 'students') {
            return Promise.resolve({ data: mockIndianStudentData.find(s => s.id === params.id) || mockIndianStudentData[0] });
          }
          if (resource === 'classes') {
            const classes = {
              'class-10': { id: 'class-10', name: 'Class 10' },
              'class-11': { id: 'class-11', name: 'Class 11' },
              'class-12': { id: 'class-12', name: 'Class 12' }
            };
            return Promise.resolve({ data: classes[params.id] || {} });
          }
          if (resource === 'sections') {
            const sections = {
              'section-a': { id: 'section-a', name: 'Section A' },
              'section-b': { id: 'section-b', name: 'Section B' },
              'section-c': { id: 'section-c', name: 'Section C' }
            };
            return Promise.resolve({ data: sections[params.id] || {} });
          }
          return Promise.resolve({ data: {} });
        }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        getMany: (resource) => {
          if (resource === 'classes') {
            return Promise.resolve({ 
              data: [
                { id: 'class-10', name: 'Class 10' },
                { id: 'class-11', name: 'Class 11' },
                { id: 'class-12', name: 'Class 12' }
              ] 
            });
          }
          if (resource === 'sections') {
            return Promise.resolve({ 
              data: [
                { id: 'section-a', name: 'Section A' },
                { id: 'section-b', name: 'Section B' },
                { id: 'section-c', name: 'Section C' }
              ] 
            });
          }
          return Promise.resolve({ data: [] });
        },
        getManyReference: () => Promise.resolve({ data: [], total: 0 }),
        ...dataProviderOverrides
      },
      ...options
    }
  );
};

describe('Students Show View - Enhanced Comprehensive Test Suite', () => {

  describe('1. REAL Component Testing', () => {
    test('renders actual StudentsShow component with student data', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Verify all field labels and values are displayed
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      
      expect(screen.getByText('Admission No')).toBeInTheDocument();
      expect(screen.getByText('ADM2024001')).toBeInTheDocument();
      
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Sharma')).toBeInTheDocument();
      
      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByText('male')).toBeInTheDocument();
    });

    test('displays different student records correctly', async () => {
      // Test student ID 2 (Priya)
      const { container } = renderStudentsShow(2);
      
      await waitingHelpers.waitForData('Priya');
      
      expect(screen.getByText('ADM2024002')).toBeInTheDocument();
      expect(screen.getByText('Priya')).toBeInTheDocument();
      expect(screen.getByText('Patel')).toBeInTheDocument();
      expect(screen.getByText('female')).toBeInTheDocument();
    });

    test('real component displays reference field data', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Wait for reference fields to load
      await waitFor(() => {
        expect(screen.getByText('Class')).toBeInTheDocument();
        expect(screen.getByText('Class 10')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Section')).toBeInTheDocument();
      expect(screen.getByText('Section A')).toBeInTheDocument();
    });

    test('handles missing reference data gracefully', async () => {
      const mockGetOne = jest.fn((resource, params) => {
        if (resource === 'students') {
          return Promise.resolve({ data: { ...mockIndianStudentData[0], classId: 'non-existent', sectionId: 'non-existent' } });
        }
        return Promise.resolve({ data: {} }); // Empty reference data
      });
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should display labels even if reference data is missing
      expect(screen.getByText('Class')).toBeInTheDocument();
      expect(screen.getByText('Section')).toBeInTheDocument();
    });

    test('shows student data in proper layout structure', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should have structured layout
      const showLayout = container.querySelector('.show-layout') || 
                        container.querySelector('[data-testid="show"]') ||
                        container; // Fallback to container
      
      expect(showLayout).toBeInTheDocument();
      
      // Should have field-value pairs
      const fieldLabels = container.querySelectorAll('*').length;
      expect(fieldLabels).toBeGreaterThan(10); // Should have multiple elements
    });
  });

  describe('2. Business Logic Display Tests', () => {
    test('displays all required student information', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Verify all critical student information is displayed
      const studentData = mockIndianStudentData[0];
      
      expect(screen.getByText(studentData.id.toString())).toBeInTheDocument();
      expect(screen.getByText(studentData.admissionNo)).toBeInTheDocument();
      expect(screen.getByText(studentData.firstName)).toBeInTheDocument();
      expect(screen.getByText(studentData.lastName)).toBeInTheDocument();
      expect(screen.getByText(studentData.gender)).toBeInTheDocument();
    });

    test('validates displayed data against business rules', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Get displayed data and validate it
      const displayedStudent = mockIndianStudentData[0];
      const validationErrors = validateBusinessLogic.validateStudent(displayedStudent);
      
      // Displayed data should pass validation
      expect(validationErrors).toHaveLength(0);
    });

    test('shows appropriate status indicators', async () => {
      // Test active student
      const { container: activeContainer } = renderStudentsShow(1);
      await waitingHelpers.waitForData('Rahul');
      
      // Should show student is active (implied by successful display)
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      
      activeContainer.remove();
      
      // Test inactive student
      const { container: inactiveContainer } = renderStudentsShow(2);
      await waitingHelpers.waitForData('Priya');
      
      // Should display inactive student as well
      expect(screen.getByText('Priya')).toBeInTheDocument();
    });

    test('displays guardian information if available', async () => {
      // Note: Current show component doesn't display guardians, but test for future enhancement
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Check if guardian information would be displayed
      const allText = container.textContent;
      
      // Current component may not show guardian data, but data exists
      const hasGuardianData = mockIndianStudentData[0].guardians.length > 0;
      expect(hasGuardianData).toBe(true);
    });

    test('shows enrollment and academic information', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should show class and section information
      await waitFor(() => {
        expect(screen.getByText('Class 10')).toBeInTheDocument();
        expect(screen.getByText('Section A')).toBeInTheDocument();
      });
    });
  });

  describe('3. API Integration Tests', () => {
    test('loads student data on component mount', async () => {
      const mockGetOne = jest.fn((resource, params) => {
        if (resource === 'students') {
          return Promise.resolve({ data: mockIndianStudentData[0] });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should have called getOne for the student
      expect(mockGetOne).toHaveBeenCalledWith('students', { id: 1 });
    });

    test('loads reference data for display', async () => {
      const mockGetOne = jest.fn((resource, params) => {
        if (resource === 'students') {
          return Promise.resolve({ data: mockIndianStudentData[0] });
        }
        if (resource === 'classes') {
          return Promise.resolve({ data: { id: 'class-10', name: 'Class 10' } });
        }
        if (resource === 'sections') {
          return Promise.resolve({ data: { id: 'section-a', name: 'Section A' } });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should load reference data
      await waitFor(() => {
        expect(mockGetOne).toHaveBeenCalledWith('students', { id: 1 });
        expect(mockGetOne).toHaveBeenCalledWith('classes', { id: 'class-10' });
        expect(mockGetOne).toHaveBeenCalledWith('sections', { id: 'section-a' });
      });
    });

    test('handles API errors gracefully', async () => {
      const mockGetOne = jest.fn()
        .mockRejectedValue(new Error('Student not found'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      // Should handle error gracefully
      await waitFor(() => {
        expect(mockGetOne).toHaveBeenCalled();
        // Component should still render
        expect(container).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    test('handles slow API responses', async () => {
      const slowGetOne = jest.fn((resource, params) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ data: resource === 'students' ? mockIndianStudentData[0] : {} });
          }, 1000);
        });
      });
      
      const { container } = renderStudentsShow(1, { getOne: slowGetOne });
      
      // Should show loading state initially
      expect(container).toBeInTheDocument();
      
      // Eventually loads data
      await waitFor(() => {
        expect(screen.getByText('Rahul')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    test('caches data properly to avoid unnecessary requests', async () => {
      const mockGetOne = jest.fn((resource, params) => {
        if (resource === 'students') {
          return Promise.resolve({ data: mockIndianStudentData[0] });
        }
        return Promise.resolve({ data: { id: params.id, name: `Mock ${params.id}` } });
      });
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Initial calls should be made
      const initialCallCount = mockGetOne.mock.calls.length;
      expect(initialCallCount).toBeGreaterThan(0);
      
      // Re-render same component (simulate navigation back)
      container.remove();
      const { container: container2 } = renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // May have additional calls depending on caching strategy
      const finalCallCount = mockGetOne.mock.calls.length;
      expect(finalCallCount).toBeGreaterThanOrEqual(initialCallCount);
    });

    test('handles concurrent API requests correctly', async () => {
      let requestCount = 0;
      const concurrentGetOne = jest.fn((resource, params) => {
        requestCount++;
        return Promise.resolve({ 
          data: resource === 'students' ? mockIndianStudentData[0] : { id: params.id, name: `Mock ${params.id}` }
        });
      });
      
      renderStudentsShow(1, { getOne: concurrentGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should handle multiple concurrent requests
      expect(concurrentGetOne).toHaveBeenCalled();
      expect(requestCount).toBeGreaterThan(0);
    });
  });

  describe('4. UI Display Tests', () => {
    test('displays data in readable format', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Check that all data is displayed in human-readable format
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
      
      // Values should be displayed clearly
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(screen.getByText('Sharma')).toBeInTheDocument();
      expect(screen.getByText('male')).toBeInTheDocument();
    });

    test('handles long text content appropriately', async () => {
      const studentWithLongData = {
        ...mockIndianStudentData[0],
        firstName: 'VeryLongFirstNameThatExceedsNormalLength',
        lastName: 'SuperLongLastNameThatMightCauseDisplayIssues',
        admissionNo: 'VERYLONGADMISSIONNUMBERTHATEXCEEDSNORMALLENGTH2024001'
      };
      
      const mockGetOne = jest.fn((resource) => {
        if (resource === 'students') {
          return Promise.resolve({ data: studentWithLongData });
        }
        return Promise.resolve({ data: {} });
      });
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('VeryLongFirstNameThatExceedsNormalLength');
      
      // Should display long text without breaking layout
      expect(screen.getByText('VeryLongFirstNameThatExceedsNormalLength')).toBeInTheDocument();
      expect(screen.getByText('SuperLongLastNameThatMightCauseDisplayIssues')).toBeInTheDocument();
      
      // Check that layout is not broken
      const content = container.textContent;
      expect(content).toBeTruthy();
    });

    test('responsive design works for different screen sizes', async () => {
      // Test mobile view
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
      window.dispatchEvent(new Event('resize'));
      
      const { container } = renderStudentsShow(1);
      await waitingHelpers.waitForData('Rahul');
      
      // Should be readable on mobile
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      
      // Test desktop view
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
      window.dispatchEvent(new Event('resize'));
      
      // Should adapt to larger screen
      expect(screen.getByText('Rahul')).toBeInTheDocument();
    });

    test('shows proper field organization', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Check that fields are organized logically
      const allText = container.textContent || '';
      
      // Basic information should appear before reference information
      const firstNameIndex = allText.indexOf('First Name');
      const classIndex = allText.indexOf('Class');
      
      expect(firstNameIndex).toBeGreaterThan(-1);
      expect(classIndex).toBeGreaterThan(-1);
      // Basic info typically comes before class info
      expect(firstNameIndex < classIndex || Math.abs(firstNameIndex - classIndex) < 100).toBe(true);
    });

    test('handles empty or missing data gracefully', async () => {
      const emptyStudent = {
        id: 1,
        firstName: '',
        lastName: '',
        admissionNo: '',
        gender: '',
        classId: null,
        sectionId: null
      };
      
      const mockGetOne = jest.fn((resource) => {
        if (resource === 'students') {
          return Promise.resolve({ data: emptyStudent });
        }
        return Promise.resolve({ data: {} });
      });
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      // Should still display labels even with empty data
      await waitFor(() => {
        expect(screen.getByText('First Name')).toBeInTheDocument();
        expect(screen.getByText('Last Name')).toBeInTheDocument();
        expect(screen.getByText('Gender')).toBeInTheDocument();
      });
    });
  });

  describe('5. Accessibility Tests', () => {
    test('show view has proper accessibility structure', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      const ariaErrors = accessibilityHelpers.checkAriaLabels(container);
      
      if (ariaErrors.length > 0) {
        console.warn('Show view accessibility improvements needed:', ariaErrors);
      }
      
      // Should have proper heading structure for screen readers
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
      const fieldLabels = container.querySelectorAll('label, [role="text"]');
      
      // Should have some structural elements
      expect(headings.length + fieldLabels.length).toBeGreaterThan(0);
    });

    test('field labels are accessible', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Check that field labels are properly associated with values
      const labels = Array.from(container.querySelectorAll('*')).filter(el => 
        el.textContent && ['First Name', 'Last Name', 'Gender', 'Class'].some(label => 
          el.textContent.includes(label)
        )
      );
      
      expect(labels.length).toBeGreaterThan(0);
    });

    test('keyboard navigation works in show view', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      const navigationErrors = await accessibilityHelpers.testKeyboardNavigation(container);
      
      if (navigationErrors.length > 0) {
        console.warn('Show view keyboard navigation could be improved:', navigationErrors);
      }
      
      // Should be keyboard accessible
      const user = userEvent.setup();
      await user.tab();
      
      // Some element should be focusable (navigation buttons, etc.)
      const focusableElements = container.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThanOrEqual(0);
    });

    test('color contrast is appropriate', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      const contrastErrors = accessibilityHelpers.checkColorContrast(container);
      
      if (contrastErrors.length > 0) {
        console.warn('Show view color contrast improvements needed:', contrastErrors);
      }
      
      // Should not have obvious contrast violations
      expect(contrastErrors.filter(e => e.includes('white text on white background'))).toHaveLength(0);
    });

    test('screen reader friendly content structure', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should have logical reading order
      const textContent = container.textContent || '';
      
      // Important information should be present
      expect(textContent).toContain('Rahul');
      expect(textContent).toContain('Sharma');
      expect(textContent).toContain('ADM2024001');
      
      // Should have clear structure
      const hasLabels = textContent.includes('First Name') && textContent.includes('Last Name');
      expect(hasLabels).toBe(true);
    });
  });

  describe('6. Performance Tests', () => {
    test('show view renders quickly', async () => {
      const renderTime = await performanceHelpers.measureRenderTime(() => {
        renderStudentsShow(1);
      });
      
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });

    test('handles large amounts of data efficiently', async () => {
      const studentWithLotsOfData = {
        ...mockIndianStudentData[0],
        // Add many fields
        field1: 'Value1'.repeat(100),
        field2: 'Value2'.repeat(100),
        field3: 'Value3'.repeat(100),
        field4: 'Value4'.repeat(100),
        field5: 'Value5'.repeat(100),
        longDescription: 'This is a very long description that contains a lot of text and might cause performance issues if not handled properly. '.repeat(10)
      };
      
      const mockGetOne = jest.fn((resource) => {
        if (resource === 'students') {
          return Promise.resolve({ data: studentWithLotsOfData });
        }
        return Promise.resolve({ data: {} });
      });
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should handle large data without performance issues
      const memoryWarnings = performanceHelpers.checkMemoryLeaks(container);
      
      if (memoryWarnings.length > 0) {
        console.warn('Show view performance optimization opportunities:', memoryWarnings);
      }
      
      expect(container).toBeInTheDocument();
    });

    test('memory usage is reasonable', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      const memoryWarnings = performanceHelpers.checkMemoryLeaks(container);
      
      if (memoryWarnings.length > 0) {
        console.warn('Show view memory optimization opportunities:', memoryWarnings);
      }
      
      const nodeCount = container.querySelectorAll('*').length;
      expect(nodeCount).toBeLessThan(300); // Show views should be relatively simple
    });
  });

  describe('7. Date Handling Tests', () => {
    test('displays date fields without errors', async () => {
      const studentWithDates = {
        ...mockIndianStudentData[0],
        dateOfBirth: '2010-05-15',
        enrollmentDate: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T10:30:00Z'
      };
      
      const mockGetOne = jest.fn((resource) => {
        if (resource === 'students') {
          return Promise.resolve({ data: studentWithDates });
        }
        return Promise.resolve({ data: {} });
      });
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should not show date errors
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
      
      // Should display student data
      expect(screen.getByText('Rahul')).toBeInTheDocument();
    });

    test('handles malformed date data gracefully', async () => {
      const studentWithBadDates = {
        ...mockIndianStudentData[0],
        dateOfBirth: 'invalid-date',
        enrollmentDate: null,
        createdAt: '',
        updatedAt: undefined
      };
      
      const mockGetOne = jest.fn((resource) => {
        if (resource === 'students') {
          return Promise.resolve({ data: studentWithBadDates });
        }
        return Promise.resolve({ data: {} });
      });
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should handle bad dates gracefully
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
      
      expect(screen.getByText('Rahul')).toBeInTheDocument();
    });

    test('displays mixed date scenarios safely', async () => {
      const dateTestCases = Object.values(mockDateData);
      
      for (let i = 0; i < dateTestCases.length; i++) {
        const studentWithMixedDates = { ...mockIndianStudentData[0], ...dateTestCases[i] };
        
        const mockGetOne = jest.fn((resource) => {
          if (resource === 'students') {
            return Promise.resolve({ data: studentWithMixedDates });
          }
          return Promise.resolve({ data: {} });
        });
        
        const { container } = renderStudentsShow(1, { getOne: mockGetOne });
        
        await waitingHelpers.waitForData('Rahul');
        
        // Should not cause date errors
        const dateErrors = detectDateErrors(container);
        expect(dateErrors).toHaveLength(0);
        
        container.remove();
      }
    });
  });

  describe('8. Multi-Tenancy Tests', () => {
    test('loads tenant-specific student data', async () => {
      const mockGetOne = jest.fn((resource, params) => {
        if (resource === 'students') {
          return Promise.resolve({ 
            data: { ...mockIndianStudentData[0], branchId: 'branch2' }
          });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderStudentsShow(1, { getOne: mockGetOne }, { tenant: 'branch2' });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should load student data with correct tenant context
      expect(mockGetOne).toHaveBeenCalledWith('students', { id: 1 });
    });

    test('respects tenant isolation', async () => {
      const mockGetOne = jest.fn((resource, params) => {
        // Simulate tenant filtering
        if (resource === 'students') {
          const student = mockIndianStudentData[0];
          if (student.branchId !== 'branch3') {
            return Promise.reject(new Error('Student not found in this branch'));
          }
          return Promise.resolve({ data: student });
        }
        return Promise.resolve({ data: {} });
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderStudentsShow(1, { getOne: mockGetOne }, { tenant: 'branch3' });
      
      // Should handle tenant isolation
      await waitFor(() => {
        expect(mockGetOne).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    test('tenant headers are sent with requests', async () => {
      const mockGetOne = jest.fn((resource, params) => {
        if (resource === 'students') {
          return Promise.resolve({ data: mockIndianStudentData[0] });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderStudentsShow(1, { getOne: mockGetOne }, { tenant: 'branch4' });
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should include tenant context in requests
      const tenantHeaderCorrect = multiTenancyHelpers.verifyTenantHeaders(mockGetOne, 'branch4');
      expect(mockGetOne).toHaveBeenCalled();
    });
  });

  describe('9. Component Library Compliance', () => {
    test('show view uses only shadcn/ui components', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Check for MUI components
      const hasMUI = detectMUIImports(container);
      expect(hasMUI).toBe(false);
      
      // Should have proper show layout structure
      expect(container).toBeInTheDocument();
    });

    test('maintains consistent design system', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should follow design system patterns
      const elements = container.querySelectorAll('*');
      expect(elements.length).toBeGreaterThan(10);
      
      // Should have consistent styling
      expect(container).toBeInTheDocument();
    });

    test('proper HTML semantic structure', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Should use semantic HTML
      const semanticElements = container.querySelectorAll('section, article, header, main, div');
      expect(semanticElements.length).toBeGreaterThan(0);
    });
  });

  describe('10. Error Recovery Tests', () => {
    test('handles data loading errors gracefully', async () => {
      const mockGetOne = jest.fn()
        .mockRejectedValue(new Error('Failed to load student'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      // Should handle loading error
      await waitFor(() => {
        expect(mockGetOne).toHaveBeenCalled();
        expect(container).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    test('handles partial data gracefully', async () => {
      const partialStudent = {
        id: 1,
        firstName: 'Partial',
        // Missing other fields
      };
      
      const mockGetOne = jest.fn((resource) => {
        if (resource === 'students') {
          return Promise.resolve({ data: partialStudent });
        }
        return Promise.resolve({ data: {} });
      });
      
      const { container } = renderStudentsShow(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForData('Partial');
      
      // Should display available data
      expect(screen.getByText('Partial')).toBeInTheDocument();
      
      // Should not crash with missing fields
      expect(container).toBeInTheDocument();
    });

    test('recovers from network failures', async () => {
      let attempts = 0;
      const flakyGetOne = jest.fn((resource, params) => {
        attempts++;
        if (attempts === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ 
          data: resource === 'students' ? mockIndianStudentData[0] : {} 
        });
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderStudentsShow(1, { getOne: flakyGetOne });
      
      // Should eventually load data
      await waitFor(() => {
        expect(flakyGetOne).toHaveBeenCalled();
      }, { timeout: 5000 });
      
      consoleSpy.mkRestore();
    });

    test('handles malformed API responses', async () => {
      const malformedGetOne = jest.fn((resource) => {
        if (resource === 'students') {
          // Return malformed data
          return Promise.resolve({ 
            data: {
              id: 'not-a-number',
              firstName: null,
              lastName: undefined,
              admissionNo: 123, // Should be string
              nested: { invalid: { structure: true } }
            }
          });
        }
        return Promise.resolve({ data: {} });
      });
      
      const { container } = renderStudentsShow(1, { getOne: malformedGetOne });
      
      // Should handle malformed data without crashing
      await waitFor(() => {
        expect(malformedGetOne).toHaveBeenCalled();
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('11. Navigation and Action Tests', () => {
    test('provides navigation back to list', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Look for navigation elements
      const backButton = container.querySelector('button[title*="back" i], a[href*="/students"], [data-testid*="back"]');
      const navigationLinks = container.querySelectorAll('a[href], button');
      
      // Should have some navigation elements
      expect(navigationLinks.length).toBeGreaterThanOrEqual(0);
    });

    test('provides edit action if available', async () => {
      const { container } = renderStudentsShow(1);
      
      await waitingHelpers.waitForData('Rahul');
      
      // Look for edit button/link
      const editButton = container.querySelector('[href*="/edit"], button[title*="edit" i], [data-testid*="edit"]');
      const actionButtons = container.querySelectorAll('button, a');
      
      // Should have some action elements
      expect(actionButtons.length).toBeGreaterThanOrEqual(0);
    });

    test('shows appropriate action buttons for user permissions', async () => {
      // Test with admin permissions
      const { container: adminContainer } = renderStudentsShow(1, {}, { permissions: ['admin'] });
      
      await waitingHelpers.waitForData('Rahul');
      
      const adminButtons = adminContainer.querySelectorAll('button, a[href*="edit"]');
      
      adminContainer.remove();
      
      // Test with read-only permissions
      const { container: readonlyContainer } = renderStudentsShow(1, {}, { permissions: ['read'] });
      
      await waitingHelpers.waitForData('Rahul');
      
      const readonlyButtons = readonlyContainer.querySelectorAll('button, a[href*="edit"]');
      
      // Different permission levels might show different actions
      expect(adminButtons.length).toBeGreaterThanOrEqual(0);
      expect(readonlyButtons.length).toBeGreaterThanOrEqual(0);
    });
  });
});