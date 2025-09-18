---
allowed-tools: Bash(claudeCurl:*), Bash(echo:*)
description: Validate API endpoints for a specific module
argument-hint: [module-name] [branch-id]
---

# API Endpoint Validation

Validate all CRUD endpoints for the specified module.

## Configuration
- Module: $1 (e.g., students, teachers, classes)
- Branch ID: ${2:-dps-main}
- Base URL: http://localhost:3005/api

## Validation Tasks

### 1. Test GET (List) Endpoint
Test the list endpoint with pagination and filtering:
- GET /api/$1?branchId=$2&_start=0&_end=10
- Verify response includes `data` array and `total` count
- Check proper React Admin format compliance

### 2. Test GET (Single) Endpoint  
Test fetching a single record (if records exist):
- GET /api/$1/{id}?branchId=$2
- Verify response includes single record with all required fields

### 3. Test POST (Create) Endpoint
Test creating a new record with sample data:
- POST /api/$1 with appropriate test data for the module
- Include branchId in the request body
- Verify the created record is returned

### 4. Test PUT (Update) Endpoint
Test updating an existing record:
- PUT /api/$1/{id} with updated data
- Verify the updated record is returned
- Check that branchId remains unchanged

### 5. Test DELETE Endpoint
Test soft delete functionality:
- DELETE /api/$1/{id}?branchId=$2
- Verify record is soft-deleted (deletedAt timestamp set)
- Confirm record no longer appears in GET list

## Analysis Required

1. Verify all endpoints follow React Admin Data Provider specification
2. Check that multi-tenancy (branchId) is properly enforced
3. Validate response formats match expected structure
4. Report any errors or non-compliance issues
5. Suggest fixes for any problems found

Use the claudeCurl alias for all HTTP requests.