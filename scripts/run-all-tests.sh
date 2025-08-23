#!/bin/bash

# Script to run all E2E tests systematically
# Ensures backend is running and captures all test results

set -e

SCRIPT_DIR="$(dirname "$0")"
API_DIR="$SCRIPT_DIR/../apps/api"
RESULTS_FILE="$SCRIPT_DIR/test-results.txt"

echo "🧪 Paramarsh SMS - Complete E2E Test Suite"
echo "=========================================="

# Step 1: Ensure backend is running
echo "📡 Checking backend status..."
if ! curl -s http://localhost:8080/api/v1/students > /dev/null 2>&1; then
    echo "🚀 Starting backend..."
    "$SCRIPT_DIR/start-backend.sh"
else
    echo "✅ Backend already running on port 8080"
fi

# Step 2: Ensure database is seeded
echo "🌱 Ensuring database is seeded..."
cd "$API_DIR"
npx prisma db seed || echo "⚠️ Seed might already be applied"

# Step 3: Get list of all test files
echo "📋 Finding all test files..."
TEST_FILES=$(find "$API_DIR/test" -name "*.e2e-spec.ts" -type f | sort)
TOTAL_FILES=$(echo "$TEST_FILES" | wc -l | tr -d ' ')

echo "Found $TOTAL_FILES test files"
echo ""

# Initialize results
PASSED=0
FAILED=0
FAILED_TESTS=""

# Clear results file
> "$RESULTS_FILE"

# Step 4: Run each test file
for TEST_FILE in $TEST_FILES; do
    TEST_NAME=$(basename "$TEST_FILE" .e2e-spec.ts)
    echo "🔄 Testing: $TEST_NAME"
    echo "----------------------------------------" | tee -a "$RESULTS_FILE"
    echo "Testing: $TEST_NAME" | tee -a "$RESULTS_FILE"
    
    # Run the test and capture output
    if cd "$API_DIR" && bun run test:e2e --testPathPattern="$TEST_NAME" 2>&1 | tee -a "$RESULTS_FILE"; then
        echo "✅ PASSED: $TEST_NAME" | tee -a "$RESULTS_FILE"
        PASSED=$((PASSED + 1))
    else
        echo "❌ FAILED: $TEST_NAME" | tee -a "$RESULTS_FILE"
        FAILED=$((FAILED + 1))
        FAILED_TESTS="$FAILED_TESTS\n  - $TEST_NAME"
    fi
    echo "" | tee -a "$RESULTS_FILE"
done

# Step 5: Summary Report
echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="
echo "Total Test Files: $TOTAL_FILES"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "Failed Tests:"
    echo -e "$FAILED_TESTS"
    echo ""
    echo "⚠️ Some tests failed. Check $RESULTS_FILE for details."
    exit 1
else
    echo ""
    echo "🎉 All tests passed successfully!"
fi

echo ""
echo "Full results saved to: $RESULTS_FILE"