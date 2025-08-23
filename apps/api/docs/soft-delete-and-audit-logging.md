# Soft Delete and Audit Logging Documentation

## Overview

The Paramarsh SMS system implements **soft delete** and **comprehensive audit logging** to ensure data integrity, provide recovery options, and maintain compliance with data retention requirements.

## Table of Contents

1. [Soft Delete Implementation](#soft-delete-implementation)
2. [Audit Logging System](#audit-logging-system)
3. [API Endpoints](#api-endpoints)
4. [Database Schema Changes](#database-schema-changes)
5. [Usage Examples](#usage-examples)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Soft Delete Implementation

### What is Soft Delete?

Soft delete is a data protection mechanism where records are marked as deleted rather than being permanently removed from the database. This provides:

- **Data Recovery**: Accidentally deleted records can be restored
- **Audit Trail**: Historical data remains available for compliance
- **Referential Integrity**: Related records aren't orphaned
- **Legal Compliance**: Meets data retention requirements

### How It Works

1. **Deletion Process**:
   - When a record is deleted, the `deletedAt` field is set to the current timestamp
   - The `deletedBy` field records the user who performed the deletion
   - The record remains in the database but is excluded from normal queries

2. **Query Filtering**:
   - All queries automatically exclude records where `deletedAt IS NOT NULL`
   - This filtering is transparent to the application layer

3. **Restoration**:
   - Soft-deleted records can be restored by setting `deletedAt` back to `NULL`
   - The complete history is preserved in audit logs

### Supported Models

The following models support soft delete:

| Model | Purpose | Critical Data |
|-------|---------|---------------|
| **Student** | Student records | Academic history, enrollment data |
| **Guardian** | Parent/guardian information | Contact details, relationships |
| **Staff** | Staff members | Employment records |
| **Teacher** | Teaching staff | Qualifications, assignments |
| **Invoice** | Financial records | Billing history |
| **Payment** | Payment transactions | Financial audit trail |

### Database Fields

Each soft-delete enabled model includes:

```typescript
{
  // ... other fields
  deletedAt: DateTime?  // Null if active, timestamp if deleted
  deletedBy: String?    // User ID who deleted the record
}
```

---

## Audit Logging System

### Overview

The audit logging system tracks all API actions for security, compliance, and debugging purposes.

### What is Logged

Every non-GET API request is logged with:

| Field | Description | Example |
|-------|-------------|---------|
| **action** | Operation type | CREATE, UPDATE, DELETE, SOFT_DELETE |
| **method** | HTTP method | POST, PUT, PATCH, DELETE |
| **endpoint** | API path | /api/v1/students/123 |
| **entityType** | Resource type | students, teachers, invoices |
| **entityId** | Record ID | uuid-string |
| **userId** | User who performed action | user-123 |
| **branchId** | Multi-tenant identifier | branch1 |
| **oldData** | Previous state (JSON) | {"name": "John"} |
| **newData** | New state (JSON) | {"name": "Jane"} |
| **ipAddress** | Client IP | 192.168.1.1 |
| **userAgent** | Browser/client info | Mozilla/5.0... |
| **statusCode** | HTTP response code | 200, 404, 500 |
| **errorMessage** | Error details if failed | "Record not found" |
| **duration** | Request time in ms | 125 |
| **createdAt** | Timestamp | 2024-01-15T10:30:00Z |

### Audit Log Schema

```prisma
model AuditLog {
  id             String   @id @default(uuid())
  branchId       String?  // Multi-tenant identifier
  userId         String?  // User who performed action
  userEmail      String?  // User email for reference
  action         String   // CREATE, UPDATE, DELETE, etc.
  method         String   // GET, POST, PUT, PATCH, DELETE
  endpoint       String   // API endpoint path
  entityType     String?  // Model/Entity type
  entityId       String?  // ID of affected entity
  oldData        String?  // JSON of previous state
  newData        String?  // JSON of new state
  ipAddress      String?  // Client IP address
  userAgent      String?  // Browser/client info
  statusCode     Int?     // HTTP response status
  errorMessage   String?  // Error if request failed
  duration       Int?     // Request duration in ms
  createdAt      DateTime @default(now())
  
  @@index([branchId])
  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
}
```

---

## API Endpoints

### Soft Delete Endpoints

#### Delete a Record (Soft Delete)
```http
DELETE /api/v1/{resource}/{id}
Headers:
  X-Branch-Id: branch1
  X-User-Id: user-123
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    // Record data (deletedAt not shown in response)
  }
}
```

#### Get Deleted Records
```http
GET /api/v1/{resource}/deleted?page=1&perPage=25
Headers:
  X-Branch-Id: branch1
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "deletedAt": "2024-01-15T10:30:00Z",
      "deletedBy": "user-123"
    }
  ],
  "total": 10
}
```

#### Restore a Deleted Record
```http
POST /api/v1/{resource}/{id}/restore
Headers:
  X-Branch-Id: branch1
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
    // Restored record (deletedAt is now null)
  }
}
```

### Audit Log Endpoints

#### Get All Audit Logs
```http
GET /api/v1/audit-logs?page=1&perPage=25&sort=-createdAt
Headers:
  X-Branch-Id: branch1
```

#### Get Logs for Specific Entity
```http
GET /api/v1/audit-logs/entity/{entityType}/{entityId}
Headers:
  X-Branch-Id: branch1
```

#### Get User Activity Logs
```http
GET /api/v1/audit-logs/user/{userId}
Headers:
  X-Branch-Id: branch1
```

#### Get Branch Logs
```http
GET /api/v1/audit-logs/branch/{branchId}
```

#### Get Failed Requests
```http
GET /api/v1/audit-logs/failed
```

#### Get Performance Metrics
```http
GET /api/v1/audit-logs/metrics?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "data": {
    "averageDuration": 125.5,
    "maxDuration": 1500,
    "minDuration": 10,
    "totalRequests": 5000,
    "slowRequests": 50,
    "errorCount": 12,
    "errorRate": 0.24
  }
}
```

---

## Usage Examples

### Example 1: Soft Delete a Student

```typescript
// Delete a student (soft delete)
const response = await fetch('/api/v1/students/123', {
  method: 'DELETE',
  headers: {
    'X-Branch-Id': 'branch1',
    'X-User-Id': 'teacher-456'
  }
});

// Student is now soft-deleted
// They won't appear in normal queries
```

### Example 2: View Deleted Students

```typescript
// Get all soft-deleted students
const response = await fetch('/api/v1/students/deleted', {
  headers: {
    'X-Branch-Id': 'branch1'
  }
});

const { data, total } = await response.json();
console.log(`Found ${total} deleted students`);
```

### Example 3: Restore a Student

```typescript
// Restore a soft-deleted student
const response = await fetch('/api/v1/students/123/restore', {
  method: 'POST',
  headers: {
    'X-Branch-Id': 'branch1'
  }
});

// Student is now active again
```

### Example 4: View Audit Trail

```typescript
// Get audit logs for a specific student
const response = await fetch('/api/v1/audit-logs/entity/students/123', {
  headers: {
    'X-Branch-Id': 'branch1'
  }
});

const { data } = await response.json();
data.forEach(log => {
  console.log(`${log.action} at ${log.createdAt} by ${log.userId}`);
});
```

---

## Configuration

### Enabling Soft Delete for New Models

1. **Add fields to Prisma schema:**
```prisma
model YourModel {
  // ... existing fields
  deletedAt DateTime? // Soft delete timestamp
  deletedBy String?   // User who deleted
  
  @@index([deletedAt])
}
```

2. **Update the base service:**
```typescript
// In base-crud.service.ts
protected supportsSoftDelete(): boolean {
  const softDeleteModels = [
    'student',
    'guardian',
    'yourmodel', // Add your model here
  ];
  return softDeleteModels.includes(this.modelName.toLowerCase());
}
```

3. **Run migrations:**
```bash
npx prisma migrate dev
```

### Configuring Audit Log Retention

Audit logs can grow large over time. Consider implementing:

1. **Automatic cleanup** (recommended after 90 days):
```typescript
// Add to a scheduled job
await prisma.auditLog.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  }
});
```

2. **Archive to external storage**:
```typescript
// Archive old logs to S3/external storage
const oldLogs = await prisma.auditLog.findMany({
  where: { createdAt: { lt: thirtyDaysAgo } }
});
await archiveToS3(oldLogs);
```

---

## Best Practices

### 1. Regular Backups
- Even with soft delete, maintain regular database backups
- Test restore procedures periodically

### 2. Access Control
- Limit who can perform deletes
- Restrict access to restore endpoints
- Audit log access should be admin-only

### 3. Data Retention Policy
- Define how long soft-deleted records are kept
- Implement automatic purging after retention period
- Document your retention policy

### 4. Performance Considerations
- Index `deletedAt` fields for query performance
- Consider partitioning large tables by deletion status
- Monitor query performance with soft delete filters

### 5. User Communication
- Inform users that deletions are recoverable
- Provide UI for viewing/restoring deleted items
- Show deletion history in audit reports

---

## Troubleshooting

### Common Issues

#### Issue: Deleted records still appearing
**Solution**: Ensure the service extends `BaseCrudService` and `supportsSoftDelete()` returns true

#### Issue: Cannot restore deleted record
**Solution**: Check that the restore endpoint is properly registered and the record exists

#### Issue: Audit logs not being created
**Solution**: Verify the interceptor is registered globally in `app.module.ts`

#### Issue: Performance degradation
**Solution**: 
- Ensure `deletedAt` is indexed
- Consider archiving old audit logs
- Review query patterns for optimization

### Monitoring

Monitor these metrics:
- Soft delete rate vs hard delete rate
- Restore frequency
- Audit log growth rate
- Query performance with soft delete filters

### Database Queries

#### Find all soft-deleted records:
```sql
SELECT * FROM Student WHERE deletedAt IS NOT NULL;
```

#### Count deleted records by month:
```sql
SELECT 
  DATE_TRUNC('month', deletedAt) as month,
  COUNT(*) as deleted_count
FROM Student
WHERE deletedAt IS NOT NULL
GROUP BY month;
```

#### Find records deleted by specific user:
```sql
SELECT * FROM Student 
WHERE deletedBy = 'user-123'
AND deletedAt IS NOT NULL;
```

---

## Security Considerations

1. **Audit Log Security**:
   - Audit logs should be immutable
   - Implement write-only access for the interceptor
   - Read access should require admin privileges

2. **Soft Delete Security**:
   - Validate user permissions before delete/restore
   - Log all delete/restore actions
   - Consider two-factor authentication for bulk deletes

3. **Data Privacy**:
   - Implement data anonymization for old soft-deleted records
   - Respect GDPR "right to be forgotten" with hard delete option
   - Encrypt sensitive data in audit logs

---

## Migration Guide

### Migrating Existing Data

If you have existing data without soft delete fields:

1. **Add nullable fields first**:
```sql
ALTER TABLE Student ADD COLUMN deletedAt TIMESTAMP;
ALTER TABLE Student ADD COLUMN deletedBy VARCHAR(255);
```

2. **Create indexes**:
```sql
CREATE INDEX idx_student_deletedAt ON Student(deletedAt);
```

3. **Update application code** to use soft delete

4. **Test thoroughly** before deploying to production

---

## Support and Maintenance

For issues or questions:
1. Check the troubleshooting section
2. Review audit logs for error patterns
3. Contact the development team with:
   - Error messages from audit logs
   - Steps to reproduce the issue
   - Expected vs actual behavior

---

*Last updated: January 2024*
*Version: 1.0.0*