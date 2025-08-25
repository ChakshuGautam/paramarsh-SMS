#!/usr/bin/env bun
/**
 * Paramarsh SMS PostgreSQL Complete Seed Data Validation Script
 * 
 * This script validates ALL 45 tables from the schema using PostgreSQL with Prisma client.
 * Works with Docker PostgreSQL setup and checks every single table.
 * 
 * Usage:
 *   bun run scripts/validate-postgresql-seed-data.ts
 *   bun run validate:postgresql
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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
  branchId?: string;
}

interface ValidationReport {
  timestamp: string;
  database: string;
  totalBranches: number;
  branchBreakdown: Record<string, any>;
  overall: {
    status: 'PASS' | 'FAIL' | 'WARNING';
    healthScore: number;
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
    emptyTables: number;
  };
  entityCounts: ValidationResult[];
  branchWiseBreakdown: ValidationResult[];
  referentialIntegrity: ValidationResult[];
  indianContext: ValidationResult[];
  multiTenancy: ValidationResult[];
  dataQuality: ValidationResult[];
  recommendations: string[];
}

// ALL 45 TABLES FROM SCHEMA - COMPREHENSIVE POSTGRESQL LIST
const ALL_SCHEMA_TABLES = [
  'AcademicYear', 'Application', 'AttendanceRecord', 'AttendanceSession', 'AuditLog',
  'Campaign', 'Class', 'Enrollment', 'Exam', 'ExamSession', 'ExamTemplate',
  'FeeComponent', 'FeeSchedule', 'FeeStructure', 'GradingScale', 'Guardian',
  'Invoice', 'Mark', 'MarksEntry', 'Message', 'Payment', 'Preference',
  'Room', 'RoomConstraint', 'Section', 'Staff', 'Student', 'StudentGuardian',
  'StudentPeriodAttendance', 'Subject', 'SubjectConstraint', 'Substitution',
  'Teacher', 'TeacherAttendance', 'TeacherConstraint', 'TeacherDailyAttendance',
  'Template', 'Tenant', 'Ticket', 'TicketAttachment', 'TicketMessage',
  'TimeSlot', 'TimeSlotConstraint', 'TimetablePeriod', 'TimetableTemplate'
];

// Expected composite branch IDs for multi-tenancy
const EXPECTED_BRANCH_IDS = [
  'dps-main', 'dps-north', 'dps-south', 'dps-east', 'dps-west',
  'kvs-central', 'kvs-cantonment', 'kvs-airport',
  'sps-primary', 'sps-secondary', 'sps-senior',
  'ris-main', 'ris-extension'
];

// Minimum requirements per table (TOTAL across all 13 branches)
const MIN_REQUIREMENTS_TOTAL = {
  // Core Academic Entities
  Student: 1500,     // ~115 per branch average
  Teacher: 400,      // ~30 per branch average
  Staff: 500,        // ~40 per branch average
  Class: 130,        // ~10 per branch average
  Section: 260,      // ~20 per branch average
  Subject: 130,      // ~10 per branch average
  Guardian: 2500,    // ~190 per branch average
  StudentGuardian: 2500, // ~190 per branch average
  
  // Academic Management
  AcademicYear: 13,  // 1 per branch
  Enrollment: 1500,  // Match students
  Exam: 260,         // ~20 per branch
  ExamSession: 650,  // ~50 per branch
  ExamTemplate: 50,  // System templates
  MarksEntry: 6500,  // ~500 per branch
  Mark: 6500,        // Comprehensive marks
  
  // Fee Management
  FeeStructure: 130,  // ~10 per branch
  FeeComponent: 390,  // ~30 per branch
  FeeSchedule: 130,   // ~10 per branch
  Invoice: 1300,      // ~100 per branch
  Payment: 650,       // ~50 per branch
  
  // Attendance System
  AttendanceRecord: 13000,      // ~1000 per branch
  AttendanceSession: 1300,      // ~100 per branch
  StudentPeriodAttendance: 13000, // Period-wise attendance
  
  // Timetable & Scheduling
  Room: 130,                    // ~10 per branch
  TimeSlot: 390,                // ~30 per branch
  TimetablePeriod: 2600,        // ~200 per branch
  TimetableTemplate: 26,        // ~2 per branch
  Substitution: 130,            // ~10 per branch
  
  // Teacher Management
  TeacherAttendance: 2600,      // ~200 per branch
  TeacherDailyAttendance: 2600, // Daily records
  TeacherConstraint: 260,       // ~20 per branch
  
  // Constraints & Rules
  SubjectConstraint: 130,       // ~10 per branch
  RoomConstraint: 130,          // ~10 per branch
  TimeSlotConstraint: 390,      // ~30 per branch
  
  // Communications
  Template: 130,      // ~10 per branch
  Campaign: 65,       // ~5 per branch
  Message: 650,       // ~50 per branch
  Preference: 1300,   // User preferences
  Ticket: 130,        // ~10 per branch
  TicketMessage: 260, // ~20 per branch
  TicketAttachment: 65, // ~5 per branch
  
  // System & Auditing
  Tenant: 13,         // 1 per branch (CRITICAL)
  Application: 260,   // ~20 per branch
  GradingScale: 26,   // ~2 per branch
  AuditLog: 1300      // System logs
};

// Indian context validation data
const INDIAN_NAMES = {
  first: ['Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai', 'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari'],
  last: ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta', 'Joshi', 'Desai', 'Nair', 'Menon', 'Khan', 'Ahmed', 'Banerjee', 'Mukherjee']
};

const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

/**
 * VALIDATE ALL 45 TABLES FROM POSTGRESQL SCHEMA - COMPREHENSIVE CHECK
 */
async function validateEntityCounts(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  let emptyTableCount = 0;
  
  console.log('🔍 Validating ALL 45 PostgreSQL table entity counts...');
  console.log('📊 Checking every single table from the schema...\n');
  
  // Map table names to Prisma model methods - PostgreSQL compatible
  const tableToModel: Record<string, () => Promise<number>> = {
    AcademicYear: () => prisma.academicYear.count(),
    Application: () => prisma.application.count(),
    AttendanceRecord: () => prisma.attendanceRecord.count(),
    AttendanceSession: () => prisma.attendanceSession.count(),
    AuditLog: () => prisma.auditLog.count(),
    Campaign: () => prisma.campaign.count(),
    Class: () => prisma.class.count(),
    Enrollment: () => prisma.enrollment.count(),
    Exam: () => prisma.exam.count(),
    ExamSession: () => prisma.examSession.count(),
    ExamTemplate: () => prisma.examTemplate.count(),
    FeeComponent: () => prisma.feeComponent.count(),
    FeeSchedule: () => prisma.feeSchedule.count(),
    FeeStructure: () => prisma.feeStructure.count(),
    GradingScale: () => prisma.gradingScale.count(),
    Guardian: () => prisma.guardian.count(),
    Invoice: () => prisma.invoice.count(),
    Mark: () => prisma.mark.count(),
    MarksEntry: () => prisma.marksEntry.count(),
    Message: () => prisma.message.count(),
    Payment: () => prisma.payment.count(),
    Preference: () => prisma.preference.count(),
    Room: () => prisma.room.count(),
    RoomConstraint: () => prisma.roomConstraint.count(),
    Section: () => prisma.section.count(),
    Staff: () => prisma.staff.count(),
    Student: () => prisma.student.count(),
    StudentGuardian: () => prisma.studentGuardian.count(),
    StudentPeriodAttendance: () => prisma.studentPeriodAttendance.count(),
    Subject: () => prisma.subject.count(),
    SubjectConstraint: () => prisma.subjectConstraint.count(),
    Substitution: () => prisma.substitution.count(),
    Teacher: () => prisma.teacher.count(),
    TeacherAttendance: () => prisma.teacherAttendance.count(),
    TeacherConstraint: () => prisma.teacherConstraint.count(),
    TeacherDailyAttendance: () => prisma.teacherDailyAttendance.count(),
    Template: () => prisma.template.count(),
    Tenant: () => prisma.tenant.count(),
    Ticket: () => prisma.ticket.count(),
    TicketAttachment: () => prisma.ticketAttachment.count(),
    TicketMessage: () => prisma.ticketMessage.count(),
    TimeSlot: () => prisma.timeSlot.count(),
    TimeSlotConstraint: () => prisma.timeSlotConstraint.count(),
    TimetablePeriod: () => prisma.timetablePeriod.count(),
    TimetableTemplate: () => prisma.timetableTemplate.count()
  };
  
  // Check ALL 45 tables from PostgreSQL schema
  for (const tableName of ALL_SCHEMA_TABLES) {
    try {
      const countFunction = tableToModel[tableName];
      if (!countFunction) {
        console.log(`  ⚠️ MISSING: ${tableName} - No Prisma model mapping found`);
        results.push({
          entity: tableName,
          current: 0,
          required: 1,
          status: 'FAIL',
          message: `❌ ERROR: ${tableName} - No Prisma model mapping found`
        });
        emptyTableCount++;
        continue;
      }
      
      const totalCount = await countFunction();
      const minCount = MIN_REQUIREMENTS_TOTAL[tableName as keyof typeof MIN_REQUIREMENTS_TOTAL] || 1;
      const isEmpty = totalCount === 0;
      const status = isEmpty ? 'FAIL' : (totalCount >= minCount ? 'PASS' : 'WARNING');
      
      if (isEmpty) {
        emptyTableCount++;
        console.log(`  ❌ EMPTY: ${tableName} - 0 records (CRITICAL BUG!)`);
      } else if (status === 'PASS') {
        console.log(`  ✅ GOOD: ${tableName} - ${totalCount} records (min: ${minCount})`);
      } else {
        console.log(`  ⚠️ LOW: ${tableName} - ${totalCount} records (min: ${minCount})`);
      }
      
      results.push({
        entity: tableName,
        current: totalCount,
        required: minCount,
        status,
        message: isEmpty 
          ? `❌ CRITICAL: ${tableName} is EMPTY - seed data missing!`
          : status === 'PASS'
            ? `✅ ${tableName}: ${totalCount} records`
            : `⚠️ ${tableName}: ${totalCount} records (recommend: ${minCount})`
      });
      
    } catch (error: any) {
      console.log(`  💥 ERROR: ${tableName} - ${error.message}`);
      results.push({
        entity: tableName,
        current: 0,
        required: 1,
        status: 'FAIL',
        message: `❌ ERROR: ${tableName} - ${error.message}`
      });
      emptyTableCount++;
    }
  }
  
  console.log(`\n📋 SUMMARY: ${ALL_SCHEMA_TABLES.length} tables checked`);
  console.log(`🎯 Tables with data: ${ALL_SCHEMA_TABLES.length - emptyTableCount}`);
  console.log(`❌ Empty tables: ${emptyTableCount} ${emptyTableCount > 0 ? '(CRITICAL BUGS!)' : ''}`);
  
  return results;
}

/**
 * Validate referential integrity for PostgreSQL
 */
async function validateReferentialIntegrity(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🔗 Validating PostgreSQL referential integrity...');
  
  // Check Student-Guardian relationships
  const studentsWithoutGuardians = await prisma.student.count({
    where: {
      guardians: {
        none: {}
      }
    }
  });
  
  results.push({
    relationship: 'Student → Guardian',
    current: studentsWithoutGuardians,
    status: studentsWithoutGuardians === 0 ? 'PASS' : 'WARNING',
    message: studentsWithoutGuardians === 0 
      ? '✅ All students have guardians'
      : `⚠️ ${studentsWithoutGuardians} students without guardians`
  });
  
  // Check Teacher-Staff relationships
  const teachersWithoutStaff = await prisma.teacher.count({
    where: {
      staff: null
    }
  });
  
  results.push({
    relationship: 'Teacher → Staff',
    current: teachersWithoutStaff,
    status: teachersWithoutStaff === 0 ? 'PASS' : 'FAIL',
    message: teachersWithoutStaff === 0
      ? '✅ All teachers have staff records'
      : `❌ ${teachersWithoutStaff} teachers without staff records`
  });
  
  // Check Enrollment integrity
  const enrollmentsWithoutStudentOrSection = await prisma.enrollment.count({
    where: {
      OR: [
        { student: null },
        { section: null }
      ]
    }
  });
  
  results.push({
    relationship: 'Enrollment → Student/Section',
    current: enrollmentsWithoutStudentOrSection,
    status: enrollmentsWithoutStudentOrSection === 0 ? 'PASS' : 'FAIL',
    message: enrollmentsWithoutStudentOrSection === 0
      ? '✅ All enrollments have valid student and section'
      : `❌ ${enrollmentsWithoutStudentOrSection} enrollments with missing student/section`
  });
  
  console.log(`  ${results[0].status === 'PASS' ? '✅' : results[0].status === 'WARNING' ? '⚠️' : '❌'} Student-Guardian integrity`);
  console.log(`  ${results[1].status === 'PASS' ? '✅' : '❌'} Teacher-Staff integrity`);
  console.log(`  ${results[2].status === 'PASS' ? '✅' : '❌'} Enrollment integrity`);
  
  return results;
}

/**
 * Generate PostgreSQL branch-wise breakdown
 */
async function generateBranchWiseBreakdown(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🏢 Generating PostgreSQL branch-wise breakdown...');
  
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true }
  });
  
  console.log(`Found ${tenants.length} branches to analyze:`);
  
  for (const tenant of tenants) {
    const branchId = tenant.id;
    
    try {
      // Get key metrics for each branch using PostgreSQL-compatible queries
      const students = await prisma.student.count({ where: { branchId } });
      const teachers = await prisma.teacher.count({ where: { branchId } });
      const staff = await prisma.staff.count({ where: { branchId } });
      const classes = await prisma.class.count({ where: { branchId } });
      const sections = await prisma.section.count({ where: { branchId } });
      
      const total = students + teachers + staff + classes + sections;
      const status = total > 0 ? 'PASS' : 'FAIL';
      
      results.push({
        entity: 'BranchBreakdown',
        branchId,
        current: total,
        status,
        message: `${branchId}: ${students}S, ${teachers}T, ${staff}St, ${classes}C, ${sections}Sec`,
        details: { students, teachers, staff, classes, sections }
      });
      
      console.log(`  ${status === 'PASS' ? '✅' : '❌'} ${branchId}: ${total} total records`);
    } catch (error: any) {
      console.log(`  💥 ERROR analyzing ${branchId}: ${error.message}`);
      results.push({
        entity: 'BranchBreakdown',
        branchId,
        current: 0,
        status: 'FAIL',
        message: `❌ ERROR: ${branchId} - ${error.message}`
      });
    }
  }
  
  return results;
}

/**
 * Validate Indian context for PostgreSQL
 */
async function validateIndianContext(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🇮🇳 Validating Indian context in PostgreSQL...');
  
  // Check for Hindi subject
  const hindiSubject = await prisma.subject.findFirst({
    where: {
      OR: [
        { name: { contains: 'Hindi', mode: 'insensitive' } },
        { name: { contains: 'हिंदी' } }
      ]
    }
  });
  
  results.push({
    entity: 'Subject',
    field: 'Hindi',
    status: hindiSubject ? 'PASS' : 'FAIL',
    message: hindiSubject ? '✅ Hindi subject found' : '❌ Hindi subject missing'
  });
  
  // Check for composite branch IDs
  const compositeBranches = await prisma.tenant.count({
    where: {
      id: { contains: '-' }  // dps-main, kvs-central, etc.
    }
  });
  
  results.push({
    entity: 'Tenant',
    field: 'CompositeIDs',
    current: compositeBranches,
    required: 13,
    status: compositeBranches >= 13 ? 'PASS' : 'WARNING',
    message: `${compositeBranches >= 13 ? '✅' : '⚠️'} ${compositeBranches}/13 composite branch IDs`
  });
  
  // Sample student names for Indian validation
  const sampleStudents = await prisma.student.findMany({
    take: 100,
    select: { firstName: true, lastName: true }
  });
  
  let indianNameCount = 0;
  for (const student of sampleStudents) {
    const hasIndianFirst = INDIAN_NAMES.first.some(name => 
      student.firstName?.toLowerCase().includes(name.toLowerCase()) || false
    );
    const hasIndianLast = INDIAN_NAMES.last.some(name => 
      student.lastName?.toLowerCase().includes(name.toLowerCase()) || false
    );
    
    if (hasIndianFirst || hasIndianLast) {
      indianNameCount++;
    }
  }
  
  const indianNamePercentage = sampleStudents.length > 0 
    ? (indianNameCount / sampleStudents.length) * 100 
    : 0;
  
  results.push({
    entity: 'Student',
    field: 'IndianNames',
    current: Math.round(indianNamePercentage),
    status: indianNamePercentage >= 60 ? 'PASS' : 'WARNING',
    message: `${indianNamePercentage >= 60 ? '✅' : '⚠️'} ${Math.round(indianNamePercentage)}% Indian names in sample`
  });
  
  console.log(`  Hindi subject: ${results[0].status}`);
  console.log(`  Composite branches: ${compositeBranches}/13`);
  console.log(`  Indian names: ${Math.round(indianNamePercentage)}%`);
  
  return results;
}

/**
 * Validate multi-tenancy for PostgreSQL
 */
async function validateMultiTenancy(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🏫 Validating PostgreSQL multi-tenancy...');
  
  // Check that all expected composite branch IDs exist
  const existingTenants = await prisma.tenant.findMany({
    select: { id: true, name: true }
  });
  
  const existingBranchIds = existingTenants.map(t => t.id);
  const missingBranches = EXPECTED_BRANCH_IDS.filter(branchId => !existingBranchIds.includes(branchId));
  
  results.push({
    entity: 'Tenant',
    field: 'CompositeBranchIDs',
    current: existingBranchIds.length,
    required: EXPECTED_BRANCH_IDS.length,
    status: missingBranches.length === 0 ? 'PASS' : 'FAIL',
    message: missingBranches.length === 0
      ? `✅ All ${EXPECTED_BRANCH_IDS.length} composite branches exist`
      : `❌ Missing branches: ${missingBranches.join(', ')}`
  });
  
  // Check for records without branchId
  const entitiesWithBranchId = [
    { name: 'Student', count: () => prisma.student.count({ where: { OR: [{ branchId: null }, { branchId: '' }] } }) },
    { name: 'Teacher', count: () => prisma.teacher.count({ where: { OR: [{ branchId: null }, { branchId: '' }] } }) },
    { name: 'Staff', count: () => prisma.staff.count({ where: { OR: [{ branchId: null }, { branchId: '' }] } }) },
    { name: 'Class', count: () => prisma.class.count({ where: { OR: [{ branchId: null }, { branchId: '' }] } }) }
  ];
  
  for (const entity of entitiesWithBranchId) {
    const missingBranchId = await entity.count();
    
    results.push({
      entity: entity.name,
      field: 'branchId',
      current: missingBranchId,
      required: 0,
      status: missingBranchId === 0 ? 'PASS' : 'FAIL',
      message: missingBranchId === 0
        ? `✅ All ${entity.name} records have branchId`
        : `❌ ${missingBranchId} ${entity.name} records missing branchId`
    });
  }
  
  console.log(`  Composite branches: ${existingBranchIds.length}/${EXPECTED_BRANCH_IDS.length}`);
  
  return results;
}

/**
 * Validate data quality for PostgreSQL
 */
async function validateDataQuality(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('📊 Validating PostgreSQL data quality...');
  
  // Gender distribution
  const totalStudents = await prisma.student.count();
  const maleStudents = await prisma.student.count({
    where: { gender: { in: ['male', 'MALE', 'M'] } }
  });
  
  const malePercentage = totalStudents > 0 ? (maleStudents / totalStudents) * 100 : 0;
  const isBalanced = Math.abs(malePercentage - 50) <= 25; // 25-75% range
  
  results.push({
    entity: 'Student',
    field: 'GenderDistribution',
    current: Math.round(malePercentage),
    status: isBalanced ? 'PASS' : 'WARNING',
    message: `${isBalanced ? '✅' : '⚠️'} Gender: ${Math.round(malePercentage)}%M / ${Math.round(100-malePercentage)}%F`
  });
  
  // Teacher-student ratio
  const totalTeachers = await prisma.teacher.count();
  const ratio = totalTeachers > 0 ? totalStudents / totalTeachers : 0;
  const isGoodRatio = ratio <= 50 && ratio > 0;
  
  results.push({
    entity: 'Teacher',
    field: 'StudentRatio',
    current: Math.round(ratio),
    status: isGoodRatio ? 'PASS' : 'WARNING',
    message: `${isGoodRatio ? '✅' : '⚠️'} Ratio: 1:${Math.round(ratio)} (${totalStudents} students, ${totalTeachers} teachers)`
  });
  
  console.log(`  Gender balance: ${Math.round(malePercentage)}%M / ${Math.round(100-malePercentage)}%F`);
  console.log(`  Teacher-student ratio: 1:${Math.round(ratio)}`);
  
  return results;
}

/**
 * Calculate overall health score
 */
function calculateHealthScore(allResults: ValidationResult[]) {
  const totalChecks = allResults.length;
  const passed = allResults.filter(r => r.status === 'PASS').length;
  const failed = allResults.filter(r => r.status === 'FAIL').length;
  const warnings = allResults.filter(r => r.status === 'WARNING').length;
  
  // Count empty tables (critical bugs)
  const emptyTables = allResults.filter(r => 
    r.entity && ALL_SCHEMA_TABLES.includes(r.entity) && r.current === 0
  ).length;
  
  const healthScore = Math.round((passed / totalChecks) * 100);
  
  let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
  
  if (emptyTables > 0 || failed > 0 || healthScore < 70) {
    status = 'FAIL';
  } else if (warnings > 0 || healthScore < 85) {
    status = 'WARNING';
  }
  
  return {
    status,
    healthScore,
    totalChecks,
    passed,
    failed,
    warnings,
    emptyTables
  };
}

/**
 * Generate comprehensive validation report
 */
function generateValidationReport(results: {
  entityCounts: ValidationResult[];
  branchWiseBreakdown: ValidationResult[];
  referentialIntegrity: ValidationResult[];
  indianContext: ValidationResult[];
  multiTenancy: ValidationResult[];
  dataQuality: ValidationResult[];
}): ValidationReport {
  const allResults = [
    ...results.entityCounts,
    ...results.branchWiseBreakdown,
    ...results.referentialIntegrity,
    ...results.indianContext,
    ...results.multiTenancy,
    ...results.dataQuality
  ];
  
  const overall = calculateHealthScore(allResults);
  
  const recommendations: string[] = [];
  
  // Count empty tables and generate recommendations
  const emptyTables = results.entityCounts.filter(r => r.current === 0).map(r => r.entity);
  
  if (emptyTables.length > 0) {
    recommendations.push(`🚨 CRITICAL: ${emptyTables.length} PostgreSQL tables are EMPTY: ${emptyTables.slice(0, 5).join(', ')}${emptyTables.length > 5 ? '...' : ''}`);
    recommendations.push('Run seed-data-manager to populate ALL 45 tables in PostgreSQL');
  }
  
  if (results.multiTenancy.some(r => r.status === 'FAIL')) {
    recommendations.push('🏫 Fix multi-tenancy: Ensure composite branch IDs exist in PostgreSQL');
  }
  
  if (results.referentialIntegrity.some(r => r.status === 'FAIL')) {
    recommendations.push('Fix PostgreSQL referential integrity issues');
  }
  
  if (overall.emptyTables === 0 && overall.healthScore >= 85) {
    recommendations.push('🎉 Excellent! All 45 PostgreSQL tables populated and healthy');
  }
  
  // Branch breakdown
  const branchBreakdown: Record<string, any> = {};
  for (const result of results.branchWiseBreakdown) {
    if (result.branchId && result.details) {
      branchBreakdown[result.branchId] = result.details;
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    totalBranches: results.branchWiseBreakdown.length,
    branchBreakdown,
    overall,
    entityCounts: results.entityCounts,
    branchWiseBreakdown: results.branchWiseBreakdown,
    referentialIntegrity: results.referentialIntegrity,
    indianContext: results.indianContext,
    multiTenancy: results.multiTenancy,
    dataQuality: results.dataQuality,
    recommendations
  };
}

/**
 * Display validation report for PostgreSQL
 */
function displayValidationReport(report: ValidationReport) {
  const line = '='.repeat(100);
  const halfLine = '─'.repeat(100);
  
  console.log(`\n${line}`);
  console.log('           PARAMARSH SMS PostgreSQL COMPREHENSIVE DATA VALIDATION REPORT');
  console.log(`                              Generated: ${report.timestamp.split('T')[0]}`);
  console.log(`                           Database: ${report.database} | Branches: ${report.totalBranches}`);
  console.log(`${line}\n`);
  
  // Overall Status
  const statusIcon = report.overall.status === 'PASS' ? '🎯' : 
                    report.overall.status === 'WARNING' ? '⚠️' : '❌';
  
  console.log(`${statusIcon} POSTGRESQL OVERALL ASSESSMENT`);
  console.log(`${halfLine}`);
  console.log(`Health Score: ${report.overall.healthScore}/100`);
  console.log(`Status: ${report.overall.status === 'PASS' ? '✅ READY FOR PRODUCTION' : 
               report.overall.status === 'WARNING' ? '⚠️ NEEDS ATTENTION' : 
               '❌ REQUIRES FIXES'}`);
  console.log(`Total Checks: ${report.overall.totalChecks}`);
  console.log(`Passed: ${report.overall.passed} | Failed: ${report.overall.failed} | Warnings: ${report.overall.warnings}`);
  if (report.overall.emptyTables > 0) {
    console.log(`🚨 CRITICAL: ${report.overall.emptyTables} EMPTY PostgreSQL TABLES!`);
  }
  console.log('');
  
  // ALL 45 POSTGRESQL TABLES STATUS
  console.log('📋 ALL 45 PostgreSQL SCHEMA TABLES VALIDATION');
  console.log(halfLine);
  console.log('Table                     | Status    | Count    | Required | Notes');
  console.log(halfLine);
  
  for (const result of report.entityCounts) {
    const status = result.status === 'PASS' ? '✅ PASS  ' : 
                   result.status === 'WARNING' ? '⚠️ WARN  ' : '❌ FAIL  ';
    const entity = (result.entity || '').padEnd(24);
    const count = String(result.current || 0).padStart(8);
    const required = String(result.required || 0).padStart(8);
    const notes = result.current === 0 ? 'EMPTY - CRITICAL BUG!' : 
                  result.current < (result.required || 0) ? 'Below minimum' : 'Good';
    
    console.log(`${entity} | ${status} | ${count} | ${required} | ${notes}`);
  }
  
  // Branch-wise breakdown
  if (report.branchWiseBreakdown && report.branchWiseBreakdown.length > 0) {
    console.log(`\n🏢 POSTGRESQL BRANCH-WISE DATA BREAKDOWN`);
    console.log(halfLine);
    console.log('Branch ID              | Students | Teachers | Staff | Classes | Sections | Total');
    console.log(halfLine);
    
    for (const result of report.branchWiseBreakdown) {
      if (result.branchId && result.details) {
        const branchId = result.branchId.padEnd(21);
        const details = result.details;
        const students = String(details.students || 0).padStart(8);
        const teachers = String(details.teachers || 0).padStart(8);
        const staff = String(details.staff || 0).padStart(5);
        const classes = String(details.classes || 0).padStart(7);
        const sections = String(details.sections || 0).padStart(8);
        const total = String(result.current || 0).padStart(5);
        
        console.log(`${branchId} | ${students} | ${teachers} | ${staff} | ${classes} | ${sections} | ${total}`);
      }
    }
  }
  
  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(`\n💡 POSTGRESQL RECOMMENDATIONS`);
    console.log(halfLine);
    
    for (let i = 0; i < report.recommendations.length; i++) {
      console.log(`${i + 1}. ${report.recommendations[i]}`);
    }
  }
  
  console.log(`\n${line}`);
  console.log(`🏆 POSTGRESQL FINAL VERDICT: ${report.overall.status === 'PASS' ? 
    'PostgreSQL database is ready for production demos and load testing!' :
    report.overall.status === 'WARNING' ? 
    'PostgreSQL database is usable but has areas for improvement.' :
    'PostgreSQL database requires fixes before production use.'}`);
  console.log(`${line}\n`);
}

/**
 * Save PostgreSQL validation report to file
 */
async function saveValidationReport(report: ValidationReport) {
  const reportsDir = path.join(__dirname, '../reports');
  
  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `postgresql-seed-validation-${timestamp}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`💾 PostgreSQL validation report saved to: ${filepath}`);
  
  // Also save a human-readable version
  const textFilename = `postgresql-seed-validation-${timestamp}.txt`;
  const textFilepath = path.join(reportsDir, textFilename);
  
  // Capture console output to file
  const originalLog = console.log;
  let reportText = '';
  
  console.log = (...args) => {
    reportText += args.join(' ') + '\n';
  };
  
  displayValidationReport(report);
  
  console.log = originalLog;
  fs.writeFileSync(textFilepath, reportText);
  
  console.log(`📄 Human-readable PostgreSQL report saved to: ${textFilepath}`);
}

/**
 * Main PostgreSQL validation function - COMPREHENSIVE 45-TABLE CHECK
 */
async function validatePostgreSQLSeedData(): Promise<ValidationReport> {
  console.log('🚀 Starting COMPREHENSIVE Paramarsh SMS PostgreSQL seed data validation...');
  console.log(`📋 Checking ALL ${ALL_SCHEMA_TABLES.length} tables from PostgreSQL schema`);
  console.log(`🏫 Expected ${EXPECTED_BRANCH_IDS.length} composite branch IDs`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}\n`);
  
  try {
    // Check database connection first
    await prisma.$connect();
    console.log('✅ PostgreSQL database connection established\n');
    
    console.log('Phase 1: Validating ALL PostgreSQL table entity counts...');
    const entityCounts = await validateEntityCounts();
    
    console.log('\nPhase 2: Generating PostgreSQL branch-wise breakdown...');
    const branchWiseBreakdown = await generateBranchWiseBreakdown();
    
    console.log('\nPhase 3: Validating PostgreSQL referential integrity...');
    const referentialIntegrity = await validateReferentialIntegrity();
    
    console.log('\nPhase 4: Validating Indian context in PostgreSQL...');
    const indianContext = await validateIndianContext();
    
    console.log('\nPhase 5: Validating PostgreSQL multi-tenancy...');
    const multiTenancy = await validateMultiTenancy();
    
    console.log('\nPhase 6: Validating PostgreSQL data quality...');
    const dataQuality = await validateDataQuality();
    
    console.log('\nPhase 7: Generating comprehensive PostgreSQL report...');
    const report = generateValidationReport({
      entityCounts,
      branchWiseBreakdown,
      referentialIntegrity,
      indianContext,
      multiTenancy,
      dataQuality
    });
    
    // Display and save report
    displayValidationReport(report);
    await saveValidationReport(report);
    
    console.log('\n' + '='.repeat(100));
    if (report.overall.emptyTables > 0) {
      console.log(`🚨 CRITICAL RESULT: ${report.overall.emptyTables} PostgreSQL tables are EMPTY - seed data has BUGS!`);
      console.log('✅ ACTION REQUIRED: Use seed-data-manager to populate ALL 45 PostgreSQL tables');
    } else if (report.overall.status === 'PASS') {
      console.log('🎉 EXCELLENT: All 45 PostgreSQL tables populated, system ready for demos!');
    } else {
      console.log(`⚠️ PARTIAL SUCCESS: Health score ${report.overall.healthScore}% - some improvements needed`);
    }
    console.log('='.repeat(100));
    
    return report;
    
  } catch (error: any) {
    console.error('❌ PostgreSQL validation failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Check if it's a connection error
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.error('\n🔧 SOLUTION: Start PostgreSQL Docker container:');
      console.error('   docker-compose up -d postgres');
      console.error('   Wait for PostgreSQL to be ready, then retry.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { validatePostgreSQLSeedData };
export type { ValidationResult, ValidationReport };

// Run validation if called directly
if (require.main === module) {
  validatePostgreSQLSeedData()
    .then(report => {
      const exitCode = report.overall.status === 'FAIL' ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('💥 Fatal PostgreSQL validation error:', error);
      process.exit(1);
    });
}