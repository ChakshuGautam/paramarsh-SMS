import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { StudentsList } from '../../../app/admin/resources/students/List';

describe('StudentsList - Basic Test', () => {
  test('StudentsList renders with resource context', async () => {
    const dataProvider = testDataProvider({
      getList: () => Promise.resolve({ 
        data: [
          { id: 1, firstName: 'John', lastName: 'Doe', admissionNo: 'ADM001', status: 'active' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', admissionNo: 'ADM002', status: 'active' }
        ], 
        total: 2 
      })
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <ResourceContextProvider value="students">
          <StudentsList />
        </ResourceContextProvider>
      </AdminContext>
    );
    
    // Wait for data to load and render
    const john = await screen.findByText('John');
    expect(john).toBeInTheDocument();
    
    const jane = await screen.findByText('Jane');
    expect(jane).toBeInTheDocument();
  });

  test('StudentsList handles null and undefined dates without crashing', async () => {
    const dataProvider = testDataProvider({
      getList: () => Promise.resolve({ 
        data: [
          { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Doe', 
            admissionNo: 'ADM001', 
            status: 'active',
            createdAt: null,
            updatedAt: null,
            dateOfBirth: null
          },
          { 
            id: 2, 
            firstName: 'Jane', 
            lastName: 'Smith', 
            admissionNo: 'ADM002', 
            status: 'active',
            createdAt: undefined,
            updatedAt: undefined,
            dateOfBirth: undefined
          }
        ], 
        total: 2 
      })
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <ResourceContextProvider value="students">
          <StudentsList />
        </ResourceContextProvider>
      </AdminContext>
    );
    
    // Should render students without date errors
    const john = await screen.findByText('John');
    expect(john).toBeInTheDocument();
    
    const jane = await screen.findByText('Jane');
    expect(jane).toBeInTheDocument();
    
    // Should NOT show "Invalid time value" or "Invalid Date"
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('StudentsList displays guardian phone numbers', async () => {
    const dataProvider = testDataProvider({
      getList: () => Promise.resolve({ 
        data: [
          { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Doe', 
            admissionNo: 'ADM001', 
            status: 'active',
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
            admissionNo: 'ADM002', 
            status: 'active',
            guardians: []  // No guardian
          }
        ], 
        total: 2 
      })
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <ResourceContextProvider value="students">
          <StudentsList />
        </ResourceContextProvider>
      </AdminContext>
    );
    
    // Should render students
    const john = await screen.findByText('John');
    expect(john).toBeInTheDocument();
    
    // Should display guardian phone number
    const phoneNumber = await screen.findByText('+91-9876543210');
    expect(phoneNumber).toBeInTheDocument();
    
    // Should handle missing guardian gracefully (shows dash)
    const dashElement = screen.getByText('-');
    expect(dashElement).toBeInTheDocument();
  });

  test('StudentsList displays admission numbers and handles different statuses', async () => {
    const dataProvider = testDataProvider({
      getList: () => Promise.resolve({ 
        data: [
          { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Doe', 
            admissionNo: 'ADM2024001', 
            status: 'active',
            gender: 'male'
          },
          { 
            id: 2, 
            firstName: 'Jane', 
            lastName: 'Smith', 
            admissionNo: 'ADM2024002', 
            status: 'inactive',
            gender: 'female'
          },
          { 
            id: 3, 
            firstName: 'Bob', 
            lastName: 'Johnson', 
            admissionNo: 'ADM2024003', 
            status: 'graduated',
            gender: 'male'
          }
        ], 
        total: 3 
      })
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <ResourceContextProvider value="students">
          <StudentsList />
        </ResourceContextProvider>
      </AdminContext>
    );
    
    // Should display admission numbers
    const admission1 = await screen.findByText('ADM2024001');
    expect(admission1).toBeInTheDocument();
    
    const admission2 = await screen.findByText('ADM2024002');
    expect(admission2).toBeInTheDocument();
    
    const admission3 = await screen.findByText('ADM2024003');
    expect(admission3).toBeInTheDocument();
    
    // Should display gender
    const maleGender = await screen.findAllByText('male');
    expect(maleGender.length).toBeGreaterThan(0);
    
    const femaleGender = await screen.findByText('female');
    expect(femaleGender).toBeInTheDocument();
  });

  test('StudentsList displays class and section references', async () => {
    const dataProvider = testDataProvider({
      getList: () => Promise.resolve({ 
        data: [
          { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Doe', 
            admissionNo: 'ADM2024001', 
            status: 'active',
            classId: 'class-10',
            sectionId: 'section-a'
          }
        ], 
        total: 1 
      }),
      getMany: () => Promise.resolve({
        data: [
          { id: 'class-10', name: 'Class 10' },
          { id: 'section-a', name: 'Section A' }
        ]
      }),
      getOne: (resource, params) => {
        if (resource === 'classes' && params.id === 'class-10') {
          return Promise.resolve({ data: { id: 'class-10', name: 'Class 10' } });
        }
        if (resource === 'sections' && params.id === 'section-a') {
          return Promise.resolve({ data: { id: 'section-a', name: 'Section A' } });
        }
        return Promise.resolve({ data: {} });
      }
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <ResourceContextProvider value="students">
          <StudentsList />
        </ResourceContextProvider>
      </AdminContext>
    );
    
    // Should display student name
    const john = await screen.findByText('John');
    expect(john).toBeInTheDocument();
    
    // Should display class reference (ReferenceField will fetch and display)
    const className = await screen.findByText('Class 10');
    expect(className).toBeInTheDocument();
    
    // Should display section reference
    const sectionName = await screen.findByText('Section A');
    expect(sectionName).toBeInTheDocument();
  });

  test('StudentsList handles comprehensive edge cases without crashing', async () => {
    const dataProvider = testDataProvider({
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
            // Edge case: Invalid dates
            createdAt: 'invalid-date',
            updatedAt: '',
            dateOfBirth: 'not-a-date',
            // Edge case: Guardian with missing phone
            guardians: [
              {
                id: 'sg-1',
                isPrimary: true,
                relation: 'Mother',
                guardian: {
                  id: 'g-1',
                  phoneNumber: null,
                  alternatePhoneNumber: undefined
                }
              }
            ]
          },
          { 
            id: 2, 
            firstName: 'Jane', 
            lastName: null,  // Edge case: null last name
            admissionNo: '',  // Edge case: empty admission number
            status: undefined,  // Edge case: undefined status
            gender: null,  // Edge case: null gender
            classId: null,
            sectionId: undefined,
            createdAt: null,
            updatedAt: undefined,
            guardians: null  // Edge case: null guardians array
          },
          {
            id: 3,
            // Edge case: Student with minimal data
            firstName: 'Bob',
            lastName: 'Smith',
            admissionNo: 'ADM2024003',
            status: 'active'
            // All other fields missing
          }
        ], 
        total: 3 
      }),
      getOne: () => Promise.resolve({ data: { id: 'class-10', name: 'Class 10' } }),
      getMany: () => Promise.resolve({ data: [] })
    });

    // Should not throw any errors during render
    const { container } = render(
      <AdminContext dataProvider={dataProvider}>
        <ResourceContextProvider value="students">
          <StudentsList />
        </ResourceContextProvider>
      </AdminContext>
    );
    
    // Should still render the students that have valid data
    const john = await screen.findByText('John');
    expect(john).toBeInTheDocument();
    
    const bob = await screen.findByText('Bob');
    expect(bob).toBeInTheDocument();
    
    // Should NOT show date error messages
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
    
    // Should handle missing phone gracefully
    const noPhoneText = await screen.findByText('No phone');
    expect(noPhoneText).toBeInTheDocument();
    
    // Component should be in the DOM
    expect(container.querySelector('table, [role="table"], .list-page')).toBeTruthy();
  });
});