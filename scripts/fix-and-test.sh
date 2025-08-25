#!/bin/bash

# Script to automatically fix common test issues and re-run tests
# This script attempts to fix common problems before running tests

set -e

SCRIPT_DIR="$(dirname "$0")"
API_DIR="$SCRIPT_DIR/../apps/api"
TEST_DIR="$API_DIR/test"

echo "🔧 Auto-fix and Test Script"
echo "============================"

# Step 1: Ensure backend is on port 8080
echo "📡 Ensuring backend uses port 8080..."
if ! grep -q "PORT=8080" "$API_DIR/package.json"; then
    echo "❌ Backend not configured for port 8080. Please run the port configuration fix first."
    exit 1
fi

# Step 2: Ensure database exists and is migrated
echo "🗄️ Setting up database..."
cd "$API_DIR"
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
npx prisma db seed

# Step 3: Start backend
echo "🚀 Starting backend..."
"$SCRIPT_DIR/start-backend.sh"

# Step 4: Common test fixes
echo "🔍 Checking for common test issues..."

# Fix 1: Update import paths in test files
echo "  - Checking import paths..."
for TEST_FILE in "$TEST_DIR"/*.e2e-spec.ts; do
    if [ -f "$TEST_FILE" ]; then
        # Fix supertest import
        sed -i.bak "s/import \* as request from 'supertest'/import request from 'supertest'/g" "$TEST_FILE" 2>/dev/null || true
        sed -i.bak "s/import { request } from 'supertest'/import request from 'supertest'/g" "$TEST_FILE" 2>/dev/null || true
        
        # Fix common field name issues
        sed -i.bak "s/schoolId/branchId/g" "$TEST_FILE" 2>/dev/null || true
        
        # Remove backup files
        rm -f "$TEST_FILE.bak"
    fi
done

# Fix 2: Ensure test configuration is correct
echo "  - Checking test configuration..."
if [ -f "$API_DIR/test/jest-e2e.json" ]; then
    cat > "$API_DIR/test/jest-e2e.json" << 'EOF'
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  }
}
EOF
fi

# Step 5: Create a test health check
echo "🏥 Creating health check test..."
cat > "$TEST_DIR/health.e2e-spec.ts" << 'EOF'
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Health Check (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should connect to the application', () => {
    return request(app.getHttpServer())
      .get('/api/v1/students')
      .set('X-Branch-Id', 'branch1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
EOF

# Step 6: Run health check
echo "🏥 Running health check..."
cd "$API_DIR"
if bun run test:e2e --testPathPattern="health"; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. There may be an issue with the test setup."
    exit 1
fi

# Step 7: Run all tests
echo ""
echo "🧪 Running all tests..."
"$SCRIPT_DIR/run-all-tests.sh"