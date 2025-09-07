import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseCrudService } from '../../common/base-crud.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeachersService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'teacher');
  }

  /**
   * Override getList to include staff relation and proper branchId filtering
   */
  async getList(params: any) {
    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * perPage;

    // Build where clause with branchId filtering
    const where: any = {};
    
    // CRITICAL: Add branchId filtering for multi-tenancy
    if (params.branchId) {
      where.branchId = params.branchId;
    }
    
    // Add filters with proper handling of complex operators
    if (params.filter && typeof params.filter === 'object') {
      Object.keys(params.filter).forEach(key => {
        if (params.filter[key] !== undefined && params.filter[key] !== null) {
          const filterValue = params.filter[key];
          
          // Handle complex MongoDB-style operators
          if (typeof filterValue === 'object' && filterValue !== null) {
            const convertedFilter: any = {};
            
            Object.keys(filterValue).forEach(operator => {
              switch (operator) {
                case '$contains':
                  convertedFilter.contains = filterValue[operator];
                  convertedFilter.mode = 'insensitive';
                  break;
                case '$gte':
                  convertedFilter.gte = filterValue[operator];
                  break;
                case '$lte':
                  convertedFilter.lte = filterValue[operator];
                  break;
                case '$gt':
                  convertedFilter.gt = filterValue[operator];
                  break;
                case '$lt':
                  convertedFilter.lt = filterValue[operator];
                  break;
                case '$in':
                  convertedFilter.in = filterValue[operator];
                  break;
                case '$not':
                  convertedFilter.not = filterValue[operator];
                  break;
                default:
                  convertedFilter[operator] = filterValue[operator];
              }
            });
            
            where[key] = convertedFilter;
          } else {
            // Simple equality filter
            where[key] = filterValue;
          }
        }
      });
    }
    
    // Handle search query 'q'
    if (params.q && typeof params.q === 'string') {
      where.OR = [
        { subjects: { contains: params.q, mode: 'insensitive' } },
        { qualifications: { contains: params.q, mode: 'insensitive' } },
        { staff: { firstName: { contains: params.q, mode: 'insensitive' } } },
        { staff: { lastName: { contains: params.q, mode: 'insensitive' } } },
        { staff: { email: { contains: params.q, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy for sorting  
    let orderBy: any = undefined;
    if (params.sort) {
      let sortField: string;
      let sortOrder: 'asc' | 'desc';
      
      if (params.sort.includes(':')) {
        const [field, order] = params.sort.split(':');
        sortField = field;
        sortOrder = order === 'desc' ? 'desc' : 'asc';
      } else if (params.sort.startsWith('-')) {
        sortField = params.sort.slice(1);
        sortOrder = 'desc';
      } else {
        sortField = params.sort;
        sortOrder = 'asc';
      }
      
      orderBy = { [sortField]: sortOrder };
    }

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: perPage,
        ...(orderBy && { orderBy }),
        include: {
          staff: true,
          classSubjects: {
            include: {
              class: true,
              subject: true,
            },
          },
        },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    // Transform data to include classIds and sectionIds for React Admin
    const data = await Promise.all(teachers.map(async (teacher) => {
      // Get unique class IDs from classSubjects
      const classIds = [...new Set(teacher.classSubjects.map(cs => cs.classId))];
      
      // Get sections where teacher teaches (from timetable periods)
      const periods = await this.prisma.timetablePeriod.findMany({
        where: {
          teacherId: teacher.id,
          branchId: teacher.branchId,
        },
        select: {
          sectionId: true,
        },
        distinct: ['sectionId'],
      });
      
      const sectionIds = periods.map(p => p.sectionId).filter(Boolean);
      
      return {
        ...teacher,
        classIds,
        sectionIds,
      };
    }));

    return { data, total };
  }

  /**
   * Override getOne to include staff relation and branchId filtering
   */
  async getOne(id: string, branchId?: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { 
        id,
        ...(branchId && { branchId })
      },
      include: {
        staff: true,
        classSubjects: {
          include: {
            class: true,
            subject: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get unique class IDs from classSubjects
    const classIds = [...new Set(teacher.classSubjects.map(cs => cs.classId))];
    
    // Get sections where teacher teaches (from timetable periods)
    const periods = await this.prisma.timetablePeriod.findMany({
      where: {
        teacherId: teacher.id,
        branchId: teacher.branchId,
      },
      select: {
        sectionId: true,
      },
      distinct: ['sectionId'],
    });
    
    const sectionIds = periods.map(p => p.sectionId).filter(Boolean);

    const data = {
      ...teacher,
      classIds,
      sectionIds,
    };

    return { data };
  }

  /**
   * Get multiple teachers by IDs
   */
  async getMany(ids: string[], branchId?: string) {
    const data = await this.prisma.teacher.findMany({
      where: { 
        id: { in: ids },
        ...(branchId && { branchId })
      },
      include: {
        staff: true,
      },
    });

    return { data };
  }

  /**
   * Create teacher
   */
  async create(data: any) {
    const result = await this.prisma.teacher.create({
      data,
      include: {
        staff: true,
      },
    });

    return { data: result };
  }

  /**
   * Update teacher
   */
  async update(id: string, data: any) {
    const result = await this.prisma.teacher.update({
      where: { id },
      data,
      include: {
        staff: true,
      },
    });

    return { data: result };
  }

  /**
   * Delete teacher
   */
  async delete(id: string) {
    const result = await this.prisma.teacher.delete({
      where: { id },
      include: {
        staff: true,
      },
    });

    return { data: result };
  }

  /**
   * Override to support search on staff fields
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { subjects: { contains: search, mode: 'insensitive' } },
      { qualifications: { contains: search, mode: 'insensitive' } },
      { staff: { firstName: { contains: search, mode: 'insensitive' } } },
      { staff: { lastName: { contains: search, mode: 'insensitive' } } },
      { staff: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  /**
   * Teachers now have branchId field for multi-school support
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }

  /**
   * Get all class/subject assignments for a teacher
   */
  async getTeacherAssignments(teacherId: string, branchId: string) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId, branchId }
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const assignments = await this.prisma.classSubjectTeacher.findMany({
      where: {
        teacherId,
        branchId
      },
      include: {
        class: true,
        subject: true
      }
    });

    return {
      data: assignments.map(a => ({
        id: a.id,
        classId: a.classId,
        className: a.class.name,
        gradeLevel: a.class.gradeLevel,
        subjectId: a.subjectId,
        subjectName: a.subject.name,
        subjectCode: a.subject.code
      }))
    };
  }

  /**
   * Get all sections where teacher teaches (via timetable periods)
   */
  async getTeacherSections(teacherId: string, branchId: string) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId, branchId }
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get unique sections from timetable periods
    const periods = await this.prisma.timetablePeriod.findMany({
      where: {
        teacherId,
        branchId
      },
      select: {
        section: {
          include: {
            class: true
          }
        }
      },
      distinct: ['sectionId']
    });

    // Also get sections where teacher is homeroom teacher
    const homeroomSections = await this.prisma.section.findMany({
      where: {
        homeroomTeacherId: teacherId,
        branchId
      },
      include: {
        class: true
      }
    });

    // Combine and deduplicate
    const allSections = new Map();
    
    periods.forEach(p => {
      if (p.section) {
        allSections.set(p.section.id, {
          id: p.section.id,
          sectionName: p.section.name,
          classId: p.section.classId,
          className: p.section.class.name,
          capacity: p.section.capacity,
          isHomeroom: false
        });
      }
    });

    homeroomSections.forEach(s => {
      if (allSections.has(s.id)) {
        allSections.get(s.id).isHomeroom = true;
      } else {
        allSections.set(s.id, {
          id: s.id,
          sectionName: s.name,
          classId: s.classId,
          className: s.class.name,
          capacity: s.capacity,
          isHomeroom: true
        });
      }
    });

    return {
      data: Array.from(allSections.values())
    };
  }

  /**
   * Assign teacher to a class for a subject
   */
  async assignToClass(teacherId: string, classId: string, subjectId: string, branchId: string) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId, branchId }
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Validate class exists
    const classEntity = await this.prisma.class.findFirst({
      where: { id: classId, branchId }
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
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
        teacherId,
        classId,
        subjectId
      }
    });

    if (existing) {
      return { data: existing, message: 'Assignment already exists' };
    }

    // Create assignment
    const assignment = await this.prisma.classSubjectTeacher.create({
      data: {
        branchId,
        teacherId,
        classId,
        subjectId
      },
      include: {
        class: true,
        subject: true
      }
    });

    return {
      data: {
        id: assignment.id,
        classId: assignment.classId,
        className: assignment.class.name,
        subjectId: assignment.subjectId,
        subjectName: assignment.subject.name
      }
    };
  }

  /**
   * Remove teacher from a class/subject assignment
   */
  async removeFromClass(teacherId: string, classId: string, subjectId: string, branchId: string) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId, branchId }
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const deleted = await this.prisma.classSubjectTeacher.deleteMany({
      where: {
        teacherId,
        classId,
        subjectId,
        branchId
      }
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Teacher assignment not found');
    }

    return {
      data: { deleted: deleted.count },
      message: 'Teacher removed from class successfully'
    };
  }
}