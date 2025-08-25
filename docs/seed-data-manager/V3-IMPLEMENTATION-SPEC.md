# seed-data-manager v3.0 Implementation Specification

## Overview

This document provides the complete implementation specification for seed-data-manager v3.0, a Prisma-native, modular, testable seed data management system with multi-branch and multi-year support.

## Core Design Principles

1. **100% Prisma-Native**: No external database tool dependencies
2. **Fully Modular**: Each entity has its own seeder class
3. **Observable**: Real-time progress tracking and debugging
4. **Testable**: Comprehensive unit and integration test coverage
5. **Recoverable**: Checkpoint and rollback mechanisms
6. **Multi-Tenant**: Support for 13 branches with proper isolation
7. **Historical Data**: Generate 1-5 years of realistic history

## Implementation Architecture

### Directory Structure

```
apps/api/src/seed/
├── core/                           # Core framework
│   ├── interfaces.ts              # Type definitions and contracts
│   ├── base-seeder.ts            # PrismaSeeder base class
│   ├── orchestrator.ts           # ModularSeedOrchestrator
│   ├── multi-branch.ts           # MultiBranchSeedOrchestrator
│   ├── executor.ts               # ObservableSeedExecutor
│   ├── dependency-resolver.ts    # Topological sorting
│   ├── transaction-manager.ts    # Transaction handling
│   ├── checkpoint-manager.ts     # Recovery system
│   └── session.ts                # SeedSession management
├── seeders/                       # Entity seeders
│   ├── base/
│   │   ├── tenant.seeder.ts
│   │   ├── academic-year.seeder.ts
│   │   └── subject.seeder.ts
│   ├── academic/
│   │   ├── class.seeder.ts
│   │   ├── section.seeder.ts
│   │   └── room.seeder.ts
│   ├── people/
│   │   ├── student.seeder.ts
│   │   ├── guardian.seeder.ts
│   │   ├── staff.seeder.ts
│   │   └── teacher.seeder.ts
│   ├── enrollment/
│   │   ├── enrollment.seeder.ts
│   │   └── student-guardian.seeder.ts
│   ├── attendance/
│   │   ├── attendance-session.seeder.ts
│   │   ├── attendance-record.seeder.ts
│   │   └── teacher-attendance.seeder.ts
│   ├── finance/
│   │   ├── fee-structure.seeder.ts
│   │   ├── invoice.seeder.ts
│   │   └── payment.seeder.ts
│   └── [other domains...]
├── generators/                    # Data generators
│   ├── indian-names.generator.ts
│   ├── address.generator.ts
│   ├── phone.generator.ts
│   ├── timeline.generator.ts
│   └── data.generator.ts
├── validators/                    # Validation logic
│   ├── composite-branch.validator.ts
│   ├── relationship.validator.ts
│   ├── indian-context.validator.ts
│   └── data-quality.validator.ts
├── utils/                        # Utilities
│   ├── test-utils.ts
│   ├── logger.ts
│   ├── progress.ts
│   └── formatters.ts
├── config/                       # Configuration
│   ├── branches.config.ts
│   ├── seed.config.ts
│   └── indian-data.config.ts
├── cli/                          # CLI interface
│   ├── index.ts
│   ├── commands.ts
│   └── interactive.ts
└── __tests__/                    # Test suite
    ├── unit/
    ├── integration/
    └── fixtures/
```

## Core Components Implementation

### 1. Base Interfaces

```typescript
// src/seed/core/interfaces.ts

export interface SeedContext {
  branchId: string;
  academicYearId: string;
  userId?: string;
  isDryRun: boolean;
  isVerbose: boolean;
  checkpoint?: string;
  session: SeedSession;
}

export interface GenerateOptions {
  count: number;
  branchId: string;
  academicYearId: string;
  variation?: DataVariation;
  timeRange?: DateRange;
}

export interface SeedResult {
  entity: string;
  created: number;
  updated: number;
  failed: number;
  duration: number;
  errors: Error[];
}

export interface IEntitySeeder<T = any> {
  readonly entity: string;
  readonly dependencies: string[];
  readonly priority: number;
  
  validate(context: SeedContext): Promise<ValidationResult>;
  generate(options: GenerateOptions): T[];
  seed(data: T[], context: SeedContext): Promise<SeedResult>;
  verify(context: SeedContext): Promise<VerificationResult>;
  clean(context: SeedContext): Promise<void>;
  
  // Partial operations
  update(filter: Prisma.WhereInput, data: T[], context: SeedContext): Promise<UpdateResult>;
  upsert(data: T[], context: SeedContext): Promise<UpsertResult>;
  
  // Relationship management
  connectRelations?(data: T[], context: SeedContext): Promise<void>;
  validateRelations?(context: SeedContext): Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ProgressEvent {
  phase: 'validate' | 'generate' | 'seed' | 'verify';
  entity: string;
  current: number;
  total: number;
  percentage: number;
  message: string;
}
```

### 2. PrismaSeeder Base Class

```typescript
// src/seed/core/base-seeder.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { EventEmitter } from 'events';
import { IEntitySeeder, SeedContext, GenerateOptions, SeedResult } from './interfaces';

export abstract class PrismaSeeder<T, TModel> 
  extends EventEmitter 
  implements IEntitySeeder<T> {
  
  protected batchSize: number = 100;
  protected retryAttempts: number = 3;
  
  constructor(
    protected prisma: PrismaClient,
    public readonly entity: string,
    public readonly dependencies: string[] = [],
    public readonly priority: number = 0
  ) {
    super();
  }
  
  // Transaction wrapper
  protected async withTransaction<R>(
    callback: (tx: Prisma.TransactionClient) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(callback, {
      maxWait: 5000,
      timeout: 10000,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }
  
  // Batch operations
  protected async batchCreate(
    data: T[], 
    context: SeedContext
  ): Promise<number> {
    let created = 0;
    const batches = this.chunk(data, this.batchSize);
    
    for (const [index, batch] of batches.entries()) {
      this.emitProgress({
        phase: 'seed',
        entity: this.entity,
        current: index * this.batchSize,
        total: data.length,
        percentage: (index * this.batchSize / data.length) * 100,
        message: `Seeding batch ${index + 1}/${batches.length}`
      });
      
      if (context.isDryRun) {
        created += batch.length;
        continue;
      }
      
      try {
        const result = await this.createMany(batch);
        created += result.count;
      } catch (error) {
        await this.handleBatchError(batch, error, context);
      }
    }
    
    return created;
  }
  
  // Abstract methods for implementation
  abstract generate(options: GenerateOptions): T[];
  abstract createMany(data: T[]): Promise<Prisma.BatchPayload>;
  abstract findMany(filter: any): Promise<any[]>;
  abstract deleteMany(filter: any): Promise<Prisma.BatchPayload>;
  
  // Validation
  async validate(context: SeedContext): Promise<ValidationResult> {
    const errors = [];
    const warnings = [];
    
    // Check dependencies exist
    for (const dep of this.dependencies) {
      const count = await this.getDependencyCount(dep, context);
      if (count === 0) {
        errors.push({
          code: 'MISSING_DEPENDENCY',
          message: `Dependency ${dep} has no data for branch ${context.branchId}`
        });
      }
    }
    
    // Check branch exists
    if (context.branchId) {
      const branchExists = await this.checkBranchExists(context.branchId);
      if (!branchExists) {
        errors.push({
          code: 'INVALID_BRANCH',
          message: `Branch ${context.branchId} does not exist`
        });
      }
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Main seed method
  async seed(data: T[], context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const errors: Error[] = [];
    let created = 0;
    
    try {
      // Validation phase
      this.emit('phase:start', { phase: 'validate', entity: this.entity });
      const validation = await this.validate(context);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
      }
      
      // Seeding phase
      this.emit('phase:start', { phase: 'seed', entity: this.entity });
      created = await this.batchCreate(data, context);
      
      // Verification phase
      this.emit('phase:start', { phase: 'verify', entity: this.entity });
      await this.verify(context);
      
    } catch (error) {
      errors.push(error as Error);
      this.emit('error', { entity: this.entity, error });
    }
    
    const duration = Date.now() - startTime;
    
    return {
      entity: this.entity,
      created,
      updated: 0,
      failed: data.length - created,
      duration,
      errors
    };
  }
  
  // Utility methods
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  private emitProgress(event: ProgressEvent): void {
    this.emit('progress', event);
  }
  
  private async getDependencyCount(
    entity: string, 
    context: SeedContext
  ): Promise<number> {
    // Implementation depends on entity
    const model = this.prisma[entity.toLowerCase()];
    if (!model) return 0;
    
    return model.count({
      where: { branchId: context.branchId }
    });
  }
  
  private async checkBranchExists(branchId: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: branchId }
    });
    return !!tenant;
  }
  
  private async handleBatchError(
    batch: T[], 
    error: Error, 
    context: SeedContext
  ): Promise<void> {
    this.emit('batch:error', { 
      entity: this.entity, 
      batchSize: batch.length, 
      error 
    });
    
    // Try individual inserts for failed batch
    if (context.isVerbose) {
      for (const item of batch) {
        try {
          await this.createOne(item);
        } catch (itemError) {
          this.emit('item:error', { 
            entity: this.entity, 
            item, 
            error: itemError 
          });
        }
      }
    }
  }
  
  abstract createOne(data: T): Promise<any>;
}
```

### 3. Student Seeder Example

```typescript
// src/seed/seeders/people/student.seeder.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaSeeder } from '../../core/base-seeder';
import { IndianNamesGenerator } from '../../generators/indian-names.generator';
import { AddressGenerator } from '../../generators/address.generator';

export class StudentSeeder extends PrismaSeeder<
  Prisma.StudentCreateInput,
  'student'
> {
  private namesGenerator: IndianNamesGenerator;
  private addressGenerator: AddressGenerator;
  
  constructor(prisma: PrismaClient) {
    super(
      prisma,
      'Student',
      ['Tenant', 'Class', 'Section', 'AcademicYear'],
      10 // Priority
    );
    
    this.namesGenerator = new IndianNamesGenerator();
    this.addressGenerator = new AddressGenerator();
  }
  
  generate(options: GenerateOptions): Prisma.StudentCreateInput[] {
    const students: Prisma.StudentCreateInput[] = [];
    
    // Get available classes and sections for branch
    const classDistribution = this.getClassDistribution(options.branchId);
    
    for (let i = 0; i < options.count; i++) {
      const gender = Math.random() > 0.5 ? 'M' : 'F';
      const age = this.generateAge(classDistribution[i % classDistribution.length]);
      const name = this.namesGenerator.generate(gender);
      const address = this.addressGenerator.generate(options.branchId);
      
      students.push({
        id: `STU-${options.branchId}-${Date.now()}-${i}`,
        firstName: name.firstName,
        lastName: name.lastName,
        middleName: name.middleName,
        gender,
        dateOfBirth: this.calculateDOB(age),
        email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@student.edu.in`,
        phone: this.generatePhone(),
        address: JSON.stringify(address),
        
        // Academic info
        admissionNumber: `${new Date().getFullYear()}/${String(i + 1).padStart(4, '0')}`,
        rollNumber: String(i + 1),
        currentClassId: classDistribution[i % classDistribution.length].classId,
        currentSectionId: classDistribution[i % classDistribution.length].sectionId,
        
        // Additional info
        bloodGroup: this.randomBloodGroup(),
        religion: this.randomReligion(),
        category: this.randomCategory(),
        transportMode: this.randomTransportMode(),
        aadharNumber: this.generateAadhar(),
        
        // Metadata
        branchId: options.branchId,
        academicYearId: options.academicYearId,
        enrollmentDate: new Date(),
        isActive: true,
        
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return students;
  }
  
  async createMany(data: Prisma.StudentCreateInput[]): Promise<Prisma.BatchPayload> {
    return this.prisma.student.createMany({
      data,
      skipDuplicates: true
    });
  }
  
  async createOne(data: Prisma.StudentCreateInput): Promise<any> {
    return this.prisma.student.create({ data });
  }
  
  async findMany(filter: any): Promise<any[]> {
    return this.prisma.student.findMany({ where: filter });
  }
  
  async deleteMany(filter: any): Promise<Prisma.BatchPayload> {
    return this.prisma.student.deleteMany({ where: filter });
  }
  
  async verify(context: SeedContext): Promise<VerificationResult> {
    const count = await this.prisma.student.count({
      where: { branchId: context.branchId }
    });
    
    const issues = [];
    if (count < 30) {
      issues.push(`Low student count: ${count} (minimum 30 expected)`);
    }
    
    // Check age distribution
    const ageDistribution = await this.checkAgeDistribution(context.branchId);
    if (!ageDistribution.valid) {
      issues.push(`Invalid age distribution: ${ageDistribution.message}`);
    }
    
    // Check gender balance
    const genderBalance = await this.checkGenderBalance(context.branchId);
    if (Math.abs(genderBalance.malePercent - 50) > 20) {
      issues.push(`Gender imbalance: ${genderBalance.malePercent}% male`);
    }
    
    return {
      verified: issues.length === 0,
      count,
      issues
    };
  }
  
  // Helper methods
  private getClassDistribution(branchId: string): any[] {
    // Return class/section distribution based on branch configuration
    // This would be loaded from branch config
    return [];
  }
  
  private generateAge(classInfo: any): number {
    // Calculate age based on class level
    const baseAge = {
      'Nursery': 3,
      'KG': 4,
      'Class 1': 6,
      'Class 2': 7,
      // ... etc
    };
    return baseAge[classInfo.className] || 10;
  }
  
  private calculateDOB(age: number): Date {
    const today = new Date();
    const year = today.getFullYear() - age;
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }
  
  private generatePhone(): string {
    const prefixes = ['9', '8', '7', '6'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
    return `+91${prefix}${number}`;
  }
  
  private generateAadhar(): string {
    return Math.floor(Math.random() * 999999999999).toString().padStart(12, '0');
  }
  
  private randomBloodGroup(): string {
    const groups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
    return groups[Math.floor(Math.random() * groups.length)];
  }
  
  private randomReligion(): string {
    const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Others'];
    return religions[Math.floor(Math.random() * religions.length)];
  }
  
  private randomCategory(): string {
    const categories = ['General', 'OBC', 'SC', 'ST'];
    return categories[Math.floor(Math.random() * categories.length)];
  }
  
  private randomTransportMode(): string {
    const modes = ['School Bus', 'Private', 'Walk'];
    return modes[Math.floor(Math.random() * modes.length)];
  }
  
  private async checkAgeDistribution(branchId: string): Promise<any> {
    // Validate age distribution is appropriate for classes
    return { valid: true, message: 'Age distribution valid' };
  }
  
  private async checkGenderBalance(branchId: string): Promise<any> {
    const total = await this.prisma.student.count({ 
      where: { branchId } 
    });
    const males = await this.prisma.student.count({ 
      where: { branchId, gender: 'M' } 
    });
    
    return {
      total,
      males,
      females: total - males,
      malePercent: (males / total) * 100
    };
  }
}
```

### 4. Modular Orchestrator

```typescript
// src/seed/core/orchestrator.ts

import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { DependencyResolver } from './dependency-resolver';
import { CheckpointManager } from './checkpoint-manager';
import { IEntitySeeder, SeedContext, SeedResult } from './interfaces';

export class ModularSeedOrchestrator extends EventEmitter {
  private seeders = new Map<string, IEntitySeeder>();
  private resolver: DependencyResolver;
  private checkpoint: CheckpointManager;
  
  constructor(
    private prisma: PrismaClient,
    private config: SeedConfig
  ) {
    super();
    this.resolver = new DependencyResolver();
    this.checkpoint = new CheckpointManager(prisma);
    this.registerSeeders();
  }
  
  private registerSeeders(): void {
    // Register all seeders
    this.seeders.set('Tenant', new TenantSeeder(this.prisma));
    this.seeders.set('Student', new StudentSeeder(this.prisma));
    this.seeders.set('Guardian', new GuardianSeeder(this.prisma));
    // ... register all other seeders
    
    // Build dependency graph
    this.seeders.forEach((seeder, name) => {
      this.resolver.addNode(name, seeder.dependencies);
    });
  }
  
  async seedAll(context: SeedContext): Promise<SeedResult[]> {
    const results: SeedResult[] = [];
    
    try {
      // Resolve execution order
      const order = this.resolver.resolve();
      this.emit('start', { totalEntities: order.length });
      
      // Check for checkpoint
      const lastCheckpoint = await this.checkpoint.getLastCheckpoint(context);
      const startIndex = lastCheckpoint ? order.indexOf(lastCheckpoint.entity) + 1 : 0;
      
      // Execute seeders in order
      for (let i = startIndex; i < order.length; i++) {
        const entityName = order[i];
        const seeder = this.seeders.get(entityName);
        
        if (!seeder) {
          this.emit('warning', { message: `No seeder found for ${entityName}` });
          continue;
        }
        
        this.emit('entity:start', { entity: entityName, index: i, total: order.length });
        
        // Generate data
        const options = this.getGenerateOptions(entityName, context);
        const data = seeder.generate(options);
        
        // Seed data
        const result = await seeder.seed(data, context);
        results.push(result);
        
        // Save checkpoint
        await this.checkpoint.saveCheckpoint(context, entityName, result);
        
        this.emit('entity:complete', { entity: entityName, result });
      }
      
      this.emit('complete', { results });
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
    
    return results;
  }
  
  async seedModules(
    modules: string[], 
    context: SeedContext
  ): Promise<SeedResult[]> {
    const results: SeedResult[] = [];
    
    // Get dependencies for requested modules
    const requiredModules = this.resolver.getDependencies(modules);
    
    for (const module of requiredModules) {
      const seeder = this.seeders.get(module);
      if (!seeder) continue;
      
      const options = this.getGenerateOptions(module, context);
      const data = seeder.generate(options);
      const result = await seeder.seed(data, context);
      results.push(result);
    }
    
    return results;
  }
  
  async cleanAll(context: SeedContext): Promise<void> {
    const order = this.resolver.resolve().reverse();
    
    for (const entityName of order) {
      const seeder = this.seeders.get(entityName);
      if (seeder) {
        await seeder.clean(context);
      }
    }
  }
  
  async validateAll(context: SeedContext): Promise<ValidationReport> {
    const report = new ValidationReport();
    
    for (const [name, seeder] of this.seeders) {
      const result = await seeder.validate(context);
      report.addResult(name, result);
    }
    
    return report;
  }
  
  private getGenerateOptions(entity: string, context: SeedContext): GenerateOptions {
    const entityConfig = this.config.entities[entity] || {};
    
    return {
      count: entityConfig.count || 10,
      branchId: context.branchId,
      academicYearId: context.academicYearId,
      variation: entityConfig.variation || 'normal',
      timeRange: entityConfig.timeRange
    };
  }
}
```

### 5. Multi-Branch Orchestrator

```typescript
// src/seed/core/multi-branch.ts

import { ModularSeedOrchestrator } from './orchestrator';
import { SeedContext } from './interfaces';

export class MultiBranchSeedOrchestrator {
  private branches = [
    // Delhi Public School
    { id: 'dps-main', name: 'Delhi Public School - Main Campus', size: 'large' },
    { id: 'dps-north', name: 'Delhi Public School - North Campus', size: 'medium' },
    { id: 'dps-south', name: 'Delhi Public School - South Campus', size: 'medium' },
    { id: 'dps-east', name: 'Delhi Public School - East Campus', size: 'small' },
    { id: 'dps-west', name: 'Delhi Public School - West Campus', size: 'medium' },
    
    // Kendriya Vidyalaya
    { id: 'kvs-central', name: 'Kendriya Vidyalaya - Central', size: 'large' },
    { id: 'kvs-cantonment', name: 'Kendriya Vidyalaya - Cantonment', size: 'medium' },
    { id: 'kvs-airport', name: 'Kendriya Vidyalaya - Airport', size: 'small' },
    
    // St. Paul's School
    { id: 'sps-primary', name: "St. Paul's School - Primary Wing", size: 'medium' },
    { id: 'sps-secondary', name: "St. Paul's School - Secondary Wing", size: 'medium' },
    { id: 'sps-senior', name: "St. Paul's School - Senior Wing", size: 'small' },
    
    // Ryan International
    { id: 'ris-main', name: 'Ryan International School - Main', size: 'large' },
    { id: 'ris-extension', name: 'Ryan International School - Extension', size: 'medium' }
  ];
  
  constructor(
    private orchestrator: ModularSeedOrchestrator,
    private config: MultiBranchConfig
  ) {}
  
  async seedAllBranches(options: MultiBranchOptions): Promise<void> {
    const { parallel = true, yearsOfHistory = 3 } = options;
    
    if (parallel) {
      await this.seedParallel(yearsOfHistory);
    } else {
      await this.seedSequential(yearsOfHistory);
    }
  }
  
  private async seedParallel(yearsOfHistory: number): Promise<void> {
    const promises = this.branches.map(branch => 
      this.seedBranch(branch, yearsOfHistory)
    );
    
    await Promise.all(promises);
  }
  
  private async seedSequential(yearsOfHistory: number): Promise<void> {
    for (const branch of this.branches) {
      await this.seedBranch(branch, yearsOfHistory);
    }
  }
  
  private async seedBranch(
    branch: BranchConfig, 
    yearsOfHistory: number
  ): Promise<void> {
    console.log(`🌱 Seeding ${branch.name}...`);
    
    // Generate academic years
    const academicYears = this.generateAcademicYears(yearsOfHistory);
    
    for (const year of academicYears) {
      const context: SeedContext = {
        branchId: branch.id,
        academicYearId: year.id,
        isDryRun: false,
        isVerbose: true,
        session: new SeedSession()
      };
      
      // Adjust data volume based on branch size
      const multiplier = this.getSizeMultiplier(branch.size);
      this.adjustConfigForSize(multiplier);
      
      // Seed data for this branch and year
      await this.orchestrator.seedAll(context);
      
      // Generate historical records (attendance, marks, etc.)
      if (year.isHistorical) {
        await this.generateHistoricalData(context, year);
      }
    }
  }
  
  private generateAcademicYears(count: number): AcademicYear[] {
    const years: AcademicYear[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = count - 1; i >= 0; i--) {
      const startYear = currentYear - i;
      years.push({
        id: `AY-${startYear}-${startYear + 1}`,
        name: `Academic Year ${startYear}-${startYear + 1}`,
        startDate: new Date(startYear, 3, 1), // April 1st
        endDate: new Date(startYear + 1, 2, 31), // March 31st
        isHistorical: i > 0,
        isCurrent: i === 0
      });
    }
    
    return years;
  }
  
  private getSizeMultiplier(size: string): number {
    const multipliers = {
      'small': 0.5,   // 50% of base volume
      'medium': 1.0,  // 100% of base volume
      'large': 1.5    // 150% of base volume
    };
    return multipliers[size] || 1.0;
  }
  
  private adjustConfigForSize(multiplier: number): void {
    // Adjust entity counts based on branch size
    for (const entity in this.config.entities) {
      this.config.entities[entity].count = 
        Math.floor(this.config.entities[entity].baseCount * multiplier);
    }
  }
  
  private async generateHistoricalData(
    context: SeedContext, 
    year: AcademicYear
  ): Promise<void> {
    // Generate attendance records for the year
    await this.generateAttendanceHistory(context, year);
    
    // Generate exam marks for the year
    await this.generateMarksHistory(context, year);
    
    // Generate fee payments for the year
    await this.generatePaymentHistory(context, year);
  }
  
  private async generateAttendanceHistory(
    context: SeedContext,
    year: AcademicYear
  ): Promise<void> {
    // Implementation for historical attendance
    console.log(`  📅 Generating attendance for ${year.name}`);
  }
  
  private async generateMarksHistory(
    context: SeedContext,
    year: AcademicYear
  ): Promise<void> {
    // Implementation for historical marks
    console.log(`  📝 Generating marks for ${year.name}`);
  }
  
  private async generatePaymentHistory(
    context: SeedContext,
    year: AcademicYear
  ): Promise<void> {
    // Implementation for historical payments
    console.log(`  💰 Generating payments for ${year.name}`);
  }
}
```

## Testing Framework

### Unit Test Example

```typescript
// src/seed/__tests__/unit/seeders/student.seeder.test.ts

import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { StudentSeeder } from '../../../seeders/people/student.seeder';
import { SeedContext } from '../../../core/interfaces';

describe('StudentSeeder', () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let seeder: StudentSeeder;
  let context: SeedContext;
  
  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    seeder = new StudentSeeder(prisma);
    context = {
      branchId: 'test-branch',
      academicYearId: 'test-year',
      isDryRun: false,
      isVerbose: false,
      session: mockDeep<SeedSession>()
    };
  });
  
  describe('generate', () => {
    it('should generate correct number of students', () => {
      const students = seeder.generate({
        count: 10,
        branchId: 'test-branch',
        academicYearId: 'test-year'
      });
      
      expect(students).toHaveLength(10);
    });
    
    it('should generate valid student data', () => {
      const students = seeder.generate({
        count: 1,
        branchId: 'test-branch',
        academicYearId: 'test-year'
      });
      
      const student = students[0];
      expect(student.firstName).toBeTruthy();
      expect(student.lastName).toBeTruthy();
      expect(student.branchId).toBe('test-branch');
      expect(student.email).toMatch(/^[a-z]+\.[a-z]+@student\.edu\.in$/);
      expect(student.phone).toMatch(/^\+91[6-9]\d{9}$/);
    });
    
    it('should have balanced gender distribution', () => {
      const students = seeder.generate({
        count: 100,
        branchId: 'test-branch',
        academicYearId: 'test-year'
      });
      
      const males = students.filter(s => s.gender === 'M').length;
      const females = students.filter(s => s.gender === 'F').length;
      
      expect(Math.abs(males - females)).toBeLessThan(20);
    });
  });
  
  describe('seed', () => {
    it('should call createMany with correct data', async () => {
      const students = seeder.generate({
        count: 5,
        branchId: 'test-branch',
        academicYearId: 'test-year'
      });
      
      prisma.student.createMany.mockResolvedValue({ count: 5 });
      prisma.student.count.mockResolvedValue(5);
      prisma.tenant.findUnique.mockResolvedValue({ id: 'test-branch' });
      
      const result = await seeder.seed(students, context);
      
      expect(prisma.student.createMany).toHaveBeenCalledWith({
        data: students,
        skipDuplicates: true
      });
      expect(result.created).toBe(5);
      expect(result.failed).toBe(0);
    });
    
    it('should handle dry-run mode', async () => {
      const dryRunContext = { ...context, isDryRun: true };
      const students = seeder.generate({
        count: 5,
        branchId: 'test-branch',
        academicYearId: 'test-year'
      });
      
      const result = await seeder.seed(students, dryRunContext);
      
      expect(prisma.student.createMany).not.toHaveBeenCalled();
      expect(result.created).toBe(5);
    });
  });
  
  describe('validate', () => {
    it('should validate branch exists', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      
      const result = await seeder.validate(context);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_BRANCH');
    });
    
    it('should validate dependencies exist', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'test-branch' });
      prisma.class.count.mockResolvedValue(0);
      
      const result = await seeder.validate(context);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_DEPENDENCY')).toBe(true);
    });
  });
});
```

## CLI Implementation

### Commands Structure

```typescript
// src/seed/cli/index.ts

import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { ModularSeedOrchestrator } from '../core/orchestrator';
import { MultiBranchSeedOrchestrator } from '../core/multi-branch';
import * as cliProgress from 'cli-progress';
import chalk from 'chalk';

const program = new Command();
const prisma = new PrismaClient();

program
  .name('seed')
  .description('Paramarsh SMS Seed Data Manager v3.0')
  .version('3.0.0');

// Seed all data for a branch
program
  .command('all <branchId>')
  .description('Seed all data for a specific branch')
  .option('-y, --years <n>', 'Years of history to generate', '3')
  .option('-d, --dry-run', 'Preview without writing to database')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (branchId, options) => {
    const orchestrator = new ModularSeedOrchestrator(prisma, config);
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    
    orchestrator.on('start', (data) => {
      progressBar.start(data.totalEntities, 0);
    });
    
    orchestrator.on('entity:complete', (data) => {
      progressBar.increment();
    });
    
    const context: SeedContext = {
      branchId,
      academicYearId: generateCurrentAcademicYear(),
      isDryRun: options.dryRun || false,
      isVerbose: options.verbose || false,
      session: new SeedSession()
    };
    
    try {
      const results = await orchestrator.seedAll(context);
      progressBar.stop();
      
      console.log(chalk.green('✅ Seeding completed successfully!'));
      displayResults(results);
    } catch (error) {
      progressBar.stop();
      console.error(chalk.red('❌ Seeding failed:'), error);
      process.exit(1);
    }
  });

// Seed specific modules
program
  .command('modules <modules> <branchId>')
  .description('Seed specific modules (comma-separated)')
  .option('-c, --count <n>', 'Number of records per module')
  .option('-d, --dry-run', 'Preview without writing')
  .action(async (modules, branchId, options) => {
    const moduleList = modules.split(',');
    const orchestrator = new ModularSeedOrchestrator(prisma, config);
    
    const context: SeedContext = {
      branchId,
      academicYearId: generateCurrentAcademicYear(),
      isDryRun: options.dryRun || false,
      isVerbose: false,
      session: new SeedSession()
    };
    
    const results = await orchestrator.seedModules(moduleList, context);
    displayResults(results);
  });

// Seed all branches
program
  .command('demo')
  .description('Seed full demo data for all 13 branches')
  .option('-y, --years <n>', 'Years of history', '3')
  .option('-p, --parallel', 'Seed branches in parallel')
  .action(async (options) => {
    const orchestrator = new ModularSeedOrchestrator(prisma, config);
    const multiBranch = new MultiBranchSeedOrchestrator(orchestrator, config);
    
    console.log(chalk.blue('🚀 Starting multi-branch demo seed...'));
    console.log(chalk.gray(`Branches: 13 | Years: ${options.years} | Mode: ${options.parallel ? 'Parallel' : 'Sequential'}`));
    
    const startTime = Date.now();
    
    await multiBranch.seedAllBranches({
      parallel: options.parallel || false,
      yearsOfHistory: parseInt(options.years) || 3
    });
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(chalk.green(`✅ All branches seeded in ${duration}s`));
  });

// Validate data
program
  .command('validate <branchId>')
  .description('Validate seeded data for a branch')
  .action(async (branchId) => {
    const orchestrator = new ModularSeedOrchestrator(prisma, config);
    
    const context: SeedContext = {
      branchId,
      academicYearId: generateCurrentAcademicYear(),
      isDryRun: false,
      isVerbose: true,
      session: new SeedSession()
    };
    
    const report = await orchestrator.validateAll(context);
    displayValidationReport(report);
  });

// Clean data
program
  .command('clean <branchId>')
  .description('Remove all seeded data for a branch')
  .option('-f, --force', 'Skip confirmation')
  .action(async (branchId, options) => {
    if (!options.force) {
      const confirmed = await confirmAction(`Delete all data for ${branchId}?`);
      if (!confirmed) return;
    }
    
    const orchestrator = new ModularSeedOrchestrator(prisma, config);
    const context: SeedContext = {
      branchId,
      academicYearId: generateCurrentAcademicYear(),
      isDryRun: false,
      isVerbose: true,
      session: new SeedSession()
    };
    
    await orchestrator.cleanAll(context);
    console.log(chalk.green(`✅ Data cleaned for ${branchId}`));
  });

program.parse();

// Helper functions
function displayResults(results: SeedResult[]): void {
  console.log('\n📊 Seeding Results:');
  console.log('─'.repeat(50));
  
  for (const result of results) {
    const status = result.failed === 0 ? '✅' : '⚠️';
    console.log(`${status} ${result.entity}: ${result.created} created, ${result.failed} failed (${result.duration}ms)`);
    
    if (result.errors.length > 0) {
      result.errors.forEach(err => {
        console.log(chalk.red(`   Error: ${err.message}`));
      });
    }
  }
  
  const total = results.reduce((sum, r) => sum + r.created, 0);
  const failed = results.reduce((sum, r) => sum + r.failed, 0);
  
  console.log('─'.repeat(50));
  console.log(`Total: ${total} created, ${failed} failed`);
}

function displayValidationReport(report: ValidationReport): void {
  console.log('\n🔍 Validation Report:');
  console.log('─'.repeat(50));
  
  const results = report.getResults();
  for (const [entity, result] of results) {
    const status = result.valid ? '✅' : '❌';
    console.log(`${status} ${entity}`);
    
    if (result.errors.length > 0) {
      result.errors.forEach(err => {
        console.log(chalk.red(`   Error: ${err.message}`));
      });
    }
    
    if (result.warnings.length > 0) {
      result.warnings.forEach(warn => {
        console.log(chalk.yellow(`   Warning: ${warn.message}`));
      });
    }
  }
  
  console.log('─'.repeat(50));
  console.log(`Overall: ${report.isValid() ? '✅ VALID' : '❌ INVALID'}`);
}
```

## Configuration

### Seed Configuration

```typescript
// src/seed/config/seed.config.ts

export const seedConfig: SeedConfig = {
  entities: {
    Tenant: {
      baseCount: 1,
      priority: 1
    },
    Student: {
      baseCount: 100,  // Per branch base
      priority: 10,
      variation: 'normal',
      dependencies: ['Class', 'Section']
    },
    Guardian: {
      baseCount: 160,  // 1.6 per student average
      priority: 11,
      dependencies: ['Student']
    },
    Teacher: {
      baseCount: 30,
      priority: 8,
      dependencies: ['Staff', 'Subject']
    },
    Staff: {
      baseCount: 40,
      priority: 7,
      dependencies: ['Tenant']
    },
    Class: {
      baseCount: 12,  // Nursery to Class 12
      priority: 3,
      dependencies: ['AcademicYear']
    },
    Section: {
      baseCount: 3,   // Average sections per class
      priority: 4,
      dependencies: ['Class']
    },
    // ... other entities
  },
  
  batchSizes: {
    default: 100,
    Student: 200,
    AttendanceRecord: 500
  },
  
  performance: {
    maxParallelBranches: 4,
    transactionTimeout: 10000,
    retryAttempts: 3
  }
};
```

## Deployment

### Package.json Scripts

```json
{
  "scripts": {
    "seed": "tsx src/seed/cli/index.ts",
    "seed:all": "tsx src/seed/cli/index.ts all",
    "seed:demo": "tsx src/seed/cli/index.ts demo --years 3 --parallel",
    "seed:modules": "tsx src/seed/cli/index.ts modules",
    "seed:validate": "tsx src/seed/cli/index.ts validate",
    "seed:clean": "tsx src/seed/cli/index.ts clean",
    "seed:test": "jest src/seed --coverage",
    "seed:test:watch": "jest src/seed --watch"
  }
}
```

## Monitoring & Metrics

### Progress Tracking

```typescript
// Real-time progress display
┌─────────────────────────────────────────┐
│ Seeding dps-main                       │
│ ████████████████░░░░░░░░ 65% │ 13/20 │
│ Current: Student (1234/2000)           │
│ Time: 00:02:34 | ETA: 00:01:26        │
└─────────────────────────────────────────┘
```

### Performance Metrics

```typescript
// Collected after each run
{
  "timestamp": "2025-08-24T10:30:00Z",
  "branch": "dps-main",
  "metrics": {
    "totalRecords": 5234,
    "duration": 156000,
    "memoryUsed": 234567890,
    "queriesExecuted": 432,
    "transactionsUsed": 20,
    "errorsEncountered": 2,
    "recordsPerSecond": 33.5
  }
}
```

## Conclusion

The v3.0 implementation provides a complete overhaul of the seed data management system with:

1. **100% Prisma-native operations** - No external dependencies
2. **Modular architecture** - Each entity has its own seeder
3. **Observable execution** - Real-time progress and debugging
4. **Comprehensive testing** - Unit, integration, and E2E tests
5. **Multi-branch support** - Parallel seeding of 13 branches
6. **Historical data** - Generate years of realistic data
7. **Recovery mechanisms** - Checkpoints and rollback support

This implementation ensures maintainability, testability, and scalability while providing a superior developer experience.

---

*Document Version: 1.0.0*
*Last Updated: 2025-08-24*