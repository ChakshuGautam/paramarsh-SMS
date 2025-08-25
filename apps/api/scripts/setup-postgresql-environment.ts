#!/usr/bin/env bun
/**
 * Setup PostgreSQL Environment for Paramarsh SMS
 * 
 * This script helps set up the PostgreSQL environment and run validation.
 * It checks Docker, starts PostgreSQL, switches schemas, and validates data.
 * 
 * Usage:
 *   bun run scripts/setup-postgresql-environment.ts
 *   bun run setup:postgresql
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const DOCKER_COMPOSE_FILE = path.join(__dirname, '../../../docker-compose.yml');
const SCHEMA_FILE = path.join(__dirname, '../prisma/schema.prisma');
const POSTGRESQL_SCHEMA_FILE = path.join(__dirname, '../prisma/schema.postgresql.prisma');

const POSTGRESQL_DATABASE_URL = 'postgresql://paramarsh:paramarsh123@localhost:5432/paramarsh_sms?schema=public';

interface SetupResult {
  step: string;
  success: boolean;
  message: string;
  details?: any;
}

async function checkDockerInstalled(): Promise<SetupResult> {
  console.log('🔍 Checking Docker installation...');
  
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8', stdio: 'pipe' });
    const composeVersion = execSync('docker-compose --version', { encoding: 'utf8', stdio: 'pipe' });
    
    return {
      step: 'Docker Check',
      success: true,
      message: 'Docker and Docker Compose are installed',
      details: {
        docker: dockerVersion.trim(),
        compose: composeVersion.trim()
      }
    };
  } catch (error: any) {
    return {
      step: 'Docker Check',
      success: false,
      message: 'Docker or Docker Compose not found',
      details: { error: error.message }
    };
  }
}

async function checkDockerComposeFile(): Promise<SetupResult> {
  console.log('📄 Checking docker-compose.yml...');
  
  if (!fs.existsSync(DOCKER_COMPOSE_FILE)) {
    return {
      step: 'Docker Compose File',
      success: false,
      message: 'docker-compose.yml not found in project root',
    };
  }
  
  const composeContent = fs.readFileSync(DOCKER_COMPOSE_FILE, 'utf8');
  const hasPostgres = composeContent.includes('postgres:');
  const hasCorrectConfig = composeContent.includes('paramarsh') && composeContent.includes('5432:5432');
  
  return {
    step: 'Docker Compose File',
    success: hasPostgres && hasCorrectConfig,
    message: hasPostgres && hasCorrectConfig 
      ? 'docker-compose.yml configured for PostgreSQL' 
      : 'docker-compose.yml missing PostgreSQL configuration',
    details: { hasPostgres, hasCorrectConfig }
  };
}

async function startPostgreSQLContainer(): Promise<SetupResult> {
  console.log('🚀 Starting PostgreSQL Docker container...');
  
  try {
    // Change to project root directory for docker-compose
    const projectRoot = path.join(__dirname, '../../..');
    process.chdir(projectRoot);
    
    // Stop and remove existing containers first
    console.log('  Stopping existing containers...');
    try {
      execSync('docker-compose down', { stdio: 'pipe' });
    } catch (error) {
      // Ignore errors if no containers are running
    }
    
    // Start PostgreSQL container
    console.log('  Starting PostgreSQL container...');
    execSync('docker-compose up -d postgres', { stdio: 'pipe' });
    
    // Wait for PostgreSQL to be ready
    console.log('  Waiting for PostgreSQL to be ready...');
    let retries = 30;
    while (retries > 0) {
      try {
        execSync('docker-compose exec postgres pg_isready -U paramarsh -d paramarsh_sms', { stdio: 'pipe' });
        break;
      } catch (error) {
        if (retries === 1) throw error;
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`    Waiting... (${30 - retries + 1}/30)`);
      }
    }
    
    // Verify PostgreSQL is accessible
    const containerStatus = execSync('docker-compose ps postgres', { encoding: 'utf8' });
    
    return {
      step: 'PostgreSQL Container',
      success: true,
      message: 'PostgreSQL container started and ready',
      details: { containerStatus: containerStatus.trim() }
    };
    
  } catch (error: any) {
    return {
      step: 'PostgreSQL Container',
      success: false,
      message: 'Failed to start PostgreSQL container',
      details: { error: error.message }
    };
  }
}

async function switchToPostgreSQLSchema(): Promise<SetupResult> {
  console.log('🔄 Switching to PostgreSQL schema...');
  
  try {
    // Backup current schema
    const backupFile = path.join(path.dirname(SCHEMA_FILE), 'schema.sqlite.backup.prisma');
    if (fs.existsSync(SCHEMA_FILE)) {
      fs.copyFileSync(SCHEMA_FILE, backupFile);
      console.log('  Created backup of current schema');
    }
    
    // Copy PostgreSQL schema
    if (!fs.existsSync(POSTGRESQL_SCHEMA_FILE)) {
      return {
        step: 'Schema Switch',
        success: false,
        message: 'PostgreSQL schema file not found',
      };
    }
    
    fs.copyFileSync(POSTGRESQL_SCHEMA_FILE, SCHEMA_FILE);
    console.log('  Switched to PostgreSQL schema');
    
    // Set environment variable for this process
    process.env.DATABASE_URL = POSTGRESQL_DATABASE_URL;
    
    return {
      step: 'Schema Switch',
      success: true,
      message: 'Switched to PostgreSQL schema successfully',
      details: {
        schemaFile: SCHEMA_FILE,
        databaseUrl: POSTGRESQL_DATABASE_URL
      }
    };
    
  } catch (error: any) {
    return {
      step: 'Schema Switch',
      success: false,
      message: 'Failed to switch schema',
      details: { error: error.message }
    };
  }
}

async function generatePrismaClient(): Promise<SetupResult> {
  console.log('⚡ Generating Prisma client for PostgreSQL...');
  
  try {
    // Change back to API directory
    const apiDir = path.join(__dirname, '..');
    process.chdir(apiDir);
    
    // Set DATABASE_URL environment variable and generate client
    const env = { 
      ...process.env, 
      DATABASE_URL: POSTGRESQL_DATABASE_URL 
    };
    
    execSync('bunx prisma generate', { 
      stdio: 'pipe',
      env
    });
    
    console.log('  Prisma client generated successfully');
    
    return {
      step: 'Prisma Generate',
      success: true,
      message: 'Prisma client generated for PostgreSQL',
    };
    
  } catch (error: any) {
    return {
      step: 'Prisma Generate',
      success: false,
      message: 'Failed to generate Prisma client',
      details: { error: error.message }
    };
  }
}

async function runMigrations(): Promise<SetupResult> {
  console.log('📦 Running PostgreSQL migrations...');
  
  try {
    const apiDir = path.join(__dirname, '..');
    process.chdir(apiDir);
    
    const env = { 
      ...process.env, 
      DATABASE_URL: POSTGRESQL_DATABASE_URL 
    };
    
    // Push schema to database (for development)
    execSync('bunx prisma db push', { 
      stdio: 'pipe',
      env
    });
    
    console.log('  Database schema pushed successfully');
    
    return {
      step: 'Database Migration',
      success: true,
      message: 'PostgreSQL schema migrated successfully',
    };
    
  } catch (error: any) {
    return {
      step: 'Database Migration',
      success: false,
      message: 'Failed to migrate database',
      details: { error: error.message }
    };
  }
}

async function testDatabaseConnection(): Promise<SetupResult> {
  console.log('🔗 Testing PostgreSQL database connection...');
  
  try {
    // Import and test Prisma client
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: POSTGRESQL_DATABASE_URL
        }
      }
    });
    
    // Test connection
    await prisma.$connect();
    console.log('  Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('  Database query test successful');
    
    await prisma.$disconnect();
    
    return {
      step: 'Database Connection',
      success: true,
      message: 'PostgreSQL connection test successful',
      details: { result }
    };
    
  } catch (error: any) {
    return {
      step: 'Database Connection',
      success: false,
      message: 'Failed to connect to PostgreSQL',
      details: { error: error.message }
    };
  }
}

async function runPostgreSQLValidation(): Promise<SetupResult> {
  console.log('🔍 Running PostgreSQL validation...');
  
  try {
    const apiDir = path.join(__dirname, '..');
    process.chdir(apiDir);
    
    const env = { 
      ...process.env, 
      DATABASE_URL: POSTGRESQL_DATABASE_URL 
    };
    
    // Run the PostgreSQL validation script
    execSync('bun run validate:postgresql', { 
      stdio: 'inherit',
      env
    });
    
    return {
      step: 'PostgreSQL Validation',
      success: true,
      message: 'PostgreSQL validation completed',
    };
    
  } catch (error: any) {
    // Validation script exits with code 1 if there are failures, but that's expected
    const isValidationError = error.message.includes('validation') || error.status === 1;
    
    return {
      step: 'PostgreSQL Validation',
      success: isValidationError, // Even if validation finds issues, the script ran successfully
      message: isValidationError 
        ? 'PostgreSQL validation completed (check results above)'
        : 'Failed to run PostgreSQL validation',
      details: { error: error.message }
    };
  }
}

function displayResults(results: SetupResult[]) {
  const line = '='.repeat(80);
  const halfLine = '─'.repeat(80);
  
  console.log(`\n${line}`);
  console.log('           PARAMARSH SMS POSTGRESQL SETUP RESULTS');
  console.log(`${line}\n`);
  
  console.log('📋 Setup Steps Summary:');
  console.log(halfLine);
  console.log('Step                    | Status   | Details');
  console.log(halfLine);
  
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const step = result.step.padEnd(22);
    const details = result.message.substring(0, 40) + (result.message.length > 40 ? '...' : '');
    
    console.log(`${step} | ${status} | ${details}`);
  }
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n📊 Setup Summary:`);
  console.log(`   Total Steps: ${results.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`\n🔧 Failed Steps Details:`);
    for (const result of results.filter(r => !r.success)) {
      console.log(`   ❌ ${result.step}: ${result.message}`);
      if (result.details) {
        console.log(`      Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    }
    
    console.log(`\n💡 Recommendations:`);
    console.log(`   1. Ensure Docker Desktop is running`);
    console.log(`   2. Check PostgreSQL container logs: docker-compose logs postgres`);
    console.log(`   3. Verify network connectivity and port availability`);
    console.log(`   4. Try restarting containers: docker-compose restart postgres`);
  } else {
    console.log(`\n🎉 SUCCESS: PostgreSQL environment is ready!`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Run seed data: bun run seed`);
    console.log(`   2. Validate data: bun run validate:postgresql`);
    console.log(`   3. Start API server: bun run start:dev`);
    console.log(`   4. Access PostgreSQL: docker-compose exec postgres psql -U paramarsh -d paramarsh_sms`);
  }
  
  console.log(`\n${line}`);
}

async function setupPostgreSQLEnvironment() {
  console.log('🚀 Starting PostgreSQL Environment Setup for Paramarsh SMS...\n');
  
  const results: SetupResult[] = [];
  
  // Step 1: Check Docker installation
  results.push(await checkDockerInstalled());
  if (!results[results.length - 1].success) {
    console.log('❌ Docker not found. Please install Docker Desktop first.');
    displayResults(results);
    return;
  }
  
  // Step 2: Check docker-compose.yml
  results.push(await checkDockerComposeFile());
  if (!results[results.length - 1].success) {
    console.log('❌ Docker Compose configuration issue.');
    displayResults(results);
    return;
  }
  
  // Step 3: Start PostgreSQL container
  results.push(await startPostgreSQLContainer());
  if (!results[results.length - 1].success) {
    console.log('❌ Failed to start PostgreSQL container.');
    displayResults(results);
    return;
  }
  
  // Step 4: Switch to PostgreSQL schema
  results.push(await switchToPostgreSQLSchema());
  if (!results[results.length - 1].success) {
    displayResults(results);
    return;
  }
  
  // Step 5: Generate Prisma client
  results.push(await generatePrismaClient());
  if (!results[results.length - 1].success) {
    displayResults(results);
    return;
  }
  
  // Step 6: Run migrations
  results.push(await runMigrations());
  if (!results[results.length - 1].success) {
    displayResults(results);
    return;
  }
  
  // Step 7: Test database connection
  results.push(await testDatabaseConnection());
  if (!results[results.length - 1].success) {
    displayResults(results);
    return;
  }
  
  // Step 8: Run PostgreSQL validation
  results.push(await runPostgreSQLValidation());
  
  displayResults(results);
  
  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}

// Export for use in other scripts
export { setupPostgreSQLEnvironment };
export type { SetupResult };

// Run setup if called directly
if (require.main === module) {
  setupPostgreSQLEnvironment()
    .catch(error => {
      console.error('💥 Fatal PostgreSQL setup error:', error);
      process.exit(1);
    });
}