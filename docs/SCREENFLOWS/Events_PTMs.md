# Screen Specs — Events, Calendar & PTM

1) School Calendar
- Route: /calendar
- Roles: Admin, Principal, Teacher, Parent/Student (read)
- Views: Month/Week/List; layers (Terms, Holidays, Events, Exams)
- Actions: Add event (title, description, start/end, location, audience, attachments), recurring rules, publish/unpublish
- Integrations: iCal feed per user; optional Google/Microsoft sync (two-way optional later)

2) Event Management
- Route: /events
- List: title, date, audience, owner, status; filters; export
- Detail: description, attachments, tasks checklist, volunteers, budget (optional)
- Notifications: announcement to audience; reminder schedule

3) PTM Setup
- Route: /ptm/setup
- Create PTM: name, date(s), slot duration, teachers/sections involved, capacity per slot
- Teacher Slot Config: availability editor; block-out times

4) PTM Booking (Parent)
- Route: /ptm/booking
- Parent selects teacher/subject; sees available slots; books one per teacher; reschedule/cancel policy
- Confirmation: email/SMS/push; calendar invite (ICS)

5) PTM Conduct & Feedback
- Route: /ptm/sessions
- Teacher view: today’s schedule, check-in button, notes field, mark no-show
- Parent feedback form: rating, comments; optional anonymized analytics

