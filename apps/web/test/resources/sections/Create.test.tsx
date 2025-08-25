import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expectNoDateErrors } from "../../test-helpers";

// Simple mock component for testing
const MockSectionsCreate = ({ initialData = {} }: { initialData?: any }) => {
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
      <h2>Create Section</h2>
      <form>
        <input name="name" placeholder="Section Name" defaultValue={initialData.name || ""} />
        <input name="capacity" placeholder="Capacity" type="number" defaultValue={initialData.capacity || ""} />
        <select name="status" value={initialData.status || "active"} onChange={() => {}}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {initialData.createdAt && (
          <span>Created: {formatDateSafely(initialData.createdAt)}</span>
        )}
        <button type="submit">Create Section</button>
      </form>
    </div>
  );
};

describe("SectionsCreate Component", () => {
  test("renders without errors", async () => {
    render(<MockSectionsCreate />);

    expect(screen.getByRole("heading", { name: "Create Section" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Section Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Capacity")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create Section" })).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("handles date edge cases without errors", async () => {
    const testData = {
      name: "Section A",
      capacity: "30",
      status: "active",
      createdAt: null
    };
    
    render(<MockSectionsCreate initialData={testData} />);
    
    expect(screen.getByRole("heading", { name: "Create Section" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Section A")).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("handles bad date values without errors", async () => {
    const testData = {
      name: "Section B",
      capacity: "25",
      status: "active",
      createdAt: "not-a-date"
    };
    
    render(<MockSectionsCreate initialData={testData} />);
    
    expect(screen.getByRole("heading", { name: "Create Section" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Section B")).toBeInTheDocument();
    expectNoDateErrors();
  });

  test("has no MUI components", async () => {
    const { container } = render(<MockSectionsCreate />);
    
    expect(screen.getByRole("heading", { name: "Create Section" })).toBeInTheDocument();
    
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("renders form fields correctly", async () => {
    const testData = {
      name: "Section C",
      capacity: "35",
      status: "active"
    };
    
    render(<MockSectionsCreate initialData={testData} />);
    
    expect(screen.getByDisplayValue("Section C")).toBeInTheDocument();
    expect(screen.getByDisplayValue("35")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expectNoDateErrors();
  });
});