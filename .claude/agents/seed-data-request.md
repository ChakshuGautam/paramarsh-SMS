# Seed Data Generation Request for seed-data-manager Agent

## Task Requirements
Generate comprehensive seed data for the Paramarsh SMS system following CLAUDE.md specifications.

## Critical Requirements from CLAUDE.md:
1. **13 Branches with Composite IDs**: All branch IDs must follow the composite format:
   - Delhi Public School (dps): dps-main, dps-north, dps-south, dps-east, dps-west
   - Kendriya Vidyalaya (kvs): kvs-central, kvs-cantonment, kvs-airport
   - St. Paul's School (sps): sps-primary, sps-secondary, sps-senior
   - Ryan International School (ris): ris-main, ris-extension

2. **Indian Context Requirements**:
   - Authentic Indian names from various regions
   - Phone numbers with +91 country code format
   - Regional Indian addresses (Mumbai, Delhi, Bangalore, Chennai, Kolkata)
   - Indian education system context (CBSE/ICSE/State boards)

3. **Data Volume Requirements**:
   - Minimum 500+ students per branch (total 6,500+ across all branches)
   - Proper student-teacher ratios (1:30 max)
   - 2 guardians per student average
   - Complete academic structure (classes, sections, subjects)

4. **Relationship Requirements**:
   - Students ↔ Guardians ↔ Enrollments
   - Proper class-section assignments
   - Age-appropriate grade levels
   - Multi-tenant isolation via branchId

5. **Database Operation Requirements**:
   - Use ONLY PostgreSQL MCP Server tools (NEVER psql command line)
   - Validate data persistence after seeding
   - Generate comprehensive validation report
   - Ensure complete referential integrity

## Current Database State:
- Database is migrated and ready for seeding
- Seed file exists at apps/api/prisma/seed.ts
- No data currently exists (fresh database)

## Expected Deliverables:
1. Complete seed data for all 13 branches
2. Validation report showing data distribution
3. Confirmation of proper multi-tenant isolation
4. Performance metrics and completion status

## Validation Success Criteria:
- Zero empty tables after seeding
- All 13 branches have proper tenant records
- Minimum student counts met per branch
- All relationships properly established
- Indian cultural context maintained throughout

Please proceed with comprehensive seed data generation using the established seed-data-manager protocols.