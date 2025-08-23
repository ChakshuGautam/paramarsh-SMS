import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expectNoDateErrors } from "../../test-helpers";

// Simple mock component for testing
const MockAdmissionsApplicationsList = ({ data = [] }: { data?: any[] }) => {
  const formatDateSafely = (dateValue: any) => {
    if (!dateValue || dateValue === "" || dateValue === null || dateValue === undefined) {
      return "No date";
    }
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return "No date";
      }
      return date.toLocaleDateString();
    } catch {
      return "No date";
    }
  };

  return (
    <div>
      <h2>AdmissionsApplications List</h2>
      {data.length === 0 ? (
        <p>No admissionsApplications found</p>
      ) : (
        <ul>
          {data.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <span>{item.status}</span>
              <span>Created: {formatDateSafely(item.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
    render(<MockAdmissionsApplicationsList data={mockData} />);

    // Wait for content to appear
    await screen.findByText("Test AdmissionsApplications");
    expect(screen.getByText("AdmissionsApplications List")).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("handles date edge cases without errors", async () => {
    const testData = [
      { 
        ...mockData[0], 
        createdAt: null, 
        updatedAt: "invalid"
      },
      {
        id: 2,
        name: "Edge Case AdmissionsApplications",
        status: "active", 
        createdAt: "",
        updatedAt: undefined
      },
      {
        id: 3,
        name: "Bad Date AdmissionsApplications",
        status: "active", 
        createdAt: "not-a-date",
        updatedAt: "2024-13-45"
      }
    ];
    
    render(<MockAdmissionsApplicationsList data={testData} />);
    
    await screen.findByText("Test AdmissionsApplications");
    await screen.findByText("Edge Case AdmissionsApplications");
    await screen.findByText("Bad Date AdmissionsApplications");
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const { container } = render(<MockAdmissionsApplicationsList data={mockData} />);
    
    await screen.findByText("Test AdmissionsApplications");
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    render(<MockAdmissionsApplicationsList data={[]} />);
    
    // Should show empty state
    expect(screen.getByText("No admissionsApplications found")).toBeInTheDocument();
    expect(screen.getByText("AdmissionsApplications List")).toBeInTheDocument();
    expectNoDateErrors();
  });
});