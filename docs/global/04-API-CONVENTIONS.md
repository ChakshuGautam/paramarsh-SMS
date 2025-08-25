# API Conventions

## 🎯 Overview

All APIs in Paramarsh SMS follow REST principles and are specifically designed to work with React Admin's Data Provider specification. This ensures consistent, predictable API behavior across all modules.

## 📋 Core Principles

### 1. **React Admin Compatibility**
All responses must be compatible with React Admin's expected format.

### 2. **Multi-Tenancy**
Every request must include branch identification.

### 3. **Consistent Response Format**
All endpoints return data in a standardized wrapper.

### 4. **RESTful Design**
Follow REST conventions for resource naming and HTTP methods.

## 🔌 Standard Endpoints

Every resource MUST implement these 6 endpoints:

| Method | Path | Purpose | React Admin Method |
|--------|------|---------|-------------------|
| GET | `/api/v1/{resource}` | List resources | getList |
| GET | `/api/v1/{resource}/:id` | Get single resource | getOne |
| POST | `/api/v1/{resource}` | Create resource | create |
| PUT | `/api/v1/{resource}/:id` | Full update | update |
| PATCH | `/api/v1/{resource}/:id` | Partial update | update |
| DELETE | `/api/v1/{resource}/:id` | Delete resource | delete |

## 📦 Response Formats

### List Response (GET /resource)
```json
{
  "data": [
    {
      "id": "uuid-1",
      "field1": "value1",
      "field2": "value2"
    },
    {
      "id": "uuid-2",
      "field1": "value3",
      "field2": "value4"
    }
  ],
  "total": 42
}
```

**Requirements:**
- `data` MUST be an array (even if empty)
- `total` MUST be the total count (for pagination)
- Never return raw arrays

### Single Resource Response (GET /resource/:id)
```json
{
  "data": {
    "id": "uuid-1",
    "field1": "value1",
    "field2": "value2",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Requirements:**
- `data` MUST be an object
- Include all fields (including relationships if needed)

### Create Response (POST /resource)
```json
{
  "data": {
    "id": "newly-created-uuid",
    "field1": "value1",
    "field2": "value2"
  }
}
```

**Requirements:**
- Return the created resource
- Include generated ID
- Include default values

### Update Response (PUT/PATCH /resource/:id)
```json
{
  "data": {
    "id": "uuid-1",
    "field1": "updated-value1",
    "field2": "updated-value2",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

**Requirements:**
- Return the updated resource
- Include updated timestamp

### Delete Response (DELETE /resource/:id)
```json
{
  "data": {
    "id": "uuid-1",
    "deletedAt": "2024-01-02T00:00:00Z"
  }
}
```

**Requirements:**
- Return the deleted resource (or minimal confirmation)
- For soft deletes, include deletedAt timestamp

## 🔍 Query Parameters

### Pagination
```
GET /api/v1/students?page=1&perPage=10
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (1-indexed) |
| perPage | number | 25 | Items per page |

**Implementation:**
```typescript
const skip = (page - 1) * perPage;
const take = perPage;
```

### Sorting
```
GET /api/v1/students?sort=["firstName","ASC"]
GET /api/v1/students?sort=firstName&order=ASC
```

**Formats Supported:**
1. React Admin format: `sort=["field","ORDER"]`
2. Simple format: `sort=field&order=ORDER`
3. Multiple sorts: `sort=[["field1","ASC"],["field2","DESC"]]`

### Filtering
```
GET /api/v1/students?filter={"status":"active","classId":"uuid"}
```

**Filter Format:**
```json
{
  "field": "value",              // Exact match
  "field_gte": "value",          // Greater than or equal
  "field_lte": "value",          // Less than or equal
  "field_like": "value",         // LIKE search
  "q": "search term"             // Global search
}
```

### Search
```
GET /api/v1/students?q=john
```

Global search across predefined searchable fields.

## 🔐 Headers

### Required Headers

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| X-Branch-Id | Yes* | Tenant identifier | branch1 |
| Authorization | Yes** | JWT token | Bearer eyJhbG... |
| Content-Type | For POST/PUT | Request body type | application/json |

*Defaults to 'branch1' if not provided
**Required for protected endpoints

### Response Headers
```
Content-Type: application/json
X-Total-Count: 42
X-Request-Id: uuid-for-tracking
```

## 🌐 URL Structure

### Base URL Pattern
```
https://api.example.com/api/v1/{resource}
```

### Resource Naming Conventions
- Use plural nouns: `/students`, not `/student`
- Use kebab-case: `/academic-years`, not `/academicYears`
- Nested resources: `/api/v1/classes/:classId/sections`
- Special namespaces: `/api/v1/hr/staff`, `/api/v1/comms/templates`

### Examples
```
/api/v1/students
/api/v1/teachers
/api/v1/classes
/api/v1/sections
/api/v1/academic-years
/api/v1/hr/staff
/api/v1/comms/templates
/api/v1/fees/structures
```

## 📝 Request Bodies

### Create Request (POST)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "classId": "uuid-of-class"
}
```

**Rules:**
- Don't include ID (auto-generated)
- Don't include timestamps (auto-generated)
- Don't include branchId (from header)

### Update Request (PUT)
```json
{
  "id": "uuid-1",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "classId": "uuid-of-class"
}
```

**Rules:**
- Include all fields (full replacement)
- ID in body must match URL param

### Partial Update Request (PATCH)
```json
{
  "firstName": "Jane"
}
```

**Rules:**
- Include only fields to update
- Undefined fields are not modified

## ❌ Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE (optional) |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/constraint violation |
| 422 | Unprocessable | Business logic violation |
| 500 | Server Error | Unexpected server error |

## 🔄 Special Endpoints

### Soft Delete Support
```
GET /api/v1/students/deleted        # List deleted records
POST /api/v1/students/:id/restore   # Restore deleted record
DELETE /api/v1/students/:id/permanent # Permanent delete
```

### Bulk Operations
```
POST /api/v1/students/bulk          # Create multiple
PUT /api/v1/students/bulk           # Update multiple
DELETE /api/v1/students/bulk        # Delete multiple
```

### Export/Import
```
GET /api/v1/students/export         # Export to CSV/Excel
POST /api/v1/students/import        # Import from file
```

### Aggregations
```
GET /api/v1/students/stats          # Statistics
GET /api/v1/students/count          # Count only
```

## 🧩 Relationship Handling

### Including Relations
```
GET /api/v1/students?include=class,guardians
```

Response includes nested data:
```json
{
  "data": [{
    "id": "student-1",
    "firstName": "John",
    "class": {
      "id": "class-1",
      "name": "Class 10"
    },
    "guardians": [{
      "id": "guardian-1",
      "name": "Parent Name"
    }]
  }]
}
```

### Sparse Fieldsets
```
GET /api/v1/students?fields=id,firstName,lastName
```

Returns only requested fields.

## 🚀 Performance Guidelines

### Pagination
- Always paginate list endpoints
- Default page size: 25
- Maximum page size: 100

### Caching Headers
```
Cache-Control: private, max-age=60
ETag: "33a64df551"
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT
```

### Response Time Targets
- List endpoints: < 200ms
- Single resource: < 100ms
- Create/Update: < 300ms
- Delete: < 100ms

## 📊 API Versioning

### URL Versioning
```
/api/v1/students  # Current version
/api/v2/students  # Future version
```

### Version Migration
- Support previous version for 6 months
- Deprecation warnings in headers
- Migration guides in documentation

## 🔧 Implementation Example

### Controller Implementation
```typescript
@Controller('students')
export class StudentsController {
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('perPage') perPage = '25',
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    const result = await this.service.findAll({
      page: Number(page),
      perPage: Number(perPage),
      sort: sort ? JSON.parse(sort) : undefined,
      filter: filter ? JSON.parse(filter) : {},
      branchId
    });
    
    return {
      data: result.data,
      total: result.total
    };
  }
}
```

### Service Implementation
```typescript
async findAll(params: QueryParams) {
  const { page, perPage, sort, filter, branchId } = params;
  
  const where = {
    branchId,
    ...filter,
    deletedAt: null  // Exclude soft-deleted
  };
  
  const [data, total] = await Promise.all([
    this.prisma.student.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: sort
    }),
    this.prisma.student.count({ where })
  ]);
  
  return { data, total };
}
```

## ✅ Validation Checklist

Before deploying any API endpoint, ensure:

- [ ] Returns data in `{ data: T, total?: number }` format
- [ ] Handles X-Branch-Id header
- [ ] Implements all 6 standard endpoints
- [ ] Supports pagination parameters
- [ ] Supports sorting parameters
- [ ] Supports filtering parameters
- [ ] Returns appropriate HTTP status codes
- [ ] Includes proper error messages
- [ ] Has E2E tests for all endpoints
- [ ] Documented in OpenAPI spec

## 📚 References

- [React Admin Data Provider Spec](https://marmelab.com/react-admin/DataProviderWriting.html)
- [REST API Best Practices](https://restfulapi.net/)
- [Architecture Overview](01-ARCHITECTURE.md)
- [Testing Strategy](08-TESTING-STRATEGY.md)