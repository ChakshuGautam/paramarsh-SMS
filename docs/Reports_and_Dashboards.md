# Reports & Dashboards — Specifications

Version: 1.0
Status: Draft

Dashboard Widgets (examples)
- Attendance Rate (line + weekly heatmap), Fee Collection vs Target (gauge), Exam Average by Subject (bar), Homework Completion (donut).

Report Specs (selected)
1) Admissions Funnel
- Dataset: leads, applications, shortlisted, offers, enrolled
- Filters: date range, grade, source
- Output: counts, conversion %, stacked bar; export CSV

2) Attendance Daily Summary
- Dataset: attendance_daily
- Filters: branch, class, section, date
- Output: present %, absent %, excused count; table by section

3) Exam Analysis by Subject
- Dataset: marks joined with student, subject
- Filters: exam term, class
- Output: avg, median, p90, distribution histogram; top/bottom 10 students

4) Fee Dues Aging
- Dataset: invoices
- Buckets: 0-30, 31-60, 61-90, >90
- Output: totals per bucket by class; defaulters list

5) Library Overdues
- Dataset: circulation
- Output: overdue count by days, fines accrued; borrower list

Report Builder
- Datasets: students, attendance_daily, attendance_period, homework, submissions, exams, marks, invoices, payments, library, transport.
- User-defined: select fields, filters, group by, aggregations; save view; schedule delivery (email).

Performance & UX
- Server-side pagination and aggregations; async export with notification on completion; long-running queries capped and cancelable.

