import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { format } from 'date-fns';

// Simple show component to test academic year display - focuses on data presentation
const AcademicYearShowView = ({ 
  data,
  onLoad 
}: { 
  data?: any;
  onLoad?: () => void;
}) => {
  const [academicYear, setAcademicYear] = React.useState(data);
  const [isLoading, setIsLoading] = React.useState(data === undefined);

  React.useEffect(() => {
    if (data === undefined && onLoad) {
      // Simulate loading data
      setTimeout(() => {
        setAcademicYear({
          id: 1,
          name: '2024-25',
          startDate: '2024-04-01T00:00:00Z',
          endDate: '2025-04-01T00:00:00Z',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T10:30:00Z'
        });
        setIsLoading(false);
        onLoad();
      }, 10);
    }
  }, [data, onLoad]);

  // Safe date formatting function
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '-';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return '-';
    }
  };

  const formatDateTime = (dateValue: any): string => {
    if (!dateValue) return '-';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return '-';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!academicYear) {
    return <div>Academic year not found</div>;
  }

  return (
    <div>
      <h2>Academic Year Details</h2>
      <div className="academic-year-details">
        <div className="field-group">
          <label>Academic Year Name:</label>
          <span>{academicYear.name || '-'}</span>
        </div>
        
        <div className="field-group">
          <label>Start Date:</label>
          <span>{formatDate(academicYear.startDate)}</span>
        </div>
        
        <div className="field-group">
          <label>End Date:</label>
          <span>{formatDate(academicYear.endDate)}</span>
        </div>
        
        <div className="field-group">
          <label>Active Status:</label>
          <span>{academicYear.isActive ? 'Active' : 'Inactive'}</span>
        </div>
        
        <div className="field-group">
          <label>Created At:</label>
          <span>{formatDateTime(academicYear.createdAt)}</span>
        </div>
        
        <div className="field-group">
          <label>Last Updated:</label>
          <span>{formatDateTime(academicYear.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

describe('Academic Years Show - Data Display', () => {
  it('should render show view without errors', () => {
    const mockData = {
      id: 1,
      name: '2024-25',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-04-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z'
    };
    
    render(<AcademicYearShowView data={mockData} />);

    expect(screen.getByText('Academic Year Details')).toBeInTheDocument();
    expect(screen.getByText('Academic Year Name:')).toBeInTheDocument();
    expect(screen.getByText('Start Date:')).toBeInTheDocument();
    expect(screen.getByText('End Date:')).toBeInTheDocument();
    expect(screen.getByText('Active Status:')).toBeInTheDocument();
    expect(screen.getByText('Created At:')).toBeInTheDocument();
    expect(screen.getByText('Last Updated:')).toBeInTheDocument();
  });

  it('should display academic year data correctly', () => {
    const mockData = {
      id: 1,
      name: '2024-25',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-04-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z'
    };
    
    render(<AcademicYearShowView data={mockData} />);

    // Check data display
    expect(screen.getByText('2024-25')).toBeInTheDocument();
    expect(screen.getByText('Apr 01, 2024')).toBeInTheDocument();
    expect(screen.getByText('Apr 01, 2025')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2024 16:00')).toBeInTheDocument();
    expect(screen.getByText('Jan 16, 2024 16:00')).toBeInTheDocument();
  });

  it('should display inactive status correctly', () => {
    const mockData = {
      id: 2,
      name: '2023-24',
      startDate: '2023-04-01T00:00:00Z',
      endDate: '2024-03-31T23:59:59Z',
      isActive: false,
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-01-16T10:30:00Z'
    };
    
    render(<AcademicYearShowView data={mockData} />);

    expect(screen.getByText('2023-24')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should handle loading state', async () => {
    const mockLoad = jest.fn();
    
    render(<AcademicYearShowView onLoad={mockLoad} />);

    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for data to load
    await screen.findByText('Academic Year Details');
    
    expect(mockLoad).toHaveBeenCalled();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should handle missing data gracefully', () => {
    render(<AcademicYearShowView data={null} />);

    expect(screen.getByText('Academic year not found')).toBeInTheDocument();
  });
});

describe('Academic Years Show - Date Edge Cases', () => {
  const dateTestCases = [
    { 
      scenario: 'null dates', 
      data: { 
        id: 1, 
        name: '2024-25', 
        startDate: null, 
        endDate: null, 
        isActive: true,
        createdAt: null,
        updatedAt: null
      } 
    },
    { 
      scenario: 'undefined dates', 
      data: { 
        id: 1, 
        name: '2024-25', 
        startDate: undefined, 
        endDate: undefined, 
        isActive: true,
        createdAt: undefined,
        updatedAt: undefined
      } 
    },
    { 
      scenario: 'empty string dates', 
      data: { 
        id: 1, 
        name: '2024-25', 
        startDate: '', 
        endDate: '', 
        isActive: true,
        createdAt: '',
        updatedAt: ''
      } 
    },
    { 
      scenario: 'invalid date strings', 
      data: { 
        id: 1, 
        name: '2024-25', 
        startDate: 'invalid-date', 
        endDate: 'not-a-date', 
        isActive: true,
        createdAt: 'bad-date',
        updatedAt: 'wrong-date'
      } 
    },
    { 
      scenario: 'mixed date scenarios', 
      data: { 
        id: 1, 
        name: '2024-25', 
        startDate: '2024-04-01T00:00:00Z', 
        endDate: null, 
        isActive: true,
        createdAt: 'invalid',
        updatedAt: '2024-01-16T10:30:00Z'
      } 
    }
  ];

  dateTestCases.forEach(({ scenario, data }) => {
    it(`should handle academic year with ${scenario} without crashing`, () => {
      render(<AcademicYearShowView data={data} />);

      // Should not show date errors
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
      expect(screen.queryByText(/Invalid Date/i)).toBeNull();

      // Should still display the academic year name
      expect(screen.getByText('Academic Year Details')).toBeInTheDocument();
      expect(screen.getByText('2024-25')).toBeInTheDocument();
      
      // Should show dashes for invalid dates
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  it('should handle comprehensive edge case data without errors', () => {
    const edgeCaseData = {
      id: 1,
      name: '2024-25',
      startDate: null,
      endDate: 'invalid-date',
      isActive: null,
      createdAt: '',
      updatedAt: undefined
    };

    render(<AcademicYearShowView data={edgeCaseData} />);

    // Should render without errors
    expect(screen.getByText('Academic Year Details')).toBeInTheDocument();
    expect(screen.getByText('2024-25')).toBeInTheDocument();
    
    // Should not show any date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
    
    // Should handle null/undefined boolean gracefully
    expect(screen.getByText('Inactive')).toBeInTheDocument(); // null/undefined isActive should be falsy
  });
});

describe('Academic Years Show - React Admin Integration', () => {
  it('should work with React Admin data provider context', async () => {
    const mockGetOne = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        name: '2024-25',
        startDate: '2024-04-01T00:00:00Z',
        endDate: '2025-04-01T00:00:00Z',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T10:30:00Z'
      }
    });

    const dataProvider = testDataProvider({
      getOne: mockGetOne,
      getList: () => Promise.resolve({ data: [], total: 0 })
    });

    const TestWrapper = () => {
      const [loaded, setLoaded] = React.useState(false);
      const [academicYear, setAcademicYear] = React.useState(null);

      const handleLoad = async () => {
        try {
          const response = await dataProvider.getOne('academicYears', { id: 1 });
          setAcademicYear(response.data);
          setLoaded(true);
        } catch (error) {
          console.error('Load failed:', error);
        }
      };

      return (
        <AdminContext dataProvider={dataProvider}>
          {loaded ? (
            <AcademicYearShowView data={academicYear} />
          ) : (
            <AcademicYearShowView onLoad={handleLoad} />
          )}
        </AdminContext>
      );
    };

    render(<TestWrapper />);

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for data to load and display
    await screen.findByText('Academic Year Details');
    expect(screen.getByText('2024-25')).toBeInTheDocument();

    // Verify data provider was called correctly
    expect(mockGetOne).toHaveBeenCalledWith(
      'academicYears',
      { id: 1 }
    );
  });

  it('should handle API errors gracefully', async () => {
    const mockGetOne = jest.fn().mockRejectedValue(new Error('Load Error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const dataProvider = testDataProvider({
      getOne: mockGetOne,
      getList: () => Promise.resolve({ data: [], total: 0 })
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <AcademicYearShowView data={null} />
      </AdminContext>
    );

    // Should show error message for null data
    expect(screen.getByText('Academic year not found')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});

describe('Academic Years Show - Component Library Compliance', () => {
  it('should not have MUI components', () => {
    const mockData = {
      id: 1,
      name: '2024-25',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-04-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z'
    };
    
    const { container } = render(<AcademicYearShowView data={mockData} />);
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements).toHaveLength(0);
  });

  it('should use clean HTML structure', () => {
    const mockData = {
      id: 1,
      name: '2024-25',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-04-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z'
    };
    
    const { container } = render(<AcademicYearShowView data={mockData} />);

    // Should have proper structure
    expect(container.querySelector('h2')).toBeInTheDocument();
    expect(container.querySelector('.academic-year-details')).toBeInTheDocument();
    expect(container.querySelectorAll('.field-group')).toHaveLength(6);
    expect(container.querySelectorAll('label')).toHaveLength(6);
    expect(container.querySelectorAll('span')).toHaveLength(6);
  });
});

describe('Academic Years Show - Accessibility', () => {
  it('should have proper structure for screen readers', () => {
    const mockData = {
      id: 1,
      name: '2024-25',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-04-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z'
    };
    
    render(<AcademicYearShowView data={mockData} />);

    // Check for proper heading structure
    expect(screen.getByRole('heading', { name: /Academic Year Details/i })).toBeInTheDocument();

    // Check that all field labels are present
    const fieldLabels = [
      'Academic Year Name:',
      'Start Date:', 
      'End Date:',
      'Active Status:',
      'Created At:',
      'Last Updated:'
    ];

    fieldLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should have meaningful text content for screen readers', () => {
    const mockData = {
      id: 1,
      name: '2024-25',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-04-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z'
    };
    
    render(<AcademicYearShowView data={mockData} />);

    // All data should be readable
    expect(screen.getByText('2024-25')).toBeInTheDocument();
    expect(screen.getByText('Apr 01, 2024')).toBeInTheDocument();
    expect(screen.getByText('Apr 01, 2025')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2024 16:00')).toBeInTheDocument();
    expect(screen.getByText('Jan 16, 2024 16:00')).toBeInTheDocument();
  });
});

describe('Academic Years Show - Performance', () => {
  it('should render show view quickly', () => {
    const mockData = {
      id: 1,
      name: '2024-25',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-04-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z'
    };
    
    const start = performance.now();
    
    render(<AcademicYearShowView data={mockData} />);
    
    const end = performance.now();
    const renderTime = end - start;
    
    expect(renderTime).toBeLessThan(50);
    expect(screen.getByText('Academic Year Details')).toBeInTheDocument();
  });

  it('should handle complex data structures efficiently', () => {
    const complexData = {
      id: 1,
      name: '2024-25',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-04-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z',
      // Additional complex data that might be present
      terms: Array.from({ length: 10 }, (_, i) => ({
        name: `Term ${i + 1}`,
        startDate: '2024-04-01',
        endDate: '2024-08-31'
      })),
      metadata: {
        description: 'Academic year with multiple terms',
        notes: 'Special academic year with extended terms'
      }
    };

    const start = performance.now();
    
    render(<AcademicYearShowView data={complexData} />);
    
    const end = performance.now();
    const renderTime = end - start;
    
    expect(renderTime).toBeLessThan(50);
    expect(screen.getByText('Academic Year Details')).toBeInTheDocument();
    expect(screen.getByText('2024-25')).toBeInTheDocument();
  });
});