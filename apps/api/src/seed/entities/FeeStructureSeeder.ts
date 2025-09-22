/**
 * FeeStructureSeeder Entity
 * Creates fee structures for each grade/class
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class FeeStructureSeeder extends BaseSeeder {
  public entityName = 'feeStructures';
  public dependencies = ['classes']; 
  public priority = 70; // After classes

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const structures: any[] = [];
    const errors: string[] = [];

    try {
      // Check if structures already exist
      const existingStructures = await context.prisma.feeStructure.findMany({
        where: { branchId: context.branchId },
        take: 1
      });
      
      if (existingStructures.length > 0) {
        // Structures already exist
        context.createdEntities.set('feeStructures', existingStructures);
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

      // Get all classes to create fee structures for
      const classes = await context.prisma.class.findMany({
        where: { branchId: context.branchId }
      });

      if (classes.length === 0) {
        throw new Error('No classes found');
      }

      // Create fee structure for each class
      for (const classEntity of classes) {
        try {
          // Check if structure already exists for this class
          const existingStructure = await context.prisma.feeStructure.findFirst({
            where: {
              branchId: context.branchId,
              gradeId: classEntity.id
            }
          });

          if (existingStructure) {
            structures.push(existingStructure);
            continue;
          }

          const structure = await context.prisma.feeStructure.create({
            data: {
              branchId: context.branchId,
              gradeId: classEntity.id
            }
          });

          structures.push(structure);

        } catch (error) {
          const errorMsg = `Failed to create fee structure for class ${classEntity.id}: ${error}`;
          errors.push(errorMsg);
        }
      }

      // Store created structures in context
      context.createdEntities.set('feeStructures', structures);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: structures.length,
          successCount: structures.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: structures,
        errors: errors.length > 0 ? errors.map(e => typeof e === "string" ? new Error(e) : e) : [],
        warnings: []
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        errors: [new Error(`Critical error in FeeStructureSeeder: ${error}`)],
        data: [],
        warnings: []
      };
    }
  }
}