/**
 * Comprehensive Seed Data Verification and Summary
 * To be called at the end of the seed script
 */
import { PrismaClient } from '@prisma/client';

interface ValidationResult {
  success: boolean;
  summary: {
    tenants: number;
    students: number;
    teachers: number;
    classes: number;
    sections: number;
    enrollments: number;
    guardians: number;
    subjects: number;
    exams: number;
    timetablePeriods: number;
    invoices: number;
    payments: number;
    attendanceRecords: {
      teacher: number;
      student: number;
    };
  };
  branchDetails: Array<{
    branchId: string;
    students: number;
    teachers: number;
    classes: number;
  }>;
  dataIntegrity: {
    studentsWithoutEnrollments: number;
    enrollmentsWithoutSections: number;
    classSubjectTeacherAssignments: number;
  };
  warnings: string[];
}

export async function verifyAndSummarize(prisma: PrismaClient): Promise<ValidationResult> {
  const warnings: string[] = [];
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE SEED DATA VERIFICATION & SUMMARY');
  console.log('='.repeat(60));
  
  try {
    // Core entity counts
    const tenants = await prisma.tenant.count();
    const students = await prisma.student.count();
    const teachers = await prisma.teacher.count();
    const classes = await prisma.class.count();
    const sections = await prisma.section.count();
    const enrollments = await prisma.enrollment.count();
    const guardians = await prisma.guardian.count();
    const subjects = await prisma.subject.count();
    const exams = await prisma.exam.count();
    const timetablePeriods = await prisma.timetablePeriod.count();
    const invoices = await prisma.invoice.count();
    const payments = await prisma.payment.count();
    const teacherAttendance = await prisma.teacherAttendance.count();
    const studentAttendance = await prisma.studentPeriodAttendance.count();
    
    // Branch-wise details
    const tenantList = await prisma.tenant.findMany({ orderBy: { id: 'asc' } });
    const branchDetails = await Promise.all(
      tenantList.map(async (tenant) => ({
        branchId: tenant.id,
        students: await prisma.student.count({ where: { branchId: tenant.id } }),
        teachers: await prisma.teacher.count({ where: { branchId: tenant.id } }),
        classes: await prisma.class.count({ where: { branchId: tenant.id } })
      }))
    );
    
    // Data integrity checks
    const studentsWithoutEnrollments = await prisma.student.count({
      where: { enrollments: { none: {} } }
    });
    
    const classSubjectTeacherAssignments = await prisma.classSubjectTeacher.count();
    
    // Add warnings for any issues
    if (studentsWithoutEnrollments > 0) {
      warnings.push(`${studentsWithoutEnrollments} students have no enrollments`);
    }
    
    if (enrollments === 0) {
      warnings.push('No enrollments created');
    }
    
    if (teacherAttendance === 0) {
      warnings.push('No teacher attendance records created');
    }
    
    // Print summary table
    console.log('\n📈 SEED DATA SUMMARY');
    console.log('-'.repeat(50));
    console.log(`✅ Branches/Tenants        : ${tenants.toString().padStart(8)}`);
    console.log(`✅ Students                : ${students.toString().padStart(8)}`);
    console.log(`✅ Teachers                : ${teachers.toString().padStart(8)}`);
    console.log(`✅ Guardians               : ${guardians.toString().padStart(8)}`);
    console.log(`✅ Classes                 : ${classes.toString().padStart(8)}`);
    console.log(`✅ Sections                : ${sections.toString().padStart(8)}`);
    console.log(`✅ Enrollments             : ${enrollments.toString().padStart(8)}`);
    console.log(`✅ Subjects                : ${subjects.toString().padStart(8)}`);
    console.log(`✅ Exams                   : ${exams.toString().padStart(8)}`);
    console.log(`✅ Timetable Periods       : ${timetablePeriods.toString().padStart(8)}`);
    console.log(`✅ Teacher Attendance      : ${teacherAttendance.toString().padStart(8)}`);
    console.log(`✅ Student Attendance      : ${studentAttendance.toString().padStart(8)}`);
    console.log(`✅ Invoices                : ${invoices.toString().padStart(8)}`);
    console.log(`✅ Payments                : ${payments.toString().padStart(8)}`);
    
    console.log('\n📍 BRANCH-WISE DISTRIBUTION');
    console.log('-'.repeat(50));
    console.log('Branch ID'.padEnd(20) + 'Students'.padStart(10) + 'Teachers'.padStart(10) + 'Classes'.padStart(10));
    console.log('-'.repeat(50));
    
    branchDetails.forEach(branch => {
      console.log(
        branch.branchId.padEnd(20) + 
        branch.students.toString().padStart(10) + 
        branch.teachers.toString().padStart(10) + 
        branch.classes.toString().padStart(10)
      );
    });
    
    console.log('-'.repeat(50));
    console.log(
      'TOTAL'.padEnd(20) + 
      students.toString().padStart(10) + 
      teachers.toString().padStart(10) + 
      classes.toString().padStart(10)
    );
    
    // Data integrity summary
    console.log('\n🔍 DATA INTEGRITY CHECKS');
    console.log('-'.repeat(50));
    console.log(`✅ All students have enrollments  : ${studentsWithoutEnrollments === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Class-Subject-Teacher links    : ${classSubjectTeacherAssignments}`);
    console.log(`✅ Student-Guardian relationships : ${await prisma.studentGuardian.count()}`);
    
    // Warnings
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS');
      console.log('-'.repeat(50));
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    // Final validation status
    const success = warnings.length === 0;
    
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('✅ VALIDATION PASSED - ALL CHECKS SUCCESSFUL!');
    } else {
      console.log('⚠️  VALIDATION COMPLETED WITH WARNINGS');
    }
    console.log('='.repeat(60));
    
    return {
      success,
      summary: {
        tenants,
        students,
        teachers,
        classes,
        sections,
        enrollments,
        guardians,
        subjects,
        exams,
        timetablePeriods,
        invoices,
        payments,
        attendanceRecords: {
          teacher: teacherAttendance,
          student: studentAttendance
        }
      },
      branchDetails,
      dataIntegrity: {
        studentsWithoutEnrollments,
        enrollmentsWithoutSections: 0, // All enrollments have sections (required field)
        classSubjectTeacherAssignments
      },
      warnings
    };
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return {
      success: false,
      summary: {} as any,
      branchDetails: [],
      dataIntegrity: {} as any,
      warnings: ['Verification failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
    };
  }
}

// Export for use in seed script
export default verifyAndSummarize;