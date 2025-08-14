# Swagger/OpenAPI Documentation Guide

This guide covers how to properly implement and maintain Swagger/OpenAPI documentation in our NestJS application.

## Overview

Our API uses Swagger/OpenAPI 3.0 to automatically generate comprehensive API documentation. The documentation is available at:
- **Swagger UI**: http://localhost:3000/api-docs
- **JSON Schema**: http://localhost:3000/api-docs-json

## Core Requirements

### 1. Import Required Decorators

Every controller and DTO must import the necessary Swagger decorators:

```typescript
// In controllers
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

// In DTOs
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
```

### 2. Controller Documentation

Every controller must have proper Swagger documentation:

```typescript
@ApiTags('Resource Name')  // Groups endpoints in Swagger UI
@Controller('resource')
export class ResourceController {

  @Post()
  @ApiOperation({ 
    summary: 'Create resource',
    description: 'Creates a new resource with the provided data'
  })
  @CreateDocs('Resource created successfully')  // Uses common response docs
  create(@Body() createDto: CreateResourceDto) {
    // Implementation
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get resource by ID',
    description: 'Retrieves detailed information about a specific resource'
  })
  @ApiParam({ name: 'id', description: 'Resource ID', example: 'resource-123' })
  @ListDocs('Resource details')
  findOne(@Param('id') id: string) {
    // Implementation
  }
}
```

### 3. DTO Documentation (CRITICAL)

**This is the most important part** - DTOs must have `@ApiProperty` decorators to generate request body schemas:

```typescript
export class CreateResourceDto {
  @ApiProperty({ 
    description: 'Resource name', 
    example: 'My Resource',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Resource description', 
    example: 'This is a sample resource'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Resource type', 
    example: 'premium',
    enum: ['basic', 'premium', 'enterprise']
  })
  @IsString()
  @IsIn(['basic', 'premium', 'enterprise'])
  type!: string;

  @ApiProperty({ 
    description: 'Related entity ID', 
    example: 'entity-123',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  entityId!: string;
}
```

## Common Patterns

### Required vs Optional Fields

```typescript
// Required field
@ApiProperty({ description: 'Field description', example: 'example-value' })
@IsString()
fieldName!: string;

// Optional field
@ApiPropertyOptional({ description: 'Optional field', example: 'example-value' })
@IsOptional()
@IsString()
optionalField?: string;
```

### Field Types and Validation

```typescript
// String with length constraints
@ApiProperty({ 
  description: 'Name field', 
  example: 'John Doe',
  minLength: 1,
  maxLength: 100
})
@IsString()
@Length(1, 100)
name!: string;

// Number with range constraints
@ApiProperty({ 
  description: 'Age in years', 
  example: 25,
  minimum: 1,
  maximum: 150
})
@IsNumber()
@Min(1)
@Max(150)
age!: number;

// Enum values
@ApiProperty({ 
  description: 'User role', 
  example: 'admin',
  enum: ['admin', 'teacher', 'student', 'parent']
})
@IsString()
@IsIn(['admin', 'teacher', 'student', 'parent'])
role!: string;

// UUID fields
@ApiProperty({ 
  description: 'User ID', 
  example: 'user-123',
  format: 'uuid'
})
@IsString()
@IsUUID()
userId!: string;

// Email fields
@ApiProperty({ 
  description: 'Email address', 
  example: 'user@example.com',
  format: 'email'
})
@IsString()
@IsEmail()
email!: string;

// Date fields
@ApiProperty({ 
  description: 'Birth date', 
  example: '1990-01-15',
  format: 'date'
})
@IsDateString()
birthDate!: string;

// DateTime fields
@ApiProperty({ 
  description: 'Created timestamp', 
  example: '2024-01-15T10:30:00Z',
  format: 'date-time'
})
@IsDateString()
createdAt!: string;
```

### Complex Objects

```typescript
// JSON string fields
@ApiPropertyOptional({ 
  description: 'Additional metadata as JSON', 
  example: '{"key": "value", "preferences": ["option1", "option2"]}'
})
@IsOptional()
@IsString()
metadata?: string;

// Array fields
@ApiProperty({ 
  description: 'List of tag IDs', 
  example: ['tag1', 'tag2', 'tag3'],
  type: [String]
})
@IsArray()
@IsString({ each: true })
tags!: string[];
```

## Common Swagger Decorators

### Controller Level
- `@ApiTags('TagName')` - Groups endpoints in Swagger UI
- `@ApiOperation({ summary, description })` - Documents individual endpoints
- `@ApiParam({ name, description, example })` - Documents path parameters  
- `@ApiQuery({ name, required?, description, example })` - Documents query parameters
- `@ApiBody({ description, schema })` - Documents request body (usually auto-generated from DTO)

### DTO Level
- `@ApiProperty({ description, example, ...constraints })` - Required fields
- `@ApiPropertyOptional({ description, example, ...constraints })` - Optional fields

### Response Documentation
We use common decorators from `src/common/swagger.decorators.ts`:
- `@ListDocs(description)` - For GET endpoints returning lists
- `@CreateDocs(description)` - For POST endpoints creating resources  
- `@UpdateDocs(description)` - For PATCH/PUT endpoints updating resources
- `@DeleteDocs(description)` - For DELETE endpoints

## Troubleshooting

### Empty Request Body Schemas `{}`

**Problem**: Swagger UI shows `{}` for request bodies instead of proper field documentation.

**Cause**: DTO classes are missing `@ApiProperty` decorators.

**Solution**: Add `@ApiProperty` or `@ApiPropertyOptional` decorators to all DTO fields:

```typescript
// ❌ WRONG - No @ApiProperty decorator
class CreateUserDto {
  @IsString()  // Only validation, no Swagger docs
  name!: string;
}

// ✅ CORRECT - With @ApiProperty decorator
class CreateUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  name!: string;
}
```

### Missing Request Body Schemas

**Problem**: No request body section appears in Swagger UI.

**Cause**: Controller is using Prisma types or inline types instead of proper DTOs.

**Solution**: Create proper DTO classes and use them in controllers:

```typescript
// ❌ WRONG - Using Prisma types
@Post()
create(@Body() data: Prisma.UserCreateInput) {
  return this.service.create(data);
}

// ✅ CORRECT - Using proper DTO
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.service.create(createUserDto);
}
```

### Inconsistent Documentation

**Problem**: Some endpoints have documentation while others don't.

**Solution**: Use our common decorators and follow consistent patterns:

```typescript
@Post()
@ApiOperation({ 
  summary: 'Create user',
  description: 'Creates a new user account with the provided information'
})
@CreateDocs('User created successfully')
create(@Body() createUserDto: CreateUserDto) {
  return this.service.create(createUserDto);
}
```

## Best Practices

### 1. Always Use DTOs
- Never use Prisma types directly in controllers
- Create separate DTOs for create, update, and response operations
- Use `PartialType()` for update DTOs when appropriate

### 2. Comprehensive Field Documentation
- Every field should have a clear description
- Include realistic example values
- Specify all validation constraints
- Use appropriate formats (uuid, email, date, etc.)

### 3. Consistent Naming
- Use descriptive DTO names: `CreateUserDto`, `UpdateUserDto`, `UserResponseDto`
- Use clear operation summaries: "Create user", "Update user", "Get user by ID"
- Use consistent parameter descriptions

### 4. Validation Alignment
- Swagger constraints should match class-validator decorators
- If you add `@Min(1)`, also add `minimum: 1` to `@ApiProperty`
- If you add `@Length(1, 100)`, also add `minLength: 1, maxLength: 100`

### 5. Testing Documentation
- Regularly check http://localhost:3000/api-docs
- Verify all request bodies show proper schemas (not `{}`)
- Test example values to ensure they work
- Validate that all endpoints are properly documented

## File Organization

```
src/
├── modules/
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts      # Proper DTO with @ApiProperty
│   │   │   ├── update-user.dto.ts      # PartialType(CreateUserDto)
│   │   │   └── user-response.dto.ts    # Response DTO if needed
│   │   ├── users.controller.ts         # With @ApiTags, @ApiOperation
│   │   └── users.service.ts
│   └── ...
├── common/
│   ├── swagger.decorators.ts           # Common response decorators
│   └── problem.dto.ts                  # Standard error response DTO
└── docs/
    └── swagger-documentation.md        # This file
```

## Maintenance

### Regular Checks
1. **Weekly**: Review new endpoints to ensure proper documentation
2. **Before releases**: Verify all public APIs have complete documentation
3. **During code reviews**: Check that new DTOs have `@ApiProperty` decorators

### Automated Validation
Consider adding a test that validates all POST/PUT/PATCH endpoints have proper request body schemas:

```typescript
// Example test to prevent empty schemas
it('should have proper request body schemas for all POST endpoints', async () => {
  const response = await request(app.getHttpServer())
    .get('/api-docs-json')
    .expect(200);
    
  const paths = response.body.paths;
  const postEndpoints = Object.entries(paths)
    .filter(([path, methods]) => methods.post)
    .map(([path, methods]) => ({ path, schema: methods.post.requestBody }));
    
  postEndpoints.forEach(({ path, schema }) => {
    if (schema?.content?.['application/json']?.schema?.$ref) {
      const schemaName = schema.content['application/json'].schema.$ref.split('/').pop();
      const actualSchema = response.body.components.schemas[schemaName];
      expect(Object.keys(actualSchema.properties || {})).toHaveLength.greaterThan(0);
    }
  });
});
```

## Summary

The key to maintaining good API documentation is:

1. **Always add `@ApiProperty` decorators to DTO fields**
2. **Use proper DTOs instead of Prisma types in controllers**
3. **Follow consistent patterns for all endpoints**
4. **Regularly verify the documentation at /api-docs**

Following these guidelines ensures that our API documentation remains comprehensive, accurate, and useful for developers consuming our APIs.