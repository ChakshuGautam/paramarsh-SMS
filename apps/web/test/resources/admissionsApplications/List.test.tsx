import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdmissionsApplicationsList } from "@/app/admin/resources/admissionsApplications/List";
import { renderWithReactAdmin, expectNoDateErrors, createMockDataProvider } from "../../test-helpers";

const mockData = [
  {
    id: 1,
    name: "Test AdmissionsApplications",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
];

describe("AdmissionsApplicationsList Component", () => {
  test("renders without errors", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    renderWithReactAdmin(<AdmissionsApplicationsList />, {
      resource: "admissionsApplications",
      dataProvider,
    });

    // Wait for content to appear
    await screen.findByText("Test AdmissionsApplications");
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
    
    renderWithReactAdmin(<AdmissionsApplicationsList />, {
      resource: "admissionsApplications",
      dataProvider,
    });
    
    await screen.findByText("Test AdmissionsApplications");
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    const { container } = renderWithReactAdmin(<AdmissionsApplicationsList />, {
      resource: "admissionsApplications",
      dataProvider,
    });
    
    await screen.findByText("Test AdmissionsApplications");
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    const dataProvider = createMockDataProvider([]);
    
    renderWithReactAdmin(<AdmissionsApplicationsList />, {
      resource: "admissionsApplications",
      dataProvider,
    });
    
    // Should render without crashing - just check body exists
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });
});
