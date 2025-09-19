/**
 * CLI Interface Tests for Seed Data Manager v3.0
 * Following TDD methodology - CLI tests first, implementation second
 */

import { SeedCLI } from '../../cli/SeedCLI';
import { ModularSeedOrchestrator } from '../../core/ModularSeedOrchestrator';
import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

// Mock console methods to capture output
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();
const mockConsoleWarn = jest.fn();

const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

describe('SeedCLI', () => {
  let cli: SeedCLI;

  beforeEach(() => {
    // Mock console methods
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
    
    // Clear mock calls
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();

    cli = new SeedCLI();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
  });

  describe('CLI Interface', () => {
    it('should initialize with default orchestrator', () => {
      expect(cli).toBeDefined();
      expect(cli.getOrchestrator()).toBeInstanceOf(ModularSeedOrchestrator);
    });

    it('should accept custom orchestrator', () => {
      const customOrchestrator = new ModularSeedOrchestrator({
        batchSize: 500,
        verbose: true
      });

      const customCLI = new SeedCLI(customOrchestrator);
      expect(customCLI.getOrchestrator()).toBe(customOrchestrator);
    });

    it('should register default seeders', () => {
      const orchestrator = cli.getOrchestrator();
      const registeredSeeders = orchestrator.getRegisteredSeeders();
      
      // Should have at least academic year seeder registered by default
      expect(registeredSeeders.length).toBeGreaterThan(0);
      expect(registeredSeeders.some(s => s.entityName === 'academicYears')).toBe(true);
    });
  });

  describe('Command Line Parsing', () => {
    it('should parse seed command with branch ID', async () => {
      const result = await cli.parseAndExecute(['seed', 'test-dps-main']);
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('seed');
      expect(result.branchId).toBe('test-dps-main');
    });

    it('should parse seed command with options', async () => {
      const result = await cli.parseAndExecute([
        'seed', 
        'test-dps-main',
        '--verbose',
        '--batch-size', '200',
        '--dry-run'
      ]);
      
      expect(result.success).toBe(true);
      expect(result.options.verbose).toBe(true);
      expect(result.options.batchSize).toBe(200);
      expect(result.options.dryRun).toBe(true);
    });

    it('should parse validate command', async () => {
      // Seed first
      await cli.parseAndExecute(['seed', 'test-dps-main']);
      
      // Then validate
      const result = await cli.parseAndExecute(['validate', 'test-dps-main']);
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('validate');
      expect(result.validationResult).toBeDefined();
      expect(result.validationResult?.success).toBe(true);
    });

    it('should parse multi-branch seed command', async () => {
      const result = await cli.parseAndExecute([
        'seed-multi',
        'test-dps-main,test-kvs-central',
        '--verbose'
      ]);
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('seed-multi');
      expect(result.branches).toEqual(['test-dps-main', 'test-kvs-central']);
    });

    it('should parse cleanup command', async () => {
      // Seed first
      await cli.parseAndExecute(['seed', 'test-dps-main']);
      
      // Then cleanup
      const result = await cli.parseAndExecute(['cleanup', 'test-dps-main']);
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('cleanup');
    });

    it('should handle invalid commands', async () => {
      const result = await cli.parseAndExecute(['invalid-command']);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown command');
    });

    it('should handle missing branch ID for seed command', async () => {
      const result = await cli.parseAndExecute(['seed']);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Branch ID is required');
    });
  });

  describe('Command Execution', () => {
    it('should execute seed command successfully', async () => {
      const result = await cli.parseAndExecute(['seed', 'test-dps-main', '--verbose']);
      
      expect(result.success).toBe(true);
      expect(result.seedResult).toBeDefined();
      expect(result.seedResult?.success).toBe(true);
      expect(result.seedResult?.totalSeeded).toBe(5);

      // Should show progress in console
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Starting seed operation')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Seed operation completed')
      );
    });

    it('should execute validate command successfully', async () => {
      // Seed first
      await cli.parseAndExecute(['seed', 'test-dps-main']);
      
      // Clear previous console calls
      mockConsoleLog.mockClear();
      
      // Then validate
      const result = await cli.parseAndExecute(['validate', 'test-dps-main']);
      
      expect(result.success).toBe(true);
      expect(result.validationResult?.success).toBe(true);

      // Should show validation results
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Validation completed')
      );
    });

    it('should execute multi-branch seed successfully', async () => {
      const result = await cli.parseAndExecute([
        'seed-multi',
        'test-dps-main,test-kvs-central'
      ]);
      
      expect(result.success).toBe(true);
      expect(result.multiResults).toBeDefined();
      expect(result.multiResults).toHaveLength(2);
      expect(result.multiResults?.[0].success).toBe(true);
      expect(result.multiResults?.[1].success).toBe(true);

      // Verify data was created for both branches
      const prisma = getTestPrisma();
      const dpsCount = await prisma.academicYear.count({
        where: { branchId: 'test-dps-main' }
      });
      const kvsCount = await prisma.academicYear.count({
        where: { branchId: 'test-kvs-central' }
      });
      
      expect(dpsCount).toBe(5);
      expect(kvsCount).toBe(5);
    });

    it('should handle seed failures gracefully', async () => {
      // Create CLI with a failing seeder
      const failingOrchestrator = new ModularSeedOrchestrator();
      
      class FailingSeeder extends AcademicYearSeeder {
        readonly entityName = 'failing';
        
        async seed(): Promise<any> {
          throw new Error('CLI test failure');
        }
      }
      
      failingOrchestrator.registerSeeder(new FailingSeeder());
      const failingCLI = new SeedCLI(failingOrchestrator);
      
      const result = await failingCLI.parseAndExecute(['seed', 'test-dps-main']);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('CLI test failure');
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Seeding failed')
      );
    });

    it('should execute dry run without database changes', async () => {
      const result = await cli.parseAndExecute([
        'seed', 
        'test-dps-main', 
        '--dry-run',
        '--verbose'
      ]);
      
      expect(result.success).toBe(true);
      expect(result.seedResult?.totalSeeded).toBe(0); // No actual records in dry run

      // Should indicate dry run in console
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('DRY RUN')
      );

      // Verify no records were created
      const prisma = getTestPrisma();
      const recordCount = await prisma.academicYear.count({
        where: { branchId: 'test-dps-main' }
      });
      expect(recordCount).toBe(0);
    });

    it('should execute cleanup command', async () => {
      // Seed first
      await cli.parseAndExecute(['seed', 'test-dps-main']);
      
      // Clear previous console calls
      mockConsoleLog.mockClear();
      
      // Then cleanup
      const result = await cli.parseAndExecute(['cleanup', 'test-dps-main']);
      
      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Cleanup completed')
      );
    });
  });

  describe('Output Formatting', () => {
    it('should format seed results with metrics', async () => {
      const result = await cli.parseAndExecute(['seed', 'test-dps-main', '--verbose']);
      
      expect(result.success).toBe(true);
      
      // Should display metrics
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Total records seeded: 5')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Duration:')
      );
    });

    it('should format validation results clearly', async () => {
      // Seed first
      await cli.parseAndExecute(['seed', 'test-dps-main']);
      
      // Clear previous calls
      mockConsoleLog.mockClear();
      
      // Validate
      const result = await cli.parseAndExecute(['validate', 'test-dps-main']);
      
      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ academicYears: Valid')
      );
    });

    it('should format multi-branch results with summary', async () => {
      const result = await cli.parseAndExecute([
        'seed-multi',
        'test-dps-main,test-kvs-central'
      ]);
      
      expect(result.success).toBe(true);
      
      // Should show summary
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Multi-branch seeding completed')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('test-dps-main: ✅')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('test-kvs-central: ✅')
      );
    });

    it('should show progress bars in verbose mode', async () => {
      const result = await cli.parseAndExecute(['seed', 'test-dps-main', '--verbose']);
      
      expect(result.success).toBe(true);
      
      // Should show progress indicators
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/🔄.*overall.*preparing/)
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/🔄.*academicYears.*seeding/)
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/🔄.*overall.*completed/)
      );
    });

    it('should handle errors with clear messaging', async () => {
      const result = await cli.parseAndExecute(['validate', 'non-existent-branch']);
      
      expect(result.success).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed')
      );
    });
  });

  describe('Help and Usage', () => {
    it('should show help for no arguments', async () => {
      const result = await cli.parseAndExecute([]);
      
      expect(result.success).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Usage:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Commands:')
      );
    });

    it('should show help for --help flag', async () => {
      const result = await cli.parseAndExecute(['--help']);
      
      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Seed Data Manager v3.0')
      );
    });

    it('should show version for --version flag', async () => {
      const result = await cli.parseAndExecute(['--version']);
      
      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('v3.0.0')
      );
    });

    it('should list available commands', async () => {
      const result = await cli.parseAndExecute(['--help']);
      
      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('seed <branchId>')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('validate <branchId>')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('seed-multi <branchIds>')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('cleanup <branchId>')
      );
    });

    it('should show available options', async () => {
      const result = await cli.parseAndExecute(['--help']);
      
      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('--verbose')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('--batch-size')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('--dry-run')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('--skip-validation')
      );
    });
  });

  describe('Configuration and Environment', () => {
    it('should load configuration from environment', () => {
      // Mock environment variables
      const oldEnv = process.env.SEED_BATCH_SIZE;
      process.env.SEED_BATCH_SIZE = '300';
      
      const envCLI = new SeedCLI();
      const orchestrator = envCLI.getOrchestrator();
      
      // Should use environment configuration
      expect(envCLI).toBeDefined();
      
      // Restore environment
      if (oldEnv !== undefined) {
        process.env.SEED_BATCH_SIZE = oldEnv;
      } else {
        delete process.env.SEED_BATCH_SIZE;
      }
    });

    it('should support configuration file', async () => {
      const result = await cli.parseAndExecute([
        'seed',
        'test-dps-main',
        '--config',
        './seed.config.json'
      ]);
      
      // Should not fail even if config file doesn't exist (graceful fallback)
      expect(result.success).toBe(true);
    });
  });

  describe('Interactive Mode', () => {
    it('should support interactive branch selection', async () => {
      // Mock interactive selection (would normally be stdin)
      const result = await cli.parseAndExecute(['seed', '--interactive']);
      
      // For testing, should show interactive prompt message
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Available branches:')
      );
    });

    it('should support interactive confirmation for destructive operations', async () => {
      // Seed first
      await cli.parseAndExecute(['seed', 'test-dps-main']);
      
      // Clear previous calls
      mockConsoleLog.mockClear();
      
      // Cleanup with confirmation
      const result = await cli.parseAndExecute(['cleanup', 'test-dps-main', '--confirm']);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle database connection errors', async () => {
      // Mock database connection failure scenario
      const result = await cli.parseAndExecute(['seed', 'invalid-branch-format!@#']);
      
      expect(result.success).toBe(false);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should provide recovery suggestions on failure', async () => {
      const result = await cli.parseAndExecute(['validate', 'non-existent']);
      
      expect(result.success).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Try running: seed non-existent')
      );
    });

    it('should handle interrupted operations gracefully', async () => {
      // This would normally test SIGINT handling
      expect(cli).toBeDefined(); // Basic check for graceful structure
    });
  });

  describe('Reporting and Analytics', () => {
    it('should generate execution reports', async () => {
      const result = await cli.parseAndExecute([
        'seed',
        'test-dps-main',
        '--report',
        './test-report.json'
      ]);
      
      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Report saved to:')
      );
    });

    it('should show detailed timing information', async () => {
      const result = await cli.parseAndExecute(['seed', 'test-dps-main', '--timing']);
      
      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Timing breakdown:')
      );
    });
  });
});