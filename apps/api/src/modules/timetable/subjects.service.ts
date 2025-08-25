import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { 
  getSubjectsForGrade, 
  isSubjectAppropriateForGrade, 
  validateSubjectGradeAssignment,
  getGradeLevelFromClassName,
  GRADE_SUBJECT_MAPPING 
} from './constants/grade-subject-mapping';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SubjectCreateInput) {
    const { branchId } = PrismaService.getScope();
    return this.prisma.subject.create({ 
      data: {
        ...data,
        branchId: branchId ?? undefined,
      }
    });
  }

  async findAll(filters?: {
    page?: number;
    perPage?: number;
    pageSize?: number;
    sort?: string;
    q?: string;
    credits?: number;
    isElective?: boolean;
    code?: string;
    [key: string]: any;
  }) {
    const { branchId } = PrismaService.getScope();
    const where: Prisma.SubjectWhereInput = {};
    if (branchId) where.branchId = branchId;
    
    // Search filter
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q } },
        { code: { contains: filters.q } },
      ];
    }
    
    // Credits filter
    if (filters?.credits !== undefined) {
      where.credits = filters.credits;
    }
    
    // isElective filter
    if (filters?.isElective !== undefined) {
      where.isElective = filters.isElective;
    }
    
    // Code filter
    if (filters?.code) {
      where.code = filters.code;
    }
    
    // Apply other dynamic filters
    Object.keys(filters || {}).forEach(key => {
      if (!['page', 'perPage', 'sort', 'q'].includes(key) && filters![key] !== undefined) {
        if (!(where as any)[key]) {
          (where as any)[key] = filters![key];
        }
      }
    });
    
    // Pagination
    const page = filters?.page || 1;
    const perPage = filters?.perPage || filters?.pageSize || 10;
    const skip = (page - 1) * perPage;
    
    // Sorting - handle React Admin format
    let orderBy: Prisma.SubjectOrderByWithRelationInput = { name: 'asc' };
    if (filters?.sort) {
      const sortField = filters.sort.startsWith('-') ? filters.sort.substring(1) : filters.sort;
      const sortDirection = filters.sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortDirection };
    }
    
    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          constraints: true,
          periods: {
            include: {
              section: true,
              teacher: true,
            },
          },
        },
      }),
      this.prisma.subject.count({ where }),
    ]);
    
    return {
      data: subjects,
      total,
    };
  }

  async findOne(id: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;
    
    return this.prisma.subject.findUnique({
      where,
      include: {
        constraints: true,
        periods: {
          include: {
            section: {
              include: { class: true },
            },
            teacher: {
              include: { staff: true },
            },
            room: true,
          },
        },
      },
    });
  }

  async findMany(ids: string[]) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id: { in: ids } };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.subject.findMany({
      where,
      include: {
        constraints: true,
        periods: {
          take: 5,
          include: {
            section: true,
            teacher: true,
          },
        },
      },
    });

    return { data };
  }

  async update(id: string, data: Prisma.SubjectUpdateInput) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;
    
    return this.prisma.subject.update({
      where,
      data,
    });
  }

  async remove(id: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;
    
    return this.prisma.subject.delete({
      where,
    });
  }

  async addConstraint(subjectId: string, constraint: {
    type: string;
    value: string;
    priority?: number;
  }) {
    return this.prisma.subjectConstraint.create({
      data: {
        subjectId,
        ...constraint,
      },
    });
  }

  async getSubjectsByClass(classId: string) {
    return this.prisma.subject.findMany({
      where: {
        periods: {
          some: {
            section: {
              classId,
            },
          },
        },
      },
    });
  }

  async getSubjectLoad(subjectId: string) {
    const periods = await this.prisma.timetablePeriod.findMany({
      where: {
        subjectId,
      },
      include: {
        section: {
          include: { class: true },
        },
      },
    });

    const loadByClass = periods.reduce((acc, period) => {
      const className = period.section.class.name;
      if (!acc[className]) {
        acc[className] = {
          className,
          periodsPerWeek: 0,
          sections: new Set(),
        };
      }
      acc[className].periodsPerWeek++;
      acc[className].sections.add(period.section.name);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(loadByClass).map((load: any) => ({
      ...load,
      sections: Array.from(load.sections),
    }));
  }

  // ========== GRADE-APPROPRIATE FILTERING METHODS ==========

  /**
   * Get subjects appropriate for a specific class
   */
  async getSubjectsForClass(classId: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id: classId };
    if (branchId) where.branchId = branchId;

    // Get class information including grade level
    const classInfo = await this.prisma.class.findUnique({
      where,
    });

    if (!classInfo) {
      throw new BadRequestException('Class not found');
    }

    const gradeLevel = classInfo.gradeLevel || getGradeLevelFromClassName(classInfo.name);
    const appropriateSubjects = getSubjectsForGrade(gradeLevel);

    // Get all subjects from database and filter by appropriateness
    const allSubjects = await this.prisma.subject.findMany({
      where: branchId ? { branchId } : {},
      include: {
        constraints: true,
        periods: {
          where: {
            section: {
              classId,
            },
          },
          include: {
            teacher: {
              include: { staff: true },
            },
            section: true,
          },
        },
      },
    });

    // Filter subjects based on grade appropriateness
    const filteredSubjects = allSubjects.filter(subject => {
      return appropriateSubjects.some(appropriate => appropriate.name === subject.name);
    });

    return {
      data: filteredSubjects,
      gradeLevel,
      className: classInfo.name,
      appropriateSubjectCount: appropriateSubjects.length,
      totalSubjectCount: allSubjects.length,
    };
  }

  /**
   * Get subjects with grade filtering
   */
  async findAllWithGradeFilter(filters?: {
    page?: number;
    perPage?: number;
    pageSize?: number;
    sort?: string;
    q?: string;
    gradeLevel?: number;
    className?: string;
    classId?: string;
    [key: string]: any;
  }) {
    let gradeLevel: number | undefined;

    // Determine grade level from various sources
    if (filters?.gradeLevel !== undefined) {
      gradeLevel = filters.gradeLevel;
    } else if (filters?.className) {
      gradeLevel = getGradeLevelFromClassName(filters.className);
    } else if (filters?.classId) {
      const classInfo = await this.prisma.class.findUnique({
        where: { id: filters.classId },
      });
      if (classInfo) {
        gradeLevel = classInfo.gradeLevel || getGradeLevelFromClassName(classInfo.name);
      }
    }

    // Get appropriate subjects for grade level
    let appropriateSubjectNames: string[] = [];
    if (gradeLevel !== undefined) {
      const appropriateSubjects = getSubjectsForGrade(gradeLevel);
      appropriateSubjectNames = appropriateSubjects.map(s => s.name);
    }

    const { branchId } = PrismaService.getScope();
    const where: Prisma.SubjectWhereInput = {};
    if (branchId) where.branchId = branchId;

    // Apply grade-level filtering
    if (appropriateSubjectNames.length > 0) {
      where.name = { in: appropriateSubjectNames };
    }

    // Search filter
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q } },
        { code: { contains: filters.q } },
      ];
    }

    // Other filters...
    if (filters?.credits !== undefined) {
      where.credits = filters.credits;
    }
    if (filters?.isElective !== undefined) {
      where.isElective = filters.isElective;
    }
    if (filters?.code) {
      where.code = filters.code;
    }

    // Pagination
    const page = filters?.page || 1;
    const perPage = filters?.perPage || filters?.pageSize || 10;
    const skip = (page - 1) * perPage;

    // Sorting
    let orderBy: Prisma.SubjectOrderByWithRelationInput = { name: 'asc' };
    if (filters?.sort) {
      const sortField = filters.sort.startsWith('-') ? filters.sort.substring(1) : filters.sort;
      const sortDirection = filters.sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortDirection };
    }

    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          constraints: true,
          periods: {
            include: {
              section: {
                include: { class: true },
              },
              teacher: {
                include: { staff: true },
              },
            },
          },
        },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      data: subjects,
      total,
      gradeLevel,
      filteredByGrade: gradeLevel !== undefined,
      appropriateSubjectCount: appropriateSubjectNames.length,
    };
  }

  /**
   * Validate subject-class assignment
   */
  async validateSubjectClassAssignment(subjectId: string, classId: string) {
    const { branchId } = PrismaService.getScope();

    // Get subject and class information
    const [subject, classInfo] = await Promise.all([
      this.prisma.subject.findUnique({
        where: { 
          id: subjectId,
          ...(branchId && { branchId })
        },
      }),
      this.prisma.class.findUnique({
        where: { 
          id: classId,
          ...(branchId && { branchId })
        },
      }),
    ]);

    if (!subject || !classInfo) {
      return {
        isValid: false,
        message: 'Subject or class not found',
      };
    }

    const gradeLevel = classInfo.gradeLevel || getGradeLevelFromClassName(classInfo.name);
    return validateSubjectGradeAssignment(subject.name, gradeLevel);
  }

  /**
   * Get all inappropriate subject-class assignments in the system
   */
  async getInappropriateAssignments() {
    const { branchId } = PrismaService.getScope();

    // Get all timetable periods with subject, class, and teacher information
    const periods = await this.prisma.timetablePeriod.findMany({
      where: branchId ? { branchId } : {},
      include: {
        subject: true,
        section: {
          include: { class: true },
        },
        teacher: {
          include: { staff: true },
        },
      },
    });

    const inappropriateAssignments = [];

    for (const period of periods) {
      if (!period.subject || !period.section?.class) continue;

      const gradeLevel = period.section.class.gradeLevel || 
                        getGradeLevelFromClassName(period.section.class.name);
      
      const validation = validateSubjectGradeAssignment(period.subject.name, gradeLevel);
      
      if (!validation.isValid) {
        inappropriateAssignments.push({
          periodId: period.id,
          subjectName: period.subject.name,
          subjectCode: period.subject.code,
          className: period.section.class.name,
          sectionName: period.section.name,
          gradeLevel,
          teacherName: period.teacher?.staff ? 
            `${period.teacher.staff.firstName} ${period.teacher.staff.lastName}` : 
            'Unassigned',
          dayOfWeek: period.dayOfWeek,
          startTime: period.startTime,
          endTime: period.endTime,
          validation,
        });
      }
    }

    return {
      data: inappropriateAssignments,
      total: inappropriateAssignments.length,
      summary: {
        totalPeriods: periods.length,
        inappropriatePeriods: inappropriateAssignments.length,
        appropriatePeriods: periods.length - inappropriateAssignments.length,
        percentageInappropriate: periods.length > 0 ? 
          Math.round((inappropriateAssignments.length / periods.length) * 100) : 0,
      },
    };
  }

  /**
   * Get subject-teacher-class mapping overview
   */
  async getSubjectTeacherClassMapping() {
    const { branchId } = PrismaService.getScope();

    const periods = await this.prisma.timetablePeriod.findMany({
      where: branchId ? { branchId } : {},
      include: {
        subject: true,
        section: {
          include: { class: true },
        },
        teacher: {
          include: { staff: true },
        },
      },
    });

    const mappingData = periods.reduce((acc, period) => {
      if (!period.subject || !period.section?.class || !period.teacher?.staff) return acc;

      const key = `${period.subject.name}-${period.section.class.name}`;
      const gradeLevel = period.section.class.gradeLevel || 
                        getGradeLevelFromClassName(period.section.class.name);
      
      const validation = validateSubjectGradeAssignment(period.subject.name, gradeLevel);

      if (!acc[key]) {
        acc[key] = {
          subjectName: period.subject.name,
          subjectCode: period.subject.code,
          className: period.section.class.name,
          gradeLevel,
          teachers: new Set(),
          sections: new Set(),
          periodsPerWeek: 0,
          isAppropriate: validation.isValid,
          validationMessage: validation.message,
          suggestion: validation.suggestion,
        };
      }

      acc[key].teachers.add(`${period.teacher.staff.firstName} ${period.teacher.staff.lastName}`);
      acc[key].sections.add(period.section.name);
      acc[key].periodsPerWeek++;

      return acc;
    }, {} as Record<string, any>);

    // Convert Sets to Arrays for JSON serialization
    const mappings = Object.values(mappingData).map((mapping: any) => ({
      ...mapping,
      teachers: Array.from(mapping.teachers),
      sections: Array.from(mapping.sections),
    }));

    const inappropriate = mappings.filter(m => !m.isAppropriate);
    const appropriate = mappings.filter(m => m.isAppropriate);

    return {
      data: mappings,
      total: mappings.length,
      summary: {
        totalMappings: mappings.length,
        appropriateMappings: appropriate.length,
        inappropriateMappings: inappropriate.length,
        percentageInappropriate: mappings.length > 0 ? 
          Math.round((inappropriate.length / mappings.length) * 100) : 0,
      },
      inappropriateMappings: inappropriate,
    };
  }
}