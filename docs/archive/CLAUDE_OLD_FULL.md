# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Quick Reference Available**: See `.claude/QUICK_REFERENCE.md` for a concise checklist and common commands.

# Paramarsh SMS - School Management System

## Repository Structure
This is a monorepo containing a full-stack School Management System with:
- **apps/api**: NestJS backend API server  
- **apps/web**: Next.js frontend with React Admin
- **services/mock-api**: Local-only mock server (development only)
- **packages**: Shared libraries and configurations
- **docs**: Technical documentation and API specs
- Uses bun workspaces and Turbo for monorepo management
- Multi-tenant architecture with school/branch support

## Common Commands

### Development
```bash
# Start backend API server (runs on port 8080)
cd apps/api && PORT=8080 bun run start:dev

# Start frontend development server  
cd apps/web && bun run dev

# Install dependencies (from root)
bun install

# Build all packages
bun run build

# Run tests
bun run test
bun run test:e2e

# Run specific test file
cd apps/api && bun test src/students/students.service.spec.ts
```

### Database & Migrations
```bash
# Run Prisma migrations
cd apps/api && npx prisma migrate dev

# Generate Prisma client
cd apps/api && npx prisma generate

# Open Prisma Studio
cd apps/api && npx prisma studio

# Seed the database
cd apps/api && npx prisma db seed

# Reset database and seed
cd apps/api && bun run db:reset
```

### Code Quality
```bash
# Run linter (from root or specific app)
bun run lint

# Run type checking  
bun run typecheck

# Format code
bun run format

# Run all checks before committing
bun run lint && bun run typecheck && bun run test
```

## Architecture Overview

### Backend (apps/api)
- **Framework**: NestJS with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production) with Prisma ORM
- **Multi-tenancy**: School isolation via branchId (internally) / schoolId (API layer)
  - Headers: X-Branch-Id (defaults to 'branch1')
  - Database uses "branchId" but API/UI uses "schoolId" for clarity
- **API Pattern**: RESTful with /api/v1 prefix following React Admin Data Provider spec
- **Authentication**: JWT-based (in development)
- **Main entry**: src/main.ts (listens on PORT env var, defaults to 3000)
- **Base Service**: Common CRUD operations in src/common/base-crud.service.ts
- **Multi-tenant Service**: src/prisma/prisma.service.ts handles tenant context

### Frontend (apps/web)
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI Library**: React Admin with shadcn/ui components
- **API Proxy**: /api/admin routes proxy to backend at localhost:8080
- **Styling**: Tailwind CSS v4
- **State Management**: React Admin's data provider pattern
- **Auth**: Clerk integration (in development)
- **Data Provider**: apps/web/app/admin/DataProvider.tsx handles API communication

## API Development Guidelines

### React Admin Data Provider Specification
All APIs MUST follow React Admin's data provider specification:

#### List (GET /resource)
- Query params: `page`, `pageSize`, `sort`, `filter`
- Response: `{ data: T[], total: number }`
- Sort format: `sort=field` (ASC) or `sort=-field` (DESC)
- Filter format: URL-encoded JSON object

#### Get One (GET /resource/:id)
- Response: `{ data: T }`

#### Create (POST /resource)
- Request body: Resource data
- Response: `{ data: T }` (created resource with id)

#### Update (PUT /resource/:id)
- Request body: Updated resource data
- Response: `{ data: T }` (updated resource)

#### Delete (DELETE /resource/:id)
- Response: `{ data: T }` (deleted resource)

#### Get Many (GET /resource?ids=[])
- Query param: `ids` as comma-separated list
- Response: `{ data: T[] }`

### Testing Requirements

#### API Testing
- **ALWAYS write E2E tests for new APIs**
- Test files go in `apps/api/test/` folder
- Use seed data from `apps/api/test/seed-data/`
- Test multi-tenancy with different X-Branch-Id headers
- Test React Admin Data Provider compliance

Example test structure:
```typescript
describe('Students API', () => {
  it('should return paginated list for tenant', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/students?page=1&pageSize=10')
      .set('X-Branch-Id', 'branch1');
    
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should isolate data between tenants', async () => {
    const branch1Response = await request(app.getHttpServer())
      .get('/api/v1/students')
      .set('X-Branch-Id', 'branch1');
    
    const branch2Response = await request(app.getHttpServer())
      .get('/api/v1/students')
      .set('X-Branch-Id', 'branch2');
    
    // Ensure data isolation
    expect(branch1Response.body.data).not.toEqual(branch2Response.body.data);
  });
});
```

#### Frontend Testing
- Test Data Provider methods for each resource
- Verify proper header inclusion (X-Branch-Id)
- Test error handling and retries

## Key Modules & Features

### Core Modules
- **Students**: Student records, enrollment, status tracking, roll numbers, photos
- **Teachers**: Staff and teacher management with subject assignments
- **Classes & Sections**: Academic structure with timetable integration
- **Attendance**: Period-based and daily attendance for students/teachers
- **Exams**: Indian exam system with terms, marks entry, grade calculation
- **Fees**: Invoice generation, payment tracking, fee structures
- **Communications**: Messaging campaigns, templates, SMS/Email
- **Timetable**: Period scheduling, teacher assignments, room allocation
- **Academic Years**: Session management with terms and holidays

### Database Schema
- Multi-tenant with branchId (represents schoolId in API/UI)
- Soft deletes with deletedAt timestamps
- Audit fields: createdAt, updatedAt, createdBy, updatedBy
- Status enums for various entities (ACTIVE, INACTIVE, etc.)
- Junction tables for many-to-many relationships (e.g., StudentGuardian)

## Critical Implementation Notes

### Multi-tenancy
- **IMPORTANT**: Database uses "branchId" but API/UI uses "schoolId"
- Always include X-Branch-Id header (defaults to 'branch1')
- All queries must be scoped to tenant context
- Use BaseCrudService for automatic tenant filtering
- **ALWAYS test tenant isolation in E2E tests**

### Port Configuration
- Backend MUST run on port 8080 for frontend proxy to work
- Set via: `PORT=8080 bun run start:dev`

### Testing Best Practices
1. Always write E2E tests for new API endpoints
2. Test with seed data from test/seed-data folder
3. Test multi-tenant isolation explicitly
4. Verify React Admin Data Provider spec compliance
5. Test pagination, sorting, and filtering
6. Test error cases and validation

### Indian Exam System
- Supports terms (Term 1, Term 2, Finals)
- Mark types: Theory, Practical, Internal Assessment
- Grade calculation based on total marks
- Subject-wise and consolidated mark sheets

## Development Workflow

### Starting Development
1. Ensure database is set up (SQLite for dev)
2. Start backend: `cd apps/api && PORT=8080 bun run start:dev`
3. Start frontend: `cd apps/web && bun run dev`
4. Access app at http://localhost:3000/admin
5. API docs available at http://localhost:8080/api-docs

### Making Changes
1. Make changes ensuring proper tenant/school handling
2. **Write E2E tests for API changes**
3. Run tests: `bun run test:e2e`
4. Run linter: `bun run lint`
5. Run type checking: `bun run typecheck`
6. Test multi-tenant isolation manually
7. Commit with descriptive message

## Important Files & Utilities

### Configuration
- `apps/api/prisma/schema.prisma` - Database schema (branchId = schoolId)
- `apps/api/src/main.ts` - API server entry point
- `apps/api/test/` - E2E test folder with seed data
- `apps/web/app/api/admin/[...path]/route.ts` - API proxy configuration
- `turbo.json` - Monorepo build configuration

### React Admin Resources
- `apps/web/app/admin/AdminApp.tsx` - Main admin app configuration
- `apps/web/app/admin/DataProvider.tsx` - API data provider with tenant headers
- `apps/web/app/admin/resources/*/` - Resource components following best practices

## Environment Variables

### Backend (.env)
```
DATABASE_URL=file:./dev.db  # SQLite for development
PORT=8080
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)
```
BACKEND_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key
```

## API Development Checklist

### MANDATORY: Complete API Development Workflow
When creating or modifying any API endpoint, you MUST complete ALL steps in order:

#### Step 1: Backend API Implementation
- [ ] Create/update the Prisma schema if needed
- [ ] Run migrations: `cd apps/api && npx prisma migrate dev`
- [ ] Create/update the module, controller, and service files
- [ ] Extend BaseCrudService for automatic multi-tenancy
- [ ] Implement ALL React Admin required endpoints:
  - [ ] GET /resource (list with pagination, sorting, filtering)
  - [ ] GET /resource/:id (get one)
  - [ ] POST /resource (create)
  - [ ] PUT /resource/:id (update)
  - [ ] DELETE /resource/:id (delete)
  - [ ] GET /resource?ids=[] (get many)
- [ ] Verify response format: `{ data: T[] | T, total?: number }`
- [ ] Add proper validation using class-validator DTOs
- [ ] Handle multi-tenancy with branchId/schoolId

#### Step 2: Seed Data
- [ ] Update `apps/api/prisma/seed.ts` with realistic test data
- [ ] Include data for multiple tenants (branch1, branch2)
- [ ] Add at least 10-20 records per entity for pagination testing
- [ ] Include edge cases (null values, special characters, etc.)
- [ ] Run seed: `cd apps/api && npx prisma db seed`

#### Step 3: E2E Testing (CRITICAL)
- [ ] Create test file in `apps/api/test/` folder
- [ ] Test ALL endpoints with proper assertions
- [ ] Test pagination: `?page=1&pageSize=10`
- [ ] Test sorting: `?sort=field` and `?sort=-field`
- [ ] Test filtering: `?filter={...}`
- [ ] Test multi-tenant isolation (different X-Branch-Id headers)
- [ ] Test error cases (404, 400, validation errors)
- [ ] Test getMany with ids parameter
- [ ] Run tests: `cd apps/api && bun run test:e2e`

#### Step 4: Frontend Integration
- [ ] Register resource in `apps/web/app/admin/AdminApp.tsx`
- [ ] Create resource folder: `apps/web/app/admin/resources/[resource]/`
- [ ] Implement List component with:
  - [ ] Datagrid with relevant columns
  - [ ] Filters (TextInput, SelectInput, DateInput as needed)
  - [ ] Sorting on key columns
  - [ ] Pagination controls
  - [ ] Bulk actions if needed
- [ ] Implement Create/Edit forms with proper validation
- [ ] Implement Show view if needed
- [ ] Test data provider integration

#### Step 5: Verification
- [ ] Start backend: `cd apps/api && PORT=8080 bun run start:dev`
- [ ] Start frontend: `cd apps/web && bun run dev`
- [ ] Test CRUD operations through UI
- [ ] Verify data isolation between schools
- [ ] Check browser console for errors
- [ ] Test pagination, sorting, and filtering in UI
- [ ] Run linter: `bun run lint`
- [ ] Run type check: `bun run typecheck`

### Quick Validation Commands
```bash
# Run this sequence to validate your API implementation
cd apps/api
npx prisma migrate dev
npx prisma db seed
PORT=8080 bun run start:dev &
bun run test:e2e
cd ../web
bun run dev
```

### Common Pitfalls to Avoid
1. **Missing Response Wrapper**: Always return `{ data: result }` not just `result`
2. **Wrong Pagination**: Use `page` and `pageSize`, not `offset` and `limit`
3. **Missing Total Count**: List endpoints must return `{ data: [], total: number }`
4. **Ignoring Multi-tenancy**: Always filter by branchId in service layer
5. **Incomplete CRUD**: Implement ALL 6 endpoints, not just list and create
6. **No Seed Data**: Always update seed data for testing
7. **Skipping Tests**: E2E tests are MANDATORY, not optional
8. **Frontend Mismatch**: Ensure field names match between API and UI

### Example Implementation Pattern

#### Controller (CORRECT):
```typescript
@Controller('api/v1/teachers')
export class TeachersController {
  @Get()
  async findAll(@Query() query, @Headers('x-branch-id') branchId) {
    const { page = 1, pageSize = 10, sort, filter } = query;
    const result = await this.service.findAll({
      page: +page,
      pageSize: +pageSize,
      sort,
      filter: filter ? JSON.parse(filter) : {},
      branchId
    });
    return { data: result.data, total: result.total }; // CRITICAL: Must match this format
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('x-branch-id') branchId) {
    const result = await this.service.findOne(id, branchId);
    return { data: result }; // CRITICAL: Wrap in data object
  }
}
```

#### Frontend Resource (CORRECT):
```typescript
export const TeacherList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
      <DateField source="joiningDate" />
      <EditButton />
    </Datagrid>
  </List>
);
```

### Template: Complete Module Implementation

When asked to implement a new module (e.g., "implement guardians module"), use this template:

```typescript
// 1. Service extending BaseCrudService (guardians.service.ts)
@Injectable()
export class GuardiansService extends BaseCrudService<Guardian> {
  constructor(prisma: PrismaService) {
    super(prisma, 'guardian'); // Note: singular form
  }

  // Add custom methods if needed
  async findByStudent(studentId: string, branchId: string) {
    return this.prisma.guardian.findMany({
      where: { 
        students: { some: { studentId } },
        branchId,
        deletedAt: null
      }
    });
  }
}

// 2. Controller with ALL endpoints (guardians.controller.ts)
@Controller('api/v1/guardians')
export class GuardiansController {
  constructor(private service: GuardiansService) {}

  @Get()
  async findAll(
    @Query() query: any,
    @Headers('x-branch-id') branchId: string = 'branch1'
  ) {
    const { page = 1, pageSize = 10, sort, filter } = query;
    const result = await this.service.findAll({
      page: +page,
      pageSize: +pageSize,
      sort,
      filter: filter ? JSON.parse(filter) : {},
      branchId
    });
    return { data: result.data, total: result.total };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = 'branch1'
  ) {
    const result = await this.service.findOne(id, branchId);
    return { data: result };
  }

  @Post()
  async create(
    @Body() data: CreateGuardianDto,
    @Headers('x-branch-id') branchId: string = 'branch1'
  ) {
    const result = await this.service.create({ ...data, branchId });
    return { data: result };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateGuardianDto,
    @Headers('x-branch-id') branchId: string = 'branch1'
  ) {
    const result = await this.service.update(id, data, branchId);
    return { data: result };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = 'branch1'
  ) {
    const result = await this.service.remove(id, branchId);
    return { data: result };
  }

  // GetMany endpoint for React Admin
  @Get()
  async getMany(
    @Query('ids') ids: string,
    @Headers('x-branch-id') branchId: string = 'branch1'
  ) {
    if (ids) {
      const idArray = ids.split(',');
      const result = await this.service.findMany(idArray, branchId);
      return { data: result };
    }
    return this.findAll({ page: 1, pageSize: 10 }, branchId);
  }
}

// 3. E2E Test (test/guardians.e2e-spec.ts)
describe('Guardians API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Setup test app
  });

  describe('GET /api/v1/guardians', () => {
    it('should return paginated list for branch1', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/guardians?page=1&pageSize=10')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should isolate data between branches', async () => {
      const [branch1, branch2] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/guardians')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/guardians')
          .set('X-Branch-Id', 'branch2')
      ]);

      expect(branch1.body.data[0]?.branchId).toBe('branch1');
      expect(branch2.body.data[0]?.branchId).toBe('branch2');
    });

    it('should support sorting', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/guardians?sort=-name')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const names = response.body.data.map(g => g.name);
      const sortedNames = [...names].sort().reverse();
      expect(names).toEqual(sortedNames);
    });

    it('should support filtering', async () => {
      const filter = { relationship: 'Father' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/guardians?filter=${JSON.stringify(filter)}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(guardian => {
        expect(guardian.relationship).toBe('Father');
      });
    });
  });

  // Test all other endpoints...
});

// 4. Frontend List Component (resources/guardians/List.tsx)
export const GuardianList = () => {
  const filters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <SelectInput source="relationship" choices={[
      { id: 'Father', name: 'Father' },
      { id: 'Mother', name: 'Mother' },
      { id: 'Guardian', name: 'Guardian' },
    ]} />,
  ];

  return (
    <List filters={filters}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="relationship" />
        <EmailField source="email" />
        <TextField source="phone" />
        <TextField source="occupation" />
        <DateField source="createdAt" />
        <EditButton />
        <ShowButton />
      </Datagrid>
    </List>
  );
};
```

### Validation Script Usage
After implementing any API, run the validation script:
```bash
./scripts/validate-api.sh guardians
```

This will check:
- All backend files exist
- All 6 endpoints are implemented
- Response format is correct
- E2E tests exist and pass
- Frontend components exist
- Resource is registered

## Troubleshooting Guide

### Common API Issues and Solutions

#### 1. Frontend shows "No data" but API returns data
**Problem**: Data format mismatch
**Solution**: Ensure API returns `{ data: [], total: number }` not just array
```typescript
// ❌ WRONG
return await this.service.findAll();

// ✅ CORRECT
const result = await this.service.findAll();
return { data: result.data, total: result.total };
```

#### 2. "Cannot read property 'map' of undefined" in frontend
**Problem**: Missing data wrapper in response
**Solution**: All endpoints must wrap response in `{ data: ... }`
```typescript
// ❌ WRONG
return await this.service.findOne(id);

// ✅ CORRECT
const result = await this.service.findOne(id);
return { data: result };
```

#### 3. Multi-tenant data leakage
**Problem**: Not filtering by branchId
**Solution**: Always include branchId in queries
```typescript
// ❌ WRONG
return this.prisma.student.findMany();

// ✅ CORRECT
return this.prisma.student.findMany({
  where: { branchId, deletedAt: null }
});
```

#### 4. Pagination not working
**Problem**: Using wrong parameter names
**Solution**: Use `page` and `pageSize`, not `offset` and `limit`
```typescript
// ❌ WRONG
const { offset, limit } = query;

// ✅ CORRECT
const { page = 1, pageSize = 10 } = query;
const skip = (page - 1) * pageSize;
```

#### 5. E2E tests fail with "Connection refused"
**Problem**: Backend not running on port 8080
**Solution**: Always start backend with PORT=8080
```bash
cd apps/api && PORT=8080 bun run start:dev
```

#### 6. Frontend proxy not working
**Problem**: Backend not on port 8080 or proxy misconfigured
**Solution**: Check proxy config and backend port
```typescript
// apps/web/app/api/admin/[...path]/route.ts
const backendUrl = 'http://localhost:8080'; // Must be 8080
```

## Frontend UI Component Guidelines

### STRICT UI LIBRARY RULES

#### ❌ PROHIBITED - Never Use:
- **Material-UI (MUI)** - Any @mui/* imports
- **Ant Design** - Any antd imports  
- **Bootstrap** - Any bootstrap components
- **Chakra UI** - Any @chakra-ui/* imports

#### ✅ REQUIRED - Always Use:
- **shadcn/ui components** from `@/components/ui/*`
- **React Admin components** from `@/components/admin/*`
- **Lucide React icons** from `lucide-react`
- **Tailwind CSS** for styling

### Frontend Component Pattern

When creating ANY frontend component, follow this exact pattern from `apps/web/shadcn-admin-kit-demo/`:

```typescript
// CORRECT: Using shadcn/ui and React Admin components
import {
  DataTable,
  List,
  TextInput,
  SelectInput,
  DateInput,
  NumberInput,
  BooleanInput,
  EditButton,
  ShowButton,
  DeleteButton
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, Phone, User } from "lucide-react";

// List Component
export const ResourceList = () => {
  const filters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <SelectInput source="status" choices={[
      { id: 'active', name: 'Active' },
      { id: 'inactive', name: 'Inactive' }
    ]} />
  ];

  return (
    <List filters={filters}>
      <DataTable>
        <DataTable.Col source="id" label="ID" />
        <DataTable.Col source="name" label="Name" />
        <DataTable.Col source="status" label="Status">
          {(record) => (
            <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
              {record.status}
            </Badge>
          )}
        </DataTable.Col>
        <DataTable.Col label="Actions" align="right">
          <EditButton />
          <ShowButton />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};

// Form Component
import { Create, Edit, SimpleForm, TextInput, required } from "@/components/admin";

export const ResourceCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} />
      <TextInput source="email" validate={required()} />
      <SelectInput source="status" choices={[...]} />
    </SimpleForm>
  </Create>
);
```

### Component Import Locations

Always import from these specific locations:
```typescript
// Admin components (React Admin)
import { List, DataTable, Create, Edit, SimpleForm, TextInput } from "@/components/admin";

// UI components (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons (ONLY from lucide-react)
import { User, Mail, Phone, Calendar } from "lucide-react";

// NEVER import from:
// ❌ import { Button } from '@mui/material'
// ❌ import { Button } from 'antd'
// ❌ import { Box } from '@chakra-ui/react'
```

## IMPORTANT INSTRUCTIONS FOR CLAUDE

### When Asked to Implement an API Module:

1. **ALWAYS use the TodoWrite tool first** to create a checklist from the "API Development Checklist" section
2. **Follow the checklist sequentially** - do not skip steps
3. **Use the template provided** in the "Template: Complete Module Implementation" section
4. **Run the validation script** after implementation: `./scripts/validate-api.sh [resource]`
5. **Fix any issues** identified by the validation script before considering the task complete

### Critical Rules:
- **NEVER** return raw arrays - always wrap in `{ data: [...] }`
- **NEVER** skip E2E tests - they are mandatory
- **NEVER** forget multi-tenancy - always filter by branchId
- **NEVER** use offset/limit - use page/pageSize
- **ALWAYS** update seed data with realistic test data
- **ALWAYS** implement all 6 CRUD endpoints
- **ALWAYS** test with PORT=8080 for the backend

### Before Marking Task Complete:
1. Run validation script: `./scripts/validate-api.sh [resource]`
2. Start backend: `cd apps/api && PORT=8080 bun run start:dev`
3. Run E2E tests: `cd apps/api && bun run test:e2e`
4. Start frontend: `cd apps/web && bun run dev`
5. Test CRUD operations in UI at http://localhost:3000/admin
6. **MANDATORY**: Invoke the implementation-reviewer subagent:
   ```bash
   # The reviewer subagent will automatically validate the implementation
   Use the implementation-reviewer subagent to review the [module] implementation
   
   # It will generate a comprehensive review report with PASS/FAIL status
   ```

### Response Format Reference:
```typescript
// List: GET /resource
{ data: T[], total: number }

// Get One: GET /resource/:id
{ data: T }

// Create: POST /resource
{ data: T }

// Update: PUT /resource/:id
{ data: T }

// Delete: DELETE /resource/:id
{ data: T }

// Get Many: GET /resource?ids=1,2,3
{ data: T[] }
```

## Implementation Review Workflow

### When Asked to Review an Implementation

Use this comprehensive review checklist to audit any module implementation. This should be used by a sub-agent or when explicitly asked to review.

### Review Checklist

#### 1. Backend API Review
```markdown
## Backend API Review for [MODULE_NAME]

### ✅ Required Files
- [ ] Module file exists: `apps/api/src/[module]/[module].module.ts`
- [ ] Controller file exists: `apps/api/src/[module]/[module].controller.ts`
- [ ] Service file exists: `apps/api/src/[module]/[module].service.ts`
- [ ] DTOs defined: `apps/api/src/[module]/dto/*.dto.ts`

### ✅ API Endpoints Compliance
- [ ] GET /api/v1/[resource] - List with pagination
  - [ ] Returns `{ data: [], total: number }`
  - [ ] Accepts `page` and `pageSize` params
  - [ ] Supports sorting with `sort` param
  - [ ] Supports filtering with `filter` param
- [ ] GET /api/v1/[resource]/:id - Get one
  - [ ] Returns `{ data: object }`
- [ ] POST /api/v1/[resource] - Create
  - [ ] Returns `{ data: object }` with new ID
- [ ] PUT /api/v1/[resource]/:id - Update
  - [ ] Returns `{ data: object }` with updated data
- [ ] DELETE /api/v1/[resource]/:id - Delete
  - [ ] Returns `{ data: object }` of deleted item
- [ ] GET /api/v1/[resource]?ids=1,2,3 - Get many
  - [ ] Returns `{ data: [] }`

### ✅ Multi-tenancy
- [ ] All endpoints use `@Headers('x-branch-id')` decorator
- [ ] Service extends `BaseCrudService`
- [ ] All queries filter by `branchId`
- [ ] No data leakage between tenants

### ✅ Data Validation
- [ ] DTOs use class-validator decorators
- [ ] Required fields validated
- [ ] Proper error messages returned
```

#### 2. Testing Review
```markdown
## Testing Review

### ✅ E2E Test Coverage
- [ ] Test file exists: `apps/api/test/[module].e2e-spec.ts`
- [ ] Tests pagination: `?page=1&pageSize=10`
- [ ] Tests sorting: `?sort=field` and `?sort=-field`
- [ ] Tests filtering: `?filter={...}`
- [ ] Tests multi-tenant isolation (different X-Branch-Id)
- [ ] Tests error cases (404, 400, validation)
- [ ] Tests all CRUD operations
- [ ] All tests pass: `bun run test:e2e`

### ✅ Seed Data
- [ ] Seed data exists in `apps/api/prisma/seed.ts`
- [ ] At least 10-20 records for pagination testing
- [ ] Data for multiple tenants (branch1, branch2)
- [ ] Realistic test data with edge cases
```

#### 3. Frontend Review
```markdown
## Frontend Review

### ✅ Component Structure
- [ ] Resource folder exists: `apps/web/app/admin/resources/[module]/`
- [ ] List component: `List.tsx`
- [ ] Create component: `Create.tsx`
- [ ] Edit component: `Edit.tsx`
- [ ] Show component (if needed): `Show.tsx`
- [ ] Index file exports all components

### ✅ UI Library Compliance
- [ ] NO Material-UI imports (@mui/*)
- [ ] NO Ant Design imports (antd)
- [ ] NO Bootstrap components
- [ ] Uses shadcn/ui components (@/components/ui/*)
- [ ] Uses React Admin components (@/components/admin/*)
- [ ] Uses lucide-react for icons

### ✅ Component Implementation
- [ ] List has DataTable with relevant columns
- [ ] Filters implemented (TextInput, SelectInput, etc.)
- [ ] Sorting enabled on key columns
- [ ] Pagination controls present
- [ ] Forms have proper validation
- [ ] Actions (Edit, Show, Delete) buttons present

### ✅ Resource Registration
- [ ] Resource registered in `apps/web/app/admin/AdminApp.tsx`
- [ ] Correct name and path mapping
- [ ] Icon assigned from lucide-react
```

#### 4. Integration Review
```markdown
## Integration Review

### ✅ End-to-End Functionality
- [ ] Backend starts without errors: `PORT=8080 bun run start:dev`
- [ ] Frontend starts without errors: `bun run dev`
- [ ] CRUD operations work through UI
- [ ] Data displays correctly in list view
- [ ] Forms save data properly
- [ ] Multi-tenant isolation verified
- [ ] No console errors in browser

### ✅ Code Quality
- [ ] Linter passes: `bun run lint`
- [ ] Type checking passes: `bun run typecheck`
- [ ] No commented-out code
- [ ] Consistent naming conventions
- [ ] Follows existing patterns in codebase
```

### Review Report Template

```markdown
# Implementation Review Report: [MODULE_NAME]

**Date:** [DATE]
**Reviewer:** Claude Code Review Agent
**Module:** [MODULE_NAME]
**Status:** ⚠️ NEEDS FIXES | ✅ APPROVED

## Summary
[Brief overview of the implementation status]

## Critical Issues Found
1. [Issue description and location]
2. [Issue description and location]

## Compliance Scores
- Backend API: [X/6] endpoints implemented correctly
- Testing: [X/8] test scenarios covered
- Frontend: [X/7] UI requirements met
- Multi-tenancy: [PASS/FAIL]
- UI Library Compliance: [PASS/FAIL]

## Required Fixes

### High Priority
- [ ] [Specific fix needed with file location]
- [ ] [Specific fix needed with file location]

### Medium Priority
- [ ] [Specific fix needed with file location]

### Low Priority
- [ ] [Improvements or optimizations]

## Code Samples of Issues

### Issue 1: [Issue Name]
Location: `path/to/file.ts:line`
```typescript
// Current (incorrect)
[code snippet]

// Should be
[corrected code]
```

## Validation Command Results
```bash
./scripts/validate-api.sh [module]
# Output: [validation results]
```

## Recommendations
1. [Specific actionable recommendation]
2. [Specific actionable recommendation]

## Next Steps
[Clear instructions on what needs to be done to complete the implementation]
```

## Code Review Instructions

### Using the Implementation Reviewer Subagent

The implementation reviewer is available as both a subagent and an output style:

#### Method 1: Subagent (RECOMMENDED)
```bash
# The implementation-reviewer subagent will be invoked automatically after implementations
# Or you can invoke it explicitly:
Use the implementation-reviewer subagent to review the [module] implementation

# Or via Task tool (for sub-agent delegation):
Task: "Review the [module] implementation using the implementation-reviewer subagent"
```

#### Method 2: Output Style
```bash
# Switch to review mode
/output-style implementation-reviewer

# Then request a review
Review the [module] implementation

# Switch back to default mode when done
/output-style default
```

### What the Reviewer Checks

The implementation-reviewer will:
- Run validation scripts automatically (`./scripts/validate-api.sh`)
- Check for prohibited UI libraries (MUI, Ant Design, etc.)
- Verify React Admin Data Provider compliance
- Test multi-tenant isolation
- Generate detailed review reports with:
  - 📊 Compliance scorecard
  - ❌ Critical issues with fixes
  - 🔧 Prioritized action items
  - 📝 Validation script output

### Review Report Output

The reviewer generates a comprehensive report with:
- **Overall Status**: 🔴 FAILED | 🟡 NEEDS FIXES | 🟢 PASSED
- **Compliance Scores**: API, Testing, Frontend, Multi-tenancy, UI Libraries
- **Critical Issues**: With exact file locations and corrected code
- **Required Actions**: Prioritized by severity
- **Next Steps**: Clear path to passing status

### Quick Review Commands

```bash
# Manual validation
./scripts/validate-api.sh [module]

# View available subagents
/agents

# Invoke review subagent
Use implementation-reviewer to review teachers module

# Check for MUI imports (should return nothing)
grep -r "@mui" apps/web/app/admin/resources/

# Run all checks
bun run lint && bun run typecheck && bun run test:e2e
```

## Current Development Focus
- Completing Indian exam system with report cards
- Period-based attendance tracking
- Fee management with installments
- Parent portal integration
- Performance optimization for large datasets
- Comprehensive E2E test coverage for all modules