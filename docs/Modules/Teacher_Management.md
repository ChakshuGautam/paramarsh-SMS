# Teacher Management — Detailed Spec

Manage teacher profiles, schedules, class management, lesson plans, assignments, and teaching-assistant tools.

Data Entities
- Teacher(id, staffId, subjects[], qualifications, experienceYears)
- TeachingAssignment(id, teacherId, sectionId, subjectId, role[primary,assistant])
- LessonPlan(id, teacherId, sectionId, subjectId, date, objectives, activities, materials[], attachments[])
- Assignment(id, sectionId, subjectId, title, dueAt, attachments[], rubric)
- QuickAssessment(id, sectionId, subjectId, type[quiz,poll,exit_ticket], items[], maxMarks)

UI Screens
- Teacher Profile: personal details, qualifications, subjects, certifications.
- My Schedule: classes, substitutions, invigilation; sync to calendar export.
- Class Management: roster, attendance, notes, performance snapshots.
- Lesson Plans: create/reuse templates, coverage tracking against syllabus.
- Assignments & Quick Assessments: create, collect, auto-grade simple quizzes, feedback.

APIs
- GET /api/v1/hr/teachers
- POST /api/v1/hr/teachers
- GET /api/v1/timetable/sections/{sectionId}
- POST /api/v1/lesson-plans
- GET /api/v1/lesson-plans?teacherId&sectionId&from&to
- POST /api/v1/assignments
- GET /api/v1/assignments?sectionId
- POST /api/v1/quizzes
- POST /api/v1/quizzes/{id}/submissions

Integrations
- Timetable: periods and substitutions source.
- LMS-lite: assignments and submissions workflow.
- Exams: marks interoperability; formative results contribute to performance analytics.

Acceptance Criteria
- Teachers view complete weekly schedule and mark attendance directly from class view.
- Lesson plan coverage dashboard shows on-track/behind alerts.
- Quick quizzes usable in-class on mobile; results visible instantly.

Tickets
- TCH-1: Teacher Profile & Directory (SP: 5)
- TCH-2: Schedule & Class Management (SP: 8)
- TCH-3: Lesson Plans (SP: 8)
- TCH-4: Assignments & Quick Assessments (SP: 8)



