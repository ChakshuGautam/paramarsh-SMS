import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Ticket, TicketMessage, TicketAttachment, Prisma } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    ownerType: string;
    ownerId: string;
    category?: string;
    priority?: string;
    subject: string;
    description: string;
  }): Promise<Ticket> {
    // Calculate SLA due date based on priority
    const slaDueAt = this.calculateSlaDueDate(data.priority || 'normal');

    const { branchId } = PrismaService.getScope();
    return this.prisma.ticket.create({
      data: {
        branchId: branchId ?? undefined,
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        category: data.category,
        priority: data.priority || 'normal',
        subject: data.subject,
        description: data.description,
        status: 'open',
        slaDueAt,
      },
      include: {
        messages: true,
        attachments: true,
      },
    });
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

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.TicketWhereInput;
    orderBy?: Prisma.TicketOrderByWithRelationInput;
  }): Promise<Ticket[]> {
    const { skip, take, where, orderBy } = params || {};
    const { branchId } = PrismaService.getScope();
    const finalWhere = {
      ...where,
      ...(branchId ? { branchId } : {}),
    };
    return this.prisma.ticket.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            messages: true,
            attachments: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Ticket | null> {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.TicketUpdateInput,
  ): Promise<Ticket> {
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

    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        attachments: true,
      },
    });
  }

  async remove(id: string): Promise<Ticket> {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }

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

  async assign(ticketId: string, assigneeId: string): Promise<Ticket> {
    return this.update(ticketId, {
      assigneeId,
      status: 'in_progress',
    });
  }

  async getMyTickets(
    ownerType: string,
    ownerId: string,
  ): Promise<Ticket[]> {
    return this.findAll({
      where: {
        ownerType,
        ownerId,
      },
    });
  }

  async getAssignedTickets(assigneeId: string): Promise<Ticket[]> {
    return this.findAll({
      where: {
        assigneeId,
        status: {
          notIn: ['closed'],
        },
      },
    });
  }

  async getOverdueTickets(): Promise<Ticket[]> {
    return this.findAll({
      where: {
        slaDueAt: {
          lt: new Date(),
        },
        status: {
          notIn: ['resolved', 'closed'],
        },
      },
      orderBy: {
        slaDueAt: 'asc',
      },
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