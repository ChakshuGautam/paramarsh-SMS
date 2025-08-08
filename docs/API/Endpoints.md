# API Endpoints — Outline

Version: 1.0
Status: Draft

Conventions
- Base URL: /api/v1
- Auth: OAuth2/OIDC bearer tokens; all endpoints require Authorization header unless stated.
- Idempotency: POST with Idempotency-Key for payment and communication operations.
- Pagination: cursor-based (?cursor=, ?limit=50), default 25, max 200.
- Filtering: Rison/JSON filter or simple query params where trivial.
- Errors: RFC7807 problem+json with code, message, details, correlation_id.

Core
- POST /auth/login
- POST /auth/token/refresh
- POST /tenants
- GET /tenants/:id
- GET /me

Users & Roles
- GET /users, POST /users, GET /users/:id, PATCH /users/:id, DELETE /users/:id
- GET /roles, POST /roles, PUT /roles/:id/permissions
- POST /users/:id/roles

SIS
- Students: GET/POST/PATCH /students, GET /students/:id
- Guardians: GET/POST/PATCH /guardians, GET /guardians/:id
- Classes: GET/POST/PATCH /classes, Sections: /sections
- Attendance: POST /attendance/daily, POST /attendance/period, GET /attendance?date=, GET /students/:id/attendance
- Documents: POST /students/:id/documents, GET /students/:id/documents

Admissions
- Forms: GET/POST /admissions/forms, PUT /admissions/forms/:id/publish
- Applications: GET/POST /admissions/applications, GET /admissions/applications/:id, PATCH status
- Interviews: POST /admissions/applications/:id/interviews
- Offers: POST /admissions/applications/:id/offer, POST /offers/:id/accept

Academics
- Timetable: GET/POST /timetable, GET /timetable/class/:id, teacher/:id
- Lesson Plans: GET/POST /lesson-plans, GET /lesson-plans/:id
- Homework: GET/POST /homework, GET /homework/:id, POST /homework/:id/submissions
- Gradebook: GET/POST /gradebooks, POST /gradebooks/:id/grades

Exams
- Exams: GET/POST /exams, GET /exams/:id, POST /exams/:id/components
- Marks: POST /exams/:id/marks/import, POST /exams/:id/marks
- Results: POST /exams/:id/compute, GET /exams/:id/results, POST /exams/:id/publish

Fees
- Fee Heads: GET/POST /fees/heads
- Structures: GET/POST /fees/structures
- Invoices: GET/POST /fees/invoices, GET /fees/invoices/:id
- Payments: POST /fees/invoices/:id/pay, POST /fees/webhooks/:gateway, GET /fees/reconciliation

Communication
- Templates: GET/POST /comm/templates
- Broadcasts: POST /comm/broadcasts, GET /comm/broadcasts/:id, GET /comm/logs

Transport
- Routes: GET/POST /transport/routes, Stops: /stops, Assignments: /assignments
- Tracking: GET /transport/live, Webhook /transport/gps

Library
- Catalog: GET/POST /library/books, GET /library/books/:id
- Circulation: POST /library/circulation/issue, POST /library/circulation/return

Reporting
- Reports: GET /reports/:key?params, POST /reports/export

Admin/Settings
- Settings: GET/PUT /settings
- Audit Logs: GET /audit?entity=&actor=&date=
- Files: POST /files (signed URLs), GET /files/:id

Webhooks
- POST /webhooks/:topic (subscribe/receive)

