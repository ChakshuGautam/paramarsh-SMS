# DemoDataService - TDD Test Suite Documentation

## Overview

Comprehensive backend unit tests for the `DemoDataService` using Test-Driven Development (TDD) methodology. These tests define the expected behavior of the service BEFORE implementation.

**Status**: ✅ **Tests Written** (Red Phase) - Service NOT implemented yet
**Location**: `apps/api/src/modules/onboarding/demo-data.service.spec.ts`
**Test Framework**: Jest + NestJS Testing
**Total Test Cases**: 50+ tests covering all methods and edge cases

---

## Test Coverage Summary

### 1. **generateDemoData(onboardingStateId: string, branchId: string)**
**Purpose**: Main entry point to create complete demo dataset for onboarding dashboard tour

**Tests**:
- ✅ Should create complete demo dataset successfully
- ✅ Should use Indian names and context for demo data
- ✅ Should create at least 50 demo students
- ✅ Should create at least 10 demo teachers
- ✅ Should create class/section structure for grades 6-12
- ✅ Should create attendance records for visualization
- ✅ Should create fee/invoice data
- ✅ Should mark all demo data with `isDemo` flag
- ✅ Should associate demo data with `onboardingStateId`
- ✅ Should return summary of created data
- ✅ Should throw `BadRequestException` if `onboardingStateId` is invalid
- ✅ Should throw `BadRequestException` if `branchId` is invalid
- ✅ Should handle database errors gracefully
- ✅ Should rollback if generation fails mid-way (transaction)

**Expected Return Format**:
```typescript
{
  summary: {
    studentsCreated: number;        // >= 50
    teachersCreated: number;        // >= 10
    classesCreated: number;         // >= 7 (grades 6-12)
    sectionsCreated: number;        // >= 14 (2 per grade)
    attendanceRecordsCreated: number; // > 0
    feeDataCreated: boolean;        // true
  }
}
```

---

### 2. **createDemoStudents(onboardingStateId: string, branchId: string)**
**Purpose**: Generate 50+ realistic demo students with Indian names and context

**Tests**:
- ✅ Should create students with Indian names (Aarav, Diya, Ananya, Arjun, Kavya, Rohit, Priya, Vikram, etc.)
- ✅ Should assign students to different classes (grades 6-12)
- ✅ Should generate realistic roll numbers (format: `8A01`, `9B02`, etc.)
- ✅ Should mark all students with `isDemo: true`
- ✅ Should associate students with correct `branchId`
- ✅ Should create realistic phone numbers with `+91` prefix

**Expected Student Data**:
```typescript
{
  id: string;              // UUID
  firstName: string;       // Indian name (Aarav, Diya, etc.)
  lastName: string;        // Indian surname
  branchId: string;        // Provided branchId
  grade: string;           // "6" to "12"
  rollNumber: string;      // Format: "8A01", "9B02"
  phoneNumber?: string;    // "+91XXXXXXXXXX"
  isDemo: true;            // MUST be true
  demoOnboardingId: string; // Provided onboardingStateId
}
```

---

### 3. **createDemoTeachers(onboardingStateId: string, branchId: string)**
**Purpose**: Generate 10+ demo teachers with subject assignments

**Tests**:
- ✅ Should create teachers with Indian names (Anita, Ravi, Priya, Rajesh, Sunita, Amit, etc.)
- ✅ Should assign subjects to teachers (Math, Science, English, History, Geography, etc.)
- ✅ Should mark teachers with `isDemo: true`
- ✅ Should create corresponding staff records

**Expected Teacher Data**:
```typescript
{
  id: string;              // UUID
  name: string;            // Indian name (Anita Sharma, Ravi Verma)
  subject: string;         // Math, Science, English, etc.
  branchId: string;        // Provided branchId
  isDemo: true;            // MUST be true
  demoOnboardingId: string; // Provided onboardingStateId
}
```

---

### 4. **createDemoClasses(branchId: string)**
**Purpose**: Create class/section structure for grades 6-12

**Tests**:
- ✅ Should create grades 6-12 (7 grades total)
- ✅ Should create 2 sections per grade (A, B) = 14 sections
- ✅ Should set realistic capacities (30-50 students per class)

**Expected Class Structure**:
```typescript
// Classes
{
  id: string;
  grade: string;           // "6", "7", "8", "9", "10", "11", "12"
  branchId: string;
  capacity: number;        // 30-50
}

// Sections
{
  id: string;
  classId: string;         // Reference to class
  name: string;            // "A" or "B"
  capacity: number;        // 30-50
}
```

---

### 5. **createDemoAttendance(branchId: string)**
**Purpose**: Generate attendance records for last 30 days with realistic patterns

**Tests**:
- ✅ Should create attendance records for last 30 days
- ✅ Should have realistic attendance patterns (85-95% attendance rate)
- ✅ Should mark demo students in attendance

**Expected Attendance Pattern**:
```typescript
{
  id: string;
  studentId: string;       // Demo student ID
  date: Date;              // Last 30 days
  status: 'present' | 'absent' | 'late';
  // 85-95% should be 'present'
}
```

**Validation**: Attendance rate = (present / total) * 100 should be between 85-95%

---

### 6. **createDemoFeeData(branchId: string)**
**Purpose**: Create fee structures, invoices, and payment records

**Tests**:
- ✅ Should create fee structures (Tuition, Transport, Activity fees)
- ✅ Should create invoices for students
- ✅ Should create some paid and pending payments
- ✅ Should use Indian rupees (₹) - amounts in range 1,000-200,000 INR

**Expected Fee Data**:
```typescript
// Fee Structure
{
  id: string;
  name: string;            // "Tuition Fee", "Transport Fee", etc.
  amount: number;          // 1000-200000 (INR)
  frequency: string;       // "annually", "quarterly", "monthly"
  branchId: string;
}

// Invoice
{
  id: string;
  studentId: string;       // Demo student ID
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

// Payment
{
  id: string;
  invoiceId: string;
  amount: number;
  status: 'paid' | 'pending';
}
```

---

### 7. **cleanupDemoData(onboardingStateId: string)**
**Purpose**: Delete all demo data associated with an onboarding session

**Tests**:
- ✅ Should delete all data marked with `onboardingStateId`
- ✅ Should cascade delete properly (related records first)
- ✅ Should not affect real data (only deletes demo data)
- ✅ Should throw error if `onboardingStateId` is invalid
- ✅ Should handle cleanup errors gracefully
- ✅ Should return cleanup summary

**Expected Return Format**:
```typescript
{
  studentsDeleted: number;
  teachersDeleted: number;
  staffDeleted: number;
  attendanceDeleted: number;
  invoicesDeleted: number;
  paymentsDeleted: number;
}
```

**Deletion Order** (to respect foreign keys):
1. Payments
2. Invoices
3. Attendance records
4. Students
5. Teachers
6. Staff
7. Sections
8. Classes
9. Fee structures

---

## Error Handling Tests

### Input Validation
- ✅ Invalid `onboardingStateId` (empty, null, undefined) → `BadRequestException`
- ✅ Invalid `branchId` (empty, null, undefined) → `BadRequestException`

### Database Errors
- ✅ Database connection failures → Proper error propagation
- ✅ Transaction failures → Rollback and error
- ✅ Partial failures → Complete rollback (all-or-nothing)

### Transaction Rollback
- ✅ If any part of `generateDemoData` fails, entire transaction should rollback
- ✅ No partial data should be created

---

## Indian Context Requirements

### Names
**Students**: Aarav, Diya, Ananya, Arjun, Kavya, Rohit, Priya, Vikram, Ishaan, Aisha, Rohan, Saanvi, Vihaan, Aadhya, Aryan, Kiara, Reyansh, Myra, Shaurya, Pari, Ayaan, Navya, Atharv, Ira, Vivaan, Riya, Aditya, Siya, Krishna, Anvi

**Teachers**: Anita Sharma, Ravi Verma, Priya Gupta, Rajesh Kumar, Sunita Patel, Amit Singh, Kavita Reddy, Suresh Nair, Pooja Joshi, Manoj Iyer

### Phone Numbers
- Format: `+91XXXXXXXXXX`
- Example: `+919876543210`, `+918765432109`

### Subjects
Math, Science (Physics, Chemistry, Biology), English, Hindi, History, Geography, Computer Science, Physical Education, Arts, Music

### Fee Amounts (INR)
- Tuition Fee: ₹40,000 - ₹100,000 per year
- Transport Fee: ₹8,000 - ₹15,000 per year
- Activity Fee: ₹3,000 - ₹8,000 per year

---

## Test Execution

### Running Tests

```bash
# Run all demo data service tests
cd apps/api
npm test -- demo-data.service.spec.ts

# Run with coverage
npm test -- demo-data.service.spec.ts --coverage

# Run in watch mode
npm test -- demo-data.service.spec.ts --watch

# Run specific test suite
npm test -- demo-data.service.spec.ts -t "generateDemoData"
```

### Expected Initial Result (TDD Red Phase)

```
FAIL src/modules/onboarding/demo-data.service.spec.ts
  ● Test suite failed to run

    Cannot find module './demo-data.service'
```

**This is EXPECTED!** ✅ The tests are written FIRST (TDD methodology). The service implementation comes next.

---

## Implementation Checklist

When implementing `demo-data.service.ts`, ensure:

1. **Service Structure**:
   - [ ] Injectable NestJS service
   - [ ] Constructor with PrismaService dependency
   - [ ] All 7 public methods implemented

2. **Data Generation**:
   - [ ] Use transaction for atomicity
   - [ ] Generate realistic Indian names
   - [ ] Create relationships between entities
   - [ ] Mark all data with `isDemo: true`
   - [ ] Associate with `demoOnboardingId`

3. **Validation**:
   - [ ] Validate `onboardingStateId` is not empty
   - [ ] Validate `branchId` is not empty
   - [ ] Throw `BadRequestException` for invalid inputs

4. **Error Handling**:
   - [ ] Wrap operations in transaction
   - [ ] Rollback on any failure
   - [ ] Proper error messages
   - [ ] Log errors appropriately

5. **Return Values**:
   - [ ] Return summary object from `generateDemoData`
   - [ ] Return cleanup summary from `cleanupDemoData`
   - [ ] Include counts for all created entities

---

## Testing Best Practices Applied

1. **Arrange-Act-Assert Pattern**: All tests follow AAA pattern
2. **Isolated Tests**: Each test is independent with proper setup/teardown
3. **Mocked Dependencies**: PrismaService is completely mocked
4. **Edge Cases**: Tests cover success paths, error paths, and edge cases
5. **Descriptive Names**: Test names clearly describe what they verify
6. **Realistic Data**: Mock data matches real-world Indian school context
7. **Transaction Testing**: Verify rollback behavior on failures

---

## Next Steps

### TDD Workflow

**Phase 1: RED** ✅ (Current)
- Tests written
- Tests FAIL (service not implemented)

**Phase 2: GREEN** (Next)
- Implement `demo-data.service.ts`
- Make tests PASS
- Minimal implementation to pass tests

**Phase 3: REFACTOR**
- Optimize implementation
- Extract common logic
- Improve code quality
- Tests should still PASS

### Implementation Order

1. Start with simplest method: `createDemoClasses`
2. Then: `createDemoStudents`
3. Then: `createDemoTeachers`
4. Then: `createDemoAttendance`
5. Then: `createDemoFeeData`
6. Then: `generateDemoData` (orchestrates all)
7. Finally: `cleanupDemoData`

### Running Tests During Implementation

```bash
# Watch mode - auto-run tests on file changes
npm test -- demo-data.service.spec.ts --watch

# Run specific test while implementing
npm test -- demo-data.service.spec.ts -t "createDemoClasses"
```

---

## Integration Points

### OnboardingService Integration

The `DemoDataService` will be used by `OnboardingService` in Step 2:

```typescript
// In OnboardingService
async getDemoData(userId: string) {
  const state = await this.getOrCreateState(userId);

  // Generate demo data using DemoDataService
  const demoData = await this.demoDataService.generateDemoData(
    state.id,
    state.branchId || 'demo-branch'
  );

  return demoData;
}
```

### Database Schema Requirements

Ensure these fields exist in schema:
- `Student.isDemo` (Boolean)
- `Student.demoOnboardingId` (String, nullable)
- `Teacher.isDemo` (Boolean)
- `Teacher.demoOnboardingId` (String, nullable)
- `Staff.isDemo` (Boolean)
- `Staff.demoOnboardingId` (String, nullable)

---

## Summary Statistics

**Test File**: `apps/api/src/modules/onboarding/demo-data.service.spec.ts`
**Total Lines**: ~1,100 lines
**Test Suites**: 8 describe blocks
**Total Tests**: 50+ individual test cases
**Coverage Areas**:
- ✅ Main method (`generateDemoData`)
- ✅ Student generation
- ✅ Teacher generation
- ✅ Class/section creation
- ✅ Attendance records
- ✅ Fee data
- ✅ Cleanup operations
- ✅ Error handling
- ✅ Input validation
- ✅ Transaction rollback

**Status**: Ready for implementation (TDD Red Phase complete)

---

## Related Documentation

- **Implementation Plan**: `docs/features/onboarding/IMPLEMENTATION-PLAN.md`
- **Onboarding Journey**: `docs/features/onboarding/ONBOARDING-JOURNEY.md`
- **API Conventions**: `docs/global/04-API-CONVENTIONS.md`
- **Testing Strategy**: `docs/global/08-TESTING-STRATEGY.md`

---

**Document Version**: 1.0
**Created**: 2025-10-07
**Status**: TDD Tests Complete - Ready for Implementation
**Next Action**: Implement `demo-data.service.ts` to make tests pass
