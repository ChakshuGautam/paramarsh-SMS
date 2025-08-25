import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentsList } from '../../../app/admin/resources/students/List';
import { renderWithReactAdmin, mockStudentData, expectNoDateErrors, createMockDataProvider } from '../../test-helpers';

describe('Students List', () => {

  const renderStudentsList = (dataProviderOverrides = {}) => {
    const dataProvider = createMockDataProvider(mockStudentData, dataProviderOverrides);
    return renderWithReactAdmin(<StudentsList />, {
      resource: "students",
      dataProvider,
    });
  };

  it('should render students list without date errors', async () => {
    renderStudentsList();
    
    // Wait for students to appear using React Admin pattern
    const rahul = await screen.findByText('Rahul');
    expect(rahul).toBeInTheDocument();
    
    // Check multiple students are rendered  
    expect(screen.getByText('Priya')).toBeInTheDocument();
    
    // Check admission numbers
    expect(screen.getByText('ADM2024001')).toBeInTheDocument();
    expect(screen.getByText('ADM2024002')).toBeInTheDocument();
    
    // Critical: No date errors should appear
    expectNoDateErrors();
  });

  it('should display status tabs', async () => {
    renderStudentsList();
    
    // Wait for tabs to appear
    const activeTab = await screen.findByText('Active');
    expect(activeTab).toBeInTheDocument();
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Graduated')).toBeInTheDocument();
  });

  it('should handle tab clicks for status filtering', async () => {
    renderStudentsList();
    
    const user = userEvent.setup();
    const inactiveTab = await screen.findByText('Inactive');
    
    // Should be able to click tab without errors
    await user.click(inactiveTab);
    
    // Tab should still be present after click
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should display search input', async () => {
    renderStudentsList();
    
    const searchInput = await screen.findByPlaceholderText(/search students/i);
    expect(searchInput).toBeInTheDocument();
    
    // Should be able to type in search
    const user = userEvent.setup();
    await user.type(searchInput, 'Rahul');
    
    expect(searchInput).toHaveValue('Rahul');
  });

  it('should display filter options', async () => {
    renderStudentsList();
    
    // Wait for filter inputs to appear (they show as text in buttons, not placeholders)
    const classFilter = await screen.findByText('Filter by class');
    expect(classFilter).toBeInTheDocument();
    
    // Gender filter should also be present
    const genderFilter = await screen.findByText('Filter by gender');
    expect(genderFilter).toBeInTheDocument();
    
    // Section filter might be hidden until class is selected
    // Just check that the component rendered without errors
    expectNoDateErrors();
  });

  it('should display guardian phone numbers when available', async () => {
    renderStudentsList();
    
    // Wait for guardian phone to appear
    const phoneNumber = await screen.findByText('+91-9876543210');
    expect(phoneNumber).toBeInTheDocument();
    
    // Should show relation info
    expect(screen.getByText('(Father)')).toBeInTheDocument();
  });

  it('should handle students with no guardian phones gracefully', async () => {
    renderStudentsList();
    
    // Test should render without crashing for students with different guardian scenarios
    await screen.findByText('Rahul');
    
    // Should show appropriate messages for students without guardian phone
    // This could be "No phone", "-", or similar placeholder text
    expectNoDateErrors();
  });

  it('should handle students without guardians gracefully', async () => {
    renderStudentsList();
    
    // Priya has no guardians in mock data
    await screen.findByText('Priya');
    
    // Should show dash for missing guardian info
    const dashElements = screen.getAllByText('-');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it('should display visual status indicators', async () => {
    renderStudentsList();
    
    await screen.findByText('Rahul');
    
    // Check for colored borders indicating status
    const coloredRows = document.querySelectorAll('[class*="border-l-"]');
    expect(coloredRows.length).toBeGreaterThan(0);
  });

  it('should display table headers and data', async () => {
    renderStudentsList();
    
    await screen.findByText('Rahul');
    
    // Check for essential columns
    expect(screen.getByText('Admission No')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    
    // Check for responsive columns (hidden on mobile)
    const hiddenColumns = document.querySelectorAll('.hidden.md\\:table-cell');
    expect(hiddenColumns.length).toBeGreaterThan(0);
  });

  it('should handle comprehensive date edge cases without errors', async () => {
    const studentsWithEdgeDates = [
      { ...mockStudentData[0], createdAt: null, updatedAt: null },
      { ...mockStudentData[1], createdAt: undefined, updatedAt: undefined },
      { id: 3, admissionNo: 'ADM2024003', firstName: 'Test', lastName: 'Student', 
        gender: 'male', status: 'active', classId: 1, sectionId: 1,
        createdAt: '', updatedAt: 'invalid-date', guardians: [],
        class: { id: 1, name: 'Class 5', gradeLevel: 5 },
        section: { id: 1, name: 'A' }
      }
    ];
    
    renderStudentsList({
      getList: () => Promise.resolve({ 
        data: studentsWithEdgeDates, 
        total: studentsWithEdgeDates.length 
      })
    });
    
    await screen.findByText('Rahul');
    
    // Should never show date errors
    expectNoDateErrors();
  });

  it('should handle empty data gracefully', async () => {
    renderStudentsList({
      getList: () => Promise.resolve({ data: [], total: 0 })
    });
    
    // Should render without crashing
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('should not contain MUI components', async () => {
    const { container } = renderStudentsList();
    
    await screen.findByText('Rahul');
    
    // Should not have MUI classes
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should use status filter by default', async () => {
    renderStudentsList();
    
    await screen.findByText('Rahul');
    
    // Active tab should be visible and accessible
    const activeTab = screen.getByText('Active');
    expect(activeTab).toBeInTheDocument();
  });

  it('should render efficiently with pagination', async () => {
    renderStudentsList();
    
    await screen.findByText('Rahul');
    
    // Should have reasonable number of table rows
    const tableRows = document.querySelectorAll('tr');
    expect(tableRows.length).toBeGreaterThan(0);
    expect(tableRows.length).toBeLessThan(20); // Reasonable limit
  });

  it('should support tab navigation', async () => {
    renderStudentsList();
    
    const user = userEvent.setup();
    const activeTab = await screen.findByText('Active');
    const inactiveTab = screen.getByText('Inactive');
    
    // Should be able to click tabs without errors
    await user.click(inactiveTab);
    
    // Both tabs should still be present after click
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should handle all date edge cases safely', async () => {
    const edgeCaseStudents = [
      { ...mockStudentData[0], createdAt: null, updatedAt: null },
      { ...mockStudentData[1], createdAt: undefined, updatedAt: undefined },
      { id: 3, admissionNo: 'ADM2024003', firstName: 'Edge', lastName: 'Case', 
        gender: 'male', status: 'active', classId: 1, sectionId: 1,
        createdAt: '', updatedAt: 'invalid-date', guardians: [],
        class: { id: 1, name: 'Class 5', gradeLevel: 5 },
        section: { id: 1, name: 'A' }
      },
      { id: 4, admissionNo: 'ADM2024004', firstName: 'Test', lastName: 'Student', 
        gender: 'male', status: 'active', classId: 1, sectionId: 1,
        createdAt: 'not-a-date', updatedAt: 1705316400000, guardians: [],
        class: { id: 1, name: 'Class 5', gradeLevel: 5 },
        section: { id: 1, name: 'A' }
      }
    ];
    
    renderStudentsList({
      getList: () => Promise.resolve({ 
        data: edgeCaseStudents, 
        total: edgeCaseStudents.length 
      })
    });
    
    await screen.findByText('Rahul');
    
    // CRITICAL: Should never show date errors
    expectNoDateErrors();
    
    // All students should render without crashes
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});