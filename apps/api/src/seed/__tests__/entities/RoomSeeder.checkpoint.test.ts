/**
 * RoomSeeder Tests using Checkpoint System
 * Tests room generation for classrooms, labs, and other facilities
 */

import { RoomSeeder } from '../../entities/RoomSeeder';
import { CheckpointTestHelper } from '../checkpoint-test-helper';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('RoomSeeder - Checkpoint Tests', () => {
  let helper: CheckpointTestHelper;
  let seeder: RoomSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-checkpoint-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
    helper = new CheckpointTestHelper({
      branchId: testBranchId,
      prisma,
      checkpointDir: '.test-checkpoints-room'
    });
    
    // Initialize checkpoints (creates them if they don't exist)
    await helper.initialize();
  });

  afterAll(async () => {
    await helper.cleanup();
  });

  beforeEach(() => {
    seeder = new RoomSeeder();
  });

  describe('Starting from Tenants Checkpoint', () => {
    it('should create various types of rooms', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      
      // Verify rooms were created
      const roomCount = await prisma.room.count({
        where: { branchId: testBranchId }
      });
      
      console.log(`Created ${roomCount} rooms`);
      expect(roomCount).toBeGreaterThanOrEqual(30); // At least 30 rooms
    });

    it('should create different room types', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      await seeder.seed(context);
      
      // Check for various room types
      const roomTypes = await prisma.room.findMany({
        where: { branchId: testBranchId },
        select: { type: true },
        distinct: ['type']
      });
      
      const types = roomTypes.map(r => r.type);
      expect(types).toContain('classroom');
      expect(types).toContain('laboratory');
      expect(types).toContain('computer_lab');
      expect(types).toContain('library');
      expect(types).toContain('staffroom');
    });

    it('should assign proper room codes', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      await seeder.seed(context);
      
      const rooms = await prisma.room.findMany({
        where: { branchId: testBranchId },
        take: 10
      });
      
      rooms.forEach(room => {
        expect(room.code).toMatch(/^[A-Z]+-[A-Z_]+-\d{3}$/);
        expect(room.code).toContain(testBranchId.toUpperCase().slice(0, 3));
      });
    });

    it('should set appropriate capacities', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      await seeder.seed(context);
      
      const classrooms = await prisma.room.findMany({
        where: { 
          branchId: testBranchId,
          type: 'classroom'
        }
      });
      
      classrooms.forEach(classroom => {
        expect(classroom.capacity).toBeGreaterThanOrEqual(30);
        expect(classroom.capacity).toBeLessThanOrEqual(50);
      });
      
      const labs = await prisma.room.findMany({
        where: {
          branchId: testBranchId,
          type: 'laboratory'
        }
      });
      
      labs.forEach(lab => {
        expect(lab.capacity).toBeGreaterThanOrEqual(20);
        expect(lab.capacity).toBeLessThanOrEqual(30);
      });
    });

    it('should include facilities for each room', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      await seeder.seed(context);
      
      const rooms = await prisma.room.findMany({
        where: { branchId: testBranchId },
        take: 10
      });
      
      rooms.forEach(room => {
        expect(room.facilities).not.toBeNull();
        
        if (room.facilities) {
          const facilities = JSON.parse(room.facilities);
          expect(Array.isArray(facilities)).toBe(true);
          expect(facilities.length).toBeGreaterThan(0);
        }
      });
    });

    it('should assign building and floor information', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      await seeder.seed(context);
      
      const rooms = await prisma.room.findMany({
        where: { branchId: testBranchId }
      });
      
      rooms.forEach(room => {
        expect(room.building).not.toBeNull();
        expect(['Main Building', 'Science Block', 'Admin Block']).toContain(room.building!);
        expect(room.floor).not.toBeNull();
        expect(['Ground', '1', '2', '3']).toContain(room.floor!);
      });
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate rooms on multiple runs', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.room.count({
        where: { branchId: testBranchId }
      });
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.room.count({
        where: { branchId: testBranchId }
      });
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      // Mock a database error
      const originalCreate = context.prisma.room.create;
      let callCount = 0;
      context.prisma.room.create = jest.fn().mockImplementation((args) => {
        callCount++;
        if (callCount === 5) {
          throw new Error('Database connection lost');
        }
        return originalCreate.call(context.prisma.room, args);
      });
      
      const result = await seeder.seed(context);
      
      // Should handle the error and continue with other rooms
      expect(result.success).toBe(false);  // Because there were errors
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0]).toContain('Database connection lost');
      // Should have created some rooms despite the error
      expect(result.metrics.successCount).toBeGreaterThan(0);
      expect(result.metrics.errorCount).toBeGreaterThan(0);
      
      // Restore original function
      context.prisma.room.create = originalCreate;
    });
  });

  describe('Performance', () => {
    it('should efficiently create rooms', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} rooms in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});