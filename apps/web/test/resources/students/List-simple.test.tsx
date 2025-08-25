import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore, ListContextProvider, useListContext } from 'react-admin';
import { format } from 'date-fns';

// Simple component to test date handling - MUST handle invalid dates safely
const StudentRow = ({ student }: { student: any }) => {
  let createdDate = '-';
  
  if (student.createdAt) {
    try {
      const date = new Date(student.createdAt);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        createdDate = format(date, 'dd/MM/yyyy');
      }
    } catch (error) {
      // Invalid date, show dash
      createdDate = '-';
    }
  }
  
  return (
    <tr>
      <td>{student.admissionNo}</td>
      <td>{student.firstName}</td>
      <td>{createdDate}</td>
    </tr>
  );
};

describe('Students List - Date Handling', () => {
  it('should handle null dates without crashing', () => {
    const studentWithNullDate = {
      id: 1,
      admissionNo: 'ADM001',
      firstName: 'John',
      createdAt: null
    };

    render(
      <table>
        <tbody>
          <StudentRow student={studentWithNullDate} />
        </tbody>
      </table>
    );

    // Should show dash for null date
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('should handle valid dates correctly', () => {
    const studentWithValidDate = {
      id: 1,
      admissionNo: 'ADM001',
      firstName: 'John',
      createdAt: '2024-01-15T10:30:00Z'
    };

    render(
      <table>
        <tbody>
          <StudentRow student={studentWithValidDate} />
        </tbody>
      </table>
    );

    // Should format date correctly
    expect(screen.getByText('15/01/2024')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('should NOT throw "Invalid time value" for edge cases', () => {
    const testCases = [
      { createdAt: null },
      { createdAt: undefined },
      { createdAt: '' },
      { createdAt: 'invalid' },
    ];

    testCases.forEach((testCase, index) => {
      const student = {
        id: index,
        admissionNo: `ADM00${index}`,
        firstName: `Student${index}`,
        ...testCase
      };

      // This should not throw
      const { container } = render(
        <table>
          <tbody>
            <StudentRow student={student} />
          </tbody>
        </table>
      );

      // Should render without errors
      expect(container.querySelector('tr')).toBeInTheDocument();
    });
  });
});

describe('Students List - React Admin Integration', () => {
  it('should work with React Admin context', async () => {
    const mockData = [
      { id: 1, admissionNo: 'ADM001', firstName: 'John', createdAt: null },
      { id: 2, admissionNo: 'ADM002', firstName: 'Jane', createdAt: '2024-01-15T10:30:00Z' }
    ];

    const dataProvider = testDataProvider({
      getList: () => Promise.resolve({ data: mockData, total: 2 })
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <ListContextProvider value={{
          data: mockData,
          total: 2,
          isLoading: false,
          resource: 'students',
          // @ts-ignore - simplified for testing
          refetch: jest.fn(),
        }}>
          <table>
            <tbody>
              {mockData.map(student => (
                <StudentRow key={student.id} student={student} />
              ))}
            </tbody>
          </table>
        </ListContextProvider>
      </AdminContext>
    );

    // Should render both students
    const john = await screen.findByText('John');
    const jane = await screen.findByText('Jane');
    
    expect(john).toBeInTheDocument();
    expect(jane).toBeInTheDocument();
    
    // Should handle null date
    expect(screen.getByText('-')).toBeInTheDocument();
    
    // Should format valid date
    expect(screen.getByText('15/01/2024')).toBeInTheDocument();
  });
});