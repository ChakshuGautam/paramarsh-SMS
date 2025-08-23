# Module: [Module Name]

## 📋 Overview

### Purpose
[Brief description of what this module does and why it's needed]

### Key Features
- Feature 1
- Feature 2
- Feature 3

### Dependencies
- Required modules: [List any modules this depends on]
- External services: [Any external integrations]

---

## 📊 Data Models

### Primary Entity: [EntityName]

```prisma
model [EntityName] {
  id         String    @id @default(uuid())
  branchId   String?   // Multi-tenancy
  
  // Core fields
  field1     String
  field2     Int
  field3     DateTime
  
  // Relationships
  relatedEntity   RelatedEntity? @relation(...)
  relatedEntityId String?
  
  // Audit fields
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  deletedAt  DateTime? // Soft delete
  deletedBy  String?
}
```

### Relationships
- One-to-Many with [Entity]
- Many-to-One with [Entity]
- Many-to-Many with [Entity] through [JoinTable]

---

## 🔌 API Endpoints

### Base URL: `/api/v1/[module-name]`

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | / | List all records | Query params: page, perPage, sort, filter | `{ data: [], total: n }` |
| GET | /:id | Get single record | - | `{ data: {} }` |
| POST | / | Create new record | Body: CreateDto | `{ data: {} }` |
| PUT | /:id | Update record | Body: UpdateDto | `{ data: {} }` |
| PATCH | /:id | Partial update | Body: Partial UpdateDto | `{ data: {} }` |
| DELETE | /:id | Delete record | - | `{ data: {} }` |

### DTOs

#### CreateDto
```typescript
export class Create[Module]Dto {
  @IsString()
  @IsNotEmpty()
  field1: string;

  @IsNumber()
  @IsOptional()
  field2?: number;
}
```

#### UpdateDto
```typescript
export class Update[Module]Dto extends PartialType(Create[Module]Dto) {}
```

---

## 🧮 Business Logic

### Validation Rules
1. Rule 1: [Description]
2. Rule 2: [Description]
3. Rule 3: [Description]

### Calculations
- [Calculation 1]: Formula and logic
- [Calculation 2]: Formula and logic

### Workflows
1. **Create Workflow**
   - Step 1: Validate input
   - Step 2: Check dependencies
   - Step 3: Create record
   - Step 4: Trigger notifications

2. **Update Workflow**
   - Step 1: Check permissions
   - Step 2: Validate changes
   - Step 3: Update record
   - Step 4: Log audit trail

---

## 🎨 Frontend Components

### List Component
```tsx
// apps/web/app/admin/resources/[module]/List.tsx
export const [Module]List = () => (
  <List>
    <DataTable>
      <DataTable.Col source="field1" />
      <DataTable.Col source="field2" />
      <DataTable.Col source="field3" />
    </DataTable>
  </List>
);
```

### Create Component
```tsx
// apps/web/app/admin/resources/[module]/Create.tsx
export const [Module]Create = () => (
  <Create>
    <SimpleForm>
      <TextInput source="field1" required />
      <NumberInput source="field2" />
      <DateInput source="field3" />
    </SimpleForm>
  </Create>
);
```

### Edit Component
```tsx
// apps/web/app/admin/resources/[module]/Edit.tsx
export const [Module]Edit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="field1" required />
      <NumberInput source="field2" />
      <DateInput source="field3" />
    </SimpleForm>
  </Edit>
);
```

---

## 🧪 Test Coverage

### E2E Test Requirements
```typescript
// apps/api/test/[module].e2e-spec.ts
describe('[Module] E2E', () => {
  describe('GET /[module]', () => {
    it('should return paginated list');
    it('should filter by query');
    it('should sort results');
    it('should respect branch isolation');
  });

  describe('POST /[module]', () => {
    it('should create new record');
    it('should validate required fields');
    it('should handle duplicates');
  });

  // ... other endpoints
});
```

### Test Scenarios
- [ ] CRUD operations
- [ ] Multi-tenancy isolation
- [ ] Pagination
- [ ] Sorting
- [ ] Filtering
- [ ] Validation errors
- [ ] Soft delete
- [ ] Permissions

---

## 🌱 Seed Data

### Required Seed Data
```typescript
// apps/api/prisma/seed-indian.ts
const [module]Data = [
  {
    field1: "Sample 1",
    field2: 100,
    field3: new Date(),
    branchId: "branch1"
  },
  // ... minimum 10 records
];
```

### Indian Context Requirements
- Use Indian names and terminology
- Follow Indian academic patterns
- Use INR for currency
- Include regional variations

---

## 🔒 Security & Permissions

### Required Permissions
- `[module].view` - View records
- `[module].create` - Create new records
- `[module].update` - Update existing records
- `[module].delete` - Delete records

### Role Access
| Role | View | Create | Update | Delete |
|------|------|--------|--------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Teacher | ✅ | ✅ | ✅ | ❌ |
| Student | ✅ | ❌ | ❌ | ❌ |
| Parent | ✅ | ❌ | ❌ | ❌ |

---

## 📊 Reports & Analytics

### Available Reports
1. **[Report Name]**: Description
2. **[Report Name]**: Description

### Metrics
- Total count
- Active vs Inactive
- Trends over time
- Distribution by category

---

## 🔄 Integration Points

### Incoming Dependencies
- Module depends on: [List modules that call this]

### Outgoing Dependencies  
- Module calls: [List modules this calls]

### Events
- Emitted: `[module].created`, `[module].updated`, `[module].deleted`
- Consumed: `[other-module].event`

---

## 📝 Implementation Checklist

### Backend
- [ ] Create Prisma model
- [ ] Generate migration
- [ ] Create module structure
- [ ] Implement service (extend BaseCrudService)
- [ ] Create controller
- [ ] Add DTOs with validation
- [ ] Register in app.module

### Frontend
- [ ] Create resource directory
- [ ] Implement List component
- [ ] Implement Create component  
- [ ] Implement Edit component
- [ ] Add to Admin resources
- [ ] Configure DataProvider mapping

### Testing
- [ ] Write E2E tests
- [ ] Test multi-tenancy
- [ ] Test pagination
- [ ] Test validation
- [ ] Test soft delete

### Documentation
- [ ] Update this document
- [ ] Add API examples
- [ ] Document business rules
- [ ] Add seed data

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 on API calls | Wrong path mapping | Check DataProvider configuration |
| No data displayed | Missing response wrapper | Ensure returning `{ data: [...] }` |
| Multi-tenant leak | Missing branchId filter | Add branchId to all queries |
| Validation errors | DTO mismatch | Sync DTOs with Prisma schema |

---

## 📚 References

- [Global API Conventions](../global/04-API-CONVENTIONS.md)
- [Database Design Patterns](../global/05-DATABASE-DESIGN.md)
- [Testing Strategy](../global/08-TESTING-STRATEGY.md)
- [UI Guidelines](../global/09-UI-GUIDELINES.md)