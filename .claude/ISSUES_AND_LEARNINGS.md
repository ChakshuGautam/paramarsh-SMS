# Issues and Learnings Repository

This repository documents all issues encountered, solutions found, and patterns discovered. 
**SEARCH THIS FIRST** before starting any task.

---

## Critical Issues Database

### Issue #001: Mock Components vs Real Components in Tests
**Date**: 2024-01-22
**Agent**: frontend-tester v1.0
**Task**: Creating frontend tests
**Frequency**: Occurred 48+ times across all test files

**Problem**: 
Tests were creating mock HTML components instead of testing real React Admin components. This provided no real confidence in application functionality.

**Root Cause**:
Agent didn't understand that testing mock HTML provides no value. Tests like:
```typescript
const MockStudentsCreate = () => <div>Create Student</div>
```
Were testing nothing useful.

**Solution**:
Always import and test REAL components:
```typescript
import { StudentsCreate } from '@/app/admin/resources/students/Create';
import { StudentsList } from '@/app/admin/resources/students/List';
```

**Pattern Identified**:
Real Component Testing Pattern - Always test actual components users interact with
Pattern saved as: patterns/testing-patterns.md#real-component-imports

**Prevention Strategy**:
- Check imports before writing tests
- Verify components are from app directory, not mocks
- Use proper React Admin context setup

**Agent Updates Required**:
- frontend-tester: MUST import real components
- frontend-tester: MUST use proper React Admin providers

**Validation**:
Tests should import from `@/app/admin/resources/` not create mock components

**Related Issues**: #003

---

### Issue #002: Date Handling Causes "Invalid time value" Errors
**Date**: 2024-01-22
**Agent**: frontend-implementer v1.0, frontend-tester v1.0
**Task**: Displaying dates in components
**Frequency**: Occurred in every component with date fields

**Problem**: 
Frontend crashes with "Invalid time value" when encountering null, undefined, or invalid dates.

**Root Cause**:
No defensive date handling. Direct date formatting without checking validity.

**Solution**:
Always check date validity before formatting:
```typescript
const formatDate = (date: any) => {
  if (!date || date === '' || date === 'invalid') return '-';
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return '-';
  }
};
```

**Pattern Identified**:
Safe Date Formatting Pattern
Pattern saved as: patterns/component-patterns.md#safe-date-formatting

**Prevention Strategy**:
- Always validate dates before formatting
- Use utility functions for date handling
- Test with null/undefined/invalid dates

**Agent Updates Required**:
- frontend-implementer: Add date safety utilities
- frontend-tester: Test all date edge cases

**Validation**:
No "Invalid time value" errors in console

**Related Issues**: None

---

### Issue #003: React Admin Component Test Setup Failures
**Date**: 2024-01-22
**Agent**: frontend-tester v1.0
**Task**: Testing React Admin components
**Frequency**: Every test file needed fixing

**Problem**: 
Tests failing with "useEditController requires resource" and similar React Admin hook errors.

**Root Cause**:
Missing proper React Admin context providers in tests. Components expect:
- AdminContext with data provider
- ResourceContextProvider
- QueryClient
- MemoryRouter for routing
- i18nProvider for translations

**Solution**:
Create comprehensive test wrapper:
```typescript
const TestWrapper = ({ children, dataProvider }) => (
  <MemoryRouter>
    <QueryClientProvider client={queryClient}>
      <AdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceContextProvider value="students">
          {children}
        </ResourceContextProvider>
      </AdminContext>
    </QueryClientProvider>
  </MemoryRouter>
);
```

**Pattern Identified**:
React Admin Test Setup Pattern
Pattern saved as: patterns/testing-patterns.md#react-admin-test-setup

**Prevention Strategy**:
- Use TestWrapper for all React Admin component tests
- Include all required providers
- Mock i18n provider to avoid translation issues

**Agent Updates Required**:
- frontend-tester: Use complete TestWrapper setup
- frontend-tester: Include i18n provider

**Validation**:
No React Admin hook errors in test output

**Related Issues**: #001

---

### Issue #004: API Response Format Not Following React Admin Convention
**Date**: 2024-01-20
**Agent**: backend-implementer v1.0
**Task**: Creating API endpoints
**Frequency**: Multiple modules affected

**Problem**: 
APIs returning raw arrays/objects instead of React Admin expected format.

**Root Cause**:
Not following React Admin data provider expectations.

**Solution**:
Always wrap responses:
```typescript
// List endpoints
return { data: results, total: count };

// Single item endpoints  
return { data: item };
```

**Pattern Identified**:
React Admin API Response Pattern
Pattern saved as: patterns/api-patterns.md#response-format

**Prevention Strategy**:
- Use base service that enforces format
- Validate response structure in tests

**Agent Updates Required**:
- backend-implementer: Enforce response format
- tester: Validate response structure

**Validation**:
Frontend displays data correctly

**Related Issues**: None

---

### Issue #005: Multi-tenancy Headers Missing
**Date**: 2024-01-19
**Agent**: backend-implementer v1.0, tester v1.0
**Task**: Implementing multi-tenant isolation
**Frequency**: Found in initial implementations

**Problem**: 
X-Branch-Id headers not being validated or used for data filtering.

**Root Cause**:
Agents not aware of multi-tenancy requirement.

**Solution**:
- Add header validation in controllers
- Filter all queries by branchId
- Test with different branch IDs

**Pattern Identified**:
Multi-tenancy Pattern
Pattern saved as: patterns/api-patterns.md#multi-tenancy

**Prevention Strategy**:
- Always check for X-Branch-Id header
- Include branchId in all database queries
- Test data isolation between tenants

**Agent Updates Required**:
- backend-implementer: Add multi-tenancy to all endpoints
- tester: Test tenant isolation

**Validation**:
No data leakage between tenants in tests

**Related Issues**: None

---

## Quick Search Index

### By Component Type
- **Testing Issues**: #001, #003
- **Frontend Issues**: #002
- **Backend Issues**: #004, #005
- **Date Issues**: #002
- **React Admin Issues**: #001, #003, #004

### By Severity
- **Critical**: #002 (crashes app)
- **High**: #001 (no real testing)
- **Medium**: #003, #004, #005

### By Agent
- **frontend-tester**: #001, #003
- **frontend-implementer**: #002
- **backend-implementer**: #004, #005
- **tester**: #005

---

## Patterns Extracted

See individual pattern files in `.claude/patterns/` for detailed implementations:
- `testing-patterns.md`: Real component imports, React Admin setup
- `component-patterns.md`: Date safety, error handling
- `api-patterns.md`: Response format, multi-tenancy

---

## Prevention Checklist

Before implementing:
- [ ] Check if testing real components (not mocks)
- [ ] Add date safety for all date fields
- [ ] Include all React Admin providers in tests
- [ ] Wrap API responses in { data: ... } format
- [ ] Add X-Branch-Id header handling

---

---

### Issue #006: Missing Testing Library Import - render function
**Date**: 2024-01-24
**Agent**: frontend-tester v2.2
**Task**: Creating rooms module tests
**Frequency**: First occurrence

**Problem**: 
Test file missing `render` import from '@testing-library/react', causing "render is not defined" error.

**Root Cause**:
Incomplete import statement - only imported `screen, waitFor, within` but forgot `render`.

**Solution**:
Always import render along with other testing utilities:
```typescript
import { render, screen, waitFor, within } from '@testing-library/react';
```

**Pattern Identified**:
Complete Testing Library imports pattern
Pattern saved as: patterns/testing-patterns.md#complete-imports

**Prevention Strategy**:
- Use standard import template for all test files
- Include render in base test template

**Agent Updates Required**:
- frontend-tester: Include complete imports in test template

**Validation**:
Tests run without "render is not defined" error

**Related Issues**: None

---

---

### Issue #007: Frontend Tests Overly Complex
**Date**: 2024-01-24
**Agent**: frontend-tester v2.2
**Task**: Creating frontend component tests
**Frequency**: Occurred in ALL test files

**Problem**: 
Tests were overly complex with 100+ lines, multiple test scenarios, complex setups with many providers and wrappers. This made tests hard to maintain and understand.

**Root Cause**:
Agent was trying to be too comprehensive, testing every edge case and scenario in detail. This complexity provided no additional value.

**Solution**:
Use SIMPLE testing pattern with minimal setup:
```typescript
import React from 'react';
import { AdminContext } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component } from '@/app/admin/resources/module/Component';

test('<Component>', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AdminContext dataProvider={mockDataProvider}>
        <Component />
      </AdminContext>
    </QueryClientProvider>
  );
  
  expect(screen.getByText('expected')).toBeInTheDocument();
});
```

**Pattern Identified**:
Simple Testing Pattern - Maximum 40 lines, minimal setup, basic assertions
Pattern saved as: patterns/testing-patterns.md#simple-pattern

**Prevention Strategy**:
- Tests MUST be under 40 lines
- Use ONLY AdminContext + QueryClient setup
- Simple assertions only (renders, text visible)
- NO elaborate test scenarios

**Agent Updates Required**:
- frontend-tester: Updated to v3.0 with MANDATORY simple pattern

**Validation**:
Tests are concise, readable, and maintainable

**Related Issues**: #001, #003

---

---

### Issue #008: Frontend Testing Patterns Insufficient
**Date**: 2024-08-24
**Agent**: frontend-tester v3.0
**Task**: Writing comprehensive frontend tests
**Frequency**: Discovered through documentation review

**Problem**: 
The simple testing pattern was too basic. Missing critical features like store isolation, permission testing, responsive testing, and comprehensive mocking patterns.

**Root Cause**:
Agent was using overly simplified patterns that didn't match production requirements. The patterns lacked:
- Store isolation (causing test interference)
- Permission-based testing
- Responsive behavior testing
- Complex async handling
- Comprehensive mock contexts

**Solution**:
Use the comprehensive frontend testing guide at `/docs/frontend-testing-guide.md` as the primary reference. This guide provides production-tested patterns from real React Admin applications.

Key improvements:
```typescript
// Store isolation
store: memoryStore()

// Comprehensive mocking
const contextProps = createMockAdminContext({
  dataProvider: testDataProvider({...}),
  store: memoryStore(),
  permissions: ['posts.edit']
});

// Responsive testing
expect(screen.getByText('Desktop Only')).toHaveClass('hidden md:table-cell');
```

**Pattern Identified**:
Comprehensive Testing Pattern - Use frontend-testing-guide.md patterns
Pattern saved as: Primary reference is now the guide itself

**Prevention Strategy**:
- ALWAYS reference /docs/frontend-testing-guide.md
- Use memoryStore() for test isolation
- Include permission testing
- Test responsive behavior
- Use comprehensive mock contexts

**Agent Updates Required**:
- frontend-tester: Upgraded to v4.0 to use guide as primary reference

**Validation**:
Tests are production-quality with proper isolation and comprehensive coverage

**Related Issues**: #001, #003, #007

---

**Last Updated**: 2024-08-24
**Total Issues Documented**: 8
**Patterns Identified**: 8
**Agents Updated**: 6 (frontend-tester upgraded to v4.0)