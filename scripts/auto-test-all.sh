#!/bin/bash

# Master automation script for test-writer agent
# This script handles everything automatically without human intervention

set -e

SCRIPT_DIR="$(dirname "$0")"
API_DIR="$SCRIPT_DIR/../apps/api"
LOG_FILE="$SCRIPT_DIR/auto-test.log"

echo "🤖 Automated Test Suite - Paramarsh SMS"
echo "========================================"
echo "Starting at: $(date)" | tee "$LOG_FILE"

# Step 1: Setup environment
echo "🔧 Setting up environment..." | tee -a "$LOG_FILE"

# Ensure we're using port 8080
cd "$API_DIR"
if ! grep -q "PORT=8080" package.json; then
    echo "⚠️ Updating package.json to use port 8080..." | tee -a "$LOG_FILE"
    sed -i.bak 's/"start:dev": "nest start --watch"/"start:dev": "PORT=8080 nest start --watch"/g' package.json
    rm -f package.json.bak
fi

# Step 2: Database setup
echo "🗄️ Setting up database..." | tee -a "$LOG_FILE"
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init --skip-seed
npx prisma db seed

# Step 3: Kill any existing backend
echo "🛑 Stopping any existing backend..." | tee -a "$LOG_FILE"
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
sleep 2

# Step 4: Start backend
echo "🚀 Starting backend on port 8080..." | tee -a "$LOG_FILE"
nohup bun run start:dev > "$API_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID" | tee -a "$LOG_FILE"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..." | tee -a "$LOG_FILE"
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:8080/api/v1/students -H "X-Branch-Id: branch1" | grep -q "data"; then
        echo "✅ Backend is ready!" | tee -a "$LOG_FILE"
        break
    fi
    sleep 1
    WAITED=$((WAITED + 1))
    echo -n "."
done
echo ""

if [ $WAITED -eq $MAX_WAIT ]; then
    echo "❌ Backend failed to start after ${MAX_WAIT} seconds" | tee -a "$LOG_FILE"
    cat "$API_DIR/backend.log"
    exit 1
fi

# Step 5: Get all entities
echo "🔍 Finding all entities..." | tee -a "$LOG_FILE"
ENTITIES=$(ls -d "$API_DIR/src"/*/ 2>/dev/null | xargs -n 1 basename | grep -v -E "^(common|prisma|config|app\.module|main)$" | sort)
ENTITY_COUNT=$(echo "$ENTITIES" | wc -l | tr -d ' ')

echo "Found $ENTITY_COUNT entities:" | tee -a "$LOG_FILE"
echo "$ENTITIES" | tee -a "$LOG_FILE"

# Step 6: Create/fix test files for each entity
echo "" | tee -a "$LOG_FILE"
echo "📝 Creating/fixing test files..." | tee -a "$LOG_FILE"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_ENTITIES=""

for ENTITY in $ENTITIES; do
    echo "" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "Testing: $ENTITY" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    
    TEST_FILE="$API_DIR/test/${ENTITY}.e2e-spec.ts"
    
    # Check if test file exists
    if [ ! -f "$TEST_FILE" ]; then
        echo "⚠️ No test file found for $ENTITY, skipping..." | tee -a "$LOG_FILE"
        continue
    fi
    
    # Fix common issues in test file
    echo "🔧 Fixing common issues in $ENTITY test..." | tee -a "$LOG_FILE"
    
    # Fix import statements
    sed -i.bak "s/import \* as request from 'supertest'/import request from 'supertest'/g" "$TEST_FILE" 2>/dev/null || true
    sed -i.bak "s/import { request } from 'supertest'/import request from 'supertest'/g" "$TEST_FILE" 2>/dev/null || true
    
    # Fix field names
    sed -i.bak "s/schoolId/branchId/g" "$TEST_FILE" 2>/dev/null || true
    
    # Clean up backup files
    rm -f "${TEST_FILE}.bak"
    
    # Run the test
    echo "🧪 Running test for $ENTITY..." | tee -a "$LOG_FILE"
    cd "$API_DIR"
    
    if bun run test:e2e --testPathPattern="$ENTITY" 2>&1 | tee -a "$LOG_FILE"; then
        echo "✅ PASSED: $ENTITY" | tee -a "$LOG_FILE"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "❌ FAILED: $ENTITY" | tee -a "$LOG_FILE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILED_ENTITIES="$FAILED_ENTITIES $ENTITY"
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# Step 7: Final report
echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "📊 FINAL REPORT" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Total Entities Tested: $TOTAL_TESTS" | tee -a "$LOG_FILE"
echo "✅ Passed: $PASSED_TESTS" | tee -a "$LOG_FILE"
echo "❌ Failed: $FAILED_TESTS" | tee -a "$LOG_FILE"

if [ $FAILED_TESTS -gt 0 ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "Failed entities: $FAILED_ENTITIES" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "⚠️ Some tests failed. Check the log file: $LOG_FILE" | tee -a "$LOG_FILE"
else
    echo "" | tee -a "$LOG_FILE"
    echo "🎉 All tests passed successfully!" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "Completed at: $(date)" | tee -a "$LOG_FILE"
echo "Full log available at: $LOG_FILE"

# Keep backend running for further testing
echo ""
echo "ℹ️ Backend is still running on port 8080 (PID: $BACKEND_PID)"
echo "To stop it, run: kill $BACKEND_PID"

exit $FAILED_TESTS