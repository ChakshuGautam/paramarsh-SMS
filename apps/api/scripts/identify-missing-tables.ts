#!/usr/bin/env bun

const ALL_SCHEMA_TABLES = [
  'AcademicYear', 'Application', 'AttendanceRecord', 'AttendanceSession', 'AuditLog',
  'Campaign', 'Class', 'Enrollment', 'Exam', 'ExamSession', 'ExamTemplate',
  'FeeComponent', 'FeeSchedule', 'FeeStructure', 'GradingScale', 'Guardian',
  'Invoice', 'Mark', 'MarksEntry', 'Message', 'Payment', 'Preference',
  'Room', 'RoomConstraint', 'Section', 'Staff', 'Student', 'StudentGuardian',
  'StudentPeriodAttendance', 'Subject', 'SubjectConstraint', 'Substitution',
  'Teacher', 'TeacherAttendance', 'TeacherConstraint', 'TeacherDailyAttendance',
  'Template', 'Tenant', 'Ticket', 'TicketAttachment', 'TicketMessage',
  'TimeSlot', 'TimeSlotConstraint', 'TimetablePeriod', 'TimetableTemplate'
];

// Tables that the current seed script attempts to populate based on validation output
const POPULATED_TABLES = [
  'Tenant', 'AcademicYear', 'TimeSlot', 'Class', 'Subject', 'Staff', 'Teacher', 'Section',
  'Student', 'Guardian', 'StudentGuardian', 'Enrollment', 'FeeStructure', 'FeeComponent',
  'FeeSchedule', 'Exam', 'TimetablePeriod', 'AttendanceSession', 'StudentPeriodAttendance',
  'TeacherAttendance', 'ExamSession', 'Mark', 'Room', 'Template', 'Campaign'
];

// Tables that are empty (have bugs)
const EMPTY_TABLES = [
  'Invoice', 'Payment', 'Message', 'Preference', 'Ticket', 'Application'
];

// Tables that are not implemented at all
const MISSING_TABLES = ALL_SCHEMA_TABLES.filter(table => 
  !POPULATED_TABLES.includes(table) && !EMPTY_TABLES.includes(table)
);

console.log('📊 SEED SCRIPT TABLE ANALYSIS');
console.log('='.repeat(40));
console.log(`Total tables in schema: ${ALL_SCHEMA_TABLES.length}`);
console.log(`Tables successfully populated: ${POPULATED_TABLES.length}`);
console.log(`Tables with bugs (empty): ${EMPTY_TABLES.length}`);
console.log(`Tables not implemented: ${MISSING_TABLES.length}`);

console.log('\\n❌ TABLES WITH BUGS (empty due to seed errors):');
EMPTY_TABLES.forEach((table, i) => {
  console.log(`${i + 1}. ${table}`);
});

console.log('\\n🚫 TABLES NOT IMPLEMENTED (missing from seed script):');
MISSING_TABLES.forEach((table, i) => {
  console.log(`${i + 1}. ${table}`);
});

console.log('\\n🎯 PRIORITY FIXES NEEDED:');
console.log('1. Fix the 6 empty tables first (these have seed code but bugs)');
console.log('2. Implement seed generation for the missing tables');
console.log('3. Run comprehensive validation of all 45 tables');

const totalProblems = EMPTY_TABLES.length + MISSING_TABLES.length;
console.log(`\\n🚨 TOTAL ISSUES: ${totalProblems} out of ${ALL_SCHEMA_TABLES.length} tables need fixes`);