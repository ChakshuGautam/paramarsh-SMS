import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { 
    page?: number; 
    perPage?: number;
    pageSize?: number; // Keep for backward compatibility
    sort?: string; 
    q?: string;
    examId?: string;
    subjectId?: string;
    studentId?: string;
    isAbsent?: boolean;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(200, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * perPage;

    const where: any = {};
    
    // Filters
    if (params.examId) where.examId = params.examId;
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.studentId) where.studentId = params.studentId;
    if (params.isAbsent !== undefined) where.isAbsent = params.isAbsent;
    
    // Text search on student or subject names via relations
    if (params.q) {
      where.OR = [
        { student: { firstName: { contains: params.q, mode: 'insensitive' } } },
        { student: { lastName: { contains: params.q, mode: 'insensitive' } } },
        { subject: { name: { contains: params.q, mode: 'insensitive' } } },
      ];
    }
    
    // Branch scoping
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required for marks');
    }
    where.branchId = branchId;
    
    // Sorting
    let orderBy: any = [{ createdAt: 'desc' }];
    if (params.sort) {
      const sortField = params.sort.startsWith('-') ? params.sort.slice(1) : params.sort;
      const sortOrder = params.sort.startsWith('-') ? 'desc' : 'asc';
      
      // Handle special relation sorting
      if (sortField === 'student') {
        orderBy = [{ student: { firstName: sortOrder } }];
      } else if (sortField === 'subject') {
        orderBy = [{ subject: { name: sortOrder } }];
      } else if (sortField === 'exam') {
        orderBy = [{ exam: { name: sortOrder } }];
      } else {
        // Direct field sorting
        orderBy = [{ [sortField]: sortOrder }];
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.mark.findMany({ 
        where, 
        skip, 
        take: perPage, 
        orderBy,
        include: {
          exam: {
            select: {
              id: true,
              name: true,
              examType: true,
              academicYearId: true,
              term: true,
              maxMarks: true,
              minPassingMarks: true,
            }
          },
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
            }
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNo: true,
              rollNumber: true,
            }
          }
        }
      }),
      this.prisma.mark.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }

    const mark = await this.prisma.mark.findFirst({
      where: { id, branchId },
      include: {
        exam: true,
        subject: true,
        student: true,
      }
    });

    if (!mark) {
      throw new NotFoundException('Mark entry not found');
    }

    return { data: mark };
  }

  async create(input: CreateMarkDto) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }
    
    // Check if mark already exists for this exam-subject-student combination
    const existing = await this.prisma.mark.findUnique({
      where: {
        examId_subjectId_studentId: {
          examId: input.examId,
          subjectId: input.subjectId,
          studentId: input.studentId,
        }
      }
    });

    if (existing) {
      throw new BadRequestException('Mark entry already exists for this exam, subject, and student combination');
    }

    // Calculate total marks if not provided
    let totalMarks = input.totalMarks;
    if (totalMarks === undefined && !input.isAbsent) {
      totalMarks = 0;
      if (input.theoryMarks) totalMarks += input.theoryMarks;
      if (input.practicalMarks) totalMarks += input.practicalMarks;
      if (input.projectMarks) totalMarks += input.projectMarks;
      if (input.internalMarks) totalMarks += input.internalMarks;
    }

    // If evaluated, set evaluatedAt
    const evaluatedAt = input.evaluatedBy ? new Date() : undefined;

    const created = await this.prisma.mark.create({ 
      data: { 
        branchId,
        examId: input.examId,
        subjectId: input.subjectId,
        studentId: input.studentId,
        theoryMarks: input.theoryMarks ?? null,
        practicalMarks: input.practicalMarks ?? null,
        projectMarks: input.projectMarks ?? null,
        internalMarks: input.internalMarks ?? null,
        totalMarks: totalMarks ?? null,
        grade: input.grade ?? null,
        remarks: input.remarks ?? null,
        isAbsent: input.isAbsent ?? false,
        evaluatedBy: input.evaluatedBy ?? null,
        evaluatedAt,
      },
      include: {
        exam: true,
        subject: true,
        student: true,
      }
    });

    return { data: created };
  }

  async update(id: string, input: UpdateMarkDto) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }
    
    // First verify the mark belongs to this branch
    const mark = await this.prisma.mark.findFirst({
      where: { id, branchId }
    });
    
    if (!mark) {
      throw new NotFoundException('Mark entry not found');
    }

    // Calculate total marks if component marks are provided
    let totalMarks = input.totalMarks;
    if (totalMarks === undefined && !input.isAbsent && 
        (input.theoryMarks !== undefined || input.practicalMarks !== undefined || 
         input.projectMarks !== undefined || input.internalMarks !== undefined)) {
      // Get current values
      totalMarks = 0;
      totalMarks += input.theoryMarks ?? mark.theoryMarks ?? 0;
      totalMarks += input.practicalMarks ?? mark.practicalMarks ?? 0;
      totalMarks += input.projectMarks ?? mark.projectMarks ?? 0;
      totalMarks += input.internalMarks ?? mark.internalMarks ?? 0;
    }

    // If evaluated, update evaluatedAt
    const evaluatedAt = input.evaluatedBy ? new Date() : undefined;

    const updateData: any = {};
    if (input.theoryMarks !== undefined) updateData.theoryMarks = input.theoryMarks;
    if (input.practicalMarks !== undefined) updateData.practicalMarks = input.practicalMarks;
    if (input.projectMarks !== undefined) updateData.projectMarks = input.projectMarks;
    if (input.internalMarks !== undefined) updateData.internalMarks = input.internalMarks;
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
    if (input.grade !== undefined) updateData.grade = input.grade;
    if (input.remarks !== undefined) updateData.remarks = input.remarks;
    if (input.isAbsent !== undefined) updateData.isAbsent = input.isAbsent;
    if (input.evaluatedBy !== undefined) {
      updateData.evaluatedBy = input.evaluatedBy;
      updateData.evaluatedAt = evaluatedAt;
    }
    
    const updated = await this.prisma.mark.update({ 
      where: { id },
      data: updateData,
      include: {
        exam: true,
        subject: true,
        student: true,
      }
    });

    return { data: updated };
  }

  async remove(id: string) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }

    // First verify the mark belongs to this branch
    const mark = await this.prisma.mark.findFirst({
      where: { id, branchId }
    });
    
    if (!mark) {
      throw new NotFoundException('Mark entry not found');
    }

    const deleted = await this.prisma.mark.delete({ where: { id } });
    return { data: deleted };
  }

  // Bulk operations for entering marks for a whole class/exam
  async bulkCreate(examId: string, subjectId: string, marks: CreateMarkDto[]) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }

    const results = await this.prisma.$transaction(
      marks.map(mark => {
        // Calculate total marks for each entry
        let totalMarks = mark.totalMarks;
        if (totalMarks === undefined && !mark.isAbsent) {
          totalMarks = 0;
          if (mark.theoryMarks) totalMarks += mark.theoryMarks;
          if (mark.practicalMarks) totalMarks += mark.practicalMarks;
          if (mark.projectMarks) totalMarks += mark.projectMarks;
          if (mark.internalMarks) totalMarks += mark.internalMarks;
        }

        return this.prisma.mark.upsert({
          where: {
            examId_subjectId_studentId: {
              examId,
              subjectId,
              studentId: mark.studentId,
            }
          },
          update: {
            theoryMarks: mark.theoryMarks ?? null,
            practicalMarks: mark.practicalMarks ?? null,
            projectMarks: mark.projectMarks ?? null,
            internalMarks: mark.internalMarks ?? null,
            totalMarks: totalMarks ?? null,
            grade: mark.grade ?? null,
            remarks: mark.remarks ?? null,
            isAbsent: mark.isAbsent ?? false,
            evaluatedBy: mark.evaluatedBy ?? null,
            evaluatedAt: mark.evaluatedBy ? new Date() : null,
          },
          create: {
            branchId,
            examId,
            subjectId,
            studentId: mark.studentId,
            theoryMarks: mark.theoryMarks ?? null,
            practicalMarks: mark.practicalMarks ?? null,
            projectMarks: mark.projectMarks ?? null,
            internalMarks: mark.internalMarks ?? null,
            totalMarks: totalMarks ?? null,
            grade: mark.grade ?? null,
            remarks: mark.remarks ?? null,
            isAbsent: mark.isAbsent ?? false,
            evaluatedBy: mark.evaluatedBy ?? null,
            evaluatedAt: mark.evaluatedBy ? new Date() : null,
          }
        });
      })
    );

    return { data: results, count: results.length };
  }

  // Get marks for a specific exam
  async getExamMarks(examId: string) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }

    const marks = await this.prisma.mark.findMany({
      where: { examId, branchId },
      include: {
        subject: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
            rollNumber: true,
            classId: true,
            sectionId: true,
          }
        }
      },
      orderBy: [
        { student: { rollNumber: 'asc' } },
        { subject: { name: 'asc' } }
      ]
    });

    return { data: marks };
  }

  // Get marks for a specific student
  async getStudentMarks(studentId: string) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }

    const marks = await this.prisma.mark.findMany({
      where: { studentId, branchId },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            examType: true,
            term: true,
            academicYearId: true,
            weightagePercent: true,
            maxMarks: true,
            minPassingMarks: true,
          }
        },
        subject: true,
      },
      orderBy: [
        { exam: { startDate: 'desc' } },
        { subject: { name: 'asc' } }
      ]
    });

    return { data: marks };
  }
}