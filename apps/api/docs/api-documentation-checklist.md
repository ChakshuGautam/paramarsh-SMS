# API Documentation Checklist

Use this checklist when adding or updating API endpoints to ensure proper Swagger documentation.

## Controller Checklist

- [ ] Added `@ApiTags('ResourceName')` to the controller class
- [ ] Each endpoint has `@ApiOperation({ summary, description })`
- [ ] Path parameters documented with `@ApiParam({ name, description, example })`
- [ ] Query parameters documented with `@ApiQuery({ name, required?, description, example })`
- [ ] Used common response decorators (`@ListDocs`, `@CreateDocs`, `@UpdateDocs`, `@DeleteDocs`)

## DTO Checklist

- [ ] **CRITICAL**: All DTO fields have `@ApiProperty` or `@ApiPropertyOptional` decorators
- [ ] Field descriptions are clear and helpful
- [ ] Example values are realistic and useful
- [ ] Validation constraints match between `@ApiProperty` and class-validator decorators
- [ ] Enum values specified where applicable
- [ ] Proper formats used (uuid, email, date, date-time)
- [ ] Required vs optional fields correctly marked

## Common Patterns

### Required String Field
```typescript
@ApiProperty({ 
  description: 'Field description', 
  example: 'Example value',
  minLength: 1,
  maxLength: 100
})
@IsString()
@Length(1, 100)
fieldName!: string;
```

### Optional UUID Field
```typescript
@ApiPropertyOptional({ 
  description: 'Related entity ID', 
  example: 'entity-123',
  format: 'uuid'
})
@IsOptional()
@IsString()
@IsUUID()
entityId?: string;
```

### Enum Field
```typescript
@ApiProperty({ 
  description: 'Status value', 
  example: 'active',
  enum: ['active', 'inactive', 'pending']
})
@IsString()
@IsIn(['active', 'inactive', 'pending'])
status!: string;
```

## Testing

After implementation:

- [ ] Visit http://localhost:3000/api-docs
- [ ] Verify endpoint appears with proper documentation
- [ ] Check request body shows field schemas (not empty `{}`)
- [ ] Test example values work correctly
- [ ] Verify all endpoints in the resource are documented

## Red Flags

❌ **Request body shows `{}`** → Missing `@ApiProperty` decorators on DTO fields
❌ **No request body section** → Using Prisma types instead of DTOs
❌ **Missing endpoint** → No `@ApiOperation` decorator
❌ **Empty descriptions** → Missing or incomplete decorator parameters

## Quick Fix Commands

```bash
# Check for empty schemas
curl -s http://localhost:3000/api-docs-json | jq '.components.schemas | to_entries[] | select(.value.properties == {}) | .key'

# Count documented vs total POST endpoints  
curl -s http://localhost:3000/api-docs-json | jq '.paths | to_entries[] | select(.value.post and .value.post.requestBody.content."application/json".schema."$ref") | .key' | wc -l
```