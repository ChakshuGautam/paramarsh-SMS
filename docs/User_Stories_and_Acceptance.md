# User Stories and Acceptance Criteria — School Management System

Version: 1.0
Status: Draft

Conventions
- Format: As a [role], I want [capability], so that [benefit].
- Acceptance Criteria use Gherkin-style bullets.

Admissions & Enrolment
1) Application Form Builder
- Story: As an Admin, I want to add custom fields to the application form so that I can capture school-specific information.
- Acceptance:
  - Given I am on Form Builder, when I drag a Text field and set it Required, then saving publishes a form version.
  - When a parent submits without the field, then an error is displayed and submission is blocked.
  - When I publish a new version, then new applicants see the latest version while existing drafts remain on their original version.

2) Application Review and Offer
- Story: As an Admin, I want to shortlist candidates and send offers to selected applicants so that enrolment proceeds smoothly.
- Acceptance:
  - Cannot send Offer unless required documents are uploaded and fee configured.
  - Offer email/SMS is sent using the offer template; audit log records actor and timestamp.
  - When parent accepts and pays, a Student record is created and assigned to a class/section.

SIS & Attendance
3) Daily Attendance
- Story: As a Class Teacher, I want to mark daily attendance for my homeroom so that records are up to date.
- Acceptance:
  - Mark all present sets all students to Present; exceptions can be toggled.
  - Submissions before class start time are blocked unless override permission is granted.
  - Parents of absent students receive notifications according to consent and channel availability.

4) Certificates
- Story: As an Admin, I want to generate Transfer Certificates and Bonafide certificates so that I can process student transfers.
- Acceptance:
  - Certificate contains school header, student details, issue date, signature blocks; PDF is generated.
  - A copy is stored in the student document vault; audit event created.

Academics
5) Homework Creation and Grading
- Story: As a Teacher, I want to assign homework and grade submissions so that students receive timely feedback.
- Acceptance:
  - Creating homework notifies target classes; due soon reminders are scheduled.
  - Submissions after due time are marked Late; grace policy applies if configured.
  - Grades can be bulk published; students/parents see grades post publish event.

Exams
6) Exam Setup and Results
- Story: As an Exam Controller, I want to configure exam terms and compute results so that report cards can be published.
- Acceptance:
  - Components have max marks and weightage; weightage sum per subject equals 100%.
  - Moderation logs show changes with actor and reason.
  - Report cards are versioned and locked upon publication.

Fees
7) Fee Structure and Invoices
- Story: As a Finance user, I want to define fee structures and auto-generate invoices so that collections are streamlined.
- Acceptance:
  - Fee heads can be class/category-specific; scholarships applied reduce invoice amount with audit.
  - Online payments update invoice status via gateway webhooks; reconciliation view flags mismatches.

Communication
8) Broadcast Messaging
- Story: As an Admin, I want to send announcements to selected classes so that everyone is informed.
- Acceptance:
  - Audience builder filters by class/role; preview shows recipient count.
  - Rate limits enforced per provider; delivery logs show status per recipient.

Transport (Phase 2)
9) Route and Stop Management
- Story: As a Transport Coordinator, I want to manage routes and assign students to stops so that buses are optimally utilized.
- Acceptance:
  - Route capacity is enforced; conflicts are flagged with suggestions.

Library (Phase 2)
10) Circulation
- Story: As a Librarian, I want to issue and receive books using barcodes so that circulation is fast.
- Acceptance:
  - Due dates calculated by membership rules; overdue fines accrue; notifications sent.

Cross-cutting
11) RBAC
- Story: As IT Admin, I want to manage roles and permissions so that least privilege is maintained.
- Acceptance:
  - Role assignments scoped by Branch/Section; audit logs capture changes; permission matrix enforced on APIs.

12) Audit and Compliance
- Story: As a Compliance Officer, I want immutable audit logs so that I can trace actions for reviews.
- Acceptance:
  - Logs include actor, timestamp, IP, user agent, entity, action, before/after snapshot (where safe).

13) Performance
- Story: As an end user, I want lists to load quickly so that I can work efficiently.
- Acceptance:
  - For 10k students per branch, directory loads within p95 300ms backend and 1.5s FCP on desktop broadband.

