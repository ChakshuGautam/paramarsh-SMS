import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Preference, Prisma } from '@prisma/client';

@Injectable()
export class PreferencesService {
  constructor(private prisma: PrismaService) {}

  async upsert(data: {
    ownerType: string;
    ownerId: string;
    channel: string;
    consent?: boolean;
    quietHours?: any;
  }): Promise<Preference> {
    const { branchId } = PrismaService.getScope();
    return this.prisma.preference.upsert({
      where: {
        ownerType_ownerId_channel: {
          ownerType: data.ownerType,
          ownerId: data.ownerId,
          channel: data.channel,
        },
      },
      update: {
        consent: data.consent,
        quietHours: data.quietHours
          ? JSON.stringify(data.quietHours)
          : undefined,
      },
      create: {
        branchId: branchId ?? undefined,
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        channel: data.channel,
        consent: data.consent ?? true,
        quietHours: data.quietHours ? JSON.stringify(data.quietHours) : null,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.PreferenceWhereInput;
    orderBy?: Prisma.PreferenceOrderByWithRelationInput;
  }): Promise<Preference[]> {
    const { skip, take, where, orderBy } = params || {};
    const { branchId } = PrismaService.getScope();
    const finalWhere = {
      ...where,
      ...(branchId ? { branchId } : {}),
    };
    return this.prisma.preference.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy,
    });
  }

  async findByOwner(
    ownerType: string,
    ownerId: string,
  ): Promise<Preference[]> {
    const { branchId } = PrismaService.getScope();
    const where: any = {
      ownerType,
      ownerId,
    };
    if (branchId) where.branchId = branchId;
    return this.prisma.preference.findMany({
      where,
    });
  }

  async checkConsent(
    ownerType: string,
    ownerId: string,
    channel: string,
  ): Promise<boolean> {
    const preference = await this.prisma.preference.findUnique({
      where: {
        ownerType_ownerId_channel: {
          ownerType,
          ownerId,
          channel,
        },
      },
    });

    // Default to true if no preference exists
    return preference?.consent ?? true;
  }

  async isInQuietHours(
    ownerType: string,
    ownerId: string,
    channel: string,
  ): Promise<boolean> {
    const preference = await this.prisma.preference.findUnique({
      where: {
        ownerType_ownerId_channel: {
          ownerType,
          ownerId,
          channel,
        },
      },
    });

    if (!preference?.quietHours) {
      return false;
    }

    try {
      const quietHours = JSON.parse(preference.quietHours);
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const startTime =
        parseInt(quietHours.startHour) * 60 + parseInt(quietHours.startMinute || 0);
      const endTime =
        parseInt(quietHours.endHour) * 60 + parseInt(quietHours.endMinute || 0);

      if (startTime <= endTime) {
        return currentTime >= startTime && currentTime <= endTime;
      } else {
        // Quiet hours span midnight
        return currentTime >= startTime || currentTime <= endTime;
      }
    } catch (error) {
      console.error('Error parsing quiet hours:', error);
      return false;
    }
  }

  async remove(
    ownerType: string,
    ownerId: string,
    channel: string,
  ): Promise<Preference> {
    return this.prisma.preference.delete({
      where: {
        ownerType_ownerId_channel: {
          ownerType,
          ownerId,
          channel,
        },
      },
    });
  }

  async bulkUpdateConsent(
    ownerType: string,
    ownerId: string,
    consents: Array<{ channel: string; consent: boolean }>,
  ): Promise<Preference[]> {
    const results = [];
    for (const { channel, consent } of consents) {
      const preference = await this.upsert({
        ownerType,
        ownerId,
        channel,
        consent,
      });
      results.push(preference);
    }
    return results;
  }
}