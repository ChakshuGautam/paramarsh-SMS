#!/bin/bash

# API Validation Script
# This script validates that a new API implementation follows all requirements

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -eq 0 ]; then
    echo "Usage: ./scripts/validate-api.sh <resource-name>"
    echo "Example: ./scripts/validate-api.sh teachers"
    exit 1
fi

RESOURCE=$1
RESOURCE_LOWER=$(echo "$RESOURCE" | tr '[:upper:]' '[:lower:]')
RESOURCE_CAPITAL=$(echo "$RESOURCE" | sed 's/^./\U&/')

echo "🔍 Validating API implementation for: $RESOURCE"
echo "================================================"

ERRORS=0
WARNINGS=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        echo "  Missing: $1"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if pattern exists in file
check_pattern() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $3"
        echo "  Pattern not found: $2"
        ((WARNINGS++))
        return 1
    fi
}

echo ""
echo "1️⃣ Backend API Files"
echo "-------------------"

# Try to find the module files in different possible locations
MODULE_PATH=""
CONTROLLER_PATH=""
SERVICE_PATH=""

# Check common patterns for module locations
if [ -f "apps/api/src/${RESOURCE_LOWER}/${RESOURCE_LOWER}.module.ts" ]; then
    MODULE_PATH="apps/api/src/${RESOURCE_LOWER}/${RESOURCE_LOWER}.module.ts"
elif [ -f "apps/api/src/modules/${RESOURCE_LOWER}/${RESOURCE_LOWER}.module.ts" ]; then
    MODULE_PATH="apps/api/src/modules/${RESOURCE_LOWER}/${RESOURCE_LOWER}.module.ts"
fi

# Check common patterns for controller locations
if [ -f "apps/api/src/${RESOURCE_LOWER}/${RESOURCE_LOWER}.controller.ts" ]; then
    CONTROLLER_PATH="apps/api/src/${RESOURCE_LOWER}/${RESOURCE_LOWER}.controller.ts"
elif [ -f "apps/api/src/modules/${RESOURCE_LOWER}/${RESOURCE_LOWER}.controller.ts" ]; then
    CONTROLLER_PATH="apps/api/src/modules/${RESOURCE_LOWER}/${RESOURCE_LOWER}.controller.ts"
fi

# Check common patterns for service locations
if [ -f "apps/api/src/${RESOURCE_LOWER}/${RESOURCE_LOWER}.service.ts" ]; then
    SERVICE_PATH="apps/api/src/${RESOURCE_LOWER}/${RESOURCE_LOWER}.service.ts"
elif [ -f "apps/api/src/modules/${RESOURCE_LOWER}/${RESOURCE_LOWER}.service.ts" ]; then
    SERVICE_PATH="apps/api/src/modules/${RESOURCE_LOWER}/${RESOURCE_LOWER}.service.ts"
fi

check_file "$MODULE_PATH" "Module file exists"
check_file "$CONTROLLER_PATH" "Controller file exists"
check_file "$SERVICE_PATH" "Service file exists"

echo ""
echo "2️⃣ API Endpoints"
echo "---------------"
if [ -n "$CONTROLLER_PATH" ] && [ -f "$CONTROLLER_PATH" ]; then
    # Check if controller extends BaseCrudController or implements endpoints directly
    if grep -q "extends BaseCrudController" "$CONTROLLER_PATH" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Controller extends BaseCrudController (provides all CRUD endpoints)"
        echo -e "${GREEN}✓${NC} GET list endpoint (inherited)"
        echo -e "${GREEN}✓${NC} GET by ID endpoint (inherited)"
        echo -e "${GREEN}✓${NC} POST create endpoint (inherited)"
        echo -e "${GREEN}✓${NC} PUT update endpoint (inherited)"
        echo -e "${GREEN}✓${NC} PATCH update endpoint (inherited)"
        echo -e "${GREEN}✓${NC} DELETE endpoint (inherited)"
        echo -e "${GREEN}✓${NC} Response wrapped in data object (inherited)"
    else
        # Traditional approach - check for explicit decorators
        check_pattern "$CONTROLLER_PATH" "@Get()" "GET list endpoint"
        check_pattern "$CONTROLLER_PATH" "@Get(':id')" "GET by ID endpoint"
        check_pattern "$CONTROLLER_PATH" "@Post()" "POST create endpoint"
        check_pattern "$CONTROLLER_PATH" "@Put(':id')\|@Patch(':id')" "PUT/PATCH update endpoint"
        check_pattern "$CONTROLLER_PATH" "@Delete(':id')" "DELETE endpoint"
        check_pattern "$CONTROLLER_PATH" "{ data:\|return.*data" "Response wrapped in data object"
    fi
fi

echo ""
echo "3️⃣ Multi-tenancy"
echo "---------------"
if [ -n "$SERVICE_PATH" ] && [ -f "$SERVICE_PATH" ]; then
    check_pattern "$SERVICE_PATH" "branchId" "Multi-tenancy with branchId"
    check_pattern "$SERVICE_PATH" "BaseCrudService" "Extends BaseCrudService"
fi

echo ""
echo "4️⃣ E2E Tests"
echo "-----------"
check_file "apps/api/test/${RESOURCE_LOWER}.e2e-spec.ts" "E2E test file exists"
if [ -f "apps/api/test/${RESOURCE_LOWER}.e2e-spec.ts" ]; then
    check_pattern "apps/api/test/${RESOURCE_LOWER}.e2e-spec.ts" "page=1&pageSize=" "Pagination test"
    check_pattern "apps/api/test/${RESOURCE_LOWER}.e2e-spec.ts" "sort=" "Sorting test"
    check_pattern "apps/api/test/${RESOURCE_LOWER}.e2e-spec.ts" "X-Branch-Id" "Multi-tenant test"
    check_pattern "apps/api/test/${RESOURCE_LOWER}.e2e-spec.ts" "expect.*data" "Data validation"
    check_pattern "apps/api/test/${RESOURCE_LOWER}.e2e-spec.ts" "expect.*total" "Total count validation"
fi

echo ""
echo "5️⃣ Seed Data"
echo "-----------"
if grep -q "$RESOURCE_LOWER" "apps/api/prisma/seed.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Seed data found in seed.ts"
else
    echo -e "${RED}✗${NC} No seed data found for $RESOURCE_LOWER"
    ((ERRORS++))
fi

echo ""
echo "6️⃣ Frontend Integration"
echo "----------------------"
check_file "apps/web/app/admin/resources/${RESOURCE_LOWER}/index.tsx" "Frontend resource folder exists"
check_file "apps/web/app/admin/resources/${RESOURCE_LOWER}/List.tsx" "List component exists"
check_file "apps/web/app/admin/resources/${RESOURCE_LOWER}/Create.tsx" "Create component exists"
check_file "apps/web/app/admin/resources/${RESOURCE_LOWER}/Edit.tsx" "Edit component exists"

if grep -q "name: '${RESOURCE_LOWER}'" "apps/web/app/admin/AdminApp.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Resource registered in AdminApp.tsx"
else
    echo -e "${RED}✗${NC} Resource not registered in AdminApp.tsx"
    ((ERRORS++))
fi

echo ""
echo "7️⃣ Running Tests"
echo "---------------"
cd apps/api
if bun run test:e2e --testNamePattern="${RESOURCE_CAPITAL}" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} E2E tests pass"
else
    echo -e "${RED}✗${NC} E2E tests fail or not found"
    ((ERRORS++))
fi
cd ../..

echo ""
echo "================================================"
echo "VALIDATION SUMMARY"
echo "================================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! API implementation is complete.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Implementation complete with $WARNINGS warnings.${NC}"
    exit 0
else
    echo -e "${RED}❌ Implementation incomplete: $ERRORS errors, $WARNINGS warnings${NC}"
    echo ""
    echo "Please complete all required steps:"
    echo "1. Implement all 6 CRUD endpoints with proper response format"
    echo "2. Add comprehensive E2E tests"
    echo "3. Update seed data"
    echo "4. Create frontend components"
    echo "5. Register resource in AdminApp.tsx"
    exit 1
fi