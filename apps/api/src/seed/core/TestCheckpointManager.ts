/**
 * Test-specific checkpoint manager that uses Prisma instead of pg_dump
 * Avoids version mismatch issues with PostgreSQL tools
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SeedContext } from './interfaces';

export class TestCheckpointManager {
  private checkpointDir: string;
  private prisma: PrismaClient;

  constructor(config: {
    checkpointDir?: string;
    prisma: PrismaClient;
  }) {
    this.checkpointDir = config.checkpointDir || path.join(process.cwd(), '.test-checkpoints');
    this.prisma = config.prisma;
  }

  async init(): Promise<void> {
    await fs.mkdir(this.checkpointDir, { recursive: true });
    console.log(`📁 Test checkpoint directory ready: ${this.checkpointDir}`);
  }

  async createCheckpoint(name: string, context: SeedContext): Promise<void> {
    const checkpointFile = path.join(this.checkpointDir, `checkpoint_${name}.json`);
    
    try {
      console.log(`💾 Creating test checkpoint: ${name}`);
      
      // Export all data for the branch
      const data: Record<string, any[]> = {};
      const branchId = context.branchId;
      
      // Export each entity type that has been created
      if (context.createdEntities.has('tenants')) {
        data.tenants = await this.prisma.tenant.findMany({
          where: { branchId }
        });
      }
      
      if (context.createdEntities.has('academicYears')) {
        data.academicYears = await this.prisma.academicYear.findMany({
          where: { branchId }
        });
      }
      
      if (context.createdEntities.has('subjects')) {
        data.subjects = await this.prisma.subject.findMany({
          where: { branchId }
        });
      }
      
      if (context.createdEntities.has('classes')) {
        data.classes = await this.prisma.class.findMany({
          where: { branchId }
        });
        data.sections = await this.prisma.section.findMany({
          where: { branchId }
        });
      }
      
      if (context.createdEntities.has('teachers')) {
        data.teachers = await this.prisma.teacher.findMany({
          where: { branchId }
        });
      }
      
      if (context.createdEntities.has('students')) {
        data.students = await this.prisma.student.findMany({
          where: { branchId }
        });
      }
      
      if (context.createdEntities.has('guardians')) {
        data.guardians = await this.prisma.guardian.findMany({
          where: { branchId }
        });
        data.studentGuardians = await this.prisma.studentGuardian.findMany({
          where: { student: { branchId } }
        });
      }
      
      if (context.createdEntities.has('enrollments')) {
        data.enrollments = await this.prisma.enrollment.findMany({
          where: { branchId }
        });
      }
      
      // Save checkpoint data
      await fs.writeFile(checkpointFile, JSON.stringify(data, null, 2));
      
      // Save metadata
      const metadata = {
        name,
        createdAt: new Date().toISOString(),
        branchId: context.branchId,
        entities: Array.from(context.createdEntities.keys()),
        counts: {} as Record<string, number>
      };
      
      for (const [entityName] of context.createdEntities.entries()) {
        if (data[entityName]) {
          metadata.counts[entityName] = data[entityName].length;
        }
      }
      
      await fs.writeFile(
        path.join(this.checkpointDir, `checkpoint_${name}_meta.json`),
        JSON.stringify(metadata, null, 2)
      );
      
      console.log(`✅ Test checkpoint created: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to create test checkpoint ${name}:`, error);
      throw error;
    }
  }

  async restoreCheckpoint(name: string): Promise<void> {
    const checkpointFile = path.join(this.checkpointDir, `checkpoint_${name}.json`);
    
    try {
      await fs.access(checkpointFile);
      console.log(`🔄 Restoring test checkpoint: ${name}`);
      
      // Clear all data first
      await this.clearDatabase();
      
      // Load checkpoint data
      const dataStr = await fs.readFile(checkpointFile, 'utf-8');
      const data = JSON.parse(dataStr);
      
      // Restore data in dependency order
      if (data.tenants) {
        await this.prisma.tenant.createMany({ data: data.tenants });
      }
      
      if (data.academicYears) {
        await this.prisma.academicYear.createMany({ data: data.academicYears });
      }
      
      if (data.subjects) {
        await this.prisma.subject.createMany({ data: data.subjects });
      }
      
      if (data.classes) {
        await this.prisma.class.createMany({ data: data.classes });
      }
      
      if (data.sections) {
        await this.prisma.section.createMany({ data: data.sections });
      }
      
      // Skip teachers for now as they depend on Staff
      // TODO: Handle Staff-Teacher relationship properly
      // if (data.teachers) {
      //   await this.prisma.teacher.createMany({ data: data.teachers });
      // }
      
      if (data.students) {
        await this.prisma.student.createMany({ data: data.students });
      }
      
      if (data.guardians) {
        await this.prisma.guardian.createMany({ data: data.guardians });
      }
      
      if (data.studentGuardians) {
        await this.prisma.studentGuardian.createMany({ data: data.studentGuardians });
      }
      
      if (data.enrollments) {
        await this.prisma.enrollment.createMany({ data: data.enrollments });
      }
      
      console.log(`✅ Test checkpoint restored: ${name}`);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error(`Checkpoint not found: ${name}`);
      }
      console.error(`❌ Failed to restore checkpoint ${name}:`, error);
      throw error;
    }
  }

  async listCheckpoints(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.checkpointDir);
      return files
        .filter(f => f.startsWith('checkpoint_') && f.endsWith('.json') && !f.includes('_meta'))
        .map(f => f.replace('checkpoint_', '').replace('.json', ''));
    } catch {
      return [];
    }
  }

  async getCheckpointMetadata(name: string): Promise<any> {
    const metadataFile = path.join(this.checkpointDir, `checkpoint_${name}_meta.json`);
    try {
      const content = await fs.readFile(metadataFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async clearDatabase(): Promise<void> {
    // Delete in reverse dependency order
    await this.prisma.enrollment.deleteMany({});
    await this.prisma.studentGuardian.deleteMany({});
    await this.prisma.guardian.deleteMany({});
    await this.prisma.student.deleteMany({});
    await this.prisma.teacher.deleteMany({});
    await this.prisma.section.deleteMany({});
    await this.prisma.class.deleteMany({});
    await this.prisma.subject.deleteMany({});
    await this.prisma.academicYear.deleteMany({});
    await this.prisma.tenant.deleteMany({});
  }

  async cleanup(keepLast: number = 5): Promise<void> {
    const checkpoints = await this.listCheckpoints();
    
    if (checkpoints.length > keepLast) {
      const toDelete = checkpoints.slice(0, checkpoints.length - keepLast);
      
      for (const checkpoint of toDelete) {
        const dataFile = path.join(this.checkpointDir, `checkpoint_${checkpoint}.json`);
        const metaFile = path.join(this.checkpointDir, `checkpoint_${checkpoint}_meta.json`);
        
        await fs.unlink(dataFile).catch(() => {});
        await fs.unlink(metaFile).catch(() => {});
        
        console.log(`🗑️ Deleted old checkpoint: ${checkpoint}`);
      }
    }
  }
}