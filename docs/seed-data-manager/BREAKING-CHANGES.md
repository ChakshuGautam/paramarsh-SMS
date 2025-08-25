# Breaking Changes: seed-data-manager v2.0 → v3.0

## Overview

This document details all breaking changes when migrating from seed-data-manager v2.0 to v3.0. These changes are necessary to achieve the architectural improvements but require careful migration planning.

## Critical Breaking Changes

### 1. Database Tool Dependencies

#### v2.0 (MCP PostgreSQL Tools)
```typescript
// ❌ OLD - No longer supported
await mcp__postgresql__query({
  query: "SELECT * FROM Student WHERE branchId = 'dps-main'"
});

await mcp__postgresql__create_record({
  table: "Student",
  data: { firstName: "Arjun", branchId: "dps-main" }
});
```

#### v3.0 (Prisma Native)
```typescript
// ✅ NEW - Prisma Client methods
await prisma.student.findMany({
  where: { branchId: 'dps-main' }
});

await prisma.student.create({
  data: { firstName: "Arjun", branchId: "dps-main" }
});
```

**Migration Impact**: 
- All MCP tool calls must be replaced
- Database connection now managed by Prisma
- No direct SQL queries allowed

**Migration Strategy**:
1. Search for all `mcp__postgresql__` calls
2. Replace with equivalent Prisma Client methods
3. Update error handling for Prisma exceptions

### 2. File Structure Changes

#### v2.0 Structure
```
apps/api/
├── prisma/
│   ├── seed.ts         # Main seed file (1165 lines)
│   ├── seed-*.ts       # Various seed scripts
│   └── validate-seed-data.ts
```

#### v3.0 Structure
```
apps/api/
├── prisma/
│   └── schema.prisma   # Schema only
├── src/seed/           # New location
│   ├── core/
│   ├── seeders/
│   ├── generators/
│   ├── validators/
│   └── cli/
```

**Migration Impact**:
- Seed code moved from `prisma/` to `src/seed/`
- Monolithic file split into modules
- Import paths changed

**Migration Strategy**:
1. Create new directory structure
2. Extract code into appropriate modules
3. Update all import statements
4. Update npm scripts to new paths

### 3. Command Line Interface

#### v2.0 Commands
```bash
# Old commands
bun run db:seed
bun run seed:validate:mcp
bun run db:health:mcp
```

#### v3.0 Commands
```bash
# New commands with parameters
bun run seed all dps-main
bun run seed modules Student,Guardian dps-main
bun run seed demo --years 3 --parallel
bun run seed validate dps-main
bun run seed clean dps-main --force
```

**Migration Impact**:
- Commands now require explicit parameters
- Different command structure
- New options and flags

**Migration Strategy**:
1. Update package.json scripts
2. Document new command syntax
3. Update CI/CD pipelines
4. Train team on new commands

### 4. Configuration Format

#### v2.0 Configuration
```typescript
// Hardcoded in seed.ts
const BRANCHES = ['dps-main', 'kvs-central', ...];
const STUDENT_COUNT = 500;
const INDIAN_NAMES = [...];
```

#### v3.0 Configuration
```typescript
// Modular configuration files
export const seedConfig: SeedConfig = {
  entities: {
    Student: {
      baseCount: 100,
      priority: 10,
      dependencies: ['Class', 'Section']
    }
  },
  branches: [...],
  performance: {...}
};
```

**Migration Impact**:
- Configuration externalized
- New configuration schema
- Per-entity configuration

**Migration Strategy**:
1. Extract hardcoded values
2. Create configuration files
3. Implement config validation
4. Document configuration options

### 5. Error Handling

#### v2.0 Error Handling
```typescript
// Silent failures or console.log
try {
  await mcp__postgresql__query({...});
} catch (error) {
  console.log('Error:', error);
}
```

#### v3.0 Error Handling
```typescript
// Structured error handling with events
orchestrator.on('error', (error: ErrorEvent) => {
  logger.error({
    entity: error.entity,
    phase: error.phase,
    message: error.message,
    stack: error.stack
  });
  
  // Recovery mechanism
  if (error.recoverable) {
    await checkpoint.restore();
  }
});
```

**Migration Impact**:
- New error event system
- Structured error objects
- Recovery mechanisms

**Migration Strategy**:
1. Implement error event handlers
2. Add structured logging
3. Set up recovery procedures
4. Test error scenarios

## API Breaking Changes

### Entity Seeder Interface

#### v2.0 (Function-based)
```typescript
async function seedStudents(branchId: string) {
  // Direct database calls
  const students = generateStudents();
  for (const student of students) {
    await mcp__postgresql__create_record({...});
  }
}
```

#### v3.0 (Class-based)
```typescript
class StudentSeeder extends PrismaSeeder<StudentCreateInput> {
  generate(options: GenerateOptions): StudentCreateInput[] {...}
  async seed(data: StudentCreateInput[], context: SeedContext): Promise<SeedResult> {...}
  async validate(context: SeedContext): Promise<ValidationResult> {...}
  async verify(context: SeedContext): Promise<VerificationResult> {...}
}
```

**Changes**:
- Function → Class architecture
- Standardized interface
- Lifecycle methods (validate, generate, seed, verify)
- Context-aware operations

### Data Generation

#### v2.0
```typescript
// Inline generation
const student = {
  firstName: INDIAN_NAMES[Math.random() * INDIAN_NAMES.length],
  branchId: 'dps-main',
  // ... other fields
};
```

#### v3.0
```typescript
// Generator classes
const generator = new IndianNamesGenerator();
const student = {
  ...generator.generateStudent(),
  branchId: context.branchId,
  academicYearId: context.academicYearId
};
```

**Changes**:
- Extracted generator classes
- Context-aware generation
- Configurable variations
- Testable generators

### Transaction Handling

#### v2.0
```typescript
// No transaction support
await mcp__postgresql__create_record({...});
await mcp__postgresql__create_record({...});
// If second fails, first is not rolled back
```

#### v3.0
```typescript
// Full transaction support
await prisma.$transaction(async (tx) => {
  await tx.student.createMany({...});
  await tx.guardian.createMany({...});
  // All or nothing
});
```

**Changes**:
- Atomic operations
- Rollback capability
- Isolation levels
- Checkpoint system

## Behavioral Breaking Changes

### 1. Execution Order

**v2.0**: Sequential, hardcoded order
**v3.0**: Dependency-based topological sort

**Impact**: Entities may seed in different order

### 2. Data Validation

**v2.0**: Post-seed validation only
**v3.0**: Pre-seed, during, and post-seed validation

**Impact**: Seeding may fail earlier with validation errors

### 3. Performance Characteristics

**v2.0**: Sequential execution only
**v3.0**: Parallel branch seeding available

**Impact**: Different resource usage patterns

### 4. Data Persistence

**v2.0**: Direct database writes
**v3.0**: Batched operations with transactions

**Impact**: Different timing and atomicity

## Removed Features

### 1. MCP PostgreSQL Server Tools
- `mcp__postgresql__query`
- `mcp__postgresql__create_record`
- `mcp__postgresql__read_records`
- `mcp__postgresql__update_records`
- `mcp__postgresql__delete_records`

**Replacement**: Prisma Client methods

### 2. Direct SQL Execution
- No raw SQL queries
- No psql command line usage

**Replacement**: Prisma query builder

### 3. Monolithic Seed Script
- Single seed.ts file approach

**Replacement**: Modular seeder classes

## New Required Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "commander": "^11.0.0",
    "cli-progress": "^3.12.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "jest-mock-extended": "^3.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### System Requirements
- Node.js 18+ (was 16+)
- TypeScript 5+ (was 4+)
- Prisma CLI installed globally

## Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Document current seed data counts
- [ ] Export current configuration
- [ ] Review breaking changes with team

### During Migration
- [ ] Create new directory structure
- [ ] Install new dependencies
- [ ] Migrate configuration
- [ ] Create seeder classes
- [ ] Update import paths
- [ ] Implement error handlers
- [ ] Update npm scripts
- [ ] Add tests

### Post-Migration
- [ ] Run validation suite
- [ ] Compare data counts
- [ ] Performance benchmarks
- [ ] Update documentation
- [ ] Train team
- [ ] Update CI/CD

## Compatibility Mode

During migration, you can run both versions in parallel:

```json
{
  "scripts": {
    "seed:v2": "bun run prisma/seed.ts",
    "seed:v3": "tsx src/seed/cli/index.ts",
    "seed:compare": "npm run seed:v2 && npm run seed:v3 && npm run compare-results"
  }
}
```

## Rollback Procedure

If issues occur:

### Immediate Rollback
```bash
# Restore v2.0 files
git checkout v2.0 -- apps/api/prisma/seed.ts
git checkout v2.0 -- apps/api/package.json

# Clean v3.0 files
rm -rf apps/api/src/seed

# Reinstall dependencies
bun install

# Test v2.0 seed
bun run db:seed
```

### Data Recovery
```bash
# If data corruption occurs
bun run prisma migrate reset
bun run db:seed  # Run v2.0 seed
```

## Support Resources

### Documentation
- [Migration Guide](./MIGRATION-GUIDE.md)
- [Implementation Spec](./V3-IMPLEMENTATION-SPEC.md)
- [Architecture Analysis](./ARCHITECTURE-ANALYSIS.md)

### Examples
- [Example Seeder](../examples/student.seeder.example.ts)
- [Example Tests](../examples/seeder.test.example.ts)
- [Example Config](../examples/seed.config.example.ts)

### Migration Scripts
```bash
# Automated migration helper
npx seed-migrator analyze    # Analyze current code
npx seed-migrator prepare    # Prepare migration
npx seed-migrator migrate    # Execute migration
npx seed-migrator validate   # Validate results
```

## Common Migration Issues

### Issue 1: Import Errors
**Symptom**: Cannot find module errors
**Solution**: Update all import paths to new structure

### Issue 2: Type Errors
**Symptom**: TypeScript compilation fails
**Solution**: Use Prisma generated types

### Issue 3: Transaction Failures
**Symptom**: Database locks or timeouts
**Solution**: Adjust transaction settings and batch sizes

### Issue 4: Memory Issues
**Symptom**: Out of memory errors
**Solution**: Reduce batch sizes, enable streaming

### Issue 5: Performance Regression
**Symptom**: Slower seed times
**Solution**: Enable parallel processing, optimize queries

## Questions & Support

For migration support:
1. Check this document first
2. Review example implementations
3. Consult the migration guide
4. Contact the development team

---

*Document Version: 1.0.0*
*Last Updated: 2025-08-24*
*Breaking Changes Count: 15 major, 23 minor*