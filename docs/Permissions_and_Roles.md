# Permissions & Roles Matrix

Version: 1.0
Status: Draft

Roles
- Principal, Admin, Teacher, Student, Parent, Accountant, Librarian, Transport, HR, IT.

Permission Keys (indicative)
- admissions.view, admissions.manage, admissions.offer
- students.view, students.manage, students.transfer, certificates.generate
- attendance.mark, attendance.view_all, attendance.override
- academics.timetable.manage, academics.homework.manage, academics.gradebook.manage
- exams.manage, exams.marks.enter, exams.moderate, exams.publish
- fees.configure, fees.invoice.manage, payments.record, payments.reconcile
- comm.templates.manage, comm.broadcast.send
- transport.manage, transport.track
- library.manage, library.circulate
- hr.manage
- reports.view, reports.export
- settings.manage, roles.manage, audit.view

Matrix (excerpt)
- Principal: reports.view/export, exams.publish, settings.read, students.view_all.
- Admin: admissions.manage, students.manage, attendance.view_all, certificates.generate, fees.configure, roles.assign (limited), reports.
- Teacher: attendance.mark (own classes), homework.manage (own classes), gradebook.manage (own subjects), exams.marks.enter (own subjects).
- Student: self.view, homework.submit, results.view, fees.view/pay.
- Parent: child.view, homework.view, results.view, fees.view/pay, messages.view.
- Accountant: fees.configure, invoices.manage, payments.reconcile, reports.finance.
- Librarian: library.manage, library.circulate.
- Transport: transport.manage, transport.track.
- HR: hr.manage.
- IT: settings.manage, roles.manage, audit.view.

Scoping Rules
- Scope can be Org/Branch/Section/Student; enforcement at API and UI menu visibility.
- Deny-by-default; explicit allow grants access.

Approval Workflows
- Fees discounts > threshold require Principal approval.
- Exam publish requires dual control (Exam Controller + Principal).

Auditability
- Permission checks logged for sensitive actions; changes to roles require reason.

