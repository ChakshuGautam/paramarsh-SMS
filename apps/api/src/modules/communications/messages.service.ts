<<<<<<< HEAD
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Message, Prisma, Template } from '@prisma/client';
import { TemplatesService } from './templates.service';
import { BaseCrudService } from '../../common/base-crud.service';

@Injectable()
export class MessagesService extends BaseCrudService<Message> {
  constructor(
    prisma: PrismaService,
    private templatesService: TemplatesService,
  ) {
    super(prisma, 'message');
  }

  protected supportsBranchScoping(): boolean {
    return true;
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { to: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { channel: { contains: search, mode: 'insensitive' } },
    ];
  }

  async create(data: any): Promise<{ data: Message }> {
=======
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Message, Prisma, Template } from '@prisma/client';
import { TemplatesService } from './templates.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private templatesService: TemplatesService,
  ) {}

  async create(data: {
    channel: string;
    to: string;
    templateId?: string;
    campaignId?: string;
    payload?: any;
  }): Promise<Message> {
>>>>>>> origin/main
    let renderedContent: string | undefined;

    if (data.templateId && data.payload) {
      const template = await this.prisma.template.findUnique({
        where: { id: data.templateId },
      });
      if (template) {
        renderedContent = await this.templatesService.renderTemplate(
          template,
          data.payload,
        );
      }
    }

    const { branchId } = PrismaService.getScope();
<<<<<<< HEAD
    const created = await this.prisma.message.create({
=======
    return this.prisma.message.create({
>>>>>>> origin/main
      data: {
        branchId: branchId ?? undefined,
        channel: data.channel,
        to: data.to,
        templateId: data.templateId,
        campaignId: data.campaignId,
        payload: data.payload ? JSON.stringify(data.payload) : null,
        status: 'pending',
      },
<<<<<<< HEAD
      include: {
        template: true,
        campaign: true,
      },
    });
    
    return { data: created };
=======
    });
>>>>>>> origin/main
  }

  async sendMessage(messageId: string): Promise<Message> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { template: true },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    try {
      // Here you would integrate with actual messaging providers
      // For now, we'll simulate sending
      const result = await this.simulateSend(message);

      return this.prisma.message.update({
        where: { id: messageId },
        data: {
          status: result.success ? 'sent' : 'failed',
          providerId: result.providerId,
          error: result.error,
          sentAt: result.success ? new Date() : null,
        },
      });
    } catch (error) {
      return this.prisma.message.update({
        where: { id: messageId },
        data: {
          status: 'failed',
          error: error.message,
        },
      });
    }
  }

  private async simulateSend(message: Message & { template?: Template | null }) {
    // Simulate sending with different channels
    const success = Math.random() > 0.1; // 90% success rate
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay

    return {
      success,
      providerId: success ? `provider-${Date.now()}` : null,
      error: success ? null : 'Simulated send failure',
    };
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.MessageWhereInput;
    orderBy?: Prisma.MessageOrderByWithRelationInput;
  }): Promise<Message[]> {
    const { skip, take, where, orderBy } = params || {};
    const { branchId } = PrismaService.getScope();
    const finalWhere = {
      ...where,
      ...(branchId ? { branchId } : {}),
    };
    return this.prisma.message.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy,
      include: {
        template: true,
        campaign: true,
      },
    });
  }

<<<<<<< HEAD
  async getOne(id: string): Promise<{ data: Message }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    const data = await this.prisma.message.findUnique({
      where,
=======
  async findOne(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: { id },
>>>>>>> origin/main
      include: {
        template: true,
        campaign: true,
      },
    });
<<<<<<< HEAD
    
    if (!data) {
      throw new NotFoundException('Message not found');
    }
    
    return { data };
  }

  async findOne(id: string): Promise<Message | null> {
    const result = await this.getOne(id);
    return result.data;
=======
>>>>>>> origin/main
  }

  async updateStatus(
    id: string,
    status: string,
    providerId?: string,
    error?: string,
  ): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data: {
        status,
        providerId,
        error,
        sentAt: status === 'delivered' ? new Date() : undefined,
      },
    });
  }

  async retryFailed(): Promise<number> {
    const { branchId } = PrismaService.getScope();
    const where: any = {
      status: 'failed',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    };
    if (branchId) where.branchId = branchId;
    const failedMessages = await this.prisma.message.findMany({
      where,
      take: 100,
    });

    let retryCount = 0;
    for (const message of failedMessages) {
      await this.sendMessage(message.id);
      retryCount++;
    }

    return retryCount;
  }
}