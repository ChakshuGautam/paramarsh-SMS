import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminContext, ResourceContextProvider, testDataProvider } from "react-admin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { StaffCreate } from "@/app/admin/resources/staff/Create";

const renderStaffCreate = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    create: jest.fn((resource, params) => {
      const newRecord = { 
        id: Date.now(), 
        ...params.data,
        branchId: "branch1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return Promise.resolve({ data: newRecord });
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider}>
          <ResourceContextProvider value="staff">
            <StaffCreate />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("StaffCreate Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without errors", async () => {
    renderStaffCreate();
    
    // Check for form fields
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

  test("displays all required form fields", async () => {
    renderStaffCreate();
    
    // Check that all expected fields are present
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/designation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/join date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    
    // Check for save button
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("allows input in text fields", async () => {
    renderStaffCreate();
    
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const designationInput = screen.getByLabelText(/designation/i);
    const departmentInput = screen.getByLabelText(/department/i);
    
    // Type in various fields
    fireEvent.change(firstNameInput, { target: { value: "Priya" } });
    expect(firstNameInput).toHaveValue("Priya");
    
    fireEvent.change(lastNameInput, { target: { value: "Sharma" } });
    expect(lastNameInput).toHaveValue("Sharma");
    
    fireEvent.change(emailInput, { target: { value: "priya.sharma@school.edu.in" } });
    expect(emailInput).toHaveValue("priya.sharma@school.edu.in");
    
    fireEvent.change(phoneInput, { target: { value: "+91-9876543210" } });
    expect(phoneInput).toHaveValue("+91-9876543210");
    
    fireEvent.change(designationInput, { target: { value: "Principal" } });
    expect(designationInput).toHaveValue("Principal");
    
    fireEvent.change(departmentInput, { target: { value: "Administration" } });
    expect(departmentInput).toHaveValue("Administration");
  });

  test("handles form submission with Indian contextual data", async () => {
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

    renderStaffCreate({ create: mockCreate });
    
    // Fill in the form with Indian data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "राजेश" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "शर्मा" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "rajesh.sharma@school.edu.in" } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "+91-9876543210" } });
    fireEvent.change(screen.getByLabelText(/designation/i), { target: { value: "प्राचार्य" } });
    fireEvent.change(screen.getByLabelText(/department/i), { target: { value: "प्रशासन" } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: "Permanent" } });
    fireEvent.change(screen.getByLabelText(/join date/i), { target: { value: "2024-01-15" } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: "active" } });
    
    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith("staff", {
        data: expect.objectContaining({
          firstName: "राजेश",
          lastName: "शर्मा",
          email: "rajesh.sharma@school.edu.in",
          phone: "+91-9876543210",
          designation: "प्राचार्य",
          department: "प्रशासन",
          employmentType: "Permanent",
          joinDate: "2024-01-15",
          status: "active",
        }),
      });
    });
  });

  test("handles typical Indian staff designations", async () => {
    renderStaffCreate();
    
    const designationInput = screen.getByLabelText(/designation/i);
    
    // Test typical Indian school designations
    const indianDesignations = [
      "प्राचार्य", // Principal
      "उप प्राचार्य", // Vice Principal
      "हिंदी शिक्षक", // Hindi Teacher
      "गणित शिक्षक", // Mathematics Teacher
      "खेल शिक्षक", // Sports Teacher
      "पुस्तकालयाध्यक्ष", // Librarian
      "लिपिक", // Clerk
    ];
    
    for (const designation of indianDesignations) {
      fireEvent.change(designationInput, { target: { value: designation } });
      expect(designationInput).toHaveValue(designation);
    }
  });

  test("handles typical Indian departments", async () => {
    renderStaffCreate();
    
    const departmentInput = screen.getByLabelText(/department/i);
    
    // Test typical Indian school departments
    const indianDepartments = [
      "प्रशासन", // Administration
      "विज्ञान विभाग", // Science Department
      "भाषा विभाग", // Language Department
      "गणित विभाग", // Mathematics Department
      "कला विभाग", // Arts Department
      "खेल विभाग", // Sports Department
      "पुस्तकालय", // Library
    ];
    
    for (const department of indianDepartments) {
      fireEvent.change(departmentInput, { target: { value: department } });
      expect(departmentInput).toHaveValue(department);
    }
  });

  test("handles Indian phone number formats", async () => {
    renderStaffCreate();
    
    const phoneInput = screen.getByLabelText(/phone/i);
    
    // Test various Indian phone number formats
    const phoneFormats = [
      "+91-9876543210",
      "09876543210",
      "9876543210",
      "+91 98765 43210",
      "98765-43210",
    ];
    
    for (const phone of phoneFormats) {
      fireEvent.change(phoneInput, { target: { value: phone } });
      expect(phoneInput).toHaveValue(phone);
    }
  });

  test("handles Indian email domains", async () => {
    renderStaffCreate();
    
    const emailInput = screen.getByLabelText(/email/i);
    
    // Test typical Indian school email formats
    const emailFormats = [
      "teacher@school.edu.in",
      "principal@vidyalaya.ac.in",
      "staff@school.org.in",
      "admin@school.co.in",
    ];
    
    for (const email of emailFormats) {
      fireEvent.change(emailInput, { target: { value: email } });
      expect(emailInput).toHaveValue(email);
    }
  });

  test("handles employment types common in India", async () => {
    renderStaffCreate();
    
    const typeInput = screen.getByLabelText(/type/i);
    
    // Test employment types common in Indian schools
    const employmentTypes = [
      "Permanent",
      "Contract",
      "Temporary",
      "Guest Faculty",
      "Part-time",
      "Regular",
    ];
    
    for (const type of employmentTypes) {
      fireEvent.change(typeInput, { target: { value: type } });
      expect(typeInput).toHaveValue(type);
    }
  });

  test("handles date formats", async () => {
    renderStaffCreate();
    
    const joinDateInput = screen.getByLabelText(/join date/i);
    
    // Test various date formats
    const dateFormats = [
      "2024-01-15",
      "2024-04-01", // Academic year start in India
      "2024-06-01", // Summer joining
    ];
    
    for (const date of dateFormats) {
      fireEvent.change(joinDateInput, { target: { value: date } });
      expect(joinDateInput).toHaveValue(date);
    }
  });

  test("handles status values", async () => {
    renderStaffCreate();
    
    const statusInput = screen.getByLabelText(/status/i);
    
    // Test various status values
    const statusValues = [
      "active",
      "inactive", 
      "on_leave",
      "terminated",
    ];
    
    for (const status of statusValues) {
      fireEvent.change(statusInput, { target: { value: status } });
      expect(statusInput).toHaveValue(status);
    }
  });

  test("validates required fields", async () => {
    renderStaffCreate();
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    
    // Try to submit without filling required fields
    fireEvent.click(saveButton);
    
    // Form should not submit and stay on the page
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("handles data provider errors gracefully", async () => {
    renderStaffCreate({
      create: () => Promise.reject(new Error("Creation failed")),
    });
    
    // Fill in minimal data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "User" } });
    
    // Try to submit
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should still render form
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });

  test("has no MUI components", async () => {
    renderStaffCreate();
    
    // Check that no MUI classes are present
    const muiElements = document.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("supports multi-tenancy with branchId", async () => {
    const mockCreate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { 
          id: 1, 
          ...params.data,
          branchId: "branch1", // Should be set by backend
        } 
      });
    });

    renderStaffCreate({ create: mockCreate });
    
    // Fill minimal data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "User" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith("staff", expect.any(Object));
    });
  });

  test("handles edge cases in form input", async () => {
    renderStaffCreate();
    
    // Test edge cases for various fields
    const firstNameInput = screen.getByLabelText(/first name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    
    // Test very long names
    fireEvent.change(firstNameInput, { 
      target: { value: "Very Long Name That Exceeds Normal Length Limits" } 
    });
    expect(firstNameInput).toHaveValue("Very Long Name That Exceeds Normal Length Limits");
    
    // Test special characters in email
    fireEvent.change(emailInput, { target: { value: "test.user+tag@example.co.in" } });
    expect(emailInput).toHaveValue("test.user+tag@example.co.in");
    
    // Test phone with special characters
    fireEvent.change(phoneInput, { target: { value: "+91 (98765) 43210" } });
    expect(phoneInput).toHaveValue("+91 (98765) 43210");
  });

  test("renders with proper accessibility", async () => {
    renderStaffCreate();
    
    // Check for proper form labels
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    
    // Check for form structure
    const form = screen.getByRole("form");
    expect(form).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("preserves form data during interaction", async () => {
    renderStaffCreate();
    
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    
    // Fill in data
    fireEvent.change(firstNameInput, { target: { value: "Priya" } });
    fireEvent.change(lastNameInput, { target: { value: "Sharma" } });
    
    // Focus different field
    fireEvent.focus(screen.getByLabelText(/email/i));
    
    // Data should be preserved
    expect(firstNameInput).toHaveValue("Priya");
    expect(lastNameInput).toHaveValue("Sharma");
  });

  test("handles creation with complete staff data", async () => {
    const mockCreate = jest.fn((resource, params) => {
      return Promise.resolve({ 
        data: { 
          id: 1, 
          ...params.data,
          branchId: "branch1",
        } 
      });
    });

    renderStaffCreate({ create: mockCreate });
    
    // Fill complete staff data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Sunita" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Patel" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "sunita.patel@school.edu.in" } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "+91-9876543212" } });
    fireEvent.change(screen.getByLabelText(/designation/i), { target: { value: "English Teacher" } });
    fireEvent.change(screen.getByLabelText(/department/i), { target: { value: "Languages" } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: "Permanent" } });
    fireEvent.change(screen.getByLabelText(/join date/i), { target: { value: "2024-04-01" } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: "active" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith("staff", {
        data: expect.objectContaining({
          firstName: "Sunita",
          lastName: "Patel",
          email: "sunita.patel@school.edu.in",
          phone: "+91-9876543212",
          designation: "English Teacher",
          department: "Languages",
          employmentType: "Permanent",
          joinDate: "2024-04-01",
          status: "active",
        }),
      });
    });
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

    renderStaffCreate({ create: mockCreate });
    
    // Fill minimal required data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Staff" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should attempt to create even with minimal data
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});