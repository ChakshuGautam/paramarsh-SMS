/**
 * MarkSeeder Entity
 * Creates marks entries for students in exam sessions
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class MarkSeeder extends BaseSeeder {
  public entityName = 'marks';
  public dependencies = ['examSessions', 'students']; 
  public priority = 77; // After exam sessions and students

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const marks: any[] = [];
    const errors: string[] = [];

    try {
      // Check if marks already exist
      const existingMarks = await context.prisma.marksEntry.findMany({
        where: { branchId: context.branchId },
        take: 1
      });
      
      if (existingMarks.length > 0) {
        // Marks already exist
        context.createdEntities.set('marks', existingMarks);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
            duration: Date.now() - startTime
          }
        };
      }

      // Get exam sessions
      const examSessions = await context.prisma.examSession.findMany({
        where: { branchId: context.branchId },
        include: {
          exam: true
        }
      });

      if (examSessions.length === 0) {
        // No exam sessions, nothing to do
        context.createdEntities.set('marks', []);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
            duration: Date.now() - startTime
          }
        };
      }

      // Get students (limit to reasonable number for testing)
      const students = await context.prisma.student.findMany({
        where: { branchId: context.branchId },
        take: 50 // Limit to 50 students for performance
      });

      if (students.length === 0) {
        throw new Error('No students found for marks entry');
      }

      // Only create marks for completed exams
      const completedSessions = examSessions.filter(session => 
        session.exam.status === 'COMPLETED'
      );

      // Create marks for each completed exam session
      for (const session of completedSessions) {
        // Create marks for each student
        for (const student of students) {
          try {
            // Check if mark already exists
            const existingMark = await context.prisma.marksEntry.findFirst({
              where: {
                studentId: student.id,
                sessionId: session.id
              }
            });

            if (existingMark) {
              marks.push(existingMark);
              continue;
            }

            // Generate marks based on exam type and student performance
            const marksData = this.generateMarks(session.exam);
            
            const mark = await context.prisma.marksEntry.create({
              data: {
                branchId: context.branchId,
                studentId: student.id,
                sessionId: session.id,
                rawMarks: marksData.rawMarks,
                grade: marksData.grade,
                comments: marksData.comments
              }
            });

            marks.push(mark);

          } catch (error) {
            const errorMsg = `Failed to create mark for student ${student.id}, session ${session.id}: ${error}`;
            errors.push(errorMsg);
          }
        }
      }

      // Store created marks in context
      context.createdEntities.set('marks', marks);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: marks.length,
          successCount: marks.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: marks,
        errors: errors.length > 0 ? errors.map(e => typeof e === "string" ? new Error(e) : e) : [],
        warnings: []
      };

    } catch (error) {
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
        errors: [new Error(`Critical error in MarkSeeder: ${error}`)],
        data: [],
        warnings: []
      };
    }
  }

  /**
   * Generate marks data based on exam type
   */
  private generateMarks(exam: any): {
    rawMarks: number;
    grade: string;
    comments: string;
  } {
    const maxMarks = exam.maxMarks || 100;
    const minPassingMarks = exam.minPassingMarks || 33;
    
    // Generate realistic distribution of marks
    // 70% students pass, 30% fail
    // Among passing: 20% excellent, 30% good, 20% average
    const random = Math.random();
    let rawMarks: number;
    let grade: string;
    let comments: string;

    if (random < 0.2) {
      // Excellent students (85-100%)
      rawMarks = Math.floor(maxMarks * (0.85 + Math.random() * 0.15));
      grade = 'A+';
      comments = 'Excellent performance';
    } else if (random < 0.35) {
      // Very good students (75-85%)
      rawMarks = Math.floor(maxMarks * (0.75 + Math.random() * 0.1));
      grade = 'A';
      comments = 'Very good performance';
    } else if (random < 0.5) {
      // Good students (65-75%)
      rawMarks = Math.floor(maxMarks * (0.65 + Math.random() * 0.1));
      grade = 'B+';
      comments = 'Good performance';
    } else if (random < 0.65) {
      // Above average students (55-65%)
      rawMarks = Math.floor(maxMarks * (0.55 + Math.random() * 0.1));
      grade = 'B';
      comments = 'Above average performance';
    } else if (random < 0.75) {
      // Average students (45-55%)
      rawMarks = Math.floor(maxMarks * (0.45 + Math.random() * 0.1));
      grade = 'C+';
      comments = 'Average performance';
    } else if (random < 0.85) {
      // Below average students (33-45%)
      rawMarks = Math.floor(maxMarks * (minPassingMarks/maxMarks + Math.random() * 0.12));
      grade = 'C';
      comments = 'Below average, needs improvement';
    } else if (random < 0.92) {
      // Poor performance (20-33%)
      rawMarks = Math.floor(maxMarks * (0.2 + Math.random() * (minPassingMarks/maxMarks - 0.2)));
      grade = 'D';
      comments = 'Poor performance, needs significant improvement';
    } else {
      // Very poor performance (0-20%)
      rawMarks = Math.floor(maxMarks * Math.random() * 0.2);
      grade = 'F';
      comments = 'Failed, requires remedial support';
    }

    // Special handling for practical exams
    if (exam.examType === 'practical') {
      // Practical marks tend to be higher
      rawMarks = Math.min(maxMarks, Math.floor(rawMarks * 1.1));
      if (grade === 'F' && rawMarks >= minPassingMarks) {
        grade = 'D';
        comments = 'Practical skills need improvement';
      }
    }

    return { rawMarks, grade, comments };
  }
}