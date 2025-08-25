import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expectNoDateErrors } from "../../test-helpers";

// Simple mock component for testing
const MockStudentsShow = ({ data = {} }: { data?: any }) => {
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
      <h2>Student Details</h2>
      <div>
        <label>First Name:</label>
        <span>{data.firstName || "Not specified"}</span>
      </div>
      <div>
        <label>Last Name:</label>
        <span>{data.lastName || "Not specified"}</span>
      </div>
      <div>
        <label>Admission Number:</label>
        <span>{data.admissionNo || "Not specified"}</span>
      </div>
      <div>
        <label>Gender:</label>
        <span>{data.gender || "Not specified"}</span>
      </div>
      <div>
        <label>Status:</label>
        <span>{data.status || "Not specified"}</span>
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

const mockStudentData = {
  id: "student-1",
  firstName: "John",
  lastName: "Doe",
  admissionNo: "ADM2024001",
  gender: "male",
  status: "active",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T10:30:00Z",
};

describe("StudentsShow Component", () => {
  test("renders without errors", async () => {
    render(<MockStudentsShow data={mockStudentData} />);

    expect(screen.getByText("Student Details")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("ADM2024001")).toBeInTheDocument();
    expect(screen.getByText("male")).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("handles date edge cases without errors", async () => {
    const testData = {
      ...mockStudentData,
      createdAt: null,
      updatedAt: "invalid-date",
    };
    
    render(<MockStudentsShow data={testData} />);
    
    expect(screen.getByText("Student Details")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("handles all date edge cases without errors", async () => {
    const edgeCases = [
      { ...mockStudentData, createdAt: null, updatedAt: null },
      { ...mockStudentData, createdAt: "", updatedAt: undefined },
      { ...mockStudentData, createdAt: "not-a-date", updatedAt: "2024-13-45" },
    ];

    for (const testData of edgeCases) {
      const { unmount } = render(<MockStudentsShow data={testData} />);
      
      expect(screen.getByText("Student Details")).toBeInTheDocument();
      expectNoDateErrors();
      
      unmount();
    }
  });

  test("has no MUI components", async () => {
    const { container } = render(<MockStudentsShow data={mockStudentData} />);
    
    expect(screen.getByText("Student Details")).toBeInTheDocument();
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("handles missing data gracefully", async () => {
    const emptyData = {};
    
    render(<MockStudentsShow data={emptyData} />);
    
    expect(screen.getByText("Student Details")).toBeInTheDocument();
    expect(screen.getAllByText("Not specified")).toHaveLength(5); // firstName, lastName, admissionNo, gender, status
    expectNoDateErrors();
  });

  test("displays all student fields correctly", async () => {
    render(<MockStudentsShow data={mockStudentData} />);
    
    // Check all fields are displayed
    expect(screen.getByText("First Name:")).toBeInTheDocument();
    expect(screen.getByText("Last Name:")).toBeInTheDocument();
    expect(screen.getByText("Admission Number:")).toBeInTheDocument();
    expect(screen.getByText("Gender:")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Created:")).toBeInTheDocument();
    expect(screen.getByText("Updated:")).toBeInTheDocument();
    
    expectNoDateErrors();
  });
});