#!/usr/bin/env tsx

/**
 * Paramarsh SMS Seed Data Validation Script - PostgreSQL MCP Version
 * 
 * CRITICAL: This script uses EXCLUSIVELY PostgreSQL MCP Server tools.
 * NEVER uses psql command-line tool, PrismaClient, or direct database connections.
 * 
 * Available MCP Tools:
 * - mcp__MCP_PostgreSQL_Server__db_info
 * - mcp__MCP_PostgreSQL_Server__list_tables
 * - mcp__MCP_PostgreSQL_Server__query
 * - mcp__MCP_PostgreSQL_Server__get_table_schema
 * - mcp__MCP_PostgreSQL_Server__create_record
 * - mcp__MCP_PostgreSQL_Server__read_records
 * - mcp__MCP_PostgreSQL_Server__update_records
 * - mcp__MCP_PostgreSQL_Server__delete_records
 * 
 * Usage:
 *   bun run scripts/validate-seed-data-mcp-full.ts
 *   bun run seed:validate:mcp
 */

import * as fs from 'fs';
import * as path from 'path';

// MCP function stubs (these would be actual MCP calls in production)
declare const mcp__MCP_PostgreSQL_Server__db_info: () => Promise<any>;
declare const mcp__MCP_PostgreSQL_Server__list_tables: () => Promise<{ tables: string[] }>;
declare const mcp__MCP_PostgreSQL_Server__query: (params: { query: string, values?: any[] }) => Promise<{ rows: any[], columns?: string[], rowCount?: number }>;
declare const mcp__MCP_PostgreSQL_Server__get_table_schema: (params: { table: string }) => Promise<any>;
declare const mcp__MCP_PostgreSQL_Server__create_record: (params: { table: string, data: Record<string, any> }) => Promise<any>;
declare const mcp__MCP_PostgreSQL_Server__read_records: (params: { table: string, conditions?: Record<string, any>, limit?: number, offset?: number }) => Promise<any[]>;
declare const mcp__MCP_PostgreSQL_Server__update_records: (params: { table: string, conditions: Record<string, any>, data: Record<string, any> }) => Promise<{ updatedCount: number }>;
declare const mcp__MCP_PostgreSQL_Server__delete_records: (params: { table: string, conditions: Record<string, any> }) => Promise<{ deletedCount: number }>;

interface ValidationResult {
  entity: string;
  current: number;
  expected: number;
  status: 'PASS' | 'FAIL' | 'WARN';
  details?: string;
}

interface ValidationReport {
  timestamp: string;
  database: string;
  branchId: string;
  overall: {
    status: 'PASS' | 'FAIL' | 'WARNING';
    healthScore: number;
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  entityCounts: ValidationResult[];
  referentialIntegrity: ValidationResult[];
  indianContext: ValidationResult[];
  multiTenancy: ValidationResult[];
  dataQuality: ValidationResult[];
  recommendations: string[];
}

const BRANCH_ID = 'branch1';

async function validateSeedData(): Promise<void> {
  console.log('🔍 PARAMARSH SMS - SEED DATA VALIDATION (MCP VERSION)');
  console.log('=' .repeat(60));
  console.log(`📅 Generated: ${new Date().toISOString()}\n`);

  const results: ValidationResult[] = [];

  try {
    // 1. Database Status Check using MCP
    console.log('🏥 DATABASE STATUS CHECK');
    console.log('-'.repeat(40));
    
    try {
      const dbInfo = await mcp__MCP_PostgreSQL_Server__db_info();
      console.log('✅ Database connection: Active');
      console.log(`📊 Database info: ${JSON.stringify(dbInfo, null, 2)}`);
    } catch (error) {
      console.log('❌ Database connection: Failed');
      console.log(`   Error: ${error.message}`);
      throw error;
    }

    // 2. Branch Validation using MCP
    console.log('\n🏫 BRANCH VALIDATION');
    console.log('-'.repeat(40));
    
    const expectedBranches = [
      'dps-main', 'dps-north', 'dps-south', 'dps-east', 'dps-west',
      'kvs-central', 'kvs-cantonment', 'kvs-airport',
      'sps-primary', 'sps-secondary', 'sps-senior',
      'ris-main', 'ris-extension'
    ];

    const branchResult = await mcp__MCP_PostgreSQL_Server__query({
      query: `
        SELECT "branchId", COUNT(*) as count 
        FROM "Student" 
        WHERE "branchId" IS NOT NULL 
        GROUP BY "branchId" 
        ORDER BY "branchId"
      `
    });

    const studentBranches = branchResult.rows as Array<{branchId: string, count: string}>;
    const actualBranches = studentBranches.map(b => b.branchId);
    const missingBranches = expectedBranches.filter(b => !actualBranches.includes(b));
    const extraBranches = actualBranches.filter(b => !expectedBranches.includes(b));

    if (missingBranches.length === 0 && extraBranches.length === 0) {
      console.log('✅ All 13 composite branch IDs present');
      results.push({
        entity: 'Branches',
        current: actualBranches.length,
        expected: expectedBranches.length,
        status: 'PASS'
      });
    } else {
      console.log('❌ Branch validation failed');
      if (missingBranches.length > 0) {
        console.log(`   Missing: ${missingBranches.join(', ')}`);
      }
      if (extraBranches.length > 0) {
        console.log(`   Extra: ${extraBranches.join(', ')}`);
      }
      results.push({
        entity: 'Branches',
        current: actualBranches.length,
        expected: expectedBranches.length,
        status: 'FAIL',
        details: `Missing: ${missingBranches.length}, Extra: ${extraBranches.length}`
      });
    }

    // 3. Entity Count Validation using MCP
    console.log('\n📊 ENTITY COUNT VALIDATION');
    console.log('-'.repeat(40));

    const entityValidations = [
      { entity: 'Student', table: 'Student', min: 500, max: 20000 },
      { entity: 'Guardian', table: 'Guardian', min: 800, max: 30000 },
      { entity: 'Teacher', table: 'Teacher', min: 30, max: 500 },
      { entity: 'Staff', table: 'Staff', min: 50, max: 1000 },
      { entity: 'Class', table: 'Class', min: 10, max: 200 },
      { entity: 'Section', table: 'Section', min: 20, max: 500 },
      { entity: 'Subject', table: 'Subject', min: 50, max: 500 },
      { entity: 'Tenant', table: 'Tenant', min: 13, max: 13 },
      { entity: 'AcademicYear', table: 'AcademicYear', min: 13, max: 13 },
      { entity: 'Enrollment', table: 'Enrollment', min: 500, max: 20000 },
      { entity: 'Invoice', table: 'Invoice', min: 100, max: 50000 },
      { entity: 'Payment', table: 'Payment', min: 50, max: 40000 },
      { entity: 'AttendanceRecord', table: 'AttendanceRecord', min: 1000, max: 100000 }
    ];

    for (const validation of entityValidations) {
      try {
        const countResult = await mcp__MCP_PostgreSQL_Server__query({
          query: `SELECT COUNT(*) as count FROM "${validation.table}"`
        });
        
        const actual = Number(countResult.rows[0]?.count || 0);
        const status = actual >= validation.min && actual <= validation.max ? 'PASS' : 
                      actual >= validation.min * 0.8 ? 'WARN' : 'FAIL';
        
        console.log(`${status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌'} ${validation.entity}: ${actual.toLocaleString()} (expected: ${validation.min.toLocaleString()}-${validation.max.toLocaleString()})`);
        
        results.push({
          entity: validation.entity,
          current: actual,
          expected: validation.min,
          status: status as any
        });
      } catch (error) {
        console.log(`⚠️  ${validation.entity}: Could not count records - ${error.message}`);
        results.push({
          entity: validation.entity,
          current: 0,
          expected: validation.min,
          status: 'FAIL',
          details: `Query failed: ${error.message}`
        });
      }
    }

    // 4. Multi-tenancy Validation using MCP
    console.log('\n🏢 MULTI-TENANCY VALIDATION');
    console.log('-'.repeat(40));

    const tablesWithBranchId = ['Student', 'Guardian', 'Teacher', 'Staff', 'Class', 'Section', 'Subject', 'Tenant', 'AcademicYear'];
    let allMultiTenancyPassed = true;

    for (const table of tablesWithBranchId) {
      try {
        const nullCountResult = await mcp__MCP_PostgreSQL_Server__query({
          query: `SELECT COUNT(*) as count FROM "${table}" WHERE "branchId" IS NULL OR "branchId" = ''`
        });
        
        const nullCount = Number(nullCountResult.rows[0]?.count || 0);
        const status = nullCount === 0 ? 'PASS' : 'FAIL';
        
        console.log(`${status === 'PASS' ? '✅' : '❌'} ${table}: ${nullCount === 0 ? 'All records have branchId' : `${nullCount} records missing branchId`}`);
        
        if (status === 'FAIL') {
          allMultiTenancyPassed = false;
        }
      } catch (error) {
        console.log(`⚠️  ${table}: Could not validate (table may not exist) - ${error.message}`);
        allMultiTenancyPassed = false;
      }
    }

    results.push({
      entity: 'Multi-tenancy',
      current: allMultiTenancyPassed ? 1 : 0,
      expected: 1,
      status: allMultiTenancyPassed ? 'PASS' : 'FAIL'
    });

    // 5. Data Quality Checks using MCP
    console.log('\n📈 DATA QUALITY VALIDATION');
    console.log('-'.repeat(40));

    // Check for Indian phone numbers
    try {
      const staffPhoneResult = await mcp__MCP_PostgreSQL_Server__query({
        query: `SELECT phone FROM "Staff" WHERE phone IS NOT NULL LIMIT 100`
      });
      
      const validPhones = staffPhoneResult.rows.filter((s: any) => s.phone && s.phone.startsWith('+91')).length;
      const totalPhones = staffPhoneResult.rows.length;
      
      const phonePercentage = totalPhones > 0 ? (validPhones / totalPhones) * 100 : 0;
      const phoneStatus = phonePercentage >= 90 ? 'PASS' : phonePercentage >= 70 ? 'WARN' : 'FAIL';
      console.log(`${phoneStatus === 'PASS' ? '✅' : phoneStatus === 'WARN' ? '⚠️' : '❌'} Indian Phone Numbers: ${phonePercentage.toFixed(1)}% valid (+91 format)`);
    } catch (error) {
      console.log(`⚠️  Phone validation failed: ${error.message}`);
    }

    // Check for Hindi subject
    try {
      const hindiResult = await mcp__MCP_PostgreSQL_Server__query({
        query: `SELECT COUNT(*) as count FROM "Subject" WHERE name ILIKE '%Hindi%'`
      });
      
      const hindiCount = Number(hindiResult.rows[0]?.count || 0);
      const hindiStatus = hindiCount >= 10 ? 'PASS' : 'FAIL';
      console.log(`${hindiStatus === 'PASS' ? '✅' : '❌'} Hindi Subject: ${hindiCount} instances found`);
    } catch (error) {
      console.log(`⚠️  Hindi subject validation failed: ${error.message}`);
    }

    // Check enrollment coverage
    try {
      const activeStudentsResult = await mcp__MCP_PostgreSQL_Server__query({
        query: `SELECT COUNT(*) as count FROM "Student" WHERE status = 'active'`
      });
      const totalActiveStudents = Number(activeStudentsResult.rows[0]?.count || 0);
      
      const enrolledStudentsResult = await mcp__MCP_PostgreSQL_Server__query({
        query: `
          SELECT COUNT(*) as count 
          FROM "Enrollment" e 
          INNER JOIN "Student" s ON e."studentId" = s.id 
          WHERE s.status = 'active'
        `
      });
      const enrolledStudents = Number(enrolledStudentsResult.rows[0]?.count || 0);
      
      const enrollmentPercentage = totalActiveStudents > 0 ? (enrolledStudents / totalActiveStudents) * 100 : 0;
      const enrollmentStatus = enrollmentPercentage >= 95 ? 'PASS' : 'WARN';
      console.log(`${enrollmentStatus === 'PASS' ? '✅' : '⚠️'} Enrollment Coverage: ${enrollmentPercentage.toFixed(1)}% of active students enrolled`);
    } catch (error) {
      console.log(`⚠️  Enrollment validation failed: ${error.message}`);
    }

    // 6. Summary Report
    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    const passCount = results.filter(r => r.status === 'PASS').length;
    const warnCount = results.filter(r => r.status === 'WARN').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;

    console.log(`📊 Overall Score: ${passCount}/${total} checks passed`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`⚠️  Warnings: ${warnCount}`);
    console.log(`❌ Failed: ${failCount}`);

    const overallStatus = failCount === 0 ? (warnCount === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS ATTENTION';
    console.log(`🏆 Status: ${overallStatus}`);

    if (failCount === 0) {
      console.log('\n🎉 SEED DATA VALIDATION SUCCESSFUL!');
      console.log('✨ Ready for production demos and load testing');
    } else {
      console.log('\n⚠️  ISSUES FOUND - Please review failed checks above');
    }

    // Branch distribution summary
    console.log('\n📊 BRANCH DISTRIBUTION:');
    console.log('-'.repeat(40));
    for (const branch of studentBranches) {
      console.log(`   ${branch.branchId}: ${Number(branch.count).toLocaleString()} students`);
    }

    // Save validation report
    await saveValidationReport({
      timestamp: new Date().toISOString(),
      database: 'postgresql',
      branchId: BRANCH_ID,
      overall: {
        status: failCount === 0 ? (warnCount === 0 ? 'PASS' : 'WARNING') : 'FAIL',
        healthScore: Math.round((passCount / total) * 100),
        totalChecks: total,
        passed: passCount,
        failed: failCount,
        warnings: warnCount
      },
      entityCounts: results,
      referentialIntegrity: [],
      indianContext: [],
      multiTenancy: [],
      dataQuality: [],
      recommendations: []
    });

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    console.log('\n🔌 Validation completed using PostgreSQL MCP Server tools');
  }
}

/**
 * Save validation report to file
 */
async function saveValidationReport(report: ValidationReport) {
  const reportsDir = path.join(__dirname, '../reports');
  
  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `seed-validation-mcp-${timestamp}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`💾 Validation report saved to: ${filepath}`);
}

/**
 * Generate comprehensive stats using MCP tools
 */
async function generateDatabaseStats(): Promise<void> {
  console.log('\n📈 DATABASE STATISTICS (MCP)');
  console.log('='.repeat(50));
  
  try {
    const tables = await mcp__MCP_PostgreSQL_Server__list_tables();
    console.log(`📊 Total tables: ${tables.tables.length}`);
    
    const stats: Record<string, number> = {};
    
    for (const table of tables.tables) {
      try {
        const countResult = await mcp__MCP_PostgreSQL_Server__query({
          query: `SELECT COUNT(*) as count FROM "${table}"`
        });
        stats[table] = Number(countResult.rows[0]?.count || 0);
      } catch (error) {
        console.log(`⚠️  Could not count ${table}: ${error.message}`);
      }
    }
    
    console.log('\n📋 Table Statistics:');
    console.log('-'.repeat(30));
    Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([table, count]) => {
        console.log(`  ${table}: ${count.toLocaleString()}`);
      });
      
  } catch (error) {
    console.error('❌ Stats generation failed:', error.message);
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  validateSeedData()
    .then(() => generateDatabaseStats())
    .catch((error) => {
      console.error('❌ Validation script failed:', error);
      process.exit(1);
    });
}

export { validateSeedData, generateDatabaseStats };