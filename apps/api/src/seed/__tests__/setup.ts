/**
 * Test setup for Seed Data Manager v3.0
 * Uses Testcontainers for disposable PostgreSQL databases
 */

import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Disable testcontainers auth
process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';
process.env.DOCKER_AUTH_CONFIG = '{}';

// Global test instances
let postgresContainer: StartedPostgreSqlContainer;
let testPrisma: PrismaClient;
let testDatabaseUrl: string;

/**
 * Setup test environment with Testcontainers PostgreSQL
 */
export const setupTestDatabase = async (): Promise<void> => {
  console.log('🐳 Starting PostgreSQL container...');
  
  try {
    // Start PostgreSQL container
    postgresContainer = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_pass')
      .start();
    
    // Get connection URL from container
    testDatabaseUrl = postgresContainer.getConnectionUri();
    console.log(`✅ PostgreSQL container started`);
    
    // Set DATABASE_URL for Prisma to use
    process.env.DATABASE_URL = testDatabaseUrl;
    
    // Apply Prisma migrations to create schema
    console.log('📋 Applying Prisma migrations...');
    await applyPrismaMigrations();
    
    // Initialize Prisma client with the test database
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl
        }
      },
      log: process.env.DEBUG ? ['query', 'info', 'warn', 'error'] : ['error']
    });
    
    // Connect to database
    await testPrisma.$connect();
    
    console.log('✅ Test database ready');
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
};

/**
 * Apply Prisma migrations to create database schema
 */
async function applyPrismaMigrations(): Promise<void> {
  try {
    // Find the prisma directory path
    const apiPath = path.resolve(__dirname, '../../..');
    const prismaPath = path.join(apiPath, 'prisma');
    const schemaPath = path.join(prismaPath, 'schema.prisma');
    
    // Ensure prisma schema exists
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Prisma schema not found at ${schemaPath}`);
    }
    
    // Use db push for test environments (faster than migrations)
    // This creates the schema from the Prisma schema file
    console.log('📂 Pushing Prisma schema to test database...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: apiPath,
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl
      },
      stdio: process.env.DEBUG ? 'inherit' : 'pipe'
    });
    
    console.log('✅ Prisma schema applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply Prisma migrations:', error);
    throw error;
  }
}

/**
 * Teardown test environment
 */
export const teardownTestDatabase = async (): Promise<void> => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    // Disconnect Prisma
    if (testPrisma) {
      await testPrisma.$disconnect();
    }
    
    // Stop container
    if (postgresContainer) {
      await postgresContainer.stop();
      console.log('✅ PostgreSQL container stopped');
    }
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error);
    // Don't throw - cleanup errors shouldn't fail tests
  }
};

/**
 * Reset database between tests
 */
export const resetTestDatabase = async (): Promise<void> => {
  if (!testPrisma) return;
  
  try {
    // Use Prisma's transaction API to delete all records
    // Delete in reverse dependency order to avoid foreign key constraints
    const operations = [];
    
    // Check which models exist and add them to operations
    if (testPrisma.enrollment) operations.push(testPrisma.enrollment.deleteMany({}));
    if (testPrisma.section) operations.push(testPrisma.section.deleteMany({}));
    if (testPrisma.class) operations.push(testPrisma.class.deleteMany({}));
    if (testPrisma.teacher) operations.push(testPrisma.teacher.deleteMany({}));
    if (testPrisma.student) operations.push(testPrisma.student.deleteMany({}));
    if (testPrisma.academicYear) operations.push(testPrisma.academicYear.deleteMany({}));
    if (testPrisma.branch) operations.push(testPrisma.branch.deleteMany({}));
    
    if (operations.length > 0) {
      await testPrisma.$transaction(operations);
    }
  } catch (error) {
    // Some models might not exist in the schema yet, that's ok
    console.debug('Reset database warning:', error);
  }
};

/**
 * Get test Prisma client
 */
export const getTestPrisma = (): PrismaClient => {
  if (!testPrisma) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return testPrisma;
};

/**
 * Get test database URL
 */
export const getTestDatabaseUrl = (): string => {
  if (!testDatabaseUrl) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return testDatabaseUrl;
};

/**
 * Test branch configurations
 */
export const getTestBranchConfigs = () => ({
  'test-dps-main': {
    branchId: 'test-dps-main',
    schoolId: 'dps',
    displayName: 'Test DPS Main Campus',
    settings: {
      studentCount: 100,
      teacherCount: 10,
      classCount: 5
    }
  },
  'test-kvs-central': {
    branchId: 'test-kvs-central', 
    schoolId: 'kvs',
    displayName: 'Test KVS Central',
    settings: {
      studentCount: 80,
      teacherCount: 8,
      classCount: 4
    }
  }
});

// Jest lifecycle hooks
beforeAll(async () => {
  await setupTestDatabase();
}, 60000); // 60 second timeout for container startup

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await resetTestDatabase();
});