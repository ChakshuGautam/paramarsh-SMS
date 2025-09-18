---
allowed-tools: mcp__postgres__query
description: Check database health and data integrity
argument-hint: [branch-id] [detailed]
---

# Database Health & Integrity Check

Perform comprehensive database health check and data integrity validation.

## Configuration
- Branch ID: ${1:-dps-main}
- Mode: ${2:-summary} (summary or detailed)

## Database Checks

### 1. Connection Health
Verify database connectivity and basic statistics.

### 2. Branch Data Summary
Check data distribution for the specified branch:
- Total students, teachers, classes
- Active enrollments
- Recent transactions
- Attendance records

### 3. Data Integrity Checks
Validate critical relationships:
- All students have valid guardian relationships
- All enrollments link to valid students and classes
- All attendance records have valid references
- No orphaned records exist

### 4. Multi-Tenancy Validation
Ensure proper data isolation:
- Verify branchId is present on all records
- Check for any cross-branch data leaks
- Validate composite branch IDs format

### 5. Performance Indicators
Check for potential issues:
- Tables with high record counts
- Missing indexes warnings
- Slow query indicators

## Required Analysis

Based on the database check results:
1. Summarize overall database health
2. Report any data integrity issues found
3. Identify any multi-tenancy violations
4. Suggest optimizations if performance issues detected
5. Confirm if database is ready for production use

**IMPORTANT**: Use ONLY the MCP PostgreSQL tools (mcp__postgres__query) for all database operations. 
NEVER use bash psql commands.