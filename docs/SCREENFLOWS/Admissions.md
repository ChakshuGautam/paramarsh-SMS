# Screen Specs — Admissions & Enrolment

1) Admissions Dashboard
- Route: /admissions/dashboard
- Roles: Admin, Principal
- Widgets: KPI cards (Leads, Applications, Shortlisted, Offers, Enrolled), Funnel, Applications table
- Filters: grade, status, source, owner, date_range
- Empty State: “No applications yet. Create your first form.” CTA -> Form Builder
- Errors: Data fetch failure -> Retry + support link

Applications Table
- Columns: Id, Applicant, Grade, Status, Owner, Created, Last Activity, Actions[…]
- Sort: Created, Last Activity
- Bulk: Assign Owner, Change Status, Export CSV

2) Form Builder
- Route: /admissions/forms/builder/:id?
- Roles: Admin
- Components: Palette, Canvas, Inspector
- Fields: text, textarea, number, email, phone, date, select, multiselect, address, file, section, info, toggle
- Versioning: draft -> published; immutable published versions; create new draft from published
- Validation Rules: regex, min/max, required, conditional visibility (expression on other fields)
- Autosave: every 3s debounce; version name required for publish

3) Public Application
- Route: /apply/:form_slug
- Auth: magic-link for draft resume
- Steps: Applicant -> Guardians -> Prior -> Documents -> Review -> Payment
- Payment: hosted checkout; webhooks; idempotent retry on network failure
- Receipt: email and on-screen; link to resume portal view

4) Review & Offer
- Route: /admissions/applications/:id
- Panels: Details, Documents, Notes, Interview, Timeline, Status
- Actions: Schedule Interview, Record Score, Shortlist, Waitlist, Reject, Offer
- Guardrails: cannot Offer until required docs uploaded & score present
- Offer Letter: template variables, expiry date/time, fee summary, scholarship line items
- Enrolment Wizard: class/section assignment, roll no. generation, house allocation, credentials issuance

5) Imports
- Route: /admissions/imports
- CSV template download; validation preview; partial import with error report

