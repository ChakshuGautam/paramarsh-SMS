/**
 * Test helpers and utilities for Seed Data Manager v3.0
 */

import { PrismaClient } from '@prisma/client';
import { SeedContext, SeedLogger, SeedOptions } from '../core/interfaces';
import { LogLevel, SeedLogger as ConcreteLogger } from '../core/SeedLogger';
import { getTestPrisma, getTestBranchConfigs } from './setup';

/**
 * Create a test seed context
 */
export const createTestSeedContext = (
  branchId: string = 'test-dps-main',
  options: Partial<SeedOptions> = {}
): SeedContext => {
  const prisma = getTestPrisma();
  const branchConfigs = getTestBranchConfigs();
  
  // For dynamic test branch IDs, use a default config based on the prefix
  let branchConfig = branchConfigs[branchId as keyof typeof branchConfigs];
  
  if (!branchConfig) {
    // If it's a dynamic test branch ID, use default test config
    if (branchId.startsWith('test-')) {
      branchConfig = {
        branchId,
        schoolId: 'test',
        displayName: `Test Branch ${branchId}`,
        settings: {
          studentCount: 100,
          teacherCount: 10,
          classCount: 5
        }
      };
    } else {
      throw new Error(`Unknown test branch: ${branchId}`);
    }
  }
  
  const logger = new ConcreteLogger(LogLevel.ERROR, false); // Silent logging for tests
  
  return {
    prisma,
    branchId,
    schoolId: branchConfig.schoolId,
    options: {
      batchSize: 50, // Smaller batches for testing
      skipValidation: false,
      dryRun: false,
      verbose: false,
      parallel: false,
      maxRetries: 1,
      ...options
    },
    createdEntities: new Map(),
    logger
  };
};

/**
 * Create a test logger that captures logs for assertions
 */
export class TestLogger implements SeedLogger {
  private logs: Array<{
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    meta?: any;
    error?: Error;
  }> = [];
  
  private progressLogs: any[] = [];
  private metricsLogs: any[] = [];

  info(message: string, meta?: any): void {
    this.logs.push({ level: 'info', message, meta });
  }

  warn(message: string, meta?: any): void {
    this.logs.push({ level: 'warn', message, meta });
  }

  error(message: string, error?: Error, meta?: any): void {
    this.logs.push({ level: 'error', message, error, meta });
  }

  debug(message: string, meta?: any): void {
    this.logs.push({ level: 'debug', message, meta });
  }

  progress(progress: any): void {
    this.progressLogs.push(progress);
  }

  metrics(metrics: any): void {
    this.metricsLogs.push(metrics);
  }

  // Test utilities
  getLogs() {
    return [...this.logs];
  }

  getLogsByLevel(level: 'info' | 'warn' | 'error' | 'debug') {
    return this.logs.filter(log => log.level === level);
  }

  getProgressLogs() {
    return [...this.progressLogs];
  }

  getMetricsLogs() {
    return [...this.metricsLogs];
  }

  clear() {
    this.logs = [];
    this.progressLogs = [];
    this.metricsLogs = [];
  }

  hasErrorsOrWarnings(): boolean {
    return this.logs.some(log => log.level === 'error' || log.level === 'warn');
  }
}

/**
 * Assert that specific entities exist in the database
 */
export const assertEntitiesExist = async (
  prisma: PrismaClient,
  entityType: string,
  branchId: string,
  expectedCount: number
): Promise<void> => {
  let actualCount: number;
  
  switch (entityType) {
    case 'academicYears':
      actualCount = await prisma.academicYear.count({ where: { branchId } });
      break;
    case 'students':
      actualCount = await prisma.student.count({ where: { branchId } });
      break;
    case 'teachers':
      actualCount = await prisma.teacher.count({ where: { branchId } });
      break;
    case 'classes':
      actualCount = await prisma.class.count({ where: { branchId } });
      break;
    case 'sections':
      actualCount = await prisma.section.count({ where: { branchId } });
      break;
    default:
      throw new Error(`Unknown entity type for assertion: ${entityType}`);
  }
  
  expect(actualCount).toBe(expectedCount);
};

/**
 * Assert that entities have proper relationships
 */
export const assertEntityRelationships = async (
  prisma: PrismaClient,
  branchId: string
): Promise<void> => {
  // Check that all students have enrollments
  const studentsWithoutEnrollments = await prisma.student.count({
    where: {
      branchId,
      enrollments: {
        none: {}
      }
    }
  });
  expect(studentsWithoutEnrollments).toBe(0);
  
  // Check that all enrollments reference valid students and sections
  const invalidEnrollments = await prisma.enrollment.count({
    where: {
      branchId,
      OR: [
        { student: null },
        { section: null }
      ]
    }
  });
  expect(invalidEnrollments).toBe(0);
};

/**
 * Assert proper data isolation between branches
 */
export const assertBranchIsolation = async (
  prisma: PrismaClient,
  branchId1: string,
  branchId2: string
): Promise<void> => {
  // Students from branch1 should not appear in branch2
  const crossBranchStudents = await prisma.student.count({
    where: {
      branchId: branchId1,
      enrollments: {
        some: {
          branchId: branchId2
        }
      }
    }
  });
  expect(crossBranchStudents).toBe(0);
  
  // Teachers from branch1 should not be assigned to classes in branch2
  const crossBranchTeachers = await prisma.teacher.count({
    where: {
      branchId: branchId1,
      classSubjectTeachers: {
        some: {
          branchId: branchId2
        }
      }
    }
  });
  expect(crossBranchTeachers).toBe(0);
};

/**
 * Performance testing helper - measure execution time
 */
export const measureExecutionTime = async <T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number; memoryUsage: NodeJS.MemoryUsage }> => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  const result = await operation();
  
  const endTime = Date.now();
  const endMemory = process.memoryUsage();
  
  return {
    result,
    duration: endTime - startTime,
    memoryUsage: {
      rss: endMemory.rss - startMemory.rss,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      external: endMemory.external - startMemory.external,
      arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
    }
  };
};

/**
 * Data validation helpers
 */
export const validateIndianPhoneNumber = (phone: string): boolean => {
  return /^\+91-[0-9]{10}$/.test(phone);
};

export const validateIndianName = (name: string): boolean => {
  return name.length > 0 && /^[A-Za-z\s'\.]+$/.test(name);
};

export const validateBranchId = (branchId: string): boolean => {
  return /^[a-z]+-[a-z]+$/.test(branchId);
};

/**
 * Mock data generators for testing
 */
export const generateTestStudentData = (count: number, branchId: string) => {
  const students = [];
  for (let i = 1; i <= count; i++) {
    students.push({
      firstName: `TestStudent${i}`,
      lastName: 'TestFamily',
      admissionNo: `TEST${branchId.toUpperCase()}${i.toString().padStart(4, '0')}`,
      branchId,
      email: `test.student${i}@${branchId}.test.com`,
      phone: `+91-98765${i.toString().padStart(5, '0')}`,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return students;
};

export const generateTestTeacherData = (count: number, branchId: string) => {
  const teachers = [];
  for (let i = 1; i <= count; i++) {
    teachers.push({
      firstName: `TestTeacher${i}`,
      lastName: 'TestFamily',
      employeeId: `EMP${branchId.toUpperCase()}${i.toString().padStart(3, '0')}`,
      branchId,
      email: `test.teacher${i}@${branchId}.test.com`,
      phone: `+91-87654${i.toString().padStart(5, '0')}`,
      qualification: 'M.Ed',
      experience: Math.floor(Math.random() * 15) + 1,
      joiningDate: new Date(),
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return teachers;
};