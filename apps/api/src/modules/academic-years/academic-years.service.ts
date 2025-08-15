import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { 
    page?: number; 
    pageSize?: number; 
    sort?: string; 
    q?: string;
    isActive?: boolean | string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    // Text search
    if (params.q) {
      where.name = { contains: params.q, mode: 'insensitive' };
    }
    
    // Active filter - convert string to boolean if needed
    if (params.isActive !== undefined) {
      where.isActive = typeof params.isActive === 'string' 
        ? params.isActive === 'true' 
        : params.isActive;
    }
    
    // Branch scoping - REQUIRED for academic years
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required for academic years');
    }
    where.branchId = branchId;
    
    // Sorting
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ startDate: 'desc' }]; // Default sort by start date descending

    const [data, total] = await Promise.all([
      this.prisma.academicYear.findMany({ 
        where, 
        skip, 
        take: pageSize, 
        orderBy,
        select: {
          id: true,
          branchId: true,
          name: true,
          startDate: true,
          endDate: true,
          terms: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      this.prisma.academicYear.count({ where }),
    ]);

    // Parse terms JSON string
    const parsedData = data.map(item => ({
      ...item,
      terms: item.terms ? JSON.parse(item.terms as string) : []
    }));

    return { data: parsedData, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async findOne(id: string) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }

    const academicYear = await this.prisma.academicYear.findFirst({
      where: { id, branchId }
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    return {
      data: {
        ...academicYear,
        terms: academicYear.terms ? JSON.parse(academicYear.terms as string) : []
      }
    };
  }

  async create(input: CreateAcademicYearDto) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required for academic years');
    }
    
    // If setting as active, deactivate other academic years for this branch
    if (input.isActive) {
      await this.prisma.academicYear.updateMany({
        where: { branchId, isActive: true },
        data: { isActive: false }
      });
    }
    
    const created = await this.prisma.academicYear.create({ 
      data: { 
        branchId,
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        terms: input.terms ? JSON.stringify(input.terms) : null,
        isActive: input.isActive ?? false,
      }
    });

    return { 
      data: {
        ...created,
        terms: created.terms ? JSON.parse(created.terms as string) : []
      }
    };
  }

  async update(id: string, input: UpdateAcademicYearDto) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }
    
    // First verify the academic year belongs to this branch
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { id, branchId }
    });
    
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }
    
    const updateData: any = {};
    
    // Only add fields that are defined in the input
    if (input.name !== undefined) updateData.name = input.name;
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.endDate !== undefined) updateData.endDate = input.endDate;
    if (input.terms !== undefined) updateData.terms = JSON.stringify(input.terms);
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    
    // If setting as active, deactivate other academic years for this branch
    if (input.isActive === true) {
      await this.prisma.academicYear.updateMany({
        where: { branchId, isActive: true, id: { not: id } },
        data: { isActive: false }
      });
    }
    
    const updated = await this.prisma.academicYear.update({ 
      where: { id },
      data: updateData
    });

    return { 
      data: {
        ...updated,
        terms: updated.terms ? JSON.parse(updated.terms as string) : []
      }
    };
  }

  async remove(id: string) {
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new BadRequestException('Branch context is required');
    }

    // First verify the academic year belongs to this branch
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { id, branchId }
    });
    
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    // Check if there are exams associated with this academic year
    const examCount = await this.prisma.exam.count({
      where: { academicYearId: id }
    });

    if (examCount > 0) {
      throw new BadRequestException(`Cannot delete academic year with ${examCount} associated exams`);
    }

    await this.prisma.academicYear.delete({ where: { id } });
    return { success: true };
  }
}