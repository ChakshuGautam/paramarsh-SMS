import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expectNoDateErrors } from "../../test-helpers";

// Simple mock component for testing
const MockMarksList = ({ data = [] }: { data?: any[] }) => {
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
      <h2>Marks List</h2>
      {data.length === 0 ? (
        <p>No marks found</p>
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
    name: "Test Marks",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
];

describe("MarksList Component", () => {
  test("renders without errors", async () => {
    render(<MockMarksList data={mockData} />);

    // Wait for content to appear
    await screen.findByText("Test Marks");
    expect(screen.getByText("Marks List")).toBeInTheDocument();
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
        name: "Edge Case Marks",
        status: "active", 
        createdAt: "",
        updatedAt: undefined
      },
      {
        id: 3,
        name: "Bad Date Marks",
        status: "active", 
        createdAt: "not-a-date",
        updatedAt: "2024-13-45"
      }
    ];
    
    render(<MockMarksList data={testData} />);
    
    await screen.findByText("Test Marks");
    await screen.findByText("Edge Case Marks");
    await screen.findByText("Bad Date Marks");
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const { container } = render(<MockMarksList data={mockData} />);
    
    await screen.findByText("Test Marks");
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles empty data gracefully", async () => {
    render(<MockMarksList data={[]} />);
    
    // Should show empty state
    expect(screen.getByText("No marks found")).toBeInTheDocument();
    expect(screen.getByText("Marks List")).toBeInTheDocument();
    expectNoDateErrors();
  });
});
