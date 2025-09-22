/**
 * EnrollmentSeeder Entity
 * Creates enrollment records linking students to sections
 * Enrollment model only tracks student-section relationships with status and date range
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class EnrollmentSeeder extends BaseSeeder {
  public entityName = 'enrollments';
  public dependencies = ['students', 'academicYears', 'sections'];
  public priority = 40; // After students and guardians
  
  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const enrollments: any[] = [];
    const errors: string[] = [];

    try {
      // Get required entities from context
      const students = context.createdEntities.get('students') || [];
      const academicYears = context.createdEntities.get('academicYears') || [];
      const sections = context.createdEntities.get('sections') || [];

      // Validation
      if (students.length === 0) {
        return this.createErrorResult('Missing dependency: students', startTime);
      }
      if (academicYears.length === 0) {
        return this.createErrorResult('Missing dependency: academicYears', startTime);
      }
      if (sections.length === 0) {
        return this.createErrorResult('Missing dependency: sections', startTime);
      }

      // Get the current academic year (most recent)
      const currentAcademicYear = academicYears.sort((a: any, b: any) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )[0];

      console.log(`📚 Creating enrollments for ${students.length} students`);

      // Enroll each student
      for (const student of students) {
        try {
          // Check if enrollment already exists for this student-section pair
          const existingEnrollment = await context.prisma.enrollment.findFirst({
            where: {
              studentId: student.id,
              sectionId: student.sectionId
            }
          });

          if (!existingEnrollment) {
            const enrollment = await this.createEnrollment(
              context,
              student,
              currentAcademicYear
            );
            
            if (enrollment) {
              enrollments.push(enrollment);
            }
          } else {
            console.log(`⚠️ Enrollment already exists for student ${student.id}`);
          }
        } catch (error) {
          errors.push(`Failed to enroll student ${student.id}: ${error}`);
        }
      }

      // Store created enrollments in context
      context.createdEntities.set('enrollments', enrollments);

      console.log(`📚 Created ${enrollments.length} enrollments, ${errors.length} errors`);
      if (errors.length > 0) {
        console.log('Errors:', errors.slice(0, 5)); // Show first 5 errors
      }

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: enrollments.length,
          successCount: enrollments.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: enrollments,
        errors: errors.length > 0 ? errors.map(e => new Error(e)) : [],
        warnings: []
      };

    } catch (error) {
      return this.createErrorResult(`Critical error in EnrollmentSeeder: ${error}`, startTime);
    }
  }

  private async createEnrollment(
    context: SeedContext,
    student: any,
    academicYear: any
  ): Promise<any> {
    // Convert dates to ISO strings properly
    const startDate = academicYear.startDate instanceof Date 
      ? academicYear.startDate.toISOString()
      : academicYear.startDate;
    const endDate = academicYear.endDate instanceof Date 
      ? academicYear.endDate.toISOString()
      : academicYear.endDate;

    const enrollment = await context.prisma.enrollment.create({
      data: {
        branchId: context.branchId,
        studentId: student.id,
        sectionId: student.sectionId,
        status: 'active',
        startDate: startDate,
        endDate: endDate
      }
    });

    return enrollment;
  }

  private createErrorResult(error: string, startTime: number): SeedResult {
    return {
      success: false,
      entityName: this.entityName,
      metrics: {
        totalRecords: 0,
        successCount: 0,
        errorCount: 1,
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: Date.now() - startTime
      },
      data: [],
      errors: [new Error(error)],
      warnings: []
    };
  }
}