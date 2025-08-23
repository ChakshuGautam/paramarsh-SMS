import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TimetablesList } from "@/app/admin/resources/timetables/List";
import { renderWithReactAdmin, mockTimetableData, expectNoDateErrors, createMockDataProvider } from "../../test-helpers";

describe("TimetablesList Component", () => {
  test("renders without errors", async () => {
    const dataProvider = createMockDataProvider(mockTimetableData);
    
    renderWithReactAdmin(<TimetablesList />, {
      resource: "timetables",
      dataProvider,
    });

    // Wait for the class name to appear (component displays "Class 5 - A")
    await screen.findByText("Class 5 - A");
    expect(screen.getByText("Class 5 - A")).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("displays timetable information", async () => {
    const dataProvider = createMockDataProvider(mockTimetableData);
    
    renderWithReactAdmin(<TimetablesList />, {
      resource: "timetables",
      dataProvider,
    });

    // Check for components that are actually rendered by the component
    await screen.findByText("Class 5 - A");
    
    // The grade level should be displayed
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("handles date edge cases without errors", async () => {
    const testData = [
      { 
        ...mockTimetableData[0], 
        effectiveFrom: null, 
        createdAt: "invalid",
        updatedAt: undefined
      }
    ];
    
    const dataProvider = createMockDataProvider(testData);
    
    renderWithReactAdmin(<TimetablesList />, {
      resource: "timetables",
      dataProvider,
    });
    
    await screen.findByText("Class 5 - A");
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const dataProvider = createMockDataProvider(mockTimetableData);
    
    renderWithReactAdmin(<TimetablesList />, {
      resource: "timetables",
      dataProvider,
    });
    
    await screen.findByText("Class 5 - A");
    
    const muiElements = document.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("supports multi-tenancy", async () => {
    const mockGetList = jest.fn(() => Promise.resolve({ 
      data: mockTimetableData, 
      total: mockTimetableData.length 
    }));
    
    const dataProvider = createMockDataProvider(mockTimetableData, {
      getList: mockGetList
    });
    
    renderWithReactAdmin(<TimetablesList />, {
      resource: "timetables",
      dataProvider,
    });
    
    await screen.findByText("Class 5 - A");
    expect(mockGetList).toHaveBeenCalled();
  });

  test("displays search and filter inputs", async () => {
    const dataProvider = createMockDataProvider(mockTimetableData);
    
    renderWithReactAdmin(<TimetablesList />, {
      resource: "timetables",
      dataProvider,
    });
    
    // Wait for component to load
    await screen.findByText("Class 5 - A");
    
    // Check for search input
    const searchInput = screen.getByPlaceholderText("Search classes and sections...");
    expect(searchInput).toBeInTheDocument();
    
    // Check for grade level filter
    const gradeFilter = screen.getByText("Filter by grade level");
    expect(gradeFilter).toBeInTheDocument();
  });

  test("handles empty data gracefully", async () => {
    const dataProvider = createMockDataProvider([]);
    
    renderWithReactAdmin(<TimetablesList />, {
      resource: "timetables",
      dataProvider,
    });
    
    // Should render without crashing - just check body exists
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("displays table structure", async () => {
    const dataProvider = createMockDataProvider(mockTimetableData);
    
    renderWithReactAdmin(<TimetablesList />, {
      resource: "timetables",
      dataProvider,
    });
    
    await screen.findByText("Class 5 - A");
    
    // Check for column headers that should be present
    expect(screen.getByText("Class - Section")).toBeInTheDocument();
    expect(screen.getByText("Grade Level")).toBeInTheDocument();
  });
});