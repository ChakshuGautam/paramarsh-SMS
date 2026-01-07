#!/bin/bash

# Run seeder tests by category and collect results

echo "Running Seeder Tests by Category"
echo "================================="
echo ""

# Initialize counters
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests and parse results
run_test_category() {
    local category=$1
    local path=$2
    
    echo "Testing $category..."
    
    # Run test and capture output
    output=$(npm test -- "$path" --testTimeout=5000 --maxWorkers=1 2>&1 | tail -20)
    
    # Extract test results
    if echo "$output" | grep -q "Test Suites:"; then
        suite_line=$(echo "$output" | grep "Test Suites:")
        test_line=$(echo "$output" | grep "Tests:")
        
        # Parse suite results
        if echo "$suite_line" | grep -q "passed"; then
            passed_suites=$(echo "$suite_line" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
            PASSED_SUITES=$((PASSED_SUITES + passed_suites))
        fi
        
        if echo "$suite_line" | grep -q "failed"; then
            failed_suites=$(echo "$suite_line" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+")
            FAILED_SUITES=$((FAILED_SUITES + failed_suites))
        fi
        
        total_suites=$(echo "$suite_line" | grep -oE "[0-9]+ total" | grep -oE "[0-9]+")
        TOTAL_SUITES=$((TOTAL_SUITES + total_suites))
        
        # Parse test results
        if echo "$test_line" | grep -q "passed"; then
            passed_tests=$(echo "$test_line" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
            PASSED_TESTS=$((PASSED_TESTS + passed_tests))
        fi
        
        if echo "$test_line" | grep -q "failed"; then
            failed_tests=$(echo "$test_line" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+")
            FAILED_TESTS=$((FAILED_TESTS + failed_tests))
        fi
        
        total_tests=$(echo "$test_line" | grep -oE "[0-9]+ total" | grep -oE "[0-9]+")
        TOTAL_TESTS=$((TOTAL_TESTS + total_tests))
        
        echo "  $category: $suite_line"
        echo "  $test_line"
    else
        echo "  $category: No results or timeout"
    fi
    echo ""
}

# Run tests by category
run_test_category "Core Tests" "src/seed/__tests__/core"
run_test_category "Entity Tests" "src/seed/__tests__/entities"
run_test_category "CLI Tests" "src/seed/__tests__/cli"
run_test_category "Integration Tests" "src/seed/__tests__/integration"
run_test_category "Other Tests" "src/seed/__tests__/*.test.ts"

# Print summary
echo "================================="
echo "         FINAL SUMMARY"
echo "================================="
echo ""
echo "Test Suites:"
echo "  Total:  $TOTAL_SUITES"
echo "  Passed: $PASSED_SUITES"
echo "  Failed: $FAILED_SUITES"
echo ""
echo "Individual Tests:"
echo "  Total:  $TOTAL_TESTS"
echo "  Passed: $PASSED_TESTS"
echo "  Failed: $FAILED_TESTS"
echo ""

# Calculate success rates
if [ $TOTAL_SUITES -gt 0 ]; then
    SUITE_SUCCESS_RATE=$((PASSED_SUITES * 100 / TOTAL_SUITES))
    echo "Suite Success Rate: ${SUITE_SUCCESS_RATE}%"
fi

if [ $TOTAL_TESTS -gt 0 ]; then
    TEST_SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Test Success Rate: ${TEST_SUCCESS_RATE}%"
fi