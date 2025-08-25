#!/bin/bash

# Paramarsh SMS - Seed Data Validation Script
# This script validates that the database has been properly seeded with 
# comprehensive, realistic Indian contextual data.

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
echo "║              SEED DATA VALIDATION                            ║"
echo "║                                                              ║"
echo "║  Comprehensive validation of Indian contextual school data   ║"
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

# Check if database connection is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: PostgreSQL client (psql) not found. Please install PostgreSQL.${NC}"
    exit 1
fi

# Check if database connection works
if ! psql $DATABASE_URL -c "SELECT 1;" &> /dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to PostgreSQL database. Please check DATABASE_URL.${NC}"
    echo -e "${YELLOW}   Ensure PostgreSQL is running and DATABASE_URL is set${NC}"
    exit 1
fi

echo -e "${PURPLE}🔍 Starting comprehensive seed data validation...${NC}"
echo

# Method 1: Run TypeScript validation directly
echo -e "${CYAN}📊 Method 1: Direct Database Validation${NC}"
echo -e "${BLUE}Running comprehensive validation script...${NC}"

if npx tsx prisma/validate-seed-data.ts; then
    echo -e "${GREEN}✅ Direct validation: PASSED${NC}"
    DIRECT_STATUS="PASS"
else
    echo -e "${RED}❌ Direct validation: FAILED${NC}"
    DIRECT_STATUS="FAIL"
fi

echo
echo -e "${CYAN}📋 Method 2: E2E API Validation${NC}"
echo -e "${BLUE}Running E2E tests for seed data validation...${NC}"

# Method 2: Run E2E tests
if bun test test/seed-data-validation.e2e-spec.ts --timeout 60000; then
    echo -e "${GREEN}✅ E2E validation: PASSED${NC}"
    E2E_STATUS="PASS"
else
    echo -e "${RED}❌ E2E validation: FAILED${NC}"
    E2E_STATUS="FAIL"
fi

echo
echo -e "${CYAN}📈 Method 3: Quick Entity Count Check${NC}"
echo -e "${BLUE}Performing quick database entity counts...${NC}"

# Method 3: Quick count validation using PostgreSQL
if command -v psql &> /dev/null; then
    echo -e "${BLUE}🔢 Entity Counts:${NC}"
    
    # Core entities (using PostgreSQL)
    STUDENTS=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM \"Student\" WHERE \"branchId\" = 'branch1';" | xargs)
    GUARDIANS=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM \"Guardian\" WHERE \"branchId\" = 'branch1';" | xargs)
    TEACHERS=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM \"Teacher\" WHERE \"branchId\" = 'branch1';" | xargs)
    STAFF=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM \"Staff\" WHERE \"branchId\" = 'branch1';" | xargs)
    CLASSES=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM \"Class\" WHERE \"branchId\" = 'branch1';" | xargs)
    SECTIONS=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM \"Section\" WHERE \"branchId\" = 'branch1';" | xargs)
    SUBJECTS=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM \"Subject\" WHERE \"branchId\" = 'branch1';" | xargs)
    INVOICES=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM \"Invoice\" WHERE \"branchId\" = 'branch1';" | xargs)
    
    echo -e "  👥 Students: ${STUDENTS}"
    echo -e "  👨‍👩‍👧‍👦 Guardians: ${GUARDIANS}"
    echo -e "  👨‍🏫 Teachers: ${TEACHERS}"
    echo -e "  👥 Staff: ${STAFF}"
    echo -e "  📚 Classes: ${CLASSES}"
    echo -e "  🏛️ Sections: ${SECTIONS}"
    echo -e "  📖 Subjects: ${SUBJECTS}"
    echo -e "  💰 Invoices: ${INVOICES}"
    
    # Quick validation
    QUICK_STATUS="PASS"
    if [ "$STUDENTS" -lt 150 ]; then
        echo -e "${RED}  ❌ Students below minimum (150): $STUDENTS${NC}"
        QUICK_STATUS="FAIL"
    fi
    if [ "$GUARDIANS" -lt 100 ]; then
        echo -e "${RED}  ❌ Guardians below minimum (100): $GUARDIANS${NC}"
        QUICK_STATUS="FAIL"
    fi
    if [ "$TEACHERS" -lt 15 ]; then
        echo -e "${RED}  ❌ Teachers below minimum (15): $TEACHERS${NC}"
        QUICK_STATUS="FAIL"
    fi
    if [ "$CLASSES" -lt 13 ]; then
        echo -e "${RED}  ❌ Classes below minimum (13): $CLASSES${NC}"
        QUICK_STATUS="FAIL"
    fi
    
    if [ "$QUICK_STATUS" = "PASS" ]; then
        echo -e "${GREEN}✅ Quick count validation: PASSED${NC}"
    else
        echo -e "${RED}❌ Quick count validation: FAILED${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL (psql) not available, skipping quick count check${NC}"
    QUICK_STATUS="SKIP"
fi

echo
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                      VALIDATION SUMMARY                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

echo -e "${BLUE}📊 Validation Methods:${NC}"
echo -e "  🔍 Direct Database Check: $DIRECT_STATUS"
echo -e "  🌐 E2E API Tests: $E2E_STATUS"
echo -e "  🔢 Quick Count Check: $QUICK_STATUS"

# Determine overall status
OVERALL_STATUS="PASS"
if [ "$DIRECT_STATUS" = "FAIL" ] || [ "$E2E_STATUS" = "FAIL" ] || [ "$QUICK_STATUS" = "FAIL" ]; then
    OVERALL_STATUS="FAIL"
fi

echo
if [ "$OVERALL_STATUS" = "PASS" ]; then
    echo -e "${GREEN}🎉 OVERALL STATUS: VALIDATION PASSED${NC}"
    echo -e "${GREEN}✅ Database is ready for production demo!${NC}"
    echo -e "${GREEN}📊 All entities properly seeded with Indian contextual data${NC}"
    echo -e "${GREEN}🔗 Referential integrity maintained${NC}"
    echo -e "${GREEN}📈 Data quality meets production standards${NC}"
else
    echo -e "${RED}❌ OVERALL STATUS: VALIDATION FAILED${NC}"
    echo -e "${RED}🚨 Database needs attention before demo${NC}"
    echo -e "${YELLOW}💡 Suggestions:${NC}"
    echo -e "${YELLOW}   1. Run: bun run db:reset && bun run db:seed${NC}"
    echo -e "${YELLOW}   2. Check seed scripts in prisma/ directory${NC}"
    echo -e "${YELLOW}   3. Review validation errors above${NC}"
fi

echo
echo -e "${BLUE}🕐 Completed at: $(date)${NC}"
echo -e "${BLUE}📄 Detailed report saved to: /tmp/seed-validation-report.json${NC}"

if [ -f "/tmp/seed-validation-report.json" ]; then
    HEALTH_SCORE=$(cat /tmp/seed-validation-report.json | grep -o '"healthScore":[0-9]*' | cut -d':' -f2)
    if [ ! -z "$HEALTH_SCORE" ]; then
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

echo
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

# Exit with appropriate code
if [ "$OVERALL_STATUS" = "PASS" ]; then
    exit 0
else
    exit 1
fi