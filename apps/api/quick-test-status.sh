#!/bin/bash

echo "🧪 Quick Seed Test Status Report"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test Core
echo "📦 Core Module Tests:"
CORE_RESULT=$(npm test -- "src/seed/__tests__/core" --testTimeout=10000 --maxWorkers=1 --silent 2>&1 | grep -E "Tests:" | tail -1)
if [[ $CORE_RESULT == *"failed"* ]]; then
  echo -e "  ${RED}$CORE_RESULT${NC}"
else
  echo -e "  ${GREEN}$CORE_RESULT${NC}"
fi

echo ""
echo "📋 Entity Seeder Tests:"

# Test each entity
ENTITIES=(
  "AcademicYearSeeder"
  "TenantSeeder"
  "SubjectSeeder"
  "ClassSeeder"
  "TeacherSeeder"
  "StudentSeeder"
  "FeeStructureSeeder"
  "InvoiceSeeder"
  "PaymentSeeder"
)

PASSED_COUNT=0
FAILED_COUNT=0
TOTAL_TESTS_PASSED=0
TOTAL_TESTS_FAILED=0

for entity in "${ENTITIES[@]}"; do
  if [ -f "src/seed/__tests__/entities/${entity}.test.ts" ]; then
    printf "  %-30s" "${entity}:"
    RESULT=$(npm test -- "src/seed/__tests__/entities/${entity}.test.ts" --testTimeout=10000 --maxWorkers=1 --silent 2>&1 | grep -E "Tests:" | tail -1)
    
    if [[ -z "$RESULT" ]]; then
      echo -e "${YELLOW}No tests or file not found${NC}"
    elif [[ $RESULT == *"failed"* ]]; then
      echo -e "${RED}$RESULT${NC}"
      ((FAILED_COUNT++))
      # Extract numbers
      FAILED_NUM=$(echo $RESULT | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' | head -1)
      PASSED_NUM=$(echo $RESULT | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' | head -1)
      TOTAL_TESTS_FAILED=$((TOTAL_TESTS_FAILED + ${FAILED_NUM:-0}))
      TOTAL_TESTS_PASSED=$((TOTAL_TESTS_PASSED + ${PASSED_NUM:-0}))
    elif [[ $RESULT == *"passed"* ]]; then
      echo -e "${GREEN}$RESULT${NC}"
      ((PASSED_COUNT++))
      # Extract numbers
      PASSED_NUM=$(echo $RESULT | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' | head -1)
      TOTAL_TESTS_PASSED=$((TOTAL_TESTS_PASSED + ${PASSED_NUM:-0}))
    else
      echo -e "${YELLOW}$RESULT${NC}"
    fi
  fi
done

echo ""
echo "================================"
echo "📊 SUMMARY"
echo "================================"
echo ""
echo -e "✅ Passing test suites: ${GREEN}$PASSED_COUNT${NC}"
echo -e "❌ Failing test suites: ${RED}$FAILED_COUNT${NC}"
echo ""
echo -e "✅ Total tests passing: ${GREEN}$TOTAL_TESTS_PASSED${NC}"
echo -e "❌ Total tests failing: ${RED}$TOTAL_TESTS_FAILED${NC}"

TOTAL_SUITES=$((PASSED_COUNT + FAILED_COUNT))
if [ $TOTAL_SUITES -gt 0 ]; then
  PASS_RATE=$((PASSED_COUNT * 100 / TOTAL_SUITES))
  echo ""
  echo -e "📈 Suite Pass Rate: ${PASS_RATE}%"
  
  TOTAL_TESTS=$((TOTAL_TESTS_PASSED + TOTAL_TESTS_FAILED))
  if [ $TOTAL_TESTS -gt 0 ]; then
    TEST_PASS_RATE=$((TOTAL_TESTS_PASSED * 100 / TOTAL_TESTS))
    echo -e "📈 Test Pass Rate: ${TEST_PASS_RATE}%"
  fi
  
  if [ $PASS_RATE -eq 100 ]; then
    echo ""
    echo -e "${GREEN}🎉 CONGRATULATIONS! 100% SUITE PASS RATE ACHIEVED!${NC}"
  fi
fi
