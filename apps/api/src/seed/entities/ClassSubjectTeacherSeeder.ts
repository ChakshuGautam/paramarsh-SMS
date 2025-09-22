/**
 * ClassSubjectTeacherSeeder Entity
 * Assigns teachers to subjects for each class
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

// Subject-Department mapping for teacher assignment
const SUBJECT_DEPARTMENT_MAP: Record<string, string[]> = {
  'Mathematics': ['Mathematics', 'Science', 'Physics'],
  'Science': ['Science', 'Physics', 'Chemistry', 'Biology'],
  'English': ['English', 'Languages'],
  'Hindi': ['Hindi', 'Languages'],
  'Social Studies': ['Social Studies', 'History', 'Geography'],
  'Computer Science': ['Computer Science', 'Information Technology'],
  'Physical Education': ['Physical Education', 'Sports'],
  'Art': ['Art', 'Creative Arts']
};

export class ClassSubjectTeacherSeeder extends BaseSeeder {
  public entityName = 'classSubjectTeacher';
  public dependencies = ['teachers', 'subjects', 'classes'];
  public priority = 45; // After teachers and subjects

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const assignments: any[] = [];
    const errors: string[] = [];

    try {
      // Check if assignments already exist for this branch
      const existingAssignments = await context.prisma.classSubjectTeacher.findMany({
        where: { branchId: context.branchId }
      });
      
      if (existingAssignments.length > 0) {
        // Assignments already exist, return them with zero new records
        context.createdEntities.set('classSubjectTeacher', existingAssignments);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            startTime: new Date(startTime),
            endTime: new Date(),
            totalRecords: 0,  // No new records created
            successCount: 0,  // No new successes
            errorCount: 0,
            duration: Date.now() - startTime
          },
          data: existingAssignments,
          errors: [],
          warnings: []
        };
      }

      // Get all required entities
      const classes = await context.prisma.class.findMany({
        where: { branchId: context.branchId }
      });

      const sections = await context.prisma.section.findMany({
        where: { branchId: context.branchId },
        include: { class: true }
      });

      const subjects = await context.prisma.subject.findMany({
        where: { branchId: context.branchId }
      });

      const teachers = await context.prisma.teacher.findMany({
        where: { branchId: context.branchId },
        include: { staff: true }
      });

      if (classes.length === 0 || subjects.length === 0 || teachers.length === 0) {
        throw new Error('Required entities (classes/subjects/teachers) not found');
      }

      // Track teacher workload to balance assignments
      const teacherWorkload = new Map<string, number>();
      teachers.forEach(t => teacherWorkload.set(t.id, 0));

      // Assign homeroom teachers to sections
      await this.assignHomeroomTeachers(context, sections, teachers);

      // Create subject-teacher assignments for each class
      for (const classEntity of classes) {
        const isPrimary = (classEntity.gradeLevel || 1) <= 5;

        for (const subject of subjects) {
          try {
            // Find suitable teacher for this subject
            const teacher = this.findSuitableTeacher(
              teachers,
              subject.name,
              teacherWorkload,
              isPrimary
            );

            if (!teacher) {
              errors.push(`No suitable teacher found for ${subject.name} in Class ${classEntity.gradeLevel || classEntity.name}`);
              continue;
            }

            // Check if assignment already exists
            const existingAssignment = await context.prisma.classSubjectTeacher.findFirst({
              where: {
                classId: classEntity.id,
                subjectId: subject.id,
                teacherId: teacher.id
              }
            });

            if (existingAssignment) {
              continue; // Skip if already exists
            }

            // Create the assignment
            const assignment = await context.prisma.classSubjectTeacher.create({
              data: {
                branchId: context.branchId,
                classId: classEntity.id,
                subjectId: subject.id,
                teacherId: teacher.id
              }
            });

            assignments.push(assignment);
            
            // Update teacher workload
            teacherWorkload.set(teacher.id, (teacherWorkload.get(teacher.id) || 0) + 1);

          } catch (error) {
            const errorMsg = `Failed to assign teacher for ${subject.name} in Class ${classEntity.gradeLevel || classEntity.name}: ${error}`;
            errors.push(errorMsg);
          }
        }
      }

      // Store created assignments in context
      context.createdEntities.set('classSubjectTeacher', assignments);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          startTime: new Date(startTime),
          endTime: new Date(),
          totalRecords: assignments.length,
          successCount: assignments.length,
          errorCount: errors.length,
          duration: Date.now() - startTime
        },
        data: assignments,
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
        errors: [new Error(`Critical error in ClassSubjectTeacherSeeder: ${error}`)],
        warnings: []
      };
    }
  }

  private async assignHomeroomTeachers(
    context: SeedContext,
    sections: any[],
    teachers: any[]
  ): Promise<void> {
    // Assign homeroom teachers to sections
    // Try to balance the assignments
    let teacherIndex = 0;
    
    for (const section of sections) {
      // Skip if already has a homeroom teacher
      if (section.homeroomTeacherId) continue;

      // Assign next available teacher as homeroom teacher
      const teacher = teachers[teacherIndex % teachers.length];
      
      try {
        await context.prisma.section.update({
          where: { id: section.id },
          data: { homeroomTeacherId: teacher.id }
        });
        
        teacherIndex++;
      } catch (error) {
        // Continue if update fails
        console.error(`Failed to assign homeroom teacher to ${section.name}: ${error}`);
      }
    }
  }

  private findSuitableTeacher(
    teachers: any[],
    subjectName: string,
    workload: Map<string, number>,
    isPrimary: boolean
  ): any | null {
    // Get acceptable departments for this subject
    const acceptableDepts = SUBJECT_DEPARTMENT_MAP[subjectName] || [];

    // Sort teachers by workload (ascending) to balance assignments
    const sortedTeachers = [...teachers].sort((a, b) => {
      const loadA = workload.get(a.id) || 0;
      const loadB = workload.get(b.id) || 0;
      return loadA - loadB;
    });

    // For primary classes, any teacher can teach most subjects
    if (isPrimary) {
      // Find teacher with lowest workload
      for (const teacher of sortedTeachers) {
        const load = workload.get(teacher.id) || 0;
        if (load < 8) { // Max 8 assignments per teacher
          return teacher;
        }
      }
    }

    // For secondary classes, match by department/qualification
    for (const teacher of sortedTeachers) {
      const load = workload.get(teacher.id) || 0;
      if (load >= 8) continue; // Skip overloaded teachers

      const dept = teacher.staff?.department || '';
      
      // Check if teacher's department matches subject
      if (acceptableDepts.includes(dept)) {
        return teacher;
      }
      
      // Check qualifications for subject match
      const qualification = teacher.staff?.qualification || '';
      if (qualification.toLowerCase().includes(subjectName.toLowerCase())) {
        return teacher;
      }
    }

    // If no perfect match, assign any available teacher with low workload
    for (const teacher of sortedTeachers) {
      const load = workload.get(teacher.id) || 0;
      if (load < 8) {
        return teacher;
      }
    }

    return null;
  }
}