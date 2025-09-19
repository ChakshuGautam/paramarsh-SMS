/**
 * Academic Year Seeder - First entity in dependency chain
 * Following V3-IMPLEMENTATION-SPEC.md
 */

import { PrismaSeeder } from '../core/PrismaSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class AcademicYearSeeder extends PrismaSeeder {
  readonly entityName = 'academicYears';
  readonly dependencies = []; // No dependencies - foundation entity
  
  constructor() {
    super(50); // Academic years are few, small batch size
  }

  async seed(context: SeedContext): Promise<SeedResult> {
    const academicYears = this.generateAcademicYears(context.branchId);
    
    context.logger.info(`Starting academic years seeding for ${context.branchId}`, {
      count: academicYears.length
    });

    // Check which academic years already exist
    const existingIds = await context.prisma.academicYear.findMany({
      where: { branchId: context.branchId },
      select: { id: true }
    });
    const existingIdSet = new Set(existingIds.map(e => e.id));
    
    // Filter out existing years
    const newYears = academicYears.filter(ay => !existingIdSet.has(ay.id));
    
    if (newYears.length === 0) {
      // All academic years already exist
      return {
        success: true,
        entityName: this.entityName,
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 0,
          duration: 0
        }
      };
    }

    // Debug: Log the data being created
    console.log(`[DEBUG] AcademicYearSeeder for ${context.branchId}: ${newYears.length} new years to create`);

    return this.createMany(
      context,
      newYears,
      async (batch) => {
        console.log(`[DEBUG] Creating batch for ${context.branchId}:`, 
          batch.map(b => ({ id: b.id, branchId: b.branchId })));
        
        const result = await context.prisma.academicYear.createMany({
          data: batch
        });
        
        console.log(`[DEBUG] CreateMany result for ${context.branchId}:`, result);
        
        return batch; // Return the batch since createMany doesn't return created records
      }
    );
  }

  protected async getRecordCount(context: SeedContext): Promise<number> {
    return context.prisma.academicYear.count({
      where: { branchId: context.branchId }
    });
  }

  estimateRecordCount(branchId: string): number {
    // Each branch gets 5 academic years (2022-23 to 2026-27)
    return 5;
  }

  private generateAcademicYears(branchId: string) {
    const academicYears = [];
    const currentYear = 2024;
    
    // Generate 5 academic years: 2022-23 to 2026-27
    for (let i = -2; i <= 2; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      const academicYear = `${startYear}-${endYear.toString().slice(-2)}`;
      
      academicYears.push({
        id: `${branchId}-ay-${academicYear}`, // Branch-specific academic year IDs for uniqueness
        name: academicYear, // Use 'name' field instead of 'year' to match Prisma schema
        startDate: `${startYear}-04-01`, // Prisma expects string dates
        endDate: `${endYear}-03-31`,
        isActive: i === 0, // Current year (2024-25) is active
        branchId, // Set the correct branchId
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return academicYears;
  }
}