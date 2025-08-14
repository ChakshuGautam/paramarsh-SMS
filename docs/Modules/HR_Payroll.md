# HR  Payroll — Detailed Spec

Manage staff profiles, attendance/leaves, payroll, statutory.

Data Entities
- Staff(id, empCode, name, role, doj, department)
- Leave(id, staffId, type, days, status)
- PayrollRun(id, period, status)
- Payslip(id, staffId, period, components, netPay)

Teacher Management (Overview)

- Teacher profiles: qualifications, experience, subjects, certifications; linked to Staff.
- Schedules: integrate with Timetable for personal teaching calendar and invigilation duties.
- Class management: roster view, student notes, attendance completion tracking.
- Assignments & lesson plans: link to Academics/LMS module; track coverage vs syllabus.
- Teaching assistant tools: quick quizzes/polls, formative assessments, and engagement tracking.

APIs
- GET /api/v1/hr/teachers — list teachers
- POST /api/v1/hr/teachers — create teacher (linked to staff)
- GET /api/v1/timetable/sections/{sectionId} — for class schedules
- POST /api/v1/lesson-plans — create lesson plans
- POST /api/v1/quizzes — publish quick quizzes (TA)

UI Screens
- HR: Staff Profiles, Leaves, Payroll Setup, Payroll Run, Payslips, Statutory
- Staff: Payslips, Leave Requests

APIs
- POST /api/v1/hr/staff
- POST /api/v1/hr/payroll/runs
- GET /api/v1/hr/payslips/{id}

Acceptance Criteria
- Payslip visible only to employee; watermark PDF
- Statutory exports (PF/ESI/PT/TDS)

Tickets
- HR-1: Staff  Leaves (SP: 8)
- HR-2: Payroll Engine (SP: 13)
- HR-3: Statutory Reports (SP: 8)
