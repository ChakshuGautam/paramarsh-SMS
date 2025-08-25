# PostgreSQL MCP Server Validation Guide

## Overview

This guide documents the complete migration to PostgreSQL MCP (Model Context Protocol) Server tools for all database operations in the Paramarsh SMS system. The migration ensures consistent, automated, and secure database access without direct command-line tool dependencies.

## 🚨 CRITICAL REQUIREMENT

**ALL database operations MUST use PostgreSQL MCP Server tools exclusively. NEVER use:**
- `psql` command-line tool
- `pg_dump` direct commands
- Raw SQL string execution via bash
- Direct database connections outside MCP framework

## Available MCP PostgreSQL Server Tools

### Core Database Operations
- `mcp__MCP_PostgreSQL_Server__db_info()` - Database connection and status
- `mcp__MCP_PostgreSQL_Server__list_tables()` - Get all table names
- `mcp__MCP_PostgreSQL_Server__query(params)` - Execute SELECT queries
- `mcp__MCP_PostgreSQL_Server__get_table_schema(params)` - Get table structure

### Data Manipulation
- `mcp__MCP_PostgreSQL_Server__create_record(params)` - Insert single records
- `mcp__MCP_PostgreSQL_Server__read_records(params)` - Read with conditions/filters  
- `mcp__MCP_PostgreSQL_Server__update_records(params)` - Update existing records
- `mcp__MCP_PostgreSQL_Server__delete_records(params)` - Delete with conditions

## Updated Validation Scripts

### 1. Primary MCP Validation Script
```bash
# New MCP-based validation
bun run seed:validate:mcp
# Or directly:
tsx scripts/validate-seed-data-mcp-full.ts
```

**File**: `scripts/validate-seed-data-mcp-full.ts`
- ✅ Pure MCP PostgreSQL Server tools
- ✅ Comprehensive Indian contextual validation
- ✅ Multi-tenancy compliance checking
- ✅ Referential integrity validation
- ✅ Automated report generation

### 2. Shell-based MCP Validation
```bash
# Shell wrapper for comprehensive validation
bun run seed:validate:shell
# Or directly:
./scripts/validate-seed-mcp.sh
```

**File**: `scripts/validate-seed-mcp.sh`
- ✅ No direct psql commands
- ✅ Multi-method validation approach
- ✅ Colorized output and progress tracking
- ✅ Health score calculation

### 3. Pure MCP Validation (Recommended)
```bash
# Cleanest MCP-only implementation
tsx scripts/validate-seed-data-mcp-pure.ts
```

**File**: `scripts/validate-seed-data-mcp-pure.ts`
- ✅ Zero direct database dependencies
- ✅ Pure MCP tool usage
- ✅ Enhanced error handling
- ✅ Production-ready validation

## Updated Statistics Generation

### MCP-Based Database Statistics
```bash
# Generate comprehensive database stats via MCP
bun run seed:stats:mcp
# Or:
bun run db:stats:mcp
```

**File**: `scripts/generate-seed-stats-mcp.ts`
- ✅ Table analysis via MCP tools
- ✅ Data quality metrics
- ✅ Branch distribution analysis
- ✅ Health score calculation
- ✅ CSV and JSON report export

## Package.json Script Updates

### New MCP-Based Scripts
```json
{
  "scripts": {
    // MCP Validation Scripts
    "seed:validate:mcp": "tsx scripts/validate-seed-data-mcp-full.ts",
    "seed:validate:shell": "./scripts/validate-seed-mcp.sh",
    
    // MCP Statistics Scripts  
    "seed:stats:mcp": "tsx scripts/generate-seed-stats-mcp.ts",
    
    // MCP Health Checks
    "db:health:mcp": "tsx scripts/validate-seed-data-mcp-full.ts",
    "db:stats:mcp": "tsx scripts/generate-seed-stats-mcp.ts"
  }
}
```

### Legacy Scripts (Still Available)
```json
{
  "scripts": {
    // Legacy validation (uses Prisma/direct DB)
    "seed:validate": "tsx scripts/validate-seed-data.ts",
    "db:health": "tsx scripts/validate-seed-data.ts"
  }
}
```

## MCP Helper Utilities

### Updated MCP Helpers
**File**: `src/utils/mcp-helpers.ts`

Key functions now use actual MCP calls instead of simulation:

```typescript
// Database connection check
export async function checkDatabaseStatus(): Promise<any> {
  return await mcp__MCP_PostgreSQL_Server__db_info();
}

// Table listing
export async function listAllTables(): Promise<string[]> {
  const result = await mcp__MCP_PostgreSQL_Server__list_tables();
  return result.tables;
}

// Query execution
export async function executeQuery(query: string, values?: any[]): Promise<MCPQueryResult> {
  const result = await mcp__MCP_PostgreSQL_Server__query({ query, values });
  return {
    rows: result.rows,
    columns: result.columns,
    rowsAffected: result.rowCount
  };
}
```

## Validation Features

### 1. Entity Count Validation
```typescript
const MIN_REQUIREMENTS = {
  Student: 500,
  Teacher: 30,
  Guardian: 800,
  Staff: 40,
  Class: 10,
  // ... more entities
};
```

### 2. Indian Context Validation
- ✅ Hindi subject presence check
- ✅ Indian names validation (Aarav, Saanvi, Sharma, Gupta, etc.)
- ✅ Indian phone number format (+91-XXXXXXXXXX)
- ✅ Indian city/address validation

### 3. Multi-tenancy Validation
- ✅ Branch ID presence in all core entities
- ✅ Orphaned record detection
- ✅ Cross-branch data isolation verification

### 4. Referential Integrity Validation
- ✅ Student-Guardian relationships
- ✅ Enrollment-Student-Section links
- ✅ Teacher-Staff associations
- ✅ Invoice-Payment chains

### 5. Data Quality Metrics
- ✅ Gender distribution analysis
- ✅ Fee collection rate calculation
- ✅ Teacher-student ratio validation
- ✅ Attendance rate analysis

## Report Generation

### Validation Reports
All MCP validation scripts generate comprehensive reports:

```
📊 ENTITY COUNT VALIDATION
─────────────────────────────────────────────
Entity                    | Status | Count | Required
─────────────────────────────────────────────
Student                   | ✅ PASS | 1247  | 500
Guardian                  | ✅ PASS | 1995  | 800
Teacher                   | ✅ PASS | 45    | 30
...

🔗 REFERENTIAL INTEGRITY CHECK
─────────────────────────────────────────────
Relationship                              | Status
─────────────────────────────────────────────
StudentGuardian → Student/Guardian        | ✅ PASS
Enrollment → Student/Section              | ✅ PASS
...

🇮🇳 INDIAN CONTEXT VALIDATION
─────────────────────────────────────────────
Context Element               | Status | Details
─────────────────────────────────────────────
Subject.Hindi                | ✅ PASS | Found
Student.IndianNames          | ✅ PASS | 89%
Guardian.IndianPhones        | ✅ PASS | 94%
...
```

### Report Files
Reports are automatically saved to:
- `reports/seed-validation-mcp-{date}.json` - Detailed JSON report
- `reports/database-stats-mcp-{date}.json` - Statistics JSON report
- `reports/database-stats-mcp-{date}.csv` - Statistics CSV export

## Migration Benefits

### 🔒 Enhanced Security
- No direct database command execution
- Standardized parameter validation
- Consistent error handling

### 🚀 Better Automation
- Framework-agnostic database operations
- Consistent cross-platform behavior
- Reduced external dependencies

### 📊 Improved Monitoring
- Standardized operation logging
- Enhanced error reporting
- Comprehensive audit trails

### 🛠️ Simplified Maintenance
- Single point of database operation logic
- Easier testing and mocking
- Consistent API across all operations

## Usage Examples

### Basic Validation
```bash
# Run comprehensive MCP validation
cd apps/api
bun run seed:validate:mcp

# Expected output:
# 🚀 Starting Paramarsh SMS seed data validation (MCP)...
# 🏥 Database connected: {...}
# 🔍 Validating entity counts using MCP tools...
# ...
# 🎉 Pure MCP validation completed with health score: 94%
```

### Statistics Generation
```bash
# Generate detailed database statistics
cd apps/api  
bun run seed:stats:mcp

# Expected output:
# 📊 GENERATING DATABASE STATISTICS (MCP VERSION)
# 🏥 Connected to database: {...}
# 📋 Found 42 tables
# ...
# 💾 Statistics report saved to: reports/database-stats-mcp-2024-08-22.json
```

### Health Check
```bash
# Quick health check via MCP
cd apps/api
bun run db:health:mcp

# Expected output:
# 📍 Target Branch: branch1
# ✅ Database connected
# 🔍 Validating entity counts...
# 🏆 Overall health score: 96%
```

## Troubleshooting

### Common Issues

1. **MCP Connection Errors**
   ```
   Error: Database status check failed: connection refused
   ```
   - Ensure PostgreSQL MCP Server is running
   - Check MCP server configuration
   - Verify database connection parameters

2. **Missing Tables**
   ```
   Error: relation "Student" does not exist
   ```
   - Run database migrations: `npx prisma migrate dev`
   - Seed database: `bun run seed`
   - Verify schema is up to date

3. **Permission Errors**
   ```
   Error: permission denied for table "Student"
   ```
   - Check database user permissions
   - Verify MCP server has appropriate database access
   - Review connection string credentials

### Verification Commands
```bash
# Verify all MCP scripts are working
cd apps/api

# Test basic validation
tsx scripts/validate-seed-data-mcp-pure.ts

# Test statistics generation
tsx scripts/generate-seed-stats-mcp.ts

# Test shell wrapper
./scripts/validate-seed-mcp.sh
```

## Best Practices

### 1. Always Use MCP Tools
```typescript
// ✅ CORRECT - Use MCP tools
const result = await mcp__MCP_PostgreSQL_Server__query({
  query: "SELECT COUNT(*) FROM Student WHERE branchId = $1",
  values: ['branch1']
});

// ❌ WRONG - Never use direct psql
const result = execSync('psql -c "SELECT COUNT(*) FROM Student"');
```

### 2. Proper Error Handling
```typescript
try {
  const result = await mcp__MCP_PostgreSQL_Server__query({ query });
  return result.rows;
} catch (error) {
  console.error(`MCP query failed: ${error.message}`);
  throw new Error(`Database operation failed: ${error.message}`);
}
```

### 3. Consistent Parameter Usage
```typescript
// Always use parameterized queries
const result = await mcp__MCP_PostgreSQL_Server__query({
  query: "SELECT * FROM Student WHERE branchId = $1 AND status = $2",
  values: [branchId, 'active']
});
```

### 4. Report Generation
```typescript
// Always save comprehensive reports
await saveValidationReport({
  timestamp: new Date().toISOString(),
  database: 'postgresql',
  branchId: BRANCH_ID,
  // ... full report structure
});
```

## Future Enhancements

### Planned Improvements
1. **Real-time Validation Dashboard** - Web interface for validation results
2. **Automated Health Monitoring** - Scheduled validation runs
3. **Performance Benchmarking** - Database performance via MCP tools
4. **Data Migration Tools** - MCP-based data transfer utilities

### Integration Opportunities  
1. **CI/CD Pipeline Integration** - Automated validation in deployment
2. **Monitoring System Integration** - Health metrics to monitoring tools
3. **Backup Verification** - MCP-based backup integrity checks
4. **Load Testing Support** - MCP tools for performance testing

## Conclusion

The migration to PostgreSQL MCP Server tools provides a robust, secure, and maintainable foundation for all database operations in Paramarsh SMS. This approach eliminates direct database dependencies while maintaining full functionality and adding enhanced monitoring capabilities.

All validation scripts now operate through the MCP framework, ensuring consistent behavior across all environments and simplifying maintenance and troubleshooting.