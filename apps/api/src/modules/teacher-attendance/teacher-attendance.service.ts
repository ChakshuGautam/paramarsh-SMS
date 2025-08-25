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
<<<<<<< HEAD
    perPage?: number;
    pageSize?: number; // Keep for backward compatibility
=======
    pageSize?: number;
>>>>>>> origin/main
    sort?: any;
    filter?: any;
    branchId: string;
  }) {
<<<<<<< HEAD
    const { page = 1, perPage, pageSize = 10, sort, filter = {}, branchId } = params;
    const effectivePerPage = perPage || pageSize;
=======
    const { page = 1, pageSize = 10, sort, filter = {}, branchId } = params;
>>>>>>> origin/main
    
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

<<<<<<< HEAD
    const result = await this.getList({
      page,
      perPage: effectivePerPage,
      sort: sortString,
      filter: filterWithBranch,
    });

    // Transform the data to include full datetime values
    if (result.data) {
      result.data = result.data.map((record: any) => this.transformRecord(record));
    }

    return result;
  }

  // Transform a record to include full datetime values for checkIn/checkOut
  private transformRecord(record: any) {
    const transformed = { ...record };
    
    if (record.date) {
      // Convert date string and time strings to full datetime
      if (record.checkIn) {
        transformed.checkIn = this.combineDateTime(record.date, record.checkIn);
      }
      if (record.checkOut) {
        transformed.checkOut = this.combineDateTime(record.date, record.checkOut);
      }
    }
    
    return transformed;
  }

  // Combine date (YYYY-MM-DD) and time (HH:MM) into ISO datetime
  private combineDateTime(dateStr: string, timeStr: string): string {
    return `${dateStr}T${timeStr}:00.000Z`;
=======
    return this.getList({
      page,
      perPage: pageSize,
      sort: sortString,
      filter: filterWithBranch,
    });
>>>>>>> origin/main
  }

  // Get single teacher attendance record with branch isolation
  async findOne(id: string, branchId: string) {
    const record = await (this.prisma as any).teacherAttendance.findFirst({
      where: { id, branchId }
    });
    
    if (!record) {
      throw new NotFoundException('Teacher attendance record not found');
    }
    
<<<<<<< HEAD
    // Transform the record to include full datetime values
    return this.transformRecord(record);
=======
    return record;
>>>>>>> origin/main
  }

  // Create teacher attendance record
  async create(data: any) {
<<<<<<< HEAD
    return super.create(data);
  }

  // Update teacher attendance record with branch isolation
  async update(id: string, data: any) {
    // Get branchId from data or scope
    const branchId = data.branchId || PrismaService.getScope().branchId;
    
=======
    const result = await super.create(data);
    return result.data;
  }

  // Update teacher attendance record with branch isolation
  async update(id: string, data: any, branchId: string) {
>>>>>>> origin/main
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
    
<<<<<<< HEAD
    return { data: updated };
=======
    return updated;
>>>>>>> origin/main
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