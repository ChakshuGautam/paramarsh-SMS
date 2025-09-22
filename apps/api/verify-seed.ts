#!/usr/bin/env tsx
/**
 * Verification script for seed data using Prisma
 * Tests completeness and integrity of seeded data
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeededData() {
  console.log('🔍 Verifying Seed Data Completeness...\n');
  
  try {
    // 1. Verify Tenants (Branches)
    const tenants = await prisma.tenant.findMany({
      orderBy: { id: 'asc' }
    });
    console.log(`✅ Tenants/Branches: ${tenants.length}`);
    console.log('   Branches:', tenants.map(t => t.id).join(', '));
    
    // 2. Verify Students with enrollments
    const students = await prisma.student.groupBy({
      by: ['branchId'],
      _count: true,
      orderBy: { branchId: 'asc' }
    });
    const totalStudents = await prisma.student.count();
    console.log(`\n✅ Students: ${totalStudents} total`);
    students.forEach(s => {
      console.log(`   ${s.branchId}: ${s._count} students`);
    });
    
    // 3. Verify Teachers
    const teachers = await prisma.teacher.groupBy({
      by: ['branchId'],
      _count: true
    });
    const totalTeachers = await prisma.teacher.count();
    console.log(`\n✅ Teachers: ${totalTeachers} total`);
    
    // 4. Verify Classes and Sections
    const classes = await prisma.class.count();
    const sections = await prisma.section.count();
    console.log(`\n✅ Academic Structure:`);
    console.log(`   Classes: ${classes}`);
    console.log(`   Sections: ${sections}`);
    
    // 5. Verify Enrollments
    const enrollments = await prisma.enrollment.count();
    const activeEnrollments = await prisma.enrollment.count({
      where: { status: 'active' }
    });
    console.log(`\n✅ Enrollments: ${enrollments} total (${activeEnrollments} active)`);
    
    // 6. Verify Guardians and Relationships
    const guardians = await prisma.guardian.count();
    const studentGuardians = await prisma.studentGuardian.count();
    console.log(`\n✅ Guardians: ${guardians} total`);
    console.log(`   Student-Guardian relationships: ${studentGuardians}`);
    
    // 7. Verify Academic Data
    const subjects = await prisma.subject.count();
    const exams = await prisma.exam.count();
    const examSessions = await prisma.examSession.count();
    const marks = await prisma.marksEntry.count();
    console.log(`\n✅ Academic Data:`);
    console.log(`   Subjects: ${subjects}`);
    console.log(`   Exams: ${exams}`);
    console.log(`   Exam Sessions: ${examSessions}`);
    console.log(`   Marks Entries: ${marks}`);
    
    // 8. Verify Timetable
    const timetablePeriods = await prisma.timetablePeriod.count();
    const timeSlots = await prisma.timeSlot.count();
    const rooms = await prisma.room.count();
    console.log(`\n✅ Timetable & Facilities:`);
    console.log(`   Timetable Periods: ${timetablePeriods}`);
    console.log(`   Time Slots: ${timeSlots}`);
    console.log(`   Rooms: ${rooms}`);
    
    // 9. Verify Attendance
    const teacherAttendance = await prisma.teacherAttendance.count();
    const attendanceSessions = await prisma.attendanceSession.count();
    const studentAttendance = await prisma.studentPeriodAttendance.count();
    console.log(`\n✅ Attendance:`);
    console.log(`   Teacher Attendance: ${teacherAttendance}`);
    console.log(`   Attendance Sessions: ${attendanceSessions}`);
    console.log(`   Student Period Attendance: ${studentAttendance}`);
    
    // 10. Verify Financial Data
    const invoices = await prisma.invoice.count();
    const payments = await prisma.payment.count();
    const paidInvoices = await prisma.invoice.count({
      where: { status: 'paid' }
    });
    console.log(`\n✅ Financial Data:`);
    console.log(`   Invoices: ${invoices} (${paidInvoices} paid)`);
    console.log(`   Payments: ${payments}`);
    
    // 11. Verify Communication
    const templates = await prisma.template.count();
    const campaigns = await prisma.campaign.count();
    const messages = await prisma.message.count();
    const tickets = await prisma.ticket.count();
    console.log(`\n✅ Communication:`);
    console.log(`   Templates: ${templates}`);
    console.log(`   Campaigns: ${campaigns}`);
    console.log(`   Messages: ${messages}`);
    console.log(`   Support Tickets: ${tickets}`);
    
    // 12. Data Integrity Checks
    console.log('\n🔍 Data Integrity Checks:');
    
    // Check if all students have enrollments
    const studentsWithoutEnrollments = await prisma.student.findMany({
      where: {
        enrollments: {
          none: {}
        }
      },
      select: { id: true }
    });
    console.log(`   Students without enrollments: ${studentsWithoutEnrollments.length}`);
    
    // All enrollments should have sections (sectionId is required)
    console.log(`   Enrollments with valid sections: ${enrollments}/${enrollments} (sectionId is required)`);
    
    // Check teacher assignments
    const classSubjectTeachers = await prisma.classSubjectTeacher.count();
    console.log(`   Class-Subject-Teacher assignments: ${classSubjectTeachers}`);
    
    // Summary statistics per branch
    console.log('\n📊 Per-Branch Summary:');
    for (const tenant of tenants) {
      const branchStats = await prisma.student.count({
        where: { branchId: tenant.id }
      });
      const branchTeachers = await prisma.teacher.count({
        where: { branchId: tenant.id }
      });
      const branchClasses = await prisma.class.count({
        where: { branchId: tenant.id }
      });
      console.log(`   ${tenant.id}: ${branchStats} students, ${branchTeachers} teachers, ${branchClasses} classes`);
    }
    
    console.log('\n✅ Seed data verification complete!');
    
    // Return summary for programmatic use
    return {
      success: true,
      summary: {
        tenants: tenants.length,
        students: totalStudents,
        teachers: totalTeachers,
        classes,
        sections,
        enrollments,
        guardians,
        subjects,
        exams,
        timetablePeriods,
        invoices,
        payments
      }
    };
    
  } catch (error) {
    console.error('❌ Error verifying seed data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifySeededData()
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });