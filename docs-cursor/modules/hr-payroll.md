# HR & Payroll — Detailed Spec

## Overview
Manage staff profiles, attendance/leaves, payroll, statutory.

## Data Entities
- Staff(id, empCode, name, role, doj, department)
- Leave(id, staffId, type, days, status)
- PayrollRun(id, period, status)
- Payslip(id, staffId, period, components, netPay)

## UI Screens
- HR: Staff Profiles, Leaves, Payroll Setup, Payroll Run, Payslips, Statutory
- Staff: Payslips, Leave Requests

## APIs
- POST /api/v1/hr/staff
- POST /api/v1/hr/payroll/runs
- GET /api/v1/hr/payslips/{id}

## Acceptance Criteria
- Payslip visible only to employee; watermark PDF
- Statutory exports (PF/ESI/PT/TDS)

## Tickets
- HR-1: Staff & Leaves (SP: 8)
- HR-2: Payroll Engine (SP: 13)
- HR-3: Statutory Reports (SP: 8)
