/**
 * ExamSeeder Entity
 * Creates exams for the academic year
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class ExamSeeder extends BaseSeeder {
  public entityName = 'exams';
  public dependencies = ['academicYears']; 
  public priority = 75; // After academic years

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const exams: any[] = [];
    const errors: string[] = [];

    try {
      // Check if exams already exist
      const existingExams = await context.prisma.exam.findMany({
        where: { branchId: context.branchId },
        take: 1
      });
      
      if (existingExams.length > 0) {
        // Exams already exist
        context.createdEntities.set('exams', existingExams);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            startTime: new Date(startTime),
            endTime: new Date(),
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
            duration: Date.now() - startTime
          },
          data: existingExams,
          errors: [],
          warnings: []
        };
      }

      // Get current academic year
      const currentYear = await context.prisma.academicYear.findFirst({
        where: { 
          branchId: context.branchId,
          isActive: true
        }
      });

      if (!currentYear) {
        throw new Error('No active academic year found');
      }

      // Define exam types and schedules for CBSE curriculum
      const examSchedules = this.getExamSchedules(currentYear.id);

      // Create exams
      for (const examData of examSchedules) {
        try {
          // Check if exam already exists
          const existingExam = await context.prisma.exam.findFirst({
            where: {
              branchId: context.branchId,
              name: examData.name,
              academicYearId: examData.academicYearId
            }
          });

          if (existingExam) {
            exams.push(existingExam);
            continue;
          }

          const exam = await context.prisma.exam.create({
            data: {
              branchId: context.branchId,
              name: examData.name,
              examType: examData.examType,
              academicYearId: examData.academicYearId,
              term: examData.term,
              weightagePercent: examData.weightagePercent,
              minPassingMarks: examData.minPassingMarks,
              maxMarks: examData.maxMarks,
              status: examData.status,
              startDate: examData.startDate,
              endDate: examData.endDate
            }
          });

          exams.push(exam);

        } catch (error) {
          const errorMsg = `Failed to create exam ${examData.name}: ${error}`;
          errors.push(errorMsg);
        }
      }

      // Store created exams in context
      context.createdEntities.set('exams', exams);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          startTime: new Date(startTime),
          endTime: new Date(),
          totalRecords: exams.length,
          successCount: exams.length,
          errorCount: errors.length,
          duration: Date.now() - startTime
        },
        data: exams,
        errors: errors.length > 0 ? errors.map(e => new Error(e)) : [],
        warnings: []
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
          startTime: new Date(startTime),
          endTime: new Date(),
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          duration: Date.now() - startTime
        },
        data: [],
        errors: [new Error(`Critical error in ExamSeeder: ${error}`)],
        warnings: []
      };
    }
  }

  /**
   * Get exam schedules for the academic year
   */
  private getExamSchedules(academicYearId: string): Array<{
    name: string,
    examType: string,
    academicYearId: string,
    term: number,
    weightagePercent: number,
    minPassingMarks: number,
    maxMarks: number,
    status: string,
    startDate: string,
    endDate: string
  }> {
    const currentYear = new Date().getFullYear();
    
    // CBSE exam structure
    return [
      // Term 1
      {
        name: 'Unit Test 1',
        examType: 'unit_test',
        academicYearId: academicYearId,
        term: 1,
        weightagePercent: 10,
        minPassingMarks: 33,
        maxMarks: 50,
        status: 'COMPLETED',
        startDate: `${currentYear}-05-15`,
        endDate: `${currentYear}-05-20`
      },
      {
        name: 'Mid Term Examination',
        examType: 'mid_term',
        academicYearId: academicYearId,
        term: 1,
        weightagePercent: 30,
        minPassingMarks: 33,
        maxMarks: 100,
        status: 'COMPLETED',
        startDate: `${currentYear}-07-10`,
        endDate: `${currentYear}-07-25`
      },
      {
        name: 'Unit Test 2',
        examType: 'unit_test',
        academicYearId: academicYearId,
        term: 1,
        weightagePercent: 10,
        minPassingMarks: 33,
        maxMarks: 50,
        status: 'COMPLETED',
        startDate: `${currentYear}-09-10`,
        endDate: `${currentYear}-09-15`
      },
      
      // Term 2
      {
        name: 'Unit Test 3',
        examType: 'unit_test',
        academicYearId: academicYearId,
        term: 2,
        weightagePercent: 10,
        minPassingMarks: 33,
        maxMarks: 50,
        status: 'SCHEDULED',
        startDate: `${currentYear}-11-10`,
        endDate: `${currentYear}-11-15`
      },
      {
        name: 'Pre-Board Examination',
        examType: 'pre_board',
        academicYearId: academicYearId,
        term: 2,
        weightagePercent: 15,
        minPassingMarks: 33,
        maxMarks: 100,
        status: 'SCHEDULED',
        startDate: `${currentYear + 1}-01-15`,
        endDate: `${currentYear + 1}-01-30`
      },
      {
        name: 'Annual Examination',
        examType: 'annual',
        academicYearId: academicYearId,
        term: 2,
        weightagePercent: 25,
        minPassingMarks: 33,
        maxMarks: 100,
        status: 'SCHEDULED',
        startDate: `${currentYear + 1}-03-01`,
        endDate: `${currentYear + 1}-03-20`
      },
      
      // Practical exams for senior classes
      {
        name: 'Practical Examination',
        examType: 'practical',
        academicYearId: academicYearId,
        term: 2,
        weightagePercent: 20,
        minPassingMarks: 10,
        maxMarks: 30,
        status: 'SCHEDULED',
        startDate: `${currentYear + 1}-02-15`,
        endDate: `${currentYear + 1}-02-28`
      }
    ];
  }
}