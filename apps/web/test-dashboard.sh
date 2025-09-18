#!/bin/bash

# Dashboard Data Accuracy E2E Test Runner
# This script runs the comprehensive dashboard validation tests

set -e

echo "🎯 Dashboard Data Accuracy E2E Tests"
echo "=====================================\n"

# Check if required ports are available
echo "📡 Checking server availability..."

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ $service is running on port $port"
        return 0
    else
        echo "❌ $service is NOT running on port $port"
        return 1
    fi
}

# Check backend API
if ! check_port 3005 "Backend API"; then
    echo "💡 Start backend with: cd apps/api && bun run start:dev"
    echo "💡 Or start with: cd apps/api && bun run dev"
    echo ""
fi

# Check frontend
if ! check_port 3001 "Frontend"; then
    echo "💡 Start frontend with: cd apps/web && bun run dev"
    echo ""
fi

# Pause to let user start services if needed
read -p "Press Enter to continue with tests (make sure services are running)..."

echo ""
echo "🧪 Running Dashboard Data Accuracy Tests..."
echo "==========================================="

# Run the specific dashboard test
npx playwright test test/e2e/dashboard-data-accuracy.spec.ts \
    --reporter=list \
    --project=chromium \
    --max-failures=1

echo ""
echo "📊 Test Results Summary:"
echo "========================"

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All dashboard data accuracy tests PASSED!"
    echo ""
    echo "🎉 Key Validations Confirmed:"
    echo "  • Student count: exactly 1425 for dps-main (not 2026)"
    echo "  • Teacher counts: consistent across all API calls"
    echo "  • Attendance rates: within 0-100% range (no more 175% bug)"
    echo "  • Fee collection: data consistency verified"
    echo "  • Multi-branch: proper data isolation working"
    echo "  • Date filtering: API calls triggered correctly"
    echo "  • X-Branch-Id: header compliance verified"
    echo "  • Performance: dashboard loads within acceptable limits"
    echo ""
    echo "🚀 Backend fixes are working correctly in end-to-end flow!"
else
    echo "❌ Some dashboard tests FAILED!"
    echo ""
    echo "🔍 Common Issues to Check:"
    echo "  • Backend API running on localhost:3005?"
    echo "  • Frontend running on localhost:3001?"
    echo "  • Database seeded with test data?"
    echo "  • Recent backend fixes deployed?"
    echo ""
    echo "📋 Debug Steps:"
    echo "  1. Run: cd apps/api && npx prisma db seed"
    echo "  2. Check API: curl -H 'X-Branch-Id: dps-main' http://localhost:3005/api/v1/students"
    echo "  3. View detailed report: npx playwright show-report"
fi

echo ""
echo "📖 For detailed test report: npx playwright show-report"
echo "🐛 For debugging: bun run e2e:ui (interactive mode)"
echo "🔧 For headed mode: bun run e2e:headed (visible browser)"