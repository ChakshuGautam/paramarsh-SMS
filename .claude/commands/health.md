---
allowed-tools: Bash(claudeCurl:*), Bash(lsof:*)
description: Quick health check of all services
---

# Quick Health Check

Rapidly check the health status of all Paramarsh SMS services.

## Service Status

### Backend API (Port 3005)
!`claudeCurl -s http://localhost:3005/api/v1/health -w "Status: %{http_code} | Response Time: %{time_total}s\n" || echo "❌ Backend API is not responding"`

### Frontend (Port 3001)
!`claudeCurl -s http://localhost:3001 -w "Status: %{http_code} | Response Time: %{time_total}s\n" -o /dev/null || echo "❌ Frontend is not responding"`

### Active Processes
!`echo "=== Service Processes ===" && lsof -i :3001 -i :3005 | grep LISTEN | awk '{print $1, $9}' | column -t`

## Quick Analysis

Provide a concise health summary:
- ✅ Healthy services
- ❌ Unhealthy services  
- ⚠️ Any warnings or concerns
- 📝 Next steps if issues found (request logs, check configuration)

**Remember**: Never attempt to start servers. They should always be running on ports 3001 (frontend) and 3005 (backend).