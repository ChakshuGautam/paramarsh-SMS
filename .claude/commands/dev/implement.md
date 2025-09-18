---
description: Implement a new module with full stack (backend + frontend)
argument-hint: [module-name] [fields-list]
---

# Full Stack Module Implementation

Implement a complete module with backend API and frontend UI.

## Module Configuration
- Module Name: $1 (singular, e.g., "announcement", "event")
- Fields: $2 (comma-separated, e.g., "title,content,date,priority")

## Implementation Workflow

### Phase 1: Backend Implementation
**Use backend-implementer agent** to:
1. Create Prisma schema for the module
2. Generate migrations and update database
3. Implement NestJS module with:
   - Controller with full CRUD operations
   - Service with business logic
   - DTOs for validation
   - Multi-tenancy support (branchId)
4. Ensure React Admin Data Provider format compliance

### Phase 2: Frontend Implementation  
**Use frontend-implementer agent** to:
1. Create React Admin resource components:
   - List component with DataGrid
   - Create component with form
   - Edit component with form
   - Show component (if needed)
2. Use ONLY shadcn/ui components (no MUI)
3. Implement proper date handling with safety checks
4. Add to admin dashboard navigation

### Phase 3: Testing
**Use appropriate testing agents**:
1. Backend tests with tester agent
2. Frontend unit tests with frontend-tester agent
3. E2E tests with playwright-e2e-tester agent

### Phase 4: Validation
1. Run API validation for all endpoints
2. Test multi-tenancy isolation
3. Verify UI responsiveness
4. Check form validations
5. Ensure proper error handling

## Critical Rules

1. **MUST** use specialized agents for each phase:
   - backend-implementer for API
   - frontend-implementer for UI  
   - Test agents for testing
2. **NEVER** let main Claude write implementation code
3. **ALWAYS** follow existing patterns in the codebase
4. **MUST** maintain multi-tenancy with branchId

## Success Criteria
- [ ] Backend API fully functional
- [ ] Frontend UI integrated with API
- [ ] All tests passing
- [ ] Multi-tenancy working correctly
- [ ] Documentation updated