import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { StudentsList } from '../../app/admin/resources/students/List';
import { StudentsCreate } from '../../app/admin/resources/students/Create';
import { StudentsEdit } from '../../app/admin/resources/students/Edit';

// Mock data for testing
const mockStudentData = [
  {
    id: '1',
    admissionNo: 'ADM2024001',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    status: 'active',
    classId: 'class-1',
    sectionId: 'section-1',
    guardians: [
      {
        id: 'guardian-1',
        isPrimary: true,
        relation: 'Father',
        guardian: {
          id: 'g1',
          phoneNumber: '+91-9876543210',
          alternatePhoneNumber: '+91-9876543211'
        }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '2',
    admissionNo: 'ADM2024002',
    firstName: 'Jane',
    lastName: 'Smith',
    gender: 'female',
    status: 'inactive',
    classId: 'class-2',
    sectionId: 'section-2',
    guardians: [
      {
        id: 'guardian-2',
        isPrimary: true,
        relation: 'Mother',
        guardian: {
          id: 'g2',
          phoneNumber: null,
          alternatePhoneNumber: undefined
        }
      }
    ],
    createdAt: null,
    updatedAt: undefined
  }
];

describe('Students Resource Tests', () => {
  describe('StudentsList Component', () => {
    const renderStudentsList = (dataProvider = {}) => {
      const provider = testDataProvider({
        getList: () => Promise.resolve({ data: mockStudentData, total: 2 }),
        ...dataProvider,
      });

      return render(
        <AdminContext dataProvider={provider} store={memoryStore()}>
          <StudentsList />
        </AdminContext>
      );
    };

    describe('Date Handling', () => {
      it('should handle null dates without crashing', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        renderStudentsList();
        
        await waitFor(() => {
          expect(screen.getByText('John')).toBeInTheDocument();
        });

        // Should not have "Invalid time value" errors
        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Invalid time value')
        );
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle undefined dates safely', async () => {
        const dataWithUndefinedDates = mockStudentData.map(student => ({
          ...student,
          createdAt: undefined,
          updatedAt: undefined
        }));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        renderStudentsList({
          getList: () => Promise.resolve({ data: dataWithUndefinedDates, total: 2 })
        });
        
        await waitFor(() => {
          expect(screen.getByText('John')).toBeInTheDocument();
        });

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Invalid time value')
        );
        
        consoleErrorSpy.mockRestore();
      });
    });

    describe('UI Components', () => {
      it('should not use MUI components', () => {
        const { container } = renderStudentsList();
        
        // Check that no MUI classes are present
        const muiElements = container.querySelectorAll('[class*="Mui"]');
        expect(muiElements.length).toBe(0);
        
        // Check that no @mui imports are in the source
        expect(require('fs').readFileSync('../../app/admin/resources/students/List.tsx', 'utf8'))
          .not.toMatch(/@mui\/[material|lab|icons-material]/);
      });

      it('should use shadcn/ui components', async () => {
        renderStudentsList();
        
        await waitFor(() => {
          // Check for shadcn/ui components (tabs, badges, etc.)
          expect(document.querySelector('[role="tablist"]')).toBeInTheDocument();
        });
      });
    });

    describe('Data Wrapping', () => {
      it('should handle wrapped data format correctly', async () => {
        renderStudentsList({
          getList: () => Promise.resolve({ data: mockStudentData, total: 2 })
        });

        await waitFor(() => {
          expect(screen.getByText('John')).toBeInTheDocument();
          expect(screen.getByText('Jane')).toBeInTheDocument();
        });
      });

      it('should handle empty data gracefully', async () => {
        renderStudentsList({
          getList: () => Promise.resolve({ data: [], total: 0 })
        });

        await waitFor(() => {
          expect(screen.getByText(/no results found/i)).toBeInTheDocument();
        });
      });
    });

    describe('Multi-tenancy', () => {
      it('should include X-Branch-Id header in requests', async () => {
        const getListSpy = jest.fn(() => Promise.resolve({ data: mockStudentData, total: 2 }));
        
        renderStudentsList({
          getList: getListSpy
        });

        await waitFor(() => {
          expect(getListSpy).toHaveBeenCalledWith(
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

    describe('Filtering and Sorting', () => {
      it('should support status-based filtering through tabs', async () => {
        renderStudentsList();

        await waitFor(() => {
          expect(screen.getByRole('tab', { name: /active/i })).toBeInTheDocument();
          expect(screen.getByRole('tab', { name: /inactive/i })).toBeInTheDocument();
          expect(screen.getByRole('tab', { name: /graduated/i })).toBeInTheDocument();
        });
      });

      it('should support search filtering', async () => {
        renderStudentsList();

        await waitFor(() => {
          const searchInput = screen.getByPlaceholderText('Search students...');
          expect(searchInput).toBeInTheDocument();
        });
      });

      it('should support class and section filtering', async () => {
        renderStudentsList();

        await waitFor(() => {
          expect(screen.getByText(/filter by class/i)).toBeInTheDocument();
          expect(screen.getByText(/filter by section/i)).toBeInTheDocument();
        });
      });
    });

    describe('Guardian Phone Display', () => {
      it('should display guardian phone numbers correctly', async () => {
        renderStudentsList();

        await waitFor(() => {
          expect(screen.getByText('+91-9876543210')).toBeInTheDocument();
        });
      });

      it('should handle missing guardian phones gracefully', async () => {
        const studentsWithoutPhones = mockStudentData.map(student => ({
          ...student,
          guardians: [
            {
              ...student.guardians[0],
              guardian: {
                ...student.guardians[0].guardian,
                phoneNumber: null,
                alternatePhoneNumber: null
              }
            }
          ]
        }));

        renderStudentsList({
          getList: () => Promise.resolve({ data: studentsWithoutPhones, total: 2 })
        });

        await waitFor(() => {
          expect(screen.getByText('No phone')).toBeInTheDocument();
        });
      });

      it('should handle students with no guardians', async () => {
        const studentsWithoutGuardians = mockStudentData.map(student => ({
          ...student,
          guardians: []
        }));

        renderStudentsList({
          getList: () => Promise.resolve({ data: studentsWithoutGuardians, total: 2 })
        });

        await waitFor(() => {
          expect(screen.getAllByText('-').length).toBeGreaterThan(0);
        });
      });
    });

    describe('Row Styling', () => {
      it('should apply correct row styling based on status', async () => {
        renderStudentsList();

        await waitFor(() => {
          const rows = document.querySelectorAll('[class*="border-l-"]');
          expect(rows.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('StudentsCreate Component', () => {
    const renderStudentsCreate = (dataProvider = {}) => {
      const provider = testDataProvider({
        create: (resource, params) => Promise.resolve({ data: { id: 'new-id', ...params.data } }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        ...dataProvider,
      });

      return render(
        <AdminContext dataProvider={provider} store={memoryStore()}>
          <StudentsCreate />
        </AdminContext>
      );
    };

    describe('Form Fields', () => {
      it('should render all required form fields', async () => {
        renderStudentsCreate();

        await waitFor(() => {
          expect(screen.getByLabelText(/admission no/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
        });
      });
    });

    describe('Form Submission', () => {
      it('should submit form with valid data', async () => {
        const createSpy = jest.fn(() => Promise.resolve({ data: { id: 'new-id' } }));
        
        renderStudentsCreate({
          create: createSpy
        });

        await waitFor(() => {
          const admissionNoInput = screen.getByLabelText(/admission no/i);
          const firstNameInput = screen.getByLabelText(/first name/i);
          const lastNameInput = screen.getByLabelText(/last name/i);

          fireEvent.change(admissionNoInput, { target: { value: 'ADM2024003' } });
          fireEvent.change(firstNameInput, { target: { value: 'Test' } });
          fireEvent.change(lastNameInput, { target: { value: 'Student' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(createSpy).toHaveBeenCalledWith(
            'students',
            expect.objectContaining({
              data: expect.objectContaining({
                admissionNo: 'ADM2024003',
                firstName: 'Test',
                lastName: 'Student'
              })
            })
          );
        });
      });
    });

    describe('Multi-tenancy', () => {
      it('should include X-Branch-Id header in create requests', async () => {
        const createSpy = jest.fn(() => Promise.resolve({ data: { id: 'new-id' } }));
        
        renderStudentsCreate({
          create: createSpy
        });

        await waitFor(() => {
          const firstNameInput = screen.getByLabelText(/first name/i);
          fireEvent.change(firstNameInput, { target: { value: 'Test' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(createSpy).toHaveBeenCalledWith(
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

    describe('Component Library Usage', () => {
      it('should not use MUI components', () => {
        const { container } = renderStudentsCreate();
        
        const muiElements = container.querySelectorAll('[class*="Mui"]');
        expect(muiElements.length).toBe(0);
      });
    });
  });

  describe('StudentsEdit Component', () => {
    const renderStudentsEdit = (dataProvider = {}) => {
      const provider = testDataProvider({
        getOne: () => Promise.resolve({ data: mockStudentData[0] }),
        update: (resource, params) => Promise.resolve({ data: { ...mockStudentData[0], ...params.data } }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        ...dataProvider,
      });

      return render(
        <AdminContext dataProvider={provider} store={memoryStore()}>
          <StudentsEdit />
        </AdminContext>
      );
    };

    describe('Data Loading', () => {
      it('should load existing student data', async () => {
        renderStudentsEdit();

        await waitFor(() => {
          expect(screen.getByDisplayValue('ADM2024001')).toBeInTheDocument();
          expect(screen.getByDisplayValue('John')).toBeInTheDocument();
          expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        });
      });

      it('should handle loading with null dates', async () => {
        const studentWithNullDates = {
          ...mockStudentData[0],
          createdAt: null,
          updatedAt: null
        };

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        renderStudentsEdit({
          getOne: () => Promise.resolve({ data: studentWithNullDates })
        });

        await waitFor(() => {
          expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        });

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Invalid time value')
        );
        
        consoleErrorSpy.mockRestore();
      });
    });

    describe('Form Updates', () => {
      it('should update student data successfully', async () => {
        const updateSpy = jest.fn(() => Promise.resolve({ data: mockStudentData[0] }));
        
        renderStudentsEdit({
          update: updateSpy
        });

        await waitFor(() => {
          const firstNameInput = screen.getByDisplayValue('John');
          fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(updateSpy).toHaveBeenCalledWith(
            'students',
            expect.objectContaining({
              data: expect.objectContaining({
                firstName: 'Johnny'
              })
            })
          );
        });
      });
    });

    describe('Multi-tenancy', () => {
      it('should include X-Branch-Id header in update requests', async () => {
        const updateSpy = jest.fn(() => Promise.resolve({ data: mockStudentData[0] }));
        
        renderStudentsEdit({
          update: updateSpy
        });

        await waitFor(() => {
          const firstNameInput = screen.getByDisplayValue('John');
          fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(updateSpy).toHaveBeenCalledWith(
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

    describe('Component Library Usage', () => {
      it('should not use MUI components', () => {
        const { container } = renderStudentsEdit();
        
        const muiElements = container.querySelectorAll('[class*="Mui"]');
        expect(muiElements.length).toBe(0);
      });
    });
  });
});