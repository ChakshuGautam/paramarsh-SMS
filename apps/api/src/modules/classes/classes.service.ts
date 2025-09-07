import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base-crud.service';

export type ClassRow = { branchId?: string; name: string; gradeLevel?: number };

@Injectable()
export class ClassesService extends BaseCrudService<any> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'class');
  }

  /**
   * Class model has branchId field for multi-school support
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }

  /**
   * Build search clause for class search
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search } }
    ];
  }

  // Map the list method to use BaseCrudService's getList
  async list(params: { page?: number; perPage?: number; sort?: string; q?: string; branchId: string; filter?: any; ids?: string }) {
    // Map ids to filter if provided
    const filter = { ...params.filter };
    if (params.ids) {
      filter.id = { in: params.ids.split(',') };
    }
    
    // Use parent's getList method
    return this.getList({
      page: params.page,
      perPage: params.perPage,
      sort: params.sort,
      filter: {
        ...filter,
        ...(params.q && { q: params.q }),
        branchId: params.branchId
      }
    });
  }

  async findOne(id: string, branchId: string) {
    const entity = await this.prisma.class.findFirst({
      where: { id, branchId },
    });
    if (!entity) {
      throw new NotFoundException('Class not found');
    }
    return { data: entity };
  }

  async create(input: { name: string; gradeLevel?: number; branchId: string }) {
    // Use parent's create method which returns { data: T }
    return super.create({ 
      branchId: input.branchId,
      name: input.name, 
      gradeLevel: input.gradeLevel ?? null 
    });
  }

  async updateWithBranch(id: string, input: { name?: string; gradeLevel?: number }, branchId: string) {
    // First check if the class exists with the given branchId
    const existing = await this.prisma.class.findFirst({
      where: { id, branchId }
    });
    if (!existing) {
      throw new NotFoundException('Class not found');
    }
    
    // Use parent's update method which returns { data: T }
    return super.update(id, { 
      name: input.name ?? undefined, 
      gradeLevel: input.gradeLevel ?? undefined 
    });
  }

  async remove(id: string, branchId: string) {
    // First check if the class exists with the given branchId
    const existing = await this.prisma.class.findFirst({
      where: { id, branchId }
    });
    if (!existing) {
      throw new NotFoundException('Class not found');
    }
    
    // Use parent's delete method
    return super.delete(id);
  }

  /**
   * Get teachers assigned to a class
   */
  async getClassTeachers(classId: string, branchId: string, subjectId?: string) {
    // Validate class exists
    const classEntity = await this.prisma.class.findFirst({
      where: { id: classId, branchId }
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const where: any = { classId, branchId };
    if (subjectId) {
      where.subjectId = subjectId;
    }

    const assignments = await this.prisma.classSubjectTeacher.findMany({
      where,
      include: {
        teacher: {
          include: {
            staff: true
          }
        },
        subject: true
      }
    });

    return {
      data: assignments.map(a => ({
        id: a.id,
        classId: a.classId,
        subjectId: a.subjectId,
        subjectName: a.subject.name,
        teacherId: a.teacherId,
        teacherName: `${a.teacher.staff.firstName} ${a.teacher.staff.lastName}`,
        teacherEmail: a.teacher.staff.email
      }))
    };
  }

  /**
   * Assign a teacher to a class for a specific subject
   */
  async assignTeacher(classId: string, teacherId: string, subjectId: string, branchId: string) {
    // Validate class exists
    const classEntity = await this.prisma.class.findFirst({
      where: { id: classId, branchId }
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Validate teacher exists
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId, branchId }
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Validate subject exists
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, branchId }
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Check if assignment already exists
    const existing = await this.prisma.classSubjectTeacher.findFirst({
      where: {
        classId,
        subjectId,
        teacherId
      }
    });

    if (existing) {
      return { data: existing, message: 'Assignment already exists' };
    }

    // Create new assignment
    const assignment = await this.prisma.classSubjectTeacher.create({
      data: {
        branchId,
        classId,
        subjectId,
        teacherId
      },
      include: {
        teacher: {
          include: {
            staff: true
          }
        },
        subject: true
      }
    });

    return {
      data: {
        id: assignment.id,
        classId: assignment.classId,
        subjectId: assignment.subjectId,
        subjectName: assignment.subject.name,
        teacherId: assignment.teacherId,
        teacherName: `${assignment.teacher.staff.firstName} ${assignment.teacher.staff.lastName}`,
        teacherEmail: assignment.teacher.staff.email
      }
    };
  }

  /**
   * Remove a teacher from a class
   */
  async removeTeacher(classId: string, teacherId: string, branchId: string, subjectId?: string) {
    // Validate class exists
    const classEntity = await this.prisma.class.findFirst({
      where: { id: classId, branchId }
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const where: any = {
      classId,
      teacherId,
      branchId
    };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    const deleted = await this.prisma.classSubjectTeacher.deleteMany({
      where
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Teacher assignment not found');
    }

    return {
      data: { deleted: deleted.count },
      message: `Removed ${deleted.count} teacher assignment(s)`
    };
  }
}