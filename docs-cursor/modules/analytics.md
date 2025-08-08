# Analytics & Reporting — Detailed Spec

## Overview
Operational dashboards, cohort analytics, exports, and data governance.

## Data Entities
- MetricDefinition(id, name, query, schedule)
- Dashboard(id, name, widgets[])
- ReportSchedule(id, reportId, cron, recipients)

## UI Screens
- Admin: Dashboards, Create Widget (query builder), Schedules, Exports

## APIs
- GET /api/v1/analytics/metrics/{id}
- GET /api/v1/analytics/dashboards/{id}
- POST /api/v1/analytics/reports/{id}/schedule

## Acceptance Criteria
- P95 < 2s for cached widgets; export to CSV/XLSX; row-level RBAC on data

## Tickets
- ANA-1: Query Builder & RBAC (SP: 13)
- ANA-2: Widgets & Dashboards (SP: 8)
- ANA-3: Scheduled Reports (SP: 5)
