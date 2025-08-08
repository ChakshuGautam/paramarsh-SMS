# Data Migration & Import Guidelines

Version: 1.0
Status: Draft

Scope
- Migrating from legacy systems/spreadsheets into SMS modules: Students/Guardians, Classes/Sections, Subjects/Teachers, Fee Structures, Invoices/Balances, Exam History (optional), Library Catalog, Transport Assignments.

General Principles
- Use CSV templates with strict headers and sample rows.
- Validate before import: schema + referential integrity + duplicate checks.
- Dry-run mode: report errors without writing.
- Idempotent imports using natural keys (admission_no, employee_id, isbn).

Templates
- students.csv: admission_no, first_name, last_name, dob(YYYY-MM-DD), gender, class, section, guardian1_name, guardian1_phone, guardian1_email, address
- classes.csv: class_name, grade_level
- sections.csv: class_name, section_name, capacity
- subjects.csv: subject_code, subject_name, grade_level, elective(true/false)
- teachers.csv: employee_id, first_name, last_name, email, phone, subjects(csv)
- fees_structures.csv: class_name, fee_head, schedule, amount, category
- invoices.csv: admission_no, period, due_date, amount, line_items(json)
- library_books.csv: isbn, title, author, year, tags
- transport_assignments.csv: admission_no, route_name, stop_name

Process
1) Prepare CSVs using templates.
2) Dry-run: upload files, receive validation report.
3) Fix errors and re-upload until green.
4) Commit import: system creates/updates records; audit logs record source and operator.
5) Reconciliation reports: counts, duplicates resolved, errors skipped.

Edge Cases
- Duplicate admission_no: skip or merge with review.
- Missing class/section: auto-create (configurable) or error.
- Fee balance carry-forward: create opening balance invoices.

Security/Privacy
- Anonymize PII when generating test data; secure upload with signed URLs; purge staging files after 30 days.

