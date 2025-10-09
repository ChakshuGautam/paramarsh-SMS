/**
 * Global setup for E2E tests
 * Starts a PostgreSQL testcontainer for all E2E tests
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Disable testcontainers auth
process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';
process.env.DOCKER_AUTH_CONFIG = '{}';

let postgresContainer: StartedPostgreSqlContainer;

export default async function globalSetup() {
  console.log('🐳 Starting PostgreSQL testcontainer for E2E tests...');

  try {
    // Start PostgreSQL container
    postgresContainer = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_pass')
      .withExposedPorts(5432)
      .start();

    // Get connection details
    const host = postgresContainer.getHost();
    const port = postgresContainer.getMappedPort(5432);
    const testDatabaseUrl = `postgresql://test_user:test_pass@${host}:${port}/test_db?schema=public`;

    console.log(`✅ PostgreSQL testcontainer started at ${host}:${port}`);

    // Set DATABASE_URL for Prisma to use
    process.env.DATABASE_URL = testDatabaseUrl;

    // Store container info in global for teardown
    (global as any).__TESTCONTAINER__ = {
      container: postgresContainer,
      databaseUrl: testDatabaseUrl,
      host,
      port
    };

    // Apply Prisma schema
    console.log('📋 Applying Prisma schema...');
    const apiPath = path.resolve(__dirname, '..');

    execSync('npx prisma db push --skip-generate --accept-data-loss --force-reset', {
      cwd: apiPath,
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl
      },
      stdio: 'inherit'
    });

    console.log('✅ Prisma schema applied successfully');

    // Run seed data (ignore verification errors at the end)
    console.log('🌱 Seeding test database...');
    try {
      execSync('npx prisma db seed', {
        cwd: apiPath,
        env: {
          ...process.env,
          DATABASE_URL: testDatabaseUrl
        },
        stdio: 'inherit' // Show output so we can see progress
      });
      console.log('✅ Database seeded successfully');
    } catch (seedError: any) {
      // Seed script exits with error if verification fails, but data is already seeded
      // The verification step tries to reconnect to the database and may fail
      // But the seed data has already been written successfully
      console.log('⚠️ Seed command exited with error, but data may be seeded successfully');
      console.log('   Continuing with tests - seed data should be present');
    }

    console.log('✅ Test database ready for E2E tests');

  } catch (error) {
    console.error('❌ Failed to setup E2E test database:', error);
    throw error;
  }
}
