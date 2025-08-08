# MVP Delivery Plan 6 Estimates

Version: 1.0
Status: Draft

Assumptions
- 6 engineers (3 backend, 2 frontend, 1 mobile/PWA), 1 designer, 1 QA, 1 PM.
- 12-week MVP timeline, 2-week sprints.

Sprints
- Sprint 1: Tenancy, Auth, RBAC scaffold; Design system; Student Directory read.
- Sprint 2: SIS CRUD, Attendance Daily; Notifications foundation; Basic dashboards.
- Sprint 3: Timetable minimal; Homework create/view; File uploads.
- Sprint 4: Exams setup, Marks entry basic; Report card PDF template v1.
- Sprint 5: Fees heads/structures; Invoices issue; Payment gateway integration #1.
- Sprint 6: Reconciliation basics; Communication templates; Broadcasts minimal.
- Sprint 7: Gradebook integration with exams; Results compute v1; Dashboards refine.
- Sprint 8: Parent portal views (attendance, homework, results, fees pay).
- Sprint 9: Reports catalog (20 core); Export engine; Audit logs.
- Sprint 10: Data importers (students, classes, fee structures); Performance hardening.
- Sprint 11: Accessibility pass; Security hardening; DR/backup scripts.
- Sprint 12: UAT fixes; Documentation; Release prep.

Estimates (high-level, person-weeks)
- Auth/RBAC/Multi-tenancy: 6
- SIS/Attendance: 8
- Academics (timetable/homework/gradebook): 10
- Exams/Results: 10
- Fees/Payments/Reconciliation: 12
- Communication: 6
- Reporting/Dashboards: 8
- Parent Portal: 6
- Data Importers: 6
- QA/Automation/Perf/Accessibility/Security: 12

Risks 6 Mitigations
- Payment gateway delays: mock + switchable adapters; parallel provider integration.
- Complexity in fee permutations: start with 80% scenarios; configurable engine; extensive fixtures.
- Report card templating variability: parameterized templates; sandbox for schools.

