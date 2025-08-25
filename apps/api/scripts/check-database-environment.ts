#!/usr/bin/env bun
/**
 * Database Environment Checker for Paramarsh SMS
 * 
 * This script checks the current database environment and provides guidance.
 * Helps users understand whether they're using SQLite or PostgreSQL.
 * 
 * Usage:
 *   bun run scripts/check-database-environment.ts
 *   bun run check:db
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_FILE = path.join(__dirname, '../prisma/schema.prisma');
const SQLITE_DB_FILE = path.join(__dirname, '../prisma/dev.db');
const DOCKER_COMPOSE_FILE = path.join(__dirname, '../../../docker-compose.yml');

interface EnvironmentCheck {
  component: string;
  status: 'FOUND' | 'MISSING' | 'ERROR';
  details: string;
  recommendation?: string;
}

async function checkSchemaConfiguration(): Promise<EnvironmentCheck> {
  try {
    if (!fs.existsSync(SCHEMA_FILE)) {
      return {
        component: 'Prisma Schema',
        status: 'MISSING',
        details: 'schema.prisma file not found',
        recommendation: 'Create schema.prisma file'
      };
    }
    
    const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf8');
    
    if (schemaContent.includes('provider = "postgresql"')) {
      return {
        component: 'Database Provider',
        status: 'FOUND',
        details: 'PostgreSQL configured in schema',
      };
    } else if (schemaContent.includes('provider = "sqlite"')) {
      return {
        component: 'Database Provider',
        status: 'FOUND',
        details: 'SQLite configured in schema',
        recommendation: 'Switch to PostgreSQL for production use'
      };
    } else {
      return {
        component: 'Database Provider',
        status: 'ERROR',
        details: 'Unknown database provider in schema'
      };
    }
    
  } catch (error: any) {
    return {
      component: 'Schema Configuration',
      status: 'ERROR',
      details: error.message
    };
  }
}

async function checkDatabaseURL(): Promise<EnvironmentCheck> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return {
      component: 'DATABASE_URL',
      status: 'MISSING',
      details: 'DATABASE_URL environment variable not set',
      recommendation: 'Set DATABASE_URL for your database'
    };
  }
  
  if (databaseUrl.includes('postgresql://')) {
    return {
      component: 'DATABASE_URL',
      status: 'FOUND',
      details: `PostgreSQL: ${databaseUrl.split('@')[1] || 'configured'}`,
    };
  } else if (databaseUrl.includes('file:')) {
    return {
      component: 'DATABASE_URL',
      status: 'FOUND',
      details: `SQLite: ${databaseUrl.replace('file:', '')}`,
      recommendation: 'Consider switching to PostgreSQL for production'
    };
  } else {
    return {
      component: 'DATABASE_URL',
      status: 'ERROR',
      details: `Unknown format: ${databaseUrl.substring(0, 20)}...`
    };
  }
}

async function checkSQLiteDatabase(): Promise<EnvironmentCheck> {
  if (fs.existsSync(SQLITE_DB_FILE)) {
    const stats = fs.statSync(SQLITE_DB_FILE);
    const sizeMB = Math.round((stats.size / 1024 / 1024) * 100) / 100;
    
    return {
      component: 'SQLite Database',
      status: 'FOUND',
      details: `dev.db exists (${sizeMB} MB)`,
      recommendation: sizeMB > 0 ? 'Database has data' : 'Database is empty, run seed'
    };
  } else {
    return {
      component: 'SQLite Database',
      status: 'MISSING',
      details: 'dev.db file not found'
    };
  }
}

async function checkDockerPostgreSQL(): Promise<EnvironmentCheck> {
  try {
    // Check if docker-compose.yml exists
    if (!fs.existsSync(DOCKER_COMPOSE_FILE)) {
      return {
        component: 'Docker PostgreSQL',
        status: 'MISSING',
        details: 'docker-compose.yml not found'
      };
    }
    
    // Check if Docker is installed
    try {
      execSync('docker --version', { stdio: 'pipe' });
    } catch (error) {
      return {
        component: 'Docker PostgreSQL',
        status: 'MISSING',
        details: 'Docker not installed',
        recommendation: 'Install Docker Desktop'
      };
    }
    
    // Check if PostgreSQL container is running
    try {
      const containerStatus = execSync('docker-compose ps postgres', { encoding: 'utf8', stdio: 'pipe' });
      
      if (containerStatus.includes('Up')) {
        return {
          component: 'Docker PostgreSQL',
          status: 'FOUND',
          details: 'PostgreSQL container is running',
        };
      } else {
        return {
          component: 'Docker PostgreSQL',
          status: 'MISSING',
          details: 'PostgreSQL container not running',
          recommendation: 'Run: docker-compose up -d postgres'
        };
      }
    } catch (error) {
      return {
        component: 'Docker PostgreSQL',
        status: 'MISSING',
        details: 'PostgreSQL container not found',
        recommendation: 'Run: docker-compose up -d postgres'
      };
    }
    
  } catch (error: any) {
    return {
      component: 'Docker PostgreSQL',
      status: 'ERROR',
      details: error.message
    };
  }
}

async function checkValidationScripts(): Promise<EnvironmentCheck> {
  const validationScripts = [
    'scripts/validate-seed-data-mcp.ts',
    'scripts/validate-postgresql-seed-data.ts',
    'scripts/setup-postgresql-environment.ts'
  ];
  
  const existing = [];
  const missing = [];
  
  for (const script of validationScripts) {
    const scriptPath = path.join(__dirname, '..', script);
    if (fs.existsSync(scriptPath)) {
      existing.push(path.basename(script));
    } else {
      missing.push(path.basename(script));
    }
  }
  
  if (missing.length === 0) {
    return {
      component: 'Validation Scripts',
      status: 'FOUND',
      details: `All validation scripts available (${existing.length})`
    };
  } else if (existing.length > 0) {
    return {
      component: 'Validation Scripts',
      status: 'FOUND',
      details: `${existing.length} scripts found, ${missing.length} missing`,
      recommendation: `Missing: ${missing.join(', ')}`
    };
  } else {
    return {
      component: 'Validation Scripts',
      status: 'MISSING',
      details: 'No validation scripts found'
    };
  }
}

async function testDatabaseConnection(): Promise<EnvironmentCheck> {
  try {
    // Try to import Prisma client
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection
    await prisma.$connect();
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    await prisma.$disconnect();
    
    return {
      component: 'Database Connection',
      status: 'FOUND',
      details: 'Successfully connected to database'
    };
    
  } catch (error: any) {
    if (error.message.includes('ECONNREFUSED')) {
      return {
        component: 'Database Connection',
        status: 'ERROR',
        details: 'Connection refused - database not running',
        recommendation: 'Start database server'
      };
    } else if (error.message.includes('does not exist')) {
      return {
        component: 'Database Connection',
        status: 'ERROR',
        details: 'Database/table does not exist',
        recommendation: 'Run migrations: bunx prisma db push'
      };
    } else {
      return {
        component: 'Database Connection',
        status: 'ERROR',
        details: error.message.substring(0, 60) + '...',
        recommendation: 'Check database configuration'
      };
    }
  }
}

function displayResults(checks: EnvironmentCheck[]) {
  const line = '='.repeat(80);
  const halfLine = '─'.repeat(80);
  
  console.log(`\n${line}`);
  console.log('           PARAMARSH SMS DATABASE ENVIRONMENT CHECK');
  console.log(`${line}\n`);
  
  console.log('🔍 Current Environment Status:');
  console.log(halfLine);
  console.log('Component               | Status   | Details');
  console.log(halfLine);
  
  for (const check of checks) {
    const component = check.component.padEnd(22);
    const status = check.status === 'FOUND' ? '✅ FOUND' : 
                   check.status === 'MISSING' ? '⚠️ MISSING' : '❌ ERROR';
    const details = check.details.substring(0, 50) + (check.details.length > 50 ? '...' : '');
    
    console.log(`${component} | ${status}  | ${details}`);
  }
  
  // Count statuses
  const found = checks.filter(c => c.status === 'FOUND').length;
  const missing = checks.filter(c => c.status === 'MISSING').length;
  const errors = checks.filter(c => c.status === 'ERROR').length;
  
  console.log(`\n📊 Environment Summary:`);
  console.log(`   ✅ Found: ${found}`);
  console.log(`   ⚠️ Missing: ${missing}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  // Determine overall status
  const hasDatabase = checks.some(c => 
    (c.component === 'Database Connection' && c.status === 'FOUND') ||
    (c.component === 'SQLite Database' && c.status === 'FOUND') ||
    (c.component === 'Docker PostgreSQL' && c.status === 'FOUND')
  );
  
  const isPostgreSQL = checks.some(c => 
    c.component === 'Database Provider' && c.details.includes('PostgreSQL')
  );
  
  console.log(`\n🎯 Current Setup:`);
  if (isPostgreSQL && hasDatabase) {
    console.log(`   ✅ PostgreSQL configured and available (RECOMMENDED)`);
  } else if (!isPostgreSQL && hasDatabase) {
    console.log(`   ⚠️ SQLite configured and available (development only)`);
  } else {
    console.log(`   ❌ Database not properly configured or unavailable`);
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  const recommendations = checks.filter(c => c.recommendation).map(c => c.recommendation);
  
  if (recommendations.length === 0) {
    console.log(`   🎉 Environment looks good!`);
  } else {
    for (let i = 0; i < recommendations.length; i++) {
      console.log(`   ${i + 1}. ${recommendations[i]}`);
    }
  }
  
  // Next steps based on setup
  console.log(`\n🚀 Next Steps:`);
  if (isPostgreSQL && hasDatabase) {
    console.log(`   1. Run validation: bun run validate:postgresql`);
    console.log(`   2. Check data: bun run seed:stats`);
    console.log(`   3. Start API: bun run start:dev`);
  } else if (isPostgreSQL && !hasDatabase) {
    console.log(`   1. Set up PostgreSQL: bun run setup:postgresql`);
    console.log(`   2. Run seed data: bun run seed`);
    console.log(`   3. Validate: bun run validate:postgresql`);
  } else if (!isPostgreSQL) {
    console.log(`   1. Switch to PostgreSQL: cp prisma/schema.postgresql.prisma prisma/schema.prisma`);
    console.log(`   2. Set up environment: bun run setup:postgresql`);
    console.log(`   3. Generate client: bunx prisma generate`);
  } else {
    console.log(`   1. Check database configuration`);
    console.log(`   2. Verify environment variables`);
    console.log(`   3. Review error messages above`);
  }
  
  console.log(`\n${line}\n`);
}

async function checkDatabaseEnvironment() {
  console.log('🔍 Checking Paramarsh SMS database environment...\n');
  
  const checks: EnvironmentCheck[] = [];
  
  // Run all checks
  checks.push(await checkSchemaConfiguration());
  checks.push(await checkDatabaseURL());
  checks.push(await checkSQLiteDatabase());
  checks.push(await checkDockerPostgreSQL());
  checks.push(await checkValidationScripts());
  checks.push(await testDatabaseConnection());
  
  displayResults(checks);
  
  // Exit code based on critical issues
  const hasCriticalErrors = checks.some(c => 
    c.status === 'ERROR' && 
    ['Database Provider', 'Database Connection'].includes(c.component)
  );
  
  process.exit(hasCriticalErrors ? 1 : 0);
}

// Export for use in other scripts
export { checkDatabaseEnvironment };
export type { EnvironmentCheck };

// Run check if called directly
if (require.main === module) {
  checkDatabaseEnvironment()
    .catch(error => {
      console.error('💥 Fatal environment check error:', error);
      process.exit(1);
    });
}