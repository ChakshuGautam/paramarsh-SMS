import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Template, Prisma } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TemplateCreateInput): Promise<Template> {
    const { branchId } = PrismaService.getScope();
    return this.prisma.template.create({
      data: {
        ...data,
        branchId: branchId ?? undefined,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput;
  }): Promise<Template[]> {
    const { skip, take, where, orderBy } = params || {};
    const { branchId } = PrismaService.getScope();
    const finalWhere = {
      ...where,
      ...(branchId ? { branchId } : {}),
    };
    return this.prisma.template.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy,
    });
  }

  async findOne(id: string): Promise<Template | null> {
    return this.prisma.template.findUnique({
      where: { id },
      include: {
        campaigns: true,
        messages: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.TemplateUpdateInput,
  ): Promise<Template> {
    return this.prisma.template.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Template> {
    return this.prisma.template.delete({
      where: { id },
    });
  }

  async renderTemplate(
    template: Template,
    variables: Record<string, any>,
  ): Promise<string> {
    let content = template.content;
    const templateVars = template.variables
      ? JSON.parse(template.variables)
      : [];

    for (const varName of templateVars) {
      const regex = new RegExp(`{{\\s*${varName}\\s*}}`, 'g');
      content = content.replace(regex, variables[varName] || '');
    }

    return content;
  }
}