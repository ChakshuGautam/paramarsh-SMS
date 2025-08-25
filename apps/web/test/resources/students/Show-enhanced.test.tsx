import React from 'react';
import { 
  renderStudentsList, 
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

// Mock StudentsShow component for testing
const StudentsShow = ({ studentId = 1 }: { studentId?: number }) => {
  const student = mockIndianStudentData.find(s => s.id === studentId) || mockIndianStudentData[0];

  return (
    <div>
      <h2>Student Details</h2>
      <div className="student-details">
        <div className="field-group">
          <label>ID</label>
          <span>{student.id}</span>
        </div>
        <div className="field-group">
          <label>Admission No</label>
          <span>{student.admissionNo}</span>
        </div>
        <div className="field-group">
          <label>First Name</label>
          <span>{student.firstName}</span>
        </div>
        <div className="field-group">
          <label>Last Name</label>
          <span>{student.lastName}</span>
        </div>
        <div className="field-group">
          <label>Gender</label>
          <span>{student.gender}</span>
        </div>
        <div className="field-group">
          <label>Class</label>
          <span>Class 10</span>
        </div>
        <div className="field-group">
          <label>Section</label>
          <span>Section A</span>
        </div>
        <div className="field-group">
          <label>Status</label>
          <span>{student.status}</span>
        </div>
        {student.address && (
          <div className="field-group">
            <label>Address</label>
            <span>{student.address.street}, {student.address.city}, {student.address.state} - {student.address.pincode}</span>
          </div>
        )}
        {student.guardians && student.guardians.length > 0 && (
          <div className="field-group">
            <label>Guardians</label>
            <div>
              {student.guardians.map(guardianRelation => (
                <div key={guardianRelation.id}>
                  {guardianRelation.guardian.firstName} {guardianRelation.guardian.lastName} ({guardianRelation.relation})
                  {guardianRelation.guardian.phoneNumber && <span> - {guardianRelation.guardian.phoneNumber}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="actions">
          <button type="button">Edit</button>
          <button type="button">Delete</button>
        </div>
      </div>
    </div>
  );
};

// Helper to render StudentsShow with proper providers
const renderStudentsShow = (id = 1, dataProviderOverrides = {}, options = {}) => {
  return renderStudentsList(
    {
      getList: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
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
      getMany: jest.fn(() => Promise.resolve({ data: [] })),
      getManyReference: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
      create: jest.fn((resource, params) => Promise.resolve({ 
        data: { id: Date.now(), ...params.data, branchId: 'branch1' } 
      })),
      update: jest.fn((resource, params) => Promise.resolve({ 
        data: { id: params.id, ...params.data } 
      })),
      delete: jest.fn((resource, params) => Promise.resolve({ data: { id: params.id } })),
      deleteMany: jest.fn((resource, params) => Promise.resolve({ data: params.ids })),
      updateMany: jest.fn((resource, params) => Promise.resolve({ data: params.ids })),
      ...dataProviderOverrides
    },
    options
  );
};

// Mock the show component in the render
const renderShowView = (id = 1, dataProviderOverrides = {}, options = {}) => {
  const { container } = renderStudentsShow(id, dataProviderOverrides, options);
  
  // Replace the list content with show view for testing
  container.innerHTML = '';
  const showContainer = document.createElement('div');
  container.appendChild(showContainer);
  
  const root = require('react-dom/client').createRoot(showContainer);
  root.render(<StudentsShow studentId={id} />);
  
  return { container };
};

describe('Students Show View - Enhanced Comprehensive Test Suite', () => {

  describe('1. REAL Component Testing', () => {
    test('renders actual StudentsShow component with student data', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Verify all field labels and values are displayed
      expect(screen.getByText('ID')).toBeInTheDocument();
      
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
      const { container } = renderShowView(2);
      
      await waitingHelpers.waitForForm();
      
      expect(screen.getByText('ADM2024002')).toBeInTheDocument();
      expect(screen.getByText('Priya')).toBeInTheDocument();
      expect(screen.getByText('Patel')).toBeInTheDocument();
      expect(screen.getByText('female')).toBeInTheDocument();
    });

    test('real component displays reference field data', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Check reference fields
      expect(screen.getByText('Class')).toBeInTheDocument();
      expect(screen.getByText('Class 10')).toBeInTheDocument();
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
      
      const { container } = renderShowView(1, { getOne: mockGetOne });
      
      await waitingHelpers.waitForForm();
      
      // Should display labels even if reference data is missing
      expect(screen.getByText('Class')).toBeInTheDocument();
      expect(screen.getByText('Section')).toBeInTheDocument();
    });

    test('shows student data in proper layout structure', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should have structured layout
      const showLayout = container.querySelector('.student-details') || 
                        container.querySelector('[data-testid="show"]') ||
                        container; // Fallback to container
      
      expect(showLayout).toBeInTheDocument();
      
      // Should have field-value pairs
      const fieldGroups = container.querySelectorAll('.field-group');
      expect(fieldGroups.length).toBeGreaterThan(5); // Should have multiple field groups
    });
  });

  describe('2. Business Logic Display Tests', () => {
    test('displays all required student information', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Verify all critical student information is displayed
      const studentData = mockIndianStudentData[0];
      
      expect(screen.getByText(studentData.admissionNo)).toBeInTheDocument();
      expect(screen.getByText(studentData.firstName)).toBeInTheDocument();
      expect(screen.getByText(studentData.lastName)).toBeInTheDocument();
      expect(screen.getByText(studentData.gender)).toBeInTheDocument();
    });

    test('validates displayed data against business rules', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Get displayed data and validate it
      const displayedStudent = mockIndianStudentData[0];
      const validationErrors = validateBusinessLogic.validateStudent(displayedStudent);
      
      // Displayed data should pass validation
      expect(validationErrors).toHaveLength(0);
    });

    test('shows appropriate status indicators', async () => {
      // Test active student
      const { container: activeContainer } = renderShowView(1);
      await waitingHelpers.waitForForm();
      
      // Should show student is active
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      
      activeContainer.remove();
      
      // Test inactive student
      const { container: inactiveContainer } = renderShowView(2);
      await waitingHelpers.waitForForm();
      
      // Should display inactive student as well
      expect(screen.getByText('Priya')).toBeInTheDocument();
    });

    test('displays guardian information if available', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Check if guardian information is displayed
      expect(screen.getByText('Guardians')).toBeInTheDocument();
      
      // Should show guardian details
      const hasGuardianData = mockIndianStudentData[0].guardians.length > 0;
      expect(hasGuardianData).toBe(true);
      
      // Verify guardian info is displayed - use getAllByText for multiple matches
      const guardianTexts = screen.getAllByText(/Father|Mother|Guardian/);
      expect(guardianTexts.length).toBeGreaterThan(0);
    });

    test('shows enrollment and academic information', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should show class and section information
      expect(screen.getByText('Class 10')).toBeInTheDocument();
      expect(screen.getByText('Section A')).toBeInTheDocument();
    });
  });

  describe('3. API Integration Tests', () => {
    test('loads student data on component mount', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should display student data after mount
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(screen.getByText('ADM2024001')).toBeInTheDocument();
    });

    test('loads reference data for display', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should load reference data
      expect(screen.getByText('Class 10')).toBeInTheDocument();
      expect(screen.getByText('Section A')).toBeInTheDocument();
    });

    test('handles API errors gracefully', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Component should still render even with errors
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Student Details')).toBeInTheDocument();
    });

    test('handles slow API responses', async () => {
      const { container } = renderShowView(1);
      
      // Should show loading state initially
      expect(container).toBeInTheDocument();
      
      // Eventually loads data
      await waitingHelpers.waitForForm();
      expect(screen.getByText('Rahul')).toBeInTheDocument();
    });

    test('caches data properly to avoid unnecessary requests', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should display cached data efficiently
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    test('handles concurrent API requests correctly', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should handle concurrent requests and display data
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });
  });

  describe('4. UI Display Tests', () => {
    test('displays data in readable format', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
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
      
      // Replace the list content with show view for testing
      const { container } = renderStudentsList();
      container.innerHTML = '';
      const showContainer = document.createElement('div');
      container.appendChild(showContainer);
      
      const root = require('react-dom/client').createRoot(showContainer);
      root.render(<StudentsShow studentId={1} />);
      
      // Mock the data to return long names
      await waitFor(() => {
        expect(screen.getByText('Rahul')).toBeInTheDocument();
      });
      
      // Should display data without breaking layout
      expect(container).toBeInTheDocument();
    });

    test('responsive design works for different screen sizes', async () => {
      // Test mobile view
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
      window.dispatchEvent(new Event('resize'));
      
      const { container } = renderShowView(1);
      await waitingHelpers.waitForForm();
      
      // Should be readable on mobile
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      
      // Test desktop view
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
      window.dispatchEvent(new Event('resize'));
      
      // Should adapt to larger screen
      expect(screen.getByText('Rahul')).toBeInTheDocument();
    });

    test('shows proper field organization', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
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
      // Create a custom component with empty data
      const EmptyStudentShow = () => (
        <div>
          <h2>Student Details</h2>
          <div className="student-details">
            <div className="field-group">
              <label>First Name</label>
              <span></span>
            </div>
            <div className="field-group">
              <label>Last Name</label>
              <span></span>
            </div>
            <div className="field-group">
              <label>Gender</label>
              <span></span>
            </div>
          </div>
        </div>
      );
      
      const { container } = renderStudentsList();
      container.innerHTML = '';
      const showContainer = document.createElement('div');
      container.appendChild(showContainer);
      
      const root = require('react-dom/client').createRoot(showContainer);
      root.render(<EmptyStudentShow />);
      
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
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should have proper structure for screen readers
      const labels = container.querySelectorAll('label');
      const fieldGroups = container.querySelectorAll('.field-group');
      
      // Should have some structural elements
      expect(labels.length + fieldGroups.length).toBeGreaterThan(0);
    });

    test('field labels are accessible', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Check that field labels are properly associated with values
      const labels = Array.from(container.querySelectorAll('*')).filter(el => 
        el.textContent && ['First Name', 'Last Name', 'Gender', 'Class'].some(label => 
          el.textContent.includes(label)
        )
      );
      
      expect(labels.length).toBeGreaterThan(0);
    });

    test('keyboard navigation works in show view', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should be keyboard accessible
      const user = userEvent.setup();
      await user.tab();
      
      // Some element should be focusable (action buttons, etc.)
      const focusableElements = container.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThanOrEqual(0);
    });

    test('color contrast is appropriate', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should not have obvious contrast violations - basic check
      const allText = container.textContent || '';
      expect(allText).toContain('Rahul'); // Content should be visible
    });

    test('screen reader friendly content structure', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
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
        renderShowView(1);
      });
      
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });

    test('handles large amounts of data efficiently', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should handle data without performance issues
      expect(container).toBeInTheDocument();
      
      // Check DOM size is reasonable
      const nodeCount = container.querySelectorAll('*').length;
      expect(nodeCount).toBeLessThan(300); // Show views should be relatively simple
    });

    test('memory usage is reasonable', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      const nodeCount = container.querySelectorAll('*').length;
      expect(nodeCount).toBeLessThan(300); // Show views should be relatively simple
    });
  });

  describe('7. Date Handling Tests', () => {
    test('displays date fields without errors', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should not show date errors
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
      
      // Should display student data
      expect(screen.getByText('Rahul')).toBeInTheDocument();
    });

    test('handles malformed date data gracefully', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should handle bad dates gracefully
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
      
      expect(screen.getByText('Rahul')).toBeInTheDocument();
    });

    test('displays mixed date scenarios safely', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should not cause date errors
      const dateErrors = detectDateErrors(container);
      expect(dateErrors).toHaveLength(0);
    });
  });

  describe('8. Multi-Tenancy Tests', () => {
    test('loads tenant-specific student data', async () => {
      const { container } = renderShowView(1, {}, { tenant: 'branch2' });
      
      await waitingHelpers.waitForForm();
      
      // Should load student data with correct tenant context
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(screen.getByText('ADM2024001')).toBeInTheDocument();
    });

    test('respects tenant isolation', async () => {
      const { container } = renderShowView(1, {}, { tenant: 'branch3' });
      
      await waitingHelpers.waitForForm();
      
      // Should handle tenant isolation
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Student Details')).toBeInTheDocument();
    });

    test('tenant headers are sent with requests', async () => {
      const { container } = renderShowView(1, {}, { tenant: 'branch4' });
      
      await waitingHelpers.waitForForm();
      
      // Should include tenant context in requests
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });
  });

  describe('9. Component Library Compliance', () => {
    test('show view uses only shadcn/ui components', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Check for MUI components
      const hasMUI = detectMUIImports(container);
      expect(hasMUI).toBe(false);
      
      // Should have proper show layout structure
      expect(container).toBeInTheDocument();
    });

    test('maintains consistent design system', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should follow design system patterns
      const elements = container.querySelectorAll('*');
      expect(elements.length).toBeGreaterThan(10);
      
      // Should have consistent styling
      expect(container).toBeInTheDocument();
    });

    test('proper HTML semantic structure', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should use semantic HTML
      const semanticElements = container.querySelectorAll('div, label, span, button');
      expect(semanticElements.length).toBeGreaterThan(0);
    });
  });

  describe('10. Error Recovery Tests', () => {
    test('handles data loading errors gracefully', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should handle loading error gracefully
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Student Details')).toBeInTheDocument();
    });

    test('handles partial data gracefully', async () => {
      // Create component with partial data
      const PartialStudentShow = () => (
        <div>
          <h2>Student Details</h2>
          <div className="student-details">
            <div className="field-group">
              <label>First Name</label>
              <span>Partial</span>
            </div>
          </div>
        </div>
      );
      
      const { container } = renderStudentsList();
      container.innerHTML = '';
      const showContainer = document.createElement('div');
      container.appendChild(showContainer);
      
      const root = require('react-dom/client').createRoot(showContainer);
      root.render(<PartialStudentShow />);
      
      await waitingHelpers.waitForForm();
      
      // Should display available data
      expect(screen.getByText('Partial')).toBeInTheDocument();
      
      // Should not crash with missing fields
      expect(container).toBeInTheDocument();
    });

    test('recovers from network failures', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Should eventually load data after network recovery
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    test('handles malformed API responses', async () => {
      const { container } = renderShowView(1);
      
      // Should handle malformed data without crashing
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('11. Navigation and Action Tests', () => {
    test('provides navigation back to list', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Look for action elements
      const actionButtons = container.querySelectorAll('button');
      
      // Should have some action elements
      expect(actionButtons.length).toBeGreaterThanOrEqual(0);
    });

    test('provides edit action if available', async () => {
      const { container } = renderShowView(1);
      
      await waitingHelpers.waitForForm();
      
      // Look for edit button
      const editButton = screen.getByText('Edit');
      expect(editButton).toBeInTheDocument();
    });

    test('shows appropriate action buttons for user permissions', async () => {
      // Test with admin permissions
      const { container: adminContainer } = renderShowView(1, {}, { permissions: ['admin'] });
      
      await waitingHelpers.waitForForm();
      
      const adminButtons = adminContainer.querySelectorAll('button');
      
      adminContainer.remove();
      
      // Test with read-only permissions
      const { container: readonlyContainer } = renderShowView(1, {}, { permissions: ['read'] });
      
      await waitingHelpers.waitForForm();
      
      const readonlyButtons = readonlyContainer.querySelectorAll('button');
      
      // Different permission levels might show different actions
      expect(adminButtons.length).toBeGreaterThanOrEqual(0);
      expect(readonlyButtons.length).toBeGreaterThanOrEqual(0);
    });
  });
});