#!/usr/bin/env tsx

/**
 * Validate Student Attendance Data
 * Comprehensive validation script for attendance data quality and integrity
 */

import { PrismaClient } from '@prisma/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  value?: any;
  expected?: any;
  details?: string;
}

class AttendanceValidator {
  private results: ValidationResult[] = [];

  private addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', value?: any, expected?: any, details?: string) {
    this.results.push({ category, test, status, value, expected, details });
  }

  async validateDataIntegrity() {
    console.log('🔍 Validating data integrity...');

    // Check for orphaned attendance records (records with invalid sessionId or studentId)
    const totalRecords = await prisma.studentPeriodAttendance.count({
      where: { session: { branchId: 'dps-main' } }
    });
    
    const validRecords = await prisma.studentPeriodAttendance.count({
      where: { 
        session: { branchId: 'dps-main' },
        AND: [
          { sessionId: { not: null } },
          { studentId: { not: null } }
        ]
      }
    });
    
    const orphanedRecords = totalRecords - validRecords;
    
    this.addResult(
      'Data Integrity',
      'Orphaned Attendance Records',
      orphanedRecords === 0 ? 'PASS' : 'FAIL',
      orphanedRecords,
      0,
      orphanedRecords > 0 ? 'Found orphaned attendance records' : undefined
    );

    // Check for duplicate attendance records
    const duplicates = await prisma.$queryRaw`
      SELECT "sessionId", "studentId", COUNT(*) as count
      FROM "StudentPeriodAttendance" spa
      JOIN "AttendanceSession" s ON spa."sessionId" = s.id
      WHERE s."branchId" = 'dps-main'
      GROUP BY "sessionId", "studentId"
      HAVING COUNT(*) > 1
    ` as any[];
    
    this.addResult(
      'Data Integrity',
      'Duplicate Attendance Records',
      duplicates.length === 0 ? 'PASS' : 'FAIL',
      duplicates.length,
      0,
      duplicates.length > 0 ? 'Found duplicate attendance records' : undefined
    );

    // Check session-student consistency
    const inconsistentRecords = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "StudentPeriodAttendance" spa
      JOIN "AttendanceSession" s ON spa."sessionId" = s.id
      JOIN "Student" st ON spa."studentId" = st.id
      JOIN "Enrollment" e ON st.id = e."studentId"
      WHERE s."branchId" = 'dps-main'
        AND s."sectionId" != e."sectionId"
    ` as { count: bigint }[];
    
    this.addResult(
      'Data Integrity',
      'Session-Student Section Consistency',
      Number(inconsistentRecords[0].count) === 0 ? 'PASS' : 'FAIL',
      Number(inconsistentRecords[0].count),
      0,
      Number(inconsistentRecords[0].count) > 0 ? 'Students have attendance in wrong sections' : undefined
    );
  }

  async validateAttendancePatterns() {
    console.log('📊 Validating attendance patterns...');

    // Overall attendance rate
    const totalRecords = await prisma.studentPeriodAttendance.count({
      where: { session: { branchId: 'dps-main' } }
    });

    const presentRecords = await prisma.studentPeriodAttendance.count({
      where: { 
        session: { branchId: 'dps-main' },
        status: 'present'
      }
    });

    const attendanceRate = (presentRecords / totalRecords) * 100;
    
    this.addResult(
      'Attendance Patterns',
      'Overall Attendance Rate',
      attendanceRate >= 80 && attendanceRate <= 95 ? 'PASS' : 'WARNING',
      `${attendanceRate.toFixed(1)}%`,
      '80-95%',
      attendanceRate < 80 ? 'Attendance rate below expected minimum' :
      attendanceRate > 95 ? 'Attendance rate unusually high' : undefined
    );

    // Status distribution
    const statusDistribution = await prisma.studentPeriodAttendance.groupBy({
      by: ['status'],
      where: { session: { branchId: 'dps-main' } },
      _count: true
    });

    const statusMap = new Map(statusDistribution.map(s => [s.status, s._count]));
    const absentRate = ((statusMap.get('absent') || 0) / totalRecords) * 100;
    const lateRate = ((statusMap.get('late') || 0) / totalRecords) * 100;
    
    this.addResult(
      'Attendance Patterns',
      'Absent Rate',
      absentRate >= 2 && absentRate <= 15 ? 'PASS' : 'WARNING',
      `${absentRate.toFixed(1)}%`,
      '2-15%'
    );

    this.addResult(
      'Attendance Patterns',
      'Late Arrival Rate',
      lateRate >= 1 && lateRate <= 8 ? 'PASS' : 'WARNING',
      `${lateRate.toFixed(1)}%`,
      '1-8%'
    );

    // Late minutes validation
    const lateRecords = await prisma.studentPeriodAttendance.findMany({
      where: { 
        session: { branchId: 'dps-main' },
        status: 'late'
      },
      select: { minutesLate: true }
    });

    const invalidLateMinutes = lateRecords.filter(r => !r.minutesLate || r.minutesLate < 1 || r.minutesLate > 60);
    
    this.addResult(
      'Attendance Patterns',
      'Late Minutes Validity',
      invalidLateMinutes.length === 0 ? 'PASS' : 'FAIL',
      invalidLateMinutes.length,
      0,
      invalidLateMinutes.length > 0 ? 'Some late records have invalid minute values' : undefined
    );
  }

  async validateTemporalConsistency() {
    console.log('🗓️ Validating temporal consistency...');

    // Check date range
    const dateRange = await prisma.$queryRaw`
      SELECT 
        MIN(s.date) as min_date,
        MAX(s.date) as max_date,
        COUNT(DISTINCT s.date) as unique_dates
      FROM "AttendanceSession" s
      WHERE s."branchId" = 'dps-main'
    ` as { min_date: Date; max_date: Date; unique_dates: bigint }[];

    const { min_date, max_date, unique_dates } = dateRange[0];
    const expectedStart = new Date('2025-09-01');
    const expectedEnd = new Date('2025-12-31');
    
    this.addResult(
      'Temporal Consistency',
      'Date Range Coverage',
      min_date <= expectedStart && max_date >= expectedEnd ? 'PASS' : 'WARNING',
      `${format(min_date, 'MMM dd')} - ${format(max_date, 'MMM dd')}`,
      `${format(expectedStart, 'MMM dd')} - ${format(expectedEnd, 'MMM dd')}`
    );

    this.addResult(
      'Temporal Consistency',
      'Unique Dates',
      Number(unique_dates) >= 60 ? 'PASS' : 'WARNING',
      Number(unique_dates),
      '60+',
      'Should have attendance for at least 60 working days'
    );

    // Check for Sunday sessions (should not exist)
    const sundaySessions = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "AttendanceSession" s
      WHERE s."branchId" = 'dps-main'
        AND EXTRACT(DOW FROM s.date) = 0
    ` as { count: bigint }[];
    
    this.addResult(
      'Temporal Consistency',
      'No Sunday Sessions',
      Number(sundaySessions[0].count) === 0 ? 'PASS' : 'FAIL',
      Number(sundaySessions[0].count),
      0,
      Number(sundaySessions[0].count) > 0 ? 'Found attendance sessions on Sundays' : undefined
    );

    // Check marking time consistency
    const inconsistentMarkings = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "StudentPeriodAttendance" spa
      JOIN "AttendanceSession" s ON spa."sessionId" = s.id
      WHERE s."branchId" = 'dps-main'
        AND spa."markedAt" < s."startTime"
    ` as { count: bigint }[];
    
    this.addResult(
      'Temporal Consistency',
      'Marking Time Logic',
      Number(inconsistentMarkings[0].count) === 0 ? 'PASS' : 'FAIL',
      Number(inconsistentMarkings[0].count),
      0,
      Number(inconsistentMarkings[0].count) > 0 ? 'Some attendance marked before session start' : undefined
    );
  }

  async validateIndianContext() {
    console.log('🇮🇳 Validating Indian context features...');

    // Check for Hindi subject sessions
    const hindiSessions = await prisma.attendanceSession.count({
      where: { 
        branchId: 'dps-main',
        subject: { name: { contains: 'Hindi' } }
      }
    });
    
    this.addResult(
      'Indian Context',
      'Hindi Subject Coverage',
      hindiSessions > 0 ? 'PASS' : 'WARNING',
      hindiSessions,
      '> 0',
      hindiSessions === 0 ? 'No Hindi subject sessions found' : undefined
    );

    // Check for Indian festival dates (no attendance)
    const festivalDates = ['2025-10-02', '2025-11-12', '2025-12-25']; // Gandhi Jayanti, Diwali, Christmas
    
    for (const festivalDate of festivalDates) {
      const festivalSessions = await prisma.attendanceSession.count({
        where: { 
          branchId: 'dps-main',
          date: new Date(festivalDate)
        }
      });
      
      this.addResult(
        'Indian Context',
        `No Sessions on ${festivalDate}`,
        festivalSessions === 0 ? 'PASS' : 'WARNING',
        festivalSessions,
        0,
        festivalSessions > 0 ? `Found sessions on festival date ${festivalDate}` : undefined
      );
    }

    // Check for Indian context in absence reasons
    const absenceReasons = await prisma.studentPeriodAttendance.findMany({
      where: { 
        session: { branchId: 'dps-main' },
        status: 'absent',
        reason: { not: null }
      },
      select: { reason: true }
    });

    const indianContextTerms = ['fever', 'family function', 'festival', 'monsoon', 'traffic', 'transport'];
    const contextualReasons = absenceReasons.filter(r => 
      indianContextTerms.some(term => r.reason?.toLowerCase().includes(term))
    );
    
    const contextPercentage = (contextualReasons.length / absenceReasons.length) * 100;
    
    this.addResult(
      'Indian Context',
      'Contextual Absence Reasons',
      contextPercentage >= 70 ? 'PASS' : 'WARNING',
      `${contextPercentage.toFixed(1)}%`,
      '≥ 70%',
      contextPercentage < 70 ? 'Low percentage of Indian context in absence reasons' : undefined
    );
  }

  async validatePerformanceMetrics() {
    console.log('⚡ Validating performance metrics...');

    // Check record volume
    const totalSessions = await prisma.attendanceSession.count({
      where: { branchId: 'dps-main' }
    });

    const totalAttendanceRecords = await prisma.studentPeriodAttendance.count({
      where: { session: { branchId: 'dps-main' } }
    });

    this.addResult(
      'Performance',
      'Session Volume',
      totalSessions >= 1000 ? 'PASS' : 'WARNING',
      totalSessions.toLocaleString(),
      '≥ 1,000',
      totalSessions < 1000 ? 'Low session volume may not be sufficient for testing' : undefined
    );

    this.addResult(
      'Performance',
      'Attendance Record Volume',
      totalAttendanceRecords >= 50000 ? 'PASS' : 'WARNING',
      totalAttendanceRecords.toLocaleString(),
      '≥ 50,000',
      totalAttendanceRecords < 50000 ? 'Low attendance record volume' : undefined
    );

    // Check average records per session
    const avgRecordsPerSession = totalAttendanceRecords / totalSessions;
    
    this.addResult(
      'Performance',
      'Average Records per Session',
      avgRecordsPerSession >= 20 && avgRecordsPerSession <= 50 ? 'PASS' : 'WARNING',
      avgRecordsPerSession.toFixed(1),
      '20-50',
      'Based on typical class sizes'
    );
  }

  async generateDetailedReport() {
    console.log('📈 Generating detailed statistics...');

    // Monthly breakdown
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(s.date, 'YYYY-MM') as month,
        spa.status,
        COUNT(*) as count
      FROM "StudentPeriodAttendance" spa
      JOIN "AttendanceSession" s ON spa."sessionId" = s.id
      WHERE s."branchId" = 'dps-main'
      GROUP BY TO_CHAR(s.date, 'YYYY-MM'), spa.status
      ORDER BY month, spa.status
    ` as any[];

    // Class-wise statistics
    const classStats = await prisma.$queryRaw`
      SELECT 
        c.name as class_name,
        COUNT(DISTINCT spa.id) as total_records,
        COUNT(CASE WHEN spa.status = 'present' THEN 1 END) as present_count,
        ROUND(
          COUNT(CASE WHEN spa.status = 'present' THEN 1 END) * 100.0 / COUNT(spa.id), 
          2
        ) as attendance_rate
      FROM "StudentPeriodAttendance" spa
      JOIN "AttendanceSession" s ON spa."sessionId" = s.id
      JOIN "Section" sec ON s."sectionId" = sec.id
      JOIN "Class" c ON sec."classId" = c.id
      WHERE s."branchId" = 'dps-main'
      GROUP BY c.name
      ORDER BY c.name
    ` as any[];

    // Subject-wise statistics
    const subjectStats = await prisma.$queryRaw`
      SELECT 
        sub.name as subject_name,
        COUNT(DISTINCT spa.id) as total_records,
        ROUND(
          COUNT(CASE WHEN spa.status = 'present' THEN 1 END) * 100.0 / COUNT(spa.id), 
          2
        ) as attendance_rate
      FROM "StudentPeriodAttendance" spa
      JOIN "AttendanceSession" s ON spa."sessionId" = s.id
      JOIN "Subject" sub ON s."subjectId" = sub.id
      WHERE s."branchId" = 'dps-main'
      GROUP BY sub.name
      ORDER BY attendance_rate DESC
    ` as any[];

    return {
      monthlyStats,
      classStats,
      subjectStats
    };
  }

  async printReport() {
    const detailedStats = await this.generateDetailedReport();
    
    console.log('\n');
    console.log('===============================================================================');
    console.log('                    ATTENDANCE DATA VALIDATION REPORT');
    console.log('                         DPS Main Campus (dps-main)');
    console.log('                    Period: September 2025 - December 2025');
    console.log('===============================================================================');
    
    // Summary
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    const warningCount = this.results.filter(r => r.status === 'WARNING').length;
    const totalTests = this.results.length;
    const successRate = (passCount / totalTests * 100).toFixed(1);
    
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ PASS: ${passCount}`);
    console.log(`❌ FAIL: ${failCount}`);
    console.log(`⚠️  WARNING: ${warningCount}`);
    console.log(`Success Rate: ${successRate}%`);
    
    // Detailed results by category
    const categories = [...new Set(this.results.map(r => r.category))];
    
    for (const category of categories) {
      console.log(`\n🔍 ${category.toUpperCase()}`);
      console.log('─────────────────────────────────────────────────────────────────────────────');
      
      const categoryResults = this.results.filter(r => r.category === category);
      for (const result of categoryResults) {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
        const valueStr = result.value !== undefined ? ` (${result.value})` : '';
        const expectedStr = result.expected !== undefined ? ` Expected: ${result.expected}` : '';
        
        console.log(`${icon} ${result.test}${valueStr}${expectedStr}`);
        if (result.details) {
          console.log(`   Details: ${result.details}`);
        }
      }
    }
    
    // Detailed statistics
    console.log('\n📈 DETAILED STATISTICS');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    
    console.log('\n📅 Monthly Breakdown:');
    const monthlyData = new Map();
    for (const record of detailedStats.monthlyStats) {
      if (!monthlyData.has(record.month)) {
        monthlyData.set(record.month, { present: 0, total: 0 });
      }
      const data = monthlyData.get(record.month);
      if (record.status === 'present') data.present = record.count;
      data.total += record.count;
    }
    
    for (const [month, data] of monthlyData) {
      const rate = ((data.present / data.total) * 100).toFixed(1);
      console.log(`   ${month}: ${data.total.toLocaleString()} records, ${rate}% attendance`);
    }
    
    console.log('\n📚 Class-wise Attendance Rates:');
    for (const classData of detailedStats.classStats) {
      console.log(`   ${classData.class_name}: ${classData.attendance_rate}% (${classData.total_records.toLocaleString()} records)`);
    }
    
    console.log('\n📖 Subject-wise Attendance (Top 10):');
    for (const subjectData of detailedStats.subjectStats.slice(0, 10)) {
      console.log(`   ${subjectData.subject_name}: ${subjectData.attendance_rate}%`);
    }
    
    console.log('\n===============================================================================');
    
    // Final assessment
    if (failCount === 0 && warningCount <= 2) {
      console.log('🏆 OVERALL ASSESSMENT: EXCELLENT - Data is ready for production use');
    } else if (failCount === 0) {
      console.log('✅ OVERALL ASSESSMENT: GOOD - Minor warnings, data is suitable for demo');
    } else if (failCount <= 2) {
      console.log('⚠️  OVERALL ASSESSMENT: NEEDS ATTENTION - Some critical issues found');
    } else {
      console.log('❌ OVERALL ASSESSMENT: CRITICAL ISSUES - Data requires significant fixes');
    }
    
    console.log('===============================================================================\n');
  }

  async runAllValidations() {
    await this.validateDataIntegrity();
    await this.validateAttendancePatterns();
    await this.validateTemporalConsistency();
    await this.validateIndianContext();
    await this.validatePerformanceMetrics();
    await this.printReport();
    
    return this.results;
  }
}

async function main() {
  console.log('🔍 Starting comprehensive attendance data validation...');
  console.log('🏫 Branch: DPS Main Campus (dps-main)');
  console.log('📅 Period: September 2025 - December 2025\n');
  
  try {
    const validator = new AttendanceValidator();
    const results = await validator.runAllValidations();
    
    const hasFailures = results.some(r => r.status === 'FAIL');
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { AttendanceValidator };