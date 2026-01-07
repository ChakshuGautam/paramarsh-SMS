/**
 * Core interfaces for Seed Data Manager v3.0
 * Following V3-IMPLEMENTATION-SPEC.md
 */

import { PrismaClient } from '@prisma/client';

export interface SeedMetrics {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  memoryUsage?: NodeJS.MemoryUsage;
}

export interface SeedProgress {
  entityName: string;
  stage: 'preparing' | 'seeding' | 'validating' | 'completed' | 'error';
  processed: number;
  total: number;
  percentage: number;
  currentBatch?: number;
  totalBatches?: number;
  message?: string;
  error?: Error;
}

export interface SeedOptions {
  batchSize?: number;
  skipValidation?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  parallel?: boolean;
  maxRetries?: number;
  branchId?: string;
  schoolId?: string;
}

export interface SeedResult {
  entityName: string;
  success: boolean;
  metrics: SeedMetrics;
  errors: Error[];
  warnings: string[];
  data?: any[];
}

export interface SeedContext {
  prisma: PrismaClient;
  branchId: string;
  schoolId: string;
  options: SeedOptions;
  createdEntities: Map<string, any[]>;
  logger: SeedLogger;
}

export interface SeedLogger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  debug(message: string, meta?: any): void;
  progress(progress: SeedProgress): void;
  metrics(metrics: SeedMetrics): void;
}

export interface ISeedEntity {
  readonly entityName: string;
  readonly dependencies: string[];
  readonly batchSize: number;
  
  seed(context: SeedContext): Promise<SeedResult>;
  validate(context: SeedContext): Promise<boolean>;
  cleanup(context: SeedContext): Promise<void>;
  getDependencies(): string[];
  estimateRecordCount(branchId: string): number;
}

export interface ISeedOrchestrator {
  execute(options?: SeedOptions): Promise<SeedResult[]>;
  validateDependencies(): Promise<boolean>;
  getExecutionPlan(): string[];
  cleanup(): Promise<void>;
}

export interface BranchConfig {
  branchId: string;
  schoolId: string;
  displayName: string;
  settings: {
    studentCount: number;
    teacherCount: number;
    classCount: number;
    customizations?: Record<string, any>;
  };
}

export interface MultiBranchConfig {
  branches: BranchConfig[];
  globalSettings: {
    startAcademicYear: number;
    dataGenerationSeed: number;
    parallelExecution: boolean;
    batchSize: number;
  };
}

export type EntityType = 
  | 'academicYears'
  | 'branches' 
  | 'subjects'
  | 'classes'
  | 'sections'
  | 'teachers'
  | 'students'
  | 'guardians'
  | 'enrollments'
  | 'rooms'
  | 'timeSlots'
  | 'timetables'
  | 'attendanceRecords'
  | 'teacherAttendance'
  | 'exams'
  | 'marks'
  | 'feeStructures'
  | 'invoices'
  | 'payments'
  | 'admissionsApplications'
  | 'campaigns'
  | 'messages'
  | 'templates'
  | 'tickets';

export interface EntityDependencyGraph {
  [key: string]: {
    entity: EntityType;
    dependencies: EntityType[];
    weight: number; // for topological sorting
  };
}

export interface SeederRegistry {
  [entityName: string]: ISeedEntity;
}

export interface OrchestrationResult {
  success: boolean;
  totalSeeded: number;
  branchId: string;
  entityResults: Record<string, SeedResult>;
  errors: Error[];
  warnings: string[];
  metrics: SeedMetrics;
}

export interface ValidationResult {
  success: boolean;
  branchId: string;
  entityValidations: Record<string, boolean>;
  errors: Error[];
  warnings: string[];
}