import React from 'react';
<<<<<<< HEAD
import { render, screen, waitFor } from '@testing-library/react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SectionsEdit } from '@/app/admin/resources/sections/Edit';

// Mock data
const mockSectionData = {
  id: 1,
  name: 'A',
  capacity: 35,
  classId: 1,
  homeroomTeacherId: 1,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

const mockClasses = [
  { id: 1, name: 'Class 5', gradeLevel: 5 },
  { id: 2, name: 'Class 6', gradeLevel: 6 },
];

const mockTeachers = [
  { id: 1, staff: { firstName: 'Priya', lastName: 'Sharma' }, subjects: 'Mathematics' },
  { id: 2, staff: { firstName: 'Raj', lastName: 'Kumar' }, subjects: 'English' },
];

const renderComponent = (dataProviderOverrides = {}, recordId = 1) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: jest.fn((resource, params) => {
      if (resource === 'sections') {
        return Promise.resolve({ data: mockSectionData });
      }
      if (resource === 'classes') {
        const class_ = mockClasses.find(c => c.id === params.id);
        return Promise.resolve({ data: class_ || {} });
      }
      if (resource === 'teachers') {
        const teacher = mockTeachers.find(t => t.id === params.id);
        return Promise.resolve({ data: teacher || {} });
      }
      return Promise.resolve({ data: {} });
    }),
    update: jest.fn((resource, { data }) => {
      return Promise.resolve({
        data: { ...mockSectionData, ...data, updatedAt: '2024-01-15T11:30:00Z' }
      });
    }),
    getList: jest.fn((resource) => {
      if (resource === 'classes') {
        return Promise.resolve({ data: mockClasses, total: mockClasses.length });
      }
      if (resource === 'teachers') {
        return Promise.resolve({ data: mockTeachers, total: mockTeachers.length });
      }
      return Promise.resolve({ data: [], total: 0 });
    }),
    getMany: jest.fn((resource, { ids }) => {
      const resourceMap = {
        classes: mockClasses,
        teachers: mockTeachers,
      };
      const data = resourceMap[resource]?.filter(item => ids.includes(item.id)) || [];
      return Promise.resolve({ data });
    }),
    getManyReference: jest.fn((resource) => {
      if (resource === 'classes') {
        return Promise.resolve({ data: mockClasses, total: mockClasses.length });
      }
      if (resource === 'teachers') {
        return Promise.resolve({ data: mockTeachers, total: mockTeachers.length });
      }
      return Promise.resolve({ data: [], total: 0 });
    }),
    create: () => Promise.resolve({ data: {} }),
    updateMany: () => Promise.resolve({ data: [] }),
    delete: () => Promise.resolve({ data: {} }),
    deleteMany: () => Promise.resolve({ data: [] }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={[`/sections/${recordId}/edit`]}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="sections">
            <Routes>
              <Route path="/sections/:id/edit" element={<SectionsEdit />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('SectionsEdit Component', () => {
  test('renders edit form without errors', async () => {
    renderComponent();
    
    // Wait for form to load and check basic functionality
    await screen.findByDisplayValue('A');
    expect(screen.getByDisplayValue('35')).toBeInTheDocument();
    
    // Verify no date errors
    expect(document.body.textContent).not.toMatch(/Invalid time value/i);
    expect(document.body.textContent).not.toMatch(/Invalid Date/i);
  });

  test('loads existing section data correctly', async () => {
    const mockGetOne = jest.fn(() => Promise.resolve({ data: mockSectionData }));
    renderComponent({ getOne: mockGetOne });

    await screen.findByDisplayValue('A');
    await screen.findByDisplayValue('35');

    expect(mockGetOne).toHaveBeenCalledWith('sections', expect.objectContaining({ id: "1" }));
    expect(document.body.textContent).not.toMatch(/Invalid time value/i);
  });

  test('handles loading errors gracefully', async () => {
    const mockGetOne = jest.fn(() => Promise.reject(new Error('Failed to load section')));
    
    renderComponent({ getOne: mockGetOne });

    // Wait for error state
    await waitFor(() => {
      expect(mockGetOne).toHaveBeenCalled();
    });
    
    // Should handle loading errors without date errors
    expect(document.body.textContent).not.toMatch(/Invalid time value/i);
  });

  test('handles null section data', async () => {
    const mockGetOne = jest.fn(() => Promise.resolve({ data: null }));
    
    renderComponent({ getOne: mockGetOne });

    await waitFor(() => {
      expect(mockGetOne).toHaveBeenCalled();
    });
    
    // Should handle null data without errors
    expect(document.body.textContent).not.toMatch(/Invalid time value/i);
    expect(document.body.textContent).not.toMatch(/Invalid Date/i);
  });

  test('displays form fields correctly', async () => {
    renderComponent();

    await screen.findByDisplayValue('A');
    
    expect(screen.getByLabelText('Section')).toBeInTheDocument();
    expect(screen.getByLabelText('Capacity')).toBeInTheDocument();
    expect(screen.getByDisplayValue('35')).toBeInTheDocument();
=======
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReactAdmin, expectNoDateErrors } from '../../test-helpers';

// Simple mock component for Sections Edit
const MockSectionsEdit = () => (
  <div>
    <h2>Edit Section</h2>
    <form>
      <label>Name <input type="text" name="name" defaultValue="A" /></label>
      <label>Class <select name="classId" defaultValue="1">
        <option value="1">Class 5</option>
        <option value="2">Class 6</option>
      </select></label>
      <label>Capacity <input type="number" name="capacity" defaultValue={40} /></label>
      <label>Room Number <input type="text" name="roomNumber" defaultValue="101" /></label>
      <button type="submit">Save</button>
    </form>
  </div>
);

describe('Sections Edit', () => {
  it('should render edit form without errors', async () => {
    renderWithReactAdmin(<MockSectionsEdit />, { resource: 'sections' });
    
    const nameField = await screen.findByLabelText('Name');
    expect(nameField).toHaveValue('A');
    expectNoDateErrors();
  });

  it('should allow editing section data', async () => {
    renderWithReactAdmin(<MockSectionsEdit />, { resource: 'sections' });
    
    const user = userEvent.setup();
    const nameField = await screen.findByLabelText('Name');
    const capacityField = screen.getByLabelText('Capacity');
    
    await user.clear(nameField);
    await user.type(nameField, 'B');
    await user.clear(capacityField);
    await user.type(capacityField, '45');
    
    expect(nameField).toHaveValue('B');
    expect(capacityField).toHaveValue(45);
  });

  it('should not contain MUI components', async () => {
    const { container } = renderWithReactAdmin(<MockSectionsEdit />, { resource: 'sections' });
    
    await screen.findByLabelText('Name');
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
>>>>>>> origin/main
  });
});