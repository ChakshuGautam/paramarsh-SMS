/**
 * FeeComponentSeeder Entity
 * Creates fee components for each fee structure
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class FeeComponentSeeder extends BaseSeeder {
  public entityName = 'feeComponents';
  public dependencies = ['feeStructures']; 
  public priority = 71; // After fee structures

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const components: any[] = [];
    const errors: string[] = [];

    try {
      // Check if components already exist
      const existingComponents = await context.prisma.feeComponent.findMany({
        where: { branchId: context.branchId },
        take: 1
      });
      
      if (existingComponents.length > 0) {
        // Components already exist
        context.createdEntities.set('feeComponents', existingComponents);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
            duration: Date.now() - startTime
          }
        };
      }

      // Get all fee structures
      const structures = await context.prisma.feeStructure.findMany({
        where: { branchId: context.branchId }
      });

      if (structures.length === 0) {
        throw new Error('No fee structures found');
      }

      // Create components for each structure
      for (const structure of structures) {
        try {
          // Check if components already exist for this structure
          const existingComponentsForStructure = await context.prisma.feeComponent.findMany({
            where: {
              feeStructureId: structure.id
            }
          });

          if (existingComponentsForStructure.length > 0) {
            components.push(...existingComponentsForStructure);
            continue;
          }

          // Get the grade level to determine appropriate fee amounts
          const gradeLevel = await this.getGradeLevel(context, structure.gradeId);
          const feeComponents = this.getFeeComponentsForGrade(gradeLevel);

          // Create each component
          for (const componentData of feeComponents) {
            const component = await context.prisma.feeComponent.create({
              data: {
                branchId: context.branchId,
                feeStructureId: structure.id,
                name: componentData.name,
                type: componentData.type,
                amount: componentData.amount
              }
            });

            components.push(component);
          }

        } catch (error) {
          const errorMsg = `Failed to create fee components for structure ${structure.id}: ${error}`;
          errors.push(errorMsg);
        }
      }

      // Store created components in context
      context.createdEntities.set('feeComponents', components);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: components.length,
          successCount: components.length,
          errorCount: errors.length,
          duration: Date.now() - startTime
        },
        data: components,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          duration: Date.now() - startTime
        },
        errors: [new Error(`Critical error in FeeComponentSeeder: ${error}`)]
      };
    }
  }

  /**
   * Get grade level number from class
   */
  private async getGradeLevel(context: SeedContext, gradeId: string | null): Promise<number> {
    if (!gradeId) return 5; // Default to middle school

    const classEntity = await context.prisma.class.findUnique({
      where: { id: gradeId }
    });

    if (!classEntity) return 5;

    // Extract grade number from class name (e.g., "Class 1" -> 1)
    const match = classEntity.name.match(/\d+/);
    return match ? parseInt(match[0]) : 5;
  }

  /**
   * Get fee components based on grade level
   */
  private getFeeComponentsForGrade(gradeLevel: number): Array<{name: string, type: string, amount: number}> {
    // Base amounts increase with grade level
    const baseTuition = 2000 + (gradeLevel * 200);
    const baseTransport = 500 + (gradeLevel * 50);
    const baseBooks = 300 + (gradeLevel * 100);
    const baseLab = gradeLevel >= 6 ? 500 : 0; // Lab fees for grade 6 and above
    const baseComputer = 300;
    const baseSports = 200;
    const baseLibrary = 150;
    const baseExam = 200;
    const baseActivity = gradeLevel <= 5 ? 300 : 200; // More activities for primary

    const components = [
      { name: 'Tuition Fee', type: 'mandatory', amount: baseTuition },
      { name: 'Transport Fee', type: 'optional', amount: baseTransport },
      { name: 'Books & Stationery', type: 'mandatory', amount: baseBooks },
      { name: 'Computer Lab Fee', type: 'mandatory', amount: baseComputer },
      { name: 'Sports Fee', type: 'optional', amount: baseSports },
      { name: 'Library Fee', type: 'mandatory', amount: baseLibrary },
      { name: 'Examination Fee', type: 'mandatory', amount: baseExam },
      { name: 'Activity Fee', type: 'optional', amount: baseActivity }
    ];

    // Add lab fee for higher grades
    if (baseLab > 0) {
      components.push({ name: 'Science Lab Fee', type: 'mandatory', amount: baseLab });
    }

    // Add special coaching for grades 10 and 12
    if (gradeLevel === 10 || gradeLevel === 12) {
      components.push({ name: 'Special Coaching Fee', type: 'optional', amount: 1000 });
    }

    return components;
  }
}