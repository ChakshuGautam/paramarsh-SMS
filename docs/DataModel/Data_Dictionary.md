# Data Dictionary — Entities & Fields

Version: 1.0
Status: Draft

Notes
- Types: string, text, integer, decimal(n,2), boolean, date, datetime, enum, json, uuid, file_ref.
- All tables include: id (uuid), created_at, updated_at, created_by, updated_by. Soft delete: deleted_at (nullable) for non-critical.

Organization
- organization: name(string), code(string unique), address(text), phone(string), email(string)

Branch
- branch: org_id(uuid FK), name(string), code(string), address(text), phone(string), email(string)

AcademicSession
- academic_session: branch_id, name(string), start_date(date), end_date(date), active(boolean)

User
- user: org_id, email(string uniq), phone(string), password_hash(string), first_name(string), last_name(string), status(enum: active,inactive,invited), last_login(datetime), mfa_enabled(boolean)

Role & Permissions
- role: name(string), description(text)
- permission: key(string uniq), scope(enum: org,branch,section,student)
- role_permission: role_id, permission_key
- user_role: user_id, role_id, scope_ref(json: {branch_id, section_id})

Student & Guardian
- student: branch_id, admission_no(string uniq per branch), roll_no(string), first_name, last_name, dob(date), gender(enum: male,female,other,prefer_not), house(enum), status(enum: active,transferred,alumni), category(enum: general,sc,st,obc,other configurable), nationality(string)
- guardian: student_id, relation(enum: father,mother,guardian,other), name, email, phone, address(text), primary(boolean)

Class & Section & Subject
- class: branch_id, name(string), grade_level(integer)
- section: class_id, name(string), capacity(integer)
- subject: branch_id, code(string), name(string), grade_level(integer), elective(boolean)

Timetable & Attendance
- period: branch_id, name, start_time, end_time
- timetable: section_id, day(enum Mon..Sun), period_id, subject_id, teacher_id, room_id
- attendance_daily: student_id, date, status(enum present,absent,late,excused), reason(text), recorded_by
- attendance_period: student_id, date, period_id, status, reason, recorded_by

Homework & Submissions
- homework: section_id, subject_id, title, description(text), attachments(json[file_ref]), due_at(datetime), submission_method(enum online,offline)
- submission: homework_id, student_id, submitted_at(datetime), grade(decimal), rubric(json), remarks(text), files(json[file_ref])

Exams & Marks
- exam: branch_id, session_id, term(string), name, start_date, end_date
- exam_component: exam_id, subject_id, name, max_marks(decimal), weightage(decimal), rubric(json)
- mark: exam_component_id, student_id, marks(decimal), grade(string), moderated(boolean), remarks(text)

Fees
- fee_head: branch_id, name, tax_rate(decimal), refundable(boolean)
- fee_structure: branch_id, class_id, schedule(enum monthly,term,annual), amount(decimal), fee_head_id, category(json: {transport_zone, scholarship_tier})
- invoice: student_id, period(string), due_date(date), amount(decimal), status(enum draft,issued,paid,partial,overdue,void), line_items(json)
- payment: invoice_id, method(enum upi,card,netbanking,cash,cheque,dd), amount(decimal), txn_ref(string), status(enum pending,success,failed), gateway(string), paid_at(datetime), fee(decimal)

Communication
- template: org_id, channel(enum sms,email,push,whatsapp,inapp), name, subject(string), body(text/handlebars), locale(string)
- message: org_id, template_id, recipient(json: {user_id, email, phone}), payload(json), status(enum queued,sent,delivered,failed), sent_at(datetime), provider(string), error(text)

Transport
- route: branch_id, name, capacity(integer)
- stop: route_id, name, lat(decimal), lng(decimal), eta_window(json)
- vehicle: branch_id, number(string), capacity(integer), fitness_valid_till(date), insurance_valid_till(date)
- driver: branch_id, name, license_no(string), phone(string), background_check(string)
- assignment: route_id, student_id, stop_id
- gps_ping: vehicle_id, lat, lng, speed, heading, ts(datetime)

Library
- book: isbn(string), title, author, publisher, year(integer), tags(json), copies(integer)
- circulation: book_id, copy_no(integer), borrower_type(enum student,staff), borrower_id, issued_at, due_at, returned_at, fine(decimal)

Audit & Settings
- audit_log: actor_id, action, entity, entity_id, before(json), after(json), ip(string), user_agent(string), ts(datetime)
- setting: org_id, key(string), value(json)

