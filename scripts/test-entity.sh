#!/bin/bash

# Script to test a specific entity
# Usage: ./test-entity.sh [entity-name]

if [ $# -eq 0 ]; then
    echo "Usage: $0 <entity-name>"
    echo "Example: $0 students"
    exit 1
fi

ENTITY=$1
SCRIPT_DIR="$(dirname "$0")"
API_DIR="$SCRIPT_DIR/../apps/api"

echo "🧪 Testing entity: $ENTITY"
echo "================================"

# Ensure backend is running
if ! curl -s http://localhost:8080/api/v1/$ENTITY > /dev/null 2>&1; then
    echo "🚀 Starting backend..."
    "$SCRIPT_DIR/start-backend.sh"
fi

# Run the specific test
cd "$API_DIR"
echo "Running E2E tests for $ENTITY..."
bun run test:e2e --testPathPattern="$ENTITY"

TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "✅ All tests passed for $ENTITY"
else
    echo ""
    echo "❌ Some tests failed for $ENTITY"
    exit 1
fi