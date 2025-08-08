# Screen Specs — Discipline & Behavior

1) Incident Logging
- Route: /discipline/incidents
- Roles: Teacher, Admin, Principal
- Create: date, time, location, involved students, category (bullying, academic dishonesty, etc.), description, attachments, severity, witnesses
- Actions: save as draft, submit for review, escalate to principal, notify guardians

2) Investigation & Actions
- Route: /discipline/incidents/:id
- Tabs: Details, Investigation notes, Actions taken, Parent communication, Outcomes
- Actions: assign investigator, schedule meeting, apply sanctions (warning, detention, suspension), restore privileges
- Audit: all changes logged with actor & timestamp

3) Analytics
- Route: /discipline/analytics
- Charts: incidents by category, by grade, repeat offenders, resolution times

