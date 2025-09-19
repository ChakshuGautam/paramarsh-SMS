/**
 * Tenant Seeder - Foundation entity for multi-tenant system
 * Following V3-IMPLEMENTATION-SPEC.md and TDD methodology
 */

import { PrismaSeeder } from '../core/PrismaSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';
import { BRANCH_CONFIGS, BranchId } from '../data/indian-data-constants';

export class TenantSeeder extends PrismaSeeder {
  readonly entityName = 'tenants';
  readonly dependencies = []; // No dependencies - foundation entity
  
  constructor() {
    super(50); // Tenants are few, small batch size
  }

  async seed(context: SeedContext): Promise<SeedResult> {
    const tenant = this.generateTenantData(context.branchId);
    
    context.logger.info(`Starting tenant seeding for ${context.branchId}`, {
      tenantId: tenant.id,
      tenantName: tenant.name
    });

    // Check if tenant already exists
    const existing = await context.prisma.tenant.findUnique({
      where: { id: tenant.id }
    });

    if (existing) {
      // Tenant already exists, return success with 0 new records
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

    return this.createMany(
      context,
      [tenant],
      async (batch) => {
        const result = await context.prisma.tenant.create({
          data: batch[0]
        });
        
        return [result]; // Return array since createMany expects array
      }
    );
  }

  protected async getRecordCount(context: SeedContext): Promise<number> {
    return context.prisma.tenant.count({
      where: { branchId: context.branchId }
    });
  }

  estimateRecordCount(branchId: string): number {
    // Each branch gets exactly 1 tenant record
    return 1;
  }

  /**
   * Generate tenant data for a specific branch
   * @private method exposed for testing
   */
  private generateTenantData(branchId: string) {
    // Try to get branch config, fallback to generic if not found
    const config = BRANCH_CONFIGS[branchId as BranchId];
    
    if (config) {
      return {
        id: branchId,
        branchId: branchId,
        name: config.name,
        subdomain: config.subdomain
      };
    }

    // Fallback for unknown branch IDs
    const schoolName = this.generateFallbackSchoolName(branchId);
    return {
      id: branchId,
      branchId: branchId,
      name: schoolName,
      subdomain: branchId
    };
  }

  /**
   * Generate fallback school name for unknown branch IDs
   */
  private generateFallbackSchoolName(branchId: string): string {
    // Extract school type from branch ID
    if (branchId.startsWith('dps-')) {
      return `Delhi Public School - ${this.capitalize(branchId.replace('dps-', ''))} Campus`;
    } else if (branchId.startsWith('kvs-')) {
      return `Kendriya Vidyalaya - ${this.capitalize(branchId.replace('kvs-', ''))}`;
    } else if (branchId.startsWith('sps-')) {
      return `St. Paul's School - ${this.capitalize(branchId.replace('sps-', ''))} Wing`;
    } else if (branchId.startsWith('ris-')) {
      return `Ryan International School - ${this.capitalize(branchId.replace('ris-', ''))} Branch`;
    } else {
      return `${this.capitalize(branchId.replace(/-/g, ' '))} School`;
    }
  }

  /**
   * Capitalize first letter of each word
   */
  private capitalize(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}