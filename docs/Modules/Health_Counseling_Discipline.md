# Health, Counseling, Discipline — Detailed Spec

Clinic visits, medications, immunizations; counseling notes; discipline incidents.

Data Entities
- ClinicVisit(id, studentId, complaint, diagnosis, treatment, referred, visitAt)
- Immunization(id, studentId, vaccine, dueAt, completedAt)
- CaseNote(id, studentId, counselorId, summary, privacyLevel)
- Incident(id, studentId, type, severity, action, recordedAt)

UI Screens
- Nurse: Visits, Medications, Immunizations
- Counselor: Cases (restricted access)
- Discipline Officer: Incidents, Actions

Permissions
- Strict need-to-know; sealed records; audit access

Acceptance Criteria
- Sealed notes only visible to assigned counselor + admin override with dual auth

Tickets
- HCD-1: Clinic  Immunization (SP: 8)
- HCD-2: Counseling Notes with Sealed Access (SP: 8)
- HCD-3: Discipline Incidents (SP: 5)
