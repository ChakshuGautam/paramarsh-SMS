# School Management System (SMS) — Product Requirements Document (PRD)

Version: 1.0
Owner: Product / Engineering
Status: Draft for review
Last Updated: 2025-08-08


1. Executive Summary
- Goal: Build a modern, modular School Management System (SMS) that digitizes school operations end-to-end for K-12 (and optionally Higher-Ed) institutions. The product should streamline academics, administration, finance, compliance, communication, and stakeholder engagement, while being secure, scalable, and configurable.
- Target Users: School Admins, Principals, Teachers, Students, Parents/Guardians, Accountants, Librarians, Transport Coordinators, Examination Controllers, HR/Admin, IT.
- Business Outcomes:
  - Reduce administrative overhead by 40%+ via automation and self-service.
  - Improve fee realization by 10–20% via reminders, online payments, and reconciliation.
  - Increase parent and student engagement (attendance, homework, results) with mobile/app notifications.
  - Enable multi-branch oversight and consolidated reporting.
- Product Strategy: Start with a robust MVP for core operations; extend via modules and integrations. Multi-tenant architecture with role-based access; API-first for ecosystem integrations.


2. Personas & User Needs
- Principal / Head of School
  - Needs consolidated dashboards (attendance, academics, finances), approvals, policy controls, timetable oversight, incident tracking.
- School Administrator / Office Staff
  - Needs admissions, student lifecycle, certificates, transfers, fee management, inventory, communication tools, reports.
- Teachers
  - Needs timetable, attendance, lesson plans, homework/assignments, gradebook, exam entry, remarks/behavior logs, communication with parents.
- Students
  - Needs timetable, homework, submissions, grades/results, attendance view, fees dues, library, transport details, certificates.
- Parents/Guardians
  - Needs attendance notifications, homework, results, fees and payments, announcements, PTM scheduling, transport tracking.
- Accountant / Finance
  - Needs fee structures, invoicing, discounts, waivers, scholarships, payment gateways, reconciliation, ledgers, audits, taxes.
- Examination Controller
  - Needs exam templates, schedules, seating plans, marks entry, moderation, results publishing, transcripts.
- HR / Admin
  - Needs staff records, recruitment, onboarding, payroll inputs, leaves & attendance, appraisal, compliance.
- Librarian
  - Needs cataloging, circulation, fines, reservations, inventory, vendor management.
- Transport Coordinator
  - Needs routes, stops, vehicles, drivers, GPS tracking, alerts, compliance docs.
- IT / System Admin
  - Needs user provisioning, roles & permissions, SSO, backups, audit logs, API keys, integrations, data privacy.


3. Scope Overview (Modules)
Mandatory Core Modules for MVP:
- Admissions & Enrolment
- Student Information System (SIS) & Attendance
- Academics: Timetable, Lesson Plans, Homework, Gradebook
- Examinations & Results
- Fees & Payments
- Communication & Notifications
- Roles, Permissions & Multi-Tenancy
- Reporting & Dashboards

Phase 2/3 Modules:
- Transport Management with GPS
- Library Management (LMS)
- Hostel/Residence Management
- HR & Payroll Inputs
- Inventory & Assets
- Health & Clinic
- Events & PTM Scheduling
- Discipline & Incident Management
- Analytics & Data Warehouse
- Integrations Marketplace (LMS/VLE, ERP, SMS/Email/Push vendors, Payment Gateways)

Optional / Advanced:
- Learning Management System (course delivery, quizzes, content)
- Bus attendance (RFID/NFC) & turnstiles
- Parent mobile app & Teacher mobile app
- AI Tutor/Assistant for teachers and students
- Proctoring for online exams


4. Functional Requirements by Module
4.1 Admissions & Enrolment
- Application form builder (custom fields, document upload, fee collection for application).
- Campaign sources & CRM-lite: lead capture, status tracking, reminders.
- Entrance test scheduling & scoring.
- Shortlisting, offer letters, waitlist management.
- Fee payment for admission, scholarship/discount workflows.
- Auto-creation of student profiles on enrolment; class/section assignment.
- Compliance documents (birth certificate, transfer certificate) management.

4.2 Student Information System (SIS)
- Student master profile: demographics, guardians, addresses, prior education, IDs.
- Class/section, house, roll number allocation.
- Attendance: daily (class teacher) and period-wise (subject teacher) with reasons.
- Medical info, allergies, emergency contacts.
- Transfers in/out; generate TC/Bonafide/Conduct certificates.
- Document vault for student records.

4.3 Academics
- Timetable: period definitions, subjects, teachers, rooms, constraints (no clashes), rotations.
- Lesson plans: per subject, per week; resources attachments; syllabus coverage tracking.
- Homework/Assignments: create, assign, submit, grade; plagiarism checks (optional); late policies.
- Gradebook: configurable grading schemes, weightages, rubrics, grade boundaries, moderation.
- Attendance-linked interventions: alerts to parents for low attendance; auto-escalations.

4.4 Examinations & Results
- Exam templates: formative/summative, term structure, subject-wise max marks/weightages.
- Exam scheduling: timetable, rooms, invigilators, seating plan.
- Marks entry: bulk upload, validations, moderation workflow, re-evaluation requests.
- Result computation: weighted scores, grades, ranks, CGPA/GPA, pass/fail rules.
- Report cards: templates per grade/board; digital signatures; PDF export.
- Publish results to portals/apps with staged release (teacher review -> admin approve -> publish).

4.5 Fees & Payments
- Fee master: heads (tuition, transport, library), schedules (monthly/term), class-wise structures.
- Concessions: scholarships, discounts, waivers; approval workflows.
- Invoices: auto-generation, partial payments, late fees, interest, fines.
- Online payments: multiple gateways, UPI/cards/netbanking; retry; webhooks; reconciliation.
- Offline payments: cash/cheque/DD receipt entry, deposit tracking.
- Auto-reminders, dunning levels, no-dues certificates.
- Accounting exports/journal entries; tax (GST/VAT) support.

4.6 Communication & Notifications
- Channels: SMS, Email, Push, WhatsApp (where permitted), in-app notifications.
- Templates with personalization; multilingual support.
- Event types: attendance, homework, exams, fees, announcements, emergencies.
- Consent management and opt-outs; rate limits; delivery logs.

4.7 Roles, Permissions & Multi-Tenancy
- Tenants: Organization -> Campus/Branch -> Academic Session -> Class/Section hierarchy.
- Roles: Admin, Principal, Teacher, Student, Parent, Accountant, Librarian, Transport, HR, IT.
- Permission model: RBAC with fine-grained entity-level and action-level permissions.
- SSO/OAuth2/SAML; SCIM (optional); 2FA; password policies.
- Audit logs: who did what, when, from where; immutable store.

4.8 Reporting & Dashboards
- Operational dashboards per persona: attendance heatmaps, fee collections, academic progress.
- Standard reports: admissions funnel, fee due/collected, defaulters, exam analysis, library usage, transport utilization.
- Report builder: filters, groupings, pivots; export CSV/XLS/PDF.

4.9 Transport Management (Phase 2)
- Route & stop management; pick-up/drop-off times; driver and attendant details.
- Vehicle management: fitness, insurance, PUC, permits; maintenance.
- GPS/Telematics integration; live tracking; ETA alerts; geofencing.
- Bus capacity & roster; student stop assignment; fee linkage.
- Incident alerts; panic button integration (where applicable).

4.10 Library (Phase 2)
- Catalog: MARC/ISBN import, categories, tags, vendors.
- Circulation: issue/return/renew; fines; reservations; reminders.
- Inventory & stock verification; barcodes/RFID support.
- OPAC for students/teachers; reading history.

4.11 Hostel/Residence (Phase 2)
- Room allocation, occupancy, mess/meal plans, leave/outpass, visitors.
- Discipline logs; curfew alerts; fees linkage.

4.12 HR & Payroll Inputs (Phase 2)
- Staff directory; contracts; qualifications; certifications.
- Attendance & leave management; substitutes; timesheets (optional).
- Payroll inputs export to ERP; loans/advances tracking.

4.13 Health & Clinic (Phase 2)
- Health profiles; vaccinations; screenings; incident/first-aid logs.
- Nurse workflows; referral letters; consent forms.

4.14 Events, Calendar & PTM
- School calendar: terms, holidays, events; sync with Google/Microsoft calendars (optional).
- PTM scheduling with slots; feedback forms; sign-ins.

4.15 Discipline & Behavior
- Incident reporting; categories; demerit/merit points; interventions; guardians notified.

4.16 Integrations
- Payment gateways (Stripe/Razorpay/PayU/etc.).
- SMS/Email providers (Twilio, SendGrid, local SMS gateways).
- SSO (Google Workspace, Microsoft, OAuth/SAML).
- LMS/VLE (Google Classroom, Moodle, MS Teams) — optional.
- Accounting/ERP exports (Tally, QuickBooks, Xero) — via CSV/APIs.
- GPS providers for transport.


5. Non-Functional Requirements (NFRs)
- Security & Privacy
  - Data isolation per tenant; encryption at rest and in transit.
  - Role-based access; least privilege; audit trails; anomaly detection.
  - PII minimization; data retention policies; secure deletion; consent management.
  - Compliance: FERPA/COPPA (US), GDPR (EU), local data residency where required; accessibility (WCAG 2.1 AA).
- Performance & Scalability
  - Support 100k+ users per tenant; 10k concurrent sessions; p95 < 300ms for critical APIs.
  - Horizontal scale; read replicas; CDN for assets; rate limiting and throttling.
- Availability & Reliability
  - 99.9% uptime (MVP), 99.95% (later); multi-AZ; backups (RPO <= 15m), DR (RTO <= 2h).
- Observability
  - Centralized logs, metrics, tracing; alerting; audit logs.
- Internationalization
  - Multi-language UI; locale-specific formats; right-to-left support (optional).
- Mobile
  - Responsive web; iOS/Android apps (later) with offline-first for attendance/homework.
- Data & Analytics
  - Data warehouse friendly schema; ETL pipelines; BI tool connectors.


6. System Architecture (High-Level)
- Multi-tenant SaaS: Org -> Branch -> Academic Session hierarchy.
- Services
  - Core Service: Users, Roles, Tenants, Sessions.
  - SIS Service: Students, Classes, Attendance, Documents.
  - Academics Service: Timetable, Homework, Gradebook, Exams.
  - Finance Service: Fees, Invoices, Payments, Reconciliation.
  - Communication Service: Templates, Delivery, Logs.
  - Reporting Service: Reports & Analytics.
  - Integration Service: Gateways, SSO, Webhooks.
- API-First: REST + Webhooks; GraphQL optional. Async via message bus (e.g., Kafka/SNS/SQS).
- Storage: Relational DB (Postgres/MySQL) for OLTP; object storage for documents; Redis for cache; search engine (Elasticsearch/OpenSearch) for full-text.
- Identity: OAuth2/OIDC; JWT with short TTL; refresh tokens; 2FA; SAML (optional).
- Infra: Containerized (Docker/K8s) with IaC; secrets manager; WAF; CDN.


7. Data Model (Indicative)
Core Entities
- Organization(id, name, code, address, contact)
- Branch(id, org_id, name, code, address)
- AcademicSession(id, branch_id, name, start_date, end_date, active)
- User(id, org_id, email, phone, password_hash, status)
- Role(id, name)
- UserRole(user_id, role_id, scope_ref)
- Student(id, branch_id, admission_no, first_name, last_name, dob, gender, guardian_primary_id, status)
- Guardian(id, student_id, relation, name, email, phone, address)
- Class(id, branch_id, name, grade_level)
- Section(id, class_id, name, capacity)
- Subject(id, branch_id, code, name, grade_level)
- Teacher(id, branch_id, user_id, subjects[])
- Timetable(id, section_id, day, period, subject_id, teacher_id, room_id)
- Attendance(id, student_id, date, period_id, status, reason, recorded_by)
- Homework(id, section_id, subject_id, title, description, attachments[], due_date)
- Submission(id, homework_id, student_id, submitted_at, grade, remarks)
- Exam(id, branch_id, session_id, term, name, start_date, end_date)
- ExamComponent(id, exam_id, subject_id, max_marks, weightage)
- Mark(id, exam_component_id, student_id, marks, grade, moderated)
- FeeHead(id, branch_id, name)
- FeeStructure(id, branch_id, class_id, schedule, amount, fee_head_id)
- Invoice(id, student_id, due_date, amount, status)
- Payment(id, invoice_id, method, amount, txn_ref, status, gateway, paid_at)
- Communication(id, org_id, channel, template_id, recipient, payload, status, sent_at)
- AuditLog(id, actor_id, action, entity, entity_id, context, timestamp)


8. User Journeys (Happy Paths)
- Admission to Enrolment
  1) Parent fills application form, uploads documents, pays application fee.
  2) Admin reviews, schedules interview/test, records scores.
  3) Offer generated with fee details; parent accepts and pays admission fee.
  4) Student record created; class/section assigned; credentials issued to parent/student.

- Daily Teacher Flow
  1) Review timetable; mark attendance for homeroom and each period.
  2) Create homework with attachments; auto-notify parents.
  3) Enter grades for quizzes/assignments; see analytics of class performance.

- Examination Cycle
  1) Exam controller sets up term and components with weightages.
  2) Teachers enter marks; moderation; admin approves.
  3) System computes results; generates report cards; publishes to portal.

- Fee Collection
  1) Fee structures configured by class; invoices auto-generated per schedule.
  2) Parents receive reminders; pay online; receipt auto-generated.
  3) Finance dashboard shows collections vs dues; export to accounting.


9. Reporting Catalog (Initial Set)
- Admissions: Leads by source, conversion funnel, accepted vs waitlisted.
- Attendance: Daily summary, chronic absenteeism, section/subject-level trends.
- Academics: Homework completion, grade distributions, top/bottom performers.
- Exams: Term-wise analysis, subject performance, class rank lists, moderation impact.
- Fees: Dues by aging, collections by mode, defaulters, waivers/scholarships, reconciliation status.
- Library: Circulation, overdue, fines, popular titles.
- Transport: Route utilization, delays, incidents, maintenance due.


10. Compliance & Policy
- Data protection: parental consent for under-13/16 as per locale; data minimization.
- Student records retention policy; export on transfer; right to access/correct/delete as allowed by law.
- Assessment integrity: access controls; change logs; moderation records.
- Accessibility: WCAG 2.1 AA for web; captions/alt text; keyboard navigation.
- Identity verification for staff; background checks recording (where applicable).


11. Success Metrics & KPIs
- Operational: % attendance marked by 10 AM; % homework assigned graded within 72h; outage minutes.
- Financial: DSO (days sales outstanding), fee realization %, online payment share.
- Engagement: Monthly active parents/students; notification open rates; PTM participation rate.
- Academic: On-time syllabus coverage; pass rate; distribution shifts post-interventions.


12. MVP vs Roadmap
MVP (3–4 months)
- Multi-tenant setup, RBAC, core SIS (students, classes, attendance), timetable.
- Homework/assignments, basic gradebook.
- Exams with simple templates; report card PDF.
- Fees (structures, invoices, online payments via 1–2 gateways, reminders, reconciliation basics).
- Communication via Email + SMS; in-app notifications.
- Dashboards for Admin/Principal/Teacher; 20–30 core reports.
- Basic mobile-responsive web.

Phase 2 (next 3–6 months)
- Transport with GPS, Library, Events/PTM, Discipline, Health, HR inputs.
- Advanced analytics; report builder; data warehouse export.
- Mobile apps (Parent/Teacher) with push.
- Integrations marketplace; SSO/SAML; SCIM.

Phase 3 (beyond 12 months)
- Hostel, Inventory/Assets, Payroll integration, LMS functionality, AI assistants, proctoring.


13. UX & Accessibility Guidelines
- Simple navigation by persona; sticky global search; breadcrumbs.
- Consistent status colors; high contrast; keyboard shortcuts for power users.
- Offline-aware forms for attendance/homework in mobile.
- Print-friendly report cards and certificates.


14. Risks & Mitigations
- Complex fee permutations: invest in flexible fee engine; strong QA with real school scenarios.
- Data migration from legacy systems: build importers and validation reports.
- Regulatory diversity by country: configuration and localization strategy; legal review.
- Adoption resistance: training materials, sandbox mode, phased rollout.
- Integration dependencies: abstractions and queue-based retries; fallbacks.


15. Assumptions & Out of Scope (for MVP)
- No payroll processing (only inputs/exports).
- No deep LMS content authoring (can integrate initially).
- No custom development per school in core; extensibility via config and plugins.


16. Open Questions
- Which education boards/curricula must be supported first (CBSE/ICSE/IB/State/US Common Core)?
- Regional compliance priorities (data residency, messaging providers)?
- Payment gateways priority per market?
- Mobile apps immediate need vs PWA acceptable for MVP?


17. Appendices
A) Glossary
- SIS: Student Information System. LMS: Learning Management System. PTM: Parent-Teacher Meeting. RBAC: Role-Based Access Control. DSO: Days Sales Outstanding.

B) Example Report Card Template Fields
- Student details, attendance summary, subject-wise marks, grade, teacher remarks, promotion decision, signatures.

C) Example Fee Structure
- Class 8: Tuition (monthly), Transport (zone-based), Lab (term), Library (annual). Scholarships 25% tuition waiver for 10 students.

D) Data Retention Example
- Alumni records retained for 5 years post-graduation; financial records 7 years; audit logs 1 year.

