# End-to-End Workflows

Version: 1.0
Status: Draft

1) Admission to Enrolment
- Trigger: Application submitted
- Steps: Review -> Interview -> Score -> Shortlist -> Offer -> Accept+Pay -> Enrol -> Create Student -> Assign Class/Section -> Credentials
- SLAs: Offer response window default 7 days; reminders at T+3, T+6
- Edge cases: Payment failed -> retry; Document missing -> conditional offer; Waitlist auto-promotion.

2) Daily Attendance
- Trigger: Class start time
- Steps: Teacher marks -> System notifies absentees -> Admin reviews anomalies -> Parent replies -> Status update (excused)
- Edge: Offline marking -> Sync; Teacher absence -> Substitute assignment.

3) Exam Cycle
- Trigger: Term planning
- Steps: Define components -> Schedule -> Marks entry -> Moderation -> Approve -> Compute -> Publish -> Re-eval (optional)
- Controls: Dual approval for publish; lock grades post publish.

4) Fee Collection
- Trigger: Invoice schedule
- Steps: Generate invoices -> Notify -> Receive payments -> Reconcile -> Dunning for overdue -> No-dues certificate on request
- Edge: Scholarship application mid-term -> pro-rate next invoice; Refund policy handling.

5) Transport Route Changes
- Trigger: Parent request address change
- Steps: New stop assignment -> Capacity check -> Approval -> Update fee -> Notify driver/parent

6) Library Circulation
- Trigger: Issue request
- Steps: Scan -> Issue -> Reminder -> Return -> Fine calculation -> Pay fine

7) PTM Scheduling
- Trigger: Term end
- Steps: Create sessions -> Teachers set slots -> Parents book -> Reminders -> Conduct -> Feedback collection

8) Discipline Incident
- Trigger: Incident reported
- Steps: Log -> Categorize -> Notify -> Investigate -> Action -> Parent meeting -> Close with notes

