# Comprehensive React Admin Testing Patterns with Jest and React Testing Library

React Admin applications require specialized testing approaches due to their extensive use of contexts, providers, and complex component interactions. This guide incorporates real-world patterns from the official React Admin repository, Stack Overflow community examples, and production applications to provide comprehensive testing strategies for all major React Admin components.

## Foundation: Essential test setup and configuration

Based on the official React Admin examples and community patterns, there are two primary approaches for testing React Admin components: the modern **AdminContext** wrapper and the legacy **TestContext** from the ra-test package.

### Modern approach: AdminContext wrapper (Recommended)

The React Admin team now recommends using the AdminContext wrapper for most testing scenarios:

```javascript
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';
import { render, screen, waitFor } from '@testing-library/react';

test('UserShow component', async () => {
  const dataProvider = testDataProvider({
    getOne: () => Promise.resolve({ 
      data: { id: 1, name: 'Leila', role: 'admin' } 
    }),
  });

  render(
    <AdminContext 
      dataProvider={dataProvider}
      store={memoryStore()}
    >
      <UserShow id="1" />
    </AdminContext>
  );
  
  expect(await screen.findByDisplayValue('1')).toBeInTheDocument();
  expect(await screen.findByDisplayValue('Leila')).toBeInTheDocument();
});
```

### Legacy approach: TestContext from ra-test

For older React Admin versions or when you need more control over the test environment, you can use TestContext:

```javascript
import { TestContext } from 'ra-test';
import { render, screen } from '@testing-library/react';

describe('<EditManufacturer/>', () => {
  const mockEditManufacturerProps = {
    basePath: '/',
    id: '123',
    resource: 'foo',
  };

  render(
    <TestContext>
      <EditManufacturer {...mockEditManufacturerProps}/>
    </TestContext>
  );
});
```

The **memoryStore()** function is critical for test isolation, preventing state persistence between tests that can cause flaky results. Every test should use a fresh store instance to ensure complete isolation.

## Testing List components with filters

List components with filters represent one of the most common testing scenarios in React Admin applications. Based on the official React Admin examples and Stack Overflow community patterns, here are the proven approaches for testing filtering functionality.

### Real-world TextInput and SelectInput filter testing

From the official React Admin examples and community practices, here's how to test filters properly:

```javascript
import { TextInput, SelectInput, List, DataTable } from 'react-admin';
import { fireEvent, waitFor } from '@testing-library/react';
import { AdminContext, testDataProvider, memoryStore } from 'react-admin';

const studentFilters = [
  <TextInput key="search" source="q" placeholder="Search students..." label="" alwaysOn />,
  <SelectInput 
    key="gender"
    source="gender" 
    placeholder="Filter by gender" 
    label="" 
    choices={[
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: 'other', name: 'Other' }
    ]} 
  />,
];

describe('StudentsList Filters', () => {
  const mockStudents = [
    { id: 1, firstName: 'John', lastName: 'Doe', gender: 'male', admissionNo: 'A001' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', gender: 'female', admissionNo: 'A002' }
  ];

  it('should apply text filter and call dataProvider with correct parameters', async () => {
    const mockDataProvider = testDataProvider({
      getList: jest.fn().mockResolvedValue({
        data: mockStudents,
        total: 2
      })
    });

    render(
      <AdminContext dataProvider={mockDataProvider} store={memoryStore()}>
        <List resource="students" filters={studentFilters}>
          <DataTable>
            <DataTable.Col source="admissionNo" />
            <DataTable.Col source="firstName" />
            <DataTable.Col source="lastName" />
            <DataTable.Col source="gender" />
          </DataTable>
        </List>
      </AdminContext>
    );

    const searchInput = screen.getByPlaceholderText('Search students...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(mockDataProvider.getList).toHaveBeenCalledWith('students', 
        expect.objectContaining({
          filter: expect.objectContaining({ q: 'John' })
        })
      );
    });
  });

  it('should apply gender filter correctly', async () => {
    const mockDataProvider = testDataProvider({
      getList: jest.fn().mockResolvedValue({
        data: mockStudents.filter(s => s.gender === 'female'),
        total: 1
      })
    });

    render(
      <AdminContext dataProvider={mockDataProvider} store={memoryStore()}>
        <List resource="students" filters={studentFilters}>
          <DataTable>
            <DataTable.Col source="firstName" />
            <DataTable.Col source="gender" />
          </DataTable>
        </List>
      </AdminContext>
    );

    const genderSelect = screen.getByLabelText('Gender');
    fireEvent.change(genderSelect, { target: { value: 'female' } });

    await waitFor(() => {
      expect(mockDataProvider.getList).toHaveBeenCalledWith('students', 
        expect.objectContaining({
          filter: expect.objectContaining({ gender: 'female' })
        })
      );
    });

    expect(await screen.findByText('Jane')).toBeInTheDocument();
  });
});
```

## TabbedResourceList components and tab switching

Based on the official React Admin repository examples and community patterns on Stack Overflow, here's how to properly test tabbed components. The key is testing both the rendering of tabs and the state changes during tab switching.

### Testing TabbedShowLayout - Official React Admin pattern

From the official React Admin UserShow.spec.js example:

```javascript
import { Show, TabbedShowLayout, TextField, useCanAccess } from 'react-admin';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const UserShow = ({ permissions, ...props }) => {
  const canSeeRole = permissions === 'admin';
  
  return (
    <Show {...props}>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="user.form.summary">
          <TextField source="id" />
          <TextField source="name" />
        </TabbedShowLayout.Tab>
        {canSeeRole && (
          <TabbedShowLayout.Tab label="user.form.security" path="security">
            <TextField source="role" />
          </TabbedShowLayout.Tab>
        )}
      </TabbedShowLayout>
    </Show>
  );
};

describe('UserShow', () => {
  describe('As User', () => {
    it('should display one tab', () => {
      render(
        <AdminContext dataProvider={testDataProvider()} store={memoryStore()}>
          <UserShow permissions="user" id="1" resource="users" />
        </AdminContext>
      );
      
      const tabs = screen.queryAllByRole('tab');
      expect(tabs).toHaveLength(1);
    });

    it('should show the user identity in the first tab', async () => {
      const dataProvider = testDataProvider({
        getOne: () => Promise.resolve({ 
          data: { id: 1, name: 'Leila' } 
        })
      });

      render(
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <UserShow permissions="user" id="1" resource="users" />
        </AdminContext>
      );

      expect(await screen.findByDisplayValue('1')).toBeInTheDocument();
      expect(await screen.findByDisplayValue('Leila')).toBeInTheDocument();
    });
  });

  describe('As Admin', () => {
    it('should display two tabs', () => {
      render(
        <AdminContext dataProvider={testDataProvider()} store={memoryStore()}>
          <UserShow permissions="admin" id="1" resource="users" />
        </AdminContext>
      );
      
      const tabs = screen.queryAllByRole('tab');
      expect(tabs).toHaveLength(2);
    });

    it('should show the user role in the second tab', async () => {
      const dataProvider = testDataProvider({
        getOne: () => Promise.resolve({ 
          data: { id: 1, name: 'Leila', role: 'manager' } 
        })
      });

      render(
        <AdminContext dataProvider={dataProvider} store={memoryStore()}>
          <UserShow permissions="admin" id="1" resource="users" />
        </AdminContext>
      );

      const securityTab = await screen.findByRole('tab', { name: /security/i });
      fireEvent.click(securityTab);

      expect(await screen.findByDisplayValue('manager')).toBeInTheDocument();
    });
  });
});
```

### Testing custom TabbedResourceList component

For your specific TabbedResourceList pattern, here's how to test it:

```javascript
import { TabbedResourceList, statusTabs } from '@/components/admin';

const StudentsList = () => (
  <List
    sort={{ field: "firstName", order: "ASC" }}
    filterDefaultValues={{ status: "active" }}
    filters={studentFilters}
    perPage={10}
  >
    <TabbedResourceList
      tabs={statusTabs.student}
      defaultTab="active"
    >
      {(tab) => <StudentsTable storeKey={tab.storeKey} />}
    </TabbedResourceList>
  </List>
);

describe('TabbedResourceList for Students', () => {
  const mockStudents = {
    active: [
      { id: 1, firstName: 'John', status: 'active' },
      { id: 2, firstName: 'Jane', status: 'active' }
    ],
    inactive: [
      { id: 3, firstName: 'Bob', status: 'inactive' }
    ]
  };

  beforeEach(() => {
    // Mock statusTabs configuration
    statusTabs.student = [
      { label: 'Active', storeKey: 'active', filter: { status: 'active' } },
      { label: 'Inactive', storeKey: 'inactive', filter: { status: 'inactive' } }
    ];
  });

  it('should render tabs correctly and switch between them', async () => {
    const mockDataProvider = testDataProvider({
      getList: jest.fn((resource, params) => {
        const status = params.filter?.status || 'active';
        return Promise.resolve({
          data: mockStudents[status] || [],
          total: mockStudents[status]?.length || 0
        });
      })
    });

    render(
      <AdminContext dataProvider={mockDataProvider} store={memoryStore()}>
        <StudentsList />
      </AdminContext>
    );

    // Check default active tab is rendered
    expect(screen.getByRole('tab', { name: /active/i })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('John')).toBeInTheDocument();
    expect(await screen.findByText('Jane')).toBeInTheDocument();

    // Switch to inactive tab
    const inactiveTab = screen.getByRole('tab', { name: /inactive/i });
    fireEvent.click(inactiveTab);

    await waitFor(() => {
      expect(inactiveTab).toHaveAttribute('aria-selected', 'true');
    });

    // Verify inactive students are shown
    expect(await screen.findByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('John')).not.toBeInTheDocument();

    // Verify correct API calls were made
    expect(mockDataProvider.getList).toHaveBeenCalledWith('students',
      expect.objectContaining({
        filter: expect.objectContaining({ status: 'inactive' })
      })
    );
  });
});
```

## DataTable components with custom columns and rendering

DataTable testing involves verifying custom column rendering, bulk actions, and row-level customizations. Real-world applications like Navidrome demonstrate production-quality patterns for these scenarios.

### Custom column rendering

```javascript
const CustomPriceField = ({ source }) => {
  const record = useRecordContext();
  if (!record) return null;
  return <span data-testid="price">${record[source]?.toFixed(2)}</span>;
};

const ProductList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col source="price" field={CustomPriceField} />
      <DataTable.Col source="stock" />
    </DataTable>
  </List>
);

describe('DataTable with custom columns', () => {
  it('should render custom price field correctly', async () => {
    const dataProvider = testDataProvider({
      getList: () => Promise.resolve({
        data: [
          { id: 1, name: 'Product 1', price: 29.99, stock: 10 },
          { id: 2, name: 'Product 2', price: 49.50, stock: 5 }
        ],
        total: 2
      })
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <ProductList resource="products" />
      </AdminContext>
    );

    expect(await screen.findByText('$29.99')).toBeInTheDocument();
    expect(await screen.findByText('$49.50')).toBeInTheDocument();
  });
});
```

### Testing bulk actions

```javascript
describe('DataTable Bulk Actions', () => {
  it('should show bulk actions when rows are selected', async () => {
    const dataProvider = testDataProvider({
      getList: () => Promise.resolve({
        data: [
          { id: 1, title: 'Post 1', views: 100 },
          { id: 2, title: 'Post 2', views: 200 }
        ],
        total: 2
      }),
      updateMany: jest.fn().mockResolvedValue({ data: [1, 2] })
    });

    render(
      <AdminContext dataProvider={dataProvider}>
        <List resource="posts">
          <DataTable bulkActionButtons={<BulkUpdateButton label="Reset Views" data={{ views: 0 }} />}>
            <DataTable.Col source="title" />
            <DataTable.Col source="views" />
          </DataTable>
        </List>
      </AdminContext>
    );

    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first data row

    expect(screen.getByText('Reset Views')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Reset Views'));
    await waitFor(() => {
      expect(dataProvider.updateMany).toHaveBeenCalled();
    });
  });
});
```

## ReferenceField components and data relationships

ReferenceField components require careful mocking of related data fetching. The key is properly setting up the dataProvider to handle both the main resource and referenced resources.

```javascript
describe('ReferenceField with complex relationships', () => {
  const mockPosts = [
    { id: 1, title: 'Post 1', userId: 1, categoryId: 1 },
    { id: 2, title: 'Post 2', userId: 2, categoryId: 2 }
  ];

  const mockUsers = [
    { id: 1, name: 'John Doe', department: 'Engineering' },
    { id: 2, name: 'Jane Smith', department: 'Marketing' }
  ];

  const mockCategories = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Business' }
  ];

  const mockDataProvider = testDataProvider({
    getList: (resource) => {
      const resources = {
        posts: { data: mockPosts, total: 2 },
        users: { data: mockUsers, total: 2 },
        categories: { data: mockCategories, total: 2 }
      };
      return Promise.resolve(resources[resource] || { data: [], total: 0 });
    },
    getMany: (resource, { ids }) => {
      const resourceMap = {
        users: mockUsers,
        categories: mockCategories
      };
      const data = resourceMap[resource]?.filter(item => ids.includes(item.id)) || [];
      return Promise.resolve({ data });
    }
  });

  test('should display multiple referenced fields', async () => {
    const PostList = () => (
      <List resource="posts">
        <DataTable>
          <DataTable.Col source="title" />
          <DataTable.Col source="userId">
            <ReferenceField source="userId" reference="users">
              <TextField source="name" />
            </ReferenceField>
          </DataTable.Col>
          <DataTable.Col source="categoryId">
            <ReferenceField source="categoryId" reference="categories">
              <TextField source="name" />
            </ReferenceField>
          </DataTable.Col>
        </DataTable>
      </List>
    );

    render(
      <AdminContext dataProvider={mockDataProvider}>
        <PostList />
      </AdminContext>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
    });
  });
});
```

## Custom components using useRecordContext hook

Testing components that use useRecordContext requires proper setup of the RecordContext provider. Based on Stack Overflow discussions and community patterns, the most common issue is useRecordContext returning undefined when the hook is called outside the proper component hierarchy.

### Testing GuardianPhones component - Real-world pattern

Here's how to test your specific GuardianPhones component that uses useRecordContext:

```javascript
import { useRecordContext, RecordContextProvider } from 'react-admin';
import { render, screen, fireEvent } from '@testing-library/react';

// Your GuardianPhones component (simplified version for testing)
const GuardianPhones = () => {
  const record = useRecordContext();
  
  if (!record?.guardians || record.guardians.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }
  
  // Get primary guardian or first guardian
  const primaryRelation = record.guardians.find((sg) => sg.isPrimary) || record.guardians[0];
  const guardian = primaryRelation?.guardian;
  
  if (!guardian) {
    return <span className="text-muted-foreground">No guardian</span>;
  }
  
  const phoneNumbers = [];
  if (guardian.phoneNumber) {
    phoneNumbers.push(guardian.phoneNumber);
  }
  if (guardian.alternatePhoneNumber) {
    phoneNumbers.push(guardian.alternatePhoneNumber);
  }
  
  if (phoneNumbers.length === 0) {
    return <span className="text-muted-foreground">No phone</span>;
  }
  
  return (
    <div className="space-y-1" data-testid="guardian-phones">
      {phoneNumbers.map((phone, index) => (
        <div key={index} className="text-sm">
          {phone}
          {index === 0 && primaryRelation.relation && (
            <span className="text-xs text-muted-foreground ml-1">
              ({primaryRelation.relation})
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

describe('GuardianPhones component', () => {
  it('should display guardian phone numbers correctly', () => {
    const mockRecord = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      guardians: [
        {
          isPrimary: true,
          relation: 'father',
          guardian: {
            id: 1,
            name: 'John Sr.',
            phoneNumber: '555-0001',
            alternatePhoneNumber: '555-0002'
          }
        }
      ]
    };

    render(
      <RecordContextProvider value={mockRecord}>
        <GuardianPhones />
      </RecordContextProvider>
    );

    expect(screen.getByTestId('guardian-phones')).toBeInTheDocument();
    expect(screen.getByText('555-0001')).toBeInTheDocument();
    expect(screen.getByText('555-0002')).toBeInTheDocument();
    expect(screen.getByText('(father)')).toBeInTheDocument();
  });

  it('should handle no guardians case', () => {
    const mockRecord = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      guardians: []
    };

    render(
      <RecordContextProvider value={mockRecord}>
        <GuardianPhones />
      </RecordContextProvider>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle guardian with no phone numbers', () => {
    const mockRecord = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      guardians: [
        {
          isPrimary: true,
          relation: 'mother',
          guardian: {
            id: 2,
            name: 'Jane Doe'
            // No phoneNumber or alternatePhoneNumber
          }
        }
      ]
    };

    render(
      <RecordContextProvider value={mockRecord}>
        <GuardianPhones />
      </RecordContextProvider>
    );

    expect(screen.getByText('No phone')).toBeInTheDocument();
  });

  it('should handle multiple guardians and select primary', () => {
    const mockRecord = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      guardians: [
        {
          isPrimary: false,
          relation: 'mother',
          guardian: {
            id: 2,
            name: 'Jane Doe',
            phoneNumber: '555-0003'
          }
        },
        {
          isPrimary: true,
          relation: 'father',
          guardian: {
            id: 1,
            name: 'John Sr.',
            phoneNumber: '555-0001'
          }
        }
      ]
    };

    render(
      <RecordContextProvider value={mockRecord}>
        <GuardianPhones />
      </RecordContextProvider>
    );

    // Should display primary guardian's phone
    expect(screen.getByText('555-0001')).toBeInTheDocument();
    expect(screen.getByText('(father)')).toBeInTheDocument();
    // Should not display mother's phone
    expect(screen.queryByText('555-0003')).not.toBeInTheDocument();
  });
});

// Testing within a DataTable context (more realistic scenario)
describe('GuardianPhones in DataTable', () => {
  it('should work within a List/DataTable context', async () => {
    const mockStudents = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        admissionNo: 'A001',
        guardians: [
          {
            isPrimary: true,
            relation: 'father',
            guardian: {
              phoneNumber: '555-0001'
            }
          }
        ]
      }
    ];

    const mockDataProvider = testDataProvider({
      getList: () => Promise.resolve({ 
        data: mockStudents, 
        total: 1 
      })
    });

    render(
      <AdminContext dataProvider={mockDataProvider} store={memoryStore()}>
        <List resource="students">
          <DataTable>
            <DataTable.Col source="admissionNo" />
            <DataTable.Col source="firstName" />
            <DataTable.Col label="Guardian Phone">
              <GuardianPhones />
            </DataTable.Col>
          </DataTable>
        </List>
      </AdminContext>
    );

    // Wait for the data to load and check that guardian phone is displayed
    expect(await screen.findByText('555-0001')).toBeInTheDocument();
    expect(screen.getByText('(father)')).toBeInTheDocument();
  });
});
```

### Testing patterns for useRecordContext errors

Based on Stack Overflow issues, here's how to test for common useRecordContext problems:

```javascript
describe('useRecordContext edge cases', () => {
  it('should handle undefined record gracefully', () => {
    const ComponentWithRecordCheck = () => {
      const record = useRecordContext();
      if (!record) return <span data-testid="no-record">No record</span>;
      return <span data-testid="has-record">{record.name}</span>;
    };

    // Test without RecordContextProvider
    const { rerender } = render(<ComponentWithRecordCheck />);
    expect(screen.getByTestId('no-record')).toBeInTheDocument();

    // Test with RecordContextProvider
    rerender(
      <RecordContextProvider value={{ id: 1, name: 'Test' }}>
        <ComponentWithRecordCheck />
      </RecordContextProvider>
    );
    expect(screen.getByTestId('has-record')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Testing dependent and conditional filters

Conditional filters that show or hide based on other filter selections require careful state management testing. Based on community patterns from Stack Overflow and real-world applications, here's how to test the ClassFilter and SectionFilter pattern with hideUntilClassSelected logic.

### Real-world dependent filters testing

Your ClassFilter and SectionFilter pattern represents a common hierarchical filtering scenario. Here's how to test it properly:

```javascript
import { useListContext } from 'react-admin';
import { ClassFilter, SectionFilter } from '@/components/admin/dependent-filters';

// Mock your dependent filter components
const TestDependentFilters = () => {
  const { filterValues, setFilters } = useListContext();
  
  return (
    <div>
      <ClassFilter source="classId" placeholder="Filter by class" />
      <SectionFilter 
        source="sectionId" 
        classIdSource="classId"
        placeholder="Filter by section"
        showUnique={true}
        hideUntilClassSelected={true}
      />
    </div>
  );
};

describe('Dependent Filters with hideUntilClassSelected', () => {
  const mockClasses = [
    { id: 1, name: 'Class A' },
    { id: 2, name: 'Class B' }
  ];

  const mockSections = {
    1: [{ id: 1, name: 'Section 1' }, { id: 2, name: 'Section 2' }],
    2: [{ id: 3, name: 'Section 3' }, { id: 4, name: 'Section 4' }]
  };

  const mockStudents = [
    { id: 1, firstName: 'John', classId: 1, sectionId: 1 },
    { id: 2, firstName: 'Jane', classId: 1, sectionId: 2 },
    { id: 3, firstName: 'Bob', classId: 2, sectionId: 3 }
  ];

  beforeEach(() => {
    // Mock the filter components
    jest.mock('@/components/admin/dependent-filters', () => ({
      ClassFilter: ({ source, placeholder }) => {
        const { filterValues, setFilters } = useListContext();
        return (
          <select
            data-testid="class-filter"
            value={filterValues[source] || ''}
            onChange={(e) => {
              const newFilters = { ...filterValues };
              if (e.target.value) {
                newFilters[source] = e.target.value;
              } else {
                delete newFilters[source];
              }
              // Clear section when class changes
              delete newFilters.sectionId;
              setFilters(newFilters, {});
            }}
          >
            <option value="">{placeholder}</option>
            {mockClasses.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        );
      },
      SectionFilter: ({ source, classIdSource, placeholder, hideUntilClassSelected }) => {
        const { filterValues, setFilters } = useListContext();
        const classId = filterValues[classIdSource];
        
        if (hideUntilClassSelected && !classId) {
          return null;
        }
        
        const sections = mockSections[classId] || [];
        
        return (
          <select
            data-testid="section-filter"
            value={filterValues[source] || ''}
            onChange={(e) => {
              const newFilters = { ...filterValues };
              if (e.target.value) {
                newFilters[source] = e.target.value;
              } else {
                delete newFilters[source];
              }
              setFilters(newFilters, {});
            }}
          >
            <option value="">{placeholder}</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </select>
        );
      }
    }));
  });

  it('should progressively reveal filters based on selections', async () => {
    const mockDataProvider = testDataProvider({
      getList: jest.fn((resource, params) => {
        let filteredStudents = mockStudents;
        
        if (params.filter?.classId) {
          filteredStudents = filteredStudents.filter(s => s.classId == params.filter.classId);
        }
        
        if (params.filter?.sectionId) {
          filteredStudents = filteredStudents.filter(s => s.sectionId == params.filter.sectionId);
        }
        
        return Promise.resolve({ data: filteredStudents, total: filteredStudents.length });
      })
    });

    render(
      <AdminContext dataProvider={mockDataProvider} store={memoryStore()}>
        <List 
          resource="students" 
          filters={[<TestDependentFilters key="filters" />]}
        >
          <DataTable>
            <DataTable.Col source="firstName" />
          </DataTable>
        </List>
      </AdminContext>
    );

    // Initially only Class filter should be visible
    expect(screen.getByTestId('class-filter')).toBeInTheDocument();
    expect(screen.queryByTestId('section-filter')).not.toBeInTheDocument();

    // Select a class
    const classSelect = screen.getByTestId('class-filter');
    fireEvent.change(classSelect, { target: { value: '1' } });

    // Section filter should appear
    await waitFor(() => {
      expect(screen.getByTestId('section-filter')).toBeInTheDocument();
    });

    // Verify sections are correct for selected class
    const sectionSelect = screen.getByTestId('section-filter');
    expect(sectionSelect).toBeInTheDocument();
    
    // Select a section
    fireEvent.change(sectionSelect, { target: { value: '1' } });

    // Verify dataProvider is called with correct filters
    await waitFor(() => {
      expect(mockDataProvider.getList).toHaveBeenCalledWith('students', 
        expect.objectContaining({
          filter: expect.objectContaining({ 
            classId: '1',
            sectionId: '1'
          })
        })
      );
    });

    // Should show filtered results
    expect(await screen.findByText('John')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument(); // Bob is in class 2
  });

  it('should clear section filter when class changes', async () => {
    const mockDataProvider = testDataProvider({
      getList: jest.fn().mockResolvedValue({ data: mockStudents, total: mockStudents.length })
    });

    render(
      <AdminContext dataProvider={mockDataProvider} store={memoryStore()}>
        <List 
          resource="students" 
          filters={[<TestDependentFilters key="filters" />]}
        >
          <DataTable>
            <DataTable.Col source="firstName" />
          </DataTable>
        </List>
      </AdminContext>
    );

    const classSelect = screen.getByTestId('class-filter');
    
    // Select class 1
    fireEvent.change(classSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('section-filter')).toBeInTheDocument();
    });

    const sectionSelect = screen.getByTestId('section-filter');
    
    // Select a section
    fireEvent.change(sectionSelect, { target: { value: '1' } });

    // Change class - section should be cleared
    fireEvent.change(classSelect, { target: { value: '2' } });

    await waitFor(() => {
      expect(sectionSelect.value).toBe(''); // Section should be cleared
    });

    // Verify API call was made with only class filter
    expect(mockDataProvider.getList).toHaveBeenCalledWith('students', 
      expect.objectContaining({
        filter: expect.objectContaining({ classId: '2' })
      })
    );

    // Section filter should not have sectionId in the latest call
    const lastCall = mockDataProvider.getList.mock.calls[mockDataProvider.getList.mock.calls.length - 1];
    expect(lastCall[1].filter).not.toHaveProperty('sectionId');
  });

  it('should hide section filter when class is deselected', async () => {
    const mockDataProvider = testDataProvider({
      getList: jest.fn().mockResolvedValue({ data: mockStudents, total: mockStudents.length })
    });

    render(
      <AdminContext dataProvider={mockDataProvider} store={memoryStore()}>
        <List 
          resource="students" 
          filters={[<TestDependentFilters key="filters" />]}
        >
          <DataTable>
            <DataTable.Col source="firstName" />
          </DataTable>
        </List>
      </AdminContext>
    );

    const classSelect = screen.getByTestId('class-filter');
    
    // Select a class to show section filter
    fireEvent.change(classSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('section-filter')).toBeInTheDocument();
    });

    // Deselect class
    fireEvent.change(classSelect, { target: { value: '' } });

    // Section filter should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('section-filter')).not.toBeInTheDocument();
    });
  });
});
```

## Row styling and conditional rendering based on record data

Testing row styling requires verifying that CSS classes and inline styles are correctly applied based on record properties. This pattern is essential for visual feedback in data tables.

```javascript
const CustomDatagridRow = ({ record, resource, id, onToggleItem, children, selected, selectable, basePath }) => {
  const isOverdue = record.status === 'overdue';
  const isPriority = record.priority === 'high';
  
  return (
    <TableRow
      className={clsx({
        'bg-red-100': isOverdue,
        'font-bold': isPriority,
        'opacity-50': record.archived
      })}
      data-testid={`row-${record.id}`}
      data-status={record.status}
      data-priority={record.priority}
    >
      {selectable && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={event => onToggleItem(id, event)}
          />
        </TableCell>
      )}
      {React.Children.map(children, field =>
        React.isValidElement(field) ? (
          <TableCell key={field.props.source}>
            {React.cloneElement(field, { record, resource, basePath })}
          </TableCell>
        ) : null
      )}
    </TableRow>
  );
};

describe('Row styling based on record data', () => {
  const mockTasks = [
    { id: 1, title: 'Normal Task', status: 'active', priority: 'normal', archived: false },
    { id: 2, title: 'Overdue Task', status: 'overdue', priority: 'high', archived: false },
    { id: 3, title: 'Archived Task', status: 'completed', priority: 'low', archived: true }
  ];

  test('should apply conditional styling to rows', async () => {
    render(
      <AdminContext dataProvider={testDataProvider({
        getList: () => Promise.resolve({ data: mockTasks, total: 3 })
      })}>
        <List resource="tasks">
          <Datagrid row={CustomDatagridRow}>
            <TextField source="title" />
            <TextField source="status" />
            <TextField source="priority" />
          </Datagrid>
        </List>
      </AdminContext>
    );

    // Test overdue and high priority styling
    const overdueRow = await screen.findByTestId('row-2');
    expect(overdueRow).toHaveClass('bg-red-100', 'font-bold');
    expect(overdueRow).toHaveAttribute('data-status', 'overdue');
    expect(overdueRow).toHaveAttribute('data-priority', 'high');

    // Test archived styling
    const archivedRow = await screen.findByTestId('row-3');
    expect(archivedRow).toHaveClass('opacity-50');

    // Test normal row has no special styling
    const normalRow = await screen.findByTestId('row-1');
    expect(normalRow).not.toHaveClass('bg-red-100', 'font-bold', 'opacity-50');
  });
});
```

## Mock patterns for React Admin providers and data contexts

Advanced mocking patterns enable comprehensive testing of complex scenarios involving authentication, permissions, and multiple providers working together.

### Complete mock context factory

```javascript
const createMockAdminContext = (options = {}) => {
  const {
    dataProvider = testDataProvider(),
    authProvider,
    i18nProvider,
    store = memoryStore(),
    permissions = 'admin',
    notifications = []
  } = options;

  const mockAuthProvider = {
    login: jest.fn(() => Promise.resolve()),
    logout: jest.fn(() => Promise.resolve()),
    checkAuth: jest.fn(() => Promise.resolve()),
    checkError: jest.fn(() => Promise.resolve()),
    getIdentity: jest.fn(() => Promise.resolve({ id: 1, fullName: 'Test User' })),
    getPermissions: jest.fn(() => Promise.resolve(permissions)),
    ...authProvider
  };

  const mockI18nProvider = {
    translate: jest.fn((key, options) => options?._ || key),
    changeLocale: jest.fn(() => Promise.resolve()),
    getLocale: jest.fn(() => 'en'),
    ...i18nProvider
  };

  const mockNotificationProvider = {
    notify: jest.fn(),
    notifications,
    addNotification: jest.fn(),
    clearNotifications: jest.fn()
  };

  return {
    dataProvider,
    authProvider: mockAuthProvider,
    i18nProvider: mockI18nProvider,
    store,
    notificationProvider: mockNotificationProvider
  };
};

// Usage in tests
describe('Complex provider interactions', () => {
  test('should handle authenticated user with specific permissions', async () => {
    const contextProps = createMockAdminContext({
      permissions: ['posts.edit', 'posts.delete'],
      dataProvider: testDataProvider({
        getList: () => Promise.resolve({ 
          data: [{ id: 1, title: 'Post 1', author: 'Admin' }], 
          total: 1 
        })
      })
    });

    const TestComponent = () => {
      const permissions = usePermissions();
      const { identity } = useGetIdentity();
      
      return (
        <div>
          <span data-testid="user-name">{identity?.fullName}</span>
          {permissions.includes('posts.edit') && (
            <button data-testid="edit-button">Edit</button>
          )}
          {permissions.includes('posts.delete') && (
            <button data-testid="delete-button">Delete</button>
          )}
        </div>
      );
    };

    render(
      <AdminContext {...contextProps}>
        <TestComponent />
      </AdminContext>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    expect(contextProps.authProvider.getPermissions).toHaveBeenCalled();
    expect(contextProps.authProvider.getIdentity).toHaveBeenCalled();
  });
});
```

## Testing filtering behavior and search functionality

Search and filtering represent core functionality in React Admin applications. Testing these features requires understanding the debouncing behavior and proper async handling.

```javascript
describe('Advanced filtering and search', () => {
  test('should handle debounced search with loading states', async () => {
    let resolveSearch;
    const searchPromise = new Promise(resolve => { resolveSearch = resolve; });
    
    const mockDataProvider = testDataProvider({
      getList: jest.fn((resource, params) => {
        if (params.filter.q) {
          return searchPromise;
        }
        return Promise.resolve({ data: [], total: 0 });
      })
    });

    const SearchableList = () => (
      <List filters={[<TextInput source="q" label="Search" alwaysOn />]} debounce={500}>
        <DataTable>
          <DataTable.Col source="title" />
        </DataTable>
      </List>
    );

    render(
      <AdminContext dataProvider={mockDataProvider}>
        <SearchableList resource="posts" />
      </AdminContext>
    );

    const searchInput = screen.getByLabelText('Search');
    
    // Type search query
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Should not call immediately due to debounce
    expect(mockDataProvider.getList).not.toHaveBeenCalledWith(
      'posts',
      expect.objectContaining({ filter: { q: 'test' } })
    );

    // Wait for debounce
    await waitFor(() => {
      expect(mockDataProvider.getList).toHaveBeenCalledWith(
        'posts',
        expect.objectContaining({ filter: { q: 'test' } })
      );
    }, { timeout: 600 });

    // Loading indicator should appear
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Resolve search
    resolveSearch({ 
      data: [{ id: 1, title: 'Test Result' }], 
      total: 1 
    });

    // Results should appear
    await waitFor(() => {
      expect(screen.getByText('Test Result')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});
```

## Testing responsive column visibility

Responsive design testing requires mocking window.matchMedia and verifying that columns properly respond to viewport changes.

```javascript
// Helper to mock matchMedia
const createMatchMediaMock = (matches) => {
  return jest.fn().mockImplementation(query => ({
    matches: matches[query] || false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe('Responsive column visibility', () => {
  test('should hide columns on mobile and show on desktop', async () => {
    // Test mobile view
    window.matchMedia = createMatchMediaMock({
      '(min-width: 768px)': false,
      '(min-width: 1024px)': false
    });

    const ResponsiveDataTable = () => (
      <List>
        <DataTable>
          <DataTable.Col source="id" />
          <DataTable.Col source="title" />
          <DataTable.Col 
            source="author" 
            sx={{ 
              display: { xs: 'none', md: 'table-cell' } 
            }}
            className="hidden md:table-cell"
          />
          <DataTable.Col 
            source="publishedAt" 
            sx={{ 
              display: { xs: 'none', lg: 'table-cell' } 
            }}
            className="hidden lg:table-cell"
          />
        </DataTable>
      </List>
    );

    const { rerender } = render(
      <AdminContext dataProvider={testDataProvider({
        getList: () => Promise.resolve({ 
          data: [{ 
            id: 1, 
            title: 'Post', 
            author: 'Author', 
            publishedAt: '2024-01-01' 
          }], 
          total: 1 
        })
      })}>
        <ResponsiveDataTable resource="posts" />
      </AdminContext>
    );

    // On mobile, only id and title should be visible
    expect(await screen.findByText('Post')).toBeInTheDocument();
    
    // Verify responsive columns have correct classes
    const authorHeader = screen.getByText('Author').closest('th');
    expect(authorHeader).toHaveClass('hidden', 'md:table-cell');
    
    const publishedHeader = screen.getByText('Published At').closest('th');
    expect(publishedHeader).toHaveClass('hidden', 'lg:table-cell');

    // Test desktop view
    window.matchMedia = createMatchMediaMock({
      '(min-width: 768px)': true,
      '(min-width: 1024px)': true
    });

    rerender(
      <AdminContext dataProvider={testDataProvider({
        getList: () => Promise.resolve({ 
          data: [{ 
            id: 1, 
            title: 'Post', 
            author: 'Author', 
            publishedAt: '2024-01-01' 
          }], 
          total: 1 
        })
      })}>
        <ResponsiveDataTable resource="posts" />
      </AdminContext>
    );

    // All columns should be visible on desktop
    expect(screen.getByText('Author')).toBeVisible();
    expect(screen.getByText('Published At')).toBeVisible();
  });
});
```

## Best practices and key takeaways

The React Admin testing ecosystem has matured significantly, with real-world patterns emerging from official examples, Stack Overflow discussions, and production applications. Here are the key insights from the community:

**Store isolation remains critical** for preventing test interference. Every test should use a fresh `memoryStore()` instance, as the React Admin store persists data across tests by default, leading to unpredictable failures in test suites. This pattern is consistently reinforced in official React Admin examples.

**Focus on user-visible behavior** rather than implementation details. The React Admin team and Stack Overflow community strongly recommend React Testing Library over Enzyme specifically because it encourages testing components the way users interact with them. This approach results in more resilient tests that don't break with internal refactoring.

**Proper async handling** is essential throughout React Admin testing. Most operations involve asynchronous data fetching, so liberal use of `waitFor()` and `findBy*` queries ensures tests wait for the appropriate conditions before making assertions. The community has found that hardcoded delays with `setTimeout` should be avoided in favor of these proper async utilities.

**Test permissions and conditional rendering** extensively. Based on the official UserShow.spec.js example, testing permission-based component visibility is crucial in React Admin applications. Always test both the "user" and "admin" scenarios to ensure proper access control.

**Mock at the appropriate level** for each test scenario. The React Admin community has settled on `testDataProvider` for most unit tests, while integration tests might use actual API calls or more comprehensive mocking. The `AdminContext` wrapper provides the perfect balance of isolation and realism for most component tests.

**Handle useRecordContext edge cases** proactively. Stack Overflow discussions frequently mention issues with useRecordContext returning undefined. Always check for record existence in components, and use RecordContextProvider in tests to provide proper context.

**Test filter interactions thoroughly**. Real-world applications heavily rely on filtering, so test both simple filters and complex dependent filter scenarios. The community emphasizes testing the actual dataProvider calls to ensure filters are applied correctly.

**Use realistic test data structures** that match your actual API responses. The React Admin examples show the importance of using data structures that mirror production, especially for complex relationships like your guardian-student associations.

**Leverage React Admin's testing utilities**. Both AdminContext and TestContext (from ra-test) provide essential scaffolding for React Admin tests. Choose AdminContext for newer applications and TestContext for legacy support or when you need finer control over the test environment.

**Test responsive behavior and column visibility** when using DataTable components with responsive design. Mobile-first applications need to ensure columns hide/show properly based on viewport size.

The testing patterns documented here, drawn from official documentation, production applications, and community experience, provide a comprehensive foundation for testing React Admin applications. By following these proven patterns and adapting them to specific use cases, development teams can build robust test suites that ensure application reliability while maintaining development velocity.