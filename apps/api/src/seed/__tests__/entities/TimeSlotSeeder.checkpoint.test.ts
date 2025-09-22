/**
 * TimeSlotSeeder Tests using Checkpoint System
 * Tests time slot generation for school periods
 */
import { TimeSlotSeeder } from '../../entities/TimeSlotSeeder';
import { CheckpointTestHelper } from '../checkpoint-test-helper';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('TimeSlotSeeder - Checkpoint Tests', () => {
  let helper: CheckpointTestHelper;
  let seeder: TimeSlotSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-checkpoint-branch';
  beforeAll(async () => {
    prisma = getTestPrisma();
    helper = new CheckpointTestHelper({
      branchId: testBranchId,
      prisma,
      checkpointDir: '.test-checkpoints-timeslot'
    });
    // Initialize checkpoints (creates them if they don't exist)
    await helper.initialize();
  });
  afterAll(async () => {
    await helper.cleanup();
  });
  beforeEach(() => {
    seeder = new TimeSlotSeeder();
  });
  describe('Starting from Tenants Checkpoint', () => {
    it('should create time slots for school day', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      const result = await seeder.seed(context);
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      // Verify time slots were created
      const slotCount = await prisma.timeSlot.count({
        where: { branchId: testBranchId }
      });
      console.log(`Created ${slotCount} time slots`);
      expect(slotCount).toBeGreaterThanOrEqual(8); // At least 8 periods
    });
    it('should create morning and afternoon slots', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      await seeder.seed(context);
      // Check for morning slots (08:00 - 12:00)
      const morningSlots = await prisma.timeSlot.findMany({
        where: { 
          branchId: testBranchId,
          dayOfWeek: 1, // Monday
          slotOrder: {
            lte: 6 // First 6 slots are typically morning
          }
        }
      });
      expect(morningSlots.length).toBeGreaterThan(0);
      // Check for afternoon slots
      const afternoonSlots = await prisma.timeSlot.findMany({
        where: { 
          branchId: testBranchId,
          dayOfWeek: 1, // Monday
          slotOrder: {
            gt: 6 // After slot 6 is typically afternoon
          }
        }
      });
      expect(afternoonSlots.length).toBeGreaterThan(0);
    });
    it('should include break slots', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      await seeder.seed(context);
      const breakSlots = await prisma.timeSlot.findMany({
        where: { 
          branchId: testBranchId,
          slotType: {
            in: ['break', 'lunch']
          }
        }
      });
      expect(breakSlots.length).toBeGreaterThanOrEqual(10); // 2 breaks per day x 5 days
    });
    it('should assign proper slot order', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      await seeder.seed(context);
      const slots = await prisma.timeSlot.findMany({
        where: { 
          branchId: testBranchId,
          dayOfWeek: 1 // Monday
        },
        orderBy: { slotOrder: 'asc' }
      });
      // Check slot orders are sequential
      slots.forEach((slot, index) => {
        expect(slot.slotOrder).toBe(index + 1);
      });
    });
    it('should set appropriate durations', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      await seeder.seed(context);
      const regularSlots = await prisma.timeSlot.findMany({
        where: { 
          branchId: testBranchId,
          slotType: 'period'
        }
      });
      regularSlots.forEach(slot => {
        // Parse time strings
        const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        expect(duration).toBeGreaterThanOrEqual(35); // At least 35 minutes
        expect(duration).toBeLessThanOrEqual(60); // At most 60 minutes
      });
      const breakSlots = await prisma.timeSlot.findMany({
        where: { 
          branchId: testBranchId,
          slotType: {
            in: ['break', 'lunch']
          }
        }
      });
      breakSlots.forEach(slot => {
        const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        expect(duration).toBeGreaterThanOrEqual(10); // At least 10 minutes
        expect(duration).toBeLessThanOrEqual(45); // At most 45 minutes for lunch
      });
    });
    it('should create assembly slot', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      await seeder.seed(context);
      const assemblySlot = await prisma.timeSlot.findFirst({
        where: { 
          branchId: testBranchId,
          slotType: 'assembly'
        }
      });
      expect(assemblySlot).toBeDefined();
      expect(assemblySlot?.slotType).toBe('assembly');
      // Assembly should be early morning  
      const [hour] = assemblySlot!.startTime.split(':').map(Number);
      expect(hour).toBeLessThanOrEqual(9);
    });
  });
  describe('Idempotency', () => {
    it('should not create duplicate time slots on multiple runs', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.timeSlot.count({
        where: { branchId: testBranchId }
      });
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.timeSlot.count({
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
      const originalCreate = context.prisma.timeSlot.create;
      let callCount = 0;
      context.prisma.timeSlot.create = jest.fn().mockImplementation((args) => {
        callCount++;
        if (callCount === 3) {
          throw new Error('Database connection lost');
        }
        return originalCreate.call(context.prisma.timeSlot, args);
      });
      const result = await seeder.seed(context);
      // Should handle the error and continue with other slots
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0]).toContain('Database connection lost');
      // Restore original function
      context.prisma.timeSlot.create = originalCreate;
    });
  });
  describe('Performance', () => {
    it('should efficiently create time slots', async () => {
      const context = await helper.restoreToCheckpoint('tenants');
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Created ${result.metrics.successCount} time slots in ${duration}ms`);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds
    });
  });
});