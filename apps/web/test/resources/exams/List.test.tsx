<<<<<<< HEAD
import React from 'react';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { ExamsList } from '@/app/admin/resources/exams/List';

const mockExams = [
  {
    id: 1,
    name: 'Mathematics Unit Test 1',
    examType: 'UNIT_TEST',
    startDate: '2024-09-15T09:00:00.000Z',
    endDate: '2024-09-15T11:00:00.000Z',
    status: 'SCHEDULED',
    term: 1,
    weightagePercent: 10,
    maxMarks: 50,
    academicYearId: 1,
    branchId: 'dps-main'
  },
  {
    id: 2,
    name: 'Science Quarterly Exam',
    examType: 'QUARTERLY',
    startDate: '2024-08-20T09:00:00.000Z',
    endDate: '2024-08-22T11:00:00.000Z',
    status: 'COMPLETED',
    term: 2,
    weightagePercent: 30,
    maxMarks: 100,
    academicYearId: 1,
    branchId: 'dps-main'
  }
];

const mockAcademicYears = [
  {
    id: 1,
    name: '2024-25',
    isActive: true
  },
  {
    id: 2,
    name: '2023-24',
    isActive: false
  }
];

const renderExamsList = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getList: jest.fn((resource) => {
      const resources: Record<string, any> = {
        exams: { data: mockExams, total: mockExams.length },
        academicYears: { data: mockAcademicYears, total: mockAcademicYears.length },
      };
      return Promise.resolve(resources[resource] || { data: [], total: 0 });
    }),
    getMany: jest.fn((resource, { ids }) => {
      const resourceMap: Record<string, any> = {
        academicYears: mockAcademicYears,
      };
      const data = resourceMap[resource]?.filter((item: any) => ids.includes(item.id)) || [];
      return Promise.resolve({ data });
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="exams">
            <ExamsList />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('<ExamsList>', () => {
  test('renders exams list without date errors', async () => {
    renderExamsList();

    // Wait for the component to load and find exam data
    const exam1 = await screen.findByText('Mathematics Unit Test 1');
    expect(exam1).toBeInTheDocument();

    const exam2 = await screen.findByText('Science Quarterly Exam');
    expect(exam2).toBeInTheDocument();

    // Ensure no date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('displays exam types with badges', async () => {
    renderExamsList();

    // Check exam type badges are displayed
    const unitTestBadge = await screen.findByText('Unit Test');
    expect(unitTestBadge).toBeInTheDocument();

    const quarterlyBadge = await screen.findByText('Quarterly');
    expect(quarterlyBadge).toBeInTheDocument();
  });

  test('displays exam status badges', async () => {
    renderExamsList();

    // Check status badges
    const scheduledBadge = await screen.findByText('Scheduled');
    expect(scheduledBadge).toBeInTheDocument();

    // Use getAllByText since "Completed" appears in both tab and status badge
    const completedElements = await screen.findAllByText('Completed');
    expect(completedElements.length).toBeGreaterThan(0);
  });

  test('displays tab navigation for exam periods', async () => {
    renderExamsList();

    // Check all tabs are present - some may appear multiple times
    expect(await screen.findByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    
    // "Completed" appears in both tab and status badge
    const completedElements = screen.getAllByText('Completed');
    expect(completedElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('All Exams')).toBeInTheDocument();
  });

  test('displays exam details correctly', async () => {
    renderExamsList();

    // Check exam details
    await screen.findByText('Mathematics Unit Test 1');
    
    // Check term display
    const term1Badge = await screen.findByText('Term 1');
    expect(term1Badge).toBeInTheDocument();

    const term2Badge = await screen.findByText('Term 2');
    expect(term2Badge).toBeInTheDocument();

    // Check weightage display
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  test('handles exams with null dates safely', async () => {
    const nullDateExam = [
      {
        id: 1,
        name: 'Test Exam',
        examType: 'UNIT_TEST',
        startDate: null,
        endDate: null,
        status: 'SCHEDULED',
        term: 1,
        weightagePercent: null,
        maxMarks: null,
        academicYearId: 1,
        branchId: 'dps-main'
      }
    ];

    renderExamsList({
      getList: jest.fn((resource) => {
        const resources: Record<string, any> = {
          exams: { data: nullDateExam, total: 1 },
          academicYears: { data: mockAcademicYears, total: mockAcademicYears.length },
        };
        return Promise.resolve(resources[resource] || { data: [], total: 0 });
      }),
    });

    await screen.findByText('Test Exam');
    
    // Should not show any date errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test('handles exam with missing optional fields', async () => {
    const minimalExam = [
      {
        id: 1,
        name: 'Minimal Exam',
        examType: 'UNIT_TEST',
        startDate: '2024-09-15T09:00:00.000Z',
        endDate: '2024-09-15T11:00:00.000Z',
        status: 'SCHEDULED',
        academicYearId: 1,
        branchId: 'dps-main'
        // Missing term, weightagePercent, maxMarks
      }
    ];

    renderExamsList({
      getList: jest.fn((resource) => {
        const resources: Record<string, any> = {
          exams: { data: minimalExam, total: 1 },
          academicYears: { data: mockAcademicYears, total: mockAcademicYears.length },
        };
        return Promise.resolve(resources[resource] || { data: [], total: 0 });
      }),
    });

    await screen.findByText('Minimal Exam');
    
    // Should handle missing fields gracefully with dash placeholders
    expect(screen.getAllByText('-')).toHaveLength(2); // For term and weightage
  });

  test('renders basic structure successfully', async () => {
    renderExamsList();

    // Check that the component renders and loads exam data
    const exam1 = await screen.findByText('Mathematics Unit Test 1');
    expect(exam1).toBeInTheDocument();
    
    // Check that the component structure exists
    expect(document.body).toContainElement(exam1);
  });
});
=======
import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ExamsList } from "@/app/admin/resources/exams/List";
import { renderWithReactAdmin, expectNoDateErrors, createMockDataProvider } from "../../test-helpers";

const mockData = [
  {
    id: 1,
    name: "Test Exams",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
];

describe("ExamsList Component", () => {
  test("renders without errors", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    renderWithReactAdmin(<ExamsList />, {
      resource: "exams",
      dataProvider,
    });

    // Wait for content to appear
    await screen.findByText("Test Exams");
    expectNoDateErrors();
  });

  test("handles date edge cases without errors", async () => {
    const testData = [
      { 
        ...mockData[0], 
        createdAt: null, 
        updatedAt: "invalid"
      }
    ];
    
    const dataProvider = createMockDataProvider(testData);
    
    renderWithReactAdmin(<ExamsList />, {
      resource: "exams",
      dataProvider,
    });
    
    await screen.findByText("Test Exams");
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    const { container } = renderWithReactAdmin(<ExamsList />, {
      resource: "exams",
      dataProvider,
    });
    
    await screen.findByText("Test Exams");
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    const dataProvider = createMockDataProvider([]);
    
    renderWithReactAdmin(<ExamsList />, {
      resource: "exams",
      dataProvider,
    });
    
    // Should render without crashing - just check body exists
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });
});
>>>>>>> origin/main
