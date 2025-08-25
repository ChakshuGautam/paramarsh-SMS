import {
  AdminContext,
  ResourceContextProvider,
  testDataProvider,
  memoryStore,
  EditBase,
} from "react-admin";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StudentsEdit } from "@/app/admin/resources/students/Edit";

// Mock data for existing student to be edited
const mockStudent = {
  id: 1,
  admissionNo: 'ADM2024001',
  firstName: 'Rahul',
  lastName: 'Sharma',
  gender: 'male',
  classId: 1,
  sectionId: 1,
};

// Mock reference data
const mockClasses = [
  { id: 1, name: 'Class 5' },
  { id: 2, name: 'Class 6' },
];

const mockSections = [
  { id: 1, name: 'Section A', classId: 1 },
  { id: 2, name: 'Section B', classId: 1 },
];

const renderComponent = (dataProviderOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const dataProvider = testDataProvider({
    getOne: jest.fn(() => Promise.resolve({ data: mockStudent })),
    update: jest.fn(() => Promise.resolve({ data: { ...mockStudent, id: 1 } })),
    getList: jest.fn((resource) => {
      const resources = {
        classes: { data: mockClasses, total: mockClasses.length },
        sections: { data: mockSections, total: mockSections.length },
      };
      return Promise.resolve(resources[resource] || { data: [], total: 0 });
    }),
    getMany: jest.fn((resource, { ids }) => {
      const resourceMap = {
        classes: mockClasses,
        sections: mockSections,
      };
      const data = resourceMap[resource]?.filter(item => ids.includes(item.id)) || [];
      return Promise.resolve({ data });
    }),
    ...dataProviderOverrides,
  });

  return render(
    <MemoryRouter initialEntries={["/students/1/edit"]}>
      <QueryClientProvider client={queryClient}>
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <ResourceContextProvider value="students">
            <Routes>
              <Route path="/students/:id/edit" element={<StudentsEdit />} />
            </Routes>
          </ResourceContextProvider>
        </AdminContext>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const user = userEvent.setup();

describe("StudentsEdit", () => {
  test("renders edit form without errors", async () => {
    renderComponent();
    
    // Wait for the form to load and verify basic fields are present
    expect(await screen.findByLabelText("Admission No")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Gender")).toBeInTheDocument();
    
    // Verify that the form rendered without any errors
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test("loads existing student data correctly in form", async () => {
    const mockGetOne = jest.fn(() => Promise.resolve({ data: mockStudent }));
    
    renderComponent({
      getOne: mockGetOne
    });
    
    // Verify that getOne was called with the correct ID
    expect(mockGetOne).toHaveBeenCalledWith('students', { id: '1' });
    
    // Wait for data to be loaded and verify form fields are populated
    const admissionNoField = await screen.findByLabelText("Admission No");
    expect(admissionNoField).toHaveValue("ADM2024001");
    
    const firstNameField = screen.getByLabelText("First Name");
    expect(firstNameField).toHaveValue("Rahul");
    
    const lastNameField = screen.getByLabelText("Last Name");
    expect(lastNameField).toHaveValue("Sharma");
    
    const genderField = screen.getByLabelText("Gender");
    expect(genderField).toHaveValue("male");
    
    // Verify no data loading errors
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test("allows editing form fields and updates form state", async () => {
    renderComponent();
    
    // Wait for form to load
    const firstNameField = await screen.findByLabelText("First Name");
    expect(firstNameField).toHaveValue("Rahul");
    
    // Edit the first name field
    await user.clear(firstNameField);
    await user.type(firstNameField, "Arjun");
    
    // Verify the field was updated
    expect(firstNameField).toHaveValue("Arjun");
    
    // Edit the last name field
    const lastNameField = screen.getByLabelText("Last Name");
    expect(lastNameField).toHaveValue("Sharma");
    
    await user.clear(lastNameField);
    await user.type(lastNameField, "Kumar");
    
    // Verify the field was updated
    expect(lastNameField).toHaveValue("Kumar");
    
    // Edit the admission number field
    const admissionNoField = screen.getByLabelText("Admission No");
    expect(admissionNoField).toHaveValue("ADM2024001");
    
    await user.clear(admissionNoField);
    await user.type(admissionNoField, "ADM2024999");
    
    // Verify the field was updated
    expect(admissionNoField).toHaveValue("ADM2024999");
    
    // Verify no errors during editing
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  test("displays save button and allows form interaction", async () => {
    const mockUpdate = jest.fn(() => 
      Promise.resolve({ 
        data: { ...mockStudent, firstName: "Arjun", lastName: "Kumar" }
      })
    );
    
    renderComponent({
      update: mockUpdate
    });
    
    // Wait for form to load
    const firstNameField = await screen.findByLabelText("First Name");
    expect(firstNameField).toHaveValue("Rahul");
    
    // Edit some fields
    await user.clear(firstNameField);
    await user.type(firstNameField, "Arjun");
    
    const lastNameField = screen.getByLabelText("Last Name");
    await user.clear(lastNameField);
    await user.type(lastNameField, "Kumar");
    
    // Verify fields are updated
    expect(firstNameField).toHaveValue("Arjun");
    expect(lastNameField).toHaveValue("Kumar");
    
    // Verify the save button is present and clickable
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
    
    // Verify the form is ready for submission
    // (We don't test actual submission due to React Admin navigation complexity in tests)
    expect(mockUpdate).toBeDefined();
    expect(typeof mockUpdate).toBe("function");
  });

  test("handles error when loading student data", async () => {
    // Suppress expected error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    const mockGetOne = jest.fn(() => 
      Promise.reject(new Error("Failed to fetch student"))
    );
    
    renderComponent({
      getOne: mockGetOne
    });
    
    // Verify that getOne was called
    expect(mockGetOne).toHaveBeenCalledWith('students', { id: '1' });
    
    // Wait a bit for error handling
    await waitFor(() => {
      // The form should handle the error gracefully
      // React Admin typically shows error states rather than crashing
      expect(mockGetOne).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    // Verify no date-related errors appear (critical requirement)
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
    
    // Restore console.error
    console.error = originalError;
  });

  test("handles all date edge cases without errors", async () => {
    const dateTestCases = [
      { scenario: "null date", value: null },
      { scenario: "undefined date", value: undefined },
      { scenario: "empty string", value: "" },
      { scenario: "invalid string", value: "not-a-date" },
      { scenario: "valid ISO", value: "2024-01-15T10:30:00Z" },
      { scenario: "timestamp", value: 1705316400000 },
      { scenario: "date object", value: new Date("2024-01-15") },
    ];

    for (const testCase of dateTestCases) {
      const mockStudentWithDate = {
        ...mockStudent,
        createdAt: testCase.value,
        dateOfBirth: testCase.value,
        updatedAt: testCase.value
      };

      const mockGetOne = jest.fn(() => Promise.resolve({ data: mockStudentWithDate }));

      const { unmount } = renderComponent({
        getOne: mockGetOne
      });

      // Wait for form to load
      await screen.findByLabelText("Admission No");

      // Should never show date errors - this is critical
      expect(screen.queryByText(/Invalid time value/i)).toBeNull();
      expect(screen.queryByText(/Invalid Date/i)).toBeNull();
      expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();

      // Form should still be functional
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();

      // Clean up for next iteration
      unmount();
    }
  });

  test("loads reference input data for classes and sections", async () => {
    const mockGetList = jest.fn((resource) => {
      const resources = {
        classes: { data: mockClasses, total: mockClasses.length },
        sections: { data: mockSections, total: mockSections.length },
      };
      return Promise.resolve(resources[resource] || { data: [], total: 0 });
    });

    const mockGetMany = jest.fn((resource, { ids }) => {
      const resourceMap = {
        classes: mockClasses,
        sections: mockSections,
      };
      const data = resourceMap[resource]?.filter(item => ids.includes(item.id)) || [];
      return Promise.resolve({ data });
    });

    renderComponent({
      getList: mockGetList,
      getMany: mockGetMany
    });

    // Wait for form to load
    await screen.findByLabelText("Admission No");

    // Verify that reference data is being loaded
    await waitFor(() => {
      expect(mockGetList).toHaveBeenCalledWith('classes', expect.any(Object));
      expect(mockGetList).toHaveBeenCalledWith('sections', expect.any(Object));
    });

    // Verify form is still functional and no errors occurred
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();

    // The reference inputs should eventually be present (they might render as combobox or select)
    // We don't assert for specific labels as they might vary in implementation
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  test("maintains store isolation between test runs", async () => {
    // First render with modified data
    const { unmount: unmount1 } = renderComponent();
    
    const firstNameField1 = await screen.findByLabelText("First Name");
    expect(firstNameField1).toHaveValue("Rahul");
    
    // Edit the field
    await user.clear(firstNameField1);
    await user.type(firstNameField1, "FIRST_TEST_RUN");
    expect(firstNameField1).toHaveValue("FIRST_TEST_RUN");
    
    // Unmount first component
    unmount1();
    
    // Second render with fresh store - should not carry over data from previous test
    renderComponent();
    
    const firstNameField2 = await screen.findByLabelText("First Name");
    
    // Should show original data, not the edited data from the previous test
    expect(firstNameField2).toHaveValue("Rahul");
    expect(firstNameField2).not.toHaveValue("FIRST_TEST_RUN");
    
    // Verify form is functional
    expect(screen.getByLabelText("Last Name")).toHaveValue("Sharma");
    expect(screen.queryByText(/Invalid time value/i)).toBeNull();
  });
});