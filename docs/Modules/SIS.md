# Student Information System (SIS) — Detailed Spec

Single source of truth for student, guardian, and enrollment data.

Data Entities
- Student(id, rollNumber, firstName, lastName, dob, gender, languages, house, piiRef)
- Guardian(id, name, relation, contacts, consentFlags)
- GuardianLink(id, studentId, guardianId, custodyType)
- Enrollment(id, studentId, sectionId, status, startDate, endDate)
- DocumentVault(id, ownerType, ownerId, type, url)

UI Screens
- Admin: Student List, Profile, Bulk Promote, Transfers
- Parent/Student: Profile (view-only), Documents, Consents

Flows
- Create Student → Link Guardians → Assign Section → Confirmation (see docs-cursor sequence diagram)

APIs
- POST /api/v1/students
- PATCH /api/v1/students/{id}
- GET /api/v1/students/{id}
- POST /api/v1/students/{id}/guardians
- POST /api/v1/students/{id}/enrollments

Permissions
- Admin: full
- Teacher: read section students
- Parent/Student: read own

Validations
- Unique roll number per section/year
- Consent flags for data sharing

Acceptance Criteria
- Bulk promote with dry-run report
- Import/export CSV with validation report

Checklist
- PII segregated; audit logs; soft deletes

Tickets
- SIS-1: Student CRUD (SP: 8)
- SIS-2: Guardian Linking & Consents (SP: 5)
- SIS-3: Enrollment Management (SP: 8)
- SIS-4: Bulk Promote/Transfer (SP: 8)

