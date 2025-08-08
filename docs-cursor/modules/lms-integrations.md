# LMS-lite & Integrations — Detailed Spec

## Overview
Assignments, content sharing, quizzes; LTI/SCORM optional integrations.

## Data Entities
- Content(id, ownerId, subjectId, url, type)
- Assignment(id, sectionId, dueAt, description, attachments[])
- Submission(id, assignmentId, studentId, url, grade)

## APIs
- POST /api/v1/lms/assignments
- POST /api/v1/lms/assignments/{id}/submissions

## Acceptance Criteria
- Grade sync to gradebook; LTI launch with claims mapping

## Tickets
- LMS-1: Assignments & Submissions (SP: 8)
- LMS-2: LTI 1.3 Provider (SP: 13)
