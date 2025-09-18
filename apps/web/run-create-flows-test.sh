#!/bin/bash

# Create Flows E2E Test Runner
# This script runs the comprehensive create flows test for all entities

echo "🚀 Starting Comprehensive Create Flows E2E Tests..."
echo "📋 This will test creation of ALL 19 entities in the Paramarsh SMS system"
echo ""

# Check if servers are running
echo "🔍 Checking server status..."

# Check frontend server
if curl -s http://localhost:3001 >/dev/null; then
    echo "✅ Frontend server (port 3001) is running"
else
    echo "❌ Frontend server (port 3001) is NOT running"
    echo "Please start the frontend server: npm run dev"
    exit 1
fi

# Check backend server
if curl -s http://localhost:3005 >/dev/null 2>&1; then
    echo "✅ Backend server (port 3005) is running"
else
    echo "❌ Backend server (port 3005) is NOT running"
    echo "Please start the backend server"
    exit 1
fi

echo ""
echo "🎯 Running create flows tests..."
echo "📸 Screenshots will be saved to test-results/screenshots/"
echo "📊 Test reports will be generated in playwright-report/"
echo ""

# Run the specific test file
npx playwright test test/e2e/create-flows/test-all-create-flows.spec.ts \
    --project=chromium \
    --reporter=html \
    --trace=on \
    --screenshot=on \
    --video=on

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 All create flows tests completed successfully!"
    echo "📊 View detailed report: npx playwright show-report"
else
    echo ""
    echo "⚠️ Some tests failed. Check the report for details."
    echo "📊 View detailed report: npx playwright show-report"
fi

echo ""
echo "📁 Generated files:"
echo "  - Screenshots: test-results/screenshots/"
echo "  - Videos: test-results/videos/"
echo "  - Traces: test-results/traces/"
echo "  - HTML Report: playwright-report/"