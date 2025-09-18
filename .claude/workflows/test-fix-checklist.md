# Test & Fix Checklist Template

## 🎯 For Each Page/Tab Testing Session

### Pre-Testing Setup
- [ ] Servers running (Backend: 3005, Frontend: 3001)
- [ ] Test branch selected (usually `dps-main`)
- [ ] Browser dev tools ready
- [ ] Network monitoring setup

### Phase 1: Discovery ✂️

#### Network Monitoring
- [ ] Navigate to target page/tab
- [ ] Set up Puppeteer network interception
- [ ] Capture all API calls made on page load
- [ ] Document API endpoints and parameters
- [ ] Screenshot the page for reference

**TodoWrite Pattern:**
```
1. [pending] Monitor network calls for [Page/Tab Name]
2. [pending] Extract displayed UI values from [Page/Tab Name]  
3. [pending] Compare UI values with API responses
4. [pending] Document discrepancies found
```

#### Data Extraction
- [ ] Extract all numerical values from UI
- [ ] Note data formats (currency, percentages, counts)
- [ ] Test different filters/date ranges
- [ ] Document expected vs actual values

### Phase 2: API Testing 🔍

#### Direct API Validation
- [ ] Test all discovered endpoints with curl MCP
- [ ] Verify branch filtering with different `X-Branch-Id` values
- [ ] Test date range parameters
- [ ] Compare API responses with UI display
- [ ] Validate data types and formats

**API Test Commands:**
```bash
# Student count
mcp__curl__curl http://localhost:3005/api/v1/students -H "X-Branch-Id: dps-main" --jq '.total'

# Teacher count  
mcp__curl__curl http://localhost:3005/api/v1/teachers -H "X-Branch-Id: dps-main" --jq '.total'

# Attendance stats
mcp__curl__curl "http://localhost:3005/api/v1/attendance-records/dashboard/stats?date=2025-09-12" -H "X-Branch-Id: dps-main"
```

### Phase 3: Database Validation 💾

#### PostgreSQL Queries
- [ ] Count total records in relevant tables
- [ ] Count active/filtered records
- [ ] Check multi-tenancy (branch isolation)
- [ ] Validate relationships and joins

**Database Query Pattern:**
```sql
-- Total vs Active comparison
SELECT 
  'Total[TableName]' as type,
  COUNT(*) as count
FROM "[TableName]" 
WHERE "branchId" = 'dps-main' 
  AND "deletedAt" IS NULL
UNION ALL
SELECT 
  'Active[TableName]' as type,
  COUNT(*) as count
FROM "[TableName]" 
WHERE "branchId" = 'dps-main' 
  AND "deletedAt" IS NULL 
  AND "status" = 'active';
```

### Phase 4: Issue Analysis 🧐

#### Common Issue Patterns to Check
- [ ] **Filtering Inconsistency**: Different status filtering between services
- [ ] **Branch Isolation**: Missing `X-Branch-Id` header handling  
- [ ] **Calculation Errors**: Aggregation vs average calculations
- [ ] **Date Handling**: Date range parameter issues
- [ ] **Caching**: Frontend showing stale/cached data
- [ ] **Soft Delete**: Inconsistent `deletedAt` filtering

**TodoWrite Pattern:**
```
1. [completed] Monitor network calls for [Page/Tab Name]
2. [completed] Extract displayed UI values from [Page/Tab Name]
3. [completed] Compare UI values with API responses  
4. [in_progress] Analyze root cause of [specific discrepancy]
5. [pending] Fix [service/controller] inconsistency
6. [pending] Create E2E test for [Page/Tab Name]
```

### Phase 5: Fix Implementation 🔧

#### Backend Fixes (Use backend-implementer agent)
- [ ] Identify the most restrictive/accurate service logic
- [ ] Apply consistent filtering to all related services
- [ ] Fix controller header handling
- [ ] Ensure proper multi-tenancy support
- [ ] Validate calculation logic

**Agent Usage Pattern:**
```
Task: backend-implementer
Description: Fix [specific issue] in [service name]
Prompt: Fix the [data inconsistency] between [Service A] and [Service B]...
```

#### Service Fix Patterns
```typescript
// Consistent filtering pattern
protected buildWhereClause(filter?: Record<string, any>): any {
  const where = super.buildWhereClause(filter);
  
  if (!filter?.includeAllStatuses && !where.status) {
    where.status = 'active';
  }
  
  return where;
}

// Controller header handling
@Get()
async getList(
  @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  // ... other params
) {
  return this.service.getList({
    // ... params
    branchId,
  });
}
```

### Phase 6: E2E Test Creation 🧪

#### Test Implementation (Use tester agent)
- [ ] Create comprehensive test file
- [ ] Test multiple scenarios (branches, filters, date ranges)
- [ ] Include performance validation
- [ ] Add error handling tests
- [ ] Test network resilience

**Agent Usage Pattern:**
```
Task: tester  
Description: Create E2E test for [Page/Tab Name] data accuracy
Prompt: Create comprehensive E2E test using Puppeteer for [page]...
```

#### Test Scenarios Checklist
- [ ] **Data Consistency**: UI values match API responses
- [ ] **Multi-Branch**: Test 3+ different branches
- [ ] **Date Filters**: Today, This Week, This Month
- [ ] **Performance**: Page load < 15 seconds  
- [ ] **Error Handling**: Network failures, API errors
- [ ] **Responsive**: Mobile and desktop views

### Phase 7: Validation & Documentation 📋

#### Final Validation
- [ ] Run E2E tests and ensure all pass
- [ ] Test manually in browser
- [ ] Verify fixes with different branches
- [ ] Test edge cases and error scenarios
- [ ] Performance check

#### Documentation Updates
- [ ] Document fixes in commit messages
- [ ] Update API documentation if needed
- [ ] Add troubleshooting notes
- [ ] Update test coverage reports

**TodoWrite Completion:**
```
1. [completed] Monitor network calls for [Page/Tab Name]
2. [completed] Extract displayed UI values from [Page/Tab Name]
3. [completed] Compare UI values with API responses
4. [completed] Analyze root cause of [specific discrepancy]
5. [completed] Fix [service/controller] inconsistency
6. [completed] Create E2E test for [Page/Tab Name]
7. [completed] Validate fixes and run tests
```

---

## 🔄 Quick Reference Commands

### Setup
```bash
cd apps/web
# Ensure servers are running
# Backend: localhost:3005
# Frontend: localhost:3001
```

### Network Monitoring with Puppeteer MCP
```javascript
// Inject this in browser
window.apiCalls = [];
const originalFetch = window.fetch;
window.fetch = function(...args) {
  window.apiCalls.push({
    url: args[0],
    method: (args[1] || {}).method || 'GET',
    headers: (args[1] || {}).headers || {},
    timestamp: new Date().toISOString()
  });
  return originalFetch.apply(this, args);
};
```

### API Testing
```bash
# Test pattern
mcp__curl__curl "http://localhost:3005/api/v1/[endpoint]" \
  -H "X-Branch-Id: dps-main" \
  --jq '[filter]'
```

### Database Validation
```sql
-- Quick count pattern
SELECT COUNT(*) FROM "[Table]" 
WHERE "branchId" = 'dps-main' 
  AND "deletedAt" IS NULL;
```

### E2E Test Run
```bash
# Run specific test
npm run e2e test/e2e/[module]-data-accuracy.spec.ts

# Debug mode
npm run e2e:debug

# Generate report
npm run e2e -- --reporter=html
```

---

## 📊 Success Criteria

### For Each Page/Tab Tested:
- ✅ All displayed numbers match API responses exactly
- ✅ Multi-branch isolation working correctly
- ✅ Date filters trigger correct API calls
- ✅ No impossible values (like >100% rates)
- ✅ Performance within acceptable limits
- ✅ E2E test coverage created
- ✅ Documentation updated

### Quality Gates:
- ✅ Zero data consistency issues
- ✅ All APIs respect `X-Branch-Id` headers  
- ✅ Calculation logic is mathematically correct
- ✅ Error handling is graceful
- ✅ Tests are maintainable and robust