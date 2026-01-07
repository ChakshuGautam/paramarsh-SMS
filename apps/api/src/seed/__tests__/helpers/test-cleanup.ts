
/**
 * Improved test helper with better cleanup
 */
import { PrismaClient } from '@prisma/client';

export async function cleanupTestData(prisma: PrismaClient, branchId: string) {
  // Clean up in reverse dependency order
  const tables = [
    'Payment',
    'Invoice', 
    'Mark',
    'ExamSession',
    'Exam',
    'StudentPeriodAttendance',
    'TeacherAttendance',
    'AttendanceSession',
    'TimetablePeriod',
    'ClassSubjectTeacher',
    'TimeSlot',
    'Room',
    'FeeSchedule',
    'FeeComponent', 
    'FeeStructure',
    'Enrollment',
    'StudentGuardian',
    'Guardian',
    'Student',
    'Teacher',
    'Section',
    'Class',
    'Subject',
    'AcademicYear',
    'Tenant'
  ];
  
  for (const table of tables) {
    try {
      await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({
        where: { branchId }
      });
    } catch (error) {
      // Some tables might not have branchId, that's ok
      if (error.code !== 'P2025') {
        console.warn(`Failed to clean ${table}:`, error.message);
      }
    }
  }
}

export function generateUniqueBranchId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
