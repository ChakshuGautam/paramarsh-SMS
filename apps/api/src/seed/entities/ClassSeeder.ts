/**
 * Class Seeder - Indian grade system-aware class and section generation
 * Following V3-IMPLEMENTATION-SPEC.md and TDD methodology
 */

import { PrismaSeeder } from '../core/PrismaSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';
import { BRANCH_CONFIGS, BranchId } from '../data/indian-data-constants';

export class ClassSeeder extends PrismaSeeder {
  readonly entityName = 'classes';
  readonly dependencies = ['academicYears', 'subjects']; // Depends on academic years and subjects
  
  constructor() {
    super(50); // Moderate batch size for classes
  }

  async seed(context: SeedContext): Promise<SeedResult> {
    const classes = this.generateClasses(context.branchId);
    
    context.logger.info(`Starting classes and sections seeding for ${context.branchId}`, {
      classCount: classes.length,
      branchId: context.branchId
    });

    // First create all classes
    const classResult = await this.createMany(
      context,
      classes,
      async (batch) => {
        // Check for existing classes to avoid duplicates
        const existingClasses = await context.prisma.class.findMany({
          where: {
            branchId: context.branchId,
            name: { in: batch.map(c => c.name) }
          }
        });
        
        const existingNames = new Set(existingClasses.map(c => c.name));
        const newClasses = batch.filter(c => !existingNames.has(c.name));
        
        if (newClasses.length === 0) {
          return existingClasses; // Return existing classes if no new ones to create
        }
        
        const createdClasses = [];
        for (const classData of newClasses) {
          const created = await context.prisma.class.create({
            data: {
              name: classData.name,
              gradeLevel: classData.gradeLevel,
              branchId: classData.branchId
            }
          });
          createdClasses.push(created);
        }
        
        return [...existingClasses, ...createdClasses];
      }
    );

    if (!classResult.success) {
      return classResult;
    }

    // Then create sections for each class
    const allSections = [];
    for (const classObj of classResult.data!) {
      const sections = this.generateSections(classObj, context.branchId);
      allSections.push(...sections);
    }

    context.logger.info(`Creating sections for ${context.branchId}`, {
      sectionCount: allSections.length
    });

    // Create sections in batches
    const sectionResult = await this.createMany(
      context,
      allSections,
      async (batch) => {
        // Check for existing sections to avoid duplicates
        const existingSections = await context.prisma.section.findMany({
          where: {
            branchId: context.branchId,
            classId: { in: batch.map(s => s.classId) },
            name: { in: batch.map(s => s.name) }
          }
        });
        
        const existingKeys = new Set(existingSections.map(s => `${s.classId}-${s.name}`));
        const newSections = batch.filter(s => !existingKeys.has(`${s.classId}-${s.name}`));
        
        if (newSections.length === 0) {
          return existingSections;
        }
        
        const createdSections = [];
        for (const sectionData of newSections) {
          const created = await context.prisma.section.create({
            data: {
              classId: sectionData.classId,
              name: sectionData.name,
              capacity: sectionData.capacity,
              branchId: sectionData.branchId,
              homeroomTeacherId: sectionData.homeroomTeacherId
            }
          });
          createdSections.push(created);
        }
        
        return [...existingSections, ...createdSections];
      }
    );

    // Add both classes and sections to context for dependent seeders
    if (classResult.success && classResult.data) {
      context.createdEntities.set('classes', classResult.data);
    }
    if (sectionResult.success && sectionResult.data) {
      context.createdEntities.set('sections', sectionResult.data);
    }

    // Return combined result
    return {
      ...classResult,
      metrics: {
        ...classResult.metrics,
        totalRecords: (classResult.metrics.totalRecords || 0) + (sectionResult.metrics.totalRecords || 0),
        successCount: (classResult.metrics.successCount || 0) + (sectionResult.metrics.successCount || 0),
        errorCount: (classResult.metrics.errorCount || 0) + (sectionResult.metrics.errorCount || 0)
      }
    };
  }

  protected async getRecordCount(context: SeedContext): Promise<number> {
    return context.prisma.class.count({
      where: { branchId: context.branchId }
    });
  }

  estimateRecordCount(branchId: string): number {
    const config = BRANCH_CONFIGS[branchId as BranchId];
    
    if (!config) {
      return 10; // Default fallback
    }

    // Count based on grades in the branch
    return config.grades.length;
  }

  /**
   * Generate classes based on branch configuration
   * @private method exposed for testing
   */
  private generateClasses(branchId: string) {
    const config = BRANCH_CONFIGS[branchId as BranchId];
    
    if (!config) {
      return this.generateFallbackClasses(branchId);
    }

    const classes = [];
    
    for (const gradeName of config.grades) {
      const gradeLevel = this.getGradeLevel(gradeName);
      
      classes.push({
        name: gradeName,
        gradeLevel: gradeLevel,
        branchId: branchId
      });
    }

    return classes;
  }

  /**
   * Generate sections for a specific class
   * @private method exposed for testing
   */
  private generateSections(classObj: any, branchId: string) {
    const config = BRANCH_CONFIGS[branchId as BranchId];
    const sections = [];
    
    if (!config) {
      // Fallback: create 2 sections A and B
      const sectionNames = ['A', 'B'];
      for (const sectionName of sectionNames) {
        sections.push({
          classId: classObj.id,
          name: sectionName,
          capacity: 30,
          branchId: branchId,
          homeroomTeacherId: null // Will be assigned later when teachers are created
        });
      }
      return sections;
    }

    // Use config sections and capacity
    const sectionNames = config.sections;
    const capacity = config.studentsPerSection || 30;
    
    for (const sectionName of sectionNames) {
      sections.push({
        classId: classObj.id,
        name: sectionName,
        capacity: capacity,
        branchId: branchId,
        homeroomTeacherId: null // Will be assigned later when teachers are created
      });
    }

    return sections;
  }

  private generateFallbackClasses(branchId: string) {
    // Default class structure for unknown branches
    const standardGrades = [
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
    ];

    return standardGrades.map(gradeName => ({
      name: gradeName,
      gradeLevel: this.getGradeLevel(gradeName),
      branchId: branchId
    }));
  }

  private getGradeLevel(gradeName: string): number {
    // Map Indian grade names to numeric levels
    const gradeMapping: { [key: string]: number } = {
      'Nursery': 0,
      'LKG': 0, // Lower Kindergarten
      'UKG': 0, // Upper Kindergarten
      'Class 1': 1,
      'Class 2': 2,
      'Class 3': 3,
      'Class 4': 4,
      'Class 5': 5,
      'Class 6': 6,
      'Class 7': 7,
      'Class 8': 8,
      'Class 9': 9,
      'Class 10': 10,
      'Class 11': 11,
      'Class 12': 12
    };

    return gradeMapping[gradeName] || 0;
  }
}