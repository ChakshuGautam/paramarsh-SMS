---
description: Run E2E tests for a specific module using Playwright
argument-hint: [module-name] [test-type]
---

# E2E Test Execution

Run end-to-end tests for the specified module using the playwright-e2e-tester agent.

## Test Configuration
- Module: $1 (e.g., students, teachers, enrollments)  
- Test Type: ${2:-all} (all, crud, validation, ui)

## Test Execution Plan

### Phase 1: Pre-Test Validation
1. Check that both frontend (3001) and backend (3005) are healthy
2. Verify test data exists for the specified module
3. Ensure Playwright is properly configured

### Phase 2: Test Execution
Based on the test type ($2), execute appropriate tests:

#### For "crud" or "all":
- Test CREATE operation through UI
- Test READ (list and detail views)
- Test UPDATE operation
- Test DELETE operation
- Verify data persistence

#### For "validation" or "all":
- Test form field validations
- Test required field enforcement
- Test data format validations (dates, phone numbers, etc.)
- Test business rule validations

#### For "ui" or "all":
- Test responsive behavior (mobile/desktop)
- Test filters and search functionality
- Test pagination
- Test sorting
- Test bulk operations if available

### Phase 3: Post-Test Analysis
1. Report test results summary
2. Identify any failures with details
3. Suggest fixes for failed tests
4. Update test documentation if needed

## Critical Requirements

**MUST use playwright-e2e-tester agent EXCLUSIVELY for all E2E test execution.**
Never write Playwright tests directly - always delegate to the specialized agent.

The agent should:
1. Use real browser automation (not mocks)
2. Test actual UI components from apps/web
3. Validate against real backend API
4. Follow patterns from docs/PLAYWRIGHT-E2E-TESTING-GUIDE.md