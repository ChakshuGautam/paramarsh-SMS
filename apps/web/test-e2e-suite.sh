#!/bin/bash

# Paramarsh SMS - E2E Test Suite Validator & Runner
# This script validates the test environment and runs the comprehensive E2E test suite

set -e  # Exit on any error

echo "🚀 Paramarsh SMS - E2E Test Suite Runner"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if servers are running
check_servers() {
    print_status "Checking server availability..."
    
    # Check frontend (port 3001)
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        print_success "Frontend server is running on http://localhost:3001"
    else
        print_error "Frontend server is not running on port 3001"
        echo "Please start the frontend server:"
        echo "cd apps/web && npm run dev"
        return 1
    fi
    
    # Check backend API (port 3005)
    if curl -s http://localhost:3005/health > /dev/null 2>&1; then
        print_success "Backend API is running on http://localhost:3005"
    else
        print_error "Backend API is not running on port 3005"
        echo "Please start the backend server:"
        echo "cd apps/api && npm run start:dev"
        return 1
    fi
}

# Check Playwright installation
check_playwright() {
    print_status "Checking Playwright installation..."
    
    if command -v npx > /dev/null && npx playwright --version > /dev/null 2>&1; then
        PLAYWRIGHT_VERSION=$(npx playwright --version)
        print_success "Playwright is installed: $PLAYWRIGHT_VERSION"
    else
        print_error "Playwright is not installed"
        echo "Please install Playwright:"
        echo "npm install --save-dev @playwright/test playwright"
        echo "npx playwright install"
        return 1
    fi
}

# Check test files exist
check_test_files() {
    print_status "Checking test files..."
    
    local test_files=(
        "test/e2e/auth/authentication-comprehensive.spec.ts"
        "test/e2e/navigation/core-navigation-comprehensive.spec.ts"
        "test/e2e/modules/students-module-comprehensive.spec.ts"
        "test/e2e/workflows/guardian-student-workflow.spec.ts"
        "test/e2e/security/multi-tenancy-security.spec.ts"
        "test/e2e/helpers/page-objects.ts"
    )
    
    local missing_files=()
    for file in "${test_files[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "Found: $file"
        else
            missing_files+=("$file")
            print_warning "Missing: $file"
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        print_success "All essential test files are present"
    else
        print_warning "${#missing_files[@]} test files are missing"
    fi
}

# Run test suite with different options
run_tests() {
    local test_mode=$1
    
    print_status "Running E2E tests in $test_mode mode..."
    
    case $test_mode in
        "critical")
            print_status "Running critical priority tests..."
            npx playwright test test/e2e/auth/ test/e2e/navigation/ test/e2e/modules/students-module-comprehensive.spec.ts \
                --reporter=line \
                --project=chromium
            ;;
        "security")
            print_status "Running security and multi-tenancy tests..."
            npx playwright test test/e2e/security/ \
                --reporter=line \
                --project=chromium
            ;;
        "workflows")
            print_status "Running cross-module workflow tests..."
            npx playwright test test/e2e/workflows/ \
                --reporter=line \
                --project=chromium
            ;;
        "all")
            print_status "Running all comprehensive E2E tests..."
            npx playwright test test/e2e/auth/ test/e2e/navigation/ test/e2e/modules/ test/e2e/workflows/ test/e2e/security/ \
                --reporter=html \
                --project=chromium
            ;;
        "smoke")
            print_status "Running smoke test (authentication only)..."
            npx playwright test test/e2e/auth/authentication-comprehensive.spec.ts \
                -g "should login successfully with valid admin credentials" \
                --reporter=line \
                --project=chromium
            ;;
        *)
            print_error "Invalid test mode: $test_mode"
            echo "Available modes: critical, security, workflows, all, smoke"
            return 1
            ;;
    esac
}

# Display test summary
show_test_summary() {
    print_status "Test Suite Summary:"
    echo "==================="
    echo "📁 Test Structure:"
    echo "  ├── auth/                     - Multi-tenant authentication flows"
    echo "  ├── navigation/               - Dashboard & menu navigation"  
    echo "  ├── modules/                  - Complete module CRUD testing"
    echo "  ├── workflows/                - Cross-module integration"
    echo "  ├── security/                 - Security & data isolation"
    echo "  └── helpers/                  - Reusable utilities"
    echo ""
    echo "🎯 Coverage:"
    echo "  ✅ Authentication & Authorization"
    echo "  ✅ Core Navigation & Dashboard"
    echo "  ✅ Students Module (Full CRUD)"
    echo "  ✅ Guardian-Student Workflows"
    echo "  ✅ Multi-tenancy & Security"
    echo "  ✅ Performance & Accessibility"
    echo ""
    echo "🔧 Test Modes:"
    echo "  • smoke    - Quick authentication test"
    echo "  • critical - Auth + Navigation + Core CRUD"
    echo "  • security - Multi-tenancy & security tests"
    echo "  • workflows - Cross-module integration"
    echo "  • all      - Complete comprehensive suite"
}

# Main execution
main() {
    echo ""
    
    # Parse command line arguments
    if [[ $# -eq 0 ]]; then
        show_test_summary
        echo ""
        print_status "Usage: $0 [smoke|critical|security|workflows|all|check]"
        echo ""
        echo "Examples:"
        echo "  $0 check     - Validate test environment"
        echo "  $0 smoke     - Quick smoke test"
        echo "  $0 critical  - Run critical tests"
        echo "  $0 all       - Run all tests"
        exit 0
    fi
    
    local command=$1
    
    case $command in
        "check")
            print_status "Validating test environment..."
            check_servers
            check_playwright
            check_test_files
            print_success "Environment validation completed!"
            ;;
        "smoke"|"critical"|"security"|"workflows"|"all")
            # Validate environment first
            if ! check_servers || ! check_playwright; then
                print_error "Environment validation failed. Please fix the issues above."
                exit 1
            fi
            
            # Run tests
            if run_tests $command; then
                print_success "Test execution completed successfully!"
                
                # Show report if HTML reporter was used
                if [[ $command == "all" ]]; then
                    print_status "Opening HTML test report..."
                    npx playwright show-report
                fi
            else
                print_error "Some tests failed. Check the output above."
                exit 1
            fi
            ;;
        *)
            print_error "Unknown command: $command"
            echo "Available commands: check, smoke, critical, security, workflows, all"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"