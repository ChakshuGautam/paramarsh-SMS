# Architecture & ERD (Narrative)

Version: 1.0
Status: Draft

High-Level Architecture
- Multi-tenant microservices: Core, SIS, Academics, Exams, Finance, Communication, Reporting, Integration.
- API Gateway handles auth, rate-limiting, request routing; services communicate async via message bus for events (student.created, invoice.paid).
- Storage: Postgres for OLTP; S3-compatible object storage for documents; Redis for cache/session; OpenSearch for search and analytics indices.
- Identity: OAuth2/OIDC provider; JWT short-lived; refresh tokens; 2FA; SAML optional.
- Observability: Centralized logging, metrics (Prometheus), tracing (OpenTelemetry), dashboards, alerting.

ERD (Key Relationships — textual)
- Organization 1..* Branch; Branch 1..* AcademicSession.
- Branch 1..* Class; Class 1..* Section; Section *..* Student (through enrolments with session context).
- Student 1..* Guardian; Student *..* Subject (enrolments for electives).
- Staff 1..0..1 Teacher (Teacher is a specialization of Staff).
- Section 0..1 HomeroomTeacher (via homeroomTeacherId → Teacher).
- Teacher *..* Subject; Teacher *..* Section (assignments via timetable).
- Exam 1..* ExamComponent; ExamComponent 1..* Mark (per Student).
- FeeStructure 1..* Invoice (per Student per schedule); Invoice 1..* Payment.
- Homework 1..* Submission (per Student).
- Route 1..* Stop; Stop *..* Student (assignments); Vehicle 1..* GPS Pings.

Scalability Considerations
- Partition large tables by branch/session (e.g., attendance, marks, invoices).
- Async processing for heavy operations (report generation, result compute, reconciliation) with job queues and progress tracking.
- Caching: Read-mostly configs (timetable, fee heads); bust cache on mutation.

Security
- Row-level security policies enforced in DB where feasible.
- Secrets in vault; KMS for encryption; WAF and bot protection at edge.

Disaster Recovery
- PITR backups; multi-AZ, cross-region optional; infra as code; runbooks.

