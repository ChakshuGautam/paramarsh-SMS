# School ID Aliasing Documentation

## Overview

This document explains the aliasing approach used in the School Management System to provide better clarity in the API layer while maintaining backward compatibility with the database schema.

## Terminology Mapping

| Database Term | API/UI Term | Description |
|--------------|-------------|-------------|
| `branchId` | `schoolId` | Identifier for an individual school |
| `branch` | `school` | An individual educational institution |
| `tenantId` | `organizationId` or `districtId` | Parent organization or school district |

## Why Aliasing?

1. **User Clarity**: "School" is more intuitive for end users than "branch"
2. **Backward Compatibility**: Database schema remains unchanged
3. **Flexibility**: Easy to adapt if terminology needs change in the future
4. **Multi-tenant Support**: Maintains support for school districts with multiple schools

## Implementation Approach

### 1. Database Layer
- Fields remain as `branchId` in all tables
- No database migration required
- Comments added to schema explaining the mapping

### 2. Service Layer
The `PrismaService` provides alias methods:
```typescript
// Get current school ID (internally maps to branchId)
const schoolId = PrismaService.getSchoolId();

// Run operations in a school's scope
PrismaService.runInSchoolScope(schoolId, async () => {
  // Operations here are scoped to the school
});
```

### 3. API Layer

#### Headers
- **Preferred**: `X-School-Id` 
- **Legacy Support**: `X-Branch-Id` (still works but deprecated)
- **Organization**: `X-Tenant-Id`

Example:
```http
GET /api/students
X-School-Id: school-123
X-Tenant-Id: district-456
```

#### Response Transformation
Services use the `mapDbToSchoolResponse()` helper to transform responses:
```typescript
// Database returns: { branchId: "123", name: "John" }
// API returns: { schoolId: "123", name: "John" }
```

### 4. Swagger Documentation
Controllers use the `@ApiMultiSchool()` decorator to document headers:
```typescript
@Controller('students')
@ApiMultiSchool()  // Documents X-School-Id and X-Tenant-Id
export class StudentsController {
  // ...
}
```

## Usage Examples

### For Frontend Developers
Always use `schoolId` in API calls:
```javascript
// Correct
fetch('/api/students', {
  headers: {
    'X-School-Id': 'school-123'
  }
});

// Response will contain schoolId
{
  "data": [
    {
      "id": "student-1",
      "schoolId": "school-123",  // Not branchId
      "name": "John Doe"
    }
  ]
}
```

### For Backend Developers

#### In Services
```typescript
export class StudentsService {
  async list() {
    // Use the alias method
    const schoolId = PrismaService.getSchoolId();
    
    // Map to database field
    const where = schoolId ? { branchId: schoolId } : {};
    
    // Query database
    const data = await this.prisma.student.findMany({ where });
    
    // Transform response
    return mapDbToSchoolResponse(data);
  }
}
```

#### Using the Decorator
```typescript
export class TeachersService {
  @SchoolAlias()  // Automatically handles transformation
  async list(params: any) {
    // Input schoolId is auto-mapped to branchId
    // Response branchId is auto-mapped to schoolId
    return this.prisma.teacher.findMany(params);
  }
}
```

## Migration Path

If you need to fully migrate from `branchId` to `schoolId` in the future:

1. **Phase 1** (Current): Aliasing approach
2. **Phase 2**: Add `schoolId` column alongside `branchId`
3. **Phase 3**: Migrate data from `branchId` to `schoolId`
4. **Phase 4**: Update code to use `schoolId` directly
5. **Phase 5**: Drop `branchId` column

## Best Practices

1. **Always use school terminology in:**
   - API documentation
   - Error messages
   - UI labels
   - Variable names in frontend code

2. **Only use branch terminology in:**
   - Database queries (internal)
   - Database migrations
   - Internal service methods that directly interact with Prisma

3. **Headers:**
   - New implementations should use `X-School-Id`
   - Continue supporting `X-Branch-Id` for backward compatibility
   - Document both in API specs

4. **Testing:**
   - Test with both `X-School-Id` and `X-Branch-Id` headers
   - Verify response transformation works correctly
   - Ensure school isolation is maintained

## Common Pitfalls to Avoid

1. **Don't expose `branchId` in API responses** - Always transform to `schoolId`
2. **Don't hardcode field names** - Use the helper functions
3. **Don't forget to scope queries** - Always check for school context
4. **Don't mix terminology** - Be consistent within each layer

## Support

For questions about the aliasing approach or to report issues:
- Check this documentation first
- Review the helper functions in `/src/common/school-alias.helper.ts`
- Contact the backend team for clarification