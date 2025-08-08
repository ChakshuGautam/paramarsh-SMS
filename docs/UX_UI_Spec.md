# UI/UX Specification — School Management System

Version: 1.0
Status: Draft

Overview
- This document specifies end-to-end UI for all modules, including navigation, screens, layouts, components, fields, validations, states, accessibility, and analytics events.
- Tech stack (frontend): Next.js (App Router), ShadCN/UI (Radix + Tailwind), TanStack Table (headless) for data grids, React Query (TanStack Query) for data fetching/caching, Zod for schema validation, i18next for i18n.
- Design system: ShadCN components + Tailwind. Primitives used: Button, Input, Select, Popover, Calendar, DatePicker, TimePicker, TextArea, Switch, RadioGroup, Checkbox, Command (global search), Table (TanStack), Badge, Breadcrumbs, Tabs, Dialog/Drawer, Toast/Sonner, Tooltip, Stepper, Progress, Pagination, Avatar.
- Global UI: Next.js layout with top nav (tenant switcher Org/Branch/Session), Command palette (Cmd/Ctrl+K), notifications, user menu; left sidebar per role; breadcrumbs on detail pages.
- Accessibility: Use Radix primitives via ShadCN for focus management and ARIA; test with Keyboard/Screenreader; WCAG 2.1 AA.

Conventions
- Field descriptor format: Label (data_type) [required?] {validation} [help] (default)
- Actions: Primary, Secondary; destructive confirmed by modal.
- States: empty, loading, error, success; skeletons for tables; optimistic updates where safe.
- Accessibility: WCAG 2.1 AA, keyboard navigable, ARIA roles, color contrast ≥ 4.5:1.
- Internationalization: All labels via i18n keys; date/time/number localized; RTL support optional.

1) Admissions & Enrolment
1.1 Admissions Dashboard
- Purpose: Monitor leads, applications, conversion.
- Navigation: Admissions > Dashboard
- Layout: KPIs (cards), Funnel chart, Table of active applications.
- KPIs: Leads, Applications, Shortlisted, Offers, Enrolled, Conversion %.
- Table columns: App ID, Applicant Name, Grade Applying, Status, Created, Last Activity, Owner, Actions.
- Filters: Grade, Status, Date range, Source, Owner.
- Actions: Export CSV, Create Application.
- Analytics: admissions_dashboard_view, filter_used, export_click.

1.2 Application Form Builder
- Navigation: Admissions > Form Builder
- Layout: Left palette (Field types), Canvas (Form), Right panel (Field props).
- Field types: Text, Number, Email, Phone, Date, Select, Multi-select, Address, File Upload, Toggle, Section, Info.
- Field props: Label, Placeholder, Required, Options, Default, Validation regex, Tooltip/help, Visibility rules.
- Actions: Add Field, Reorder (drag), Duplicate, Delete, Preview, Publish, Versioning.
- Validations: Duplicate field keys blocked; max 100 fields/form; required must be enforceable.
- States: Draft, Published, Archived.
- Analytics: form_builder_open, field_add, field_delete, publish_click.

1.3 Public Application Form (Parent View)
- Navigation: Public URL
- Layout: Multi-step (Stepper): Applicant, Guardians, Previous Education, Documents, Review, Payment.
- Fields (examples):
  - Applicant: First Name (text)[req], Last Name (text)[req], DOB (date)[req]{3-20y}, Gender (select), Nationality (text), Address (address comp).
  - Guardians: Guardian 1 Name (text)[req], Relation (select)[req], Email (email){format}, Phone (phone){E.164}, Occupation (text).
  - Previous Education: School (text), Grade (select), Scores (number).
  - Documents: Birth Certificate (file)[req]{pdf/jpg,pdf<5MB}, Transfer Cert (file){optional}.
- Actions: Save Draft, Continue, Back, Submit, Pay Application Fee.
- Payment: Hosted checkout in modal/redirect; handle success/failure; receipt display.
- States: Draft saved (unauth session with token), Resume via email link.
- Accessibility: Stepper labeled; errors announced.

1.4 Application Review (Admin)
- Navigation: Admissions > Applications > Detail
- Panels: Applicant details (read-only), Documents viewer (inline PDF), Notes (rich text), Timeline, Status.
- Actions: Schedule Interview (modal: date/time, interviewer, location/virtual link), Score entry, Shortlist, Waitlist, Reject, Offer Admission.
- Validations: Cannot offer without required documents and score.
- Notifications: Email/SMS to parent on status change with templates.

1.5 Offer & Enrolment
- Offer Letter: Template preview; Fee breakdown; Deadline; Accept/Decline.
- Enrolment: On Accept + Payment, create Student, assign Class/Section, generate Credentials.
- UI: Enrol wizard (Assign Class, Assign House, Generate Roll No, Issue ID Card optional).

2) SIS & Attendance
2.1 Student Directory
- Navigation: Students > Directory
- Table: Photo, Name, Admission No, Class-Section, Status, Guardian, Phone, Actions.
- Filters: Class, Section, Status, Gender, House, Year.
- Actions: Add Student, Import CSV, Export, Bulk Actions (Promote, Assign House, Send Message).
- Row actions: View, Edit, Transfer, Generate Certificate.

2.2 Student Profile
- Tabs: Overview, Academics, Attendance, Fees, Documents, Health, Discipline, Transport, Library.
- Overview fields: Photo (upload), Name, Admission No, Class-Section, Roll No, House, DOB, Gender, Address, Guardians (list with primary), Emergency Contacts.
- Actions: Edit, Add Document, Generate Certificate (TC/Bonafide/Conduct), Transfer Out.

2.3 Attendance
- Daily Attendance (Class Teacher): Class-Section selector; Roster with Present/Absent/Late/Excused toggles; Reason text for exceptions.
- Period Attendance (Subject Teacher): Timetable-driven; list of students with status.
- Validations: Cannot submit attendance before class start time (configurable grace). Late updates require reason.
- Bulk: Mark all present.
- Edge: Offline mode (cache and sync on reconnect).

3) Academics
3.1 Timetable Builder
- Grid by days/periods; drag teacher/subject/room onto slots; conflict detection with toasts.
- Views: Class view, Teacher view, Room view.
- Actions: Auto-generate (constraints), Publish timetable.

3.2 Lesson Plans
- List by Subject/Week; create rich-text plan with attachments, syllabus tags, learning outcomes.
- Templates reusable; coverage % auto from completed lessons.

3.3 Homework/Assignments
- Create: Title, Description (rich), Attachments, Subject, Class-Section(s), Assigned Date, Due Date/Time, Submission method (online/offline), Rubric (optional).
- Student View: My Homework list; Status chips (Pending, Submitted, Graded, Late).
- Teacher Grading: Submissions table; inline annotation (for PDFs), grade entry, remarks; bulk publish grades.
- Notifications: Auto to parents/students on assign, due soon, graded.

3.4 Gradebook
- Config: Grading scheme (points/percent/grade), weightages per component; min pass marks; grace policy.
- UI: Spreadsheet-like grid; keyboard nav; validations; import/export CSV.

4) Examinations & Results
4.1 Exam Setup
- Create Exam Term; add Subjects components with Max Marks and Weightage; seating plan generation.

4.2 Marks Entry & Moderation
- Teacher entry grid per subject/section; validation (range); moderation view for HoD with delta highlighting; re-evaluation requests.

4.3 Results & Report Cards
- Compute results; preview report cards; templates per board; add remarks; lock and publish.
- Parent/Student portal: View/Download PDF; watermark if unpaid fees (config).

5) Fees & Payments
5.1 Fee Master & Structures
- Define Fee Heads; Structures per Class/Student category; Schedules (monthly/term); Transport linkage.
- UI: Wizard to define structure; preview invoices generated.

5.2 Invoicing & Collections
- Invoices list with status; filters by due; bulk reminders; payment posting (offline).
- Payment page (parent): Checkout, saved methods (tokenized), UPI intent, retry flows.
- Reconciliation: Gateway settlement screen; mismatch resolution.

6) Communication & Notifications
- Templates with handlebars-like variables; test send; channel fallbacks; consent/opt-out per guardian.
- Broadcasts: Audience builder (by class/role/filter); rate-limit; throttling; logs with delivery status.

7) Reporting & Dashboards
- Persona dashboards with configurable widgets.
- Report Builder: define dataset, filters, groupings, aggregations; save views; schedule exports.

8) Transport (Phase 2)
- Routes 
  - List: Route Name, Capacity, Buses, Stops
  - Detail: Map view with draggable stop markers; ETA windows; driver roster
- Student Stop Assignment: bulk via CSV; conflicts flagged.
- Live Tracking: Map with bus locations; parent ETA view.

9) Library (Phase 2)
- Catalog: Search by ISBN; add book with metadata; tags; cover upload.
- Circulation: Issue via barcode/RFID; due date calc; fine rules; notifications.

10) Hostel (Phase 2)
- Rooms matrix; allocation; mess plan mapping; outpass requests approval.

11) HR & Payroll Inputs (Phase 2)
- Staff directory; attendance & leave calendar; substitution planner; export payroll inputs.

12) Health & Clinic (Phase 2)
- Student health profiles; incident log; nurse note; referral letter template.

13) Events, Calendar & PTM
- Calendar with term/holiday/events layers; PTM slot booking; reminders.

14) Discipline & Behavior
- Incident logging form; severity; actions taken; parent notification; analytics by type.

Global UI Details
- Error handling: Inline field errors + toast; retry for transient failures.
- Search: Global search across Students/Staff/Classes; keyboard shortcut (/); result preview.
- Theming: Light/Dark; high-contrast mode.
- File Management: All uploads show preview, virus scan status, size/type validation.
- Audit Trail: Per entity timeline panel with actions and metadata.

Component Specs Examples
- Table/DataGrid (TanStack Table + ShadCN Table):
  - Server-side pagination/sort/filter; column pinning; row selection; CSV export; virtualization via react-virtual.
  - Cells support inline edit with Zod validation and optimistic updates (React Query mutation) where safe.
- Dialog/Drawer (ShadCN): Trap focus, ESC to close, sizes S/M/L/XL, preventClose on dirty forms.
- Form: React Hook Form + ZodResolver; debounced autosave; dirty state guard; field-level async validation.
- Command Palette: Global search across Students/Staff/Classes using Command + React Query prefetch.

Analytics Events (global)
- screen_view, click, submit, error, export, filter_change, bulk_action, download, print.

Security/Privacy UI
- Consent banners when required; PII masking for low-permission roles; explicit role labels on sensitive screens.

