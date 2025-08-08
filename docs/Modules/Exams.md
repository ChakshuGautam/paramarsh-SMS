# Exams  Report Cards — Detailed Spec

Plan, conduct, record, and publish assessments.

Data Entities
- Exam(id, termId, type, name, startAt, endAt)
- ExamSession(id, examId, subjectId, roomId)
- MarksEntry(id, studentId, sessionId, rawMarks, grade, moderatedMarks, comments)
- GradeScale(id, bands)

UI Screens
- Admin: Exam Setup, Timetable, Seating, Invigilation, Results Moderation, Templates, Publish
- Teacher: Marks Entry, Verification
- Parent/Student: Report Card, Transcript

APIs
- POST /api/v1/exams
- POST /api/v1/exams/{examId}/sessions
- POST /api/v1/exams/sessions/{sessionId}/marks
- GET /api/v1/exams/{examId}/report-cards

Validations
- Out-of-range marks; moderation logs; lock after publish

Acceptance Criteria
- Report card PDF generation with branding
- Recompute after moderation with audit

Tickets
- EXM-1: Exam Setup  Scheduling (SP: 8)
- EXM-2: Marks Entry UI (SP: 8)
- EXM-3: Report Card Templates  PDF (SP: 13)
- EXM-4: Publish  Locking (SP: 5)

