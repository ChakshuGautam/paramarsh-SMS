# React Admin API Specification

## Overview
React Admin expects a specific API contract for its data provider. All CRUD operations must follow this specification exactly.

## API Methods and Expected Responses

### 1. getList - GET /api/resources
**Request Query Parameters:**
- `page`: Page number (1-based)
- `perPage`: Number of items per page
- `sort`: Sort field (use `-field` for DESC)
- `filter`: Object with filter parameters

**Expected Response:**
```json
{
  "data": [...],
  "total": 100
}
```

### 2. getOne - GET /api/resources/:id
**Expected Response:**
```json
{
  "data": { "id": "123", ... }
}
```

### 3. getMany - GET /api/resources?id=1&id=2&id=3
**Request Query Parameters:**
- `id`: Array of IDs (repeated parameter)

**Expected Response:**
```json
{
  "data": [...]
}
```

### 4. getManyReference - GET /api/resources?target_field=value
**Request Query Parameters:**
- Filter by foreign key reference
- Same pagination/sort as getList

**Expected Response:**
```json
{
  "data": [...],
  "total": 50
}
```

### 5. create - POST /api/resources
**Request Body:** The resource data

**Expected Response:**
```json
{
  "data": { "id": "new-id", ...createdResource }
}
```

### 6. update - PUT /api/resources/:id
**Request Body:** The updated resource data

**Expected Response:**
```json
{
  "data": { "id": "123", ...updatedResource }
}
```

### 7. updateMany - PUT /api/resources
**Request Body:**
```json
{
  "ids": ["1", "2", "3"],
  "data": { ...updates }
}
```

**Expected Response:**
```json
{
  "data": ["1", "2", "3"]
}
```

### 8. delete - DELETE /api/resources/:id
**Expected Response:**
```json
{
  "data": { "id": "123", ...deletedResource }
}
```

### 9. deleteMany - DELETE /api/resources
**Request Body:**
```json
{
  "ids": ["1", "2", "3"]
}
```

**Expected Response:**
```json
{
  "data": ["1", "2", "3"]
}
```

## Our Current API vs React Admin Requirements

### What's Working ✅
- Basic CRUD operations structure
- Pagination with page/pageSize
- Sorting with sort parameter
- Filter parameters

### What Needs Adjustment ⚠️

1. **Response Format Standardization**
   - Current: Sometimes `{ data, meta }`, sometimes just data
   - Required: Always `{ data }` for single, `{ data, total }` for lists

2. **getMany Implementation**
   - Current: Fetching individually
   - Better: Single endpoint with multiple IDs

3. **Update Method**
   - Current: PATCH (partial update)
   - React Admin default: PUT (full replacement)
   - Solution: Support both, use PUT for React Admin

4. **Consistent Error Responses**
   - Need standardized error format for React Admin

## Implementation Checklist

- [ ] Ensure all list endpoints return `{ data: [], total: number }`
- [ ] Ensure all single endpoints return `{ data: object }`
- [ ] Implement getMany endpoint for batch fetching
- [ ] Support both PUT and PATCH for updates
- [ ] Standardize error responses
- [ ] Remove nested `meta` object, put `total` at root level
- [ ] Ensure DELETE returns the deleted object
- [ ] Implement updateMany and deleteMany endpoints