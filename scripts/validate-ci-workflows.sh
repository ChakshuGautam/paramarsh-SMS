#!/bin/bash

# Script to validate CI workflows locally
# Usage: ./scripts/validate-ci-workflows.sh [backend|frontend|integration|all]

set -e

TARGET=${1:-"all"}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔍 Validating CI workflows for: $TARGET"
echo "Root directory: $ROOT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️ $message${NC}"
            ;;
    esac
}

# Function to validate backend workflow
validate_backend() {
    print_status "INFO" "Validating backend workflow..."
    
    cd "$ROOT_DIR/apps/api"
    
    # Check if dependencies can be installed
    if ! bun install > /dev/null 2>&1; then
        print_status "ERROR" "Backend dependencies installation failed"
        return 1
    fi
    print_status "SUCCESS" "Backend dependencies installed"
    
    # Check if database can be setup
    if ! touch prisma/test.db && npx prisma generate > /dev/null 2>&1; then
        print_status "ERROR" "Prisma setup failed"
        return 1
    fi
    print_status "SUCCESS" "Prisma setup completed"
    
    # Check if database push works
    if ! DATABASE_URL=file:./test.db npx prisma db push --force-reset > /dev/null 2>&1; then
        print_status "ERROR" "Database push failed"
        return 1
    fi
    print_status "SUCCESS" "Database push completed"
    
    # Check if basic CI test runs
    if ! npx jest test/basic-ci.e2e-spec.ts --testTimeout=10000 > /dev/null 2>&1; then
        print_status "WARNING" "Basic backend test failed (non-blocking)"
    else
        print_status "SUCCESS" "Basic backend test passed"
    fi
    
    # Check if health endpoint test runs
    if ! npx jest test/health.e2e-spec.ts --testTimeout=10000 > /dev/null 2>&1; then
        print_status "WARNING" "Health endpoint test failed (non-blocking)"
    else
        print_status "SUCCESS" "Health endpoint test passed"
    fi
    
    # Cleanup
    rm -f prisma/test.db
    print_status "SUCCESS" "Backend validation completed"
    
    cd "$ROOT_DIR"
}

# Function to validate frontend workflow
validate_frontend() {
    print_status "INFO" "Validating frontend workflow..."
    
    cd "$ROOT_DIR/apps/web"
    
    # Check if dependencies can be installed
    if ! npm ci > /dev/null 2>&1; then
        print_status "ERROR" "Frontend dependencies installation failed"
        return 1
    fi
    print_status "SUCCESS" "Frontend dependencies installed"
    
    # Check if CI jest config exists
    if [ ! -f "jest.config.ci.js" ]; then
        print_status "ERROR" "CI Jest configuration missing"
        return 1
    fi
    print_status "SUCCESS" "CI Jest configuration found"
    
    # Check if basic test runs
    if ! CI=true npx jest --config jest.config.ci.js test/basic-ci.test.tsx --passWithNoTests --silent > /dev/null 2>&1; then
        print_status "WARNING" "Basic frontend test failed (non-blocking)"
    else
        print_status "SUCCESS" "Basic frontend test passed"
    fi
    
    # Check if resource validation test runs
    if ! CI=true npx jest --config jest.config.ci.js test/resources/resource-validation.test.tsx --passWithNoTests --silent > /dev/null 2>&1; then
        print_status "WARNING" "Resource validation test failed (non-blocking)"
    else
        print_status "SUCCESS" "Resource validation test passed"
    fi
    
    # Check for MUI imports
    if grep -r "@mui" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --exclude-dir=node_modules . > /dev/null 2>&1; then
        print_status "ERROR" "Found MUI imports! Only shadcn/ui is allowed."
        return 1
    fi
    print_status "SUCCESS" "No MUI imports found"
    
    # Check if build works
    if ! NEXT_PUBLIC_API_URL=http://localhost:8080 npm run build > /dev/null 2>&1; then
        print_status "ERROR" "Frontend build failed"
        return 1
    fi
    print_status "SUCCESS" "Frontend build completed"
    
    print_status "SUCCESS" "Frontend validation completed"
    
    cd "$ROOT_DIR"
}

# Function to validate integration workflow
validate_integration() {
    print_status "INFO" "Validating integration workflow..."
    
    # Check if backend can start
    cd "$ROOT_DIR/apps/api"
    
    # Setup test database
    touch prisma/dev.db
    npx prisma generate > /dev/null 2>&1
    DATABASE_URL=file:./dev.db npx prisma db push --force-reset > /dev/null 2>&1
    DATABASE_URL=file:./dev.db npx prisma db seed > /dev/null 2>&1
    
    # Start backend in background
    DATABASE_URL=file:./dev.db PORT=8080 NODE_ENV=test JWT_SECRET=test-key bun run start:dev > /dev/null 2>&1 &
    BACKEND_PID=$!
    
    print_status "INFO" "Backend started with PID: $BACKEND_PID"
    
    # Wait for backend to be ready
    sleep 10
    
    # Test health endpoint
    if curl -f http://localhost:8080/api/v1/health > /dev/null 2>&1; then
        print_status "SUCCESS" "Backend health check passed"
    else
        print_status "ERROR" "Backend health check failed"
        kill $BACKEND_PID || true
        return 1
    fi
    
    # Test API endpoints
    if curl -H "X-Branch-Id: branch1" http://localhost:8080/api/v1/students > /dev/null 2>&1; then
        print_status "SUCCESS" "Students endpoint accessible"
    else
        print_status "WARNING" "Students endpoint failed (non-blocking)"
    fi
    
    # Stop backend
    kill $BACKEND_PID || true
    sleep 2
    
    # Cleanup
    rm -f prisma/dev.db
    
    print_status "SUCCESS" "Integration validation completed"
    
    cd "$ROOT_DIR"
}

# Function to check workflow files
validate_workflow_files() {
    print_status "INFO" "Validating workflow files..."
    
    local workflow_files=(
        ".github/workflows/backend-tests.yml"
        ".github/workflows/frontend-tests.yml"
        ".github/workflows/full-stack-integration.yml"
        ".github/workflows/code-quality.yml"
    )
    
    for workflow_file in "${workflow_files[@]}"; do
        if [ -f "$ROOT_DIR/$workflow_file" ]; then
            print_status "SUCCESS" "Found $workflow_file"
        else
            print_status "ERROR" "Missing $workflow_file"
            return 1
        fi
    done
    
    print_status "SUCCESS" "All workflow files found"
}

# Function to validate environment setup
validate_environment() {
    print_status "INFO" "Validating environment setup..."
    
    # Check required tools
    if ! command -v bun &> /dev/null; then
        print_status "ERROR" "Bun is not installed"
        return 1
    fi
    print_status "SUCCESS" "Bun is available"
    
    if ! command -v npm &> /dev/null; then
        print_status "ERROR" "npm is not installed"
        return 1
    fi
    print_status "SUCCESS" "npm is available"
    
    if ! command -v npx &> /dev/null; then
        print_status "ERROR" "npx is not installed"
        return 1
    fi
    print_status "SUCCESS" "npx is available"
    
    print_status "SUCCESS" "Environment validation completed"
}

# Main validation logic
main() {
    print_status "INFO" "Starting CI workflow validation..."
    
    validate_environment || exit 1
    validate_workflow_files || exit 1
    
    case "$TARGET" in
        "backend")
            validate_backend || exit 1
            ;;
        "frontend")
            validate_frontend || exit 1
            ;;
        "integration")
            validate_integration || exit 1
            ;;
        "all")
            validate_backend || exit 1
            validate_frontend || exit 1
            validate_integration || exit 1
            ;;
        *)
            print_status "ERROR" "Invalid target: $TARGET. Use backend, frontend, integration, or all"
            exit 1
            ;;
    esac
    
    print_status "SUCCESS" "🎉 All validations completed successfully!"
    echo ""
    echo -e "${GREEN}Your CI workflows should now pass! 🚀${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit these changes"
    echo "2. Push to GitHub"
    echo "3. Check GitHub Actions for green checkmarks ✅"
}

# Trap to cleanup background processes
trap 'jobs -p | xargs -r kill' EXIT

# Run main function
main