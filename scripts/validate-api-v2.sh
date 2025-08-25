#!/bin/bash

# Comprehensive API Validation Script v2
# This script validates ALL API implementations at once

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔍 Comprehensive API Validation for Paramarsh SMS"
echo "=================================================="

TOTAL_ERRORS=0
TOTAL_WARNINGS=0
TOTAL_ENTITIES=0
ENTITIES_PASSED=0
ENTITIES_FAILED=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        return 0
    else
        return 1
    fi
}

# Function to check if pattern exists in file
check_pattern() {
    if [ -f "$1" ] && grep -q "$2" "$1" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to validate a single entity
validate_entity() {
    local resource=$1
    local resource_lower=$(echo "$resource" | tr '[:upper:]' '[:lower:]')
    local resource_capital=$(echo "$resource" | sed 's/^./\U&/')
    
    echo ""
    echo -e "${BLUE}📋 Validating: $resource${NC}"
    echo "$(printf '%*s' ${#resource} '' | tr ' ' '-')----------"
    
    local entity_errors=0
    local entity_warnings=0
    
    # Find module files in different possible locations
    local module_path=""
    local controller_path=""
    local service_path=""
    
    # Check common patterns for module locations
    if [ -f "apps/api/src/${resource_lower}/${resource_lower}.module.ts" ]; then
        module_path="apps/api/src/${resource_lower}/${resource_lower}.module.ts"
    elif [ -f "apps/api/src/modules/${resource_lower}/${resource_lower}.module.ts" ]; then
        module_path="apps/api/src/modules/${resource_lower}/${resource_lower}.module.ts"
    fi
    
    # Check common patterns for controller locations
    if [ -f "apps/api/src/${resource_lower}/${resource_lower}.controller.ts" ]; then
        controller_path="apps/api/src/${resource_lower}/${resource_lower}.controller.ts"
    elif [ -f "apps/api/src/modules/${resource_lower}/${resource_lower}.controller.ts" ]; then
        controller_path="apps/api/src/modules/${resource_lower}/${resource_lower}.controller.ts"
    fi
    
    # Check common patterns for service locations
    if [ -f "apps/api/src/${resource_lower}/${resource_lower}.service.ts" ]; then
        service_path="apps/api/src/${resource_lower}/${resource_lower}.service.ts"
    elif [ -f "apps/api/src/modules/${resource_lower}/${resource_lower}.service.ts" ]; then
        service_path="apps/api/src/modules/${resource_lower}/${resource_lower}.service.ts"
    fi
    
    # 1. Backend API Files
    if check_file "$module_path"; then
        echo -e "  ${GREEN}✓${NC} Module file exists"
    else
        echo -e "  ${RED}✗${NC} Module file missing"
        ((entity_errors++))
    fi
    
    if check_file "$controller_path"; then
        echo -e "  ${GREEN}✓${NC} Controller file exists"
    else
        echo -e "  ${RED}✗${NC} Controller file missing"
        ((entity_errors++))
    fi
    
    if check_file "$service_path"; then
        echo -e "  ${GREEN}✓${NC} Service file exists"
    else
        echo -e "  ${RED}✗${NC} Service file missing"
        ((entity_errors++))
    fi
    
    # 2. API Endpoints
    if [ -n "$controller_path" ] && [ -f "$controller_path" ]; then
        if check_pattern "$controller_path" "extends BaseCrudController"; then
            echo -e "  ${GREEN}✓${NC} Controller extends BaseCrudController (provides all CRUD endpoints)"
            echo -e "  ${GREEN}✓${NC} GET list endpoint (inherited)"
            echo -e "  ${GREEN}✓${NC} GET by ID endpoint (inherited)"
            echo -e "  ${GREEN}✓${NC} POST create endpoint (inherited)"
            echo -e "  ${GREEN}✓${NC} PUT update endpoint (inherited)"
            echo -e "  ${GREEN}✓${NC} PATCH update endpoint (inherited)"
            echo -e "  ${GREEN}✓${NC} DELETE endpoint (inherited)"
            echo -e "  ${GREEN}✓${NC} Response wrapped in data object (inherited)"
        else
            # Traditional approach - check for explicit decorators
            if check_pattern "$controller_path" "@Get()"; then
                echo -e "  ${GREEN}✓${NC} GET list endpoint"
            else
                echo -e "  ${YELLOW}⚠${NC} GET list endpoint missing"
                ((entity_warnings++))
            fi
            
            if check_pattern "$controller_path" "@Get(':id')"; then
                echo -e "  ${GREEN}✓${NC} GET by ID endpoint"
            else
                echo -e "  ${YELLOW}⚠${NC} GET by ID endpoint missing"
                ((entity_warnings++))
            fi
            
            if check_pattern "$controller_path" "@Post()"; then
                echo -e "  ${GREEN}✓${NC} POST create endpoint"
            else
                echo -e "  ${YELLOW}⚠${NC} POST create endpoint missing"
                ((entity_warnings++))
            fi
            
            if check_pattern "$controller_path" "@Put(':id')\|@Patch(':id')"; then
                echo -e "  ${GREEN}✓${NC} PUT/PATCH update endpoint"
            else
                echo -e "  ${YELLOW}⚠${NC} PUT/PATCH update endpoint missing"
                ((entity_warnings++))
            fi
            
            if check_pattern "$controller_path" "@Delete(':id')"; then
                echo -e "  ${GREEN}✓${NC} DELETE endpoint"
            else
                echo -e "  ${YELLOW}⚠${NC} DELETE endpoint missing"
                ((entity_warnings++))
            fi
            
            if check_pattern "$controller_path" "{ data:\|return.*data"; then
                echo -e "  ${GREEN}✓${NC} Response wrapped in data object"
            else
                echo -e "  ${YELLOW}⚠${NC} Response may not be properly wrapped in data object"
                ((entity_warnings++))
            fi
        fi
    fi
    
    # 3. Multi-tenancy
    if [ -n "$service_path" ] && [ -f "$service_path" ]; then
        if check_pattern "$service_path" "branchId"; then
            echo -e "  ${GREEN}✓${NC} Multi-tenancy with branchId"
        else
            echo -e "  ${YELLOW}⚠${NC} Multi-tenancy with branchId not found"
            ((entity_warnings++))
        fi
        
        if check_pattern "$service_path" "BaseCrudService"; then
            echo -e "  ${GREEN}✓${NC} Extends BaseCrudService"
        else
            echo -e "  ${YELLOW}⚠${NC} Does not extend BaseCrudService"
            ((entity_warnings++))
        fi
    fi
    
    # 4. E2E Tests
    if check_file "apps/api/test/${resource_lower}.e2e-spec.ts"; then
        echo -e "  ${GREEN}✓${NC} E2E test file exists"
        
        if check_pattern "apps/api/test/${resource_lower}.e2e-spec.ts" "page=1&pageSize="; then
            echo -e "  ${GREEN}✓${NC} Pagination test"
        else
            echo -e "  ${YELLOW}⚠${NC} Pagination test missing"
            ((entity_warnings++))
        fi
        
        if check_pattern "apps/api/test/${resource_lower}.e2e-spec.ts" "X-Branch-Id"; then
            echo -e "  ${GREEN}✓${NC} Multi-tenant test"
        else
            echo -e "  ${YELLOW}⚠${NC} Multi-tenant test missing"
            ((entity_warnings++))
        fi
    else
        echo -e "  ${RED}✗${NC} E2E test file missing"
        ((entity_errors++))
    fi
    
    # 5. Seed Data
    if check_pattern "apps/api/prisma/seed.ts" "$resource_lower"; then
        echo -e "  ${GREEN}✓${NC} Seed data found"
    else
        echo -e "  ${YELLOW}⚠${NC} Seed data not found"
        ((entity_warnings++))
    fi
    
    # 6. Frontend Integration
    if check_file "apps/web/app/admin/resources/${resource_lower}/index.tsx"; then
        echo -e "  ${GREEN}✓${NC} Frontend resource folder exists"
    else
        echo -e "  ${RED}✗${NC} Frontend resource folder missing"
        ((entity_errors++))
    fi
    
    if check_pattern "apps/web/app/admin/AdminApp.tsx" "name: '${resource_lower}'"; then
        echo -e "  ${GREEN}✓${NC} Resource registered in AdminApp.tsx"
    else
        echo -e "  ${RED}✗${NC} Resource not registered in AdminApp.tsx"
        ((entity_errors++))
    fi
    
    # Update totals
    ((TOTAL_ERRORS += entity_errors))
    ((TOTAL_WARNINGS += entity_warnings))
    ((TOTAL_ENTITIES++))
    
    if [ $entity_errors -eq 0 ]; then
        ((ENTITIES_PASSED++))
        if [ $entity_warnings -eq 0 ]; then
            echo -e "  ${GREEN}✅ Entity validation: PASSED${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Entity validation: PASSED with $entity_warnings warnings${NC}"
        fi
    else
        ((ENTITIES_FAILED++))
        echo -e "  ${RED}❌ Entity validation: FAILED ($entity_errors errors, $entity_warnings warnings)${NC}"
    fi
}

# Auto-discover entities from controller files
echo "🔍 Auto-discovering entities from controller files..."
ENTITIES=()

# Find all controller files and extract entity names
while IFS= read -r -d '' file; do
    # Extract entity name from file path
    entity=$(basename "$file" .controller.ts)
    # Skip special controllers
    if [[ "$entity" != "health" && "$entity" != "files" && "$entity" != "tenants" && "$entity" != "app" && "$entity" != "base-crud" ]]; then
        ENTITIES+=("$entity")
    fi
done < <(find apps/api/src -name "*.controller.ts" -print0 2>/dev/null)

# Sort entities alphabetically
IFS=$'\n' ENTITIES=($(sort <<<"${ENTITIES[*]}"))
unset IFS

echo "Found ${#ENTITIES[@]} entities: ${ENTITIES[*]}"

# Validate each entity
for entity in "${ENTITIES[@]}"; do
    validate_entity "$entity"
done

# Final Summary
echo ""
echo "=================================================="
echo "🏁 COMPREHENSIVE VALIDATION SUMMARY"
echo "=================================================="
echo -e "📊 Total Entities Checked: ${BLUE}$TOTAL_ENTITIES${NC}"
echo -e "✅ Entities Passed: ${GREEN}$ENTITIES_PASSED${NC}"
echo -e "❌ Entities Failed: ${RED}$ENTITIES_FAILED${NC}"
echo -e "⚠️  Total Warnings: ${YELLOW}$TOTAL_WARNINGS${NC}"
echo -e "🚨 Total Errors: ${RED}$TOTAL_ERRORS${NC}"
echo ""

if [ $TOTAL_ERRORS -eq 0 ] && [ $TOTAL_WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All entities passed validation! System is ready for production.${NC}"
    exit 0
elif [ $TOTAL_ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  All entities passed with $TOTAL_WARNINGS warnings. Consider addressing warnings for best practices.${NC}"
    exit 0
else
    echo -e "${RED}💥 Validation failed: $TOTAL_ERRORS errors across $ENTITIES_FAILED entities.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Fix the errors reported above"
    echo "2. Ensure all entities follow the backend-implementer standards"
    echo "3. Re-run this script to verify fixes"
    exit 1
fi