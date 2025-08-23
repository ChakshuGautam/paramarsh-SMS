# Data Protection Features

## Quick Reference Guide

This document provides a quick reference for the data protection features implemented in Paramarsh SMS.

## Features Overview

### 🛡️ Soft Delete
- **Status**: ✅ Implemented
- **Models**: Student, Guardian, Staff, Teacher, Invoice, Payment
- **Benefits**: Data recovery, audit trail, compliance

### 📝 Audit Logging
- **Status**: ✅ Implemented  
- **Coverage**: All API actions (CREATE, UPDATE, DELETE)
- **Storage**: Database with indexing for performance

### 🔐 Multi-tenancy
- **Status**: ✅ Implemented
- **Header**: X-Branch-Id
- **Isolation**: Complete data isolation per branch

## Quick Commands

### Testing Soft Delete

```bash
# Create a test student
curl -X POST http://localhost:8080/api/v1/students \
  -H "Content-Type: application/json" \
  -H "X-Branch-Id: branch1" \
  -d '{"firstName":"Test","lastName":"User","admissionNo":"TEST001"}'

# Soft delete the student
curl -X DELETE http://localhost:8080/api/v1/students/{id} \
  -H "X-Branch-Id: branch1" \
  -H "X-User-Id: admin"

# View deleted students
curl http://localhost:8080/api/v1/students/deleted \
  -H "X-Branch-Id: branch1"

# Restore the student
curl -X POST http://localhost:8080/api/v1/students/{id}/restore \
  -H "X-Branch-Id: branch1"
```

### Viewing Audit Logs

```bash
# Get recent audit logs
curl http://localhost:8080/api/v1/audit-logs?perPage=10 \
  -H "X-Branch-Id: branch1"

# Get logs for specific entity
curl http://localhost:8080/api/v1/audit-logs/entity/students/{id} \
  -H "X-Branch-Id: branch1"

# Get performance metrics
curl http://localhost:8080/api/v1/audit-logs/metrics
```

## Implementation Checklist

### For New Models

- [ ] Add `deletedAt` and `deletedBy` fields to Prisma schema
- [ ] Add model name to `supportsSoftDelete()` in base service
- [ ] Run Prisma migration
- [ ] Add restore endpoint in controller
- [ ] Add deleted items endpoint in controller
- [ ] Test soft delete functionality
- [ ] Update documentation

### For Controllers

- [ ] Ensure delete method passes userId
- [ ] Add `/deleted` GET endpoint
- [ ] Add `/:id/restore` POST endpoint
- [ ] Order routes correctly (specific before generic)
- [ ] Test all endpoints

## Database Schema

### Soft Delete Fields

```prisma
model YourModel {
  // ... other fields
  deletedAt DateTime? @db.Timestamp
  deletedBy String?   @db.VarChar(255)
  
  @@index([deletedAt])
}
```

### Audit Log Table

```prisma
model AuditLog {
  id           String   @id @default(uuid())
  action       String   // CREATE, UPDATE, DELETE
  entityType   String?  // students, teachers, etc.
  entityId     String?  // UUID of affected record
  userId       String?  // Who performed action
  branchId     String?  // Multi-tenant identifier
  oldData      String?  // JSON of previous state
  newData      String?  // JSON of new state
  createdAt    DateTime @default(now())
  // ... other fields
}
```

## Service Methods

### Base CRUD Service

```typescript
class BaseCrudService {
  // Soft delete instead of hard delete
  async delete(id: string, userId?: string) {
    if (this.supportsSoftDelete()) {
      return this.prisma[model].update({
        where: { id },
        data: { 
          deletedAt: new Date(),
          deletedBy: userId || 'system'
        }
      });
    }
    // Fall back to hard delete if not supported
    return this.prisma[model].delete({ where: { id } });
  }

  // Restore soft-deleted record
  async restore(id: string) {
    return this.prisma[model].update({
      where: { id },
      data: { 
        deletedAt: null,
        deletedBy: null
      }
    });
  }

  // Get soft-deleted records
  async getDeleted(params) {
    return this.prisma[model].findMany({
      where: { 
        deletedAt: { not: null },
        ...params.filter
      }
    });
  }
}
```

## Interceptor Configuration

### Audit Log Interceptor

```typescript
// In app.module.ts
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
```

## Testing

### Test Script

```bash
#!/bin/bash
# test-soft-delete.sh

# Test soft delete
STUDENT_ID=$(curl -s -X POST $API_URL/students ...)
curl -X DELETE $API_URL/students/$STUDENT_ID
curl $API_URL/students/deleted
curl -X POST $API_URL/students/$STUDENT_ID/restore

# Check audit logs
curl $API_URL/audit-logs?perPage=5
```

## Monitoring

### Key Metrics

| Metric | Query | Alert Threshold |
|--------|-------|-----------------|
| Deletion Rate | `COUNT(*) WHERE deletedAt IS NOT NULL` | >10% of records |
| Audit Log Size | `SELECT pg_size_pretty(pg_total_relation_size('AuditLog'))` | >1GB |
| Failed Requests | `COUNT(*) WHERE errorMessage IS NOT NULL` | >5% of requests |
| Slow Requests | `COUNT(*) WHERE duration > 1000` | >1% of requests |

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Soft delete not working | Check `supportsSoftDelete()` includes model |
| Restore fails | Ensure record exists and has deletedAt set |
| Audit logs missing | Verify interceptor is registered |
| Performance issues | Check indexes on deletedAt fields |

## Compliance

### GDPR Compliance

- ✅ Right to erasure: Soft delete with permanent delete option
- ✅ Data portability: Export via API endpoints
- ✅ Audit trail: Complete activity logging
- ✅ Data minimization: Automatic cleanup after retention period

### Data Retention

- **Soft deleted records**: 90 days (configurable)
- **Audit logs**: 1 year (configurable)
- **Archived data**: Indefinite (external storage)

## Contact

For support or questions:
- Review main documentation: [soft-delete-and-audit-logging.md](./soft-delete-and-audit-logging.md)
- Check API documentation: [api-documentation-checklist.md](./api-documentation-checklist.md)
- Contact development team for implementation assistance

---

*Quick Reference v1.0.0*