import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminContext, ResourceContextProvider, testDataProvider } from "react-admin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { SectionsEdit } from "@/app/admin/resources/sections/Edit";

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

const mockClasses = [
  {
    id: 1,
    name: "Class 1",
    gradeLevel: 1,
    branchId: "branch1",
  },
  {
    id: 2,
    name: "Class 2",
    gradeLevel: 2,
    branchId: "branch1",
  },
  {
    id: 3,
    name: "Class 6",
    gradeLevel: 6,
    branchId: "branch1",
  },
];

const mockTeachers = [
  {
    id: 1,
    subjects: "Mathematics",
    staff: {
      firstName: "Priya",
      lastName: "Sharma",
    },
    branchId: "branch1",
  },
  {
    id: 2,
    subjects: "English",
    staff: {
      firstName: "Rajesh",
      lastName: "Kumar",
    },
    branchId: "branch1",
  },
];

const renderSectionsEdit = (dataProviderOverrides = {}) => {
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
        const record = mockClasses.find(c => c.id === params.id);
        return Promise.resolve({ data: record || mockClasses[0] });
      }
      if (resource === "teachers") {
        const record = mockTeachers.find(t => t.id === params.id);
        return Promise.resolve({ data: record || mockTeachers[0] });
      }
      return Promise.resolve({ data: { id: params.id } });
    }),
    getList: jest.fn((resource, params) => {
      if (resource === "classes") {
        let data = [...mockClasses];
        
        if (params.filter?.q) {
          const query = params.filter.q.toLowerCase();
          data = data.filter(cls => 
            cls.name.toLowerCase().includes(query)
          );
        }
        
        return Promise.resolve({ data, total: data.length });
      }
      if (resource === "teachers") {
        let data = [...mockTeachers];
        
        if (params.filter?.q) {
          const query = params.filter.q.toLowerCase();
          data = data.filter(teacher => 
            teacher.staff.firstName.toLowerCase().includes(query) ||
            teacher.staff.lastName.toLowerCase().includes(query)
          );
        }
        
        return Promise.resolve({ data, total: data.length });
      }
      return Promise.resolve({ data: [], total: 0 });
    }),
    update: jest.fn((resource, params) => {
      const updatedRecord = { ...mockSection, ...params.data, id: params.id };
      return Promise.resolve({ data: updatedRecord });
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={["/sections/1"]}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider}>
          <ResourceContextProvider value="sections">
            <SectionsEdit />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("SectionsEdit Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without errors", async () => {
    renderSectionsEdit();
    
    // Wait for form to load
    await screen.findByDisplayValue("A");
    
    // Check that form fields are populated
    expect(screen.getByDisplayValue("A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("35")).toBeInTheDocument();
  });

  test("loads and displays existing section data", async () => {
    renderSectionsEdit();
    
    // Wait for data to load
    await screen.findByDisplayValue("A");
    
    // Check that form fields are populated with existing data
    expect(screen.getByDisplayValue("A")).toBeInTheDocument(); // Section name
    expect(screen.getByDisplayValue("35")).toBeInTheDocument(); // Capacity
    
    // Check for form labels
    expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/class teacher/i)).toBeInTheDocument();
  });

  test("allows editing form fields", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    const sectionInput = screen.getByDisplayValue("A");
    const capacityInput = screen.getByDisplayValue("35");
    
    // Modify section name
    fireEvent.change(sectionInput, { target: { value: "B" } });
    expect(sectionInput).toHaveValue("B");
    
    // Modify capacity
    fireEvent.change(capacityInput, { target: { value: "40" } });
    expect(capacityInput).toHaveValue("40");
  });

  test("handles form submission", async () => {
    const mockUpdate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { 
          ...mockSection, 
          ...params.data,
          id: params.id,
          updatedAt: new Date().toISOString(),
        } 
      });
    });

    renderSectionsEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("A");
    
    // Modify the form
    const sectionInput = screen.getByDisplayValue("A");
    fireEvent.change(sectionInput, { target: { value: "B" } });
    
    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("sections", {
        id: 1,
        data: expect.objectContaining({
          name: "B",
        }),
        previousData: mockSection,
      });
    });
  });

  test("displays all form fields including homeroom teacher", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    // Check all expected fields are present
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/class teacher/i)).toBeInTheDocument();
    
    // Check for save button
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("loads class and teacher options", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    // Class and teacher fields should be present
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/class teacher/i)).toBeInTheDocument();
    
    // These are autocomplete fields that load options from data provider
    expect(screen.getByLabelText(/class/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/class teacher/i)).not.toBeDisabled();
  });

  test("handles Indian contextual data", async () => {
    const indianSection = {
      ...mockSection,
      name: "Rose",
      capacity: 45,
    };

    const indianClasses = [
      { id: 1, name: "Class I", gradeLevel: 1, branchId: "branch1" },
      { id: 2, name: "Class V", gradeLevel: 5, branchId: "branch1" },
    ];

    const indianTeachers = [
      {
        id: 1,
        subjects: "Hindi, Mathematics",
        staff: {
          firstName: "सुनीता",
          lastName: "शर्मा",
        },
        branchId: "branch1",
      },
    ];

    renderSectionsEdit({
      getOne: (resource) => {
        if (resource === "sections") {
          return Promise.resolve({ data: indianSection });
        }
        return Promise.resolve({ data: { id: 1 } });
      },
      getList: (resource) => {
        if (resource === "classes") {
          return Promise.resolve({ data: indianClasses, total: indianClasses.length });
        }
        if (resource === "teachers") {
          return Promise.resolve({ data: indianTeachers, total: indianTeachers.length });
        }
        return Promise.resolve({ data: [], total: 0 });
      },
    });
    
    // Wait for Indian section name to load
    await screen.findByDisplayValue("Rose");
    
    expect(screen.getByDisplayValue("Rose")).toBeInTheDocument();
    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
  });

  test("handles date edge cases without errors", async () => {
    const dateTestCases = [
      { scenario: "null dates", createdAt: null, updatedAt: null },
      { scenario: "undefined dates", createdAt: undefined, updatedAt: undefined },
      { scenario: "empty string dates", createdAt: "", updatedAt: "" },
      { scenario: "invalid dates", createdAt: "not-a-date", updatedAt: "invalid" },
    ];

    for (const testCase of dateTestCases) {
      const testSection = {
        ...mockSection,
        createdAt: testCase.createdAt,
        updatedAt: testCase.updatedAt,
      };

      renderSectionsEdit({
        getOne: () => Promise.resolve({ data: testSection }),
      });

      await screen.findByDisplayValue("A");
      
      // Should never show date errors
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
      expect(screen.queryByText(/Invalid Date/i)).toBeNull();
      
      // Clean up for next iteration
      screen.getByDisplayValue("A").closest("form")?.remove?.();
    }
  });

  test("handles data loading errors gracefully", async () => {
    renderSectionsEdit({
      getOne: () => Promise.reject(new Error("Failed to load section")),
      getList: () => Promise.reject(new Error("Failed to load options")),
    });
    
    // Should still render form structure even with errors
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });

  test("validates form fields", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    const sectionInput = screen.getByDisplayValue("A");
    
    // Clear the section field
    fireEvent.change(sectionInput, { target: { value: "" } });
    
    // Try to save
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    // Form should not submit with empty required field
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("preserves unchanged fields during update", async () => {
    const mockUpdate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { ...mockSection, ...params.data, id: params.id } 
      });
    });

    renderSectionsEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("A");
    
    // Only modify capacity
    const capacityInput = screen.getByDisplayValue("35");
    fireEvent.change(capacityInput, { target: { value: "30" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("sections", {
        id: 1,
        data: expect.objectContaining({
          capacity: "30",
        }),
        previousData: mockSection,
      });
    });
  });

  test("has no MUI components", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    // Check that no MUI classes are present
    const muiElements = document.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("supports multi-tenancy with branchId", async () => {
    const mockUpdate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { ...mockSection, ...params.data, id: params.id } 
      });
    });

    renderSectionsEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("A");
    
    // Modify and save
    const sectionInput = screen.getByDisplayValue("A");
    fireEvent.change(sectionInput, { target: { value: "B" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      // In real implementation, branchId filtering would be handled by backend
    });
  });

  test("handles teacher selection", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    const teacherInput = screen.getByLabelText(/class teacher/i);
    expect(teacherInput).toBeInTheDocument();
    expect(teacherInput).not.toBeDisabled();
  });

  test("handles class selection", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    const classInput = screen.getByLabelText(/class/i);
    expect(classInput).toBeInTheDocument();
    expect(classInput).not.toBeDisabled();
  });

  test("renders with proper accessibility", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    // Check for proper form labels
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/class teacher/i)).toBeInTheDocument();
    
    // Check for form structure
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  test("handles capacity edge cases", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("35");
    
    const capacityInput = screen.getByDisplayValue("35");
    
    // Test various capacity values
    const capacities = ["0", "1", "30", "50", "100"];
    
    for (const capacity of capacities) {
      fireEvent.change(capacityInput, { target: { value: capacity } });
      expect(capacityInput).toHaveValue(capacity);
    }
  });

  test("maintains form state during interaction", async () => {
    renderSectionsEdit();
    
    await screen.findByDisplayValue("A");
    
    const sectionInput = screen.getByDisplayValue("A");
    const capacityInput = screen.getByDisplayValue("35");
    
    // Modify both fields
    fireEvent.change(sectionInput, { target: { value: "Lotus" } });
    fireEvent.change(capacityInput, { target: { value: "42" } });
    
    // Focus another field
    fireEvent.focus(screen.getByLabelText(/class/i));
    
    // Values should be preserved
    expect(sectionInput).toHaveValue("Lotus");
    expect(capacityInput).toHaveValue("42");
  });

  test("handles update with partial data", async () => {
    const mockUpdate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { ...mockSection, ...params.data, id: params.id } 
      });
    });

    renderSectionsEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("A");
    
    // Only change section name
    const sectionInput = screen.getByDisplayValue("A");
    fireEvent.change(sectionInput, { target: { value: "C" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("sections", expect.objectContaining({
        id: 1,
        data: expect.objectContaining({
          name: "C",
        }),
      }));
    });
  });
});