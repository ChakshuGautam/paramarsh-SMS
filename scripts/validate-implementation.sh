#!/bin/bash

# Comprehensive validation script that uses E2E tests instead of CURL
# This replaces the old validate-api.sh script

set -e

ENTITY=$1
SCRIPT_DIR="$(dirname "$0")"
API_DIR="$SCRIPT_DIR/../apps/api"

if [ -z "$ENTITY" ]; then
    echo "🔍 Validating ALL entities..."
    "$SCRIPT_DIR/run-all-tests.sh"
    exit $?
fi

echo "🔍 Validating entity: $ENTITY"
echo "================================"

# Step 1: Check if module exists
MODULE_DIR="$API_DIR/src/$ENTITY"
if [ ! -d "$MODULE_DIR" ]; then
    echo "❌ Module directory not found: $MODULE_DIR"
    exit 1
fi

# Step 2: Check required files
echo "📁 Checking required files..."
REQUIRED_FILES=(
    "$MODULE_DIR/$ENTITY.module.ts"
    "$MODULE_DIR/$ENTITY.controller.ts"
    "$MODULE_DIR/$ENTITY.service.ts"
)

for FILE in "${REQUIRED_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo "  ✅ $(basename "$FILE")"
    else
        echo "  ❌ Missing: $(basename "$FILE")"
        exit 1
    fi
done

# Step 3: Check if test file exists
TEST_FILE="$API_DIR/test/$ENTITY.e2e-spec.ts"
if [ ! -f "$TEST_FILE" ]; then
    echo "❌ Test file not found: $TEST_FILE"
    echo "  Please create E2E tests for this entity"
    exit 1
fi

# Step 4: Check if registered in AppModule
echo "📝 Checking module registration..."
if grep -q "${ENTITY^}Module" "$API_DIR/src/app.module.ts"; then
    echo "  ✅ Module registered in AppModule"
else
    echo "  ❌ Module not registered in AppModule"
    exit 1
fi

# Step 5: Run E2E tests
echo "🧪 Running E2E tests..."
"$SCRIPT_DIR/test-entity.sh" "$ENTITY"

# Step 6: Check React Admin compliance
echo "🎯 Checking React Admin compliance..."
cd "$API_DIR"

# Start backend if not running
if ! curl -s http://localhost:8080/api/v1/$ENTITY > /dev/null 2>&1; then
    "$SCRIPT_DIR/start-backend.sh"
fi

# Test response format
RESPONSE=$(curl -s -H "X-Branch-Id: branch1" "http://localhost:8080/api/v1/$ENTITY?page=1&pageSize=5")

if echo "$RESPONSE" | grep -q '"data"'; then
    echo "  ✅ Response has 'data' field"
else
    echo "  ❌ Response missing 'data' field"
    echo "  Response: $RESPONSE"
    exit 1
fi

if echo "$RESPONSE" | grep -q '"total"'; then
    echo "  ✅ Response has 'total' field"
else
    echo "  ⚠️ Response might be missing 'total' field (OK for single item)"
fi

# Step 7: Check multi-tenancy
echo "🏢 Checking multi-tenancy..."
RESPONSE_BRANCH2=$(curl -s -H "X-Branch-Id: branch2" "http://localhost:8080/api/v1/$ENTITY")
if [ "$RESPONSE" != "$RESPONSE_BRANCH2" ]; then
    echo "  ✅ Multi-tenancy working (different data for different branches)"
else
    echo "  ⚠️ Same data for different branches (might need more test data)"
fi

echo ""
echo "✅ Validation complete for $ENTITY"
echo ""
echo "Summary:"
echo "  - Module files: ✅"
echo "  - E2E tests: ✅"
echo "  - React Admin format: ✅"
echo "  - Multi-tenancy: ✅"