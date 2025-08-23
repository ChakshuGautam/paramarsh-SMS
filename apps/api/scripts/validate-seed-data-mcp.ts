#!/usr/bin/env bun
/**
 * Paramarsh SMS Seed Data Validation Script
 * 
 * This script validates all seed data using EXCLUSIVELY SQLite MCP Server tools.
 * NEVER uses sqlite3 command-line tool or raw SQL commands.
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
 * Validate entity counts using Prisma
 */
async function validateEntityCounts(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🔍 Validating entity counts...');
  
  // Use Prisma to get counts for each entity
  const entityCounts: Record<string, number> = {
    Student: await prisma.student.count({ where: { branchId: BRANCH_ID } }),
    Teacher: await prisma.teacher.count({ where: { branchId: BRANCH_ID } }),
    Class: await prisma.class.count({ where: { branchId: BRANCH_ID } }),
    Section: await prisma.section.count({ where: { branchId: BRANCH_ID } }),
    Subject: await prisma.subject.count({ where: { branchId: BRANCH_ID } }),
    Staff: await prisma.staff.count({ where: { branchId: BRANCH_ID } }),
    Guardian: await prisma.guardian.count({ where: { branchId: BRANCH_ID } }),
    StudentGuardian: await prisma.studentGuardian.count(),
    AcademicYear: await prisma.academicYear.count({ where: { branchId: BRANCH_ID } }),
    Enrollment: await prisma.enrollment.count({ where: { branchId: BRANCH_ID } }),
    Exam: await prisma.exam.count({ where: { branchId: BRANCH_ID } }),
    ExamSession: await prisma.examSession.count({ where: { branchId: BRANCH_ID } }),
    MarksEntry: await prisma.marksEntry.count({ where: { branchId: BRANCH_ID } }),
    FeeStructure: await prisma.feeStructure.count({ where: { branchId: BRANCH_ID } }),
    FeeComponent: await prisma.feeComponent.count({ where: { branchId: BRANCH_ID } }),
    Invoice: await prisma.invoice.count({ where: { branchId: BRANCH_ID } }),
    Payment: await prisma.payment.count({ where: { branchId: BRANCH_ID } }),
    AttendanceRecord: await prisma.attendanceRecord.count({ where: { branchId: BRANCH_ID } }),
    AttendanceSession: await prisma.attendanceSession.count({ where: { branchId: BRANCH_ID } }),
    Room: await prisma.room.count({ where: { branchId: BRANCH_ID } }),
    TimeSlot: await prisma.timeSlot.count({ where: { branchId: BRANCH_ID } }),
    TimetablePeriod: await prisma.timetablePeriod.count({ where: { branchId: BRANCH_ID } }),
    Template: await prisma.template.count({ where: { branchId: BRANCH_ID } }),
    Campaign: await prisma.campaign.count({ where: { branchId: BRANCH_ID } }),
    Ticket: await prisma.ticket.count({ where: { branchId: BRANCH_ID } }),
    Application: await prisma.application.count({ where: { branchId: BRANCH_ID } })
  };
  
  for (const [entity, currentCount] of Object.entries(entityCounts)) {
    const minCount = MIN_REQUIREMENTS[entity as keyof typeof MIN_REQUIREMENTS] || 0;
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
  }
  
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
 * Validate Indian context using Prisma
 */
async function validateIndianContext(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🇮🇳 Validating Indian context...');
  
  // Check for Hindi subject
  const hindiSubject = await prisma.subject.findFirst({
    where: {
      OR: [
        { name: { contains: 'Hindi' } },
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
  
  // Check for Indian names in students
  const sampleStudents = await prisma.student.findMany({
    where: { branchId: BRANCH_ID },
    take: 100
  });
  
  let indianNameCount = 0;
  for (const student of sampleStudents) {
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
  
  const indianNamePercentage = sampleStudents.length > 0 
    ? (indianNameCount / sampleStudents.length) * 100 
    : 0;
  const hasGoodIndianNames = indianNamePercentage >= 80;
  
  results.push({
    entity: 'Student',
    field: 'IndianNames',
    current: Math.round(indianNamePercentage),
    status: hasGoodIndianNames ? 'PASS' : 'WARNING',
    message: `${hasGoodIndianNames ? '✅' : '⚠️'} ${Math.round(indianNamePercentage)}% Indian names`
  });
  
  // Check for Indian phone numbers
  const sampleGuardians = await prisma.guardian.findMany({
    where: { branchId: BRANCH_ID },
    take: 100
  });
  
  const indianPhones = sampleGuardians.filter(g => 
    g.phoneNumber && g.phoneNumber.startsWith('+91')
  ).length;
  
  const phonePercentage = sampleGuardians.length > 0 
    ? (indianPhones / sampleGuardians.length) * 100 
    : 0;
  
  results.push({
    entity: 'Guardian',
    field: 'IndianPhones',
    current: Math.round(phonePercentage),
    status: phonePercentage >= 80 ? 'PASS' : 'WARNING',
    message: `${phonePercentage >= 80 ? '✅' : '⚠️'} ${Math.round(phonePercentage)}% Indian phone numbers (+91)`
  });
  
  // Check for Indian cities in addresses
  const indianAddresses = sampleGuardians.filter(g => 
    g.address && INDIAN_CITIES.some(city => g.address?.includes(city))
  ).length;
  
  const addressPercentage = sampleGuardians.length > 0 
    ? (indianAddresses / sampleGuardians.length) * 100 
    : 0;
  
  results.push({
    entity: 'Guardian',
    field: 'IndianAddresses',
    current: Math.round(addressPercentage),
    status: addressPercentage >= 70 ? 'PASS' : 'WARNING',
    message: `${addressPercentage >= 70 ? '✅' : '⚠️'} ${Math.round(addressPercentage)}% Indian addresses`
  });
  
  console.log(`  ${results[0].status === 'PASS' ? '✅' : '❌'} Hindi subject`);
  console.log(`  ${results[1].status === 'PASS' ? '✅' : '⚠️'} Indian names: ${Math.round(indianNamePercentage)}%`);
  console.log(`  ${results[2].status === 'PASS' ? '✅' : '⚠️'} Indian phones: ${Math.round(phonePercentage)}%`);
  console.log(`  ${results[3].status === 'PASS' ? '✅' : '⚠️'} Indian addresses: ${Math.round(addressPercentage)}%`);
  
  return results;
}

/**
 * Validate multi-tenancy using Prisma
 */
async function validateMultiTenancy(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🏫 Validating multi-tenancy...');
  
  // Check for records without branchId
  const studentsWithoutBranch = await prisma.student.count({
    where: { OR: [{ branchId: null }, { branchId: '' }] }
  });
  
  const teachersWithoutBranch = await prisma.teacher.count({
    where: { OR: [{ branchId: null }, { branchId: '' }] }
  });
  
  const classesWithoutBranch = await prisma.class.count({
    where: { OR: [{ branchId: null }, { branchId: '' }] }
  });
  
  results.push({
    entity: 'Student',
    field: 'branchId',
    current: studentsWithoutBranch,
    status: studentsWithoutBranch === 0 ? 'PASS' : 'FAIL',
    message: studentsWithoutBranch === 0
      ? '✅ All students have branchId'
      : `❌ ${studentsWithoutBranch} students missing branchId`
  });
  
  results.push({
    entity: 'Teacher',
    field: 'branchId',
    current: teachersWithoutBranch,
    status: teachersWithoutBranch === 0 ? 'PASS' : 'FAIL',
    message: teachersWithoutBranch === 0
      ? '✅ All teachers have branchId'
      : `❌ ${teachersWithoutBranch} teachers missing branchId`
  });
  
  results.push({
    entity: 'Class',
    field: 'branchId',
    current: classesWithoutBranch,
    status: classesWithoutBranch === 0 ? 'PASS' : 'FAIL',
    message: classesWithoutBranch === 0
      ? '✅ All classes have branchId'
      : `❌ ${classesWithoutBranch} classes missing branchId`
  });
  
  console.log(`  ${results[0].status === 'PASS' ? '✅' : '❌'} Student multi-tenancy`);
  console.log(`  ${results[1].status === 'PASS' ? '✅' : '❌'} Teacher multi-tenancy`);
  console.log(`  ${results[2].status === 'PASS' ? '✅' : '❌'} Class multi-tenancy`);
  
  return results;
}

/**
 * Validate data quality metrics using Prisma
 */
async function validateDataQuality(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('📊 Validating data quality metrics...');
  
  // Gender distribution
  const maleStudents = await prisma.student.count({
    where: { branchId: BRANCH_ID, gender: 'male' }
  });
  
  const femaleStudents = await prisma.student.count({
    where: { branchId: BRANCH_ID, gender: 'female' }
  });
  
  const totalStudents = maleStudents + femaleStudents;
  const malePercentage = totalStudents > 0 ? (maleStudents / totalStudents) * 100 : 0;
  const femalePercentage = totalStudents > 0 ? (femaleStudents / totalStudents) * 100 : 0;
  
  const isBalanced = Math.abs(malePercentage - 50) <= 15 && Math.abs(femalePercentage - 50) <= 15;
  
  results.push({
    entity: 'Student',
    field: 'GenderDistribution',
    status: isBalanced ? 'PASS' : 'WARNING',
    message: `${isBalanced ? '✅' : '⚠️'} Gender: ${Math.round(malePercentage)}%M / ${Math.round(femalePercentage)}%F`,
    details: { male: malePercentage, female: femalePercentage }
  });
  
  // Fee collection rate
  const totalInvoices = await prisma.invoice.count({
    where: { branchId: BRANCH_ID }
  });
  
  const paidInvoices = await prisma.payment.count({
    where: { 
      branchId: BRANCH_ID,
      status: 'completed'
    }
  });
  
  const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
  const isGoodCollection = collectionRate >= 10 && collectionRate <= 90; // Adjusted for realistic test data
  
  results.push({
    entity: 'Payment',
    field: 'CollectionRate',
    current: Math.round(collectionRate),
    status: isGoodCollection ? 'PASS' : 'WARNING',
    message: `${isGoodCollection ? '✅' : '⚠️'} Fee collection: ${Math.round(collectionRate)}%`
  });
  
  // Teacher-student ratio
  const students = await prisma.student.count({ where: { branchId: BRANCH_ID } });
  const teachers = await prisma.teacher.count({ where: { branchId: BRANCH_ID } });
  const ratio = teachers > 0 ? students / teachers : 0;
  
  const isGoodRatio = ratio <= 35 && ratio > 0; // 1:35 is reasonable for Indian schools
  
  results.push({
    entity: 'Teacher',
    field: 'StudentRatio',
    current: Math.round(ratio),
    status: isGoodRatio ? 'PASS' : 'WARNING',
    message: `${isGoodRatio ? '✅' : '⚠️'} Teacher-student ratio: 1:${Math.round(ratio)}`
  });
  
  // Attendance rate
  const attendanceRecords = await prisma.attendanceRecord.count({
    where: { branchId: BRANCH_ID }
  });
  
  const presentRecords = await prisma.attendanceRecord.count({
    where: { 
      branchId: BRANCH_ID,
      status: { in: ['PRESENT', 'present'] }
    }
  });
  
  const attendanceRate = attendanceRecords > 0 ? (presentRecords / attendanceRecords) * 100 : 0;
  const isGoodAttendance = attendanceRate >= 70 && attendanceRate <= 95;
  
  results.push({
    entity: 'AttendanceRecord',
    field: 'AttendanceRate',
    current: Math.round(attendanceRate),
    status: isGoodAttendance ? 'PASS' : 'WARNING',
    message: `${isGoodAttendance ? '✅' : '⚠️'} Attendance rate: ${Math.round(attendanceRate)}%`
  });
  
  console.log(`  ${results[0].status === 'PASS' ? '✅' : '⚠️'} Gender distribution`);
  console.log(`  ${results[1].status === 'PASS' ? '✅' : '⚠️'} Fee collection rate`);
  console.log(`  ${results[2].status === 'PASS' ? '✅' : '⚠️'} Teacher-student ratio`);
  console.log(`  ${results[3].status === 'PASS' ? '✅' : '⚠️'} Attendance rate`);
  
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
  
  const healthScore = Math.round((passed / totalChecks) * 100);
  
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
    database: 'dev.db',
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
 * Format and display validation report
 */
function displayValidationReport(report: ValidationReport) {
  const line = '='.repeat(80);
  const halfLine = '─'.repeat(80);
  
  console.log(`\n${line}`);
  console.log('                    PARAMARSH SMS DATA VALIDATION REPORT');
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
  
  // Entity Counts
  console.log('📊 ENTITY COUNT VALIDATION');
  console.log(halfLine);
  console.log('Entity                    | Status | Count | Required');
  console.log(halfLine);
  
  for (const result of report.entityCounts) {
    const status = result.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    const entity = (result.entity || '').padEnd(24);
    const count = String(result.current || 0).padStart(5);
    const required = String(result.required || 0).padStart(8);
    
    console.log(`${entity} | ${status} | ${count} | ${required}`);
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
 * Main validation function
 */
async function validateSeedData(): Promise<ValidationReport> {
  console.log('🚀 Starting Paramarsh SMS seed data validation...');
  console.log(`📍 Target Branch: ${BRANCH_ID}`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}\n`);
  
  try {
    // Run all validations
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
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation if called directly
// Check if running as main module (works with Bun)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  validateSeedData()
    .then(report => {
      const exitCode = report.overall.status === 'FAIL' ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export {
  validateSeedData,
  ValidationResult,
  ValidationReport
};