# Database Design

## 🎯 Overview

The Paramarsh SMS database is designed with multi-tenancy, scalability, and data integrity as core principles. We use Prisma ORM for database abstraction, allowing seamless switching between SQLite (development) and PostgreSQL (production).

## 🏗️ Design Principles

### 1. **Multi-Tenant Architecture**
Every table includes `branchId` for tenant isolation.

### 2. **Soft Deletes**
Critical entities support soft deletion for data recovery.

### 3. **Audit Trail**
Timestamps and user tracking for all modifications.

### 4. **Referential Integrity**
Proper foreign keys and cascade rules.

### 5. **Performance First**
Strategic indexes and optimized queries.

## 📊 Core Schema Patterns

### Base Entity Pattern
Every entity follows this base structure:

```prisma
model EntityName {
  // Identity
  id        String   @id @default(uuid())
  branchId  String?  // Multi-tenancy
  
  // Core fields
  // ... entity-specific fields
  
  // Audit fields
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  createdBy String?
  updatedBy String?
  
  // Soft delete
  deletedAt DateTime?
  deletedBy String?
  
  // Indexes
  @@index([branchId])
  @@index([deletedAt])
}
```

### Multi-Tenancy Pattern
```prisma
model Student {
  id       String  @id @default(uuid())
  branchId String? // Tenant identifier
  
  // All queries must filter by branchId
  @@index([branchId])
}
```

**Query Pattern:**
```typescript
// Always include branchId in queries
await prisma.student.findMany({
  where: { 
    branchId: 'branch1',
    // ... other conditions
  }
});
```

### Soft Delete Pattern
```prisma
model Student {
  deletedAt DateTime? // NULL = active record
  deletedBy String?   // User who deleted
  
  @@index([deletedAt])
}
```

**Query Pattern:**
```typescript
// Exclude deleted records
where: { deletedAt: null }

// Include only deleted
where: { deletedAt: { not: null } }

// Soft delete
update: { 
  deletedAt: new Date(),
  deletedBy: userId 
}
```

## 🔗 Relationship Patterns

### One-to-Many
```prisma
model Class {
  id       String    @id
  students Student[] // One class has many students
}

model Student {
  id      String  @id
  classId String?
  class   Class?  @relation(fields: [classId], references: [id])
}
```

### Many-to-Many
```prisma
model Student {
  id        String              @id
  guardians StudentGuardian[]   // Junction table
}

model Guardian {
  id       String              @id
  students StudentGuardian[]    // Junction table
}

model StudentGuardian {
  id         String   @id @default(uuid())
  studentId  String
  guardianId String
  relation   String   // father, mother, guardian
  isPrimary  Boolean  @default(false)
  
  student    Student  @relation(fields: [studentId], references: [id])
  guardian   Guardian @relation(fields: [guardianId], references: [id])
  
  @@unique([studentId, guardianId])
  @@index([studentId])
  @@index([guardianId])
}
```

### Self-Referential
```prisma
model Staff {
  id         String  @id
  managerId  String?
  manager    Staff?  @relation("ManagerRelation", fields: [managerId], references: [id])
  subordinates Staff[] @relation("ManagerRelation")
}
```

## 📈 Key Entities

### Student Information System
```prisma
model Student {
  id          String    @id @default(uuid())
  branchId    String?
  
  // Personal
  firstName   String
  lastName    String
  admissionNo String?   @unique
  dob         DateTime?
  gender      String?
  
  // Academic
  classId     String?
  sectionId   String?
  rollNumber  String?
  status      String?   @default("active")
  
  // Relationships
  class       Class?    @relation(fields: [classId], references: [id])
  section     Section?  @relation(fields: [sectionId], references: [id])
  guardians   StudentGuardian[]
  enrollments Enrollment[]
  attendance  AttendanceRecord[]
  
  // Audit
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  
  @@index([branchId])
  @@index([classId])
  @@index([status])
  @@index([deletedAt])
}
```

### Academic Structure
```prisma
model Class {
  id         String     @id @default(uuid())
  branchId   String?
  name       String     // "Class 10", "Nursery"
  gradeLevel Int?       // Numeric grade level
  
  sections   Section[]
  students   Student[]
  subjects   Subject[]
  
  @@unique([branchId, name])
  @@index([branchId])
}

model Section {
  id        String    @id @default(uuid())
  branchId  String?
  classId   String
  name      String    // "A", "B", "C"
  capacity  Int?
  
  class     Class     @relation(fields: [classId], references: [id])
  students  Student[]
  
  @@unique([classId, name])
  @@index([branchId])
  @@index([classId])
}
```

### Financial Management
```prisma
model Invoice {
  id         String    @id @default(uuid())
  branchId   String?
  studentId  String
  amount     Decimal
  dueDate    DateTime
  status     String    @default("pending")
  period     String    // "April 2024", "Q1 2024"
  
  student    Student   @relation(fields: [studentId], references: [id])
  payments   Payment[]
  items      InvoiceItem[]
  
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  deletedAt  DateTime?
  
  @@index([branchId])
  @@index([studentId])
  @@index([status])
  @@index([dueDate])
}

model Payment {
  id           String    @id @default(uuid())
  branchId     String?
  invoiceId    String
  amount       Decimal
  paymentDate  DateTime
  method       String    // cash, cheque, online, upi
  status       String    // success, failed, pending
  reference    String?   // Transaction reference
  
  invoice      Invoice   @relation(fields: [invoiceId], references: [id])
  
  @@index([branchId])
  @@index([invoiceId])
  @@index([status])
}
```

## 🔍 Indexing Strategy

### Primary Indexes
```prisma
// Always index tenant field
@@index([branchId])

// Index soft delete field
@@index([deletedAt])

// Index foreign keys
@@index([classId])
@@index([studentId])
```

### Composite Indexes
```prisma
// For unique constraints
@@unique([branchId, admissionNo])

// For common query patterns
@@index([branchId, status])
@@index([classId, sectionId])
```

### Search Indexes
```prisma
// For text search (PostgreSQL)
@@index([firstName, lastName])
```

## 🔒 Data Integrity Rules

### Cascade Rules
```prisma
// Cascade delete enrollments when student deleted
enrollment Enrollment[] @relation(onDelete: Cascade)

// Set null when class deleted
class Class? @relation(onDelete: SetNull)

// Restrict deletion if has dependencies
students Student[] @relation(onDelete: Restrict)
```

### Unique Constraints
```prisma
// Global unique
admissionNo String @unique

// Tenant-scoped unique
@@unique([branchId, employeeId])

// Composite unique
@@unique([studentId, academicYearId])
```

### Check Constraints
```sql
-- PostgreSQL only
ALTER TABLE invoices 
ADD CONSTRAINT positive_amount 
CHECK (amount > 0);

ALTER TABLE students 
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'inactive', 'graduated', 'transferred'));
```

## 📊 Database Views (Virtual Tables)

### Active Students View
```sql
CREATE VIEW active_students AS
SELECT * FROM students 
WHERE deletedAt IS NULL 
AND status = 'active';
```

### Outstanding Invoices View
```sql
CREATE VIEW outstanding_invoices AS
SELECT 
  i.*,
  i.amount - COALESCE(SUM(p.amount), 0) as outstanding
FROM invoices i
LEFT JOIN payments p ON i.id = p.invoiceId
WHERE i.deletedAt IS NULL
GROUP BY i.id
HAVING outstanding > 0;
```

## 🚀 Performance Optimization

### Query Optimization
```typescript
// Bad: N+1 query problem
const students = await prisma.student.findMany();
for (const student of students) {
  const class = await prisma.class.findUnique({
    where: { id: student.classId }
  });
}

// Good: Include relations
const students = await prisma.student.findMany({
  include: { class: true }
});
```

### Pagination
```typescript
// Always paginate large datasets
const students = await prisma.student.findMany({
  skip: (page - 1) * perPage,
  take: perPage,
  where: { branchId }
});
```

### Selective Fields
```typescript
// Select only needed fields
const students = await prisma.student.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true
  }
});
```

## 🔄 Migration Strategy

### Development Workflow
```bash
# Create migration
npx prisma migrate dev --name add_student_table

# Apply migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset
```

### Production Workflow
```bash
# Generate migration SQL
npx prisma migrate dev --create-only

# Review migration
cat prisma/migrations/*/migration.sql

# Deploy migration
npx prisma migrate deploy
```

### Migration Best Practices
1. Always review generated SQL
2. Test migrations on staging first
3. Backup production before migration
4. Use transactions for data migrations
5. Keep migrations small and focused

## 📝 Data Types Mapping

### Prisma to Database Types

| Prisma Type | SQLite | PostgreSQL | Usage |
|-------------|--------|------------|-------|
| String | TEXT | VARCHAR/TEXT | Names, descriptions |
| Int | INTEGER | INTEGER | Counts, IDs |
| Float | REAL | DOUBLE PRECISION | Scores, percentages |
| Decimal | TEXT | DECIMAL | Money, precise numbers |
| Boolean | INTEGER (0/1) | BOOLEAN | Flags |
| DateTime | TEXT (ISO) | TIMESTAMP | Dates, times |
| Json | TEXT | JSONB | Complex data |
| Bytes | BLOB | BYTEA | Binary data |

## 🛡️ Security Considerations

### Data Encryption
```prisma
model User {
  id       String @id
  email    String @unique
  password String // Store hashed, never plain text
}
```

### Sensitive Data
```prisma
model Payment {
  // Don't store full card numbers
  cardLast4    String?
  
  // Encrypt sensitive fields
  @encrypted
  bankAccount  String?
}
```

### Access Control
```typescript
// Row-level security through branchId
where: {
  branchId: userBranchId,
  // User can only see their branch data
}
```

## 🔧 Database Maintenance

### Regular Tasks
1. **Backup**: Daily automated backups
2. **Vacuum**: Weekly vacuum (PostgreSQL)
3. **Analyze**: Update statistics regularly
4. **Index Maintenance**: Rebuild fragmented indexes
5. **Archive**: Move old data to archive tables

### Monitoring Queries
```sql
-- Table sizes
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(table_name::regclass))
FROM information_schema.tables
WHERE table_schema = 'public';

-- Slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Missing indexes
SELECT * FROM pg_stat_user_tables
WHERE n_live_tup > 10000
AND seq_scan > idx_scan;
```

## 📊 Entity Relationship Diagram

```
Student ----< Enrollment >---- Class
   |                            |
   |                            |
   v                            v
Guardian                    Section
   |                            |
   |                            |
   v                            v
Contact                     Teacher
                               |
                               |
                               v
                            Subject
```

## ✅ Design Checklist

For every new entity, ensure:

- [ ] Includes `id` field (UUID)
- [ ] Includes `branchId` for multi-tenancy
- [ ] Has `createdAt` and `updatedAt`
- [ ] Implements soft delete if needed
- [ ] Has proper indexes
- [ ] Defines relationships correctly
- [ ] Has unique constraints where needed
- [ ] Follows naming conventions
- [ ] Documented in schema.prisma
- [ ] Has seed data

## 📚 References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Main_Page)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)