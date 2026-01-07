#!/bin/bash

# Quick seeder test runner - runs tests in parallel for speed
set -e

echo "Quick Seeder Test Summary"
echo "========================="
echo ""

# Track results
TOTAL=0
PASSED=0
FAILED=0
TIMEOUT=0

# Run all tests in parallel with short timeout
for test in src/seed/__tests__/**/*.test.ts; do
    if [ -f "$test" ]; then
        testname=$(basename "$test")
        TOTAL=$((TOTAL + 1))
        
        # Run test with very short timeout
        if timeout 5 npm test -- "$test" --testTimeout=3000 --maxWorkers=1 > /dev/null 2>&1; then
            echo "✅ $testname"
            PASSED=$((PASSED + 1))
        else
            exit_code=$?
            if [ $exit_code -eq 124 ]; then
                echo "⏱️  $testname (timeout)"
                TIMEOUT=$((TIMEOUT + 1))
            else
                echo "❌ $testname" 
                FAILED=$((FAILED + 1))
            fi
        fi
    fi
done

echo ""
echo "Summary:"
echo "========"
echo "Total:   $TOTAL files"
echo "Passed:  $PASSED files"
echo "Failed:  $FAILED files"  
echo "Timeout: $TIMEOUT files"

SUCCESS_RATE=0
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
fi
echo "Success Rate: ${SUCCESS_RATE}%"