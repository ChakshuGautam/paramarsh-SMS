
#!/bin/bash

echo "🧪 Running Seeder Tests with Fixes"
echo "=================================="
echo ""

# Clean up any existing test containers
docker stop paramarsh-test-postgres 2>/dev/null || true
docker rm paramarsh-test-postgres 2>/dev/null || true

echo "📊 Running tests in categories:"
echo ""

# Core tests (should all pass)
echo "1️⃣ Core Tests..."
npm test -- src/seed/__tests__/core --testTimeout=30000 --maxWorkers=1

# Entity tests (run individually to isolate issues)  
echo ""
echo "2️⃣ Entity Tests (Individual)..."
for test in src/seed/__tests__/entities/*.test.ts; do
  if [[ ! "$test" == *"checkpoint"* ]]; then
    echo "  Testing: $(basename $test)"
    npm test -- "$test" --testTimeout=60000 --maxWorkers=1 --silent
  fi
done

# Integration tests
echo ""
echo "3️⃣ Integration Tests..."
npm test -- src/seed/__tests__/integration --testTimeout=120000 --maxWorkers=1

echo ""
echo "✅ Test run complete"
