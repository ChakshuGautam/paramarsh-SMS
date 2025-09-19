#!/bin/bash

echo "🧪 Quick Test Status Check"
echo "========================="
echo ""

# Test core modules
echo "📊 Testing Core Module..."
npm test -- src/seed/__tests__/core --testTimeout=30000 --maxWorkers=1 2>&1 | grep -E "(PASS|FAIL|Tests:)" | tail -1
echo ""

# Test priority entity seeders
echo "📊 Testing Priority Seeders..."
PRIORITY_TESTS=(
    "AcademicYearSeeder.test.ts"
    "ClassSeeder.test.ts"
    "StudentSeeder.test.ts"
    "InvoiceSeeder.test.ts"
    "PaymentSeeder.test.ts"
    "ClassSubjectTeacherSeeder.test.ts"
    "AttendanceSessionSeeder.test.ts"
)

for test_name in "${PRIORITY_TESTS[@]}"; do
    test_file="src/seed/__tests__/entities/$test_name"
    if [ -f "$test_file" ]; then
        echo -n "  $test_name: "
        result=$(npm test -- "$test_file" --testTimeout=30000 --maxWorkers=1 2>&1 | grep -E "Tests:" | tail -1)
        if [[ $result == *"failed"* ]]; then
            echo "❌ $result"
        else
            echo "✅ $result"
        fi
    fi
done

echo ""
echo "========================="
echo "📈 Summary complete"