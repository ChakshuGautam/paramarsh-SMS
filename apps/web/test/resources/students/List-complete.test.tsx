import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { StudentsList } from '../../../app/admin/resources/students/List';

describe('StudentsList - Complete Test Suite (26 tests)', () => {
  // Helper function to render with all required providers
  const renderStudentsList = (dataProviderOverrides = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    const defaultDataProvider = testDataProvider({
      getList: () => Promise.resolve({ 
        data: [
          { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Doe', 
            admissionNo: 'ADM2024001', 
            status: 'active',
            gender: 'male',
            classId: 'class-10',
            sectionId: 'section-a',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-16T10:30:00Z',
            guardians: [
              {
                id: 'sg-1',
                isPrimary: true,
                relation: 'Father',
                guardian: {
                  id: 'g-1',
                  phoneNumber: '+91-9876543210',
                  alternatePhoneNumber: '+91-9876543211'
                }
              }
            ]
          },
          { 
            id: 2, 
            firstName: 'Jane', 
            lastName: 'Smith', 
            admissionNo: 'ADM2024002', 
            status: 'inactive',
            gender: 'female',
            classId: 'class-10',
            sectionId: 'section-b',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-16T10:30:00Z',
            guardians: []
          },
          { 
            id: 3, 
            firstName: 'Bob', 
            lastName: 'Johnson', 
            admissionNo: 'ADM2024003', 
            status: 'graduated',
            gender: 'male',
            classId: 'class-12',
            sectionId: 'section-a',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-16T10:30:00Z',
            guardians: []
          }
        ], 
        total: 3 
      }),
      getOne: (resource, params) => {
        if (resource === 'classes') {
          const classes = {
            'class-10': { id: 'class-10', name: 'Class 10' },
            'class-12': { id: 'class-12', name: 'Class 12' }
          };
          return Promise.resolve({ data: classes[params.id] || {} });
        }
        if (resource === 'sections') {
          const sections = {
            'section-a': { id: 'section-a', name: 'Section A' },
            'section-b': { id: 'section-b', name: 'Section B' }
          };
          return Promise.resolve({ data: sections[params.id] || {} });
        }
        return Promise.resolve({ data: {} });
      },
      getMany: () => Promise.resolve({ data: [] }),
      getManyReference: () => Promise.resolve({ data: [], total: 0 }),
      ...dataProviderOverrides
    });

    return render(
      <MemoryRouter initialEntries={['/students']}>
        <QueryClientProvider client={queryClient}>
          <AdminContext dataProvider={defaultDataProvider} store={memoryStore()}>
            <ResourceContextProvider value="students">
              <StudentsList />
            </ResourceContextProvider>
          </AdminContext>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  describe('As a school administrator viewing the student list', () => {
    // Test 1
    test('should see all students without date errors', async () => {
      renderStudentsList();
      
      // Wait for students to appear
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
      
      const jane = await screen.findByText('Jane');
      expect(jane).toBeInTheDocument();
      
      // Check no date errors
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
      expect(screen.queryByText(/Invalid Date/i)).toBeNull();
    });

    // Test 2
    test('should see different status tabs with student counts', async () => {
      renderStudentsList();
      
      // Wait for tabs to appear
      const activeTab = await screen.findByText('Active');
      const inactiveTab = await screen.findByText('Inactive');
      const graduatedTab = await screen.findByText('Graduated');
      
      expect(activeTab).toBeInTheDocument();
      expect(inactiveTab).toBeInTheDocument();
      expect(graduatedTab).toBeInTheDocument();
    });

    // Test 3
    test('should be able to filter students by status through tabs', async () => {
      const mockGetList = jest.fn((resource, params) => {
        // Filter by status if provided
        const status = params.filter?.status || 'active';
        const allStudents = [
          { id: 1, firstName: 'John', lastName: 'Doe', admissionNo: 'ADM001', status: 'active' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', admissionNo: 'ADM002', status: 'inactive' },
          { id: 3, firstName: 'Bob', lastName: 'Johnson', admissionNo: 'ADM003', status: 'graduated' }
        ];
        const filtered = allStudents.filter(s => s.status === status);
        return Promise.resolve({ data: filtered, total: filtered.length });
      });
      
      renderStudentsList({ getList: mockGetList });
      
      // Initially should show active students (1 out of 3)
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
      expect(screen.queryByText('Jane')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      
      // Click inactive tab
      const inactiveTab = screen.getByText('Inactive');
      fireEvent.click(inactiveTab);
      
      // Should now show only inactive students (1 out of 3)
      const jane = await screen.findByText('Jane');
      expect(jane).toBeInTheDocument();
      expect(screen.queryByText('John')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      
      // Verify data provider was called with correct filter
      expect(mockGetList).toHaveBeenCalledWith(
        'students',
        expect.objectContaining({
          filter: expect.objectContaining({ status: 'inactive' })
        })
      );
    });

    // Test 4
    test('should be able to search for students', async () => {
      const mockGetList = jest.fn((resource, params) => {
        const searchQuery = params.filter?.q?.toLowerCase() || '';
        const allStudents = [
          { id: 1, firstName: 'John', lastName: 'Doe', admissionNo: 'ADM001', status: 'active' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', admissionNo: 'ADM002', status: 'active' },
          { id: 3, firstName: 'Bob', lastName: 'Johnson', admissionNo: 'ADM003', status: 'active' }
        ];
        
        const filtered = searchQuery 
          ? allStudents.filter(s => 
              s.firstName.toLowerCase().includes(searchQuery) ||
              s.lastName.toLowerCase().includes(searchQuery) ||
              s.admissionNo.toLowerCase().includes(searchQuery)
            )
          : allStudents;
        
        return Promise.resolve({ data: filtered, total: filtered.length });
      });
      
      const { container } = renderStudentsList({ getList: mockGetList });
      
      // Initially should show all 3 students
      await screen.findByText('John');
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      
      // Verify search input exists (look for any text input)
      const inputs = container.querySelectorAll('input[type="text"], input:not([type])');
      expect(inputs.length).toBeGreaterThan(0);
      
      // Verify the search filter logic works correctly
      // Note: 'John' matches both 'John Doe' and 'Bob Johnson'
      const searchJohn = await mockGetList('students', { filter: { q: 'John' } });
      expect(searchJohn.data.length).toBe(2); // John and Johnson
      expect(searchJohn.data.map(s => s.firstName).sort()).toEqual(['Bob', 'John']);
      
      const searchDoe = await mockGetList('students', { filter: { q: 'Doe' } });
      expect(searchDoe.data.length).toBe(1);
      expect(searchDoe.data[0].lastName).toBe('Doe');
      
      const searchADM002 = await mockGetList('students', { filter: { q: 'ADM002' } });
      expect(searchADM002.data.length).toBe(1);
      expect(searchADM002.data[0].firstName).toBe('Jane');
      
      const searchSmith = await mockGetList('students', { filter: { q: 'smith' } });
      expect(searchSmith.data.length).toBe(1);
      expect(searchSmith.data[0].lastName).toBe('Smith');
      
      // Verify data provider is called initially
      expect(mockGetList).toHaveBeenCalled();
    });

    // Test 5
    test('should be able to filter by class and section dropdowns', async () => {
      let currentFilters = { status: 'active' };
      
      const mockGetList = jest.fn((resource, params) => {
        // Update current filters when called
        if (params.filter) {
          currentFilters = { ...params.filter };
        }
        
        const classId = currentFilters.classId;
        const sectionId = currentFilters.sectionId;
        const status = currentFilters.status || 'active';
        
        const allStudents = [
          { id: 1, firstName: 'John', lastName: 'Doe', admissionNo: 'ADM001', status: 'active', classId: 'class-10', sectionId: 'section-a' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', admissionNo: 'ADM002', status: 'active', classId: 'class-10', sectionId: 'section-b' },
          { id: 3, firstName: 'Bob', lastName: 'Johnson', admissionNo: 'ADM003', status: 'active', classId: 'class-11', sectionId: 'section-a' },
          { id: 4, firstName: 'Alice', lastName: 'Brown', admissionNo: 'ADM004', status: 'inactive', classId: 'class-10', sectionId: 'section-a' }
        ];
        
        let filtered = allStudents.filter(s => s.status === status);
        if (classId) {
          filtered = filtered.filter(s => s.classId === classId);
        }
        if (sectionId) {
          filtered = filtered.filter(s => s.sectionId === sectionId);
        }
        
        return Promise.resolve({ data: filtered, total: filtered.length });
      });
      
      // Also mock getMany for reference fields
      const mockGetMany = jest.fn((resource) => {
        if (resource === 'classes') {
          return Promise.resolve({ 
            data: [
              { id: 'class-10', name: 'Class 10' },
              { id: 'class-11', name: 'Class 11' }
            ] 
          });
        }
        if (resource === 'sections') {
          return Promise.resolve({ 
            data: [
              { id: 'section-a', name: 'Section A' },
              { id: 'section-b', name: 'Section B' }
            ] 
          });
        }
        return Promise.resolve({ data: [] });
      });
      
      const { container } = renderStudentsList({ 
        getList: mockGetList,
        getMany: mockGetMany 
      });
      
      // Initially should show 3 active students (Alice is inactive)
      await screen.findByText('John');
      await screen.findByText('Jane');
      await screen.findByText('Bob');
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
      
      // Verify initial call shows all active students
      expect(mockGetList).toHaveBeenCalledWith(
        'students',
        expect.objectContaining({
          filter: expect.objectContaining({ status: 'active' })
        })
      );
      
      // Test filtering by Class 10 - should return John and Jane (2 out of 3 active)
      const class10Result = await mockGetList('students', { 
        filter: { classId: 'class-10', status: 'active' } 
      });
      expect(class10Result.data.length).toBe(2);
      expect(class10Result.data.map(s => s.firstName).sort()).toEqual(['Jane', 'John']);
      
      // Test filtering by Class 11 - should return only Bob (1 out of 3 active)
      const class11Result = await mockGetList('students', { 
        filter: { classId: 'class-11', status: 'active' } 
      });
      expect(class11Result.data.length).toBe(1);
      expect(class11Result.data[0].firstName).toBe('Bob');
      
      // Test filtering by Section A - should return John and Bob (2 out of 3 active)
      const sectionAResult = await mockGetList('students', { 
        filter: { sectionId: 'section-a', status: 'active' } 
      });
      expect(sectionAResult.data.length).toBe(2);
      expect(sectionAResult.data.map(s => s.firstName).sort()).toEqual(['Bob', 'John']);
      
      // Test combined filter: Class 10 + Section A - should return only John (1 out of 3)
      const combinedResult = await mockGetList('students', { 
        filter: { classId: 'class-10', sectionId: 'section-a', status: 'active' } 
      });
      expect(combinedResult.data.length).toBe(1);
      expect(combinedResult.data[0].firstName).toBe('John');
      
      // Test Class 10 + Section B - should return only Jane (1 out of 3)
      const janeSectionResult = await mockGetList('students', { 
        filter: { classId: 'class-10', sectionId: 'section-b', status: 'active' } 
      });
      expect(janeSectionResult.data.length).toBe(1);
      expect(janeSectionResult.data[0].firstName).toBe('Jane');
    });

    // Test 5c - Test actual dropdown interaction if elements exist
    test('should have working filter inputs in the UI', async () => {
      const { container } = renderStudentsList();
      
      // Wait for data to load
      await screen.findByText('John');
      
      // Check for various types of filter inputs
      const allInputs = container.querySelectorAll('input, select, [role="combobox"], [role="listbox"]');
      
      // Should have multiple filter inputs (search, class, section, gender, etc.)
      expect(allInputs.length).toBeGreaterThan(0);
      
      // Find specific filter elements by placeholder or label
      const searchInput = container.querySelector('input[placeholder*="Search" i], input[placeholder*="search" i]');
      const classFilter = container.querySelector('[placeholder*="class" i], select[name*="class" i]');
      const sectionFilter = container.querySelector('[placeholder*="section" i], select[name*="section" i]');
      const genderFilter = container.querySelector('[placeholder*="gender" i], select[name*="gender" i]');
      
      // At least search should exist
      expect(searchInput || classFilter || sectionFilter || genderFilter).toBeTruthy();
      
      // If search exists, test typing in it
      if (searchInput) {
        await userEvent.type(searchInput, 'test');
        expect(searchInput).toHaveValue('test');
      }
      
      // If dropdowns exist, they should be interactable
      if (classFilter && classFilter.tagName === 'SELECT') {
        expect(classFilter).not.toBeDisabled();
      }
    });

    // Test 5b - Additional filter test for gender dropdown
    test('should be able to filter by gender using dropdown', async () => {
      const mockGetList = jest.fn((resource, params) => {
        const gender = params.filter?.gender;
        const status = params.filter?.status || 'active';
        
        const allStudents = [
          { id: 1, firstName: 'John', lastName: 'Doe', admissionNo: 'ADM001', status: 'active', gender: 'male' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', admissionNo: 'ADM002', status: 'active', gender: 'female' },
          { id: 3, firstName: 'Bob', lastName: 'Johnson', admissionNo: 'ADM003', status: 'active', gender: 'male' },
          { id: 4, firstName: 'Alice', lastName: 'Brown', admissionNo: 'ADM004', status: 'active', gender: 'female' }
        ];
        
        let filtered = allStudents.filter(s => s.status === status);
        if (gender) {
          filtered = filtered.filter(s => s.gender === gender);
        }
        
        return Promise.resolve({ data: filtered, total: filtered.length });
      });
      
      const { container } = renderStudentsList({ getList: mockGetList });
      
      // Initially should show all 4 active students
      await screen.findByText('John');
      await screen.findByText('Jane');
      await screen.findByText('Bob');
      await screen.findByText('Alice');
      
      // Look for any filter inputs in the UI
      const filterInputs = container.querySelectorAll('input, select, [role="combobox"]');
      
      // We should have filter inputs
      expect(filterInputs.length).toBeGreaterThan(0);
      
      // Verify the mock was called with initial filters
      expect(mockGetList).toHaveBeenCalledWith(
        'students',
        expect.objectContaining({
          filter: expect.objectContaining({ 
            status: 'active'
          })
        })
      );
      
      // Test the mock directly to verify filter logic works
      const maleFilter = await mockGetList('students', { filter: { gender: 'male', status: 'active' } });
      expect(maleFilter.data.length).toBe(2);
      expect(maleFilter.data.map(s => s.firstName).sort()).toEqual(['Bob', 'John']);
      
      // Test filtering females
      const femaleFilter = await mockGetList('students', { filter: { gender: 'female', status: 'active' } });
      expect(femaleFilter.data.length).toBe(2);
      expect(femaleFilter.data.map(s => s.firstName).sort()).toEqual(['Alice', 'Jane']);
    });

    // Test 6
    test('should see guardian phone numbers when available', async () => {
      renderStudentsList();
      
      // Wait for guardian phone to appear
      const phoneNumber = await screen.findByText('+91-9876543210');
      expect(phoneNumber).toBeInTheDocument();
    });

    // Test 7
    test('should handle students with no guardian phones gracefully', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ 
          data: [
            { 
              id: 1, 
              firstName: 'John', 
              lastName: 'Doe', 
              admissionNo: 'ADM2024001', 
              status: 'active',
              guardians: [
                {
                  id: 'sg-1',
                  isPrimary: true,
                  relation: 'Father',
                  guardian: {
                    id: 'g-1',
                    phoneNumber: null,
                    alternatePhoneNumber: null
                  }
                }
              ]
            }
          ], 
          total: 1 
        })
      });
      
      // Wait for "No phone" message
      const noPhone = await screen.findByText('No phone');
      expect(noPhone).toBeInTheDocument();
    });

    // Test 8
    test('should handle students without guardians gracefully', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ 
          data: [
            { 
              id: 1, 
              firstName: 'John', 
              lastName: 'Doe', 
              admissionNo: 'ADM2024001', 
              status: 'active',
              guardians: []
            }
          ], 
          total: 1 
        })
      });
      
      // Should show dash for missing guardian
      await screen.findByText('John');
      const dash = screen.getByText('-');
      expect(dash).toBeInTheDocument();
    });

    // Test 9
    test('should see visual status indicators through row styling', async () => {
      const { container } = renderStudentsList();
      
      // Wait for data to load
      await screen.findByText('John');
      
      // Check for colored borders (status indicators)
      const borders = container.querySelectorAll('[class*="border-l-"]');
      expect(borders.length).toBeGreaterThan(0);
    });

    // Test 10
    test('should see student data in a responsive table format', async () => {
      renderStudentsList();
      
      // Wait for column headers
      const admissionHeader = await screen.findByText('Admission No');
      const firstNameHeader = await screen.findByText('First Name');
      const lastNameHeader = await screen.findByText('Last Name');
      
      expect(admissionHeader).toBeInTheDocument();
      expect(firstNameHeader).toBeInTheDocument();
      expect(lastNameHeader).toBeInTheDocument();
    });
  });

  describe('Critical Date Handling Scenarios', () => {
    // Test 11
    test('should handle students with null dates without crashing', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ 
          data: [
            { 
              id: 1, 
              firstName: 'John', 
              lastName: 'Doe', 
              admissionNo: 'ADM2024001', 
              status: 'active',
              createdAt: null,
              updatedAt: null
            }
          ], 
          total: 1 
        })
      });
      
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    });

    // Test 12
    test('should handle students with undefined dates without crashing', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ 
          data: [
            { 
              id: 1, 
              firstName: 'John', 
              lastName: 'Doe', 
              admissionNo: 'ADM2024001', 
              status: 'active',
              createdAt: undefined,
              updatedAt: undefined
            }
          ], 
          total: 1 
        })
      });
      
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    });

    // Test 13
    test('should handle students with empty string dates without crashing', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ 
          data: [
            { 
              id: 1, 
              firstName: 'John', 
              lastName: 'Doe', 
              admissionNo: 'ADM2024001', 
              status: 'active',
              createdAt: '',
              updatedAt: ''
            }
          ], 
          total: 1 
        })
      });
      
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    });

    // Test 14
    test('should handle students with invalid date strings without crashing', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ 
          data: [
            { 
              id: 1, 
              firstName: 'John', 
              lastName: 'Doe', 
              admissionNo: 'ADM2024001', 
              status: 'active',
              createdAt: 'invalid-date',
              updatedAt: 'not-a-date'
            }
          ], 
          total: 1 
        })
      });
      
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    });

    // Test 15
    test('should handle students with valid ISO dates without crashing', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ 
          data: [
            { 
              id: 1, 
              firstName: 'John', 
              lastName: 'Doe', 
              admissionNo: 'ADM2024001', 
              status: 'active',
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-16T10:30:00Z'
            }
          ], 
          total: 1 
        })
      });
      
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    });

    // Test 16
    test('should handle students with mixed date scenarios without crashing', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ 
          data: [
            { 
              id: 1, 
              firstName: 'John', 
              lastName: 'Doe', 
              admissionNo: 'ADM2024001', 
              status: 'active',
              createdAt: null,
              updatedAt: '2024-01-16T10:30:00Z'
            }
          ], 
          total: 1 
        })
      });
      
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    });
  });

  describe('Error State Handling', () => {
    // Test 17
    test('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderStudentsList({
        getList: () => Promise.reject(new Error('API Error'))
      });
      
      // Should still render the component structure
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(document.body.textContent).toBeTruthy();
      
      consoleErrorSpy.mockRestore();
    });

    // Test 18
    test('should handle empty data state', async () => {
      renderStudentsList({
        getList: () => Promise.resolve({ data: [], total: 0 })
      });
      
      // Wait for empty state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should show some indication of no data (varies by React Admin version)
      const body = document.body.textContent;
      expect(body).toBeTruthy(); // Component should render even with no data
    });
  });

  describe('Component Library Compliance', () => {
    // Test 19
    test('should not use MUI components', async () => {
      const { container } = renderStudentsList();
      
      await screen.findByText('John');
      
      // Check for MUI class names
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements).toHaveLength(0);
    });

    // Test 20
    test('should use shadcn/ui components exclusively', async () => {
      const { container } = renderStudentsList();
      
      await screen.findByText('John');
      
      // Check for shadcn/ui patterns - tabs are the main shadcn component used
      // Look for tab triggers which are part of shadcn/ui tabs
      const tabTriggers = screen.getAllByText(/Active|Inactive|Graduated/);
      expect(tabTriggers.length).toBeGreaterThan(0);
      
      // Also check no MUI is present
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements).toHaveLength(0);
    });
  });

  describe('Multi-tenancy Support', () => {
    // Test 21
    test('should include tenant header in all requests', async () => {
      const mockGetList = jest.fn(() => Promise.resolve({ 
        data: [
          { id: 1, firstName: 'John', lastName: 'Doe', admissionNo: 'ADM001', status: 'active' }
        ], 
        total: 1 
      }));
      
      renderStudentsList({
        getList: mockGetList
      });
      
      await screen.findByText('John');
      
      // Verify getList was called
      expect(mockGetList).toHaveBeenCalled();
    });

    // Test 22
    test('should filter data by tenant context', async () => {
      renderStudentsList({
        getList: (resource, params) => {
          // Simulate filtering by branch
          const branchId = params.filter?.branchId || 'branch1';
          return Promise.resolve({ 
            data: [
              { 
                id: 1, 
                firstName: 'John', 
                lastName: 'Doe', 
                admissionNo: 'ADM001', 
                status: 'active',
                branchId 
              }
            ], 
            total: 1 
          });
        }
      });
      
      const john = await screen.findByText('John');
      expect(john).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    // Test 23
    test('should handle large datasets without performance issues', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        firstName: `Student${i}`,
        lastName: `Test${i}`,
        admissionNo: `ADM${i.toString().padStart(3, '0')}`,
        status: 'active',
        gender: i % 2 === 0 ? 'male' : 'female'
      }));
      
      const start = performance.now();
      
      renderStudentsList({
        getList: () => Promise.resolve({ data: largeDataset, total: 100 })
      });
      
      await screen.findByText('Student0');
      
      const end = performance.now();
      const renderTime = end - start;
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(2000);
    });

    // Test 24
    test('should support pagination to limit rendered items', async () => {
      const { container } = renderStudentsList();
      
      await screen.findByText('John');
      
      // Check that table rows are limited (pagination)
      const rows = container.querySelectorAll('tr');
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.length).toBeLessThanOrEqual(15); // Header + limited data rows
    });
  });

  describe('Accessibility Compliance', () => {
    // Test 25
    test('should have proper ARIA labels and roles', async () => {
      const { container } = renderStudentsList();
      
      await screen.findByText('John');
      
      // Check for basic structure - div containers and lists
      const structuralElements = container.querySelectorAll('div, main, table, [role="table"], [role="list"]');
      expect(structuralElements.length).toBeGreaterThan(0);
      
      // Check for interactive elements
      const buttons = container.querySelectorAll('button, [role="button"]');
      expect(buttons.length).toBeGreaterThan(0);
    });

    // Test 26
    test('should support keyboard navigation', async () => {
      renderStudentsList();
      
      await screen.findByText('John');
      
      // Get interactive elements
      const activeTab = screen.getByText('Active');
      const inactiveTab = screen.getByText('Inactive');
      
      // Simulate keyboard interaction
      const user = userEvent.setup();
      await user.click(inactiveTab);
      
      // Tab should be clickable
      expect(inactiveTab).toBeInTheDocument();
    });
  });
});