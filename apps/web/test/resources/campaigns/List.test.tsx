import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CampaignsList } from "@/app/admin/resources/campaigns/List";
import { renderWithReactAdmin, expectNoDateErrors, createMockDataProvider } from "../../test-helpers";

const mockData = [
  {
    id: 1,
    name: "Test Campaigns",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
];

describe("CampaignsList Component", () => {
  test("renders without errors", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    renderWithReactAdmin(<CampaignsList />, {
      resource: "campaigns",
      dataProvider,
    });

    // Wait for content to appear
    await screen.findByText("Test Campaigns");
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
    
    renderWithReactAdmin(<CampaignsList />, {
      resource: "campaigns",
      dataProvider,
    });
    
    await screen.findByText("Test Campaigns");
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const dataProvider = createMockDataProvider(mockData);
    
    const { container } = renderWithReactAdmin(<CampaignsList />, {
      resource: "campaigns",
      dataProvider,
    });
    
    await screen.findByText("Test Campaigns");
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    const dataProvider = createMockDataProvider([]);
    
    renderWithReactAdmin(<CampaignsList />, {
      resource: "campaigns",
      dataProvider,
    });
    
    // Should render without crashing - just check body exists
    expect(document.body).toBeInTheDocument();
    expectNoDateErrors();
  });
});
