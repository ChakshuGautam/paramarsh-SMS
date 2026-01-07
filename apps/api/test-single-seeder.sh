#!/bin/bash

# Test a single seeder file
TEST_FILE="${1:-src/seed/__tests__/entities/AcademicYearSeeder.test.ts}"

echo "🧪 Testing: $(basename $TEST_FILE)"
echo "================================"

# Run with proper configuration
npm test -- "$TEST_FILE" \
  --testTimeout=30000 \
  --maxWorkers=1 \
  --bail \
  --verbose=false \
  --detectOpenHandles=false

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "✅ Test passed"
else
  echo "❌ Test failed with exit code: $exit_code"
fi

exit $exit_code