#!/bin/bash

# Paramarsh SMS - MCP-Based Seed Data Validation Script
# This script validates seed data using EXCLUSIVELY PostgreSQL MCP Server tools.
# NEVER uses psql command-line tool or direct database connections.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Header
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   PARAMARSH SMS                              ║"
echo "║         MCP-BASED SEED DATA VALIDATION                      ║"
echo "║                                                              ║"
echo "║  PostgreSQL MCP Server tools - No direct database access    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}📍 Working Directory: $(pwd)${NC}"
echo -e "${BLUE}🕐 Started at: $(date)${NC}"
echo

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Error: Not in API directory. Please run from apps/api${NC}"
    exit 1
fi

# Check if TypeScript runner is available
if ! command -v tsx &> /dev/null; then
    echo -e "${RED}❌ Error: tsx not found. Please install tsx: npm install -g tsx${NC}"
    exit 1
fi

echo -e "${PURPLE}🔍 Starting comprehensive MCP-based seed data validation...${NC}"
echo

# Method 1: Run MCP-based TypeScript validation
echo -e "${CYAN}📊 Method 1: MCP Database Validation${NC}"
echo -e "${BLUE}Running MCP-based validation script...${NC}"

if tsx scripts/validate-seed-data-mcp-full.ts; then
    echo -e "${GREEN}✅ MCP validation: PASSED${NC}"
    MCP_STATUS="PASS"
else
    echo -e "${RED}❌ MCP validation: FAILED${NC}"
    MCP_STATUS="FAIL"
fi

echo
echo -e "${CYAN}📋 Method 2: E2E API Validation${NC}"
echo -e "${BLUE}Running E2E tests for seed data validation...${NC}"

# Method 2: Run E2E tests (these don't use direct database access)
if bun test test/seed-data-validation.e2e-spec.ts --timeout 60000; then
    echo -e "${GREEN}✅ E2E validation: PASSED${NC}"
    E2E_STATUS="PASS"
else
    echo -e "${RED}❌ E2E validation: FAILED${NC}"
    E2E_STATUS="FAIL"
fi

echo
echo -e "${CYAN}📈 Method 3: MCP Health Check${NC}"
echo -e "${BLUE}Performing MCP-based health check...${NC}"

# Method 3: Run MCP health check
if tsx scripts/validate-seed-data-mcp.ts; then
    echo -e "${GREEN}✅ MCP health check: PASSED${NC}"
    HEALTH_STATUS="PASS"
else
    echo -e "${RED}❌ MCP health check: FAILED${NC}"
    HEALTH_STATUS="FAIL"
fi

echo
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                      VALIDATION SUMMARY                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

echo -e "${BLUE}📊 Validation Methods:${NC}"
echo -e "  🔍 MCP Database Check: $MCP_STATUS"
echo -e "  🌐 E2E API Tests: $E2E_STATUS"
echo -e "  💊 MCP Health Check: $HEALTH_STATUS"

# Determine overall status
OVERALL_STATUS="PASS"
if [ "$MCP_STATUS" = "FAIL" ] || [ "$E2E_STATUS" = "FAIL" ] || [ "$HEALTH_STATUS" = "FAIL" ]; then
    OVERALL_STATUS="FAIL"
fi

echo
if [ "$OVERALL_STATUS" = "PASS" ]; then
    echo -e "${GREEN}🎉 OVERALL STATUS: VALIDATION PASSED${NC}"
    echo -e "${GREEN}✅ Database is ready for production demo!${NC}"
    echo -e "${GREEN}📊 All entities properly seeded with Indian contextual data${NC}"
    echo -e "${GREEN}🔗 Referential integrity maintained${NC}"
    echo -e "${GREEN}📈 Data quality meets production standards${NC}"
    echo -e "${GREEN}🚀 All validations performed via MCP PostgreSQL Server tools${NC}"
else
    echo -e "${RED}❌ OVERALL STATUS: VALIDATION FAILED${NC}"
    echo -e "${RED}🚨 Database needs attention before demo${NC}"
    echo -e "${YELLOW}💡 Suggestions:${NC}"
    echo -e "${YELLOW}   1. Run: bun run db:reset && bun run seed${NC}"
    echo -e "${YELLOW}   2. Check MCP PostgreSQL Server connection${NC}"
    echo -e "${YELLOW}   3. Review validation errors above${NC}"
    echo -e "${YELLOW}   4. Ensure all scripts use MCP tools exclusively${NC}"
fi

echo
echo -e "${BLUE}🕐 Completed at: $(date)${NC}"

# Check for validation report
REPORT_PATH="reports/seed-validation-mcp-$(date +%Y-%m-%d).json"
if [ -f "$REPORT_PATH" ]; then
    echo -e "${BLUE}📄 Detailed report saved to: $REPORT_PATH${NC}"
    
    # Try to extract health score if jq is available
    if command -v jq &> /dev/null; then
        HEALTH_SCORE=$(cat "$REPORT_PATH" | jq -r '.overall.healthScore // "unknown"')
        if [ "$HEALTH_SCORE" != "unknown" ] && [ "$HEALTH_SCORE" != "null" ]; then
            echo -e "${PURPLE}🎯 Overall Health Score: ${HEALTH_SCORE}%${NC}"
            
            if [ "$HEALTH_SCORE" -ge 90 ]; then
                echo -e "${GREEN}🌟 Excellent! Database exceeds quality standards${NC}"
            elif [ "$HEALTH_SCORE" -ge 80 ]; then
                echo -e "${YELLOW}👍 Good! Database meets minimum standards${NC}"
            else
                echo -e "${RED}⚠️  Poor! Database needs significant improvement${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Validation report not found at: $REPORT_PATH${NC}"
fi

echo
echo -e "${PURPLE}🔧 MCP ADVANTAGES:${NC}"
echo -e "${BLUE}  ✓ No direct database access required${NC}"
echo -e "${BLUE}  ✓ Consistent cross-platform behavior${NC}"
echo -e "${BLUE}  ✓ Automated tool orchestration${NC}"
echo -e "${BLUE}  ✓ Enhanced security and isolation${NC}"
echo -e "${BLUE}  ✓ Standardized data validation approach${NC}"

echo
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

# Exit with appropriate code
if [ "$OVERALL_STATUS" = "PASS" ]; then
    exit 0
else
    exit 1
fi