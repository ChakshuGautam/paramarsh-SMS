#!/usr/bin/env tsx

/**
 * Teacher Attendance Generator for Extended Period (September - December 2025)
 * Generates realistic Indian school teacher attendance data
 * 
 * Features:
 * - Realistic attendance patterns (85-90% present rate)
 * - Indian working calendar (Mon-Sat, excludes major holidays)
 * - Multiple status types: PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE
 * - Contextual remarks and leave types
 * - Proper check-in/out times based on status
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Configuration
const BRANCH_ID = 'dps-main';
const START_DATE = new Date('2025-09-01');
const END_DATE = new Date('2025-12-31');

// Attendance Status Distribution (Indian School Pattern)
const STATUS_DISTRIBUTION = {
  PRESENT: 87,    // 87% present
  LATE: 4,        // 4% late arrivals
  HALF_DAY: 3,    // 3% half days
  ON_LEAVE: 3,    // 3% planned leaves
  ABSENT: 3,      // 3% unexpected absences
};

// Indian School Working Hours
const NORMAL_CHECK_IN = '08:00';
const NORMAL_CHECK_OUT = '15:30';
const LATE_CHECK_IN_RANGE = ['08:10', '09:30'];
const HALF_DAY_MORNING_OUT = '11:30';
const HALF_DAY_EVENING_IN = '11:30';

// Indian Holidays (September - December 2025)
const INDIAN_HOLIDAYS_2025 = [
  '2025-09-07', // Janmashtami
  '2025-09-17', // Ganesh Chaturthi
  '2025-10-02', // Gandhi Jayanti
  '2025-10-12', // Dussehra
  '2025-10-31', // Diwali
  '2025-11-01', // Govardhan Puja
  '2025-11-05', // Bhai Dooj
  '2025-12-25', // Christmas
];

// Leave Types for Indian Context
const LEAVE_TYPES = ['CASUAL', 'SICK', 'EARNED'];

// Realistic remarks for different statuses
const REMARKS = {
  ABSENT: [
    'Family emergency',
    'Medical appointment',
    'Personal work',
    'Transportation issue',
    'Child sick',
    'Doctor visit',
    'Court appearance',
    'Family function'
  ],
  LATE: [
    'Traffic jam',
    'Vehicle breakdown',
    'Medical emergency at home',
    'Child drop-off delay',
    'Metro/bus delay',
    'Weather conditions',
    'Family urgent work',
    'Doctor appointment ran late'
  ],
  HALF_DAY: [
    'Medical appointment',
    'Personal work',
    'Child parent-teacher meeting',
    'Government office work',
    'Family function',
    'Urgent family matter'
  ],
  ON_LEAVE: [
    'Planned vacation',
    'Medical leave',
    'Family wedding',
    'Religious festival',
    'Child admission work',
    'House relocation',
    'Casual leave'
  ]
};

/**
 * Check if a date is a working day (excludes Sundays and holidays)
 */
function isWorkingDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  
  // Exclude Sundays (0) and holidays
  return dayOfWeek !== 0 && !INDIAN_HOLIDAYS_2025.includes(dateStr);
}

/**
 * Generate all working days between start and end date
 */
function generateWorkingDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    if (isWorkingDay(currentDate)) {
      days.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

/**
 * Get weighted random status based on distribution
 */
function getWeightedRandomStatus(): keyof typeof STATUS_DISTRIBUTION {
  const rand = Math.random() * 100;
  let cumulative = 0;
  
  for (const [status, weight] of Object.entries(STATUS_DISTRIBUTION)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return status as keyof typeof STATUS_DISTRIBUTION;
    }
  }
  
  return 'PRESENT';
}

/**
 * Generate check-in time based on status
 */
function generateCheckInTime(status: string): string | null {
  switch (status) {
    case 'PRESENT':
      // Normal check-in with slight variations (07:45 - 08:15)
      const minutes = faker.number.int({ min: -15, max: 15 });
      const baseTime = new Date(`2000-01-01T08:00:00`);
      baseTime.setMinutes(baseTime.getMinutes() + minutes);
      return baseTime.toTimeString().substring(0, 5);
      
    case 'LATE':
      // Late arrivals between 08:10 - 09:30
      const lateHour = faker.number.int({ min: 8, max: 9 });
      const lateMinute = lateHour === 8 
        ? faker.number.int({ min: 10, max: 59 })
        : faker.number.int({ min: 0, max: 30 });
      return `${lateHour.toString().padStart(2, '0')}:${lateMinute.toString().padStart(2, '0')}`;
      
    case 'HALF_DAY':
      // Half day - either morning (normal check-in) or evening (11:30 check-in)
      return faker.datatype.boolean() ? NORMAL_CHECK_IN : HALF_DAY_EVENING_IN;
      
    case 'ABSENT':
    case 'ON_LEAVE':
      return null;
      
    default:
      return NORMAL_CHECK_IN;
  }
}

/**
 * Generate check-out time based on status and check-in time
 */
function generateCheckOutTime(status: string, checkIn: string | null): string | null {
  if (!checkIn) return null;
  
  switch (status) {
    case 'PRESENT':
    case 'LATE':
      // Normal check-out with slight variations (15:15 - 15:45)
      const minutes = faker.number.int({ min: -15, max: 15 });
      const baseTime = new Date(`2000-01-01T15:30:00`);
      baseTime.setMinutes(baseTime.getMinutes() + minutes);
      return baseTime.toTimeString().substring(0, 5);
      
    case 'HALF_DAY':
      // Half day - either 11:30 or normal checkout
      return checkIn === HALF_DAY_EVENING_IN ? NORMAL_CHECK_OUT : HALF_DAY_MORNING_OUT;
      
    case 'ABSENT':
    case 'ON_LEAVE':
      return null;
      
    default:
      return NORMAL_CHECK_OUT;
  }
}

/**
 * Get random remark for a status
 */
function getRandomRemark(status: string): string | null {
  const remarks = REMARKS[status as keyof typeof REMARKS];
  return remarks ? faker.helpers.arrayElement(remarks) : null;
}

/**
 * Get random leave type for ON_LEAVE status
 */
function getRandomLeaveType(): string {
  return faker.helpers.arrayElement(LEAVE_TYPES);
}

/**
 * Generate teacher attendance for a specific teacher and date
 */
async function generateAttendanceRecord(teacherId: string, date: Date) {
  const status = getWeightedRandomStatus();
  const checkIn = generateCheckInTime(status);
  const checkOut = generateCheckOutTime(status, checkIn);
  const remarks = getRandomRemark(status);
  const leaveType = status === 'ON_LEAVE' ? getRandomLeaveType() : null;
  
  const dateStr = date.toISOString().split('T')[0];
  
  return {
    branchId: BRANCH_ID,
    teacherId,
    date: dateStr,
    checkIn,
    checkOut,
    status,
    leaveType,
    remarks,
  };
}

/**
 * Main function to generate extended teacher attendance data
 */
async function generateExtendedTeacherAttendance() {
  console.log('🚀 Starting Extended Teacher Attendance Generation...');
  console.log(`📅 Period: ${START_DATE.toDateString()} to ${END_DATE.toDateString()}`);
  console.log(`🏫 Branch: ${BRANCH_ID}`);
  
  try {
    // Get all teachers for the branch
    const teachers = await prisma.teacher.findMany({
      where: { branchId: BRANCH_ID },
      include: { staff: true },
    });
    
    console.log(`👥 Found ${teachers.length} teachers in ${BRANCH_ID} branch`);
    
    if (teachers.length === 0) {
      console.log('❌ No teachers found for branch. Please run seed data first.');
      return;
    }
    
    // Generate working days
    const workingDays = generateWorkingDays(START_DATE, END_DATE);
    console.log(`📋 Generated ${workingDays.length} working days`);
    console.log(`🚫 Excluded ${INDIAN_HOLIDAYS_2025.length} Indian holidays`);
    
    // Clear existing attendance data for the period
    console.log('🧹 Clearing existing attendance data for the period...');
    await prisma.teacherAttendance.deleteMany({
      where: {
        branchId: BRANCH_ID,
        date: {
          gte: START_DATE.toISOString().split('T')[0],
          lte: END_DATE.toISOString().split('T')[0],
        },
      },
    });
    
    // Generate attendance records
    let totalRecords = 0;
    const batchSize = 100;
    const totalExpected = teachers.length * workingDays.length;
    
    console.log(`📊 Expected total records: ${totalExpected.toLocaleString()}`);
    
    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      const attendanceRecords = [];
      
      console.log(`👨‍🏫 Processing Teacher ${i + 1}/${teachers.length}: ${teacher.staff.firstName} ${teacher.staff.lastName}`);
      
      for (const date of workingDays) {
        const record = await generateAttendanceRecord(teacher.id, date);
        attendanceRecords.push(record);
        
        // Insert in batches for better performance
        if (attendanceRecords.length >= batchSize) {
          await prisma.teacherAttendance.createMany({
            data: attendanceRecords,
            skipDuplicates: true,
          });
          totalRecords += attendanceRecords.length;
          attendanceRecords.length = 0;
        }
      }
      
      // Insert remaining records
      if (attendanceRecords.length > 0) {
        await prisma.teacherAttendance.createMany({
          data: attendanceRecords,
          skipDuplicates: true,
        });
        totalRecords += attendanceRecords.length;
      }
    }
    
    console.log(`✅ Generated ${totalRecords.toLocaleString()} teacher attendance records`);
    
    // Generate statistics
    await generateAttendanceStatistics();
    
  } catch (error) {
    console.error('❌ Error generating teacher attendance:', error);
    throw error;
  }
}

/**
 * Generate and display attendance statistics
 */
async function generateAttendanceStatistics() {
  console.log('\n📊 ATTENDANCE STATISTICS REPORT');
  console.log('=' .repeat(50));
  
  try {
    // Overall statistics
    const totalRecords = await prisma.teacherAttendance.count({
      where: { branchId: BRANCH_ID },
    });
    
    // Status distribution
    const statusStats = await prisma.teacherAttendance.groupBy({
      by: ['status'],
      where: { branchId: BRANCH_ID },
      _count: { status: true },
    });
    
    console.log(`📋 Total Records: ${totalRecords.toLocaleString()}`);
    console.log('\n📈 Status Distribution:');
    
    for (const stat of statusStats) {
      const percentage = ((stat._count.status / totalRecords) * 100).toFixed(1);
      console.log(`   ${stat.status.padEnd(12)}: ${stat._count.status.toString().padStart(6)} (${percentage}%)`);
    }
    
    // Leave type distribution
    const leaveStats = await prisma.teacherAttendance.groupBy({
      by: ['leaveType'],
      where: { 
        branchId: BRANCH_ID,
        leaveType: { not: null }
      },
      _count: { leaveType: true },
    });
    
    if (leaveStats.length > 0) {
      console.log('\n🏖️  Leave Type Distribution:');
      for (const stat of leaveStats) {
        console.log(`   ${stat.leaveType?.padEnd(12)}: ${stat._count.leaveType}`);
      }
    }
    
    // Monthly breakdown
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM date::date) as year,
        EXTRACT(MONTH FROM date::date) as month,
        status,
        COUNT(*) as count
      FROM "TeacherAttendance" 
      WHERE "branchId" = ${BRANCH_ID}
      GROUP BY EXTRACT(YEAR FROM date::date), EXTRACT(MONTH FROM date::date), status
      ORDER BY year, month, status
    `;
    
    console.log('\n📅 Monthly Breakdown:');
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let currentMonth = '';
    for (const stat of monthlyStats as any[]) {
      const monthKey = `${months[stat.month]} ${stat.year}`;
      if (currentMonth !== monthKey) {
        if (currentMonth) console.log('');
        console.log(`   ${monthKey}:`);
        currentMonth = monthKey;
      }
      console.log(`     ${stat.status.padEnd(12)}: ${stat.count}`);
    }
    
    console.log('\n🎯 Data Quality Metrics:');
    
    // Check for missing data
    const workingDays = generateWorkingDays(START_DATE, END_DATE);
    const teacherCount = await prisma.teacher.count({ where: { branchId: BRANCH_ID } });
    const expectedRecords = workingDays.length * teacherCount;
    const coverage = ((totalRecords / expectedRecords) * 100).toFixed(1);
    
    console.log(`   Expected Records: ${expectedRecords.toLocaleString()}`);
    console.log(`   Actual Records:   ${totalRecords.toLocaleString()}`);
    console.log(`   Coverage:         ${coverage}%`);
    
    // Check for realistic patterns
    const avgPresentRate = statusStats.find(s => s.status === 'PRESENT')?._count.status || 0;
    const presentRate = ((avgPresentRate / totalRecords) * 100).toFixed(1);
    console.log(`   Present Rate:     ${presentRate}% (Target: 85-90%)`);
    
    const lateRate = statusStats.find(s => s.status === 'LATE')?._count.status || 0;
    const latePercent = ((lateRate / totalRecords) * 100).toFixed(1);
    console.log(`   Late Rate:        ${latePercent}% (Target: 3-5%)`);
    
    console.log('\n✅ Extended Teacher Attendance Generation Complete!');
    
  } catch (error) {
    console.error('❌ Error generating statistics:', error);
  }
}

/**
 * Validation function to verify data quality
 */
async function validateGeneratedData() {
  console.log('\n🔍 VALIDATING GENERATED DATA');
  console.log('=' .repeat(40));
  
  try {
    // Check for duplicate records
    const duplicates = await prisma.$queryRaw`
      SELECT "teacherId", "date", COUNT(*) as count
      FROM "TeacherAttendance"
      WHERE "branchId" = ${BRANCH_ID}
      GROUP BY "teacherId", "date"
      HAVING COUNT(*) > 1
    `;
    
    console.log(`🔍 Duplicate Records: ${(duplicates as any[]).length}`);
    
    // Check for data integrity
    const inconsistentRecords = await prisma.teacherAttendance.count({
      where: {
        branchId: BRANCH_ID,
        OR: [
          // Present/Late should have check-in times
          {
            status: { in: ['PRESENT', 'LATE'] },
            checkIn: null
          },
          // Absent/On-leave should NOT have check-in times
          {
            status: { in: ['ABSENT', 'ON_LEAVE'] },
            checkIn: { not: null }
          },
          // On-leave should have leave type
          {
            status: 'ON_LEAVE',
            leaveType: null
          }
        ]
      }
    });
    
    console.log(`⚠️  Inconsistent Records: ${inconsistentRecords}`);
    
    // Check date range coverage
    const dateRange = await prisma.teacherAttendance.aggregate({
      where: { branchId: BRANCH_ID },
      _min: { date: true },
      _max: { date: true },
    });
    
    console.log(`📅 Date Range: ${dateRange._min.date} to ${dateRange._max.date}`);
    
    if (inconsistentRecords === 0 && (duplicates as any[]).length === 0) {
      console.log('✅ Data validation passed!');
    } else {
      console.log('❌ Data validation found issues!');
    }
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await generateExtendedTeacherAttendance();
    await validateGeneratedData();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { generateExtendedTeacherAttendance, generateAttendanceStatistics, validateGeneratedData };