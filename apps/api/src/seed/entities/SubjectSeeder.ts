/**
 * Subject Seeder - Indian curriculum-aware subject generation
 * Following V3-IMPLEMENTATION-SPEC.md and TDD methodology
 */

import { PrismaSeeder } from '../core/PrismaSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';
import { BRANCH_CONFIGS, INDIAN_SUBJECTS_BY_GRADE, BranchId } from '../data/indian-data-constants';

export class SubjectSeeder extends PrismaSeeder {
  readonly entityName = 'subjects';
  readonly dependencies = ['academicYears']; // Depends on academic years for proper context
  readonly priority = 10; // Higher priority for early seeding
  
  constructor() {
    super(100); // Moderate batch size for subjects
  }

  async seed(context: SeedContext): Promise<SeedResult> {
    const subjects = this.generateSubjects(context.branchId);
    
    context.logger.info(`Starting subjects seeding for ${context.branchId}`, {
      count: subjects.length,
      branchId: context.branchId
    });

    return this.createMany(
      context,
      subjects,
      async (batch) => {
        // Use upsert to handle duplicates gracefully
        const createdSubjects = [];
        for (const subject of batch) {
          const created = await context.prisma.subject.upsert({
            where: { code: subject.code },
            update: {
              name: subject.name,
              description: subject.description,
              credits: subject.credits,
              isElective: subject.isElective,
              prerequisites: subject.prerequisites,
              branchId: subject.branchId
            },
            create: subject
          });
          createdSubjects.push(created);
        }
        return createdSubjects;
      }
    );
  }

  protected async getRecordCount(context: SeedContext): Promise<number> {
    return context.prisma.subject.count({
      where: { branchId: context.branchId }
    });
  }

  async cleanup(context: SeedContext): Promise<void> {
    await context.prisma.subject.deleteMany({
      where: { branchId: context.branchId }
    });
    context.logger.info(`Cleaned up subjects for branch ${context.branchId}`);
  }

  estimateRecordCount(branchId: string): number {
    const config = BRANCH_CONFIGS[branchId as BranchId];
    
    if (!config) {
      return 10; // Default fallback
    }

    // Calculate based on grade levels
    const grades = config.grades;
    const hasElementary = grades.some(g => ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].includes(g));
    const hasMiddle = grades.some(g => ['Class 6', 'Class 7', 'Class 8'].includes(g));
    const hasSecondary = grades.some(g => ['Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(g));

    let subjectCount = 0;
    
    if (hasElementary) subjectCount += 7; // Basic subjects for elementary
    if (hasMiddle) subjectCount += 3; // Additional subjects for middle school
    if (hasSecondary) subjectCount += 5; // Advanced subjects for secondary

    return Math.max(subjectCount, 8); // Minimum 8 subjects
  }

  /**
   * Generate subjects based on branch configuration and Indian curriculum
   * @private method exposed for testing
   */
  private generateSubjects(branchId: string) {
    const config = BRANCH_CONFIGS[branchId as BranchId];
    const subjects = [];
    const usedCodes = new Set<string>();

    if (!config) {
      return this.generateFallbackSubjects(branchId, usedCodes);
    }

    const educationSystem = config.type; // CBSE, ICSE, ISC
    const grades = config.grades;

    // Determine grade levels present
    const hasPrePrimary = grades.some(g => ['Nursery', 'LKG', 'UKG'].includes(g));
    const hasPrimary = grades.some(g => ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].includes(g));
    const hasMiddle = grades.some(g => ['Class 6', 'Class 7', 'Class 8'].includes(g));
    const hasSecondary = grades.some(g => ['Class 9', 'Class 10'].includes(g));
    const hasSeniorSecondary = grades.some(g => ['Class 11', 'Class 12'].includes(g));

    // Core subjects for all systems
    if (hasPrePrimary) {
      subjects.push(...this.generatePrePrimarySubjects(branchId, usedCodes));
    }

    if (hasPrimary) {
      subjects.push(...this.generatePrimarySubjects(branchId, usedCodes));
    }

    if (hasMiddle) {
      subjects.push(...this.generateMiddleSubjects(branchId, educationSystem, usedCodes));
    }

    if (hasSecondary) {
      subjects.push(...this.generateSecondarySubjects(branchId, educationSystem, usedCodes));
    }

    if (hasSeniorSecondary) {
      subjects.push(...this.generateSeniorSecondarySubjects(branchId, educationSystem, usedCodes));
    }

    return subjects;
  }

  private generatePrePrimarySubjects(branchId: string, usedCodes: Set<string>) {
    const subjects = [
      { name: 'Pre-Math', code: this.generateUniqueCode('PREMATH', branchId, usedCodes), credits: 2, isElective: false, description: 'Pre-Mathematics for early learners' },
      { name: 'Pre-English', code: this.generateUniqueCode('PREENG', branchId, usedCodes), credits: 2, isElective: false, description: 'English language basics' },
      { name: 'Activity', code: this.generateUniqueCode('ACT', branchId, usedCodes), credits: 1, isElective: false, description: 'Creative and learning activities' },
      { name: 'Art & Craft', code: this.generateUniqueCode('ART', branchId, usedCodes), credits: 1, isElective: false, description: 'Art and creativity development' },
      { name: 'Physical Education', code: this.generateUniqueCode('PE', branchId, usedCodes), credits: 1, isElective: false, description: 'Physical development and sports' }
    ];

    return subjects.map(s => this.createSubjectObject(s, branchId));
  }

  private generatePrimarySubjects(branchId: string, usedCodes: Set<string>) {
    const subjects = [
      { name: 'English', code: this.generateUniqueCode('ENG', branchId, usedCodes), credits: 3, isElective: false, description: 'English language and literature' },
      { name: 'Hindi', code: this.generateUniqueCode('HIN', branchId, usedCodes), credits: 3, isElective: false, description: 'Hindi language' },
      { name: 'Mathematics', code: this.generateUniqueCode('MATH', branchId, usedCodes), credits: 3, isElective: false, description: 'Basic mathematics' },
      { name: 'EVS', code: this.generateUniqueCode('EVS', branchId, usedCodes), credits: 2, isElective: false, description: 'Environmental Studies' },
      { name: 'Computer Science', code: this.generateUniqueCode('CS', branchId, usedCodes), credits: 2, isElective: false, description: 'Basic computer literacy' },
      { name: 'Art & Craft', code: this.generateUniqueCode('ART', branchId, usedCodes), credits: 1, isElective: false, description: 'Art and creativity' },
      { name: 'Physical Education', code: this.generateUniqueCode('PE', branchId, usedCodes), credits: 1, isElective: false, description: 'Physical fitness and sports' }
    ];

    return subjects.map(s => this.createSubjectObject(s, branchId));
  }

  private generateMiddleSubjects(branchId: string, educationSystem: string, usedCodes: Set<string>) {
    const coreSubjects = [
      { name: 'English', code: this.generateUniqueCode('ENG', branchId, usedCodes), credits: 4, isElective: false, description: 'English language and literature' },
      { name: 'Hindi', code: this.generateUniqueCode('HIN', branchId, usedCodes), credits: 3, isElective: false, description: 'Hindi language' },
      { name: 'Mathematics', code: this.generateUniqueCode('MATH', branchId, usedCodes), credits: 4, isElective: false, description: 'Mathematics' },
      { name: 'Science', code: this.generateUniqueCode('SCI', branchId, usedCodes), credits: 4, isElective: false, description: 'General Science' },
      { name: 'Computer Science', code: this.generateUniqueCode('CS', branchId, usedCodes), credits: 2, isElective: false, description: 'Computer Science' },
      { name: 'Physical Education', code: this.generateUniqueCode('PE', branchId, usedCodes), credits: 1, isElective: false, description: 'Physical Education' }
    ];

    if (educationSystem === 'CBSE') {
      coreSubjects.push(
        { name: 'Social Studies', code: this.generateUniqueCode('SST', branchId, usedCodes), credits: 3, isElective: false, description: 'Social Studies' },
        { name: 'Sanskrit', code: this.generateUniqueCode('SAN', branchId, usedCodes), credits: 2, isElective: true, description: 'Sanskrit language' }
      );
    } else if (educationSystem === 'ICSE') {
      coreSubjects.push(
        { name: 'History', code: this.generateUniqueCode('HIST', branchId, usedCodes), credits: 2, isElective: false, description: 'History' },
        { name: 'Geography', code: this.generateUniqueCode('GEO', branchId, usedCodes), credits: 2, isElective: false, description: 'Geography' },
        { name: 'Civics', code: this.generateUniqueCode('CIV', branchId, usedCodes), credits: 2, isElective: false, description: 'Civics' }
      );
    }

    return coreSubjects.map(s => this.createSubjectObject(s, branchId));
  }

  private generateSecondarySubjects(branchId: string, educationSystem: string, usedCodes: Set<string>) {
    const coreSubjects = [
      { name: 'English', code: this.generateUniqueCode('ENG', branchId, usedCodes), credits: 5, isElective: false, description: 'English language and literature' },
      { name: 'Hindi', code: this.generateUniqueCode('HIN', branchId, usedCodes), credits: 4, isElective: false, description: 'Hindi language' },
      { name: 'Mathematics', code: this.generateUniqueCode('MATH', branchId, usedCodes), credits: 5, isElective: false, description: 'Mathematics' },
      { name: 'Physics', code: this.generateUniqueCode('PHY', branchId, usedCodes), credits: 4, isElective: false, description: 'Physics' },
      { name: 'Chemistry', code: this.generateUniqueCode('CHEM', branchId, usedCodes), credits: 4, isElective: false, description: 'Chemistry' },
      { name: 'Biology', code: this.generateUniqueCode('BIO', branchId, usedCodes), credits: 4, isElective: false, description: 'Biology' },
      { name: 'Computer Science', code: this.generateUniqueCode('CS', branchId, usedCodes), credits: 3, isElective: true, description: 'Computer Science' },
      { name: 'Physical Education', code: this.generateUniqueCode('PE', branchId, usedCodes), credits: 1, isElective: false, description: 'Physical Education' }
    ];

    if (educationSystem === 'CBSE') {
      coreSubjects.push(
        { name: 'Social Science', code: this.generateUniqueCode('SSC', branchId, usedCodes), credits: 4, isElective: false, description: 'Social Science' }
      );
    } else if (educationSystem === 'ICSE') {
      coreSubjects.push(
        { name: 'History', code: this.generateUniqueCode('HIST', branchId, usedCodes), credits: 3, isElective: false, description: 'History' },
        { name: 'Geography', code: this.generateUniqueCode('GEO', branchId, usedCodes), credits: 3, isElective: false, description: 'Geography' }
      );
    }

    return coreSubjects.map(s => this.createSubjectObject(s, branchId));
  }

  private generateSeniorSecondarySubjects(branchId: string, educationSystem: string, usedCodes: Set<string>) {
    // For Class 11-12, typically Science stream subjects
    const subjects = [
      { name: 'English', code: this.generateUniqueCode('ENG', branchId, usedCodes), credits: 5, isElective: false, description: 'English Core' },
      { name: 'Mathematics', code: this.generateUniqueCode('MATH', branchId, usedCodes), credits: 6, isElective: false, description: 'Mathematics' },
      { name: 'Physics', code: this.generateUniqueCode('PHY', branchId, usedCodes), credits: 6, isElective: false, description: 'Physics' },
      { name: 'Chemistry', code: this.generateUniqueCode('CHEM', branchId, usedCodes), credits: 6, isElective: false, description: 'Chemistry' },
      { name: 'Computer Science', code: this.generateUniqueCode('CS', branchId, usedCodes), credits: 5, isElective: true, description: 'Computer Science' },
      { name: 'Physical Education', code: this.generateUniqueCode('PE', branchId, usedCodes), credits: 1, isElective: false, description: 'Physical Education' }
    ];

    // Add stream-specific electives
    subjects.push(
      { name: 'Biology', code: this.generateUniqueCode('BIO', branchId, usedCodes), credits: 6, isElective: true, description: 'Biology (for Medical stream)' },
      { name: 'Economics', code: this.generateUniqueCode('ECO', branchId, usedCodes), credits: 5, isElective: true, description: 'Economics' },
      { name: 'Psychology', code: this.generateUniqueCode('PSY', branchId, usedCodes), credits: 4, isElective: true, description: 'Psychology' }
    );

    return subjects.map(s => this.createSubjectObject(s, branchId));
  }

  private generateFallbackSubjects(branchId: string, usedCodes: Set<string>) {
    const subjects = [
      { name: 'English', code: this.generateUniqueCode('ENG', branchId, usedCodes), credits: 4, isElective: false, description: 'English language' },
      { name: 'Mathematics', code: this.generateUniqueCode('MATH', branchId, usedCodes), credits: 4, isElective: false, description: 'Mathematics' },
      { name: 'Science', code: this.generateUniqueCode('SCI', branchId, usedCodes), credits: 4, isElective: false, description: 'General Science' },
      { name: 'Social Studies', code: this.generateUniqueCode('SST', branchId, usedCodes), credits: 3, isElective: false, description: 'Social Studies' },
      { name: 'Hindi', code: this.generateUniqueCode('HIN', branchId, usedCodes), credits: 3, isElective: false, description: 'Hindi language' },
      { name: 'Computer Science', code: this.generateUniqueCode('CS', branchId, usedCodes), credits: 2, isElective: false, description: 'Computer Science' },
      { name: 'Physical Education', code: this.generateUniqueCode('PE', branchId, usedCodes), credits: 1, isElective: false, description: 'Physical Education' },
      { name: 'Art & Craft', code: this.generateUniqueCode('ART', branchId, usedCodes), credits: 1, isElective: true, description: 'Art and Craft' }
    ];

    return subjects.map(s => this.createSubjectObject(s, branchId));
  }

  private generateUniqueCode(baseCode: string, branchId: string, usedCodes: Set<string>): string {
    // Create branch-specific prefix
    const branchPrefix = branchId.toUpperCase().replace(/-/g, '');
    let code = `${branchPrefix}-${baseCode}`;
    let counter = 1;

    while (usedCodes.has(code)) {
      code = `${branchPrefix}-${baseCode}${counter}`;
      counter++;
    }

    usedCodes.add(code);
    return code;
  }

  private createSubjectObject(subject: any, branchId: string) {
    return {
      code: subject.code,
      name: subject.name,
      description: subject.description,
      credits: subject.credits,
      isElective: subject.isElective,
      prerequisites: subject.prerequisites || null,
      branchId: branchId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}