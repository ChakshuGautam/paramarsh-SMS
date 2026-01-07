#!/bin/bash

# Seeder Tests CI Script
# This script runs all seeder tests and provides a comprehensive report
# Can be used both locally and in GitHub Actions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_TIMEOUT=10000
MAX_WORKERS=2
TEST_DIR="src/seed/__tests__"

# Results tracking
TOTAL_FILES=0
PASSED_FILES=0
FAILED_FILES=0
TIMEOUT_FILES=0
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Arrays to track results
declare -a FAILED_FILE_LIST
declare -a TIMEOUT_FILE_LIST
declare -a PASSED_FILE_LIST

echo "=========================================="
echo "   Seeder Tests CI Runner"
echo "=========================================="
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Test Directory: $TEST_DIR"
echo "  Test Timeout: ${TEST_TIMEOUT}ms"
echo "  Max Workers: $MAX_WORKERS"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run from the api directory.${NC}"
    exit 1
fi

# Create results directory
RESULTS_DIR="test-results"
mkdir -p $RESULTS_DIR
REPORT_FILE="$RESULTS_DIR/seeder-test-report.txt"
JSON_REPORT="$RESULTS_DIR/seeder-test-report.json"

# Start JSON report
echo "{" > $JSON_REPORT
echo '  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",' >> $JSON_REPORT
echo '  "tests": [' >> $JSON_REPORT

echo "Running seeder tests..." | tee $REPORT_FILE
echo "========================" | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE

# Function to run a single test file
run_test_file() {
    local test_file=$1
    local test_name=$(basename "$test_file")
    
    echo -n "Testing $test_name... "
    
    # Run the test with timeout
    if timeout 30 npm test -- "$test_file" --testTimeout=$TEST_TIMEOUT --maxWorkers=$MAX_WORKERS --json --outputFile="$RESULTS_DIR/${test_name}.json" > "$RESULTS_DIR/${test_name}.log" 2>&1; then
        # Extract test results
        local results=$(grep -E "Tests:" "$RESULTS_DIR/${test_name}.log" 2>/dev/null || echo "")
        
        if [ -n "$results" ]; then
            # Parse results
            local failed=$(echo "$results" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")
            local passed=$(echo "$results" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
            local total=$(echo "$results" | grep -oE "[0-9]+ total" | grep -oE "[0-9]+" || echo "0")
            
            TOTAL_TESTS=$((TOTAL_TESTS + total))
            PASSED_TESTS=$((PASSED_TESTS + passed))
            FAILED_TESTS=$((FAILED_TESTS + failed))
            
            if [ "$failed" = "0" ]; then
                echo -e "${GREEN}✓ PASSED${NC} ($passed/$total tests)"
                PASSED_FILES=$((PASSED_FILES + 1))
                PASSED_FILE_LIST+=("$test_name")
                echo "  ✓ $test_name: PASSED ($passed/$total tests)" >> $REPORT_FILE
            else
                echo -e "${RED}✗ FAILED${NC} ($failed failed, $passed passed of $total tests)"
                FAILED_FILES=$((FAILED_FILES + 1))
                FAILED_FILE_LIST+=("$test_name: $failed tests failed")
                echo "  ✗ $test_name: FAILED ($failed failed, $passed passed of $total tests)" >> $REPORT_FILE
            fi
            
            # Add to JSON report
            if [ $TOTAL_FILES -gt 0 ]; then
                echo "," >> $JSON_REPORT
            fi
            echo -n '    {"file": "'$test_name'", "status": "'$([ "$failed" = "0" ] && echo "passed" || echo "failed")'", "passed": '$passed', "failed": '$failed', "total": '$total'}' >> $JSON_REPORT
        else
            echo -e "${YELLOW}⚠ NO RESULTS${NC}"
            TIMEOUT_FILES=$((TIMEOUT_FILES + 1))
            TIMEOUT_FILE_LIST+=("$test_name")
            echo "  ⚠ $test_name: NO RESULTS (possible timeout or error)" >> $REPORT_FILE
        fi
    else
        echo -e "${YELLOW}⚠ TIMEOUT/ERROR${NC}"
        TIMEOUT_FILES=$((TIMEOUT_FILES + 1))
        TIMEOUT_FILE_LIST+=("$test_name")
        echo "  ⚠ $test_name: TIMEOUT/ERROR" >> $REPORT_FILE
    fi
    
    TOTAL_FILES=$((TOTAL_FILES + 1))
}

# Find and run all test files
echo "Discovering test files..." | tee -a $REPORT_FILE
TEST_FILES=$(find $TEST_DIR -name "*.test.ts" -o -name "*.spec.ts" | sort)
DISCOVERED_COUNT=$(echo "$TEST_FILES" | wc -l | tr -d ' ')

echo "Found $DISCOVERED_COUNT test files" | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE

# Run tests for each category
echo -e "\n${BLUE}=== Core Tests ===${NC}"
echo "=== Core Tests ===" >> $REPORT_FILE
for test_file in $(echo "$TEST_FILES" | grep "/core/"); do
    run_test_file "$test_file"
done

echo -e "\n${BLUE}=== Entity Tests ===${NC}"
echo -e "\n=== Entity Tests ===" >> $REPORT_FILE
for test_file in $(echo "$TEST_FILES" | grep "/entities/"); do
    run_test_file "$test_file"
done

echo -e "\n${BLUE}=== CLI Tests ===${NC}"
echo -e "\n=== CLI Tests ===" >> $REPORT_FILE
for test_file in $(echo "$TEST_FILES" | grep "/cli/"); do
    run_test_file "$test_file"
done

echo -e "\n${BLUE}=== Other Tests ===${NC}"
echo -e "\n=== Other Tests ===" >> $REPORT_FILE
for test_file in $(echo "$TEST_FILES" | grep -v "/core/" | grep -v "/entities/" | grep -v "/cli/"); do
    run_test_file "$test_file"
done

# Close JSON report
echo "" >> $JSON_REPORT
echo "  ]," >> $JSON_REPORT
echo '  "summary": {' >> $JSON_REPORT
echo '    "totalFiles": '$TOTAL_FILES',' >> $JSON_REPORT
echo '    "passedFiles": '$PASSED_FILES',' >> $JSON_REPORT
echo '    "failedFiles": '$FAILED_FILES',' >> $JSON_REPORT
echo '    "timeoutFiles": '$TIMEOUT_FILES',' >> $JSON_REPORT
echo '    "totalTests": '$TOTAL_TESTS',' >> $JSON_REPORT
echo '    "passedTests": '$PASSED_TESTS',' >> $JSON_REPORT
echo '    "failedTests": '$FAILED_TESTS >> $JSON_REPORT
echo "  }" >> $JSON_REPORT
echo "}" >> $JSON_REPORT

# Print summary
echo ""
echo "=========================================="
echo "           TEST SUMMARY"
echo "=========================================="
echo ""

# File-level summary
echo -e "${BLUE}File-Level Results:${NC}"
echo "  Total Files:    $TOTAL_FILES"
echo -e "  Passed Files:   ${GREEN}$PASSED_FILES${NC}"
echo -e "  Failed Files:   ${RED}$FAILED_FILES${NC}"
echo -e "  Timeout/Error:  ${YELLOW}$TIMEOUT_FILES${NC}"
echo ""

# Test-level summary
echo -e "${BLUE}Test-Level Results:${NC}"
echo "  Total Tests:    $TOTAL_TESTS"
echo -e "  Passed Tests:   ${GREEN}$PASSED_TESTS${NC}"
echo -e "  Failed Tests:   ${RED}$FAILED_TESTS${NC}"
echo ""

# Success rate
if [ $TOTAL_FILES -gt 0 ]; then
    FILE_SUCCESS_RATE=$(( PASSED_FILES * 100 / TOTAL_FILES ))
    echo -e "File Success Rate: ${FILE_SUCCESS_RATE}%"
fi

if [ $TOTAL_TESTS -gt 0 ]; then
    TEST_SUCCESS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    echo -e "Test Success Rate: ${TEST_SUCCESS_RATE}%"
fi

echo ""

# List failures if any
if [ ${#FAILED_FILE_LIST[@]} -gt 0 ]; then
    echo -e "${RED}Failed Files:${NC}"
    for failed in "${FAILED_FILE_LIST[@]}"; do
        echo "  - $failed"
    done
    echo ""
fi

if [ ${#TIMEOUT_FILE_LIST[@]} -gt 0 ]; then
    echo -e "${YELLOW}Timeout/Error Files:${NC}"
    for timeout in "${TIMEOUT_FILE_LIST[@]}"; do
        echo "  - $timeout"
    done
    echo ""
fi

# Save summary to report
echo "" >> $REPORT_FILE
echo "==========================================">> $REPORT_FILE
echo "           TEST SUMMARY" >> $REPORT_FILE
echo "==========================================">> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "File-Level Results:" >> $REPORT_FILE
echo "  Total Files:    $TOTAL_FILES" >> $REPORT_FILE
echo "  Passed Files:   $PASSED_FILES" >> $REPORT_FILE
echo "  Failed Files:   $FAILED_FILES" >> $REPORT_FILE
echo "  Timeout/Error:  $TIMEOUT_FILES" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Test-Level Results:" >> $REPORT_FILE
echo "  Total Tests:    $TOTAL_TESTS" >> $REPORT_FILE
echo "  Passed Tests:   $PASSED_TESTS" >> $REPORT_FILE
echo "  Failed Tests:   $FAILED_TESTS" >> $REPORT_FILE

echo ""
echo -e "${BLUE}Reports saved to:${NC}"
echo "  - Text Report: $REPORT_FILE"
echo "  - JSON Report: $JSON_REPORT"
echo ""

# Exit with appropriate code
if [ $FAILED_FILES -gt 0 ] || [ $TIMEOUT_FILES -gt 0 ]; then
    echo -e "${RED}❌ Tests FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All tests PASSED${NC}"
    exit 0
fi