# Testing Patterns

Proven patterns for testing in Paramarsh SMS.

---

## Pattern: Real Component Imports {#real-component-imports}

**Problem**: Mock components provide no testing value
**Solution**: Always import and test real components

### ❌ NEVER Do This:
```typescript
// Creating mock components in test files
const MockStudentsCreate = () => (
  <div>
    <h2>Create Student</h2>
    <form>...</form>
  </div>
);

describe('Students Create', () => {
  it('renders', () => {
    render(<MockStudentsCreate />); // Testing fake HTML!
  });
});
```

### ✅ ALWAYS Do This:
```typescript
// Import real components
import { StudentsCreate } from '@/app/admin/resources/students/Create';
import { StudentsList } from '@/app/admin/resources/students/List';

describe('Students Create', () => {
  it('renders real component', () => {
    render(
      <TestWrapper>
        <StudentsCreate /> {/* Testing real component! */}
      </TestWrapper>
    );
  });
});
```

**When to Use**: EVERY frontend test
**Validation**: Check imports are from `@/app/admin/resources/`

---

## Pattern: React Admin Test Setup {#react-admin-test-setup}

**Problem**: React Admin components need proper context
**Solution**: Use comprehensive TestWrapper

### Complete Test Setup:
```typescript
import { AdminContext, ResourceContextProvider } from 'ra-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const mockI18nProvider = {
  translate: (key: string) => key,
  changeLocale: () => Promise.resolve(),
  getLocale: () => 'en',
};

const TestWrapper = ({ children, dataProvider, resource = 'students' }) => (
  <MemoryRouter>
    <QueryClientProvider client={queryClient}>
      <AdminContext 
        dataProvider={dataProvider}
        i18nProvider={mockI18nProvider}
      >
        <ResourceContextProvider value={resource}>
          {children}
        </ResourceContextProvider>
      </AdminContext>
    </QueryClientProvider>
  </MemoryRouter>
);
```

**When to Use**: Testing any React Admin component
**Validation**: No hook errors in test output

---

## Pattern: Mock Data Provider {#mock-data-provider}

**Problem**: Need consistent data provider for tests
**Solution**: Create comprehensive mock with all methods

### Complete Mock Data Provider:
```typescript
const createMockDataProvider = (data = []) => ({
  getList: jest.fn((resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const start = (page - 1) * perPage;
    const end = start + perPage;
    
    let filtered = [...data];
    
    // Apply filters
    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        filtered = filtered.filter(item => item[key] === value);
      });
    }
    
    // Apply sorting
    if (params.sort) {
      const { field, order } = params.sort;
      filtered.sort((a, b) => {
        if (order === 'ASC') {
          return a[field] > b[field] ? 1 : -1;
        }
        return a[field] < b[field] ? 1 : -1;
      });
    }
    
    return Promise.resolve({
      data: filtered.slice(start, end),
      total: filtered.length
    });
  }),
  
  getOne: jest.fn((resource, params) => {
    const item = data.find(d => d.id === params.id);
    return Promise.resolve({ data: item || {} });
  }),
  
  create: jest.fn((resource, params) => {
    const newItem = { id: Date.now(), ...params.data };
    data.push(newItem);
    return Promise.resolve({ data: newItem });
  }),
  
  update: jest.fn((resource, params) => {
    const index = data.findIndex(d => d.id === params.id);
    if (index >= 0) {
      data[index] = { ...data[index], ...params.data };
      return Promise.resolve({ data: data[index] });
    }
    return Promise.resolve({ data: {} });
  }),
  
  delete: jest.fn((resource, params) => {
    const index = data.findIndex(d => d.id === params.id);
    if (index >= 0) {
      const deleted = data.splice(index, 1)[0];
      return Promise.resolve({ data: deleted });
    }
    return Promise.resolve({ data: {} });
  }),
  
  getMany: jest.fn(() => Promise.resolve({ data })),
  getManyReference: jest.fn(() => Promise.resolve({ data, total: data.length }))
});
```

**When to Use**: All component tests needing data
**Validation**: Data operations work in tests

---

## Pattern: Testing User Workflows {#user-workflows}

**Problem**: Isolated tests don't validate workflows
**Solution**: Test complete user journeys

### Example Workflow Test:
```typescript
describe('Complete Student Management Workflow', () => {
  test('List → Create → Edit → Delete', async () => {
    const dataProvider = createMockDataProvider(initialData);
    
    // Step 1: View list
    const { rerender } = render(
      <TestWrapper dataProvider={dataProvider}>
        <StudentsList />
      </TestWrapper>
    );
    
    // Verify initial data
    expect(await screen.findByText('Student 1')).toBeInTheDocument();
    
    // Step 2: Create new
    const newStudent = { firstName: 'New', lastName: 'Student' };
    await dataProvider.create('students', { data: newStudent });
    
    // Step 3: Verify appears in list
    rerender(
      <TestWrapper dataProvider={dataProvider}>
        <StudentsList />
      </TestWrapper>
    );
    
    expect(await screen.findByText('New')).toBeInTheDocument();
    
    // Step 4: Edit
    await dataProvider.update('students', {
      id: 1,
      data: { firstName: 'Updated' }
    });
    
    // Step 5: Verify update
    const updated = await dataProvider.getOne('students', { id: 1 });
    expect(updated.data.firstName).toBe('Updated');
  });
});
```

**When to Use**: Integration testing
**Validation**: Complete flow works end-to-end

---

## Pattern: Date Edge Case Testing {#date-edge-cases}

**Problem**: Dates can be null/undefined/invalid
**Solution**: Test all edge cases

### Date Test Suite:
```typescript
const dateEdgeCases = [
  { date: null, expected: '-' },
  { date: undefined, expected: '-' },
  { date: '', expected: '-' },
  { date: 'invalid', expected: '-' },
  { date: '2024-01-15T10:30:00Z', expected: '1/15/2024' },
  { date: new Date('2024-01-15'), expected: '1/15/2024' }
];

dateEdgeCases.forEach(({ date, expected }) => {
  test(`handles date: ${date}`, () => {
    render(<ComponentWithDate date={date} />);
    
    // Should not crash
    expect(screen.queryByText(/Invalid time value/)).not.toBeInTheDocument();
    
    // Should show expected output
    if (expected !== '-') {
      expect(screen.getByText(expected)).toBeInTheDocument();
    }
  });
});
```

**When to Use**: Any component with dates
**Validation**: No "Invalid time value" errors

---

**Last Updated**: 2024-01-22
**Patterns Documented**: 5