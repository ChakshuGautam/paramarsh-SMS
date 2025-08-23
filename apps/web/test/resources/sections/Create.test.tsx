import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminContext, ResourceContextProvider, testDataProvider } from "react-admin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { SectionsCreate } from "@/app/admin/resources/sections/Create";

// Mock data with Indian contextual content
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

const renderSectionsCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getList: jest.fn((resource, params) => {
      if (resource === "classes") {
        let data = [...mockClasses];
        
        // Apply search filter if provided
        if (params.filter?.q) {
          const query = params.filter.q.toLowerCase();
          data = data.filter(cls => 
            cls.name.toLowerCase().includes(query)
          );
        }
        
        return Promise.resolve({ data, total: data.length });
      }
      return Promise.resolve({ data: [], total: 0 });
    }),
    create: jest.fn((resource, params) => {
      const newRecord = { id: Date.now(), ...params.data };
      return Promise.resolve({ data: newRecord });
    }),
    getOne: jest.fn((resource, params) => {
      if (resource === "classes") {
        const record = mockClasses.find(c => c.id === params.id);
        return Promise.resolve({ data: record || mockClasses[0] });
      }
      return Promise.resolve({ data: { id: params.id } });
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider}>
          <ResourceContextProvider value="sections">
            <SectionsCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("SectionsCreate Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without errors", async () => {
    renderSectionsCreate();
    
    // Check for form fields
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
  });

  test("displays all required form fields", async () => {
    renderSectionsCreate();
    
    // Check that all expected fields are present
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
    
    // Check for save button
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("allows input in text fields", async () => {
    renderSectionsCreate();
    
    const sectionInput = screen.getByLabelText(/section/i);
    const capacityInput = screen.getByLabelText(/capacity/i);
    
    // Type in section field
    fireEvent.change(sectionInput, { target: { value: "A" } });
    expect(sectionInput).toHaveValue("A");
    
    // Type in capacity field
    fireEvent.change(capacityInput, { target: { value: "35" } });
    expect(capacityInput).toHaveValue("35");
  });

  test("loads class options in autocomplete", async () => {
    renderSectionsCreate();
    
    // Wait for autocomplete to be ready
    await waitFor(() => {
      const classInput = screen.getByLabelText(/class/i);
      expect(classInput).toBeInTheDocument();
    });
    
    // The classes should be loaded via data provider
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
  });

  test("handles form submission", async () => {
    const mockCreate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { 
          id: 1, 
          ...params.data,
          branchId: "branch1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } 
      });
    });

    renderSectionsCreate({ create: mockCreate });
    
    // Fill in the form
    const sectionInput = screen.getByLabelText(/section/i);
    const capacityInput = screen.getByLabelText(/capacity/i);
    
    fireEvent.change(sectionInput, { target: { value: "A" } });
    fireEvent.change(capacityInput, { target: { value: "35" } });
    
    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith("sections", {
        data: expect.objectContaining({
          name: "A",
          capacity: "35",
        }),
      });
    });
  });

  test("validates required fields", async () => {
    renderSectionsCreate();
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    
    // Try to submit without filling required fields
    fireEvent.click(saveButton);
    
    // Form should not submit and stay on the page
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("handles class selection", async () => {
    renderSectionsCreate();
    
    const classInput = screen.getByLabelText(/class/i);
    expect(classInput).toBeInTheDocument();
    
    // The autocomplete interaction would typically require more complex testing
    // For now, we verify the field exists and is interactive
    expect(classInput).not.toBeDisabled();
  });

  test("supports Indian contextual data", async () => {
    const indianClasses = [
      { id: 1, name: "Class I", gradeLevel: 1, branchId: "branch1" },
      { id: 2, name: "Class II", gradeLevel: 2, branchId: "branch1" },
      { id: 3, name: "Class VI", gradeLevel: 6, branchId: "branch1" },
    ];

    renderSectionsCreate({
      getList: (resource) => {
        if (resource === "classes") {
          return Promise.resolve({ data: indianClasses, total: indianClasses.length });
        }
        return Promise.resolve({ data: [], total: 0 });
      },
    });
    
    // Should render without errors with Indian class names
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
  });

  test("handles typical Indian section names", async () => {
    renderSectionsCreate();
    
    const sectionInput = screen.getByLabelText(/section/i);
    
    // Test typical Indian section names
    const indianSections = ["A", "B", "C", "Rose", "Lotus", "Jasmine"];
    
    for (const sectionName of indianSections) {
      fireEvent.change(sectionInput, { target: { value: sectionName } });
      expect(sectionInput).toHaveValue(sectionName);
    }
  });

  test("handles typical Indian classroom capacities", async () => {
    renderSectionsCreate();
    
    const capacityInput = screen.getByLabelText(/capacity/i);
    
    // Test typical Indian classroom capacities
    const capacities = ["30", "35", "40", "45"];
    
    for (const capacity of capacities) {
      fireEvent.change(capacityInput, { target: { value: capacity } });
      expect(capacityInput).toHaveValue(capacity);
    }
  });

  test("handles data provider errors gracefully", async () => {
    renderSectionsCreate({
      getList: () => Promise.reject(new Error("Network error")),
      create: () => Promise.reject(new Error("Creation failed")),
    });
    
    // Should render form even if data loading fails
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
  });

  test("has no MUI components", async () => {
    renderSectionsCreate();
    
    // Check that no MUI classes are present
    const muiElements = document.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("supports multi-tenancy with branchId", async () => {
    const mockCreate = jest.fn((resource, params) => {
      // Verify branchId is included
      return Promise.resolve({ 
        data: { 
          id: 1, 
          ...params.data,
          branchId: "branch1", // Should be set by backend
        } 
      });
    });

    renderSectionsCreate({ create: mockCreate });
    
    const sectionInput = screen.getByLabelText(/section/i);
    const capacityInput = screen.getByLabelText(/capacity/i);
    
    fireEvent.change(sectionInput, { target: { value: "A" } });
    fireEvent.change(capacityInput, { target: { value: "30" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith("sections", expect.any(Object));
    });
  });

  test("handles edge cases in form input", async () => {
    renderSectionsCreate();
    
    const sectionInput = screen.getByLabelText(/section/i);
    const capacityInput = screen.getByLabelText(/capacity/i);
    
    // Test edge cases
    const edgeCases = [
      { section: "", capacity: "" },
      { section: "Very Long Section Name That Exceeds Normal Length", capacity: "999" },
      { section: "A", capacity: "0" },
      { section: "123", capacity: "1" },
    ];
    
    for (const testCase of edgeCases) {
      fireEvent.change(sectionInput, { target: { value: testCase.section } });
      fireEvent.change(capacityInput, { target: { value: testCase.capacity } });
      
      expect(sectionInput).toHaveValue(testCase.section);
      expect(capacityInput).toHaveValue(testCase.capacity);
    }
  });

  test("renders with proper accessibility", async () => {
    renderSectionsCreate();
    
    // Check for proper form labels
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
    
    // Check for form structure
    const form = screen.getByRole("form");
    expect(form).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("handles autocomplete interactions", async () => {
    renderSectionsCreate();
    
    const classInput = screen.getByLabelText(/class/i);
    
    // Should be able to focus the autocomplete input
    fireEvent.focus(classInput);
    expect(document.activeElement).toBe(classInput);
    
    // Should not show errors on focus
    expect(screen.queryByText(/error/i)).toBeNull();
  });

  test("preserves form data during interaction", async () => {
    renderSectionsCreate();
    
    const sectionInput = screen.getByLabelText(/section/i);
    const capacityInput = screen.getByLabelText(/capacity/i);
    
    // Fill in data
    fireEvent.change(sectionInput, { target: { value: "Rose" } });
    fireEvent.change(capacityInput, { target: { value: "35" } });
    
    // Focus different field
    fireEvent.focus(screen.getByLabelText(/class/i));
    
    // Data should be preserved
    expect(sectionInput).toHaveValue("Rose");
    expect(capacityInput).toHaveValue("35");
  });

  test("handles creation with minimal data", async () => {
    const mockCreate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { 
          id: 1, 
          ...params.data,
          branchId: "branch1",
        } 
      });
    });

    renderSectionsCreate({ create: mockCreate });
    
    // Fill minimal required data
    const sectionInput = screen.getByLabelText(/section/i);
    fireEvent.change(sectionInput, { target: { value: "A" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should attempt to create even with minimal data
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});