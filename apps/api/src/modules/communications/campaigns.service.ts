import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Campaign, Prisma } from '@prisma/client';
import { BaseCrudService } from '../../common/base-crud.service';
import { MessagesService } from './messages.service';

@Injectable()
export class CampaignsService extends BaseCrudService<Campaign> {
  constructor(
    prisma: PrismaService,
    private messagesService: MessagesService,
  ) {
    super(prisma, 'campaign');
  }

  protected supportsBranchScoping(): boolean {
    return true;
  }

  protected buildSearchClause(search: string): any[] {
<<<<<<< HEAD
    // PostgreSQL supports case insensitive search with ilike
=======
    // SQLite doesn't support mode: 'insensitive' for contains
>>>>>>> origin/main
    return [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Override create to add branchId
  async create(data: any): Promise<{ data: Campaign }> {
    const { branchId } = PrismaService.getScope();
    const createData = {
      ...data,
      branchId: branchId || null,
    };
    
    try {
      const created = await this.prisma.campaign.create({
        data: createData,
        include: {
          template: true,
        },
      });
      return { data: created };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A campaign with this name already exists');
      }
      throw error;
    }
  }

  // Override getOne to respect branch scoping
  async getOne(id: string): Promise<{ data: Campaign }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    const data = await this.prisma.campaign.findUnique({
      where,
      include: {
        template: true,
        messages: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!data) {
      throw new NotFoundException(`Campaign not found`);
    }
    
    return { data };
  }

  // Override getOneWithIncludes for include support
  async getOneWithIncludes(id: string, include?: string): Promise<{ data: Campaign }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    const includeOptions: any = {};
    
    if (include) {
      const includes = include.split(',');
      includes.forEach(inc => {
        if (inc === 'template') {
          includeOptions.template = true;
        }
        if (inc === 'messages') {
          includeOptions.messages = {
            take: 10,
            orderBy: { createdAt: 'desc' },
          };
        }
      });
    }

    const data = await this.prisma.campaign.findUnique({
      where,
      include: includeOptions,
    });
    
    if (!data) {
      throw new NotFoundException(`Campaign not found`);
    }
    
    return { data };
  }

  // Override update to respect branch scoping
  async update(id: string, data: any): Promise<{ data: Campaign }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    try {
      const updated = await this.prisma.campaign.update({
        where,
        data,
        include: {
          template: true,
        },
      });
      return { data: updated };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Campaign not found');
      }
      throw error;
    }
  }

  // Override delete to respect branch scoping
  async delete(id: string): Promise<{ data: Campaign }> {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId && this.supportsBranchScoping()) {
      where.branchId = branchId;
    }
    
    try {
      const deleted = await this.prisma.campaign.delete({
        where,
      });
      return { data: deleted };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Campaign not found');
      }
      throw error;
    }
  }

  // Custom campaign methods

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
          include: { 
            guardians: {
              include: {
                guardian: true
              }
            }
          },
        });
        
        for (const student of students) {
          // Get primary guardian's contact
          const studentGuardian = student.guardians[0];
          if (studentGuardian?.guardian?.email) {
            recipients.push({
              contact: studentGuardian.guardian.email,
              variables: {
                studentName: `${student.firstName} ${student.lastName}`,
                guardianName: studentGuardian.guardian.name,
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
              include: { 
                guardians: {
                  include: {
                    guardian: true
                  }
                }
              },
            },
          },
        });

        for (const enrollment of enrollments) {
          const studentGuardian = enrollment.student.guardians[0];
          if (studentGuardian?.guardian?.email) {
            recipients.push({
              contact: studentGuardian.guardian.email,
              variables: {
                studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
                guardianName: studentGuardian.guardian.name,
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