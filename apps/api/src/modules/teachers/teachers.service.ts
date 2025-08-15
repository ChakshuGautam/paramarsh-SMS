import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '../../common/base-crud.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeachersService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'teacher');
  }

  /**
   * Override getList to include staff relation
   */
  async getList(params: any) {
    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? 25)));
    const skip = (page - 1) * perPage;

    const where = this.buildWhereClause(params.filter);
    const orderBy = this.buildOrderBy(params.sort);

    const [data, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          staff: true,
        },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Override getOne to include staff relation
   */
  async getOne(id: string) {
    const data = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        staff: true,
      },
    });

    if (!data) {
      throw new Error('Teacher not found');
    }

    return { data };
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
}