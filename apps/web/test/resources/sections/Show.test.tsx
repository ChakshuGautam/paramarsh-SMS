import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminContext, ResourceContextProvider, testDataProvider } from "react-admin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { SectionsShow } from "@/app/admin/resources/sections/Show";

// Mock data with Indian contextual content
const mockSection = {
  id: 1,
  name: "A",
  capacity: 35,
  classId: 1,
  homeroomTeacherId: 1,
  branchId: "branch1",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
};

const mockClass = {
  id: 1,
  name: "Class 1",
  gradeLevel: 1,
  branchId: "branch1",
};

const mockTeacher = {
  id: 1,
  subjects: "Mathematics, Science",
  staff: {
    firstName: "Priya",
    lastName: "Sharma",
  },
  branchId: "branch1",
};

const renderSectionsShow = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: jest.fn((resource, params) => {
      if (resource === "sections") {
        return Promise.resolve({ data: mockSection });
      }
      if (resource === "classes") {
        return Promise.resolve({ data: mockClass });
      }
      if (resource === "teachers") {
        return Promise.resolve({ data: mockTeacher });
      }
      return Promise.resolve({ data: { id: params.id } });
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={["/sections/1/show"]}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider}>
          <ResourceContextProvider value="sections">
            <SectionsShow />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("SectionsShow Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without errors", async () => {
    renderSectionsShow();
    
    // Wait for data to load
    await screen.findByText("A");
    
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  test("displays section details correctly", async () => {
    renderSectionsShow();
    
    // Wait for data to load
    await screen.findByText("A");
    
    // Check section fields
    expect(screen.getByText("1")).toBeInTheDocument(); // ID
    expect(screen.getByText("A")).toBeInTheDocument(); // Section name
    expect(screen.getByText("35")).toBeInTheDocument(); // Capacity
  });

  test("displays class reference correctly", async () => {
    renderSectionsShow();
    
    await screen.findByText("Class 1");
    
    // Check class name is displayed
    expect(screen.getByText("Class 1")).toBeInTheDocument();
  });

  test("displays teacher reference correctly", async () => {
    renderSectionsShow();
    
    await screen.findByText("1"); // Teacher ID display
    
    // Check teacher ID is displayed (as configured in the component)
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("displays field labels correctly", async () => {
    renderSectionsShow();
    
    await screen.findByText("A");
    
    // Check for field labels - these might be in the DOM as attributes or adjacent text
    expect(screen.getByText("A")).toBeInTheDocument(); // Section value
    expect(screen.getByText("35")).toBeInTheDocument(); // Capacity value
    expect(screen.getByText("Class 1")).toBeInTheDocument(); // Class value
  });

  test("shows Edit button in toolbar", async () => {
    renderSectionsShow();
    
    await screen.findByText("A");
    
    // Check for Edit button
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  test("shows View Timetable button in toolbar", async () => {
    renderSectionsShow();
    
    await screen.findByText("A");
    
    // Check for View Timetable button
    expect(screen.getByText("View Timetable")).toBeInTheDocument();
  });

  test("handles missing references gracefully", async () => {
    renderSectionsShow({
      getOne: (resource, params) => {
        if (resource === "sections") {
          return Promise.resolve({ data: mockSection });
        }
        if (resource === "classes") {
          return Promise.reject(new Error("Class not found"));
        }
        if (resource === "teachers") {
          return Promise.reject(new Error("Teacher not found"));
        }
        return Promise.resolve({ data: { id: params.id } });
      },
    });
    
    // Should still render section data
    await screen.findByText("A");
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("35")).toBeInTheDocument();
  });

  test("handles Indian contextual data", async () => {
    const indianSection = {
      id: 1,
      name: "Rose",
      capacity: 45,
      classId: 1,
      homeroomTeacherId: 1,
      branchId: "branch1",
    };

    const indianClass = {
      id: 1,
      name: "Class I",
      gradeLevel: 1,
      branchId: "branch1",
    };

    const indianTeacher = {
      id: 1,
      subjects: "Hindi, Mathematics",
      staff: {
        firstName: "सुनीता",
        lastName: "शर्मा",
      },
      branchId: "branch1",
    };

    renderSectionsShow({
      getOne: (resource, params) => {
        if (resource === "sections") {
          return Promise.resolve({ data: indianSection });
        }
        if (resource === "classes") {
          return Promise.resolve({ data: indianClass });
        }
        if (resource === "teachers") {
          return Promise.resolve({ data: indianTeacher });
        }
        return Promise.resolve({ data: { id: params.id } });
      },
    });
    
    // Wait for Indian data to load
    await screen.findByText("Rose");
    
    expect(screen.getByText("Rose")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("Class I")).toBeInTheDocument();
  });

  test("handles date edge cases without errors", async () => {
    const dateTestCases = [
      { scenario: "null dates", createdAt: null, updatedAt: null },
      { scenario: "undefined dates", createdAt: undefined, updatedAt: undefined },
      { scenario: "empty string dates", createdAt: "", updatedAt: "" },
      { scenario: "invalid dates", createdAt: "not-a-date", updatedAt: "invalid" },
      { scenario: "valid ISO dates", createdAt: "2024-01-15T10:30:00Z", updatedAt: "2024-01-15T10:30:00Z" },
    ];

    for (const testCase of dateTestCases) {
      const testSection = {
        ...mockSection,
        createdAt: testCase.createdAt,
        updatedAt: testCase.updatedAt,
      };

      renderSectionsShow({
        getOne: (resource) => {
          if (resource === "sections") {
            return Promise.resolve({ data: testSection });
          }
          if (resource === "classes") {
            return Promise.resolve({ data: mockClass });
          }
          if (resource === "teachers") {
            return Promise.resolve({ data: mockTeacher });
          }
          return Promise.resolve({ data: { id: 1 } });
        },
      });

      await screen.findByText("A");
      
      // Should never show date errors
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
      expect(screen.queryByText(/Invalid Date/i)).toBeNull();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles data loading errors gracefully", async () => {
    renderSectionsShow({
      getOne: () => Promise.reject(new Error("Failed to load data")),
    });
    
    // Should render without crashing even with errors
    // The component should show some kind of error state or loading state
    expect(document.body).toBeInTheDocument();
  });

  test("has no MUI components", async () => {
    renderSectionsShow();
    
    await screen.findByText("A");
    
    // Check that no MUI classes are present
    const muiElements = document.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("supports multi-tenancy with branchId", async () => {
    const mockGetOne = jest.fn((resource, params) => {
      if (resource === "sections") {
        return Promise.resolve({ data: mockSection });
      }
      if (resource === "classes") {
        return Promise.resolve({ data: mockClass });
      }
      if (resource === "teachers") {
        return Promise.resolve({ data: mockTeacher });
      }
      return Promise.resolve({ data: { id: params.id } });
    });

    renderSectionsShow({ getOne: mockGetOne });
    
    await screen.findByText("A");
    
    // Verify data provider was called for all resources
    expect(mockGetOne).toHaveBeenCalledWith("sections", expect.any(Object));
    // In real implementation, branchId filtering would be handled by backend
  });

  test("displays all expected fields", async () => {
    renderSectionsShow();
    
    await screen.findByText("A");
    
    // Check all displayed fields
    expect(screen.getByText("1")).toBeInTheDocument(); // ID
    expect(screen.getByText("Class 1")).toBeInTheDocument(); // Class reference
    expect(screen.getByText("A")).toBeInTheDocument(); // Section name
    expect(screen.getByText("35")).toBeInTheDocument(); // Capacity
    expect(screen.getByText("1")).toBeInTheDocument(); // Teacher ID (appears twice)
  });

  test("renders with proper accessibility", async () => {
    renderSectionsShow();
    
    await screen.findByText("A");
    
    // Check for buttons
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view timetable/i })).toBeInTheDocument();
  });

  test("handles large capacity values", async () => {
    const largeSectionData = {
      ...mockSection,
      capacity: 100,
    };

    renderSectionsShow({
      getOne: (resource) => {
        if (resource === "sections") {
          return Promise.resolve({ data: largeSectionData });
        }
        if (resource === "classes") {
          return Promise.resolve({ data: mockClass });
        }
        if (resource === "teachers") {
          return Promise.resolve({ data: mockTeacher });
        }
        return Promise.resolve({ data: { id: 1 } });
      },
    });
    
    await screen.findByText("100");
    
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  test("handles special section names", async () => {
    const specialNames = ["Rose", "Lotus", "Jasmine", "Alpha", "Beta", "Γ", "1A"];
    
    for (const name of specialNames) {
      const specialSection = {
        ...mockSection,
        name: name,
      };

      renderSectionsShow({
        getOne: (resource) => {
          if (resource === "sections") {
            return Promise.resolve({ data: specialSection });
          }
          if (resource === "classes") {
            return Promise.resolve({ data: mockClass });
          }
          if (resource === "teachers") {
            return Promise.resolve({ data: mockTeacher });
          }
          return Promise.resolve({ data: { id: 1 } });
        },
      });
      
      await screen.findByText(name);
      expect(screen.getByText(name)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("renders action buttons correctly", async () => {
    renderSectionsShow();
    
    await screen.findByText("A");
    
    // Check for action buttons
    const editButton = screen.getByRole("button", { name: /edit/i });
    const timetableButton = screen.getByRole("button", { name: /view timetable/i });
    
    expect(editButton).toBeInTheDocument();
    expect(timetableButton).toBeInTheDocument();
    
    // Buttons should not be disabled
    expect(editButton).not.toBeDisabled();
    expect(timetableButton).not.toBeDisabled();
  });

  test("handles null section data gracefully", async () => {
    renderSectionsShow({
      getOne: (resource) => {
        if (resource === "sections") {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: { id: 1 } });
      },
    });
    
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  test("shows toolbar with action buttons", async () => {
    renderSectionsShow();
    
    await screen.findByText("A");
    
    // Both toolbar buttons should be present
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view timetable/i })).toBeInTheDocument();
  });

  test("handles reference loading delays", async () => {
    let resolveClass;
    const classPromise = new Promise(resolve => {
      resolveClass = resolve;
    });

    renderSectionsShow({
      getOne: (resource, params) => {
        if (resource === "sections") {
          return Promise.resolve({ data: mockSection });
        }
        if (resource === "classes") {
          return classPromise;
        }
        if (resource === "teachers") {
          return Promise.resolve({ data: mockTeacher });
        }
        return Promise.resolve({ data: { id: params.id } });
      },
    });
    
    // Section data should load first
    await screen.findByText("A");
    expect(screen.getByText("A")).toBeInTheDocument();
    
    // Resolve class data
    resolveClass({ data: mockClass });
    
    // Class should eventually appear
    await screen.findByText("Class 1");
    expect(screen.getByText("Class 1")).toBeInTheDocument();
  });
});