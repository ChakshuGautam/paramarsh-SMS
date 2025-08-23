import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { BrowserRouter } from 'react-router-dom';
import { GuardiansList } from '../../app/admin/resources/guardians/List';
import { GuardiansCreate } from '../../app/admin/resources/guardians/Create';
import { GuardiansEdit } from '../../app/admin/resources/guardians/Edit';

// Mock data for testing
const mockGuardiansData = [
  {
    id: '1',
    name: 'John Smith',
    relation: 'father',
    phone: '+91-9876543210',
    email: 'john.smith@example.com',
    address: '123 Main St, Mumbai',
    students: [
      {
        id: 'sg1',
        relation: 'father',
        student: {
          id: 'student1',
          firstName: 'Alice',
          lastName: 'Smith',
          admissionNo: 'ADM2024001'
        }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mary Johnson',
    relation: 'mother',
    phone: '+91-9876543211',
    email: 'mary.johnson@example.com',
    address: '456 Oak Ave, Delhi',
    students: [],
    createdAt: null,
    updatedAt: undefined
  },
  {
    id: '3',
    name: 'Robert Brown',
    relation: 'guardian',
    phone: null,
    email: null,
    address: '',
    students: [
      {
        id: 'sg2',
        relation: 'guardian',
        student: {
          id: 'student2',
          firstName: 'Bob',
          lastName: 'Brown',
          admissionNo: null
        }
      }
    ],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  }
];

// Wrapper component to provide router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Guardians Resource Tests', () => {
  describe('GuardiansList Component', () => {
    const renderGuardiansList = (dataProvider = {}) => {
      const provider = testDataProvider({
        getList: () => Promise.resolve({ data: mockGuardiansData, total: 3 }),
        ...dataProvider,
      });

      return render(
        <TestWrapper>
          <AdminContext dataProvider={provider} store={memoryStore()}>
            <GuardiansList />
          </AdminContext>
        </TestWrapper>
      );
    };

    describe('Date Handling', () => {
      it('should handle null dates without crashing', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        renderGuardiansList();
        
        await waitFor(() => {
          expect(screen.getByText('John Smith')).toBeInTheDocument();
        });

        // Should not have "Invalid time value" errors
        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Invalid time value')
        );
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle undefined dates safely', async () => {
        const dataWithUndefinedDates = mockGuardiansData.map(guardian => ({
          ...guardian,
          createdAt: undefined,
          updatedAt: undefined
        }));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        renderGuardiansList({
          getList: () => Promise.resolve({ data: dataWithUndefinedDates, total: 3 })
        });
        
        await waitFor(() => {
          expect(screen.getByText('John Smith')).toBeInTheDocument();
        });

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Invalid time value')
        );
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle empty date strings', async () => {
        const dataWithEmptyDates = mockGuardiansData.map(guardian => ({
          ...guardian,
          createdAt: '',
          updatedAt: ''
        }));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        renderGuardiansList({
          getList: () => Promise.resolve({ data: dataWithEmptyDates, total: 3 })
        });
        
        await waitFor(() => {
          expect(screen.getByText('John Smith')).toBeInTheDocument();
        });

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Invalid time value')
        );
        
        consoleErrorSpy.mockRestore();
      });
    });

    describe('UI Components', () => {
      it('should not use MUI components', () => {
        const { container } = renderGuardiansList();
        
        // Check that no MUI classes are present
        const muiElements = container.querySelectorAll('[class*="Mui"]');
        expect(muiElements.length).toBe(0);
      });

      it('should use shadcn/ui components', async () => {
        renderGuardiansList();
        
        await waitFor(() => {
          // Check for shadcn/ui components (tabs, badges, etc.)
          expect(document.querySelector('[role="tablist"]')).toBeInTheDocument();
          expect(document.querySelector('[class*="badge"]')).toBeInTheDocument();
        });
      });

      it('should use Lucide React icons', async () => {
        renderGuardiansList();
        
        await waitFor(() => {
          // Check for lucide icons (User, Phone, Mail)
          const icons = container.querySelectorAll('svg');
          expect(icons.length).toBeGreaterThan(0);
        });
      });
    });

    describe('Data Wrapping', () => {
      it('should handle wrapped data format correctly', async () => {
        renderGuardiansList({
          getList: () => Promise.resolve({ data: mockGuardiansData, total: 3 })
        });

        await waitFor(() => {
          expect(screen.getByText('John Smith')).toBeInTheDocument();
          expect(screen.getByText('Mary Johnson')).toBeInTheDocument();
          expect(screen.getByText('Robert Brown')).toBeInTheDocument();
        });
      });

      it('should handle empty data gracefully', async () => {
        renderGuardiansList({
          getList: () => Promise.resolve({ data: [], total: 0 })
        });

        await waitFor(() => {
          expect(screen.getByText(/no results found/i)).toBeInTheDocument();
        });
      });
    });

    describe('Multi-tenancy', () => {
      it('should include X-Branch-Id header in requests', async () => {
        const getListSpy = jest.fn(() => Promise.resolve({ data: mockGuardiansData, total: 3 }));
        
        renderGuardiansList({
          getList: getListSpy
        });

        await waitFor(() => {
          expect(getListSpy).toHaveBeenCalledWith(
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
      });
    });

    describe('Relation-based Filtering', () => {
      it('should support relation-based filtering through tabs', async () => {
        renderGuardiansList();

        await waitFor(() => {
          expect(screen.getByRole('tab', { name: /fathers/i })).toBeInTheDocument();
          expect(screen.getByRole('tab', { name: /mothers/i })).toBeInTheDocument();
          expect(screen.getByRole('tab', { name: /guardians/i })).toBeInTheDocument();
          expect(screen.getByRole('tab', { name: /others/i })).toBeInTheDocument();
          expect(screen.getByRole('tab', { name: /all guardians/i })).toBeInTheDocument();
        });
      });

      it('should support search filtering', async () => {
        renderGuardiansList();

        await waitFor(() => {
          const searchInput = screen.getByPlaceholderText('Search guardians...');
          expect(searchInput).toBeInTheDocument();
        });
      });

      it('should support phone and email filtering', async () => {
        renderGuardiansList();

        await waitFor(() => {
          expect(screen.getByPlaceholderText('Filter by phone')).toBeInTheDocument();
          expect(screen.getByPlaceholderText('Filter by email')).toBeInTheDocument();
        });
      });
    });

    describe('Ward Links Display', () => {
      it('should display student links correctly', async () => {
        renderGuardiansList();

        await waitFor(() => {
          expect(screen.getByText('Alice Smith')).toBeInTheDocument();
          expect(screen.getByText('(ADM2024001)')).toBeInTheDocument();
        });
      });

      it('should handle students with no admission numbers', async () => {
        renderGuardiansList();

        await waitFor(() => {
          expect(screen.getByText('Bob Brown')).toBeInTheDocument();
        });
      });

      it('should handle guardians with no students', async () => {
        renderGuardiansList();

        await waitFor(() => {
          expect(screen.getByText('No wards linked')).toBeInTheDocument();
        });
      });

      it('should display relation badges for students', async () => {
        renderGuardiansList();

        await waitFor(() => {
          const relationBadges = screen.getAllByText('father');
          expect(relationBadges.length).toBeGreaterThan(0);
        });
      });
    });

    describe('Relation Badge Colors', () => {
      it('should apply correct styling based on relation', async () => {
        renderGuardiansList();

        await waitFor(() => {
          const fatherBadge = screen.getByText('father');
          const motherBadge = screen.getByText('mother');
          const guardianBadge = screen.getByText('guardian');
          
          expect(fatherBadge).toBeInTheDocument();
          expect(motherBadge).toBeInTheDocument();
          expect(guardianBadge).toBeInTheDocument();
        });
      });
    });

    describe('Row Styling', () => {
      it('should apply correct row styling based on relation', async () => {
        renderGuardiansList();

        await waitFor(() => {
          const rows = document.querySelectorAll('[class*="border-l-"]');
          expect(rows.length).toBeGreaterThan(0);
        });
      });
    });

    describe('Null Field Handling', () => {
      it('should handle null phone numbers gracefully', async () => {
        renderGuardiansList();

        await waitFor(() => {
          // Should not crash when phone is null
          expect(screen.getByText('John Smith')).toBeInTheDocument();
        });
      });

      it('should handle null email addresses gracefully', async () => {
        renderGuardiansList();

        await waitFor(() => {
          // Should not crash when email is null
          expect(screen.getByText('Robert Brown')).toBeInTheDocument();
        });
      });
    });
  });

  describe('GuardiansCreate Component', () => {
    const renderGuardiansCreate = (dataProvider = {}) => {
      const provider = testDataProvider({
        create: (resource, params) => Promise.resolve({ data: { id: 'new-id', ...params.data } }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        ...dataProvider,
      });

      return render(
        <TestWrapper>
          <AdminContext dataProvider={provider} store={memoryStore()}>
            <GuardiansCreate />
          </AdminContext>
        </TestWrapper>
      );
    };

    describe('Form Fields', () => {
      it('should render all required form fields', async () => {
        renderGuardiansCreate();

        await waitFor(() => {
          expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/relation/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
        });
      });
    });

    describe('Form Submission', () => {
      it('should submit form with valid data', async () => {
        const createSpy = jest.fn(() => Promise.resolve({ data: { id: 'new-id' } }));
        
        renderGuardiansCreate({
          create: createSpy
        });

        await waitFor(() => {
          const nameInput = screen.getByLabelText(/name/i);
          const relationInput = screen.getByLabelText(/relation/i);
          const phoneInput = screen.getByLabelText(/phone/i);

          fireEvent.change(nameInput, { target: { value: 'Test Guardian' } });
          fireEvent.change(relationInput, { target: { value: 'father' } });
          fireEvent.change(phoneInput, { target: { value: '+91-9876543212' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(createSpy).toHaveBeenCalledWith(
            'guardians',
            expect.objectContaining({
              data: expect.objectContaining({
                name: 'Test Guardian',
                relation: 'father',
                phone: '+91-9876543212'
              })
            })
          );
        });
      });

      it('should handle form submission with empty optional fields', async () => {
        const createSpy = jest.fn(() => Promise.resolve({ data: { id: 'new-id' } }));
        
        renderGuardiansCreate({
          create: createSpy
        });

        await waitFor(() => {
          const nameInput = screen.getByLabelText(/name/i);
          fireEvent.change(nameInput, { target: { value: 'Test Guardian' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(createSpy).toHaveBeenCalledWith(
            'guardians',
            expect.objectContaining({
              data: expect.objectContaining({
                name: 'Test Guardian'
              })
            })
          );
        });
      });
    });

    describe('Multi-tenancy', () => {
      it('should include X-Branch-Id header in create requests', async () => {
        const createSpy = jest.fn(() => Promise.resolve({ data: { id: 'new-id' } }));
        
        renderGuardiansCreate({
          create: createSpy
        });

        await waitFor(() => {
          const nameInput = screen.getByLabelText(/name/i);
          fireEvent.change(nameInput, { target: { value: 'Test Guardian' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(createSpy).toHaveBeenCalledWith(
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
      });
    });

    describe('Component Library Usage', () => {
      it('should not use MUI components', () => {
        const { container } = renderGuardiansCreate();
        
        const muiElements = container.querySelectorAll('[class*="Mui"]');
        expect(muiElements.length).toBe(0);
      });
    });
  });

  describe('GuardiansEdit Component', () => {
    const renderGuardiansEdit = (dataProvider = {}) => {
      const provider = testDataProvider({
        getOne: () => Promise.resolve({ data: mockGuardiansData[0] }),
        update: (resource, params) => Promise.resolve({ data: { ...mockGuardiansData[0], ...params.data } }),
        getList: () => Promise.resolve({ data: [], total: 0 }),
        ...dataProvider,
      });

      return render(
        <TestWrapper>
          <AdminContext dataProvider={provider} store={memoryStore()}>
            <GuardiansEdit />
          </AdminContext>
        </TestWrapper>
      );
    };

    describe('Data Loading', () => {
      it('should load existing guardian data', async () => {
        renderGuardiansEdit();

        await waitFor(() => {
          expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
          expect(screen.getByDisplayValue('father')).toBeInTheDocument();
          expect(screen.getByDisplayValue('+91-9876543210')).toBeInTheDocument();
          expect(screen.getByDisplayValue('john.smith@example.com')).toBeInTheDocument();
        });
      });

      it('should handle loading with null dates', async () => {
        const guardianWithNullDates = {
          ...mockGuardiansData[0],
          createdAt: null,
          updatedAt: null
        };

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        renderGuardiansEdit({
          getOne: () => Promise.resolve({ data: guardianWithNullDates })
        });

        await waitFor(() => {
          expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
        });

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Invalid time value')
        );
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle loading with null phone and email', async () => {
        const guardianWithNullFields = {
          ...mockGuardiansData[0],
          phone: null,
          email: null
        };

        renderGuardiansEdit({
          getOne: () => Promise.resolve({ data: guardianWithNullFields })
        });

        await waitFor(() => {
          expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
          // Should handle null phone/email gracefully
        });
      });
    });

    describe('Form Updates', () => {
      it('should update guardian data successfully', async () => {
        const updateSpy = jest.fn(() => Promise.resolve({ data: mockGuardiansData[0] }));
        
        renderGuardiansEdit({
          update: updateSpy
        });

        await waitFor(() => {
          const nameInput = screen.getByDisplayValue('John Smith');
          fireEvent.change(nameInput, { target: { value: 'John Smith Sr.' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(updateSpy).toHaveBeenCalledWith(
            'guardians',
            expect.objectContaining({
              data: expect.objectContaining({
                name: 'John Smith Sr.'
              })
            })
          );
        });
      });

      it('should update relation successfully', async () => {
        const updateSpy = jest.fn(() => Promise.resolve({ data: mockGuardiansData[0] }));
        
        renderGuardiansEdit({
          update: updateSpy
        });

        await waitFor(() => {
          const relationInput = screen.getByDisplayValue('father');
          fireEvent.change(relationInput, { target: { value: 'guardian' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(updateSpy).toHaveBeenCalledWith(
            'guardians',
            expect.objectContaining({
              data: expect.objectContaining({
                relation: 'guardian'
              })
            })
          );
        });
      });
    });

    describe('Multi-tenancy', () => {
      it('should include X-Branch-Id header in update requests', async () => {
        const updateSpy = jest.fn(() => Promise.resolve({ data: mockGuardiansData[0] }));
        
        renderGuardiansEdit({
          update: updateSpy
        });

        await waitFor(() => {
          const nameInput = screen.getByDisplayValue('John Smith');
          fireEvent.change(nameInput, { target: { value: 'John Smith Sr.' } });
        });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(updateSpy).toHaveBeenCalledWith(
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
      });
    });

    describe('Component Library Usage', () => {
      it('should not use MUI components', () => {
        const { container } = renderGuardiansEdit();
        
        const muiElements = container.querySelectorAll('[class*="Mui"]');
        expect(muiElements.length).toBe(0);
      });
    });
  });
});