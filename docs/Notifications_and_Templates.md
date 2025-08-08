# Notification Templates & Events

Version: 1.0
Status: Draft

Channels
- SMS, Email, Push, WhatsApp (where permitted), In-app.

Event Catalog (examples)
- Admissions: application_submitted, interview_scheduled, offer_sent, enrolment_confirmed
- Attendance: student_absent_daily, student_absent_period, low_attendance_alert
- Homework: homework_assigned, homework_due_soon, homework_graded
- Exams: exam_schedule_published, result_published, reevaluation_update
- Fees: invoice_issued, payment_due_soon, payment_received, payment_failed
- Transport: bus_eta, bus_delay, incident_alert
- Library: book_due_soon, book_overdue, fine_incurred

Template Variables (examples)
- {{student.name}}, {{guardian.name}}, {{class.name}}, {{section.name}}, {{due_date}}, {{amount}}, {{invoice.id}}, {{exam.name}}, {{result.url}}

Samples
- SMS: "{{school.name}}: {{student.name}} is absent today ({{date}}). Reply 1 if excused."
- Email Subject: "Your ward {{student.name}}'s Report Card is published"
  Body (HTML): Greeting, term summary, secure link, contact info; include inline branding.
- Push: "Homework due tomorrow for {{subject}}"

Consent & Preferences
- Guardian-level opt-in/out per channel and category; quiet hours config; regional compliance (DND/TRAI/etc.).

Delivery Policies
- Retries with exponential backoff; fallback channel after N failures; provider failover.

Logging
- Store provider response, message ID, delivery status, error; link to entity and template version.

