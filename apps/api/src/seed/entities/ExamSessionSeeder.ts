/**
 * ExamSessionSeeder Entity
 * Creates exam sessions for each exam with subject and room assignments
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class ExamSessionSeeder extends BaseSeeder {
  public entityName = 'examSessions';
  public dependencies = ['exams', 'subjects', 'rooms']; 
  public priority = 76; // After exams, subjects, and rooms

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const examSessions: any[] = [];
    const errors: string[] = [];

    try {
      // Check if exam sessions already exist
      const existingSessions = await context.prisma.examSession.findMany({
        where: { branchId: context.branchId },
        take: 1
      });
      
      if (existingSessions.length > 0) {
        // Sessions already exist
        context.createdEntities.set('examSessions', existingSessions);
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
          data: existingSessions,
          errors: [],
          warnings: []
        };
      }

      // Get exams
      const exams = await context.prisma.exam.findMany({
        where: { branchId: context.branchId }
      });

      if (exams.length === 0) {
        throw new Error('No exams found for creating sessions');
      }

      // Get subjects
      const subjects = await context.prisma.subject.findMany({
        where: { branchId: context.branchId }
      });

      if (subjects.length === 0) {
        throw new Error('No subjects found for exam sessions');
      }

      // Get rooms
      const rooms = await context.prisma.room.findMany({
        where: { 
          branchId: context.branchId,
          isActive: true,
          type: { in: ['classroom', 'exam_hall', 'lab'] }
        }
      });

      if (rooms.length === 0) {
        throw new Error('No rooms found for exam sessions');
      }

      // Core subjects for all students
      const coreSubjectCodes = ['MATH', 'ENG', 'SCI', 'SST', 'HIN'];
      const coreSubjects = subjects.filter(s => 
        coreSubjectCodes.some(code => s.code.includes(code))
      );

      // Lab subjects for practical exams
      const labSubjectCodes = ['PHY', 'CHEM', 'BIO', 'COMP'];
      const labSubjects = subjects.filter(s => 
        labSubjectCodes.some(code => s.code.includes(code))
      );

      // Exam halls for theory exams
      const examHalls = rooms.filter(r => r.type === 'exam_hall');
      const classrooms = rooms.filter(r => r.type === 'classroom');
      const labs = rooms.filter(r => r.type === 'lab');
      
      // Use exam halls if available, otherwise classrooms
      const theoryRooms = examHalls.length > 0 ? examHalls : classrooms;

      for (const exam of exams) {
        let subjectsForExam: any[] = [];
        let roomsForExam: any[] = [];

        // Determine subjects based on exam type
        if (exam.examType === 'practical') {
          // Practical exams only for lab subjects
          subjectsForExam = labSubjects.slice(0, 4); // Physics, Chemistry, Biology, Computer
          roomsForExam = labs.length > 0 ? labs : classrooms; // Use labs or fallback to classrooms
        } else {
          // Theory exams for core subjects
          subjectsForExam = coreSubjects.length > 0 ? coreSubjects : subjects.slice(0, 5);
          roomsForExam = theoryRooms;
        }

        // Create sessions for each subject
        for (let i = 0; i < subjectsForExam.length; i++) {
          const subject = subjectsForExam[i];
          const room = roomsForExam[i % roomsForExam.length]; // Cycle through rooms

          try {
            // Check if session already exists
            const existingSession = await context.prisma.examSession.findFirst({
              where: {
                branchId: context.branchId,
                examId: exam.id,
                subjectId: subject.id
              }
            });

            if (existingSession) {
              examSessions.push(existingSession);
              continue;
            }

            // Generate exam schedule based on exam dates
            const schedule = this.generateSchedule(exam, i);

            const session = await context.prisma.examSession.create({
              data: {
                branchId: context.branchId,
                examId: exam.id,
                subjectId: subject.id,
                roomId: room.id,
                schedule: schedule
              }
            });

            examSessions.push(session);

          } catch (error) {
            const errorMsg = `Failed to create exam session for exam ${exam.name}, subject ${subject.name}: ${error}`;
            errors.push(errorMsg);
          }
        }
      }

      // Store created sessions in context
      context.createdEntities.set('examSessions', examSessions);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          startTime: new Date(startTime),
          endTime: new Date(),
          totalRecords: examSessions.length,
          successCount: examSessions.length,
          errorCount: errors.length,
          duration: Date.now() - startTime
        },
        data: examSessions,
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
        errors: [new Error(`Critical error in ExamSessionSeeder: ${error}`)],
        warnings: []
      };
    }
  }

  /**
   * Generate schedule for exam session
   */
  private generateSchedule(exam: any, sessionIndex: number): string {
    if (!exam.startDate) {
      return `Day ${sessionIndex + 1}, 09:00 AM - 12:00 PM`;
    }

    const startDate = new Date(exam.startDate);
    const sessionDate = new Date(startDate);
    sessionDate.setDate(startDate.getDate() + sessionIndex);

    // Morning or afternoon session
    const timeSlot = sessionIndex % 2 === 0 
      ? '09:00 AM - 12:00 PM'
      : '02:00 PM - 05:00 PM';

    // Format: "2024-03-15, 09:00 AM - 12:00 PM"
    const dateStr = sessionDate.toISOString().split('T')[0];
    return `${dateStr}, ${timeSlot}`;
  }
}