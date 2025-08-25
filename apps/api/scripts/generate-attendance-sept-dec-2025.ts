#!/usr/bin/env tsx

/**
 * Generate Comprehensive Student Attendance Data
 * Period: September 2025 - December 2025
 * Scope: DPS Main Campus (dps-main)
 * 
 * Features:
 * - Realistic Indian student attendance patterns (88-92% present)
 * - Period-based attendance for each timetable session
 * - Various attendance statuses with appropriate reasons
 * - Indian working calendar (Monday-Saturday, excluding holidays)
 * - Contextual late arrivals and absence reasons
 */

import { PrismaClient } from '@prisma/client';
import { addDays, format, isSunday, startOfMonth, endOfMonth, eachDayOfInterval, isAfter, isBefore } from 'date-fns';

const prisma = new PrismaClient();

// Indian holidays and special events (September-December 2025)
const INDIAN_HOLIDAYS_2025 = [
  // September 2025
  '2025-09-02', // Ganesh Chaturthi
  '2025-09-07', // Teachers' Day
  '2025-09-12', // Eid-e-Milad
  '2025-09-17', // Vishwakarma Puja

  // October 2025
  '2025-10-02', // Gandhi Jayanti
  '2025-10-20', // Karva Chauth
  '2025-10-24', // Dussehra
  '2025-10-31', // Bhai Dooj

  // November 2025
  '2025-11-01', // Diwali Holiday
  '2025-11-12', // Diwali
  '2025-11-13', // Govardhan Puja
  '2025-11-14', // Bhai Dooj
  '2025-11-15', // Guru Nanak Jayanti

  // December 2025
  '2025-12-25', // Christmas
  '2025-12-31'  // New Year's Eve (Half day)
];

// Indian context absence reasons
const ABSENCE_REASONS = [
  'Fever and cold symptoms',
  'Family function attendance',
  'Medical check-up appointment',
  'Stomach upset and digestive issues',
  'Transport strike in locality',
  'Monsoon flooding in residential area',
  'Power cut affecting morning preparation',
  'Visiting relative in hospital',
  'Religious ceremony at home',
  'Seasonal flu and body ache',
  'Eye infection and treatment',
  'Family wedding in native place',
  'Dengue fever symptoms',
  'Throat infection and voice loss',
  'Academic competition in another school'
];

// Late arrival reasons (Indian context)
const LATE_REASONS = [
  'Traffic jam on main road',
  'Auto-rickshaw breakdown',
  'Bus delayed due to road construction',
  'Heavy rainfall and waterlogging',
  'School transport mechanical issue',
  'Power outage affecting morning routine',
  'Medical emergency at home',
  'Festival preparations at home',
  'Metro/train service disruption',
  'Road accident causing traffic diversion'
];

// Medical leave reasons
const MEDICAL_REASONS = [
  'Doctor prescribed bed rest',
  'Physiotherapy session appointment',
  'Dental treatment procedure',
  'Eye examination and correction',
  'Blood test and medical consultation',
  'Vaccination schedule appointment',
  'Specialist doctor consultation',
  'Minor surgical procedure recovery',
  'Allergy treatment and monitoring',
  'Chest X-ray and pulmonary check-up'
];

// Excused absence reasons
const EXCUSED_REASONS = [
  'School-approved educational trip',
  'Representing school in sports competition',
  'Academic olympiad participation',
  'Cultural program rehearsal',
  'Parent-teacher conference attendance',
  'Library research project work',
  'Science exhibition participation',
  'Inter-school debate competition',
  'Community service project',
  'Academic counselling session'
];

interface AttendancePattern {
  present: number;
  absent: number;
  late: number;
  excused: number;
  medical: number;
}

// Realistic Indian student attendance patterns
const ATTENDANCE_PATTERNS: { [key: string]: AttendancePattern } = {
  excellent: { present: 92, absent: 3, late: 3, excused: 1, medical: 1 },
  good: { present: 88, absent: 5, late: 4, excused: 2, medical: 1 },
  average: { present: 85, absent: 7, late: 5, excused: 2, medical: 1 },
  poor: { present: 78, absent: 12, late: 6, excused: 2, medical: 2 }
};

// Distribution of attendance patterns
const PATTERN_DISTRIBUTION = {
  excellent: 0.25,  // 25% excellent attendees
  good: 0.45,       // 45% good attendees
  average: 0.25,    // 25% average attendees
  poor: 0.05        // 5% poor attendees
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getWorkingDays(startDate: Date, endDate: Date): Date[] {
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  return allDays.filter(day => {
    // Exclude Sundays
    if (isSunday(day)) return false;
    
    // Exclude Indian holidays
    const dateStr = format(day, 'yyyy-MM-dd');
    if (INDIAN_HOLIDAYS_2025.includes(dateStr)) return false;
    
    return true;
  });
}

function assignAttendancePattern(studentId: string): string {
  const hash = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const normalized = (hash % 100) / 100;
  
  if (normalized < PATTERN_DISTRIBUTION.excellent) return 'excellent';
  if (normalized < PATTERN_DISTRIBUTION.excellent + PATTERN_DISTRIBUTION.good) return 'good';
  if (normalized < PATTERN_DISTRIBUTION.excellent + PATTERN_DISTRIBUTION.good + PATTERN_DISTRIBUTION.average) return 'average';
  return 'poor';
}

function getAttendanceStatus(pattern: AttendancePattern): string {
  const total = pattern.present + pattern.absent + pattern.late + pattern.excused + pattern.medical;
  const rand = Math.random() * total;
  
  if (rand < pattern.present) return 'present';
  if (rand < pattern.present + pattern.absent) return 'absent';
  if (rand < pattern.present + pattern.absent + pattern.late) return 'late';
  if (rand < pattern.present + pattern.absent + pattern.late + pattern.excused) return 'excused';
  return 'medical';
}

function getContextualReason(status: string): string {
  switch (status) {
    case 'absent':
      return getRandomElement(ABSENCE_REASONS);
    case 'late':
      return getRandomElement(LATE_REASONS);
    case 'medical':
      return getRandomElement(MEDICAL_REASONS);
    case 'excused':
      return getRandomElement(EXCUSED_REASONS);
    default:
      return '';
  }
}

function getRandomLateMinutes(): number {
  // Realistic late arrival patterns (5-35 minutes)
  const patterns = [
    { min: 5, max: 10, weight: 0.4 },   // Most common: 5-10 minutes
    { min: 11, max: 20, weight: 0.35 }, // Moderate: 11-20 minutes
    { min: 21, max: 30, weight: 0.20 }, // Significant: 21-30 minutes
    { min: 31, max: 35, weight: 0.05 }  // Severe: 31-35 minutes
  ];
  
  const rand = Math.random();
  let cumulative = 0;
  
  for (const pattern of patterns) {
    cumulative += pattern.weight;
    if (rand < cumulative) {
      return Math.floor(Math.random() * (pattern.max - pattern.min + 1)) + pattern.min;
    }
  }
  
  return 10; // Default fallback
}

function getPeriodTiming(periodNumber: number, dayOfWeek: number): { startTime: Date, endTime: Date } {
  // Standard Indian school timing (8:00 AM - 3:30 PM)
  const baseDate = new Date();
  baseDate.setHours(8, 0, 0, 0); // Start at 8:00 AM
  
  // Standard 40-minute periods with 5-minute breaks, 20-minute lunch
  const periodDuration = 40;
  const shortBreak = 5;
  const lunchBreak = 20;
  
  let startMinutes = 0;
  
  for (let i = 1; i < periodNumber; i++) {
    startMinutes += periodDuration;
    if (i === 3) {
      startMinutes += lunchBreak; // Lunch break after 3rd period
    } else {
      startMinutes += shortBreak;
    }
  }
  
  const startTime = new Date(baseDate.getTime() + startMinutes * 60000);
  const endTime = new Date(startTime.getTime() + periodDuration * 60000);
  
  return { startTime, endTime };
}

async function generateAttendanceSessions() {
  console.log('🕐 Generating attendance sessions for September-December 2025...');
  
  const startDate = new Date('2025-09-01');
  const endDate = new Date('2025-12-31');
  const workingDays = getWorkingDays(startDate, endDate);
  
  console.log(`📅 Found ${workingDays.length} working days between ${format(startDate, 'MMM dd')} and ${format(endDate, 'MMM dd')}`);
  
  // Get all timetable periods for DPS main
  const timetablePeriods = await prisma.timetablePeriod.findMany({
    where: {
      branchId: 'dps-main',
      isBreak: false, // Exclude break periods from attendance
    },
    include: {
      section: true,
      subject: true,
      teacher: true
    }
  });
  
  console.log(`📚 Found ${timetablePeriods.length} timetable periods for attendance tracking`);
  
  let sessionCount = 0;
  const batchSize = 100;
  let sessionBatch = [];
  
  for (const workingDay of workingDays) {
    for (const period of timetablePeriods) {
      const { startTime, endTime } = getPeriodTiming(period.periodNumber, period.dayOfWeek);
      
      // Set the correct date for the timing
      const sessionDate = new Date(workingDay);
      const sessionStartTime = new Date(sessionDate);
      sessionStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
      
      const sessionEndTime = new Date(sessionDate);
      sessionEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
      
      // Only create sessions for matching day of week
      if (sessionDate.getDay() === period.dayOfWeek) {
        const sessionData = {
          id: `session_${period.id}_${format(sessionDate, 'yyyy-MM-dd')}`,
          branchId: 'dps-main',
          date: sessionDate,
          periodId: period.id,
          sectionId: period.sectionId,
          subjectId: period.subjectId!,
          assignedTeacherId: period.teacherId!,
          actualTeacherId: period.teacherId!, // No substitutions for now
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          status: 'completed'
        };
        
        sessionBatch.push(sessionData);
        sessionCount++;
        
        // Insert in batches for performance
        if (sessionBatch.length >= batchSize) {
          await prisma.attendanceSession.createMany({
            data: sessionBatch,
            skipDuplicates: true
          });
          sessionBatch = [];
        }
      }
    }
  }
  
  // Insert remaining sessions
  if (sessionBatch.length > 0) {
    await prisma.attendanceSession.createMany({
      data: sessionBatch,
      skipDuplicates: true
    });
  }
  
  console.log(`✅ Generated ${sessionCount} attendance sessions`);
  return sessionCount;
}

async function generateStudentAttendanceRecords() {
  console.log('👥 Generating student attendance records...');
  
  // Get all students in DPS main
  const students = await prisma.student.findMany({
    where: { branchId: 'dps-main' },
    include: {
      enrollments: {
        include: { section: true }
      }
    }
  });
  
  console.log(`👨‍🎓 Found ${students.length} students for attendance generation`);
  
  // Get all attendance sessions
  const sessions = await prisma.attendanceSession.findMany({
    where: { branchId: 'dps-main' },
    include: {
      section: true,
      subject: true
    }
  });
  
  console.log(`📝 Processing ${sessions.length} attendance sessions`);
  
  let recordCount = 0;
  const batchSize = 200;
  let recordBatch = [];
  
  // Assign attendance patterns to students
  const studentPatterns = new Map<string, string>();
  for (const student of students) {
    studentPatterns.set(student.id, assignAttendancePattern(student.id));
  }
  
  for (const session of sessions) {
    // Get students enrolled in this section
    const sectionStudents = students.filter(student => 
      student.enrollments.some(enrollment => enrollment.sectionId === session.sectionId)
    );
    
    for (const student of sectionStudents) {
      const patternType = studentPatterns.get(student.id)!;
      const pattern = ATTENDANCE_PATTERNS[patternType];
      const status = getAttendanceStatus(pattern);
      
      const attendanceRecord = {
        id: `attendance_${session.id}_${student.id}`,
        sessionId: session.id,
        studentId: student.id,
        status,
        minutesLate: status === 'late' ? getRandomLateMinutes() : null,
        reason: status !== 'present' ? getContextualReason(status) : null,
        markedAt: new Date(session.startTime!.getTime() + (Math.random() * 10 + 5) * 60000), // Marked 5-15 minutes after class starts
        markedBy: session.assignedTeacherId,
        notes: status === 'medical' ? 'Medical certificate required' : null
      };
      
      recordBatch.push(attendanceRecord);
      recordCount++;
      
      // Insert in batches for performance
      if (recordBatch.length >= batchSize) {
        await prisma.studentPeriodAttendance.createMany({
          data: recordBatch,
          skipDuplicates: true
        });
        recordBatch = [];
        
        // Progress update
        if (recordCount % 10000 === 0) {
          console.log(`  📊 Generated ${recordCount} attendance records...`);
        }
      }
    }
  }
  
  // Insert remaining records
  if (recordBatch.length > 0) {
    await prisma.studentPeriodAttendance.createMany({
      data: recordBatch,
      skipDuplicates: true
    });
  }
  
  console.log(`✅ Generated ${recordCount} student attendance records`);
  return recordCount;
}

async function generateAttendanceStatistics() {
  console.log('📊 Generating attendance statistics...');
  
  // Overall attendance statistics
  const totalRecords = await prisma.studentPeriodAttendance.count({
    where: {
      session: { branchId: 'dps-main' }
    }
  });
  
  const statusCounts = await prisma.studentPeriodAttendance.groupBy({
    by: ['status'],
    where: {
      session: { branchId: 'dps-main' }
    },
    _count: true
  });
  
  // Monthly breakdown
  const monthlyStats = await prisma.$queryRaw`
    SELECT 
      EXTRACT(MONTH FROM s.date) as month,
      EXTRACT(YEAR FROM s.date) as year,
      spa.status,
      COUNT(*) as count
    FROM "StudentPeriodAttendance" spa
    JOIN "AttendanceSession" s ON spa."sessionId" = s.id
    WHERE s."branchId" = 'dps-main'
    GROUP BY EXTRACT(MONTH FROM s.date), EXTRACT(YEAR FROM s.date), spa.status
    ORDER BY year, month, spa.status
  ` as any[];
  
  // Class-wise statistics
  const classStats = await prisma.$queryRaw`
    SELECT 
      c.name as class_name,
      sec.name as section_name,
      spa.status,
      COUNT(*) as count
    FROM "StudentPeriodAttendance" spa
    JOIN "AttendanceSession" s ON spa."sessionId" = s.id
    JOIN "Section" sec ON s."sectionId" = sec.id
    JOIN "Class" c ON sec."classId" = c.id
    WHERE s."branchId" = 'dps-main'
    GROUP BY c.name, sec.name, spa.status
    ORDER BY c.name, sec.name, spa.status
  ` as any[];
  
  return {
    totalRecords,
    statusCounts,
    monthlyStats,
    classStats
  };
}

async function main() {
  console.log('🚀 Starting comprehensive attendance data generation for DPS Main Campus');
  console.log('📅 Period: September 2025 - December 2025');
  console.log('🏫 Branch: dps-main');
  console.log('');
  
  try {
    // Step 1: Generate attendance sessions
    const sessionCount = await generateAttendanceSessions();
    
    // Step 2: Generate student attendance records
    const recordCount = await generateStudentAttendanceRecords();
    
    // Step 3: Generate statistics
    const stats = await generateAttendanceStatistics();
    
    console.log('');
    console.log('📈 ATTENDANCE GENERATION SUMMARY');
    console.log('========================================');
    console.log(`📅 Period: September 2025 - December 2025`);
    console.log(`🏫 Branch: DPS Main Campus (dps-main)`);
    console.log(`📝 Total Sessions: ${sessionCount.toLocaleString()}`);
    console.log(`👥 Total Attendance Records: ${recordCount.toLocaleString()}`);
    console.log('');
    
    console.log('📊 ATTENDANCE STATUS DISTRIBUTION');
    console.log('----------------------------------------');
    for (const status of stats.statusCounts) {
      const percentage = ((status._count / stats.totalRecords) * 100).toFixed(1);
      console.log(`${status.status.toUpperCase()}: ${status._count.toLocaleString()} (${percentage}%)`);
    }
    
    console.log('');
    console.log('🗓️  MONTHLY BREAKDOWN');
    console.log('----------------------------------------');
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyTotals = new Map();
    for (const record of stats.monthlyStats) {
      const key = `${monthNames[record.month]} ${record.year}`;
      if (!monthlyTotals.has(key)) {
        monthlyTotals.set(key, { present: 0, absent: 0, late: 0, excused: 0, medical: 0, total: 0 });
      }
      const monthData = monthlyTotals.get(key);
      monthData[record.status] = record.count;
      monthData.total += record.count;
    }
    
    for (const [month, data] of monthlyTotals) {
      const presentRate = ((data.present / data.total) * 100).toFixed(1);
      console.log(`${month}: ${data.total.toLocaleString()} records, ${presentRate}% present`);
    }
    
    console.log('');
    console.log('🎯 INDIAN CONTEXT FEATURES IMPLEMENTED');
    console.log('----------------------------------------');
    console.log('✅ Realistic absence reasons (fever, family functions, transport issues)');
    console.log('✅ Contextual late arrival reasons (traffic, rainfall, transport delays)');
    console.log('✅ Indian working calendar (Monday-Saturday, excluding major holidays)');
    console.log('✅ Medical leave patterns with certificate requirements');
    console.log('✅ Excused absences for school activities and competitions');
    console.log('✅ Regional attendance patterns reflecting Indian student behavior');
    console.log('✅ Festival and holiday considerations in attendance tracking');
    console.log('');
    
    console.log('🏆 ATTENDANCE DATA GENERATION COMPLETED SUCCESSFULLY!');
    console.log('🎉 Ready for comprehensive attendance analysis and reporting');
    
  } catch (error) {
    console.error('❌ Error generating attendance data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as generateAttendanceSeptDec2025 };