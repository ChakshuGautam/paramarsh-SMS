# API Endpoints Checklist

This document contains a comprehensive checklist of all required CRUD endpoints for each entity in the Paramarsh SMS system.

## Standard CRUD Operations per Entity

Each entity should implement the following endpoints following React Admin's data provider expectations:

1. **GET /api/v1/{entity}** - List all with pagination, filtering, and sorting
   - Response: `{ data: [], total: number }`
2. **GET /api/v1/{entity}/:id** - Get single record by ID
   - Response: `{ data: {} }`
3. **POST /api/v1/{entity}** - Create new record
   - Response: `{ data: {} }`
4. **PATCH /api/v1/{entity}/:id** - Update existing record
   - Response: `{ data: {} }`
5. **DELETE /api/v1/{entity}/:id** - Delete record
   - Response: `{ data: {} }` or `{ success: true }`

## Entity Checklist

### Student Information Module

#### ✅ Students
- [x] GET /api/v1/students - List students
- [x] GET /api/v1/students/:id - Get student
- [x] POST /api/v1/students - Create student
- [x] PATCH /api/v1/students/:id - Update student
- [x] DELETE /api/v1/students/:id - Delete student

#### ✅ Guardians
- [x] GET /api/v1/guardians - List guardians
- [x] GET /api/v1/guardians/:id - Get guardian
- [x] POST /api/v1/guardians - Create guardian
- [x] PATCH /api/v1/guardians/:id - Update guardian
- [x] DELETE /api/v1/guardians/:id - Delete guardian

#### ✅ Enrollments
- [x] GET /api/v1/enrollments - List enrollments
- [x] GET /api/v1/enrollments/:id - Get enrollment
- [x] POST /api/v1/enrollments - Create enrollment
- [x] PATCH /api/v1/enrollments/:id - Update enrollment
- [x] DELETE /api/v1/enrollments/:id - Delete enrollment

#### ⚠️ Applications
- [ ] GET /api/v1/applications - List applications
- [ ] GET /api/v1/applications/:id - Get application
- [ ] POST /api/v1/applications - Create application
- [ ] PATCH /api/v1/applications/:id - Update application
- [ ] DELETE /api/v1/applications/:id - Delete application

### Academic Module

#### ✅ Classes
- [x] GET /api/v1/classes - List classes
- [x] GET /api/v1/classes/:id - Get class
- [x] POST /api/v1/classes - Create class
- [x] PATCH /api/v1/classes/:id - Update class
- [x] DELETE /api/v1/classes/:id - Delete class

#### ✅ Sections
- [x] GET /api/v1/sections - List sections
- [x] GET /api/v1/sections/:id - Get section
- [x] POST /api/v1/sections - Create section
- [x] PATCH /api/v1/sections/:id - Update section
- [x] DELETE /api/v1/sections/:id - Delete section

#### ⚠️ Subjects
- [ ] GET /api/v1/subjects - List subjects
- [ ] GET /api/v1/subjects/:id - Get subject
- [ ] POST /api/v1/subjects - Create subject
- [ ] PATCH /api/v1/subjects/:id - Update subject
- [ ] DELETE /api/v1/subjects/:id - Delete subject

#### ✅ Teachers
- [x] GET /api/v1/teachers - List teachers
- [x] GET /api/v1/teachers/:id - Get teacher
- [x] POST /api/v1/teachers - Create teacher
- [x] PATCH /api/v1/teachers/:id - Update teacher
- [x] DELETE /api/v1/teachers/:id - Delete teacher

### Attendance & Exams Module

#### ⚠️ AttendanceRecords
- [ ] GET /api/v1/attendanceRecords - List attendance records
- [ ] GET /api/v1/attendanceRecords/:id - Get attendance record
- [ ] POST /api/v1/attendanceRecords - Create attendance record
- [ ] PATCH /api/v1/attendanceRecords/:id - Update attendance record
- [ ] DELETE /api/v1/attendanceRecords/:id - Delete attendance record

#### ⚠️ Exams
- [ ] GET /api/v1/exams - List exams
- [ ] GET /api/v1/exams/:id - Get exam
- [ ] POST /api/v1/exams - Create exam
- [ ] PATCH /api/v1/exams/:id - Update exam
- [ ] DELETE /api/v1/exams/:id - Delete exam

#### ⚠️ Marks
- [ ] GET /api/v1/marks - List marks
- [ ] GET /api/v1/marks/:id - Get mark
- [ ] POST /api/v1/marks - Create mark
- [ ] PATCH /api/v1/marks/:id - Update mark
- [ ] DELETE /api/v1/marks/:id - Delete mark

### Timetable Module

#### ⚠️ Timetable
- [ ] GET /api/v1/timetable - List timetable entries
- [ ] GET /api/v1/timetable/:id - Get timetable entry
- [ ] POST /api/v1/timetable - Create timetable entry
- [ ] PATCH /api/v1/timetable/:id - Update timetable entry
- [ ] DELETE /api/v1/timetable/:id - Delete timetable entry

#### ⚠️ SectionTimetables
- [ ] GET /api/v1/sectionTimetables - List section timetables
- [ ] GET /api/v1/sectionTimetables/:id - Get section timetable
- [ ] POST /api/v1/sectionTimetables - Create section timetable
- [ ] PATCH /api/v1/sectionTimetables/:id - Update section timetable
- [ ] DELETE /api/v1/sectionTimetables/:id - Delete section timetable

#### ⚠️ TimeSlots
- [ ] GET /api/v1/timeSlots - List time slots
- [ ] GET /api/v1/timeSlots/:id - Get time slot
- [ ] POST /api/v1/timeSlots - Create time slot
- [ ] PATCH /api/v1/timeSlots/:id - Update time slot
- [ ] DELETE /api/v1/timeSlots/:id - Delete time slot

#### ⚠️ Rooms
- [ ] GET /api/v1/rooms - List rooms
- [ ] GET /api/v1/rooms/:id - Get room
- [ ] POST /api/v1/rooms - Create room
- [ ] PATCH /api/v1/rooms/:id - Update room
- [ ] DELETE /api/v1/rooms/:id - Delete room

#### ⚠️ Substitutions
- [ ] GET /api/v1/substitutions - List substitutions
- [ ] GET /api/v1/substitutions/:id - Get substitution
- [ ] POST /api/v1/substitutions - Create substitution
- [ ] PATCH /api/v1/substitutions/:id - Update substitution
- [ ] DELETE /api/v1/substitutions/:id - Delete substitution

### Finance Module

#### ✅ FeeStructures
- [x] GET /api/v1/feeStructures - List fee structures
- [x] GET /api/v1/feeStructures/:id - Get fee structure
- [x] POST /api/v1/feeStructures - Create fee structure
- [x] PATCH /api/v1/feeStructures/:id - Update fee structure
- [x] DELETE /api/v1/feeStructures/:id - Delete fee structure

#### ✅ FeeSchedules
- [x] GET /api/v1/feeSchedules - List fee schedules
- [x] GET /api/v1/feeSchedules/:id - Get fee schedule
- [x] POST /api/v1/feeSchedules - Create fee schedule
- [x] PATCH /api/v1/feeSchedules/:id - Update fee schedule
- [x] DELETE /api/v1/feeSchedules/:id - Delete fee schedule

#### ✅ Invoices
- [x] GET /api/v1/invoices - List invoices
- [x] GET /api/v1/invoices/:id - Get invoice
- [x] POST /api/v1/invoices - Create invoice
- [x] PATCH /api/v1/invoices/:id - Update invoice
- [x] DELETE /api/v1/invoices/:id - Delete invoice

#### ⚠️ Payments
- [ ] GET /api/v1/payments - List payments
- [ ] GET /api/v1/payments/:id - Get payment
- [ ] POST /api/v1/payments - Create payment
- [ ] PATCH /api/v1/payments/:id - Update payment
- [ ] DELETE /api/v1/payments/:id - Delete payment

### Communication Module

#### ⚠️ Messages
- [ ] GET /api/v1/messages - List messages
- [ ] GET /api/v1/messages/:id - Get message
- [ ] POST /api/v1/messages - Create message
- [ ] PATCH /api/v1/messages/:id - Update message
- [ ] DELETE /api/v1/messages/:id - Delete message

#### ⚠️ Campaigns
- [ ] GET /api/v1/campaigns - List campaigns
- [ ] GET /api/v1/campaigns/:id - Get campaign
- [ ] POST /api/v1/campaigns - Create campaign
- [ ] PATCH /api/v1/campaigns/:id - Update campaign
- [ ] DELETE /api/v1/campaigns/:id - Delete campaign

#### ⚠️ Templates
- [ ] GET /api/v1/templates - List templates
- [ ] GET /api/v1/templates/:id - Get template
- [ ] POST /api/v1/templates - Create template
- [ ] PATCH /api/v1/templates/:id - Update template
- [ ] DELETE /api/v1/templates/:id - Delete template

#### ⚠️ Tickets
- [ ] GET /api/v1/tickets - List tickets
- [ ] GET /api/v1/tickets/:id - Get ticket
- [ ] POST /api/v1/tickets - Create ticket
- [ ] PATCH /api/v1/tickets/:id - Update ticket
- [ ] DELETE /api/v1/tickets/:id - Delete ticket

### Administration Module

#### ✅ Staff
- [x] GET /api/v1/staff - List staff
- [x] GET /api/v1/staff/:id - Get staff member
- [x] POST /api/v1/staff - Create staff member
- [x] PATCH /api/v1/staff/:id - Update staff member
- [x] DELETE /api/v1/staff/:id - Delete staff member

#### ⚠️ Tenants
- [ ] GET /api/v1/tenants - List tenants
- [ ] GET /api/v1/tenants/:id - Get tenant
- [ ] POST /api/v1/tenants - Create tenant
- [ ] PATCH /api/v1/tenants/:id - Update tenant
- [ ] DELETE /api/v1/tenants/:id - Delete tenant

#### ⚠️ Preferences
- [ ] GET /api/v1/preferences - List preferences
- [ ] GET /api/v1/preferences/:id - Get preference
- [ ] POST /api/v1/preferences - Create preference
- [ ] PATCH /api/v1/preferences/:id - Update preference
- [ ] DELETE /api/v1/preferences/:id - Delete preference

## Summary

- **Complete**: 10 entities (Students, Guardians, Enrollments, Classes, Sections, Teachers, FeeStructures, FeeSchedules, Invoices, Staff)
- **Incomplete**: 19 entities
- **Total Coverage**: 34.5% (10/29)

## Next Steps

1. Implement missing CRUD operations for all incomplete entities
2. Ensure all endpoints follow React Admin's data provider expectations
3. Add comprehensive e2e tests for all endpoints
4. Verify proper error handling and validation
5. Ensure all endpoints respect tenant/branch scoping