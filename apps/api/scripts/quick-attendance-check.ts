#!/usr/bin/env tsx

/**
 * Quick Attendance Data Check
 * Check the current state of attendance data generation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking current attendance data status...');
  
  try {
    // Check attendance sessions
    const sessionCount = await prisma.attendanceSession.count({
      where: { branchId: 'dps-main' }
    });
    
    // Check attendance records
    const recordCount = await prisma.studentPeriodAttendance.count({
      where: { session: { branchId: 'dps-main' } }
    });
    
    // Check timetable periods
    const periodCount = await prisma.timetablePeriod.count({
      where: { branchId: 'dps-main' }
    });
    
    // Check students
    const studentCount = await prisma.student.count({
      where: { branchId: 'dps-main' }
    });
    
    // Check subjects
    const subjectCount = await prisma.subject.count({
      where: { branchId: 'dps-main' }
    });
    
    // Check sections
    const sectionCount = await prisma.section.count({
      where: { branchId: 'dps-main' }
    });
    
    // Status distribution
    if (recordCount > 0) {
      const statusDistribution = await prisma.studentPeriodAttendance.groupBy({
        by: ['status'],
        where: { session: { branchId: 'dps-main' } },
        _count: true
      });
      
      console.log('\n📊 CURRENT STATUS SUMMARY');
      console.log('=========================');
      console.log(`👨‍🎓 Students: ${studentCount.toLocaleString()}`);
      console.log(`🏫 Sections: ${sectionCount}`);
      console.log(`📚 Subjects: ${subjectCount}`);
      console.log(`🗓️ Timetable Periods: ${periodCount.toLocaleString()}`);
      console.log(`📝 Attendance Sessions: ${sessionCount.toLocaleString()}`);
      console.log(`👥 Attendance Records: ${recordCount.toLocaleString()}`);
      
      console.log('\n📈 Attendance Status Distribution:');
      for (const status of statusDistribution) {
        const percentage = ((status._count / recordCount) * 100).toFixed(1);
        console.log(`   ${status.status.toUpperCase()}: ${status._count.toLocaleString()} (${percentage}%)`);
      }
      
      // Calculate average records per student
      const avgRecordsPerStudent = Math.round(recordCount / studentCount);
      console.log(`\n📊 Average records per student: ${avgRecordsPerStudent}`);
      
      // Estimate completion if still running
      const expectedTotalRecords = sessionCount * studentCount * 0.4; // Rough estimate based on enrollment
      if (recordCount < expectedTotalRecords * 0.9) {
        const completionPercentage = (recordCount / expectedTotalRecords) * 100;
        console.log(`\n⏳ Estimated completion: ${completionPercentage.toFixed(1)}%`);
        console.log(`   Expected total: ~${Math.round(expectedTotalRecords).toLocaleString()} records`);
      } else {
        console.log(`\n✅ Data generation appears complete!`);
      }
      
    } else {
      console.log('\n⚠️  No attendance records found yet');
      console.log('     Setup may still be in progress...');
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}