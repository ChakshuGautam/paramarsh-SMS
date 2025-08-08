# Screen Specs — SIS & Attendance

1) Student Directory
- Route: /students
- Roles: Admin, Teacher (restricted to own classes), Principal (read-all)
- Columns: Photo, Name, Admission No, Class-Section, Status, Guardian, Phone, Actions
- Filters: class, section, status, gender, house, session
- Bulk: Promote, Assign House, Send Message, Export
- Row Actions: View, Edit, Transfer, Certificates

2) Student Profile
- Route: /students/:id
- Tabs: Overview, Academics, Attendance, Fees, Documents, Health, Discipline, Transport, Library
- Edit: in-place section edit with autosave; document upload with preview & virus scan status
- Certificates: TC, Bonafide, Conduct; template selection; e-sign optional

3) Attendance — Daily
- Route: /attendance/daily?class=:id
- Layout: Roster with Present/Absent/Late/Excused toggles; Mark-all-present; Reason field
- Constraints: block before start time; override requires permission; offline mode supported
- Notifications: absent triggers guardian message per consent

4) Attendance — Period
- Route: /attendance/period?subject=:id&section=:id&date=:d
- Pre-filled from timetable; per-period status; copy from previous period; keyboard shortcuts

5) Transfers
- Route: /students/transfers
- Outgoing: generate TC; archive record; notify parent; export packet
- Incoming: minimal profile + docs -> assign class/section -> issue admission no

