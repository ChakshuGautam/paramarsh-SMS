#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All 45 tables from the schema - COMPREHENSIVE LIST
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

async function quickTableCheck() {
  console.log('🔍 QUICK TABLE CHECK - All 45 Schema Tables');
  console.log('='.repeat(50));
  
  const emptyTables: string[] = [];
  const populatedTables: string[] = [];
  
  for (const tableName of ALL_SCHEMA_TABLES) {
    try {
      let count = 0;
      const lowerTableName = tableName.toLowerCase();
      
      // Get count using Prisma client dynamically
      switch (tableName) {
        case 'AcademicYear':
          count = await prisma.academicYear.count();
          break;
        case 'Application':
          count = await prisma.application.count();
          break;
        case 'AttendanceRecord':
          count = await prisma.attendanceRecord.count();
          break;
        case 'AttendanceSession':
          count = await prisma.attendanceSession.count();
          break;
        case 'AuditLog':
          count = await prisma.auditLog.count();
          break;
        case 'Campaign':
          count = await prisma.campaign.count();
          break;
        case 'Class':
          count = await prisma.class.count();
          break;
        case 'Enrollment':
          count = await prisma.enrollment.count();
          break;
        case 'Exam':
          count = await prisma.exam.count();
          break;
        case 'ExamSession':
          count = await prisma.examSession.count();
          break;
        case 'ExamTemplate':
          count = await prisma.examTemplate.count();
          break;
        case 'FeeComponent':
          count = await prisma.feeComponent.count();
          break;
        case 'FeeSchedule':
          count = await prisma.feeSchedule.count();
          break;
        case 'FeeStructure':
          count = await prisma.feeStructure.count();
          break;
        case 'GradingScale':
          count = await prisma.gradingScale.count();
          break;
        case 'Guardian':
          count = await prisma.guardian.count();
          break;
        case 'Invoice':
          count = await prisma.invoice.count();
          break;
        case 'Mark':
          count = await prisma.mark.count();
          break;
        case 'MarksEntry':
          count = await prisma.marksEntry.count();
          break;
        case 'Message':
          count = await prisma.message.count();
          break;
        case 'Payment':
          count = await prisma.payment.count();
          break;
        case 'Preference':
          count = await prisma.preference.count();
          break;
        case 'Room':
          count = await prisma.room.count();
          break;
        case 'RoomConstraint':
          count = await prisma.roomConstraint.count();
          break;
        case 'Section':
          count = await prisma.section.count();
          break;
        case 'Staff':
          count = await prisma.staff.count();
          break;
        case 'Student':
          count = await prisma.student.count();
          break;
        case 'StudentGuardian':
          count = await prisma.studentGuardian.count();
          break;
        case 'StudentPeriodAttendance':
          count = await prisma.studentPeriodAttendance.count();
          break;
        case 'Subject':
          count = await prisma.subject.count();
          break;
        case 'SubjectConstraint':
          count = await prisma.subjectConstraint.count();
          break;
        case 'Substitution':
          count = await prisma.substitution.count();
          break;
        case 'Teacher':
          count = await prisma.teacher.count();
          break;
        case 'TeacherAttendance':
          count = await prisma.teacherAttendance.count();
          break;
        case 'TeacherConstraint':
          count = await prisma.teacherConstraint.count();
          break;
        case 'TeacherDailyAttendance':
          count = await prisma.teacherDailyAttendance.count();
          break;
        case 'Template':
          count = await prisma.template.count();
          break;
        case 'Tenant':
          count = await prisma.tenant.count();
          break;
        case 'Ticket':
          count = await prisma.ticket.count();
          break;
        case 'TicketAttachment':
          count = await prisma.ticketAttachment.count();
          break;
        case 'TicketMessage':
          count = await prisma.ticketMessage.count();
          break;
        case 'TimeSlot':
          count = await prisma.timeSlot.count();
          break;
        case 'TimeSlotConstraint':
          count = await prisma.timeSlotConstraint.count();
          break;
        case 'TimetablePeriod':
          count = await prisma.timetablePeriod.count();
          break;
        case 'TimetableTemplate':
          count = await prisma.timetableTemplate.count();
          break;
        default:
          console.log(`⚠️ Unknown table: ${tableName}`);
          continue;
      }
      
      if (count === 0) {
        emptyTables.push(tableName);
        console.log(`❌ EMPTY: ${tableName}`);
      } else {
        populatedTables.push(tableName);
        console.log(`✅ GOOD: ${tableName} (${count} records)`);
      }
      
    } catch (error: any) {
      emptyTables.push(tableName);
      console.log(`💥 ERROR: ${tableName} - ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 SUMMARY:`);
  console.log(`📋 Total tables: ${ALL_SCHEMA_TABLES.length}`);
  console.log(`✅ Populated tables: ${populatedTables.length}`);
  console.log(`❌ Empty tables: ${emptyTables.length}`);
  
  if (emptyTables.length > 0) {
    console.log(`\n🚨 CRITICAL: These ${emptyTables.length} tables are EMPTY:`);
    emptyTables.forEach((table, i) => {
      console.log(`${i + 1}. ${table}`);
    });
    console.log(`\n⚠️ Seed data has BUGS - these tables need to be populated!`);
  } else {
    console.log(`\n🎉 SUCCESS: All 45 tables are populated!`);
  }
  
  await prisma.$disconnect();
  return { emptyTables, populatedTables };
}

quickTableCheck()
  .then(result => {
    const exitCode = result.emptyTables.length > 0 ? 1 : 0;
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });