# MCP PostgreSQL Server Seed Data Management Guide

This guide provides comprehensive instructions for managing seed data in the Paramarsh SMS system using **EXCLUSIVELY** PostgreSQL MCP Server tools. 

## 🚨 Critical Rule: NO psql Command Line Usage

**All database operations MUST use PostgreSQL MCP Server tools. NEVER use psql command-line tool.**

### ❌ FORBIDDEN Approaches:
```bash
# NEVER do this:
psql $DATABASE_URL -c "SELECT * FROM students;"
bun run prisma db execute --sql "INSERT INTO..."
echo "SELECT * FROM students" | psql $DATABASE_URL
```

### ✅ REQUIRED Approach:
```typescript
// Always use MCP tools:
await mcp__MCP_PostgreSQL_Server__query({"query": "SELECT * FROM students WHERE branchId = 'branch1'"});
await mcp__MCP_PostgreSQL_Server__create_record({"table": "students", "data": {...}});
```

## Available MCP PostgreSQL Server Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `mcp__MCP_PostgreSQL_Server__db_info` | Check database status | Connection health, metadata |
| `mcp__MCP_PostgreSQL_Server__list_tables` | List all tables | Schema discovery |
| `mcp__MCP_PostgreSQL_Server__query` | Execute SELECT queries | Complex queries, aggregations |
| `mcp__MCP_PostgreSQL_Server__get_table_schema` | Get table structure | Column info, constraints |
| `mcp__MCP_PostgreSQL_Server__create_record` | Insert single records | Add new data |
| `mcp__MCP_PostgreSQL_Server__read_records` | Read with conditions | Filtered retrieval |
| `mcp__MCP_PostgreSQL_Server__update_records` | Update existing records | Modify data |
| `mcp__MCP_PostgreSQL_Server__delete_records` | Delete records | Remove data |

## Seed Data Management Commands

### NPM Scripts (Updated for MCP)

```bash
# Development Seeds
npm run seed:minimal     # 10 students, basic structure
npm run seed:indian      # Full Indian contextual data (150+ students)
npm run seed:large       # 500+ students for load testing

# Validation & Health Checks
npm run seed:validate:mcp       # Comprehensive MCP-based validation
npm run db:health:mcp          # Quick health check using MCP tools

# Data Export
npm run export:students        # Export students to JSON/CSV
npm run export:teachers        # Export teachers to JSON/CSV
npm run export:all            # Export all entities

# Reports
npm run report:validation     # Generate validation report
npm run report:statistics     # Database statistics
npm run report:health-check   # Comprehensive health report
```

## Validation Framework

### Entity Requirements

The validation system checks these minimum requirements using MCP tools:

| Entity | Minimum Count | Quality Checks |
|--------|---------------|----------------|
| **Students** | 500 | Indian names, gender balance, age distribution |
| **Teachers** | 30 | Qualifications, subject expertise |
| **Guardians** | 800 | Relationships, Indian phone numbers |
| **Classes** | 10 | Nursery to Class 10/12 |
| **Sections** | 20 | Proper capacity, class teachers |
| **Subjects** | 10 | Include Hindi, grade-appropriate |
| **Staff** | 40 | Admin + support roles |
| **Enrollments** | 500 | All students enrolled |
| **Exams** | 40 | Multiple types per class |
| **Invoices** | 100 | Term-wise distribution |
| **Payments** | 60-80% | Realistic collection rate |
| **Attendance** | 5000+ | Daily records, period-wise |
| **Templates** | 10+ | SMS/Email communications |

### Validation Categories

1. **Entity Counts**: Minimum record requirements
2. **Referential Integrity**: No orphaned foreign keys
3. **Indian Context**: Cultural authenticity
4. **Multi-tenancy**: Proper branchId assignment
5. **Data Quality**: Realistic distributions and patterns

### Sample Validation Output

```
===============================================================================
                    PARAMARSH SMS DATA VALIDATION REPORT
                              Generated: 2024-08-22
===============================================================================

🎯 OVERALL ASSESSMENT
────────────────────────────────────────────────────────────────────────────────
Health Score: 96/100
Status: ✅ READY FOR PRODUCTION
Total Checks: 45 | Passed: 43 | Failed: 0 | Warnings: 2

📊 ENTITY COUNT VALIDATION
────────────────────────────────────────────────────────────────────────────────
Entity                    | Status | Count | Required
────────────────────────────────────────────────────────────────────────────────
Students                  | ✅ PASS | 1247  | 500
Teachers                  | ✅ PASS | 45    | 30
Guardians                 | ✅ PASS | 1995  | 800
[... more entities ...]

🔗 REFERENTIAL INTEGRITY CHECK
────────────────────────────────────────────────────────────────────────────────
All relationships validated - No orphaned records found ✅

🇮🇳 INDIAN CONTEXT VALIDATION
────────────────────────────────────────────────────────────────────────────────
✅ Hindi subject present
✅ 98.5% Indian names
✅ Indian phone numbers (+91 format)
✅ Indian addresses and cultural context

🏆 FINAL VERDICT: Database is ready for production demos and load testing!
===============================================================================
```

## MCP Helper Functions

### Core Database Operations

```typescript
import {
  checkDatabaseStatus,
  executeQuery,
  createRecord,
  readRecords,
  clearBranchData,
  MCPSeedDataGenerator
} from '../src/utils/mcp-helpers';

// Check database connectivity
const dbStatus = await checkDatabaseStatus();

// Execute complex queries
const studentCounts = await executeQuery(`
  SELECT 
    classId, 
    COUNT(*) as count 
  FROM Student 
  WHERE branchId = 'branch1' 
  GROUP BY classId
`);

// Create records with proper validation
await createRecord('Student', {
  firstName: 'Arjun',
  lastName: 'Sharma',
  branchId: 'branch1',
  // ... other fields
});

// Read with conditions
const activeStudents = await readRecords('Student', {
  branchId: 'branch1',
  status: 'active'
}, { limit: 50, orderBy: 'firstName' });
```

### Validation Functions

```typescript
import {
  checkEntityCount,
  validateIndianNames,
  checkReferentialIntegrity,
  validateMultiTenancy
} from '../src/utils/mcp-helpers';

// Validate entity counts
const studentValidation = await checkEntityCount('Student', 500);
console.log(studentValidation.status); // 'PASS' | 'FAIL'

// Check Indian names
const nameValidation = await validateIndianNames('Student', 'firstName');
console.log(`${nameValidation.current}% Indian names found`);

// Verify referential integrity
const relationshipCheck = await checkReferentialIntegrity(
  'Student', 'Enrollment', 'studentId'
);

// Validate multi-tenancy
const tenancyCheck = await validateMultiTenancy('Student');
```

### Seed Data Generation

```typescript
import { MCPSeedDataGenerator } from '../src/utils/mcp-helpers';

const generator = new MCPSeedDataGenerator('branch1');

// Generate realistic Indian student data
await generator.generateStudents(500);

// Generate guardians with proper relationships
await generator.generateGuardians(); // 1.6 guardians per student avg

// The generator ensures:
// - Realistic Indian names from various regions
// - Proper age distribution (5-18 years)
// - Cultural authenticity (Hindi names, Indian addresses)
// - Balanced gender distribution
// - Proper guardian relationships
```

## Indian Context Guidelines

### Names Database
The system uses authentic Indian names from various regions:

**Male Names**: Aarav, Arjun, Vivaan, Aditya, Ishaan, Krishna, Sai, Rohan, Vedant, Yash
**Female Names**: Aadhya, Saanvi, Aarohi, Ananya, Diya, Kavya, Navya, Ishani, Bhavya
**Surnames**: Sharma, Verma, Gupta, Kumar, Singh, Reddy, Patel, Shah, Mehta, Joshi

### Cultural Elements
- **Academic Year**: April to March (Indian calendar)
- **Subjects**: Include Hindi, Sanskrit, EVS (Environmental Studies)
- **Fee Components**: Tuition, Transport, Lab, Library, Sports, Annual Day
- **Phone Numbers**: +91 format with realistic Indian mobile prefixes
- **Addresses**: Indian cities, states, and postal codes
- **Holidays**: Independence Day, Republic Day, Diwali, Holi

## Data Generation Patterns

### Student Distribution
```javascript
const distribution = {
  nursery: '8%',     // Ages 3-4
  primary: '35%',    // Classes 1-5, Ages 5-10
  middle: '30%',     // Classes 6-8, Ages 11-13
  secondary: '27%',  // Classes 9-12, Ages 14-18
  
  gender: { male: '52%', female: '48%' },
  
  transport: {
    'School Bus': '60%',
    'Private': '35%',
    'Walk': '5%'
  }
};
```

### Fee Structure
```javascript
const feeComponents = {
  'Tuition': { primary: 5000, middle: 7000, secondary: 10000 },
  'Transport': { bus: 2000, private: 0 },
  'Lab Fee': { middle: 1000, secondary: 2000 },
  'Library': 500,
  'Sports': 800,
  'Annual Day': 300
};
```

## Troubleshooting

### Common Issues

1. **"Query failed" errors**
   - Ensure using MCP tools, not psql command
   - Check table names match Prisma schema exactly
   - Verify branchId is included in multi-tenant queries

2. **Low validation scores**
   - Check minimum entity counts are met
   - Verify Indian names are being generated properly
   - Ensure referential integrity is maintained

3. **Missing branchId errors**
   - All records must have branchId for multi-tenancy
   - Use 'branch1' as default for development
   - Never leave branchId as null or empty

### Debug Commands

```bash
# Check database status
npm run db:health:mcp

# Validate specific aspects
npm run seed:validate:mcp

# Generate detailed report
npm run report:validation

# Export for inspection
npm run export:all
```

## Best Practices

### 1. Always Use MCP Tools
```typescript
// ✅ Good
const students = await mcp__MCP_PostgreSQL_Server__read_records({
  table: 'Student',
  conditions: { branchId: 'branch1' }
});

// ❌ Bad
const result = execSync('psql $DATABASE_URL -c "SELECT * FROM Student"');
```

### 2. Maintain Referential Integrity
```typescript
// Always create parent records first
await createRecord('Guardian', guardianData);
await createRecord('Student', studentData);
// Then create relationships
await createRecord('StudentGuardian', relationshipData);
```

### 3. Cultural Authenticity
```typescript
// Use Indian context generators
const student = {
  firstName: IndianDataGenerators.firstName('male'),
  lastName: IndianDataGenerators.lastName(),
  address: IndianDataGenerators.address(),
  phone: IndianDataGenerators.phoneNumber() // +91 format
};
```

### 4. Multi-tenancy Compliance
```typescript
// Always include branchId
const record = {
  ...data,
  branchId: 'branch1', // Required for data isolation
  createdAt: new Date().toISOString()
};
```

## Data Export and Reporting

### Export Functions
```typescript
// Export to JSON
await exportToJSON('Student');

// Export to CSV for Excel
await exportToCSV('Teacher');

// Generate validation report
const report = await generateValidationReport();
```

### Report Types
- **Validation Reports**: Entity counts, integrity checks, quality metrics
- **Statistics Reports**: Distribution analysis, trends, health metrics
- **Export Reports**: Data dumps for analysis or backup

## Performance Considerations

- Use batch operations for large datasets
- Include proper indexes in queries
- Limit result sets with pagination
- Monitor memory usage during generation
- Use transactions for related record creation

## Security Notes

- All generated data is completely fictional
- No real personal information is used
- Safe for public demos and documentation
- GDPR compliant (no real user data)
- Marked as demo data in database

---

## Quick Start Checklist

1. ✅ Ensure MCP PostgreSQL Server tools are available
2. ✅ Never use psql command-line tool
3. ✅ Run `npm run seed:indian` for comprehensive data
4. ✅ Validate with `npm run seed:validate:mcp`
5. ✅ Check health score is above 90%
6. ✅ Export data if needed with `npm run export:all`
7. ✅ Generate reports with `npm run report:validation`

The system is production-ready when validation shows 95%+ health score with all critical checks passing.