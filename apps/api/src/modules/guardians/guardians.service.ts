import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type GuardianCreateInput = {
  name: string;
  email?: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  address?: string;
  occupation?: string;
  students?: Array<{
    studentId: string;
    relation: string;
    isPrimary?: boolean;
    canPickup?: boolean;
    emergencyContact?: boolean;
  }>;
};

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { 
    page?: number; 
    pageSize?: number; 
    sort?: string; 
    q?: string;
    relation?: string;
    phone?: string;
    email?: string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    // Add branchId filtering from request scope
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    
    // Text search
    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { email: { contains: params.q, mode: 'insensitive' } },
        { phoneNumber: { contains: params.q, mode: 'insensitive' } },
      ];
    }
    
    // Filter by relation type (through StudentGuardian)
    if (params.relation) {
      where.students = {
        some: {
          relation: params.relation
        }
      };
    }
    
    // Filter by phone
    if (params.phone) {
      where.OR = [
        { phoneNumber: { contains: params.phone } },
        { alternatePhoneNumber: { contains: params.phone } },
      ];
    }
    
    // Filter by email
    if (params.email) {
      where.email = { contains: params.email, mode: 'insensitive' };
    }

    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ name: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.guardian.findMany({ 
        where, 
        skip, 
        take: pageSize, 
        orderBy,
        include: {
          students: {
            include: {
              student: true
            }
          }
        }
      }),
      this.prisma.guardian.count({ where }),
    ]);
    
    // Transform the data for backward compatibility
    const transformedData = data.map(guardian => ({
      ...guardian,
      // Legacy fields for compatibility
      phone: guardian.phoneNumber,
      // Include first student relationship for backward compatibility
      studentId: guardian.students[0]?.studentId,
      relation: guardian.students[0]?.relation,
      student: guardian.students[0]?.student,
    }));
    
    return { data: transformedData, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async findOne(id: string) {
    const entity = await this.prisma.guardian.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });
    
    if (!entity) {
      throw new NotFoundException('Guardian not found');
    }
    
    // Transform for backward compatibility
    const transformed = {
      ...entity,
      phone: entity.phoneNumber,
      studentId: entity.students[0]?.studentId,
      relation: entity.students[0]?.relation,
      student: entity.students[0]?.student,
    };
    
    return { data: transformed };
  }

  async create(input: GuardianCreateInput) {
    const { branchId } = PrismaService.getScope();
    
    // Create guardian with relationships
    const created = await this.prisma.guardian.create({
      data: {
        branchId: branchId ?? undefined,
        name: input.name,
        email: input.email ?? null,
        phoneNumber: input.phoneNumber ?? null,
        alternatePhoneNumber: input.alternatePhoneNumber ?? null,
        address: input.address ?? null,
        occupation: input.occupation ?? null,
        students: input.students ? {
          create: input.students.map(rel => ({
            studentId: rel.studentId,
            relation: rel.relation,
            isPrimary: rel.isPrimary ?? false,
            canPickup: rel.canPickup ?? true,
            emergencyContact: rel.emergencyContact ?? true,
          }))
        } : undefined
      },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });
    
    return { data: created };
  }

  async update(id: string, input: Partial<GuardianCreateInput>) {
    const updated = await this.prisma.guardian.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        email: input.email ?? undefined,
        phoneNumber: input.phoneNumber ?? undefined,
        alternatePhoneNumber: input.alternatePhoneNumber ?? undefined,
        address: input.address ?? undefined,
        occupation: input.occupation ?? undefined,
      },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });
    
    return { data: updated };
  }

  async addStudentRelationship(guardianId: string, studentId: string, relation: string, options?: {
    isPrimary?: boolean;
    canPickup?: boolean;
    emergencyContact?: boolean;
  }) {
    // Check if relationship already exists
    const existing = await this.prisma.studentGuardian.findUnique({
      where: {
        studentId_guardianId: {
          studentId,
          guardianId
        }
      }
    });
    
    if (existing) {
      throw new BadRequestException('This guardian is already linked to this student');
    }
    
    const created = await this.prisma.studentGuardian.create({
      data: {
        guardianId,
        studentId,
        relation,
        isPrimary: options?.isPrimary ?? false,
        canPickup: options?.canPickup ?? true,
        emergencyContact: options?.emergencyContact ?? true,
      },
      include: {
        guardian: true,
        student: true
      }
    });
    
    return { data: created };
  }

  async removeStudentRelationship(guardianId: string, studentId: string) {
    await this.prisma.studentGuardian.delete({
      where: {
        studentId_guardianId: {
          studentId,
          guardianId
        }
      }
    });
    
    return { success: true };
  }

  async remove(id: string) {
    // Check if guardian has any students
    const guardian = await this.prisma.guardian.findUnique({ 
      where: { id },
      include: {
        students: true
      }
    });
    
    if (!guardian) {
      throw new NotFoundException('Guardian not found');
    }
    
    if (guardian.students.length > 0) {
      throw new BadRequestException('Cannot delete guardian with linked students. Please unlink all students first.');
    }
    
    await this.prisma.guardian.delete({ where: { id } });
    return { success: true };
  }
}