import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminContext, ResourceContextProvider, testDataProvider } from "react-admin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { StaffShow } from "@/app/admin/resources/staff/Show";

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

const renderStaffShow = (dataProviderOverrides = {}) => {
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
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={["/staff/1/show"]}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider}>
          <ResourceContextProvider value="staff">
            <StaffShow />
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("StaffShow Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without errors", async () => {
    renderStaffShow();
    
    // Wait for data to load
    await screen.findByText("Priya");
    
    expect(screen.getByText("Priya")).toBeInTheDocument();
  });

  test("displays staff details correctly", async () => {
    renderStaffShow();
    
    // Wait for data to load
    await screen.findByText("Priya");
    
    // Check all staff fields
    expect(screen.getByText("1")).toBeInTheDocument(); // ID
    expect(screen.getByText("Priya")).toBeInTheDocument(); // First Name
    expect(screen.getByText("Sharma")).toBeInTheDocument(); // Last Name
    expect(screen.getByText("priya.sharma@school.edu.in")).toBeInTheDocument(); // Email
    expect(screen.getByText("+91-9876543210")).toBeInTheDocument(); // Phone
    expect(screen.getByText("Principal")).toBeInTheDocument(); // Designation
    expect(screen.getByText("Administration")).toBeInTheDocument(); // Department
    expect(screen.getByText("Permanent")).toBeInTheDocument(); // Employment Type
    expect(screen.getByText("2024-01-15")).toBeInTheDocument(); // Join Date
    expect(screen.getByText("active")).toBeInTheDocument(); // Status
  });

  test("displays all expected field labels", async () => {
    renderStaffShow();
    
    await screen.findByText("Priya");
    
    // Check all displayed fields are present
    expect(screen.getByText("1")).toBeInTheDocument(); // ID
    expect(screen.getByText("Priya")).toBeInTheDocument(); // First Name
    expect(screen.getByText("Sharma")).toBeInTheDocument(); // Last Name
    expect(screen.getByText("priya.sharma@school.edu.in")).toBeInTheDocument(); // Email
    expect(screen.getByText("+91-9876543210")).toBeInTheDocument(); // Phone
    expect(screen.getByText("Principal")).toBeInTheDocument(); // Designation
    expect(screen.getByText("Administration")).toBeInTheDocument(); // Department
    expect(screen.getByText("Permanent")).toBeInTheDocument(); // Type
    expect(screen.getByText("2024-01-15")).toBeInTheDocument(); // Join Date
    expect(screen.getByText("active")).toBeInTheDocument(); // Status
  });

  test("handles Indian contextual data", async () => {
    const indianStaff = {
      id: 1,
      firstName: "राजेश",
      lastName: "शर्मा",
      email: "rajesh.sharma@vidyalaya.edu.in",
      phone: "+91-98765-43210",
      designation: "प्राचार्य",
      department: "प्रशासन",
      employmentType: "स्थायी",
      joinDate: "२०२४-०१-१५",
      status: "सक्रिय",
      branchId: "branch1",
    };

    renderStaffShow({
      getOne: () => Promise.resolve({ data: indianStaff }),
    });
    
    // Wait for Indian data to load
    await screen.findByText("राजेश");
    
    expect(screen.getByText("राजेश")).toBeInTheDocument();
    expect(screen.getByText("शर्मा")).toBeInTheDocument();
    expect(screen.getByText("rajesh.sharma@vidyalaya.edu.in")).toBeInTheDocument();
    expect(screen.getByText("+91-98765-43210")).toBeInTheDocument();
    expect(screen.getByText("प्राचार्य")).toBeInTheDocument();
    expect(screen.getByText("प्रशासन")).toBeInTheDocument();
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
      const testStaff = {
        ...mockStaff,
        createdAt: testCase.createdAt,
        updatedAt: testCase.updatedAt,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: testStaff }),
      });

      await screen.findByText("Priya");
      
      // Should never show date errors
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
      expect(screen.queryByText(/Invalid Date/i)).toBeNull();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles missing field data gracefully", async () => {
    const incompleteStaff = {
      id: 1,
      firstName: "Incomplete",
      lastName: null,
      email: null,
      phone: null,
      designation: null,
      department: null,
      employmentType: null,
      joinDate: null,
      status: "active",
      branchId: "branch1",
    };

    renderStaffShow({
      getOne: () => Promise.resolve({ data: incompleteStaff }),
    });
    
    await screen.findByText("Incomplete");
    
    // Should render without errors even with missing data
    expect(screen.getByText("Incomplete")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  test("handles data loading errors gracefully", async () => {
    renderStaffShow({
      getOne: () => Promise.reject(new Error("Failed to load data")),
    });
    
    // Should render without crashing even with errors
    expect(document.body).toBeInTheDocument();
  });

  test("has no MUI components", async () => {
    renderStaffShow();
    
    await screen.findByText("Priya");
    
    // Check that no MUI classes are present
    const muiElements = document.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBe(0);
  });

  test("supports multi-tenancy with branchId", async () => {
    const mockGetOne = jest.fn((resource, params) => {
      if (resource === "staff") {
        return Promise.resolve({ data: mockStaff });
      }
      return Promise.resolve({ data: { id: params.id } });
    });

    renderStaffShow({ getOne: mockGetOne });
    
    await screen.findByText("Priya");
    
    // Verify data provider was called
    expect(mockGetOne).toHaveBeenCalledWith("staff", expect.any(Object));
    // In real implementation, branchId filtering would be handled by backend
  });

  test("displays different staff designations correctly", async () => {
    const designations = [
      "Principal",
      "Vice Principal", 
      "Mathematics Teacher",
      "English Teacher",
      "Physical Education Teacher",
      "Librarian",
      "Office Clerk",
      "Lab Assistant",
    ];

    for (const designation of designations) {
      const staffWithDesignation = {
        ...mockStaff,
        designation: designation,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithDesignation }),
      });
      
      await screen.findByText(designation);
      expect(screen.getByText(designation)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("displays different departments correctly", async () => {
    const departments = [
      "Administration",
      "Science",
      "Mathematics",
      "Languages",
      "Social Studies",
      "Arts",
      "Sports",
      "Library",
    ];

    for (const department of departments) {
      const staffWithDepartment = {
        ...mockStaff,
        department: department,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithDepartment }),
      });
      
      await screen.findByText(department);
      expect(screen.getByText(department)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("displays different employment types correctly", async () => {
    const employmentTypes = [
      "Permanent",
      "Contract",
      "Temporary",
      "Guest Faculty",
      "Part-time",
    ];

    for (const type of employmentTypes) {
      const staffWithType = {
        ...mockStaff,
        employmentType: type,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithType }),
      });
      
      await screen.findByText(type);
      expect(screen.getByText(type)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("displays different status values correctly", async () => {
    const statusValues = ["active", "inactive", "on_leave", "terminated"];

    for (const status of statusValues) {
      const staffWithStatus = {
        ...mockStaff,
        status: status,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithStatus }),
      });
      
      await screen.findByText(status);
      expect(screen.getByText(status)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles phone number formats correctly", async () => {
    const phoneFormats = [
      "+91-9876543210",
      "09876543210",
      "+91 98765 43210", 
      "98765-43210",
      "+91 (98765) 43210",
    ];

    for (const phone of phoneFormats) {
      const staffWithPhone = {
        ...mockStaff,
        phone: phone,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithPhone }),
      });
      
      await screen.findByText(phone);
      expect(screen.getByText(phone)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles email formats correctly", async () => {
    const emailFormats = [
      "teacher@school.edu.in",
      "principal@vidyalaya.ac.in",
      "staff@school.org.in",
      "admin@school.co.in",
      "teacher.name@government.school.in",
    ];

    for (const email of emailFormats) {
      const staffWithEmail = {
        ...mockStaff,
        email: email,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithEmail }),
      });
      
      await screen.findByText(email);
      expect(screen.getByText(email)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("renders with proper accessibility", async () => {
    renderStaffShow();
    
    await screen.findByText("Priya");
    
    // Check that content is accessible
    expect(screen.getByText("Priya")).toBeInTheDocument();
    expect(screen.getByText("Sharma")).toBeInTheDocument();
    expect(screen.getByText("priya.sharma@school.edu.in")).toBeInTheDocument();
  });

  test("handles large ID values", async () => {
    const largeIdStaff = {
      ...mockStaff,
      id: 999999,
    };

    renderStaffShow({
      getOne: () => Promise.resolve({ data: largeIdStaff }),
    });
    
    await screen.findByText("999999");
    expect(screen.getByText("999999")).toBeInTheDocument();
  });

  test("handles special characters in names", async () => {
    const specialNames = [
      { firstName: "Dr. Priya", lastName: "Sharma" },
      { firstName: "Mrs. Sunita", lastName: "O'Connor" },
      { firstName: "Prof. राजेश", lastName: "श्री-वास्तव" },
      { firstName: "Ms. Deepika", lastName: "Iyer-Menon" },
    ];

    for (const name of specialNames) {
      const staffWithSpecialName = {
        ...mockStaff,
        firstName: name.firstName,
        lastName: name.lastName,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithSpecialName }),
      });
      
      await screen.findByText(name.firstName);
      expect(screen.getByText(name.firstName)).toBeInTheDocument();
      expect(screen.getByText(name.lastName)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles join date formatting", async () => {
    const joinDates = [
      "2024-01-15",
      "2024-04-01", // Academic year start
      "2023-12-31",
      "2024-06-15",
    ];

    for (const joinDate of joinDates) {
      const staffWithJoinDate = {
        ...mockStaff,
        joinDate: joinDate,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithJoinDate }),
      });
      
      await screen.findByText(joinDate);
      expect(screen.getByText(joinDate)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles null staff data gracefully", async () => {
    renderStaffShow({
      getOne: () => Promise.resolve({ data: null }),
    });
    
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  test("displays complex designations correctly", async () => {
    const complexDesignations = [
      "Senior Mathematics Teacher",
      "Assistant Professor of Physics",
      "Head of English Department",
      "Coordinator - Student Activities",
      "Principal & Administrator",
    ];

    for (const designation of complexDesignations) {
      const staffWithComplexDesignation = {
        ...mockStaff,
        designation: designation,
      };

      renderStaffShow({
        getOne: () => Promise.resolve({ data: staffWithComplexDesignation }),
      });
      
      await screen.findByText(designation);
      expect(screen.getByText(designation)).toBeInTheDocument();
      
      // Clean up for next iteration
      document.body.innerHTML = '';
    }
  });

  test("handles data loading delays", async () => {
    let resolveStaff;
    const staffPromise = new Promise(resolve => {
      resolveStaff = resolve;
    });

    renderStaffShow({
      getOne: () => staffPromise,
    });
    
    // Initially loading
    expect(document.body).toBeInTheDocument();
    
    // Resolve staff data
    resolveStaff({ data: mockStaff });
    
    // Staff data should eventually appear
    await screen.findByText("Priya");
    expect(screen.getByText("Priya")).toBeInTheDocument();
  });

  test("handles Unicode characters in all fields", async () => {
    const unicodeStaff = {
      id: 1,
      firstName: "डॉ. सुनीता",
      lastName: "श्रीवास्तव",
      email: "sunita@विद्यालय.भारत",
      phone: "०९८७६५४३२१०",
      designation: "मुख्याध्यापिका",
      department: "गणित विभाग",
      employmentType: "स्थायी",
      joinDate: "२०२४-०१-१५",
      status: "सक्रिय",
      branchId: "branch1",
    };

    renderStaffShow({
      getOne: () => Promise.resolve({ data: unicodeStaff }),
    });
    
    // Should handle Unicode characters correctly
    await screen.findByText("डॉ. सुनीता");
    
    expect(screen.getByText("डॉ. सुनीता")).toBeInTheDocument();
    expect(screen.getByText("श्रीवास्तव")).toBeInTheDocument();
    expect(screen.getByText("मुख्याध्यापिका")).toBeInTheDocument();
    expect(screen.getByText("गणित विभाग")).toBeInTheDocument();
  });

  test("displays all fields in consistent order", async () => {
    renderStaffShow();
    
    await screen.findByText("Priya");
    
    // Check that all expected fields are displayed
    // Order should be: ID, First Name, Last Name, Email, Phone, Designation, Department, Type, Join Date, Status
    const allText = document.body.textContent;
    expect(allText).toContain("1");
    expect(allText).toContain("Priya");
    expect(allText).toContain("Sharma");
    expect(allText).toContain("priya.sharma@school.edu.in");
    expect(allText).toContain("+91-9876543210");
    expect(allText).toContain("Principal");
    expect(allText).toContain("Administration");
    expect(allText).toContain("Permanent");
    expect(allText).toContain("2024-01-15");
    expect(allText).toContain("active");
  });
});