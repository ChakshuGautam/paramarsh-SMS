import React from 'react';
import { render as rtlRender, RenderOptions, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminContext, ResourceContextProvider, testDataProvider, memoryStore, DataProvider } from 'react-admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { format } from 'date-fns';

// Enhanced render options with more configuration
interface EnhancedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  dataProvider?: Partial<DataProvider>;
  initialEntries?: string[];
  resource?: string;
  tenant?: string;
  user?: any;
  permissions?: string[];
  authProvider?: any;
  i18nProvider?: any;
}

// Comprehensive mock data with Indian context
export const mockIndianStudentData = [
  {
    id: 1,
    admissionNo: 'ADM2024001',
    firstName: 'Rahul',
    lastName: 'Sharma',
    gender: 'male',
    dateOfBirth: '2010-05-15',
    status: 'active',
    classId: 'class-10',
    sectionId: 'section-a',
    branchId: 'branch1',
    address: {
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    guardians: [
      {
        id: 'sg-1',
        isPrimary: true,
        relation: 'Father',
        guardian: {
          id: 'g-1',
          firstName: 'Suresh',
          lastName: 'Sharma',
          phoneNumber: '+91-9876543210',
          alternatePhoneNumber: '+91-9876543211',
          email: 'suresh.sharma@email.com',
          occupation: 'Engineer'
        }
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
  {
    id: 2,
    admissionNo: 'ADM2024002',
    firstName: 'Priya',
    lastName: 'Patel',
    gender: 'female',
    dateOfBirth: '2010-08-22',
    status: 'inactive',
    classId: 'class-10',
    sectionId: 'section-b',
    branchId: 'branch1',
    address: {
      street: '456 FC Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411016',
      country: 'India'
    },
    guardians: [
      {
        id: 'sg-2',
        isPrimary: true,
        relation: 'Mother',
        guardian: {
          id: 'g-2',
          firstName: 'Sunita',
          lastName: 'Patel',
          phoneNumber: '+91-9123456789',
          email: 'sunita.patel@email.com',
          occupation: 'Doctor'
        }
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
  {
    id: 3,
    admissionNo: 'ADM2024003',
    firstName: 'Arjun',
    lastName: 'Kumar',
    gender: 'male',
    dateOfBirth: '2008-12-10',
    status: 'graduated',
    classId: 'class-12',
    sectionId: 'section-a',
    branchId: 'branch1',
    address: {
      street: '789 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    guardians: [
      {
        id: 'sg-3',
        isPrimary: true,
        relation: 'Father',
        guardian: {
          id: 'g-3',
          firstName: 'Rajesh',
          lastName: 'Kumar',
          phoneNumber: '+91-9988776655',
          alternatePhoneNumber: '+91-9988776656',
          email: 'rajesh.kumar@email.com',
          occupation: 'Business'
        }
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  }
];

// Comprehensive date test scenarios
export const mockDateData = {
  validDates: {
    id: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    dueDate: '2024-02-15',
    dateOfBirth: '2010-05-15',
    enrollmentDate: new Date('2024-01-15'),
  },
  nullDates: {
    id: 2,
    createdAt: null,
    updatedAt: null,
    dueDate: null,
    dateOfBirth: null,
    enrollmentDate: null,
  },
  undefinedDates: {
    id: 3,
    createdAt: undefined,
    updatedAt: undefined,
    dueDate: undefined,
    dateOfBirth: undefined,
    enrollmentDate: undefined,
  },
  invalidDates: {
    id: 4,
    createdAt: 'invalid-date',
    updatedAt: '',
    dueDate: 'not-a-date',
    dateOfBirth: 'bad-date',
    enrollmentDate: 'invalid',
  },
  mixedDates: {
    id: 5,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: null,
    dueDate: '',
    dateOfBirth: undefined,
    enrollmentDate: 'invalid-date',
  },
  timestampDates: {
    id: 6,
    createdAt: 1705316400000,
    updatedAt: Date.now(),
    dueDate: 1708732800000,
    dateOfBirth: 1273881600000,
    enrollmentDate: new Date().getTime(),
  }
};

// Enhanced render function that properly sets up React Admin with all providers
export function renderWithEnhancedAdmin(
  ui: React.ReactElement,
  {
    dataProvider = {},
    initialEntries = ['/'],
    resource,
    tenant = 'branch1',
    user = { id: 1, name: 'Test User', permissions: ['admin'] },
    permissions = ['admin'],
    authProvider,
    i18nProvider,
    ...renderOptions
  }: EnhancedRenderOptions = {}
) {
  // Create fresh QueryClient for each test to avoid cache issues
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  // Enhanced data provider with multi-tenancy and realistic responses
  const defaultDataProvider = testDataProvider({
    getList: (resource, params) => {
      // Add tenant filtering by default
      const filter = { ...params.filter, branchId: tenant };
      return Promise.resolve({ data: [], total: 0 });
    },
    getOne: (resource, params) => Promise.resolve({ data: { id: params.id, branchId: tenant } }),
    create: (resource, params) => Promise.resolve({ data: { id: Date.now(), ...params.data, branchId: tenant } }),
    update: (resource, params) => Promise.resolve({ data: { id: params.id, ...params.data, branchId: tenant } }),
    delete: (resource, params) => Promise.resolve({ data: { id: params.id } }),
    getMany: (resource, params) => Promise.resolve({ data: [] }),
    getManyReference: (resource, params) => Promise.resolve({ data: [], total: 0 }),
    deleteMany: (resource, params) => Promise.resolve({ data: params.ids }),
    updateMany: (resource, params) => Promise.resolve({ data: params.ids }),
    ...dataProvider,
  });

  // Mock auth provider
  const defaultAuthProvider = authProvider || {
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    checkAuth: () => Promise.resolve(),
    checkError: () => Promise.resolve(),
    getIdentity: () => Promise.resolve(user),
    getPermissions: () => Promise.resolve(permissions),
  };

  function Wrapper({ children }: { children: React.ReactNode }) {
    const component = resource ? (
      <ResourceContextProvider value={resource}>
        {children}
      </ResourceContextProvider>
    ) : children;

    return (
      <MemoryRouter initialEntries={initialEntries}>
        <QueryClientProvider client={queryClient}>
          <AdminContext 
            dataProvider={defaultDataProvider} 
            authProvider={defaultAuthProvider}
            i18nProvider={i18nProvider}
            store={memoryStore()}
          >
            {component}
          </AdminContext>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Component-specific render helpers
export const renderStudentsList = (dataProviderOverrides = {}, options: EnhancedRenderOptions = {}) => {
  // Dynamic import to avoid circular dependencies
  const StudentsList = require('../../app/admin/resources/students/List').StudentsList;
  
  return renderWithEnhancedAdmin(
    <StudentsList />,
    {
      resource: 'students',
      initialEntries: ['/students'],
      dataProvider: {
        getList: () => Promise.resolve({ data: mockIndianStudentData, total: mockIndianStudentData.length }),
        getOne: (resource, params) => {
          if (resource === 'classes') {
            const classes = {
              'class-10': { id: 'class-10', name: 'Class 10' },
              'class-11': { id: 'class-11', name: 'Class 11' },
              'class-12': { id: 'class-12', name: 'Class 12' }
            };
            return Promise.resolve({ data: classes[params.id] || {} });
          }
          if (resource === 'sections') {
            const sections = {
              'section-a': { id: 'section-a', name: 'Section A' },
              'section-b': { id: 'section-b', name: 'Section B' },
              'section-c': { id: 'section-c', name: 'Section C' }
            };
            return Promise.resolve({ data: sections[params.id] || {} });
          }
          return Promise.resolve({ data: mockIndianStudentData.find(s => s.id === params.id) || {} });
        },
        getMany: (resource) => {
          if (resource === 'classes') {
            return Promise.resolve({ 
              data: [
                { id: 'class-10', name: 'Class 10' },
                { id: 'class-11', name: 'Class 11' },
                { id: 'class-12', name: 'Class 12' }
              ] 
            });
          }
          if (resource === 'sections') {
            return Promise.resolve({ 
              data: [
                { id: 'section-a', name: 'Section A' },
                { id: 'section-b', name: 'Section B' },
                { id: 'section-c', name: 'Section C' }
              ] 
            });
          }
          return Promise.resolve({ data: [] });
        },
        getManyReference: () => Promise.resolve({ data: [], total: 0 }),
        ...dataProviderOverrides
      },
      ...options
    }
  );
};

// Enhanced date error detection
export const detectDateErrors = (container: HTMLElement) => {
  const errors: string[] = [];
  
  // Check for various date error patterns
  const errorPatterns = [
    /Invalid time value/i,
    /Invalid Date/i,
    /NaN/,
    /undefined.*date/i,
    /null.*date/i
  ];
  
  errorPatterns.forEach((pattern) => {
    try {
      const elements = Array.from(container.querySelectorAll('*')).filter(el => 
        el.textContent && pattern.test(el.textContent)
      );
      if (elements.length > 0) {
        errors.push(`Found "${pattern.source}" error in ${elements.length} elements`);
      }
    } catch {}
  });
  
  return errors;
};

// Enhanced MUI detection
export const detectMUIImports = (container: HTMLElement) => {
  const muiSelectors = [
    '[class*="Mui"]',
    '[class*="MuiPaper"]',
    '[class*="MuiButton"]',
    '[class*="MuiTextField"]',
    '[class*="MuiFormControl"]',
    '[class*="MuiSelect"]',
    '[class*="MuiDialog"]',
    '[class*="MuiTable"]',
    '[class*="MuiChip"]',
    '[data-mui-*]',
    '.MuiBox-root',
    '.MuiContainer-root'
  ];
  
  const muiElements = muiSelectors.map(selector => 
    container.querySelectorAll(selector)
  ).reduce((total, nodeList) => total + nodeList.length, 0);
  
  return muiElements > 0;
};

// Business logic validation utilities
export const validateBusinessLogic = {
  // Student validation
  validateStudent: (student: any) => {
    const errors: string[] = [];
    
    if (!student.admissionNo || !/^ADM\d+$/.test(student.admissionNo)) {
      errors.push('Invalid admission number format');
    }
    
    if (!student.firstName || student.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    
    if (!student.lastName || student.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    
    if (!['male', 'female', 'other'].includes(student.gender)) {
      errors.push('Invalid gender value');
    }
    
    if (!['active', 'inactive', 'graduated', 'suspended'].includes(student.status)) {
      errors.push('Invalid status value');
    }
    
    // Date of birth validation
    if (student.dateOfBirth) {
      const dob = new Date(student.dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (age < 3 || age > 25) {
        errors.push('Date of birth indicates unrealistic age for student');
      }
    }
    
    return errors;
  },
  
  // Guardian validation
  validateGuardian: (guardian: any) => {
    const errors: string[] = [];
    
    if (!guardian.firstName || guardian.firstName.length < 2) {
      errors.push('Guardian first name must be at least 2 characters');
    }
    
    if (guardian.phoneNumber && !/^\+91-\d{10}$/.test(guardian.phoneNumber)) {
      errors.push('Invalid Indian phone number format');
    }
    
    if (guardian.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardian.email)) {
      errors.push('Invalid email format');
    }
    
    return errors;
  },
  
  // Class validation
  validateClass: (classData: any) => {
    const errors: string[] = [];
    
    if (!classData.name || !/^(Class|Grade)\s+\d+$/.test(classData.name)) {
      errors.push('Invalid class name format (should be "Class X" or "Grade X")');
    }
    
    if (classData.capacity && (classData.capacity < 10 || classData.capacity > 60)) {
      errors.push('Class capacity should be between 10 and 60 students');
    }
    
    return errors;
  }
};

// Form validation test utilities
export const formValidationHelpers = {
  // Test required field validation
  testRequiredFields: async (container: HTMLElement, requiredFields: string[]) => {
    const user = userEvent.setup();
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      const input = container.querySelector(`[name="${field}"], [id="${field}"], input[placeholder*="${field}" i]`);
      if (!input) {
        errors.push(`Required field "${field}" not found`);
        continue;
      }
      
      // Try to submit form with empty field
      const submitButton = container.querySelector('[type="submit"], button[type="submit"]');
      if (submitButton) {
        await user.click(submitButton);
        
        // Check for validation error
        await waitFor(() => {
          const errorMessage = container.querySelector(`[data-testid="${field}-error"], .error, .text-red-500, .text-destructive`);
          if (!errorMessage) {
            errors.push(`No validation error shown for required field "${field}"`);
          }
        });
      }
    }
    
    return errors;
  },
  
  // Test field format validation
  testFieldFormats: async (container: HTMLElement, fieldTests: Array<{field: string, invalidValue: string, expectedError?: string}>) => {
    const user = userEvent.setup();
    const errors: string[] = [];
    
    for (const test of fieldTests) {
      const input = container.querySelector(`[name="${test.field}"], [id="${test.field}"]`) as HTMLInputElement;
      if (!input) {
        errors.push(`Field "${test.field}" not found`);
        continue;
      }
      
      // Clear and type invalid value
      await user.clear(input);
      await user.type(input, test.invalidValue);
      
      // Trigger validation
      await user.tab();
      
      // Check for validation error
      await waitFor(() => {
        const errorMessage = container.querySelector(`[data-testid="${test.field}-error"], .error, .text-red-500, .text-destructive`);
        if (!errorMessage && test.expectedError) {
          errors.push(`No validation error shown for invalid "${test.field}" value: ${test.invalidValue}`);
        }
      });
    }
    
    return errors;
  }
};

// Accessibility testing utilities
export const accessibilityHelpers = {
  // Check for proper ARIA labels
  checkAriaLabels: (container: HTMLElement) => {
    const errors: string[] = [];
    
    // Check form inputs have labels
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      container.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) {
        errors.push(`Input ${index} missing accessible label`);
      }
    });
    
    // Check buttons have accessible names
    const buttons = container.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const hasAccessibleName = button.textContent?.trim() ||
                               button.getAttribute('aria-label') ||
                               button.getAttribute('aria-labelledby');
      if (!hasAccessibleName) {
        errors.push(`Button ${index} missing accessible name`);
      }
    });
    
    return errors;
  },
  
  // Check keyboard navigation
  testKeyboardNavigation: async (container: HTMLElement) => {
    const errors: string[] = [];
    const user = userEvent.setup();
    
    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      return ['No focusable elements found'];
    }
    
    // Test tab navigation
    try {
      await user.tab();
      const firstFocused = document.activeElement;
      if (!firstFocused || !container.contains(firstFocused)) {
        errors.push('First tab does not focus element in component');
      }
      
      // Test reverse tab
      await user.tab({ shift: true });
      const lastFocused = document.activeElement;
      if (lastFocused === firstFocused && focusableElements.length > 1) {
        errors.push('Shift+Tab does not work properly');
      }
    } catch (error) {
      errors.push(`Keyboard navigation error: ${error.message}`);
    }
    
    return errors;
  },
  
  // Check color contrast (basic check)
  checkColorContrast: (container: HTMLElement) => {
    const errors: string[] = [];
    
    // Check for light text on light background or dark on dark
    const textElements = container.querySelectorAll('*');
    textElements.forEach((element, index) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Basic check for problematic combinations
      if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
        errors.push(`Element ${index} has white text on white background`);
      }
      if (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(0, 0, 0)') {
        errors.push(`Element ${index} has black text on black background`);
      }
    });
    
    return errors;
  }
};

// Performance testing utilities
export const performanceHelpers = {
  // Measure render time
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    await act(() => {
      renderFn();
    });
    const end = performance.now();
    return end - start;
  },
  
  // Check for memory leaks
  checkMemoryLeaks: (container: HTMLElement) => {
    const warnings: string[] = [];
    
    // Check for excessive DOM nodes
    const nodeCount = container.querySelectorAll('*').length;
    if (nodeCount > 1000) {
      warnings.push(`High DOM node count: ${nodeCount} (consider virtualization)`);
    }
    
    // Check for unremoved event listeners (basic check)
    const elementsWithListeners = container.querySelectorAll('[onclick], [onchange], [oninput]');
    if (elementsWithListeners.length > 50) {
      warnings.push(`High number of inline event handlers: ${elementsWithListeners.length}`);
    }
    
    return warnings;
  },
  
  // Test large dataset handling
  generateLargeDataset: (count: number, template: any) => {
    return Array.from({ length: count }, (_, i) => ({
      ...template,
      id: i + 1,
      ...Object.keys(template).reduce((acc, key) => {
        if (typeof template[key] === 'string' && template[key].includes('{{index}}')) {
          acc[key] = template[key].replace('{{index}}', i.toString());
        }
        return acc;
      }, {} as any)
    }));
  }
};

// Multi-tenancy testing utilities
export const multiTenancyHelpers = {
  // Test tenant isolation
  testTenantIsolation: (mockDataProvider: any, tenant1Data: any[], tenant2Data: any[]) => {
    return {
      getList: jest.fn((resource: string, params: any) => {
        const branchId = params.filter?.branchId || 'branch1';
        const data = branchId === 'branch1' ? tenant1Data : tenant2Data;
        return Promise.resolve({ data, total: data.length });
      }),
      // Add other methods that should respect tenant isolation
      getOne: jest.fn((resource: string, params: any) => {
        const branchId = params.meta?.branchId || 'branch1';
        const data = branchId === 'branch1' ? tenant1Data : tenant2Data;
        const record = data.find(item => item.id === params.id);
        return Promise.resolve({ data: record || {} });
      }),
      ...mockDataProvider
    };
  },
  
  // Verify tenant header is included
  verifyTenantHeaders: (mockFn: jest.Mock, expectedTenant: string = 'branch1') => {
    const calls = mockFn.mock.calls;
    const callsWithWrongTenant = calls.filter(call => {
      const params = call[1];
      return params.filter?.branchId !== expectedTenant &&
             params.meta?.branchId !== expectedTenant;
    });
    
    return callsWithWrongTenant.length === 0;
  }
};

// Safe date formatting for tests
export const formatSafeDate = (date: any, formatStr: string = 'yyyy-MM-dd') => {
  if (!date || date === null || date === undefined || date === '') {
    return '-';
  }
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return '-';
    }
    return format(parsedDate, formatStr);
  } catch {
    return '-';
  }
};

// Enhanced waiting utilities
export const waitingHelpers = {
  // Wait for React Admin to finish loading
  waitForReactAdminLoad: async () => {
    await waitFor(
      () => {
        // Check that React Admin has finished its initial queries
        const loadingIndicators = document.querySelectorAll('[data-testid="loading"], .loading, [aria-label*="loading" i]');
        expect(loadingIndicators).toHaveLength(0);
      },
      { timeout: 5000 }
    );
  },
  
  // Wait for specific data to appear
  waitForData: async (expectedText: string) => {
    const element = await screen.findByText(expectedText, {}, { timeout: 5000 });
    return element;
  },
  
  // Wait for form to be ready
  waitForForm: async () => {
    await waitFor(
      () => {
        const form = document.querySelector('form');
        const submitButton = document.querySelector('[type="submit"], button[type="submit"]');
        expect(form || submitButton).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  }
};

// Export everything
export * from '@testing-library/react';
export { userEvent, screen, fireEvent, waitFor, act };