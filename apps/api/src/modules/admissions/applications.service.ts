import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base-crud.service';
import { Application } from '@prisma/client';

@Injectable()
export class ApplicationsService extends BaseCrudService<Application> {
<<<<<<< HEAD
  constructor(protected readonly prisma: PrismaService) {
=======
  constructor(private prisma: PrismaService) {
>>>>>>> origin/main
    super(prisma, 'application');
  }

  protected supportsBranchScoping(): boolean {
    return true;
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { applicationNo: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { guardianName: { contains: search } },
      { guardianEmail: { contains: search } },
      { guardianPhone: { contains: search } },
      { classAppliedFor: { contains: search } },
      { previousSchool: { contains: search } },
    ];
  }

  /**
   * Find all applications with branch scoping
   */
<<<<<<< HEAD
  async findAll(params: { page?: number; pageSize?: number; sort?: string; filter?: any; q?: string; branchId: string }) {
    const { page = 1, pageSize = 25, sort, filter = {}, q, branchId } = params;
=======
  async findAll(params: { page?: number; pageSize?: number; sort?: string; filter?: any; branchId: string }) {
    const { page = 1, pageSize = 25, sort, filter = {}, branchId } = params;
>>>>>>> origin/main
    const skip = (page - 1) * pageSize;

    const where = {
      ...filter,
      branchId
    };

<<<<<<< HEAD
    // Handle search query 'q'
    if (q && typeof q === 'string') {
      where.OR = this.buildSearchClause(q);
    }

=======
>>>>>>> origin/main
    const orderBy = this.buildOrderBy(sort);

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find one application by ID with branch scoping
   */
  async findOne(id: string, branchId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, branchId }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  /**
   * Create application with branch scoping
   */
  async create(data: any) {
    try {
      // Auto-generate application number if not provided
      if (!data.applicationNo) {
        data.applicationNo = await this.generateApplicationNo();
      }

      // Set reviewedAt when status changes to APPROVED, REJECTED, or WAITLISTED
      if (data.status && ['APPROVED', 'REJECTED', 'WAITLISTED'].includes(data.status)) {
        data.reviewedAt = new Date();
      }

<<<<<<< HEAD
      const created = await this.prisma.application.create({ data });
      return { data: created };
=======
      return this.prisma.application.create({ data });
>>>>>>> origin/main
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        throw new ConflictException('Application number already exists');
      }
      throw error;
    }
  }

  /**
   * Update application with branch scoping and review handling
   */
<<<<<<< HEAD
  async update(id: string, data: any) {
    // Get branchId from the data or scope
    const branchId = data.branchId || PrismaService.getScope().branchId;
    
=======
  async update(id: string, data: any, branchId: string) {
>>>>>>> origin/main
    // Check if application exists in this branch
    const existing = await this.prisma.application.findFirst({
      where: { id, branchId }
    });

    if (!existing) {
      throw new NotFoundException('Application not found');
    }

    // Set reviewedAt when status changes to APPROVED, REJECTED, or WAITLISTED
    if (data.status && ['APPROVED', 'REJECTED', 'WAITLISTED'].includes(data.status)) {
      if (existing.status !== data.status || !existing.reviewedAt) {
        data.reviewedAt = new Date();
      }
    }

<<<<<<< HEAD
    const updated = await this.prisma.application.update({
      where: { id },
      data
    });
    
    return { data: updated };
=======
    return this.prisma.application.update({
      where: { id },
      data
    });
>>>>>>> origin/main
  }

  /**
   * Remove application with branch scoping
   */
  async remove(id: string, branchId: string) {
    // Check if application exists in this branch
    const existing = await this.prisma.application.findFirst({
      where: { id, branchId }
    });

    if (!existing) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.application.delete({
      where: { id }
    });
  }

  /**
   * Get many applications by IDs with branch scoping
   */
<<<<<<< HEAD
  async getMany(ids: string[]) {
    // Get branchId from scope
    const branchId = PrismaService.getScope().branchId;
    
    const data = await this.prisma.application.findMany({
      where: {
        id: { in: ids },
        ...(branchId && { branchId })
=======
  async getMany(ids: string[], branchId: string) {
    const data = await this.prisma.application.findMany({
      where: {
        id: { in: ids },
        branchId
>>>>>>> origin/main
      }
    });

    return { data };
  }

<<<<<<< HEAD
  protected buildOrderBy(sort?: string): any {
=======
  private buildOrderBy(sort?: string): any {
>>>>>>> origin/main
    if (!sort) {
      return { submittedAt: 'desc' };
    }

    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.slice(1) : sort;
    return { [field]: isDesc ? 'desc' : 'asc' };
  }

  /**
   * Generate unique application number
   */
  async generateApplicationNo(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `APP${currentYear}`;
    
    // Find the latest application number for the current year
    const latestApplication = await this.prisma.application.findFirst({
      where: {
        applicationNo: { startsWith: prefix }
      },
      orderBy: { applicationNo: 'desc' }
    });

    let nextNumber = 1;
    if (latestApplication) {
      const currentNumber = parseInt(latestApplication.applicationNo.replace(prefix, ''));
      nextNumber = currentNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Create application with auto-generated application number if not provided
   */
  async createWithGeneratedNo(data: any) {
    try {
      if (!data.applicationNo) {
        data.applicationNo = await this.generateApplicationNo();
      }

      // Set reviewedAt when status changes to APPROVED, REJECTED, or WAITLISTED
      if (data.status && ['APPROVED', 'REJECTED', 'WAITLISTED'].includes(data.status)) {
        data.reviewedAt = new Date();
      }

      return this.prisma.application.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        throw new ConflictException('Application number already exists');
      }
      throw error;
    }
  }

  /**
   * Update application with reviewedAt timestamp handling
   */
  async updateWithReview(id: string, data: any) {
    // Set reviewedAt when status changes to APPROVED, REJECTED, or WAITLISTED
    if (data.status && ['APPROVED', 'REJECTED', 'WAITLISTED'].includes(data.status)) {
      // Only set reviewedAt if not already set or if status is changing
      const existing = await this.prisma.application.findUnique({
        where: { id },
        select: { status: true, reviewedAt: true }
      });

      if (existing && (existing.status !== data.status || !existing.reviewedAt)) {
        data.reviewedAt = new Date();
      }
    }

<<<<<<< HEAD
    return super.update(id, data);
=======
    return this.update(id, data);
>>>>>>> origin/main
  }
}