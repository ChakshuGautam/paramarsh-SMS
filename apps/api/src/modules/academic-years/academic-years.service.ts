import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: any) {
    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(200, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * perPage;

    const where: any = {};
    
    // CRITICAL: Add branchId filtering for multi-tenancy
    if (params.branchId) {
      where.branchId = params.branchId;
    }
    
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
    
    // Standard filter object
    if (params.filter && typeof params.filter === 'object') {
      Object.keys(params.filter).forEach(key => {
        if (params.filter[key] !== undefined && params.filter[key] !== null) {
          where[key] = params.filter[key];
        }
      });
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
    } else {
      orderBy = { startDate: 'desc' }; // Default sort by start date descending
    }

    const [data, total] = await Promise.all([
      this.prisma.academicYear.findMany({ 
        where, 
        skip, 
        take: perPage, 
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

    return { data: parsedData, total };
  }

  async getOne(id: string, branchId?: string) {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { 
        id, 
        ...(branchId && { branchId })
      }
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

  async getMany(ids: string[], branchId?: string) {
    const data = await this.prisma.academicYear.findMany({
      where: { 
        id: { in: ids },
        ...(branchId && { branchId })
      }
    });

    // Parse terms JSON string
    const parsedData = data.map(item => ({
      ...item,
      terms: item.terms ? JSON.parse(item.terms as string) : []
    }));

    return { data: parsedData };
  }

  async create(input: any) {
    const branchId = input.branchId;
    
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

  async update(id: string, input: any) {
    const branchId = input.branchId;
    
    // First verify the academic year belongs to this branch if branchId provided
    if (branchId) {
      const academicYear = await this.prisma.academicYear.findFirst({
        where: { id, branchId }
      });
      
      if (!academicYear) {
        throw new NotFoundException('Academic year not found');
      }
    }
    
    const updateData: any = {};
    
    // Only add fields that are defined in the input
    if (input.name !== undefined) updateData.name = input.name;
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.endDate !== undefined) updateData.endDate = input.endDate;
    if (input.terms !== undefined) updateData.terms = JSON.stringify(input.terms);
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    
    // If setting as active, deactivate other academic years for this branch
    if (input.isActive === true && branchId) {
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

  async remove(id: string, branchId?: string) {
    // First verify the academic year belongs to this branch if branchId provided
    if (branchId) {
      const academicYear = await this.prisma.academicYear.findFirst({
        where: { id, branchId }
      });
      
      if (!academicYear) {
        throw new NotFoundException('Academic year not found');
      }
    }

    // Check if there are exams associated with this academic year
    const examCount = await this.prisma.exam.count({
      where: { academicYearId: id }
    });

    if (examCount > 0) {
      throw new BadRequestException(`Cannot delete academic year with ${examCount} associated exams`);
    }

    const result = await this.prisma.academicYear.delete({ where: { id } });
    return { 
      data: {
        ...result,
        terms: result.terms ? JSON.parse(result.terms as string) : []
      }
    };
  }
}