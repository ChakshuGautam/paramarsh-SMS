#!/bin/bash

echo "🧪 Running ALL Seed Tests - Comprehensive Report"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Run all seed tests and capture output
echo "⏳ Running all seed tests... (this may take a few minutes)"
echo ""

# Run tests with proper configuration
OUTPUT=$(npm test -- "src/seed/__tests__" \
  --testTimeout=30000 \
  --maxWorkers=1 \
  --testPathIgnorePatterns="checkpoint" \
  --testPathIgnorePatterns="StudentSeeder-fixed" \
  --verbose=false 2>&1)

# Extract pass/fail statistics
TOTAL_SUITES=$(echo "$OUTPUT" | grep -o "Test Suites:.*" | tail -1)
TOTAL_TESTS=$(echo "$OUTPUT" | grep -o "Tests:.*" | tail -1)

echo "📊 Test Results Summary:"
echo "========================"
echo ""

# Display results
if [[ $TOTAL_SUITES == *"failed"* ]]; then
  echo -e "${RED}$TOTAL_SUITES${NC}"
else
  echo -e "${GREEN}$TOTAL_SUITES${NC}"
fi

if [[ $TOTAL_TESTS == *"failed"* ]]; then
  echo -e "${RED}$TOTAL_TESTS${NC}"
else
  echo -e "${GREEN}$TOTAL_TESTS${NC}"
fi

echo ""

# Extract individual test suite results
echo "📝 Individual Test Suite Results:"
echo "================================="
echo ""

# Core tests
echo "Core Module Tests:"
CORE_RESULT=$(npm test -- "src/seed/__tests__/core" --testTimeout=30000 --maxWorkers=1 2>&1 | grep -E "Tests:" | tail -1)
if [[ $CORE_RESULT == *"failed"* ]]; then
  echo -e "  ${RED}$CORE_RESULT${NC}"
else
  echo -e "  ${GREEN}$CORE_RESULT${NC}"
fi

echo ""
echo "Entity Seeder Tests:"

# Test each entity seeder
ENTITIES=(
  "AcademicYearSeeder"
  "TenantSeeder"
  "SubjectSeeder"
  "ClassSeeder"
  "TeacherSeeder"
  "StudentSeeder"
  "GuardianSeeder"
  "EnrollmentSeeder"
  "FeeStructureSeeder"
  "FeeComponentSeeder"
  "FeeScheduleSeeder"
  "RoomSeeder"
  "TimeSlotSeeder"
  "ClassSubjectTeacherSeeder"
  "TimetablePeriodSeeder"
  "AttendanceSessionSeeder"
  "StudentPeriodAttendanceSeeder"
  "TeacherAttendanceSeeder"
  "InvoiceSeeder"
  "PaymentSeeder"
)

PASSED_COUNT=0
FAILED_COUNT=0

for entity in "${ENTITIES[@]}"; do
  if [ -f "src/seed/__tests__/entities/${entity}.test.ts" ]; then
    echo -n "  ${entity}: "
    RESULT=$(npm test -- "src/seed/__tests__/entities/${entity}.test.ts" --testTimeout=30000 --maxWorkers=1 --silent 2>&1 | grep -E "Tests:" | tail -1)
    
    if [[ $RESULT == *"failed"* ]]; then
      echo -e "${RED}$RESULT${NC}"
      ((FAILED_COUNT++))
    elif [[ $RESULT == *"passed"* ]]; then
      echo -e "${GREEN}$RESULT${NC}"
      ((PASSED_COUNT++))
    else
      echo -e "${YELLOW}No tests found${NC}"
    fi
  fi
done

echo ""
echo "=============================================="
echo "📈 FINAL SUMMARY"
echo "=============================================="
echo ""
echo -e "✅ Passing test suites: ${GREEN}$PASSED_COUNT${NC}"
echo -e "❌ Failing test suites: ${RED}$FAILED_COUNT${NC}"

TOTAL_SUITES=$((PASSED_COUNT + FAILED_COUNT))
if [ $TOTAL_SUITES -gt 0 ]; then
  PASS_RATE=$((PASSED_COUNT * 100 / TOTAL_SUITES))
  echo ""
  echo -e "📊 Overall Pass Rate: ${PASS_RATE}%"
  
  if [ $PASS_RATE -eq 100 ]; then
    echo ""
    echo -e "${GREEN}🎉 CONGRATULATIONS! 100% TEST PASS RATE ACHIEVED!${NC}"
  elif [ $PASS_RATE -ge 90 ]; then
    echo ""
    echo -e "${GREEN}✨ Excellent! Almost there - ${PASS_RATE}% pass rate${NC}"
  elif [ $PASS_RATE -ge 80 ]; then
    echo ""
    echo -e "${YELLOW}📈 Good progress - ${PASS_RATE}% pass rate${NC}"
  else
    echo ""
    echo -e "${RED}⚠️  More work needed - ${PASS_RATE}% pass rate${NC}"
  fi
fi

echo ""
echo "=============================================="