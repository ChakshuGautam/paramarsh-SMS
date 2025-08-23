# 🛠️ Paramarsh SMS - Automation Scripts

This directory contains automation scripts that handle testing, validation, and server management without requiring human intervention.

## 📋 Available Scripts

### 🚀 Server Management

#### `start-backend.sh`
Starts the backend server on port 8080 (default).
- Kills any existing process on port 8080
- Starts the backend in the background
- Waits for server to be ready
- Creates a PID file for tracking

```bash
./scripts/start-backend.sh
```

#### `stop-backend.sh`
Stops the backend server.
- Uses PID file if available
- Falls back to killing process on port 8080

```bash
./scripts/stop-backend.sh
```

### 🧪 Testing Scripts

#### `auto-test-all.sh` (MAIN AUTOMATION)
**The master automation script** - handles everything automatically:
- Sets up environment (port 8080)
- Migrates and seeds database
- Starts backend server
- Finds all entities
- Fixes common test issues
- Runs all tests
- Generates comprehensive report

```bash
./scripts/auto-test-all.sh
```

#### `run-all-tests.sh`
Runs all E2E tests systematically:
- Ensures backend is running
- Seeds database if needed
- Runs each test file individually
- Generates summary report

```bash
./scripts/run-all-tests.sh
```

#### `test-entity.sh`
Tests a specific entity:
- Ensures backend is running
- Runs E2E tests for the specified entity

```bash
./scripts/test-entity.sh students
./scripts/test-entity.sh guardians
```

#### `fix-and-test.sh`
Automatically fixes common test issues before running tests:
- Fixes import statements
- Corrects field names (branchId vs schoolId)
- Updates test configuration
- Creates health check test
- Runs all tests

```bash
./scripts/fix-and-test.sh
```

### ✅ Validation Scripts

#### `validate-implementation.sh`
Comprehensive validation using E2E tests (replaces old CURL-based validation):
- Checks module files exist
- Verifies module registration
- Runs E2E tests
- Validates React Admin compliance
- Tests multi-tenancy

```bash
# Validate specific entity
./scripts/validate-implementation.sh students

# Validate all entities
./scripts/validate-implementation.sh
```

#### `validate-api.sh` (DEPRECATED)
Old validation script using CURL - replaced by `validate-implementation.sh`.
**Use E2E tests instead of CURL for validation.**

#### `validate-api-v2.sh`
Enhanced validation script that checks all entities at once.

```bash
./scripts/validate-api-v2.sh
```

## 🤖 For AI Agents (Claude/test-writer)

When implementing or testing, use these scripts in this order:

1. **Initial Setup**:
   ```bash
   ./scripts/auto-test-all.sh
   ```
   This handles everything automatically.

2. **For Specific Entity Testing**:
   ```bash
   ./scripts/test-entity.sh [entity-name]
   ```

3. **For Validation**:
   ```bash
   ./scripts/validate-implementation.sh [entity-name]
   ```

## 📝 Important Notes

- **Port 8080 is the default** - configured in package.json and main.ts
- **No need to specify PORT** environment variable anymore
- **All scripts are idempotent** - safe to run multiple times
- **Scripts handle setup automatically** - database, migrations, seeding
- **Use E2E tests, not CURL** - more comprehensive and reliable

## 🔧 Configuration

The scripts assume:
- Backend runs on port 8080 (default)
- Database is SQLite at `apps/api/prisma/dev.db`
- Seed data uses 'branch1' as primary tenant
- Tests use supertest and Jest

## 🐛 Troubleshooting

If tests fail:
1. Check backend is running: `curl http://localhost:8080/api/v1/students`
2. Check database is seeded: `cd apps/api && npx prisma db seed`
3. Check logs: `scripts/auto-test.log`
4. Kill stuck processes: `lsof -ti:8080 | xargs kill -9`

## 🎯 Best Practices

1. **Always use scripts** instead of manual commands
2. **Run auto-test-all.sh** for comprehensive testing
3. **Check logs** when tests fail
4. **Use E2E tests** instead of CURL for validation
5. **Keep backend running** during development