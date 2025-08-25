#!/usr/bin/env bun

/**
 * Check current AttendanceSession data and related entities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function checkAttendanceSessions() {
  console.log('🔍 Checking AttendanceSession data...\n');

  try {
    // Check AttendanceSession count
    const attendanceSessions = await prisma.attendanceSession.count({
      where: { branchId: 'branch1' }
    });
    console.log(`📊 AttendanceSession records: ${attendanceSessions}`);

    // Check TimetablePeriod count
    const timetablePeriods = await prisma.timetablePeriod.count({
      where: { branchId: 'branch1' }
    });
    console.log(`📚 TimetablePeriod records: ${timetablePeriods}`);

    // Check Sections count
    const sections = await prisma.section.count({
      where: { branchId: 'branch1' }
    });
    console.log(`🏫 Section records: ${sections}`);

    // Check Students count
    const students = await prisma.student.count({
      where: { branchId: 'branch1' }
    });
    console.log(`👨‍🎓 Student records: ${students}`);

    // Check Teachers count
    const teachers = await prisma.teacher.count({
      where: { branchId: 'branch1' }
    });
    console.log(`👩‍🏫 Teacher records: ${teachers}`);

    // Check Subjects count
    const subjects = await prisma.subject.count({
      where: { branchId: 'branch1' }
    });
    console.log(`📖 Subject records: ${subjects}`);

    console.log('\n');

    // Sample data from existing records
    if (timetablePeriods > 0) {
      console.log('📋 Sample TimetablePeriod records:');
      const samplePeriods = await prisma.timetablePeriod.findMany({
        where: { branchId: 'branch1' },
        take: 3,
        include: {
          section: true,
          subject: true,
          teacher: {
            include: {
              staff: true
            }
          },
        }
      });
      
      samplePeriods.forEach((period, index) => {
        console.log(`${index + 1}. Section: ${period.section.name}, Subject: ${period.subject?.name || 'N/A'}, Teacher: ${period.teacher?.staff?.firstName || 'N/A'} ${period.teacher?.staff?.lastName || ''}`);
      });
    }

    if (sections > 0) {
      console.log('\n🏫 Sample Section records:');
      const sampleSections = await prisma.section.findMany({
        where: { branchId: 'branch1' },
        take: 5,
        include: {
          class: true,
        }
      });
      
      sampleSections.forEach((section, index) => {
        console.log(`${index + 1}. ${section.class?.name || 'Unknown'}-${section.name} (ID: ${section.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAttendanceSessions();

export { checkAttendanceSessions };