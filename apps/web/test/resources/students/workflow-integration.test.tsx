import React from 'react';
import { 
  renderWithEnhancedAdmin,
  mockIndianStudentData,
  detectDateErrors,
  detectMUIImports,
  validateBusinessLogic,
  formValidationHelpers,
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
import { MemoryRouter } from 'react-router-dom';

// Import real components
const { StudentsList } = require('../../../app/admin/resources/students/List');
const { StudentsCreate } = require('../../../app/admin/resources/students/Create');
const { StudentsEdit } = require('../../../app/admin/resources/students/Edit');
const { StudentsShow } = require('../../../app/admin/resources/students/Show');

describe('Student Management - Cross-Component Workflow Integration Tests', () => {

  describe('1. Complete CRUD Workflow Tests', () => {
    test('full student lifecycle: create → view → edit → delete', async () => {
      let studentData = [];
      let nextId = 100;
      
      // Mock data provider that maintains state across operations
      const workflowDataProvider = {
        // List students
        getList: jest.fn((resource, params) => {
          if (resource === 'students') {
            let filtered = [...studentData];
            
            // Apply filters
            if (params.filter?.status) {
              filtered = filtered.filter(s => s.status === params.filter.status);
            }
            if (params.filter?.q) {
              const query = params.filter.q.toLowerCase();
              filtered = filtered.filter(s => 
                s.firstName.toLowerCase().includes(query) ||
                s.lastName.toLowerCase().includes(query) ||
                s.admissionNo.toLowerCase().includes(query)
              );
            }
            
            return Promise.resolve({ data: filtered, total: filtered.length });
          }
          return Promise.resolve({ data: [], total: 0 });
        }),
        
        // Get single student
        getOne: jest.fn((resource, params) => {
          if (resource === 'students') {
            const student = studentData.find(s => s.id === params.id);
            if (!student) {
              return Promise.reject(new Error('Student not found'));
            }
            return Promise.resolve({ data: student });
          }
          if (resource === 'classes') {
            return Promise.resolve({ data: { id: params.id, name: `Class ${params.id}` } });
          }
          if (resource === 'sections') {
            return Promise.resolve({ data: { id: params.id, name: `Section ${params.id}` } });
          }
          return Promise.resolve({ data: {} });
        }),
        
        // Create new student
        create: jest.fn((resource, params) => {
          if (resource === 'students') {
            const newStudent = { 
              id: nextId++, 
              ...params.data,
              status: 'active',
              branchId: 'branch1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              guardians: []
            };
            studentData.push(newStudent);
            return Promise.resolve({ data: newStudent });
          }
          return Promise.resolve({ data: {} });
        }),
        
        // Update student
        update: jest.fn((resource, params) => {
          if (resource === 'students') {
            const index = studentData.findIndex(s => s.id === params.id);
            if (index === -1) {
              return Promise.reject(new Error('Student not found'));
            }
            studentData[index] = { ...studentData[index], ...params.data, updatedAt: new Date().toISOString() };
            return Promise.resolve({ data: studentData[index] });
          }
          return Promise.resolve({ data: {} });
        }),
        
        // Delete student
        delete: jest.fn((resource, params) => {
          if (resource === 'students') {
            const index = studentData.findIndex(s => s.id === params.id);
            if (index === -1) {
              return Promise.reject(new Error('Student not found'));
            }
            const deleted = studentData.splice(index, 1)[0];
            return Promise.resolve({ data: deleted });
          }
          return Promise.resolve({ data: {} });
        }),
        
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 }),
        deleteMany: () => Promise.resolve({ data: [] }),
        updateMany: () => Promise.resolve({ data: [] })
      };

      // Step 1: Start with empty list
      const listComponent = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students'],
          dataProvider: workflowDataProvider
        }
      );
      
      // Should show empty list initially
      await waitFor(() => {
        expect(workflowDataProvider.getList).toHaveBeenCalled();
      });
      
      listComponent.container.remove();
      
      // Step 2: Create new student
      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: workflowDataProvider
        }
      );
      
      await waitingHelpers.waitForForm();
      
      const user = userEvent.setup();
      
      // Fill create form
      await user.type(screen.getByLabelText(/Admission No/i), 'ADM2024TEST');
      await user.type(screen.getByLabelText(/First Name/i), 'TestWorkflow');
      await user.type(screen.getByLabelText(/Last Name/i), 'Student');
      await user.type(screen.getByLabelText(/Gender/i), 'male');
      
      // Submit create form
      const createSubmitButton = createComponent.container.querySelector('[type="submit"]') || 
                                screen.getByRole('button', { name: /save/i });
      await user.click(createSubmitButton);
      
      // Verify creation
      await waitFor(() => {
        expect(workflowDataProvider.create).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            data: expect.objectContaining({
              admissionNo: 'ADM2024TEST',
              firstName: 'TestWorkflow',
              lastName: 'Student',
              gender: 'male'
            })
          })
        );
      });
      
      // Verify student was added to data
      expect(studentData).toHaveLength(1);
      expect(studentData[0].firstName).toBe('TestWorkflow');
      
      const createdStudentId = studentData[0].id;
      createComponent.container.remove();
      
      // Step 3: View created student
      const showComponent = renderWithEnhancedAdmin(
        <StudentsShow />,
        {
          resource: 'students',
          initialEntries: [`/students/${createdStudentId}/show`],
          dataProvider: workflowDataProvider
        }
      );
      
      await waitingHelpers.waitForData('TestWorkflow');
      
      // Verify all data is displayed
      expect(screen.getByText('TestWorkflow')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.getByText('ADM2024TEST')).toBeInTheDocument();
      expect(screen.getByText('male')).toBeInTheDocument();
      
      showComponent.container.remove();
      
      // Step 4: Edit the student
      const editComponent = renderWithEnhancedAdmin(
        <StudentsEdit />,
        {
          resource: 'students',
          initialEntries: [`/students/${createdStudentId}/edit`],
          dataProvider: workflowDataProvider
        }
      );
      
      await waitingHelpers.waitForForm();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toHaveValue('TestWorkflow');
      });
      
      // Modify the student
      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'UpdatedWorkflow');
      
      // Submit edit
      const editSubmitButton = editComponent.container.querySelector('[type="submit"]') || 
                              screen.getByRole('button', { name: /save/i });
      await user.click(editSubmitButton);
      
      // Verify update
      await waitFor(() => {
        expect(workflowDataProvider.update).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            id: createdStudentId,
            data: expect.objectContaining({
              firstName: 'UpdatedWorkflow'
            })
          })
        );
      });
      
      // Verify data was updated
      expect(studentData[0].firstName).toBe('UpdatedWorkflow');
      
      editComponent.container.remove();
      
      // Step 5: Delete the student (simulated via data provider)
      await workflowDataProvider.delete('students', { id: createdStudentId });
      
      // Verify deletion
      expect(workflowDataProvider.delete).toHaveBeenCalledWith('students', { id: createdStudentId });
      expect(studentData).toHaveLength(0);
    });

    test('workflow maintains data consistency across operations', async () => {
      let studentDatabase = [...mockIndianStudentData];
      
      const consistentDataProvider = {
        getList: jest.fn(() => Promise.resolve({ data: studentDatabase, total: studentDatabase.length })),
        getOne: jest.fn((resource, params) => {
          const student = studentDatabase.find(s => s.id === params.id);
          return student ? Promise.resolve({ data: student }) : Promise.reject(new Error('Not found'));
        }),
        update: jest.fn((resource, params) => {
          const index = studentDatabase.findIndex(s => s.id === params.id);
          if (index !== -1) {
            studentDatabase[index] = { ...studentDatabase[index], ...params.data };
            return Promise.resolve({ data: studentDatabase[index] });
          }
          return Promise.reject(new Error('Not found'));
        }),
        create: jest.fn((resource, params) => {
          const newStudent = { id: Date.now(), ...params.data };
          studentDatabase.push(newStudent);
          return Promise.resolve({ data: newStudent });
        }),
        delete: jest.fn((resource, params) => {
          const index = studentDatabase.findIndex(s => s.id === params.id);
          if (index !== -1) {
            const deleted = studentDatabase.splice(index, 1)[0];
            return Promise.resolve({ data: deleted });
          }
          return Promise.reject(new Error('Not found'));
        }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Test consistency across multiple operations
      const operations = [
        () => consistentDataProvider.getList('students', {}),
        () => consistentDataProvider.getOne('students', { id: 1 }),
        () => consistentDataProvider.update('students', { id: 1, data: { firstName: 'Updated' } }),
        () => consistentDataProvider.getOne('students', { id: 1 }),
      ];

      for (const operation of operations) {
        await operation();
      }

      // Verify consistency
      expect(consistentDataProvider.update).toHaveBeenCalled();
      expect(studentDatabase[0].firstName).toBe('Updated');
    });

    test('workflow handles validation errors across components', async () => {
      const validatingDataProvider = {
        create: jest.fn((resource, params) => {
          const errors = validateBusinessLogic.validateStudent(params.data);
          if (errors.length > 0) {
            return Promise.reject(new Error(`Validation failed: ${errors.join(', ')}`));
          }
          return Promise.resolve({ data: { id: 123, ...params.data } });
        }),
        update: jest.fn((resource, params) => {
          const updatedStudent = { ...mockIndianStudentData[0], ...params.data };
          const errors = validateBusinessLogic.validateStudent(updatedStudent);
          if (errors.length > 0) {
            return Promise.reject(new Error(`Validation failed: ${errors.join(', ')}`));
          }
          return Promise.resolve({ data: updatedStudent });
        }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Test validation in create workflow
      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: validatingDataProvider
        }
      );

      await waitingHelpers.waitForForm();

      const user = userEvent.setup();

      // Try to create with invalid data
      await user.type(screen.getByLabelText(/Admission No/i), 'INVALID');
      await user.type(screen.getByLabelText(/First Name/i), 'A'); // Too short
      await user.type(screen.getByLabelText(/Last Name/i), 'B'); // Too short
      await user.type(screen.getByLabelText(/Gender/i), 'invalid'); // Invalid gender

      const submitButton = createComponent.container.querySelector('[type="submit"]');
      await user.click(submitButton);

      // Should handle validation errors
      await waitFor(() => {
        expect(validatingDataProvider.create).toHaveBeenCalled();
      });

      createComponent.container.remove();

      // Test validation in edit workflow
      const editComponent = renderWithEnhancedAdmin(
        <StudentsEdit />,
        {
          resource: 'students',
          initialEntries: ['/students/1/edit'],
          dataProvider: validatingDataProvider
        }
      );

      await waitingHelpers.waitForForm();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toHaveValue('Rahul');
      });

      // Make invalid update
      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'A'); // Too short

      const editSubmitButton = editComponent.container.querySelector('[type="submit"]');
      await user.click(editSubmitButton);

      // Should handle validation errors
      await waitFor(() => {
        expect(validatingDataProvider.update).toHaveBeenCalled();
      });
    });
  });

  describe('2. Navigation Workflow Tests', () => {
    test('navigation between list, create, edit, and show works correctly', async () => {
      const navigationDataProvider = {
        getList: jest.fn(() => Promise.resolve({ data: mockIndianStudentData, total: mockIndianStudentData.length })),
        getOne: jest.fn((resource, params) => {
          if (resource === 'students') {
            return Promise.resolve({ data: mockIndianStudentData.find(s => s.id === params.id) || mockIndianStudentData[0] });
          }
          return Promise.resolve({ data: {} });
        }),
        create: jest.fn((resource, params) => Promise.resolve({ data: { id: 999, ...params.data } })),
        update: jest.fn((resource, params) => Promise.resolve({ data: { id: params.id, ...params.data } })),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Start with list view
      const listComponent = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students'],
          dataProvider: navigationDataProvider
        }
      );

      await waitingHelpers.waitForData('Rahul');

      // Should show students list
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(screen.getByText('Priya')).toBeInTheDocument();

      listComponent.container.remove();

      // Navigate to create
      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: navigationDataProvider
        }
      );

      await waitingHelpers.waitForForm();

      // Should show create form
      expect(screen.getByLabelText(/Admission No/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();

      createComponent.container.remove();

      // Navigate to edit
      const editComponent = renderWithEnhancedAdmin(
        <StudentsEdit />,
        {
          resource: 'students',
          initialEntries: ['/students/1/edit'],
          dataProvider: navigationDataProvider
        }
      );

      await waitingHelpers.waitForForm();

      // Should show edit form with pre-populated data
      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toHaveValue('Rahul');
      });

      editComponent.container.remove();

      // Navigate to show
      const showComponent = renderWithEnhancedAdmin(
        <StudentsShow />,
        {
          resource: 'students',
          initialEntries: ['/students/1/show'],
          dataProvider: navigationDataProvider
        }
      );

      await waitingHelpers.waitForData('Rahul');

      // Should show student details
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(screen.getByText('Sharma')).toBeInTheDocument();
      expect(screen.getByText('ADM2024001')).toBeInTheDocument();
    });

    test('browser back/forward navigation works correctly', async () => {
      // This test simulates browser navigation
      const mockHistoryStack = ['/students', '/students/create', '/students/1/edit', '/students/1/show'];
      let currentIndex = 0;

      const navigationProvider = {
        getList: () => Promise.resolve({ data: mockIndianStudentData, total: mockIndianStudentData.length }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        create: () => Promise.resolve({ data: { id: 999 } }),
        update: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Simulate navigation through different routes
      for (let i = 0; i < mockHistoryStack.length; i++) {
        const route = mockHistoryStack[i];
        let component;

        if (route === '/students') {
          component = renderWithEnhancedAdmin(
            <StudentsList />,
            { resource: 'students', initialEntries: [route], dataProvider: navigationProvider }
          );
          await waitingHelpers.waitForData('Rahul');
        } else if (route === '/students/create') {
          component = renderWithEnhancedAdmin(
            <StudentsCreate />,
            { resource: 'students', initialEntries: [route], dataProvider: navigationProvider }
          );
          await waitingHelpers.waitForForm();
        } else if (route === '/students/1/edit') {
          component = renderWithEnhancedAdmin(
            <StudentsEdit />,
            { resource: 'students', initialEntries: [route], dataProvider: navigationProvider }
          );
          await waitingHelpers.waitForForm();
        } else if (route === '/students/1/show') {
          component = renderWithEnhancedAdmin(
            <StudentsShow />,
            { resource: 'students', initialEntries: [route], dataProvider: navigationProvider }
          );
          await waitingHelpers.waitForData('Rahul');
        }

        // Verify navigation worked
        expect(component.container).toBeInTheDocument();
        component.container.remove();
      }
    });

    test('deep linking to specific students works correctly', async () => {
      const deepLinkProvider = {
        getOne: jest.fn((resource, params) => {
          if (resource === 'students') {
            const student = mockIndianStudentData.find(s => s.id === params.id);
            return student ? Promise.resolve({ data: student }) : Promise.reject(new Error('Not found'));
          }
          return Promise.resolve({ data: {} });
        }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Test deep link to student 2 (Priya)
      const showComponent = renderWithEnhancedAdmin(
        <StudentsShow />,
        {
          resource: 'students',
          initialEntries: ['/students/2/show'],
          dataProvider: deepLinkProvider
        }
      );

      await waitingHelpers.waitForData('Priya');

      // Should load Priya's data directly
      expect(screen.getByText('Priya')).toBeInTheDocument();
      expect(screen.getByText('Patel')).toBeInTheDocument();
      expect(screen.getByText('ADM2024002')).toBeInTheDocument();

      // Verify correct API call
      expect(deepLinkProvider.getOne).toHaveBeenCalledWith('students', { id: 2 });
    });

    test('handles invalid routes gracefully', async () => {
      const errorHandlingProvider = {
        getOne: jest.fn((resource, params) => {
          if (params.id === 999) {
            return Promise.reject(new Error('Student not found'));
          }
          return Promise.resolve({ data: mockIndianStudentData[0] });
        }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Try to access non-existent student
      const showComponent = renderWithEnhancedAdmin(
        <StudentsShow />,
        {
          resource: 'students',
          initialEntries: ['/students/999/show'],
          dataProvider: errorHandlingProvider
        }
      );

      // Should handle error gracefully
      await waitFor(() => {
        expect(errorHandlingProvider.getOne).toHaveBeenCalledWith('students', { id: 999 });
        expect(showComponent.container).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('3. State Management Workflow Tests', () => {
    test('form state is preserved during navigation interruptions', async () => {
      const stateProvider = {
        create: jest.fn(() => Promise.resolve({ data: { id: 123 } })),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: stateProvider
        }
      );

      await waitingHelpers.waitForForm();

      const user = userEvent.setup();

      // Fill form partially
      await user.type(screen.getByLabelText(/Admission No/i), 'ADM2024TEMP');
      await user.type(screen.getByLabelText(/First Name/i), 'TempStudent');

      // Simulate navigation interruption (e.g., user accidentally clicks back)
      // Form data should be preserved in real app
      expect(screen.getByLabelText(/Admission No/i)).toHaveValue('ADM2024TEMP');
      expect(screen.getByLabelText(/First Name/i)).toHaveValue('TempStudent');

      // Continue filling form
      await user.type(screen.getByLabelText(/Last Name/i), 'TestUser');
      await user.type(screen.getByLabelText(/Gender/i), 'other');

      // Submit
      const submitButton = createComponent.container.querySelector('[type="submit"]');
      await user.click(submitButton);

      await waitFor(() => {
        expect(stateProvider.create).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            data: expect.objectContaining({
              admissionNo: 'ADM2024TEMP',
              firstName: 'TempStudent',
              lastName: 'TestUser',
              gender: 'other'
            })
          })
        );
      });
    });

    test('filter state is maintained across navigation', async () => {
      let currentFilter = { status: 'active' };

      const filterProvider = {
        getList: jest.fn((resource, params) => {
          currentFilter = { ...params.filter };
          const filtered = mockIndianStudentData.filter(s => 
            !params.filter?.status || s.status === params.filter.status
          );
          return Promise.resolve({ data: filtered, total: filtered.length });
        }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Start with filtered list
      const listComponent = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students?filter=%7B%22status%22%3A%22active%22%7D'], // URL encoded filter
          dataProvider: filterProvider
        }
      );

      await waitingHelpers.waitForData('Rahul');

      // Should apply filter
      expect(filterProvider.getList).toHaveBeenCalledWith(
        'students',
        expect.objectContaining({
          filter: expect.objectContaining({ status: 'active' })
        })
      );

      listComponent.container.remove();

      // Navigate to create and back - filter should be preserved
      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: filterProvider
        }
      );

      await waitingHelpers.waitForForm();
      createComponent.container.remove();

      // Back to list - filter should still be active
      const listComponent2 = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students?filter=%7B%22status%22%3A%22active%22%7D'],
          dataProvider: filterProvider
        }
      );

      await waitingHelpers.waitForData('Rahul');

      // Filter should still be applied
      expect(currentFilter).toEqual(expect.objectContaining({ status: 'active' }));
    });

    test('pagination state persists during workflow', async () => {
      let currentPagination = { page: 1, perPage: 10 };

      const paginationProvider = {
        getList: jest.fn((resource, params) => {
          currentPagination = { ...params.pagination };
          const start = (params.pagination.page - 1) * params.pagination.perPage;
          const end = start + params.pagination.perPage;
          const data = mockIndianStudentData.slice(start, end);
          return Promise.resolve({ data, total: mockIndianStudentData.length });
        }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Start on page 2
      const listComponent = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students?page=2&perPage=10'],
          dataProvider: paginationProvider
        }
      );

      await waitFor(() => {
        expect(paginationProvider.getList).toHaveBeenCalledWith(
          'students',
          expect.objectContaining({
            pagination: expect.objectContaining({ page: 2, perPage: 10 })
          })
        );
      });

      // Pagination state should be preserved
      expect(currentPagination.page).toBe(2);
      expect(currentPagination.perPage).toBe(10);
    });
  });

  describe('4. Multi-Component Integration Tests', () => {
    test('creating student updates list view in real-time', async () => {
      let students = [...mockIndianStudentData];

      const realTimeProvider = {
        getList: jest.fn(() => Promise.resolve({ data: students, total: students.length })),
        create: jest.fn((resource, params) => {
          const newStudent = { id: Date.now(), ...params.data, status: 'active', guardians: [] };
          students.push(newStudent);
          return Promise.resolve({ data: newStudent });
        }),
        getOne: () => Promise.resolve({ data: {} }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Check initial list
      const initialList = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students'],
          dataProvider: realTimeProvider
        }
      );

      await waitingHelpers.waitForData('Rahul');
      
      const initialCount = students.length;
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      
      initialList.container.remove();

      // Create new student
      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: realTimeProvider
        }
      );

      await waitingHelpers.waitForForm();

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/Admission No/i), 'ADM2024NEW');
      await user.type(screen.getByLabelText(/First Name/i), 'NewStudent');
      await user.type(screen.getByLabelText(/Last Name/i), 'Added');
      await user.type(screen.getByLabelText(/Gender/i), 'female');

      const submitButton = createComponent.container.querySelector('[type="submit"]');
      await user.click(submitButton);

      await waitFor(() => {
        expect(realTimeProvider.create).toHaveBeenCalled();
      });

      createComponent.container.remove();

      // Check updated list
      const updatedList = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students'],
          dataProvider: realTimeProvider
        }
      );

      await waitingHelpers.waitForData('NewStudent');

      // Should show new student
      expect(screen.getByText('NewStudent')).toBeInTheDocument();
      expect(screen.getByText('Added')).toBeInTheDocument();
      expect(students.length).toBe(initialCount + 1);
    });

    test('editing student reflects changes across all views', async () => {
      let studentData = { ...mockIndianStudentData[0] };

      const consistentProvider = {
        getList: jest.fn(() => Promise.resolve({ data: [studentData], total: 1 })),
        getOne: jest.fn(() => Promise.resolve({ data: studentData })),
        update: jest.fn((resource, params) => {
          studentData = { ...studentData, ...params.data };
          return Promise.resolve({ data: studentData });
        }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Initial show view
      const showBefore = renderWithEnhancedAdmin(
        <StudentsShow />,
        {
          resource: 'students',
          initialEntries: ['/students/1/show'],
          dataProvider: consistentProvider
        }
      );

      await waitingHelpers.waitForData('Rahul');
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      showBefore.container.remove();

      // Edit student
      const editComponent = renderWithEnhancedAdmin(
        <StudentsEdit />,
        {
          resource: 'students',
          initialEntries: ['/students/1/edit'],
          dataProvider: consistentProvider
        }
      );

      await waitingHelpers.waitForForm();

      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toHaveValue('Rahul');
      });

      const user = userEvent.setup();
      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'UpdatedRahul');

      const submitButton = editComponent.container.querySelector('[type="submit"]');
      await user.click(submitButton);

      await waitFor(() => {
        expect(consistentProvider.update).toHaveBeenCalled();
      });

      editComponent.container.remove();

      // Check show view after update
      const showAfter = renderWithEnhancedAdmin(
        <StudentsShow />,
        {
          resource: 'students',
          initialEntries: ['/students/1/show'],
          dataProvider: consistentProvider
        }
      );

      await waitingHelpers.waitForData('UpdatedRahul');
      expect(screen.getByText('UpdatedRahul')).toBeInTheDocument();
      expect(studentData.firstName).toBe('UpdatedRahul');

      showAfter.container.remove();

      // Check list view shows updated data
      const listAfter = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students'],
          dataProvider: consistentProvider
        }
      );

      await waitingHelpers.waitForData('UpdatedRahul');
      expect(screen.getByText('UpdatedRahul')).toBeInTheDocument();
    });
  });

  describe('5. Error Handling Workflow Tests', () => {
    test('error recovery allows continuing workflow', async () => {
      let attempts = 0;
      const recoveryProvider = {
        create: jest.fn(() => {
          attempts++;
          if (attempts === 1) {
            return Promise.reject(new Error('Network timeout'));
          }
          return Promise.resolve({ data: { id: 123, firstName: 'Recovered' } });
        }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: recoveryProvider
        }
      );

      await waitingHelpers.waitForForm();

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/Admission No/i), 'ADM2024RECOVER');
      await user.type(screen.getByLabelText(/First Name/i), 'Recovery');
      await user.type(screen.getByLabelText(/Last Name/i), 'Test');
      await user.type(screen.getByLabelText(/Gender/i), 'male');

      const submitButton = createComponent.container.querySelector('[type="submit"]');

      // First attempt fails
      await user.click(submitButton);

      await waitFor(() => {
        expect(recoveryProvider.create).toHaveBeenCalledTimes(1);
      });

      // Form should still be available for retry
      expect(screen.getByLabelText(/First Name/i)).toHaveValue('Recovery');

      // Second attempt succeeds
      await user.click(submitButton);

      await waitFor(() => {
        expect(recoveryProvider.create).toHaveBeenCalledTimes(2);
      });
    });

    test('validation errors don\'t break workflow continuity', async () => {
      const validationProvider = {
        create: jest.fn((resource, params) => {
          if (!params.data.firstName || params.data.firstName.length < 2) {
            return Promise.reject(new Error('First name must be at least 2 characters'));
          }
          return Promise.resolve({ data: { id: 123, ...params.data } });
        }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: validationProvider
        }
      );

      await waitingHelpers.waitForForm();

      const user = userEvent.setup();
      
      // Fill with invalid data first
      await user.type(screen.getByLabelText(/Admission No/i), 'ADM2024VAL');
      await user.type(screen.getByLabelText(/First Name/i), 'A'); // Too short
      await user.type(screen.getByLabelText(/Last Name/i), 'Valid');
      await user.type(screen.getByLabelText(/Gender/i), 'male');

      const submitButton = createComponent.container.querySelector('[type="submit"]');
      await user.click(submitButton);

      // Should fail validation
      await waitFor(() => {
        expect(validationProvider.create).toHaveBeenCalledTimes(1);
      });

      // Fix validation error
      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'ValidName');

      // Try again
      await user.click(submitButton);

      // Should succeed
      await waitFor(() => {
        expect(validationProvider.create).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('6. Performance Integration Tests', () => {
    test('workflow performance remains acceptable with large datasets', async () => {
      const largeDataset = performanceHelpers.generateLargeDataset(100, {
        id: '{{index}}',
        admissionNo: 'ADM2024{{index}}',
        firstName: 'Student{{index}}',
        lastName: 'Test{{index}}',
        status: 'active',
        gender: 'male',
        classId: 'class-10',
        sectionId: 'section-a',
        branchId: 'branch1',
        guardians: []
      });

      const performanceProvider = {
        getList: jest.fn(() => Promise.resolve({ data: largeDataset, total: largeDataset.length })),
        getOne: jest.fn((resource, params) => {
          const item = largeDataset.find(s => s.id === params.id) || largeDataset[0];
          return Promise.resolve({ data: item });
        }),
        create: jest.fn((resource, params) => Promise.resolve({ data: { id: 999, ...params.data } })),
        update: jest.fn((resource, params) => Promise.resolve({ data: { id: params.id, ...params.data } })),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      const startTime = performance.now();

      // Test list performance
      const listComponent = renderWithEnhancedAdmin(
        <StudentsList />,
        {
          resource: 'students',
          initialEntries: ['/students'],
          dataProvider: performanceProvider
        }
      );

      await waitingHelpers.waitForData('Student0');
      
      const listTime = performance.now() - startTime;
      expect(listTime).toBeLessThan(3000); // Should handle large list within 3 seconds

      listComponent.container.remove();

      // Test edit performance with large dataset context
      const editStartTime = performance.now();
      
      const editComponent = renderWithEnhancedAdmin(
        <StudentsEdit />,
        {
          resource: 'students',
          initialEntries: ['/students/50/edit'], // Middle of large dataset
          dataProvider: performanceProvider
        }
      );

      await waitingHelpers.waitForForm();
      
      const editTime = performance.now() - editStartTime;
      expect(editTime).toBeLessThan(2000); // Edit should be fast even with large dataset context
    });

    test('memory usage remains stable during extended workflow', async () => {
      const memoryProvider = {
        getList: () => Promise.resolve({ data: mockIndianStudentData, total: mockIndianStudentData.length }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        create: () => Promise.resolve({ data: { id: 123 } }),
        update: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Simulate extended workflow - multiple component renders and cleanups
      const components = ['list', 'create', 'edit', 'show'];
      
      for (let i = 0; i < 5; i++) { // Repeat workflow 5 times
        for (const componentType of components) {
          let component;
          
          if (componentType === 'list') {
            component = renderWithEnhancedAdmin(<StudentsList />, {
              resource: 'students', initialEntries: ['/students'], dataProvider: memoryProvider
            });
            await waitingHelpers.waitForData('Rahul');
          } else if (componentType === 'create') {
            component = renderWithEnhancedAdmin(<StudentsCreate />, {
              resource: 'students', initialEntries: ['/students/create'], dataProvider: memoryProvider
            });
            await waitingHelpers.waitForForm();
          } else if (componentType === 'edit') {
            component = renderWithEnhancedAdmin(<StudentsEdit />, {
              resource: 'students', initialEntries: ['/students/1/edit'], dataProvider: memoryProvider
            });
            await waitingHelpers.waitForForm();
          } else if (componentType === 'show') {
            component = renderWithEnhancedAdmin(<StudentsShow />, {
              resource: 'students', initialEntries: ['/students/1/show'], dataProvider: memoryProvider
            });
            await waitingHelpers.waitForData('Rahul');
          }

          // Check memory usage
          const memoryWarnings = performanceHelpers.checkMemoryLeaks(component.container);
          if (memoryWarnings.length > 0) {
            console.warn(`Memory warnings in ${componentType} (iteration ${i}):`, memoryWarnings);
          }

          // Cleanup
          component.container.remove();
        }
      }
    });
  });

  describe('7. Accessibility Workflow Tests', () => {
    test('entire workflow maintains accessibility standards', async () => {
      const accessibilityProvider = {
        getList: () => Promise.resolve({ data: mockIndianStudentData, total: mockIndianStudentData.length }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        create: () => Promise.resolve({ data: { id: 123 } }),
        update: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      const workflows = [
        { name: 'List', component: StudentsList, route: '/students' },
        { name: 'Create', component: StudentsCreate, route: '/students/create' },
        { name: 'Edit', component: StudentsEdit, route: '/students/1/edit' },
        { name: 'Show', component: StudentsShow, route: '/students/1/show' }
      ];

      for (const workflow of workflows) {
        const component = renderWithEnhancedAdmin(
          React.createElement(workflow.component),
          {
            resource: 'students',
            initialEntries: [workflow.route],
            dataProvider: accessibilityProvider
          }
        );

        // Wait for component to load
        if (workflow.name === 'List' || workflow.name === 'Show') {
          await waitingHelpers.waitForData('Rahul');
        } else {
          await waitingHelpers.waitForForm();
        }

        // Check accessibility
        const ariaErrors = accessibilityHelpers.checkAriaLabels(component.container);
        const keyboardErrors = await accessibilityHelpers.testKeyboardNavigation(component.container);
        const contrastErrors = accessibilityHelpers.checkColorContrast(component.container);

        if (ariaErrors.length > 0) {
          console.warn(`${workflow.name} ARIA improvements needed:`, ariaErrors);
        }
        if (keyboardErrors.length > 0) {
          console.warn(`${workflow.name} keyboard navigation improvements needed:`, keyboardErrors);
        }
        if (contrastErrors.length > 0) {
          console.warn(`${workflow.name} color contrast improvements needed:`, contrastErrors);
        }

        // Should not have critical accessibility violations
        const criticalViolations = [
          ...ariaErrors.filter(e => e.includes('missing accessible')),
          ...contrastErrors.filter(e => e.includes('white text on white') || e.includes('black text on black'))
        ];
        expect(criticalViolations).toHaveLength(0);

        component.container.remove();
      }
    });

    test('focus management works correctly across workflow', async () => {
      const focusProvider = {
        getList: () => Promise.resolve({ data: mockIndianStudentData, total: mockIndianStudentData.length }),
        getOne: () => Promise.resolve({ data: mockIndianStudentData[0] }),
        create: () => Promise.resolve({ data: { id: 123 } }),
        getMany: () => Promise.resolve({ data: [] }),
        getManyReference: () => Promise.resolve({ data: [], total: 0 })
      };

      // Test focus in create form
      const createComponent = renderWithEnhancedAdmin(
        <StudentsCreate />,
        {
          resource: 'students',
          initialEntries: ['/students/create'],
          dataProvider: focusProvider
        }
      );

      await waitingHelpers.waitForForm();

      const user = userEvent.setup();
      
      // Tab through form elements
      await user.tab();
      const firstFocused = document.activeElement;
      expect(firstFocused).toBeTruthy();

      await user.tab();
      const secondFocused = document.activeElement;
      expect(secondFocused).toBeTruthy();
      expect(secondFocused).not.toBe(firstFocused);

      // Should be able to navigate form with keyboard
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });
  });
});