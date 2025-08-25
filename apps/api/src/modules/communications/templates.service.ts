import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Template, Prisma } from '@prisma/client';
import { BaseCrudService } from '../../common/base-crud.service';

@Injectable()
export class TemplatesService extends BaseCrudService<Template> {
  constructor(prisma: PrismaService) {
    super(prisma, 'template');
  }

  protected supportsBranchScoping(): boolean {
    return true;
  }

  protected buildSearchClause(search: string): any[] {
    // PostgreSQL supports case insensitive search with ilike
    return [
      { name: { contains: search } },
      { content: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Override create to add branchId
  async create(data: any): Promise<{ data: Template }> {
    const { branchId } = PrismaService.getScope();
    const createData = {
      ...data,
      branchId: branchId || null,
    };
    
    try {
      const created = await this.prisma.template.create({
        data: createData,
      });
      return { data: created };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A template with this name already exists');
      }
      throw error;
    }
  }

  // Override getOne to respect branch scoping
  async getOne(id: string): Promise<{ data: Template }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    const data = await this.prisma.template.findUnique({
      where,
    });
    
    if (!data) {
      throw new NotFoundException(`Template not found`);
    }
    
    return { data };
  }

  // Override update to respect branch scoping
  async update(id: string, data: any): Promise<{ data: Template }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    try {
      const updated = await this.prisma.template.update({
        where,
        data,
      });
      return { data: updated };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Template not found');
      }
      throw error;
    }
  }

  // Override delete to respect branch scoping
  async delete(id: string): Promise<{ data: Template }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    try {
      const deleted = await this.prisma.template.delete({
        where,
      });
      return { data: deleted };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Template not found');
      }
      throw error;
    }
  }

  // Custom methods for template-specific functionality

  async getOneWithIncludes(id: string, include?: string): Promise<{ data: Template }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    const includeOptions: any = {};
    
    if (include) {
      const includes = include.split(',');
      includes.forEach(inc => {
        if (inc === 'campaigns') {
          includeOptions.campaigns = true;
        }
      });
    }

    const data = await this.prisma.template.findUnique({
      where,
      include: includeOptions,
    });
    
    if (!data) {
      throw new NotFoundException(`Template not found`);
    }
    
    return { data };
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