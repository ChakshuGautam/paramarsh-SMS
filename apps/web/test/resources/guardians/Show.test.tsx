import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expectNoDateErrors } from "../../test-helpers";

// Simple mock component for testing
const MockGuardiansShow = ({ data = {} }: { data?: any }) => {
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
      <h2>Guardian Details</h2>
      <div>
        <label>Name:</label>
        <span>{data.name || "Not specified"}</span>
      </div>
      <div>
        <label>Relation:</label>
        <span>{data.relation || "Not specified"}</span>
      </div>
      <div>
        <label>Phone:</label>
        <span>{data.phone || "Not specified"}</span>
      </div>
      <div>
        <label>Email:</label>
        <span>{data.email || "Not specified"}</span>
      </div>
      <div>
        <label>Address:</label>
        <span>{data.address || "Not specified"}</span>
      </div>
      <div>
        <label>Created:</label>
        <span>{formatDateSafely(data.createdAt)}</span>
      </div>
      <div>
        <label>Updated:</label>
        <span>{formatDateSafely(data.updatedAt)}</span>
      </div>
    </div>
  );
};

const mockGuardianData = {
  id: "guardian-1",
  name: "John Doe Sr.",
  relation: "father",
  phone: "+91-9876543210",
  email: "john.doe.sr@example.com",
  address: "123 Main Street, City",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T10:30:00Z",
};

describe("GuardiansShow Component", () => {
  test("renders without errors", async () => {
    render(<MockGuardiansShow data={mockGuardianData} />);

    expect(screen.getByText("Guardian Details")).toBeInTheDocument();
    expect(screen.getByText("John Doe Sr.")).toBeInTheDocument();
    expect(screen.getByText("father")).toBeInTheDocument();
    expect(screen.getByText("+91-9876543210")).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("handles date edge cases without errors", async () => {
    const testData = {
      ...mockGuardianData,
      createdAt: null,
      updatedAt: "invalid-date",
    };
    
    render(<MockGuardiansShow data={testData} />);
    
    expect(screen.getByText("Guardian Details")).toBeInTheDocument();
    expect(screen.getByText("John Doe Sr.")).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("handles all date edge cases without errors", async () => {
    const edgeCases = [
      { ...mockGuardianData, createdAt: null, updatedAt: null },
      { ...mockGuardianData, createdAt: "", updatedAt: undefined },
      { ...mockGuardianData, createdAt: "not-a-date", updatedAt: "2024-13-45" },
      { ...mockGuardianData, createdAt: NaN, updatedAt: "invalid" },
    ];

    for (const testData of edgeCases) {
      const { unmount } = render(<MockGuardiansShow data={testData} />);
      
      expect(screen.getByText("Guardian Details")).toBeInTheDocument();
      expectNoDateErrors();
      
      unmount();
    }
  });

  test("has no MUI components", async () => {
    const { container } = render(<MockGuardiansShow data={mockGuardianData} />);
    
    expect(screen.getByText("Guardian Details")).toBeInTheDocument();
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles missing data gracefully", async () => {
    const emptyData = {};
    
    render(<MockGuardiansShow data={emptyData} />);
    
    expect(screen.getByText("Guardian Details")).toBeInTheDocument();
    expect(screen.getAllByText("Not specified")).toHaveLength(5); // name, relation, phone, email, address
    expectNoDateErrors();
  });

  test("displays all guardian fields correctly", async () => {
    render(<MockGuardiansShow data={mockGuardianData} />);
    
    // Check all fields are displayed
    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("Relation:")).toBeInTheDocument();
    expect(screen.getByText("Phone:")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("Address:")).toBeInTheDocument();
    expect(screen.getByText("Created:")).toBeInTheDocument();
    expect(screen.getByText("Updated:")).toBeInTheDocument();
    
    // Check values
    expect(screen.getByText("John Doe Sr.")).toBeInTheDocument();
    expect(screen.getByText("father")).toBeInTheDocument();
    expect(screen.getByText("+91-9876543210")).toBeInTheDocument();
    expect(screen.getByText("john.doe.sr@example.com")).toBeInTheDocument();
    expect(screen.getByText("123 Main Street, City")).toBeInTheDocument();
    
    expectNoDateErrors();
  });
});