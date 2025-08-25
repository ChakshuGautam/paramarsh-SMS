# PostgreSQL Validation Guide for Paramarsh SMS

This guide provides comprehensive instructions for validating ALL 45 tables in the PostgreSQL database with proper multi-tenancy support.

## 🚨 Important: This System Uses PostgreSQL with Docker

The Paramarsh SMS system is designed to work with PostgreSQL in Docker containers. The validation scripts check all 45 schema tables and ensure proper multi-tenant data isolation.

## 🏗️ Architecture Overview

- **Database**: PostgreSQL 15 (Docker container)
- **Tables**: 45 comprehensive schema tables
- **Multi-tenancy**: 13 composite branch IDs (dps-main, kvs-central, etc.)
- **Validation**: Prisma-based with comprehensive integrity checks

## 📋 Complete 45-Table List (Validated)

### Core Academic (8 tables)
1. **AcademicYear** - Academic year definitions per branch
2. **Class** - Grade levels and class structure
3. **Section** - Class sections with capacity
4. **Subject** - Subjects with Hindi context
5. **Student** - Student records with Indian names
6. **Teacher** - Teacher profiles with qualifications
7. **Staff** - Staff records linked to teachers
8. **Enrollment** - Student-section relationships

### Relationships & Guardian (2 tables)
9. **Guardian** - Parent/guardian information
10. **StudentGuardian** - Student-guardian relationships

### Timetabling & Scheduling (8 tables)
11. **Room** - Classroom and facility management
12. **TimeSlot** - Time periods for timetabling
13. **TimetablePeriod** - Specific period assignments
14. **TimetableTemplate** - Timetable templates
15. **Substitution** - Teacher substitutions
16. **SubjectConstraint** - Subject scheduling rules
17. **TeacherConstraint** - Teacher availability rules
18. **RoomConstraint** - Room usage rules
19. **TimeSlotConstraint** - Time slot restrictions

### Attendance System (4 tables)
20. **AttendanceRecord** - Basic student attendance
21. **AttendanceSession** - Period-based attendance sessions
22. **StudentPeriodAttendance** - Detailed period attendance
23. **TeacherAttendance** - Teacher attendance records
24. **TeacherDailyAttendance** - Daily teacher check-in/out

### Examinations & Marks (5 tables)
25. **Exam** - Examination definitions
26. **ExamSession** - Exam sessions per subject
27. **ExamTemplate** - Exam templates and patterns
28. **Mark** - Comprehensive marks system
29. **MarksEntry** - Detailed marks entry
30. **GradingScale** - Grading scales per branch

### Fee Management (5 tables)
31. **FeeStructure** - Fee structures per class
32. **FeeComponent** - Individual fee components
33. **FeeSchedule** - Fee collection schedules
34. **Invoice** - Student fee invoices
35. **Payment** - Payment records

### Communications (6 tables)
36. **Template** - Message templates
37. **Campaign** - Communication campaigns
38. **Message** - Individual messages
39. **Preference** - User communication preferences
40. **Ticket** - Support ticket system
41. **TicketMessage** - Ticket conversations
42. **TicketAttachment** - Ticket file attachments

### System & Admin (3 tables)
43. **Tenant** - Branch/tenant management (CRITICAL)
44. **Application** - Admission applications
45. **AuditLog** - System audit trail

## 🚀 Quick Start Guide

### 1. Set Up PostgreSQL Environment

```bash
# Automated setup (recommended)
cd apps/api
bun run setup:postgresql

# Manual setup
docker-compose up -d postgres
bun run validate:postgresql
```

### 2. Run Complete Validation

```bash
# Full 45-table validation
bun run validate:postgresql

# Alternative commands
bun run seed:validate:postgresql
tsx scripts/validate-postgresql-seed-data.ts
```

### 3. Check Results

The validation checks:
- ✅ All 45 tables populated with data
- ✅ 13 composite branch IDs present
- ✅ Referential integrity maintained
- ✅ Indian cultural context preserved
- ✅ Multi-tenant data isolation
- ✅ Data quality metrics

## 📊 Validation Report Structure

### Overall Assessment
- **Health Score**: 0-100% based on checks passed
- **Status**: PASS/WARNING/FAIL
- **Critical Issues**: Empty tables flagged as bugs

### Detailed Checks

#### 1. Entity Counts (45 tables)
```
Table                     | Status    | Count    | Required | Notes
--------------------------|-----------|----------|----------|------------------
AcademicYear             | ✅ PASS   |      13  |      13  | Good
Student                  | ✅ PASS   |    1,500 |    1,500 | Good
Teacher                  | ✅ PASS   |      400 |      400 | Good
... (all 45 tables)
```

#### 2. Branch-wise Breakdown
```
Branch ID              | Students | Teachers | Staff | Classes | Sections | Total
-----------------------|----------|----------|-------|---------|----------|-------
dps-main              |      200 |       25 |    30 |      15 |       40 |   310
kvs-central           |      180 |       22 |    28 |      12 |       35 |   277
... (all 13 branches)
```

#### 3. Data Quality Metrics
- Gender distribution (balanced M/F)
- Teacher-student ratio (1:40 max for Indian schools)
- Guardian relationship completeness (>80%)
- Attendance data coverage
- Fee payment ratios

#### 4. Indian Context Validation
- Hindi subject presence ✅
- Composite branch IDs (dps-main, kvs-central, etc.) ✅
- Indian name patterns in students/guardians ✅
- Indian phone number formats (+91) ✅
- Indian city names in addresses ✅

#### 5. Multi-tenancy Validation
- All 13 expected branches exist ✅
- No legacy branch IDs (branch1, branch2) ❌
- All entities have proper branchId ✅
- Data isolation between branches ✅

## 🔧 Troubleshooting

### Common Issues

#### 1. Empty Tables Error
```
❌ CRITICAL: 5 PostgreSQL tables are EMPTY: Student, Teacher, Class...
```
**Solution**: Run seed data generation
```bash
bun run seed
```

#### 2. Connection Refused
```
❌ Failed to connect to PostgreSQL: ECONNREFUSED
```
**Solution**: Start PostgreSQL container
```bash
docker-compose up -d postgres
# Wait 30 seconds for startup
docker-compose exec postgres pg_isready -U paramarsh -d paramarsh_sms
```

#### 3. Schema Mismatch
```
❌ Table 'XYZ' does not exist
```
**Solution**: Switch to PostgreSQL schema and migrate
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
bunx prisma db push
bunx prisma generate
```

#### 4. Missing Composite Branch IDs
```
❌ Missing branches: dps-main, kvs-central...
```
**Solution**: Use seed-data-manager to create proper branches
```bash
# Must use seed-data-manager agent - never manual edits
# The agent creates all 13 composite branch IDs automatically
```

## 📈 Performance & Scalability

### Expected Data Volumes (Production-Ready)
- **Students**: 1,500+ across all branches
- **Teachers**: 400+ with proper qualifications
- **Attendance Records**: 13,000+ with realistic patterns
- **Marks/Exams**: 6,500+ comprehensive assessment data
- **Fee Transactions**: 650+ payments with proper status
- **Communication**: 1,300+ messages and campaigns

### Database Performance
- PostgreSQL optimized for multi-tenant architecture
- Proper indexing on branchId fields
- Foreign key constraints maintained
- Audit logging enabled

## 🎯 Success Criteria

### ✅ Validation Passes When:
1. **All 45 tables** have data (zero empty tables)
2. **Health score** ≥ 85%
3. **All 13 composite branches** exist and populated
4. **Referential integrity** maintained (no orphaned records)
5. **Indian context** preserved (Hindi subject, Indian names, etc.)
6. **Data isolation** working (no cross-branch contamination)

### ⚠️ Warnings Acceptable:
- Data volumes below recommended minimums (but not zero)
- Minor data quality issues (gender ratios, etc.)
- Non-critical referential integrity issues

### ❌ Critical Failures:
- Any empty tables (indicates seed bugs)
- Missing composite branch IDs
- Database connection issues
- Schema mismatches

## 🔄 Development Workflow

### 1. Daily Validation
```bash
# Quick health check
bun run validate:postgresql | grep "FINAL VERDICT"
```

### 2. Pre-deployment Validation
```bash
# Full comprehensive check
bun run validate:postgresql > validation-report.txt
# Review report before deployment
```

### 3. Production Monitoring
```bash
# Automated validation in CI/CD
docker-compose exec api bun run validate:postgresql
# Should exit with code 0 for success
```

## 📝 Configuration

### Environment Variables
```bash
# PostgreSQL connection
DATABASE_URL="postgresql://paramarsh:paramarsh123@localhost:5432/paramarsh_sms?schema=public"

# Multi-tenancy (using composite IDs)
DEFAULT_BRANCH_ID="dps-main"
EXPECTED_BRANCHES="dps-main,dps-north,kvs-central,..."
```

### Docker Compose
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: paramarsh
      POSTGRES_PASSWORD: paramarsh123
      POSTGRES_DB: paramarsh_sms
    ports:
      - "5432:5432"
```

## 🚨 Critical Reminders

1. **ALWAYS use PostgreSQL** - This system is designed for PostgreSQL, not SQLite
2. **NEVER manually edit seed files** - Use seed-data-manager agent only
3. **ALWAYS validate after seeding** - Catch issues early
4. **USE composite branch IDs** - Never use branch1, branch2 format
5. **CHECK all 45 tables** - Missing tables indicate bugs
6. **MAINTAIN referential integrity** - Critical for data consistency

## 📞 Support

If validation fails repeatedly:
1. Check Docker PostgreSQL container logs: `docker-compose logs postgres`
2. Verify network connectivity: `telnet localhost 5432`
3. Test database access: `docker-compose exec postgres psql -U paramarsh -d paramarsh_sms`
4. Review Prisma schema compatibility
5. Use seed-data-manager for data issues

---

**Remember**: The validation system is designed to catch issues before they reach production. A passing validation means your PostgreSQL database is ready for real-world school management operations with proper multi-tenant isolation and comprehensive data integrity.