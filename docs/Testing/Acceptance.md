# Acceptance Test Suites

This document summarizes acceptance criteria and links to executable BDD features.

Existing Feature Files
- Admissions: tests/bdd/admissions.feature
- Attendance: tests/bdd/attendance.feature
- Exams: tests/bdd/exams.feature
- Fees  Payments: tests/bdd/fees_payments.feature

Recommended Additional Suites
- SIS: student CRUD, guardian link, enrollment, bulk promote
- Timetable: constraints, auto-generate, substitution workflow
- Communications: template send, campaign schedule, provider failover
- Analytics: dashboard load, report schedule
- HR/Payroll: staff CRUD, payroll run, payslip access
- Transport: route/stop CRUD, allocation, GPS freshness alert
- Library: catalog, issue/return, overdue fine
- Hostel: room allocation, occupancy report
- Inventory: PR/PO/GRN flow, stock ledger update
- Admissions: waitlist auto-promotion, doc redaction on export

How to Run (placeholder)
- JS: cucumber-js or Cypress BDD plugin
- Python: behave (if using Python stack for API E2E)

Cross-links
- Each module page under docs/Modules contains acceptance criteria; map those to .feature scenarios progressively.
