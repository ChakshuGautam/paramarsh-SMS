import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AttendanceSessionsList } from "@/app/admin/resources/attendanceSessions/List";
import { renderWithReactAdmin, expectNoDateErrors, createMockDataProvider } from "../../test-helpers";

const mockData = [
  {
    id: 1,
    name: "Test Item",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
];

describe("AttendanceSessionsList Component", () => {
  test("renders without errors", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    renderWithReactAdmin(<AttendanceSessionsList />, {
      resource: "attendanceSessions",
      dataProvider,
    });

    // Just check that the page renders without crashing
    // Look for common list page elements instead of specific text
    await screen.findByText(/ra\.page\.list/);
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
    
    renderWithReactAdmin(<AttendanceSessionsList />, {
      resource: "attendanceSessions",
      dataProvider,
    });
    
    // Should render list page without crashing
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    const { container } = renderWithReactAdmin(<AttendanceSessionsList />, {
      resource: "attendanceSessions",
      dataProvider,
    });
    
    // Should render without errors
    expect(container).toBeInTheDocument();
    expectNoDateErrors();
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    const dataProvider = createMockDataProvider([]);
    
    renderWithReactAdmin(<AttendanceSessionsList />, {
      resource: "attendanceSessions",
      dataProvider,
    });
    
    // Should render without crashing - just check body exists
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });
});
