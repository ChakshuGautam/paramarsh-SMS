import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base-crud.service';
import { TeacherAttendance } from '@prisma/client';

@Injectable()
export class TeacherAttendanceService extends BaseCrudService<TeacherAttendance> {
  constructor(prisma: PrismaService) {
    super(prisma, 'teacherAttendance');
  }

  /**
   * Support branch scoping for multi-tenancy
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }

  /**
   * Build search clause for teacher attendance
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { teacher: { staff: { firstName: { contains: search } } } },
      { teacher: { staff: { lastName: { contains: search } } } },
      { status: { contains: search } },
      { remarks: { contains: search } }
    ];
  }

  /**
   * CRUD methods using the new interface pattern
   */
  
  // Get all teacher attendance records with pagination and filtering
  async findAll(params: {
    page?: number;
    pageSize?: number;
    sort?: any;
    filter?: any;
    branchId: string;
  }) {
    const { page = 1, pageSize = 10, sort, filter = {}, branchId } = params;
    
    // Add branch scoping to filter
    const filterWithBranch = { ...filter, branchId };
    
    // Process sort parameter
    let sortString = undefined;
    if (sort) {
      if (typeof sort === 'string') {
        sortString = sort;
      } else if (sort.field && sort.order) {
        sortString = sort.order === 'DESC' ? `-${sort.field}` : sort.field;
      }
    }

    return this.getList({
      page,
      perPage: pageSize,
      sort: sortString,
      filter: filterWithBranch,
    });
  }

  // Get single teacher attendance record with branch isolation
  async findOne(id: string, branchId: string) {
    const record = await (this.prisma as any).teacherAttendance.findFirst({
      where: { id, branchId }
    });
    
    if (!record) {
      throw new NotFoundException('Teacher attendance record not found');
    }
    
    return record;
  }

  // Create teacher attendance record
  async create(data: any) {
    const result = await super.create(data);
    return result.data;
  }

  // Update teacher attendance record with branch isolation
  async update(id: string, data: any, branchId: string) {
    // First check if record exists with branch filter
    const existingRecord = await (this.prisma as any).teacherAttendance.findFirst({
      where: { id, branchId }
    });
    
    if (!existingRecord) {
      throw new NotFoundException('Teacher attendance record not found');
    }
    
    const updated = await (this.prisma as any).teacherAttendance.update({
      where: { id },
      data
    });
    
    return updated;
  }

  // Delete teacher attendance record with branch isolation
  async remove(id: string, branchId: string) {
    // First check if record exists with branch filter
    const existingRecord = await (this.prisma as any).teacherAttendance.findFirst({
      where: { id, branchId }
    });
    
    if (!existingRecord) {
      throw new NotFoundException('Teacher attendance record not found');
    }
    
    const deleted = await (this.prisma as any).teacherAttendance.delete({
      where: { id }
    });
    
    return deleted;
  }
}