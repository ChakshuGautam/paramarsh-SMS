import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseCrudService } from '../../common/base-crud.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mapDbToSchoolResponse, mapSchoolToDbParams } from '../../common/school-alias.helper';

@Injectable()
export class StudentsService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'student');
  }

  /**
   * Student model now has branchId field for multi-school support
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }

  /**
   * Override to add school aliasing and fix branchId issue
   */
  async getList(params: any) {
    // Try completely bypassing parent and doing it directly
    try {
      const page = Math.max(1, Number(params.page ?? 1));
      const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? 25)));
      const skip = (page - 1) * perPage;

      // Build simple where clause
      const where: any = {};
      if (params.filter?.status) {
        where.status = params.filter.status;
      }

      console.log('Direct student query - where:', JSON.stringify(where, null, 2));

      const [data, total] = await Promise.all([
        this.prisma.student.findMany({ 
          where, 
          skip, 
          take: perPage,
          include: {
            guardians: {
              include: {
                guardian: true
              }
            }
          }
        }),
        this.prisma.student.count({ where }),
      ]);

      return {
        data: data.map(mapDbToSchoolResponse),
        total,
      };
    } catch (error) {
      console.error('Error in student getList:', error);
      throw error;
    }
  }

  /**
   * Override to add school aliasing and include guardians
   */
  async getOne(id: string) {
    const data = await (this.prisma as any)[this.modelName].findUnique({
      where: { id },
      include: {
        guardians: {
          include: {
            guardian: true
          }
        }
      }
    });

    if (!data) {
      throw new NotFoundException(`${this.modelName} not found`);
    }

    return {
      data: mapDbToSchoolResponse(data),
    };
  }

  /**
   * Override to add school aliasing and include guardians
   */
  async getMany(ids: string[]) {
    const data = await (this.prisma as any)[this.modelName].findMany({
      where: { id: { in: ids } },
      include: {
        guardians: {
          include: {
            guardian: true
          }
        }
      }
    });

    return {
      data: data.map(mapDbToSchoolResponse),
    };
  }

  /**
   * Override to handle school aliasing
   */
  async create(data: any) {
    const dbData = mapSchoolToDbParams(data);
    const result = await super.create(dbData);
    return {
      data: mapDbToSchoolResponse(result.data),
    };
  }

  /**
   * Override to handle school aliasing
   */
  async update(id: string, data: any) {
    const dbData = mapSchoolToDbParams(data);
    const result = await super.update(id, dbData);
    return {
      data: mapDbToSchoolResponse(result.data),
    };
  }

  /**
   * Override to add school aliasing
   */
  async delete(id: string) {
    const result = await super.delete(id);
    return {
      data: mapDbToSchoolResponse(result.data),
    };
  }

  /**
   * Override to support search
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { admissionNo: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

}