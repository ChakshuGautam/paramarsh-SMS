import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '../../common/base-crud.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mapDbToSchoolResponse, mapSchoolToDbParams } from '../../common/school-alias.helper';

@Injectable()
export class StudentsService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'student');
  }

  /**
   * Override to add school aliasing
   */
  async getList(params: any) {
    const result = await super.getList(params);
    return {
      data: result.data.map(mapDbToSchoolResponse),
      total: result.total,
    };
  }

  /**
   * Override to add school aliasing
   */
  async getOne(id: string) {
    const result = await super.getOne(id);
    return {
      data: mapDbToSchoolResponse(result.data),
    };
  }

  /**
   * Override to add school aliasing
   */
  async getMany(ids: string[]) {
    const result = await super.getMany(ids);
    return {
      data: result.data.map(mapDbToSchoolResponse),
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

  /**
   * Students support branch scoping
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }
}