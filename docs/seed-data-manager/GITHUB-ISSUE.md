# GitHub Issue: Migrate seed-data-manager from v2.0 to v3.0 (Critical: Data Not Persisting)

## 🚨 Priority: CRITICAL

## Summary
The current seed-data-manager v2.0 is failing to persist any data to the database (0 records for all entities). We need to migrate to a new v3.0 architecture that is Prisma-native, modular, testable, and supports multi-branch/multi-year seeding.

## Current State (v2.0) - BROKEN
- **Health Score**: 15/100 ❌
- **All entity counts**: 0 (seed not persisting data)
- **Architecture**: Monolithic 1,165-line file using MCP PostgreSQL tools
- **Test Coverage**: 0%
- **Observability**: None
- **Recovery**: None

## Target State (v3.0)
- **100% Prisma-native** (no MCP dependencies)
- **Modular architecture** with individual entity seeders
- **90%+ test coverage** with Jest
- **Observable execution** with real-time progress
- **Multi-branch support** for 13 composite branches
- **Historical data** generation (1-5 years)

## Problem Statement

### Critical Issues
1. **Data Not Persisting**: Validation report shows 0 records for all entities
2. **MCP Dependency**: Tightly coupled to MCP PostgreSQL tools
3. **Monolithic Design**: Single 1,165-line file impossible to maintain
4. **No Testing**: 0% test coverage, changes break silently
5. **No Observability**: Black-box execution, can't debug failures
6. **No Recovery**: Must restart from beginning on any failure

### Business Impact
- Cannot demo the system (no data)
- Cannot test features (no seed data)
- Development blocked without reliable test data
- Multi-tenant features cannot be validated

## Proposed Solution

### Architecture Changes
```
FROM: apps/api/prisma/seed.ts (monolithic)
TO:   apps/api/src/seed/ (modular)
      ├── core/           # Framework
      ├── seeders/        # Entity seeders
      ├── generators/     # Data generators
      └── __tests__/      # Comprehensive tests
```

### Key Improvements
1. **Prisma-Native Operations**
   ```typescript
   // Before (v2.0)
   await mcp__postgresql__create_record({...})
   
   // After (v3.0)
   await prisma.student.createMany({...})
   ```

2. **Modular Seeders**
   ```typescript
   class StudentSeeder extends PrismaSeeder {
     generate(): StudentCreateInput[]
     seed(): Promise<SeedResult>
     validate(): Promise<ValidationResult>
   }
   ```

3. **Observable Execution**
   ```typescript
   orchestrator.on('progress', (data) => {
     console.log(`${data.entity}: ${data.percentage}%`)
   })
   ```

4. **Multi-Branch Support**
   ```typescript
   await multiBranch.seedAllBranches({
     branches: 13,
     yearsOfHistory: 3,
     parallel: true
   })
   ```

## Implementation Plan

### Timeline: 4 Weeks

#### Week 1: Foundation (Jan 27-31)
- [ ] Set up project structure
- [ ] Implement core framework
- [ ] Create base seeder classes
- [ ] Build orchestrator

#### Week 2: Migration (Feb 3-7)
- [ ] Migrate entity seeders
- [ ] Implement generators
- [ ] Add multi-branch support
- [ ] Create validators

#### Week 3: Testing (Feb 10-14)
- [ ] Unit tests (90% coverage)
- [ ] Integration tests
- [ ] Performance testing
- [ ] Bug fixes

#### Week 4: Deployment (Feb 17-21)
- [ ] Documentation
- [ ] Training
- [ ] Staging deployment
- [ ] Production rollout

## Acceptance Criteria

### Functional Requirements
- [ ] All 13 branches seed successfully
- [ ] Minimum 500 students per branch created
- [ ] All relationships properly established
- [ ] Indian context data (names, addresses, phone numbers)
- [ ] Multi-year historical data generated

### Technical Requirements
- [ ] 100% Prisma-native (no MCP tools)
- [ ] 90%+ test coverage
- [ ] < 3 minutes to seed all branches
- [ ] < 512MB memory usage
- [ ] Full transaction support
- [ ] Checkpoint/recovery system

### Quality Gates
- [ ] All tests passing
- [ ] Code review approved
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Zero data integrity issues

## Breaking Changes

### Major Changes
1. **Database Operations**: MCP tools → Prisma Client
2. **File Location**: `prisma/seed.ts` → `src/seed/`
3. **CLI Commands**: New parameter-based commands
4. **Configuration**: External config files
5. **Error Handling**: Event-based system

### Migration Required
- Update all npm scripts
- Retrain team on new CLI
- Update CI/CD pipelines
- Backup existing data

## Resources Required

### Team
- Technical Lead (1)
- Backend Developers (2)
- QA Engineer (1)
- DevOps Engineer (0.5)
- **Total**: 4.5 FTE for 4 weeks

### Dependencies
```json
{
  "@prisma/client": "^5.0.0",
  "commander": "^11.0.0",
  "cli-progress": "^3.12.0",
  "chalk": "^5.3.0",
  "jest": "^29.0.0",
  "jest-mock-extended": "^3.0.0"
}
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss | Low | High | Comprehensive backups |
| Breaking changes | High | Medium | Extensive testing |
| Performance issues | Medium | Medium | Continuous benchmarking |
| Schedule slip | Medium | Medium | Parallel workstreams |

## Documentation

Comprehensive documentation has been prepared:
- [Migration Guide](./docs/seed-data-manager/MIGRATION-GUIDE.md)
- [Architecture Analysis](./docs/seed-data-manager/ARCHITECTURE-ANALYSIS.md)
- [Implementation Spec](./docs/seed-data-manager/V3-IMPLEMENTATION-SPEC.md)
- [Breaking Changes](./docs/seed-data-manager/BREAKING-CHANGES.md)
- [Implementation Roadmap](./docs/seed-data-manager/IMPLEMENTATION-ROADMAP.md)

## Success Metrics

### Technical Metrics
- ✅ Data persistence working (>0 records)
- ✅ 90%+ test coverage achieved
- ✅ All 13 branches seeding successfully
- ✅ < 3 minute full demo seed time
- ✅ Zero data integrity issues

### Business Metrics
- ✅ Demo data available for all features
- ✅ Multi-tenant scenarios testable
- ✅ Development unblocked
- ✅ System demoable to stakeholders

## Labels
- `critical`
- `bug`
- `enhancement`
- `architecture`
- `migration`
- `seed-data`
- `multi-tenant`

## Assignees
- Technical Lead: @[lead]
- Backend Dev 1: @[dev1]
- Backend Dev 2: @[dev2]
- QA Engineer: @[qa]

## Milestone
- v3.0 Migration (Q1 2025)

## Related Issues
- #[issue] Current seed data not persisting
- #[issue] Multi-tenant support needed
- #[issue] Test data generation improvements

## Comments

### Initial Analysis
The current v2.0 seed-data-manager is completely broken - validation reports show 0 records for all entities. This is blocking development and testing. The proposed v3.0 architecture addresses all critical issues while adding essential features like multi-branch support and historical data generation.

### Next Steps
1. Team kickoff meeting scheduled for Jan 27
2. Development environment setup
3. Begin Week 1 implementation

---

**Created**: 2025-08-24
**Target Completion**: 2025-02-21
**Duration**: 4 weeks
**Team Size**: 4.5 FTE