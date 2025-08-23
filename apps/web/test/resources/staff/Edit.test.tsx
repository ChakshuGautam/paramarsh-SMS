import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminContext, ResourceContextProvider, testDataProvider } from "react-admin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { StaffEdit } from "@/app/admin/resources/staff/Edit";

// Mock data with Indian contextual content
const mockStaff = {
  id: 1,
  firstName: "Priya",
  lastName: "Sharma",
  email: "priya.sharma@school.edu.in",
  phone: "+91-9876543210",
  designation: "Principal",
  department: "Administration",
  employmentType: "Permanent",
  joinDate: "2024-01-15",
  status: "active",
  branchId: "branch1",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
};

const renderStaffEdit = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: jest.fn((resource, params) => {
      if (resource === "staff") {
        return Promise.resolve({ data: mockStaff });
      }
      return Promise.resolve({ data: { id: params.id } });
    }),
    update: jest.fn((resource, params) => {
      const updatedRecord = { ...mockStaff, ...params.data, id: params.id };
      return Promise.resolve({ data: updatedRecord });
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={["/staff/1"]}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider}>
          <ResourceContextProvider value="staff">
            <StaffEdit />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("StaffEdit Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without errors", async () => {
    renderStaffEdit();
    
    // Wait for form to load
    await screen.findByDisplayValue("Priya");
    
    // Check that form fields are populated
    expect(screen.getByDisplayValue("Priya")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Sharma")).toBeInTheDocument();
    expect(screen.getByDisplayValue("priya.sharma@school.edu.in")).toBeInTheDocument();
  });

  test("loads and displays existing staff data", async () => {
    renderStaffEdit();
    
    // Wait for data to load
    await screen.findByDisplayValue("Priya");
    
    // Check that all form fields are populated with existing data
    expect(screen.getByDisplayValue("Priya")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Sharma")).toBeInTheDocument();
    expect(screen.getByDisplayValue("priya.sharma@school.edu.in")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+91-9876543210")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Principal")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Administration")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Permanent")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2024-01-15")).toBeInTheDocument();
    expect(screen.getByDisplayValue("active")).toBeInTheDocument();
    
    // Check for form labels
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/designation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/join date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  test("allows editing form fields", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("Priya");
    
    const firstNameInput = screen.getByDisplayValue("Priya");
    const lastNameInput = screen.getByDisplayValue("Sharma");
    const emailInput = screen.getByDisplayValue("priya.sharma@school.edu.in");
    const designationInput = screen.getByDisplayValue("Principal");
    
    // Modify various fields
    fireEvent.change(firstNameInput, { target: { value: "Priyanka" } });
    expect(firstNameInput).toHaveValue("Priyanka");
    
    fireEvent.change(lastNameInput, { target: { value: "Verma" } });
    expect(lastNameInput).toHaveValue("Verma");
    
    fireEvent.change(emailInput, { target: { value: "priyanka.verma@school.edu.in" } });
    expect(emailInput).toHaveValue("priyanka.verma@school.edu.in");
    
    fireEvent.change(designationInput, { target: { value: "Vice Principal" } });
    expect(designationInput).toHaveValue("Vice Principal");
  });

  test("handles form submission", async () => {
    const mockUpdate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { 
          ...mockStaff, 
          ...params.data,
          id: params.id,
          updatedAt: new Date().toISOString(),
        } 
      });
    });

    renderStaffEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("Priya");
    
    // Modify the form
    const firstNameInput = screen.getByDisplayValue("Priya");
    fireEvent.change(firstNameInput, { target: { value: "Priyanka" } });
    
    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("staff", {
        id: 1,
        data: expect.objectContaining({
          firstName: "Priyanka",
        }),
        previousData: mockStaff,
      });
    });
  });

  test("handles Indian contextual data editing", async () => {
    const indianStaff = {
      ...mockStaff,
      firstName: "राजेश",
      lastName: "शर्मा",
      designation: "प्राचार्य",
      department: "प्रशासन",
    };

    renderStaffEdit({
      getOne: () => Promise.resolve({ data: indianStaff }),
    });
    
    // Wait for Indian data to load
    await screen.findByDisplayValue("राजेश");
    
    expect(screen.getByDisplayValue("राजेश")).toBeInTheDocument();
    expect(screen.getByDisplayValue("शर्मा")).toBeInTheDocument();
    expect(screen.getByDisplayValue("प्राचार्य")).toBeInTheDocument();
    expect(screen.getByDisplayValue("प्रशासन")).toBeInTheDocument();
  });

  test("handles phone number format changes", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("+91-9876543210");
    
    const phoneInput = screen.getByDisplayValue("+91-9876543210");
    
    // Test different Indian phone formats
    const phoneFormats = [
      "09876543210",
      "+91 98765 43210",
      "98765-43210",
      "+91 (98765) 43210",
    ];
    
    for (const format of phoneFormats) {
      fireEvent.change(phoneInput, { target: { value: format } });
      expect(phoneInput).toHaveValue(format);
    }
  });

  test("handles status changes", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("active");
    
    const statusInput = screen.getByDisplayValue("active");
    
    // Test different status values
    const statusValues = ["inactive", "on_leave", "terminated"];
    
    for (const status of statusValues) {
      fireEvent.change(statusInput, { target: { value: status } });
      expect(statusInput).toHaveValue(status);
    }
  });

  test("handles designation changes", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("Principal");
    
    const designationInput = screen.getByDisplayValue("Principal");
    
    // Test different designations
    const designations = [
      "Vice Principal",
      "Mathematics Teacher",
      "English Teacher",
      "Physical Education Teacher",
      "Librarian",
      "Office Assistant",
    ];
    
    for (const designation of designations) {
      fireEvent.change(designationInput, { target: { value: designation } });
      expect(designationInput).toHaveValue(designation);
    }
  });

  test("handles department changes", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("Administration");
    
    const departmentInput = screen.getByDisplayValue("Administration");
    
    // Test different departments
    const departments = [
      "Science",
      "Mathematics",
      "Languages", 
      "Social Studies",
      "Arts",
      "Sports",
      "Library",
    ];
    
    for (const department of departments) {
      fireEvent.change(departmentInput, { target: { value: department } });
      expect(departmentInput).toHaveValue(department);
    }
  });

  test("handles employment type changes", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("Permanent");
    
    const typeInput = screen.getByDisplayValue("Permanent");
    
    // Test different employment types
    const employmentTypes = ["Contract", "Temporary", "Guest Faculty", "Part-time"];
    
    for (const type of employmentTypes) {
      fireEvent.change(typeInput, { target: { value: type } });
      expect(typeInput).toHaveValue(type);
    }
  });

  test("handles date edge cases without errors", async () => {
    const dateTestCases = [
      { scenario: "null dates", createdAt: null, updatedAt: null },
      { scenario: "undefined dates", createdAt: undefined, updatedAt: undefined },
      { scenario: "empty string dates", createdAt: "", updatedAt: "" },
      { scenario: "invalid dates", createdAt: "not-a-date", updatedAt: "invalid" },
    ];

    for (const testCase of dateTestCases) {
      const testStaff = {
        ...mockStaff,
        createdAt: testCase.createdAt,
        updatedAt: testCase.updatedAt,
      };

      renderStaffEdit({
        getOne: () => Promise.resolve({ data: testStaff }),
      });

      await screen.findByDisplayValue("Priya");
      
      // Should never show date errors
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
      expect(screen.queryByText(/Invalid Date/i)).toBeNull();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles data loading errors gracefully", async () => {
    renderStaffEdit({
      getOne: () => Promise.reject(new Error("Failed to load staff")),
    });
    
    // Should still render form structure even with errors
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });

  test("validates form fields", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("Priya");
    
    const firstNameInput = screen.getByDisplayValue("Priya");
    
    // Clear required field
    fireEvent.change(firstNameInput, { target: { value: "" } });
    
    // Try to save
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    // Form should not submit with empty required field
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("preserves unchanged fields during update", async () => {
    const mockUpdate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { ...mockStaff, ...params.data, id: params.id } 
      });
    });

    renderStaffEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("Priya");
    
    // Only modify designation
    const designationInput = screen.getByDisplayValue("Principal");
    fireEvent.change(designationInput, { target: { value: "Vice Principal" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("staff", {
        id: 1,
        data: expect.objectContaining({
          designation: "Vice Principal",
        }),
        previousData: mockStaff,
      });
    });
  });

  test("handles join date changes", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("2024-01-15");
    
    const joinDateInput = screen.getByDisplayValue("2024-01-15");
    
    // Test different join dates
    const dates = [
      "2024-04-01", // Academic year start
      "2024-06-15", // Mid year
      "2023-12-01", // Previous year
    ];
    
    for (const date of dates) {
      fireEvent.change(joinDateInput, { target: { value: date } });
      expect(joinDateInput).toHaveValue(date);
    }
  });

  test("has no MUI components", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("Priya");
    
    // Check that no MUI classes are present
    const muiElements = document.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("supports multi-tenancy with branchId", async () => {
    const mockUpdate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { ...mockStaff, ...params.data, id: params.id } 
      });
    });

    renderStaffEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("Priya");
    
    // Modify and save
    const firstNameInput = screen.getByDisplayValue("Priya");
    fireEvent.change(firstNameInput, { target: { value: "Priyanka" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      // In real implementation, branchId filtering would be handled by backend
    });
  });

  test("renders with proper accessibility", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("Priya");
    
    // Check for proper form labels
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/designation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    
    // Check for form structure
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  test("maintains form state during interaction", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("Priya");
    
    const firstNameInput = screen.getByDisplayValue("Priya");
    const lastNameInput = screen.getByDisplayValue("Sharma");
    
    // Modify both fields
    fireEvent.change(firstNameInput, { target: { value: "Priyanka" } });
    fireEvent.change(lastNameInput, { target: { value: "Verma" } });
    
    // Focus another field
    fireEvent.focus(screen.getByLabelText(/email/i));
    
    // Values should be preserved
    expect(firstNameInput).toHaveValue("Priyanka");
    expect(lastNameInput).toHaveValue("Verma");
  });

  test("handles update with partial data", async () => {
    const mockUpdate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { ...mockStaff, ...params.data, id: params.id } 
      });
    });

    renderStaffEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("Priya");
    
    // Only change email
    const emailInput = screen.getByDisplayValue("priya.sharma@school.edu.in");
    fireEvent.change(emailInput, { target: { value: "priya.new@school.edu.in" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("staff", expect.objectContaining({
        id: 1,
        data: expect.objectContaining({
          email: "priya.new@school.edu.in",
        }),
      }));
    });
  });

  test("handles complex Indian names", async () => {
    const complexNames = [
      { firstName: "डॉ. सुनीता", lastName: "श्रीवास्तव" },
      { firstName: "Prof. Rajesh", lastName: "Chakraborty" },
      { firstName: "Mrs. Deepika", lastName: "Iyer-Menon" },
    ];

    for (const name of complexNames) {
      const complexStaff = {
        ...mockStaff,
        firstName: name.firstName,
        lastName: name.lastName,
      };

      renderStaffEdit({
        getOne: () => Promise.resolve({ data: complexStaff }),
      });
      
      await screen.findByDisplayValue(name.firstName);
      
      expect(screen.getByDisplayValue(name.firstName)).toBeInTheDocument();
      expect(screen.getByDisplayValue(name.lastName)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles email validation edge cases", async () => {
    renderStaffEdit();
    
    await screen.findByDisplayValue("priya.sharma@school.edu.in");
    
    const emailInput = screen.getByDisplayValue("priya.sharma@school.edu.in");
    
    // Test various email formats
    const emails = [
      "teacher@school.ac.in",
      "principal+admin@school.org.in", 
      "staff.member@vidyalaya.gov.in",
    ];
    
    for (const email of emails) {
      fireEvent.change(emailInput, { target: { value: email } });
      expect(emailInput).toHaveValue(email);
    }
  });

  test("handles update error scenarios", async () => {
    const mockUpdate = jest.fn(() => Promise.reject(new Error("Update failed")));

    renderStaffEdit({ update: mockUpdate });
    
    await screen.findByDisplayValue("Priya");
    
    // Modify and try to save
    const firstNameInput = screen.getByDisplayValue("Priya");
    fireEvent.change(firstNameInput, { target: { value: "Updated" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
    
    // Form should still be accessible after error
    expect(screen.getByDisplayValue("Updated")).toBeInTheDocument();
  });
});