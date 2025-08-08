# API Schemas — Requests 6 Responses (JSON)

Version: 1.0
Status: Draft

Conventions
- snake_case for DB, camelCase for API.
- Timestamps ISO8601 with timezone.
- Monetary in minor units (e.g., paise/cents) as integers.

Auth
POST /auth/login
- Request: { "email": "string", "password": "string" }
- Response: { "accessToken": "jwt", "refreshToken": "jwt", "expiresIn": 3600 }

Student
GET /students?classId&sectionId&status&cursor&limit
- Response: { "data": [ { "id": "uuid", "admissionNo": "S-001", "firstName": "A", "lastName": "B", "classId": "uuid", "sectionId": "uuid", "status": "active" } ], "nextCursor": "abc" }

POST /students
- Request: { "admissionNo": "string", "firstName": "string", "lastName": "string", "dob": "YYYY-MM-DD", "gender": "male|female|other", "classId": "uuid", "sectionId": "uuid", "guardians": [ { "relation": "father", "name": "string", "email": "string", "phone": "+91..." } ] }
- Response: 201 Created { "id": "uuid" }

Attendance
POST /attendance/daily
- Request: { "classId": "uuid", "date": "YYYY-MM-DD", "entries": [ { "studentId": "uuid", "status": "present|absent|late|excused", "reason": "string" } ] }
- Response: { "saved": true }

Homework
POST /homework
- Request: { "title": "string", "description": "string", "subjectId": "uuid", "sectionIds": ["uuid"], "dueAt": "ISO8601", "attachments": [ { "id": "fileId", "name": "file.pdf" } ] }
- Response: { "id": "uuid" }

Exams
POST /exams
- Request: { "name": "Term 1", "sessionId": "uuid", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "components": [ { "subjectId": "uuid", "name": "Theory", "maxMarks": 80, "weightage": 0.8 } ] }
- Response: { "id": "uuid" }

Fees
POST /fees/invoices
- Request: { "studentIds": ["uuid"], "period": "2025-08", "dueDate": "YYYY-MM-DD", "lines": [ { "feeHeadId": "uuid", "amount": 250000 } ] }
- Response: { "ids": ["uuid"] }

Payments
POST /fees/invoices/:id/pay
- Request: { "method": "upi|card|netbanking", "amount": 250000, "returnUrl": "https://..." }
- Response: { "status": "redirect", "redirectUrl": "https://gateway/..." }

Errors
- Problem+JSON: { "type": "https://docs.sms/errors/validation", "title": "Validation Error", "status": 422, "detail": "Field X is required", "instance": "/request-id/abc", "errors": { "field": ["msg"] } }

