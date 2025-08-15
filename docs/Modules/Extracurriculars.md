# Extracurriculars & Events — Detailed Spec

Track activities, clubs, events, participation, and achievements.

Data Entities
- Activity(id, name, type[club,sport,arts,competition], description)
- Event(id, activityId, name, date, location, organizerId, capacity, registrations[], attachments[])
- Participation(id, studentId, activityId|eventId, role[participant,leader], status[registered,attended,won], points)
- Achievement(id, studentId, title, level[school,inter-school,state,national,international], date, evidenceUrl)

UI Screens
- Activities & Clubs: catalog, join/leave, rosters.
- Events Calendar: upcoming/past events, registration, attendance marking.
- Achievements: student portfolio, approvals, export certificates.
- Admin: scheduling, approvals, reports (participation rates, points).

APIs
- GET /api/v1/extracurricular/activities
- POST /api/v1/extracurricular/activities
- GET /api/v1/extracurricular/events?from&to
- POST /api/v1/extracurricular/events
- POST /api/v1/extracurricular/events/{id}/register
- POST /api/v1/extracurricular/events/{id}/attendance
- POST /api/v1/extracurricular/achievements

Reports & Analytics
- Participation by grade/house/gender; points leaderboard; correlation with academics/attendance.

Acceptance Criteria
- Conflict detection with academic timetable when scheduling events.
- Evidence-backed achievement approvals; certificates generated from templates.



