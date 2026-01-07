import { PrismaClient } from '@prisma/client';

/**
 * Clean up all test data for a specific branch
 */
export async function cleanupBranchData(prisma: PrismaClient, branchId: string) {
  // Delete in reverse dependency order to avoid foreign key constraints
  const cleanupOperations = [
    // Financial
    () => prisma.payment.deleteMany({ where: { branchId } }),
    () => prisma.invoice.deleteMany({ where: { branchId } }),
    
    // Exam & Marks
    () => prisma.mark.deleteMany({ where: { branchId } }),
    () => prisma.examSession.deleteMany({ where: { branchId } }),
    () => prisma.exam.deleteMany({ where: { branchId } }),
    
    // Attendance - Note: StudentPeriodAttendance doesn't have branchId directly
    () => prisma.studentPeriodAttendance.deleteMany({ 
      where: { 
        session: { branchId } 
      } 
    }),
    () => prisma.teacherAttendance.deleteMany({ where: { branchId } }),
    () => prisma.attendanceSession.deleteMany({ where: { branchId } }),
    () => prisma.attendanceRecord.deleteMany({ where: { branchId } }),
    () => prisma.teacherDailyAttendance.deleteMany({ where: { branchId } }),
    
    // Timetable
    () => prisma.timetablePeriod.deleteMany({ where: { branchId } }),
    () => prisma.substitution.deleteMany({ where: { branchId } }),
    
    // Class associations
    () => prisma.classSubjectTeacher.deleteMany({ where: { branchId } }),
    
    // Infrastructure
    () => prisma.timeSlot.deleteMany({ where: { branchId } }),
    () => prisma.room.deleteMany({ where: { branchId } }),
    
    // Fee structure
    () => prisma.feeSchedule.deleteMany({ where: { branchId } }),
    () => prisma.feeComponent.deleteMany({ where: { branchId } }),
    () => prisma.feeStructure.deleteMany({ where: { branchId } }),
    
    // Student associations - Note: StudentGuardian doesn't have branchId directly
    () => prisma.enrollment.deleteMany({ where: { branchId } }),
    () => prisma.studentGuardian.deleteMany({ 
      where: { 
        student: { branchId }
      } 
    }),
    
    // Core entities
    () => prisma.guardian.deleteMany({ where: { branchId } }),
    () => prisma.student.deleteMany({ where: { branchId } }),
    () => prisma.teacher.deleteMany({ where: { branchId } }),
    () => prisma.staff.deleteMany({ where: { branchId } }),
    
    // Classes & Subjects
    () => prisma.section.deleteMany({ where: { branchId } }),
    () => prisma.class.deleteMany({ where: { branchId } }),
    () => prisma.subject.deleteMany({ where: { branchId } }),
    
    // Academic Year
    () => prisma.academicYear.deleteMany({ where: { branchId } }),
    
    // Tenant
    () => prisma.tenant.deleteMany({ where: { id: branchId } })
  ];
  
  for (const operation of cleanupOperations) {
    try {
      await operation();
    } catch (error: any) {
      // Ignore "record not found" errors
      if (error.code !== 'P2025') {
        console.warn(`Cleanup warning: ${error.message}`);
      }
    }
  }
}

/**
 * Generate a unique test branch ID
 */
export function generateTestBranchId(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}`;
}