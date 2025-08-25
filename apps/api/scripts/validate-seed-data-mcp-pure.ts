#!/usr/bin/env tsx

/**
 * Paramarsh SMS Seed Data Validation Script - Pure MCP Version
 * 
 * CRITICAL: This script uses EXCLUSIVELY PostgreSQL MCP Server tools.
 * NEVER uses PrismaClient, psql command-line tool, or any direct database connections.
 * 
 * Usage:
 *   tsx scripts/validate-seed-data-mcp-pure.ts
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

// Types for validation results
interface ValidationResult {
  entity?: string;
  field?: string;
  relationship?: string;
  current?: number;
  required?: number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message?: string;
  details?: any;
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

// Configuration
const BRANCH_ID = 'branch1';
const MIN_REQUIREMENTS = {
  // Core Academic Entities
  Student: 500,
  Teacher: 30,
  Class: 10,
  Section: 20,
  Subject: 10,
  
  // Staff & Relationships
  Staff: 40,
  Guardian: 800,
  StudentGuardian: 800,
  
  // Academic Management
  AcademicYear: 1,
  Enrollment: 500,
  Exam: 20,
  ExamSession: 50,
  MarksEntry: 500,
  
  // Fee Management
  FeeStructure: 10,
  FeeComponent: 30,
  Invoice: 100,
  Payment: 50,
  
  // Attendance
  AttendanceRecord: 1000,
  AttendanceSession: 100,
  
  // Timetable
  Room: 10,
  TimeSlot: 30,
  TimetablePeriod: 200,
  
  // Communications
  Template: 10,
  Campaign: 5,
  Ticket: 10,
  
  // Other
  Application: 20
};

// Indian context validation data
const INDIAN_FIRST_NAMES = [
  'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai',
  'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari'
];

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta',
  'Joshi', 'Desai', 'Nair', 'Menon', 'Khan', 'Ahmed', 'Banerjee', 'Mukherjee'
];

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'
];

/**
 * Validate entity counts using MCP PostgreSQL Server tools
 */
async function validateEntityCounts(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🔍 Validating entity counts using MCP tools...');
  
  for (const [entity, minCount] of Object.entries(MIN_REQUIREMENTS)) {
    try {
      // Check if table exists first
      const tables = await mcp__MCP_PostgreSQL_Server__list_tables();
      if (!tables.tables.includes(entity)) {
        results.push({
          entity,
          current: 0,
          required: minCount,
          status: 'FAIL',
          message: `❌ ${entity}: Table does not exist`
        });
        continue;
      }

      // Get count using MCP query
      const countResult = await mcp__MCP_PostgreSQL_Server__query({
        query: `SELECT COUNT(*) as count FROM "${entity}" WHERE "branchId" = $1 OR "branchId" IS NULL`,
        values: [BRANCH_ID]
      });
      
      const currentCount = Number(countResult.rows[0]?.count || 0);
      const status = currentCount >= minCount ? 'PASS' : 'FAIL';
      
      results.push({
        entity,
        current: currentCount,
        required: minCount,
        status,
        message: status === 'PASS' 
          ? `✅ ${entity}: ${currentCount} records (required: ${minCount})`
          : `❌ ${entity}: ${currentCount} records (required: ${minCount})`
      });
      
      console.log(`  ${status === 'PASS' ? '✅' : '❌'} ${entity}: ${currentCount}/${minCount}`);
    } catch (error) {
      results.push({
        entity,
        current: 0,
        required: minCount,
        status: 'FAIL',
        message: `❌ ${entity}: Query failed - ${error.message}`
      });
      
      console.log(`  ❌ ${entity}: Query failed - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Validate referential integrity using MCP PostgreSQL Server tools
 */
async function validateReferentialIntegrity(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🔗 Validating referential integrity using MCP tools...');
  
  const relationshipChecks = [
    {
      name: 'StudentGuardian → Student/Guardian',
      query: `
        SELECT COUNT(*) as count 
        FROM "StudentGuardian" sg 
        LEFT JOIN "Student" s ON sg."studentId" = s.id 
        LEFT JOIN "Guardian" g ON sg."guardianId" = g.id
        WHERE s.id IS NULL OR g.id IS NULL
      `
    },
    {
      name: 'Enrollment → Student/Section',
      query: `
        SELECT COUNT(*) as count 
        FROM "Enrollment" e
        LEFT JOIN "Student" s ON e."studentId" = s.id
        LEFT JOIN "Section" sec ON e."sectionId" = sec.id
        WHERE s.id IS NULL OR sec.id IS NULL
      `
    },
    {
      name: 'Teacher → Staff',
      query: `
        SELECT COUNT(*) as count 
        FROM "Teacher" t
        LEFT JOIN "Staff" s ON t."staffId" = s.id
        WHERE s.id IS NULL
      `
    },
    {
      name: 'Invoice → Student',
      query: `
        SELECT COUNT(*) as count 
        FROM "Invoice" i
        LEFT JOIN "Student" s ON i."studentId" = s.id
        WHERE s.id IS NULL
      `
    },
    {
      name: 'Payment → Invoice',
      query: `
        SELECT COUNT(*) as count 
        FROM "Payment" p
        LEFT JOIN "Invoice" i ON p."invoiceId" = i.id
        WHERE i.id IS NULL
      `
    }
  ];
  
  for (const check of relationshipChecks) {
    try {
      const result = await mcp__MCP_PostgreSQL_Server__query({
        query: check.query
      });
      
      const orphanCount = Number(result.rows[0]?.count || 0);
      const status = orphanCount === 0 ? 'PASS' : 'FAIL';
      
      results.push({
        relationship: check.name,
        current: orphanCount,
        status,
        message: status === 'PASS' 
          ? '✅ No orphaned records found'
          : `❌ ${orphanCount} orphaned records found`
      });
      
      console.log(`  ${status === 'PASS' ? '✅' : '❌'} ${check.name}: ${orphanCount} orphans`);
    } catch (error) {
      results.push({
        relationship: check.name,
        status: 'FAIL',
        message: `❌ Integrity check failed: ${error.message}`
      });
      
      console.log(`  ❌ ${check.name}: Check failed - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Validate Indian context using MCP PostgreSQL Server tools
 */
async function validateIndianContext(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🇮🇳 Validating Indian context using MCP tools...');
  
  // Check for Hindi subject
  try {
    const hindiResult = await mcp__MCP_PostgreSQL_Server__query({
      query: `SELECT COUNT(*) as count FROM "Subject" WHERE name ILIKE '%Hindi%' OR name ILIKE '%हिंदी%'`
    });
    
    const hindiCount = Number(hindiResult.rows[0]?.count || 0);
    const status = hindiCount > 0 ? 'PASS' : 'FAIL';
    
    results.push({
      entity: 'Subject',
      field: 'Hindi',
      current: hindiCount,
      status,
      message: status === 'PASS' ? '✅ Hindi subject found' : '❌ Hindi subject missing'
    });
    
    console.log(`  ${status === 'PASS' ? '✅' : '❌'} Hindi subject: ${hindiCount} found`);
  } catch (error) {
    results.push({
      entity: 'Subject',
      field: 'Hindi',
      status: 'FAIL',
      message: `❌ Hindi validation failed: ${error.message}`
    });
    
    console.log(`  ❌ Hindi validation failed: ${error.message}`);
  }
  
  // Check for Indian names in students
  try {
    const sampleStudentsResult = await mcp__MCP_PostgreSQL_Server__query({
      query: `SELECT "firstName", "lastName" FROM "Student" WHERE "branchId" = $1 LIMIT 100`,
      values: [BRANCH_ID]
    });
    
    let indianNameCount = 0;
    for (const student of sampleStudentsResult.rows) {
      const hasIndianFirst = INDIAN_FIRST_NAMES.some(name => 
        student.firstName && student.firstName.includes(name)
      );
      const hasIndianLast = INDIAN_LAST_NAMES.some(name => 
        student.lastName && student.lastName.includes(name)
      );
      
      if (hasIndianFirst || hasIndianLast) {
        indianNameCount++;
      }
    }
    
    const indianNamePercentage = sampleStudentsResult.rows.length > 0 
      ? (indianNameCount / sampleStudentsResult.rows.length) * 100 
      : 0;
    const hasGoodIndianNames = indianNamePercentage >= 70;
    
    results.push({
      entity: 'Student',
      field: 'IndianNames',
      current: Math.round(indianNamePercentage),
      status: hasGoodIndianNames ? 'PASS' : 'WARNING',
      message: `${hasGoodIndianNames ? '✅' : '⚠️'} ${Math.round(indianNamePercentage)}% Indian names`
    });
    
    console.log(`  ${hasGoodIndianNames ? '✅' : '⚠️'} Indian names: ${Math.round(indianNamePercentage)}%`);
  } catch (error) {
    results.push({
      entity: 'Student',
      field: 'IndianNames',
      status: 'FAIL',
      message: `❌ Name validation failed: ${error.message}`
    });
    
    console.log(`  ❌ Name validation failed: ${error.message}`);
  }
  
  // Check for Indian phone numbers
  try {
    const phoneResult = await mcp__MCP_PostgreSQL_Server__query({
      query: `SELECT "phoneNumber" FROM "Guardian" WHERE "branchId" = $1 AND "phoneNumber" IS NOT NULL LIMIT 100`,
      values: [BRANCH_ID]
    });
    
    const indianPhones = phoneResult.rows.filter(g => 
      g.phoneNumber && g.phoneNumber.startsWith('+91')
    ).length;
    
    const phonePercentage = phoneResult.rows.length > 0 
      ? (indianPhones / phoneResult.rows.length) * 100 
      : 0;
    
    results.push({
      entity: 'Guardian',
      field: 'IndianPhones',
      current: Math.round(phonePercentage),
      status: phonePercentage >= 70 ? 'PASS' : 'WARNING',
      message: `${phonePercentage >= 70 ? '✅' : '⚠️'} ${Math.round(phonePercentage)}% Indian phone numbers (+91)`
    });
    
    console.log(`  ${phonePercentage >= 70 ? '✅' : '⚠️'} Indian phones: ${Math.round(phonePercentage)}%`);
  } catch (error) {
    results.push({
      entity: 'Guardian',
      field: 'IndianPhones',
      status: 'FAIL',
      message: `❌ Phone validation failed: ${error.message}`
    });
    
    console.log(`  ❌ Phone validation failed: ${error.message}`);
  }
  
  // Check for Indian cities in addresses
  try {
    const addressResult = await mcp__MCP_PostgreSQL_Server__query({
      query: `SELECT address FROM "Guardian" WHERE "branchId" = $1 AND address IS NOT NULL LIMIT 100`,
      values: [BRANCH_ID]
    });
    
    const indianAddresses = addressResult.rows.filter(g => 
      g.address && INDIAN_CITIES.some(city => g.address.includes(city))
    ).length;
    
    const addressPercentage = addressResult.rows.length > 0 
      ? (indianAddresses / addressResult.rows.length) * 100 
      : 0;
    
    results.push({
      entity: 'Guardian',
      field: 'IndianAddresses',
      current: Math.round(addressPercentage),
      status: addressPercentage >= 50 ? 'PASS' : 'WARNING',
      message: `${addressPercentage >= 50 ? '✅' : '⚠️'} ${Math.round(addressPercentage)}% Indian addresses`
    });
    
    console.log(`  ${addressPercentage >= 50 ? '✅' : '⚠️'} Indian addresses: ${Math.round(addressPercentage)}%`);
  } catch (error) {
    results.push({
      entity: 'Guardian',
      field: 'IndianAddresses',
      status: 'FAIL',
      message: `❌ Address validation failed: ${error.message}`
    });
    
    console.log(`  ❌ Address validation failed: ${error.message}`);
  }
  
  return results;
}

/**
 * Validate multi-tenancy using MCP PostgreSQL Server tools
 */
async function validateMultiTenancy(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🏫 Validating multi-tenancy using MCP tools...');
  
  const coreEntities = ['Student', 'Guardian', 'Teacher', 'Staff', 'Class', 'Section', 'Subject'];
  
  for (const entity of coreEntities) {
    try {
      const nullCountResult = await mcp__MCP_PostgreSQL_Server__query({
        query: `SELECT COUNT(*) as count FROM "${entity}" WHERE "branchId" IS NULL OR "branchId" = ''`
      });
      
      const nullCount = Number(nullCountResult.rows[0]?.count || 0);
      const status = nullCount === 0 ? 'PASS' : 'FAIL';
      
      results.push({
        entity,
        field: 'branchId',
        current: nullCount,
        status,
        message: status === 'PASS'
          ? '✅ All records have branchId'
          : `❌ ${nullCount} records missing branchId`
      });
      
      console.log(`  ${status === 'PASS' ? '✅' : '❌'} ${entity}: ${nullCount} missing branchId`);
    } catch (error) {
      results.push({
        entity,
        field: 'branchId',
        status: 'FAIL',
        message: `❌ Multi-tenancy check failed: ${error.message}`
      });
      
      console.log(`  ❌ ${entity}: Multi-tenancy check failed - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Validate data quality metrics using MCP PostgreSQL Server tools
 */
async function validateDataQuality(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('📊 Validating data quality metrics using MCP tools...');
  
  // Gender distribution
  try {
    const genderResult = await mcp__MCP_PostgreSQL_Server__query({
      query: `
        SELECT gender, COUNT(*) as count 
        FROM "Student" 
        WHERE "branchId" = $1 AND gender IS NOT NULL 
        GROUP BY gender
      `,
      values: [BRANCH_ID]
    });
    
    const genderCounts = genderResult.rows.reduce((acc: { [key: string]: number }, row: any) => {
      acc[row.gender] = Number(row.count);
      return acc;
    }, {} as { [key: string]: number });
    
    const total: number = Object.values(genderCounts as Record<string, number>).reduce((sum: number, count: number) => sum + count, 0);
    const malePercentage = total > 0 ? ((genderCounts.male || 0) / total) * 100 : 0;
    const femalePercentage = total > 0 ? ((genderCounts.female || 0) / total) * 100 : 0;
    
    const isBalanced = Math.abs(malePercentage - 50) <= 15 && Math.abs(femalePercentage - 50) <= 15;
    
    results.push({
      entity: 'Student',
      field: 'GenderDistribution',
      status: isBalanced ? 'PASS' : 'WARNING',
      message: `${isBalanced ? '✅' : '⚠️'} Gender: ${Math.round(malePercentage)}%M / ${Math.round(femalePercentage)}%F`
    });
    
    console.log(`  ${isBalanced ? '✅' : '⚠️'} Gender distribution: ${Math.round(malePercentage)}%M / ${Math.round(femalePercentage)}%F`);
  } catch (error) {
    results.push({
      entity: 'Student',
      field: 'GenderDistribution',
      status: 'FAIL',
      message: `❌ Gender distribution check failed: ${error.message}`
    });
    
    console.log(`  ❌ Gender distribution check failed: ${error.message}`);
  }
  
  // Fee collection rate
  try {
    const invoiceCountResult = await mcp__MCP_PostgreSQL_Server__query({
      query: `SELECT COUNT(*) as count FROM "Invoice" WHERE "branchId" = $1`,
      values: [BRANCH_ID]
    });
    const totalInvoices = Number(invoiceCountResult.rows[0]?.count || 0);
    
    const paidCountResult = await mcp__MCP_PostgreSQL_Server__query({
      query: `SELECT COUNT(*) as count FROM "Payment" WHERE "branchId" = $1 AND status = 'completed'`,
      values: [BRANCH_ID]
    });
    const paidInvoices = Number(paidCountResult.rows[0]?.count || 0);
    
    const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
    const isGoodCollection = collectionRate >= 10 && collectionRate <= 90;
    
    results.push({
      entity: 'Payment',
      field: 'CollectionRate',
      current: Math.round(collectionRate),
      status: isGoodCollection ? 'PASS' : 'WARNING',
      message: `${isGoodCollection ? '✅' : '⚠️'} Fee collection: ${Math.round(collectionRate)}%`
    });
    
    console.log(`  ${isGoodCollection ? '✅' : '⚠️'} Fee collection rate: ${Math.round(collectionRate)}%`);
  } catch (error) {
    results.push({
      entity: 'Payment',
      field: 'CollectionRate',
      status: 'FAIL',
      message: `❌ Collection rate check failed: ${error.message}`
    });
    
    console.log(`  ❌ Collection rate check failed: ${error.message}`);
  }
  
  return results;
}

/**
 * Calculate overall health score
 */
function calculateHealthScore(allResults: ValidationResult[]): {
  status: 'PASS' | 'FAIL' | 'WARNING';
  healthScore: number;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
} {
  const totalChecks = allResults.length;
  const passed = allResults.filter(r => r.status === 'PASS').length;
  const failed = allResults.filter(r => r.status === 'FAIL').length;
  const warnings = allResults.filter(r => r.status === 'WARNING').length;
  
  const healthScore = totalChecks > 0 ? Math.round((passed / totalChecks) * 100) : 0;
  
  let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
  if (failed > 0 || healthScore < 75) {
    status = 'FAIL';
  } else if (warnings > 0 || healthScore < 90) {
    status = 'WARNING';
  }
  
  return {
    status,
    healthScore,
    totalChecks,
    passed,
    failed,
    warnings
  };
}

/**
 * Generate comprehensive validation report
 */
function generateValidationReport(results: {
  entityCounts: ValidationResult[];
  referentialIntegrity: ValidationResult[];
  indianContext: ValidationResult[];
  multiTenancy: ValidationResult[];
  dataQuality: ValidationResult[];
}): ValidationReport {
  const allResults = [
    ...results.entityCounts,
    ...results.referentialIntegrity,
    ...results.indianContext,
    ...results.multiTenancy,
    ...results.dataQuality
  ];
  
  const overall = calculateHealthScore(allResults);
  
  const recommendations: string[] = [];
  
  // Add recommendations based on failures
  if (results.entityCounts.some(r => r.status === 'FAIL')) {
    recommendations.push('Increase seed data volume for entities below minimum requirements');
  }
  
  if (results.referentialIntegrity.some(r => r.status === 'FAIL')) {
    recommendations.push('Fix referential integrity issues before production use');
  }
  
  if (results.indianContext.some(r => r.status !== 'PASS')) {
    recommendations.push('Enhance Indian cultural context in names, subjects, and addresses');
  }
  
  if (results.multiTenancy.some(r => r.status === 'FAIL')) {
    recommendations.push('Ensure all records have proper branchId for multi-tenancy');
  }
  
  if (overall.healthScore < 90) {
    recommendations.push('Overall health score below 90% - consider comprehensive data review');
  }
  
  return {
    timestamp: new Date().toISOString(),
    database: 'postgresql',
    branchId: BRANCH_ID,
    overall,
    entityCounts: results.entityCounts,
    referentialIntegrity: results.referentialIntegrity,
    indianContext: results.indianContext,
    multiTenancy: results.multiTenancy,
    dataQuality: results.dataQuality,
    recommendations
  };
}

/**
 * Display validation report
 */
function displayValidationReport(report: ValidationReport) {
  const line = '='.repeat(80);
  const halfLine = '─'.repeat(80);
  
  console.log(`\n${line}`);
  console.log('              PARAMARSH SMS DATA VALIDATION REPORT (PURE MCP)');
  console.log(`                              Generated: ${report.timestamp.split('T')[0]}`);
  console.log(`${line}\n`);
  
  // Overall Status
  const statusIcon = report.overall.status === 'PASS' ? '🎯' : 
                    report.overall.status === 'WARNING' ? '⚠️' : '❌';
  
  console.log(`${statusIcon} OVERALL ASSESSMENT`);
  console.log(`${halfLine}`);
  console.log(`Health Score: ${report.overall.healthScore}/100`);
  console.log(`Status: ${report.overall.status === 'PASS' ? '✅ READY FOR PRODUCTION' : 
               report.overall.status === 'WARNING' ? '⚠️ NEEDS ATTENTION' : 
               '❌ REQUIRES FIXES'}`);
  console.log(`Total Checks: ${report.overall.totalChecks}`);
  console.log(`Passed: ${report.overall.passed} | Failed: ${report.overall.failed} | Warnings: ${report.overall.warnings}\n`);
  
  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(`💡 RECOMMENDATIONS`);
    console.log(halfLine);
    
    for (let i = 0; i < report.recommendations.length; i++) {
      console.log(`${i + 1}. ${report.recommendations[i]}`);
    }
    console.log('');
  }
  
  console.log(`${line}`);
  console.log(`🔧 VALIDATION METHOD: PostgreSQL MCP Server tools exclusively`);
  console.log(`🏆 FINAL VERDICT: ${report.overall.status === 'PASS' ? 
    'Database is ready for production demos!' :
    report.overall.status === 'WARNING' ? 
    'Database is usable but has areas for improvement.' :
    'Database requires fixes before production use.'}`);
  console.log(`${line}\n`);
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
  const filename = `seed-validation-mcp-pure-${timestamp}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`💾 Validation report saved to: ${filepath}`);
}

/**
 * Main validation function using pure MCP tools
 */
async function validateSeedData(): Promise<ValidationReport> {
  console.log('🚀 Starting Paramarsh SMS seed data validation (Pure MCP)...');
  console.log(`📍 Target Branch: ${BRANCH_ID}`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}\n`);
  
  try {
    // Check database connection
    console.log('🏥 Checking database connection...');
    const dbInfo = await mcp__MCP_PostgreSQL_Server__db_info();
    console.log(`✅ Database connected: ${JSON.stringify(dbInfo, null, 2)}\n`);
    
    // Run all validations using MCP tools
    const entityCounts = await validateEntityCounts();
    const referentialIntegrity = await validateReferentialIntegrity();
    const indianContext = await validateIndianContext();
    const multiTenancy = await validateMultiTenancy();
    const dataQuality = await validateDataQuality();
    
    // Generate comprehensive report
    const report = generateValidationReport({
      entityCounts,
      referentialIntegrity,
      indianContext,
      multiTenancy,
      dataQuality
    });
    
    // Display and save report
    displayValidationReport(report);
    await saveValidationReport(report);
    
    return report;
    
  } catch (error: any) {
    console.error('❌ MCP validation failed:', error.message);
    throw error;
  }
}

// Run validation if called directly
if (require.main === module) {
  validateSeedData()
    .then(report => {
      const exitCode = report.overall.status === 'FAIL' ? 1 : 0;
      console.log(`\n🎉 Pure MCP validation completed with health score: ${report.overall.healthScore}%`);
      console.log(`🔧 All operations performed via PostgreSQL MCP Server tools`);
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export {
  validateSeedData
};

export type {
  ValidationResult,
  ValidationReport
};