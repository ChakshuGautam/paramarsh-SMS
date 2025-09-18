# Comprehensive Create Flows E2E Tests

## 🎯 Overview

This directory contains the comprehensive E2E test suite for all create flows in the Paramarsh SMS application. The test validates the creation of all 19 entities across the system.

## 📋 Entities Tested

The test covers creation flows for all entities in proper dependency order:

### 1. Core Academic Entities
- **Academic Years** (`academicYears`) - Independent baseline entity
- **Classes** (`classes`) - Independent academic structure  
- **Sections** (`sections`) - Depends on classes

### 2. People Entities
- **Students** (`students`) - Depends on classes/sections via enrollment
- **Teachers** (`teachers`) - Independent staff entity
- **Staff** (`staff`) - Independent staff entity
- **Guardians** (`guardians`) - Depends on students

### 3. Academic Process Entities
- **Enrollments** (`enrollments`) - Depends on students and sections
- **Exams** (`exams`) - Academic assessment entity
- **Marks** (`marks`) - Depends on students and exams
- **Attendance Records** (`attendanceRecords`) - Depends on students

### 4. Financial Entities
- **Fee Structures** (`feeStructures`) - Financial structure entity
- **Invoices** (`invoices`) - Depends on students and fee structures
- **Payments** (`payments`) - Depends on invoices

### 5. Communication & Support Entities
- **Campaigns** (`campaigns`) - Communication entity
- **Messages** (`messages`) - Communication entity
- **Templates** (`templates`) - Template entity
- **Tickets** (`tickets`) - Support entity

### 6. Admissions Entities
- **Admissions Applications** (`admissionsApplications`) - Admissions entity

## 🚀 Running the Tests

### Prerequisites
Ensure both servers are running:
```bash
# Frontend server (port 3001)
npm run dev

# Backend server (port 3005) 
# Should already be running
```

### Quick Start
```bash
# Make the script executable (first time only)
chmod +x run-create-flows-test.sh

# Run all create flows tests
./run-create-flows-test.sh
```

### Manual Execution
```bash
# Run specific test file
npx playwright test test/e2e/create-flows/test-all-create-flows.spec.ts

# Run with specific browser
npx playwright test test/e2e/create-flows/test-all-create-flows.spec.ts --project=chromium

# Run with debugging
npx playwright test test/e2e/create-flows/test-all-create-flows.spec.ts --debug

# Run specific test by name
npx playwright test -g "Academic Year Creation"
```

## 📊 Test Structure

### Individual Entity Tests
Each entity has its own test that:
1. Navigates to the create page
2. Fills all required fields with realistic Indian context data
3. Handles dependencies (creates required entities first)
4. Submits the form
5. Validates successful creation
6. Takes screenshots for documentation

### Comprehensive Sequence Test
The test `99 - Complete Create Flow Sequence` runs through all entities in proper dependency order to ensure the entire system works together.

### Test Data
All test data uses authentic Indian context:
- **Names**: Aadhya Sharma, Rajesh Kumar, Priya Gupta
- **Phone Numbers**: +91 format 
- **Addresses**: Indian cities and PIN codes
- **Academic**: Indian school system structure

## 📸 Documentation & Debugging

### Screenshots
Tests automatically capture screenshots at key points:
- **Form filled**: Before submission
- **Final state**: After submission attempt
- **Failures**: Full page screenshots on test failures

Screenshots are saved to: `test-results/screenshots/`

### Generated Files
- **Videos**: `test-results/videos/` (on failures)
- **Traces**: `test-results/traces/` (for debugging)
- **HTML Report**: `playwright-report/`

### Viewing Results
```bash
# View detailed HTML report
npx playwright show-report

# Check test results directory
ls test-results/screenshots/
```

## 🔧 Test Features

### Robust Selector Strategy
Tests use multiple selector strategies in priority order:
1. Semantic selectors (`getByRole`, `getByLabel`)
2. Test IDs (if available)  
3. Accessible attributes
4. CSS selectors (as fallback)

### Dependency Management
Tests handle entity dependencies by:
- Creating required entities before dependent ones
- Storing created entity references for later use
- Using proper relationship mappings

### Error Handling
- Graceful handling of missing fields
- Multiple selector fallbacks
- Detailed logging for debugging
- Screenshot capture on failures

### Authentication
Uses the existing `AuthHelper` with correct test credentials:
- Username: `admin`
- Password: `P@ramarsh#Admin2024$Secure`
- School: `dps` (Delhi Public School)
- Branch: `main` (Main Campus)

## 📈 Success Metrics

The comprehensive sequence test expects:
- **Success Rate**: Minimum 70% of entities created successfully
- **Individual Tests**: Each entity test should pass independently
- **No Console Errors**: Forms should not produce JavaScript errors
- **Proper Navigation**: Should redirect/show success after creation

## 🛠️ Troubleshooting

### Common Issues

#### 1. Authentication Fails
- Verify servers are running on correct ports
- Check test credentials match current system
- Ensure school/branch dropdown selections work

#### 2. Form Fields Not Found
- Check if UI components have changed
- Verify field names match form components
- Add new selectors if needed

#### 3. Dependency Issues
- Ensure prerequisite entities exist in database
- Check reference field mappings
- Verify autocomplete/dropdown options load

#### 4. Timeout Issues
- Increase timeout values if needed
- Check network speed and server response times
- Verify proper wait strategies are used

### Debug Mode
Run tests in headed mode to see what's happening:
```bash
npx playwright test test/e2e/create-flows/test-all-create-flows.spec.ts --headed --debug
```

### Adding New Entities
When adding new create flows:
1. Add entity data to `TEST_DATA` object
2. Create individual test following existing pattern
3. Add to comprehensive sequence test
4. Update dependency mappings if needed
5. Update this documentation

## 📚 Related Documentation

- **Main E2E Testing Guide**: `../README.md`
- **Page Objects**: `../helpers/page-objects.ts`
- **Playwright Config**: `../../playwright.config.ts`
- **Test Credentials**: Project documentation

## 🎯 Goals Achieved

This comprehensive test suite ensures:
- ✅ All 19 create flows are tested
- ✅ Dependencies are handled properly  
- ✅ Realistic Indian context data is used
- ✅ Robust error handling and debugging
- ✅ Comprehensive documentation and screenshots
- ✅ Both individual and sequence testing
- ✅ Performance monitoring and metrics