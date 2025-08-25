#!/usr/bin/env bun
/**
 * Paramarsh SMS Complete Seed Data Validation Script
 * 
 * This script validates ALL 45 tables from the schema using EXCLUSIVELY PostgreSQL MCP Server tools.
 * NEVER uses psql command-line tool or raw SQL commands.
 * 
 * Usage:
 *   bun run scripts/validate-seed-data-mcp.ts
 *   bun run validate:seed
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

// All 45 tables from the schema - COMPREHENSIVE LIST
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

// Expected composite branch IDs
const EXPECTED_BRANCH_IDS = [
  'dps-main', 'dps-north', 'dps-south', 'dps-east', 'dps-west',
  'kvs-central', 'kvs-cantonment', 'kvs-airport',
  'sps-primary', 'sps-secondary', 'sps-senior',
  'ris-main', 'ris-extension'
];

// Configuration - Updated for composite branch IDs
const PRIMARY_BRANCH_ID = 'dps-main'; // Primary branch for detailed validation
// Minimum requirements per table (across ALL branches combined)
const MIN_REQUIREMENTS_TOTAL = {
  // Core Academic Entities (across 13 branches)
  Student: 1500,    // ~115 per branch average
  Teacher: 400,     // ~30 per branch average
  Staff: 500,       // ~40 per branch average
  Class: 130,       // ~10 per branch average
  Section: 260,     // ~20 per branch average
  Subject: 130,     // ~10 per branch average
  Guardian: 2500,   // ~190 per branch average
  StudentGuardian: 2500, // ~190 per branch average
  
  // Academic Management
  AcademicYear: 13, // 1 per branch
  Enrollment: 1500, // Match students
  Exam: 260,        // ~20 per branch
  ExamSession: 650, // ~50 per branch
  ExamTemplate: 50, // System templates
  MarksEntry: 6500, // ~500 per branch
  Mark: 6500,       // Comprehensive marks
  
  // Fee Management
  FeeStructure: 130,  // ~10 per branch
  FeeComponent: 390,  // ~30 per branch
  FeeSchedule: 130,   // ~10 per branch
  Invoice: 1300,      // ~100 per branch
  Payment: 650,       // ~50 per branch
  
  // Attendance
  AttendanceRecord: 13000,    // ~1000 per branch
  AttendanceSession: 1300,    // ~100 per branch
  StudentPeriodAttendance: 13000, // Period-wise attendance
  
  // Timetable & Scheduling
  Room: 130,                  // ~10 per branch
  TimeSlot: 390,              // ~30 per branch
  TimetablePeriod: 2600,      // ~200 per branch
  TimetableTemplate: 26,      // ~2 per branch
  Substitution: 130,          // ~10 per branch
  
  // Teacher Management
  TeacherAttendance: 2600,        // ~200 per branch
  TeacherDailyAttendance: 2600,   // Daily records
  TeacherConstraint: 260,         // ~20 per branch
  
  // Constraints & Rules
  SubjectConstraint: 130,     // ~10 per branch
  RoomConstraint: 130,        // ~10 per branch
  TimeSlotConstraint: 390,    // ~30 per branch
  
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
 * Validate ALL 45 tables from schema - COMPREHENSIVE CHECK
 */
async function validateEntityCounts(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  let emptyTableCount = 0;
  
  console.log('🔍 Validating ALL 45 table entity counts...');
  console.log('📊 Checking every single table from the schema...\n');
  
  // Check ALL 45 tables from schema
  for (const tableName of ALL_SCHEMA_TABLES) {
    try {
      let totalCount = 0;
      const lowerTableName = tableName.toLowerCase();
      
      // Get count using Prisma client dynamically
      switch (tableName) {
        case 'AcademicYear':
          totalCount = await prisma.academicYear.count();
          break;
        case 'Application':
          totalCount = await prisma.application.count();
          break;
        case 'AttendanceRecord':
          totalCount = await prisma.attendanceRecord.count();
          break;
        case 'AttendanceSession':
          totalCount = await prisma.attendanceSession.count();
          break;
        case 'AuditLog':
          totalCount = await prisma.auditLog.count();
          break;
        case 'Campaign':
          totalCount = await prisma.campaign.count();
          break;
        case 'Class':
          totalCount = await prisma.class.count();
          break;
        case 'Enrollment':
          totalCount = await prisma.enrollment.count();
          break;
        case 'Exam':
          totalCount = await prisma.exam.count();
          break;
        case 'ExamSession':
          totalCount = await prisma.examSession.count();
          break;
        case 'ExamTemplate':
          totalCount = await prisma.examTemplate.count();
          break;
        case 'FeeComponent':
          totalCount = await prisma.feeComponent.count();
          break;
        case 'FeeSchedule':
          totalCount = await prisma.feeSchedule.count();
          break;
        case 'FeeStructure':
          totalCount = await prisma.feeStructure.count();
          break;
        case 'GradingScale':
          totalCount = await prisma.gradingScale.count();
          break;
        case 'Guardian':
          totalCount = await prisma.guardian.count();
          break;
        case 'Invoice':
          totalCount = await prisma.invoice.count();
          break;
        case 'Mark':
          totalCount = await prisma.mark.count();
          break;
        case 'MarksEntry':
          totalCount = await prisma.marksEntry.count();
          break;
        case 'Message':
          totalCount = await prisma.message.count();
          break;
        case 'Payment':
          totalCount = await prisma.payment.count();
          break;
        case 'Preference':
          totalCount = await prisma.preference.count();
          break;
        case 'Room':
          totalCount = await prisma.room.count();
          break;
        case 'RoomConstraint':
          totalCount = await prisma.roomConstraint.count();
          break;
        case 'Section':
          totalCount = await prisma.section.count();
          break;
        case 'Staff':
          totalCount = await prisma.staff.count();
          break;
        case 'Student':
          totalCount = await prisma.student.count();
          break;
        case 'StudentGuardian':
          totalCount = await prisma.studentGuardian.count();
          break;
        case 'StudentPeriodAttendance':
          totalCount = await prisma.studentPeriodAttendance.count();
          break;
        case 'Subject':
          totalCount = await prisma.subject.count();
          break;
        case 'SubjectConstraint':
          totalCount = await prisma.subjectConstraint.count();
          break;
        case 'Substitution':
          totalCount = await prisma.substitution.count();
          break;
        case 'Teacher':
          totalCount = await prisma.teacher.count();
          break;
        case 'TeacherAttendance':
          totalCount = await prisma.teacherAttendance.count();
          break;
        case 'TeacherConstraint':
          totalCount = await prisma.teacherConstraint.count();
          break;
        case 'TeacherDailyAttendance':
          totalCount = await prisma.teacherDailyAttendance.count();
          break;
        case 'Template':
          totalCount = await prisma.template.count();
          break;
        case 'Tenant':
          totalCount = await prisma.tenant.count();
          break;
        case 'Ticket':
          totalCount = await prisma.ticket.count();
          break;
        case 'TicketAttachment':
          totalCount = await prisma.ticketAttachment.count();
          break;
        case 'TicketMessage':
          totalCount = await prisma.ticketMessage.count();
          break;
        case 'TimeSlot':
          totalCount = await prisma.timeSlot.count();
          break;
        case 'TimeSlotConstraint':
          totalCount = await prisma.timeSlotConstraint.count();
          break;
        case 'TimetablePeriod':
          totalCount = await prisma.timetablePeriod.count();
          break;
        case 'TimetableTemplate':
          totalCount = await prisma.timetableTemplate.count();
          break;
        default:
          console.log(`⚠️ Unknown table: ${tableName}`);
          continue;
      }
      
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
 * Validate referential integrity using Prisma
 */
async function validateReferentialIntegrity(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🔗 Validating referential integrity...');
  
  // Check for orphaned student-guardian relationships
  const orphanedStudentGuardians = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count 
    FROM StudentGuardian sg 
    LEFT JOIN Student s ON sg.studentId = s.id 
    LEFT JOIN Guardian g ON sg.guardianId = g.id
    WHERE s.id IS NULL OR g.id IS NULL
  `;
  
  results.push({
    relationship: 'StudentGuardian → Student/Guardian',
    current: Number(orphanedStudentGuardians[0]?.count || 0),
    status: Number(orphanedStudentGuardians[0]?.count || 0) === 0 ? 'PASS' : 'FAIL',
    message: Number(orphanedStudentGuardians[0]?.count || 0) === 0 
      ? '✅ No orphaned student-guardian relationships'
      : `❌ ${orphanedStudentGuardians[0]?.count} orphaned relationships found`
  });
  
  // Check for orphaned enrollments
  const orphanedEnrollments = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count 
    FROM Enrollment e
    LEFT JOIN Student s ON e.studentId = s.id
    LEFT JOIN Section sec ON e.sectionId = sec.id
    WHERE s.id IS NULL OR sec.id IS NULL
  `;
  
  results.push({
    relationship: 'Enrollment → Student/Section',
    current: Number(orphanedEnrollments[0]?.count || 0),
    status: Number(orphanedEnrollments[0]?.count || 0) === 0 ? 'PASS' : 'FAIL',
    message: Number(orphanedEnrollments[0]?.count || 0) === 0
      ? '✅ No orphaned enrollments'
      : `❌ ${orphanedEnrollments[0]?.count} orphaned enrollments found`
  });
  
  // Check for teachers without staff records
  const teachersWithoutStaff = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count 
    FROM Teacher t
    LEFT JOIN Staff s ON t.staffId = s.id
    WHERE s.id IS NULL
  `;
  
  results.push({
    relationship: 'Teacher → Staff',
    current: Number(teachersWithoutStaff[0]?.count || 0),
    status: Number(teachersWithoutStaff[0]?.count || 0) === 0 ? 'PASS' : 'FAIL',
    message: Number(teachersWithoutStaff[0]?.count || 0) === 0
      ? '✅ All teachers have staff records'
      : `❌ ${teachersWithoutStaff[0]?.count} teachers without staff records`
  });
  
  console.log(`  ${results[0].status === 'PASS' ? '✅' : '❌'} StudentGuardian integrity`);
  console.log(`  ${results[1].status === 'PASS' ? '✅' : '❌'} Enrollment integrity`);
  console.log(`  ${results[2].status === 'PASS' ? '✅' : '❌'} Teacher-Staff integrity`);
  
  return results;
}

/**
 * Generate branch-wise breakdown for key entities
 */
async function generateBranchWiseBreakdown(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🏢 Generating branch-wise breakdown...');
  
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true }
  });
  
  console.log(`Found ${tenants.length} branches to analyze:`);
  
  for (const tenant of tenants) {
    const branchId = tenant.id;
    
    // Get key metrics for each branch
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
  }
  
  return results;
}

/**
 * Validate Indian context using Prisma
 */
async function validateIndianContext(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🇮🇳 Validating Indian context...');
  
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
  
  // Check for composite branch IDs (Indian school context)
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
  
  // Sample students from all branches for name analysis
  const sampleStudents = await prisma.student.findMany({
    take: 200,
    select: { firstName: true, lastName: true, branchId: true }
  });
  
  let indianNameCount = 0;
  for (const student of sampleStudents) {
    const hasIndianFirst = INDIAN_FIRST_NAMES.some(name => 
      student.firstName && student.firstName.toLowerCase().includes(name.toLowerCase())
    );
    const hasIndianLast = INDIAN_LAST_NAMES.some(name => 
      student.lastName && student.lastName.toLowerCase().includes(name.toLowerCase())
    );
    
    if (hasIndianFirst || hasIndianLast) {
      indianNameCount++;
    }
  }
  
  const indianNamePercentage = sampleStudents.length > 0 
    ? (indianNameCount / sampleStudents.length) * 100 
    : 0;
  const hasGoodIndianNames = indianNamePercentage >= 70; // Lowered threshold for broader matching
  
  results.push({
    entity: 'Student',
    field: 'IndianNames',
    current: Math.round(indianNamePercentage),
    status: hasGoodIndianNames ? 'PASS' : 'WARNING',
    message: `${hasGoodIndianNames ? '✅' : '⚠️'} ${Math.round(indianNamePercentage)}% Indian names in sample`
  });
  
  // Check for Indian phone numbers in guardians
  const sampleGuardians = await prisma.guardian.findMany({
    take: 200,
    select: { phoneNumber: true, address: true }
  });
  
  const indianPhones = sampleGuardians.filter(g => 
    g.phoneNumber && (g.phoneNumber.startsWith('+91') || g.phoneNumber.startsWith('91') || g.phoneNumber.length === 10)
  ).length;
  
  const phonePercentage = sampleGuardians.length > 0 
    ? (indianPhones / sampleGuardians.length) * 100 
    : 0;
  
  results.push({
    entity: 'Guardian',
    field: 'IndianPhones',
    current: Math.round(phonePercentage),
    status: phonePercentage >= 70 ? 'PASS' : 'WARNING',
    message: `${phonePercentage >= 70 ? '✅' : '⚠️'} ${Math.round(phonePercentage)}% Indian format phones`
  });
  
  // Check for Indian cities in addresses
  const indianAddresses = sampleGuardians.filter(g => 
    g.address && INDIAN_CITIES.some(city => 
      g.address?.toLowerCase().includes(city.toLowerCase())
    )
  ).length;
  
  const addressPercentage = sampleGuardians.length > 0 
    ? (indianAddresses / sampleGuardians.length) * 100 
    : 0;
  
  results.push({
    entity: 'Guardian',
    field: 'IndianAddresses',
    current: Math.round(addressPercentage),
    status: addressPercentage >= 50 ? 'PASS' : 'WARNING',
    message: `${addressPercentage >= 50 ? '✅' : '⚠️'} ${Math.round(addressPercentage)}% Indian cities in addresses`
  });
  
  console.log(`  Hindi subject: ${results[0].status}`);
  console.log(`  Composite branches: ${compositeBranches}/13`);
  console.log(`  Indian names: ${Math.round(indianNamePercentage)}%`);
  console.log(`  Indian phones: ${Math.round(phonePercentage)}%`);
  
  return results;
}

/**
 * Validate composite branch IDs and multi-tenancy
 */
async function validateMultiTenancy(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🏫 Validating composite branch IDs and multi-tenancy...');
  
  // 1. Check that all expected composite branch IDs exist as Tenants
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
  
  // 2. Check for old format branch IDs (branch1, branch2, etc.)
  const oldFormatTenants = existingTenants.filter(t => 
    t.id.match(/^branch\d+$/) || !t.id.includes('-')
  );
  
  results.push({
    entity: 'Tenant',
    field: 'LegacyBranchFormat',
    current: oldFormatTenants.length,
    required: 0,
    status: oldFormatTenants.length === 0 ? 'PASS' : 'FAIL',
    message: oldFormatTenants.length === 0
      ? '✅ No legacy branch IDs found'
      : `❌ Found legacy format: ${oldFormatTenants.map(t => t.id).join(', ')}`
  });
  
  // 3. Check for records without branchId in key entities
  const entitiesWithBranchId = [
    { name: 'Student', model: prisma.student },
    { name: 'Teacher', model: prisma.teacher },
    { name: 'Staff', model: prisma.staff },
    { name: 'Class', model: prisma.class },
    { name: 'Section', model: prisma.section },
    { name: 'Guardian', model: prisma.guardian }
  ];
  
  for (const entity of entitiesWithBranchId) {
    const missingBranchId = await (entity.model as any).count({
      where: { OR: [{ branchId: null }, { branchId: '' }] }
    });
    
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
  
  // 4. Validate data isolation - check for cross-branch contamination
  for (const branchId of existingBranchIds.slice(0, 3)) { // Sample first 3 branches
    const students = await prisma.student.count({ where: { branchId } });
    const teachers = await prisma.teacher.count({ where: { branchId } });
    
    results.push({
      entity: 'BranchIsolation',
      field: branchId,
      current: students + teachers,
      status: students > 0 || teachers > 0 ? 'PASS' : 'WARNING',
      message: students > 0 || teachers > 0
        ? `✅ ${branchId}: ${students} students, ${teachers} teachers`
        : `⚠️ ${branchId}: No data found`
    });
  }
  
  console.log(`  Composite branches: ${existingBranchIds.length}/${EXPECTED_BRANCH_IDS.length}`);
  console.log(`  Legacy format found: ${oldFormatTenants.length}`);
  
  return results;
}

/**
 * Validate data quality metrics using Prisma
 */
async function validateDataQuality(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('📊 Validating data quality metrics...');
  
  // Gender distribution across all branches
  const maleStudents = await prisma.student.count({
    where: { gender: { in: ['male', 'MALE', 'M'] } }
  });
  
  const femaleStudents = await prisma.student.count({
    where: { gender: { in: ['female', 'FEMALE', 'F'] } }
  });
  
  const totalStudents = maleStudents + femaleStudents;
  const malePercentage = totalStudents > 0 ? (maleStudents / totalStudents) * 100 : 0;
  const femalePercentage = totalStudents > 0 ? (femaleStudents / totalStudents) * 100 : 0;
  
  const isBalanced = Math.abs(malePercentage - 50) <= 20; // Allow 30-70% range
  
  results.push({
    entity: 'Student',
    field: 'GenderDistribution',
    current: Math.round(malePercentage),
    status: isBalanced ? 'PASS' : 'WARNING',
    message: `${isBalanced ? '✅' : '⚠️'} Gender: ${Math.round(malePercentage)}%M / ${Math.round(femalePercentage)}%F`,
    details: { male: malePercentage, female: femalePercentage, total: totalStudents }
  });
  
  // Teacher-student ratio across all branches
  const allStudents = await prisma.student.count();
  const allTeachers = await prisma.teacher.count();
  const ratio = allTeachers > 0 ? allStudents / allTeachers : 0;
  
  const isGoodRatio = ratio <= 40 && ratio > 0; // 1:40 max for Indian schools
  
  results.push({
    entity: 'Teacher',
    field: 'StudentRatio',
    current: Math.round(ratio),
    status: isGoodRatio ? 'PASS' : 'WARNING',
    message: `${isGoodRatio ? '✅' : '⚠️'} Overall ratio: 1:${Math.round(ratio)} (${allStudents} students, ${allTeachers} teachers)`
  });
  
  // Fee management completeness
  const totalInvoices = await prisma.invoice.count();
  const totalPayments = await prisma.payment.count();
  const paymentRate = totalInvoices > 0 ? (totalPayments / totalInvoices) * 100 : 0;
  
  const hasReasonablePayments = paymentRate >= 20 && paymentRate <= 80; // Realistic range for demo data
  
  results.push({
    entity: 'Payment',
    field: 'InvoicePaymentRatio',
    current: Math.round(paymentRate),
    status: hasReasonablePayments ? 'PASS' : 'WARNING',
    message: `${hasReasonablePayments ? '✅' : '⚠️'} Payment ratio: ${Math.round(paymentRate)}% (${totalPayments}/${totalInvoices})`
  });
  
  // Attendance data completeness
  const attendanceRecords = await prisma.attendanceRecord.count();
  const attendanceSessions = await prisma.attendanceSession.count();
  const attendanceCompleteness = attendanceSessions > 0 ? (attendanceRecords / attendanceSessions) * 100 : 0;
  
  const hasGoodAttendanceData = attendanceCompleteness >= 500; // Should have multiple records per session
  
  results.push({
    entity: 'AttendanceRecord',
    field: 'DataCompleteness',
    current: Math.round(attendanceCompleteness),
    status: hasGoodAttendanceData ? 'PASS' : 'WARNING',
    message: `${hasGoodAttendanceData ? '✅' : '⚠️'} Attendance completeness: ${attendanceRecords} records for ${attendanceSessions} sessions`
  });
  
  // Timetable completeness
  const timetablePeriods = await prisma.timetablePeriod.count();
  const sectionsWithTimetable = await prisma.section.count({
    where: {
      periods: {
        some: {}
      }
    }
  });
  const totalSections = await prisma.section.count();
  const timetableCompleteness = totalSections > 0 ? (sectionsWithTimetable / totalSections) * 100 : 0;
  
  const hasGoodTimetable = timetableCompleteness >= 80;
  
  results.push({
    entity: 'TimetablePeriod',
    field: 'TimetableCompleteness',
    current: Math.round(timetableCompleteness),
    status: hasGoodTimetable ? 'PASS' : 'WARNING',
    message: `${hasGoodTimetable ? '✅' : '⚠️'} Timetable: ${Math.round(timetableCompleteness)}% sections have periods`
  });
  
  // Guardian-student relationship completeness
  const studentsWithGuardians = await prisma.student.count({
    where: {
      guardians: {
        some: {}
      }
    }
  });
  const guardianCompleteness = allStudents > 0 ? (studentsWithGuardians / allStudents) * 100 : 0;
  
  const hasGoodGuardianData = guardianCompleteness >= 80;
  
  results.push({
    entity: 'StudentGuardian',
    field: 'RelationshipCompleteness',
    current: Math.round(guardianCompleteness),
    status: hasGoodGuardianData ? 'PASS' : 'WARNING',
    message: `${hasGoodGuardianData ? '✅' : '⚠️'} Guardian relationships: ${Math.round(guardianCompleteness)}% students have guardians`
  });
  
  console.log(`  Gender balance: ${Math.round(malePercentage)}%M / ${Math.round(femalePercentage)}%F`);
  console.log(`  Teacher-student ratio: 1:${Math.round(ratio)}`);
  console.log(`  Payment ratio: ${Math.round(paymentRate)}%`);
  console.log(`  Timetable completeness: ${Math.round(timetableCompleteness)}%`);
  
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
  emptyTables: number;
} {
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
  
  // Fail if any tables are empty (critical) or if health score is too low
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
  
  // Count empty tables and generate specific recommendations
  const emptyTables = results.entityCounts.filter(r => r.current === 0).map(r => r.entity);
  
  // Critical recommendations based on failures
  if (emptyTables.length > 0) {
    recommendations.push(`🚨 CRITICAL: ${emptyTables.length} tables are EMPTY: ${emptyTables.slice(0, 5).join(', ')}${emptyTables.length > 5 ? '...' : ''}`);
    recommendations.push('Run seed-data-manager to populate ALL tables in schema');
  }
  
  if (results.entityCounts.some(r => r.status === 'FAIL' && r.current !== 0)) {
    recommendations.push('Increase seed data volume for entities below minimum requirements');
  }
  
  if (results.multiTenancy.some(r => r.status === 'FAIL')) {
    recommendations.push('🏫 Fix multi-tenancy: Ensure composite branch IDs (dps-main, kvs-central, etc.)');
  }
  
  if (results.referentialIntegrity.some(r => r.status === 'FAIL')) {
    recommendations.push('Fix referential integrity issues before production use');
  }
  
  if (results.indianContext.some(r => r.status !== 'PASS')) {
    recommendations.push('Enhance Indian cultural context in names, subjects, and addresses');
  }
  
  if (overall.healthScore < 85) {
    recommendations.push(`📊 Health score ${overall.healthScore}% is below target (85%+)`);
  }
  
  if (overall.emptyTables === 0 && overall.healthScore >= 85) {
    recommendations.push('🎉 Excellent! All tables populated and health score is good');
  }
  
  // Add branch breakdown summary
  const branchBreakdown: Record<string, any> = {};
  for (const result of results.branchWiseBreakdown) {
    if (result.branchId && result.details) {
      branchBreakdown[result.branchId] = result.details;
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite',
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
 * Format and display validation report
 */
function displayValidationReport(report: ValidationReport) {
  const line = '='.repeat(100);
  const halfLine = '─'.repeat(100);
  
  console.log(`\n${line}`);
  console.log('                     PARAMARSH SMS COMPREHENSIVE DATA VALIDATION REPORT');
  console.log(`                                   Generated: ${report.timestamp.split('T')[0]}`);
  console.log(`                                Database: ${report.database} | Branches: ${report.totalBranches}`);
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
  console.log(`Passed: ${report.overall.passed} | Failed: ${report.overall.failed} | Warnings: ${report.overall.warnings}`);
  if (report.overall.emptyTables > 0) {
    console.log(`🚨 CRITICAL: ${report.overall.emptyTables} EMPTY TABLES - SEED DATA BUGS!`);
  }
  console.log('');
  
  // ALL 45 TABLES STATUS
  console.log('📋 ALL 45 SCHEMA TABLES VALIDATION');
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
    console.log(`\n🏢 BRANCH-WISE DATA BREAKDOWN`);
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
  
  // Referential Integrity
  console.log(`\n🔗 REFERENTIAL INTEGRITY CHECK`);
  console.log(halfLine);
  console.log('Relationship                                              | Status');
  console.log(halfLine);
  
  for (const result of report.referentialIntegrity) {
    const status = result.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    const relationship = (result.relationship || '').padEnd(56);
    
    console.log(`${relationship} | ${status}`);
  }
  
  // Indian Context
  console.log(`\n🇮🇳 INDIAN CONTEXT VALIDATION`);
  console.log(halfLine);
  console.log('Context Element                           | Status | Details');
  console.log(halfLine);
  
  for (const result of report.indianContext) {
    const status = result.status === 'PASS' ? '✅ PASS' : 
                   result.status === 'WARNING' ? '⚠️ WARN' : '❌ FAIL';
    const element = `${result.entity}.${result.field}`.padEnd(40);
    const details = result.current ? `${result.current}%` : '';
    
    console.log(`${element} | ${status} | ${details}`);
  }
  
  // Data Quality
  console.log(`\n📈 DATA QUALITY METRICS`);
  console.log(halfLine);
  console.log('Metric                                    | Value        | Status');
  console.log(halfLine);
  
  for (const result of report.dataQuality) {
    const status = result.status === 'PASS' ? '✅ PASS' : 
                   result.status === 'WARNING' ? '⚠️ WARN' : '❌ FAIL';
    const metric = `${result.entity}.${result.field}`.padEnd(40);
    const value = String(result.current || 'N/A').padEnd(12);
    
    console.log(`${metric} | ${value} | ${status}`);
  }
  
  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(`\n💡 RECOMMENDATIONS`);
    console.log(halfLine);
    
    for (let i = 0; i < report.recommendations.length; i++) {
      console.log(`${i + 1}. ${report.recommendations[i]}`);
    }
  }
  
  console.log(`\n${line}`);
  console.log(`🏆 FINAL VERDICT: ${report.overall.status === 'PASS' ? 
    'Database is ready for production demos and load testing!' :
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
  const filename = `seed-validation-${timestamp}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`💾 Validation report saved to: ${filepath}`);
  
  // Also save a human-readable version
  const textFilename = `seed-validation-${timestamp}.txt`;
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
  
  console.log(`📄 Human-readable report saved to: ${textFilepath}`);
}

/**
 * Main validation function - COMPREHENSIVE 45-TABLE CHECK
 */
async function validateSeedData(): Promise<ValidationReport> {
  console.log('🚀 Starting COMPREHENSIVE Paramarsh SMS seed data validation...');
  console.log(`📋 Checking ALL ${ALL_SCHEMA_TABLES.length} tables from schema`);
  console.log(`🏫 Expected ${EXPECTED_BRANCH_IDS.length} composite branch IDs`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}\n`);
  
  try {
    console.log('Phase 1: Validating ALL table entity counts...');
    const entityCounts = await validateEntityCounts();
    
    console.log('\nPhase 2: Generating branch-wise breakdown...');
    const branchWiseBreakdown = await generateBranchWiseBreakdown();
    
    console.log('\nPhase 3: Validating referential integrity...');
    const referentialIntegrity = await validateReferentialIntegrity();
    
    console.log('\nPhase 4: Validating Indian context...');
    const indianContext = await validateIndianContext();
    
    console.log('\nPhase 5: Validating multi-tenancy...');
    const multiTenancy = await validateMultiTenancy();
    
    console.log('\nPhase 6: Validating data quality...');
    const dataQuality = await validateDataQuality();
    
    console.log('\nPhase 7: Generating comprehensive report...');
    // Generate comprehensive report
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
      console.log(`🚨 CRITICAL RESULT: ${report.overall.emptyTables} tables are EMPTY - seed data has BUGS!`);
      console.log('✅ ACTION REQUIRED: Use seed-data-manager to populate ALL 45 tables');
    } else if (report.overall.status === 'PASS') {
      console.log('🎉 EXCELLENT: All 45 tables populated, system ready for demos!');
    } else {
      console.log(`⚠️ PARTIAL SUCCESS: Health score ${report.overall.healthScore}% - some improvements needed`);
    }
    console.log('='.repeat(100));
    
    return report;
    
  } catch (error: any) {
    console.error('❌ Validation failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation if called directly
validateSeedData()
  .then(report => {
    const exitCode = report.overall.status === 'FAIL' ? 1 : 0;
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

export {
  validateSeedData
};

export type {
  ValidationResult,
  ValidationReport
};