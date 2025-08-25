#!/bin/bash

# Local test script for Paramarsh Deploy MCP
# This simulates a deployment to test the MCP commands locally

set -e

echo "🧪 Testing Paramarsh Deploy MCP Locally"
echo "========================================"

# Configuration
TEST_DIR="/tmp/paramarsh-test-deploy"
TEST_REPO="https://github.com/facebook/react.git"  # Using a public repo for testing
TEST_BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Cleanup function
cleanup() {
    echo ""
    print_info "Cleaning up test environment..."
    
    # Stop PM2 processes if running
    if command -v pm2 &> /dev/null; then
        pm2 delete paramarsh-api paramarsh-web 2>/dev/null || true
    fi
    
    # Remove test directory
    if [ -d "$TEST_DIR" ]; then
        rm -rf "$TEST_DIR"
        print_status "Test directory removed: $TEST_DIR"
    fi
    
    print_status "Cleanup complete!"
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main test sequence
main() {
    echo ""
    print_info "Step 1: Creating test directories"
    mkdir -p "$TEST_DIR"
    mkdir -p "$TEST_DIR/logs"
    print_status "Directories created at $TEST_DIR"
    
    echo ""
    print_info "Step 2: Checking prerequisites"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not installed"
        exit 1
    fi
    
    # Check Bun
    if command -v bun &> /dev/null; then
        BUN_VERSION=$(bun --version)
        print_status "Bun installed: $BUN_VERSION"
    else
        print_info "Bun not installed - would be installed by MCP"
    fi
    
    # Check PM2
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        print_status "PM2 installed: $PM2_VERSION"
    else
        print_info "PM2 not installed - would be installed by MCP"
    fi
    
    echo ""
    print_info "Step 3: Simulating repository clone"
    cd "$TEST_DIR"
    
    # Create a mock project structure instead of cloning
    mkdir -p apps/api apps/web mcp/paramarsh-deploy
    
    # Create mock package.json files
    cat > apps/api/package.json << 'EOF'
{
  "name": "paramarsh-api",
  "version": "1.0.0",
  "scripts": {
    "start:dev": "echo 'Starting API on port 10011...'",
    "build": "echo 'Building API...'"
  }
}
EOF
    
    cat > apps/web/package.json << 'EOF'
{
  "name": "paramarsh-web",
  "version": "1.0.0",
  "scripts": {
    "start": "echo 'Starting Web on port 10010...'",
    "build": "echo 'Building Web...'"
  }
}
EOF
    
    # Create mock Prisma schema
    mkdir -p apps/api/prisma
    cat > apps/api/prisma/schema.prisma << 'EOF'
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id String @id
}
EOF
    
    print_status "Mock project structure created"
    
    echo ""
    print_info "Step 4: Creating ecosystem.config.js"
    cat > "$TEST_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'paramarsh-api',
      cwd: '/tmp/paramarsh-test-deploy/apps/api',
      script: 'node',
      args: '-e "console.log(\'API running on 10011\'); setInterval(() => {}, 1000)"',
      env: {
        PORT: 10011,
      },
    },
    {
      name: 'paramarsh-web',
      cwd: '/tmp/paramarsh-test-deploy/apps/web',
      script: 'node',
      args: '-e "console.log(\'Web running on 10010\'); setInterval(() => {}, 1000)"',
      env: {
        PORT: 10010,
      },
    },
  ],
};
EOF
    print_status "PM2 config created"
    
    echo ""
    print_info "Step 5: Testing dependency installation"
    cd apps/api && npm init -y &>/dev/null
    cd ../web && npm init -y &>/dev/null
    cd ../..
    print_status "Mock dependencies initialized"
    
    echo ""
    print_info "Step 6: Testing build process"
    cd apps/api && npm run build 2>/dev/null || echo "  Build simulation for API"
    cd ../web && npm run build 2>/dev/null || echo "  Build simulation for Web"
    cd ../..
    print_status "Build simulation complete"
    
    echo ""
    print_info "Step 7: Testing PM2 processes"
    if command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js
        sleep 2
        pm2 list
        print_status "PM2 processes started"
        
        echo ""
        print_info "Step 8: Checking process status"
        pm2 status
        
        echo ""
        print_info "Step 9: Testing restart"
        pm2 restart all
        print_status "Processes restarted"
        
        echo ""
        print_info "Step 10: Viewing logs"
        pm2 logs --lines 5 --nostream
    else
        print_info "PM2 not installed - skipping process tests"
    fi
    
    echo ""
    print_info "Step 11: Checking ports (simulation)"
    echo "  Port 10010 (Web): Would be checked with lsof"
    echo "  Port 10011 (API): Would be checked with lsof"
    
    echo ""
    print_info "Step 12: Health check simulation"
    echo "  Would check: https://paramarsh-sms.theflywheel.in"
    echo "  Would check: https://api.paramarsh-sms.theflywheel.in"
    
    echo ""
    echo "========================================"
    print_status "Local MCP deployment test completed!"
    echo ""
    echo "Summary of what the MCP would do on a real server:"
    echo "  1. ✅ Create directories at /root/paramarsh-sms"
    echo "  2. ✅ Install Bun and PM2 if needed"
    echo "  3. ✅ Clone repository from GitHub"
    echo "  4. ✅ Install dependencies with bun"
    echo "  5. ✅ Run database migrations"
    echo "  6. ✅ Build applications"
    echo "  7. ✅ Start PM2 processes on ports 10010 & 10011"
    echo "  8. ✅ Monitor health and logs"
    echo ""
}

# Run main function
main

echo "Test will auto-cleanup in 5 seconds..."
sleep 5