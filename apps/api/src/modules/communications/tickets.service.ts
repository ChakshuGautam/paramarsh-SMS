import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Ticket, TicketMessage, TicketAttachment, Prisma } from '@prisma/client';
import { BaseCrudService } from '../../common/base-crud.service';

@Injectable()
export class TicketsService extends BaseCrudService<Ticket> {
  constructor(prisma: PrismaService) {
    super(prisma, 'ticket');
  }

  protected supportsBranchScoping(): boolean {
    return true;
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { subject: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Override create to handle ticket-specific logic
  async create(data: any) {
    // Calculate SLA due date based on priority
    const slaDueAt = this.calculateSlaDueDate(data.priority || 'normal');

    const { branchId } = PrismaService.getScope();
    const ticketData = {
      branchId: branchId ?? undefined,
      ownerType: data.ownerType,
      ownerId: data.ownerId,
      category: data.category,
      priority: data.priority || 'normal',
      subject: data.subject,
      description: data.description,
      status: 'open',
      slaDueAt,
    };
    
    const created = await this.prisma.ticket.create({
      data: ticketData,
      include: {
        messages: true,
        attachments: true,
      },
    });
    
    return { data: created };
  }

  private calculateSlaDueDate(priority: string): Date {
    const now = new Date();
    const hoursToAdd = {
      urgent: 4,
      high: 8,
      normal: 24,
      low: 48,
    }[priority] || 24;

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  // Custom ticket-specific methods will be added here if needed

  // Override getOne to respect branch scoping
  async getOne(id: string): Promise<{ data: Ticket }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    const data = await this.prisma.ticket.findUnique({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        attachments: true,
      },
    });
    
    if (!data) {
      throw new NotFoundException(`Ticket not found`);
    }
    
    return { data };
  }

  // Override update to handle ticket status transitions and branch scoping
  async update(
    id: string,
    data: any,
  ) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    // Handle status transitions
    const updateData: any = { ...data };
    
    if (data.status === 'resolved' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    } else if (data.status === 'closed' && !updateData.closedAt) {
      updateData.closedAt = new Date();
      if (!updateData.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }

    try {
      const updated = await this.prisma.ticket.update({
        where,
        data: updateData,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          attachments: true,
        },
      });

      return { data: updated };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Ticket not found');
      }
      throw error;
    }
  }

  // Override delete to respect branch scoping
  async delete(id: string): Promise<{ data: Ticket }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    try {
      const deleted = await this.prisma.ticket.delete({
        where,
      });
      return { data: deleted };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Ticket not found');
      }
      throw error;
    }
  }

  // Let BaseCrudService handle delete method

  async addMessage(
    ticketId: string,
    data: {
      authorId: string;
      authorType: string;
      content: string;
      internal?: boolean;
    },
  ): Promise<TicketMessage> {
    // Update ticket status if needed
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (ticket && ticket.status === 'open' && data.authorType === 'staff') {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'in_progress' },
      });
    }

    return this.prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId: data.authorId,
        authorType: data.authorType,
        content: data.content,
        internal: data.internal || false,
      },
    });
  }

  async addAttachment(
    ticketId: string,
    data: {
      fileName: string;
      fileUrl: string;
      fileSize?: number;
      mimeType?: string;
    },
  ): Promise<TicketAttachment> {
    return this.prisma.ticketAttachment.create({
      data: {
        ticketId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      },
    });
  }

  async assign(ticketId: string, assigneeId: string) {
    return this.update(ticketId, {
      assigneeId,
      status: 'in_progress',
    });
  }

  async getMyTickets(
    ownerType: string,
    ownerId: string,
  ) {
    return this.getList({
      filter: {
        ownerType,
        ownerId,
      },
    });
  }

  async getAssignedTickets(assigneeId: string) {
    return this.getList({
      filter: {
        assigneeId,
        status_in: ['open', 'in_progress', 'resolved'],
      },
    });
  }

  async getOverdueTickets() {
    return this.getList({
      filter: {
        slaDueAt_lt: new Date(),
        status_in: ['open', 'in_progress'],
      },
      sort: 'slaDueAt',
    });
  }

  async getStats(): Promise<any> {
    const { branchId } = PrismaService.getScope();
    const baseWhere = branchId ? { branchId } : {};
    const [statusStats, priorityStats, categoryStats] = await Promise.all([
      this.prisma.ticket.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: true,
      }),
      this.prisma.ticket.groupBy({
        by: ['priority'],
        where: {
          ...baseWhere,
          status: {
            notIn: ['closed'],
          },
        },
        _count: true,
      }),
      this.prisma.ticket.groupBy({
        by: ['category'],
        where: baseWhere,
        _count: true,
      }),
    ]);

    const avgResolutionTime = await this.prisma.$queryRaw<
      Array<{ avgHours: number | null }>
    >`
      SELECT AVG(JULIANDAY(resolvedAt) - JULIANDAY(createdAt)) * 24 as avgHours
      FROM Ticket
      WHERE resolvedAt IS NOT NULL
    `;

    return {
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: priorityStats.reduce((acc, stat) => {
        acc[stat.priority] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: categoryStats.reduce((acc, stat) => {
        acc[stat.category || 'uncategorized'] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      avgResolutionHours: avgResolutionTime[0]?.avgHours || 0,
    };
  }
}