---
allowed-tools: Bash(claudeCurl:*), Bash(lsof:*)
description: Comprehensive health check for all services
argument-hint: [detailed]
---

# System Health Check

Perform a comprehensive health check of all services in the Paramarsh SMS system.

## Services to Check

### 1. Backend API (Port 3005)
!`claudeCurl -s http://localhost:3005/api/v1/health -w "\n⏱️ Response time: %{time_total}s | Status: %{http_code}" || echo "❌ Backend API is DOWN"`

### 2. Frontend Application (Port 3001)  
!`claudeCurl -s http://localhost:3001 -w "\n⏱️ Response time: %{time_total}s | Status: %{http_code}" -o /dev/null || echo "❌ Frontend is DOWN"`

### 3. Database Connection
!`claudeCurl -s http://localhost:3005/api/v1/health/database || echo "❌ Database connection check failed"`

### 4. Port Listeners
!`echo "=== Active Listeners ===" && lsof -i :3001 -i :3005 -i :5432 | grep LISTEN | awk '{print $1, $2, $9}' | column -t`

## Task

Based on the health check results:
1. Summarize the overall system health status
2. Identify any services that are down or unhealthy
3. For any issues found, suggest next diagnostic steps (but DO NOT attempt to restart services)
4. If all services are healthy, confirm the system is ready for use

$1