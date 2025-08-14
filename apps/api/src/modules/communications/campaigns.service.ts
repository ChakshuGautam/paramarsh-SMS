import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Campaign, Prisma } from '@prisma/client';
import { MessagesService } from './messages.service';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private messagesService: MessagesService,
  ) {}

  async create(data: Prisma.CampaignCreateInput): Promise<Campaign> {
    const { branchId } = PrismaService.getScope();
    return this.prisma.campaign.create({
      data: {
        ...data,
        branchId: branchId ?? undefined,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.CampaignWhereInput;
    orderBy?: Prisma.CampaignOrderByWithRelationInput;
  }): Promise<Campaign[]> {
    const { skip, take, where, orderBy } = params || {};
    const { branchId } = PrismaService.getScope();
    const finalWhere = {
      ...where,
      ...(branchId ? { branchId } : {}),
    };
    return this.prisma.campaign.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy,
      include: {
        template: true,
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async findOne(id: string): Promise<Campaign | null> {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        messages: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Campaign> {
    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  async execute(campaignId: string): Promise<{ messageCount: number }> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { template: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (!campaign.template) {
      throw new Error('Campaign has no template');
    }

    // Parse audience query to get recipients
    const recipients = await this.getRecipients(campaign.audienceQuery);

    // Create messages for each recipient
    const messages = [];
    for (const recipient of recipients) {
      const message = await this.messagesService.create({
        channel: campaign.template.channel,
        to: recipient.contact,
        templateId: campaign.templateId || undefined,
        campaignId: campaign.id,
        payload: recipient.variables,
      });
      messages.push(message);
    }

    // Update campaign status
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'active' },
    });

    // Send messages asynchronously
    for (const message of messages) {
      this.messagesService.sendMessage(message.id).catch(console.error);
    }

    return { messageCount: messages.length };
  }

  private async getRecipients(
    audienceQuery: string | null,
  ): Promise<Array<{ contact: string; variables: any }>> {
    if (!audienceQuery) {
      return [];
    }

    try {
      const query = JSON.parse(audienceQuery);
      
      // Example audience queries:
      // { "type": "all_students" }
      // { "type": "class", "classId": "xxx" }
      // { "type": "guardians", "studentIds": ["xxx", "yyy"] }
      
      const recipients: Array<{ contact: string; variables: any }> = [];

      if (query.type === 'all_students') {
        const { branchId } = PrismaService.getScope();
        const where: any = {};
        if (branchId) where.branchId = branchId;
        const students = await this.prisma.student.findMany({
          where,
          include: { guardians: true },
        });
        
        for (const student of students) {
          // Get primary guardian's contact
          const guardian = student.guardians[0];
          if (guardian?.email) {
            recipients.push({
              contact: guardian.email,
              variables: {
                studentName: `${student.firstName} ${student.lastName}`,
                guardianName: guardian.name,
              },
            });
          }
        }
      } else if (query.type === 'class' && query.classId) {
        const enrollments = await this.prisma.enrollment.findMany({
          where: {
            section: {
              classId: query.classId,
            },
          },
          include: {
            student: {
              include: { guardians: true },
            },
          },
        });

        for (const enrollment of enrollments) {
          const guardian = enrollment.student.guardians[0];
          if (guardian?.email) {
            recipients.push({
              contact: guardian.email,
              variables: {
                studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
                guardianName: guardian.name,
              },
            });
          }
        }
      } else if (query.type === 'staff') {
        const { branchId } = PrismaService.getScope();
        const where: any = { status: 'active' };
        if (branchId) where.branchId = branchId;
        const staff = await this.prisma.staff.findMany({
          where,
        });

        for (const member of staff) {
          if (member.email) {
            recipients.push({
              contact: member.email,
              variables: {
                staffName: `${member.firstName} ${member.lastName}`,
                designation: member.designation,
              },
            });
          }
        }
      }

      return recipients;
    } catch (error) {
      console.error('Error parsing audience query:', error);
      return [];
    }
  }

  async getStats(campaignId: string): Promise<any> {
    const stats = await this.prisma.message.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: true,
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);
  }
}