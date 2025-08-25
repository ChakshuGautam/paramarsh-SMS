import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BRANCH_ID = 'dps-main'; // Delhi Public School - Main Campus

// Generate date range for attendance (last 30 days)
function generateDateRange(days: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Only include working days (Monday to Saturday)
    if ([1, 2, 3, 4, 5, 6].includes(date.getDay())) {
      dates.push(date);
    }
  }
  
  return dates;
}

async function generateStudentPeriodAttendance() {
  console.log('👥 Generating student period attendance (optimized)...');
  
  // Get a sample of sessions to avoid overwhelming the system
  const sessions = await prisma.attendanceSession.findMany({
    where: { branchId: BRANCH_ID },
    take: 1000, // Process 1000 sessions at a time
    include: {
      section: true
    }
  });
  
  console.log(`Processing ${sessions.length} sessions...`);
  
  let attendanceRecordsCreated = 0;
  let batchData = [];
  
  for (const session of sessions) {
    // Get students for this section (limit to avoid huge batches)
    const students = await prisma.student.findMany({
      where: {
        branchId: BRANCH_ID,
        sectionId: session.sectionId,
        status: 'active'
      },
      take: 30 // Limit to 30 students per session for performance
    });
    
    for (const student of students) {
      // Generate realistic attendance patterns
      const random = Math.random();
      let status = 'present';
      let minutesLate = null;
      let reason = null;
      
      if (random < 0.05) { // 5% absent
        status = 'absent';
        reason = ['Sick', 'Family function', 'Medical appointment'][Math.floor(Math.random() * 3)];
      } else if (random < 0.08) { // 3% late
        status = 'late';
        minutesLate = Math.floor(Math.random() * 30) + 5;
        reason = 'Traffic delay';
      } else if (random < 0.10) { // 2% excused
        status = 'excused';
        reason = 'School activity';
      }
      
      batchData.push({
        sessionId: session.id,
        studentId: student.id,
        status: status,
        minutesLate: minutesLate,
        reason: reason,
        markedAt: session.startTime || new Date(),
        markedBy: session.actualTeacherId
      });
      
      // Process in batches of 500
      if (batchData.length >= 500) {
        try {
          await prisma.studentPeriodAttendance.createMany({
            data: batchData,
            skipDuplicates: true
          });
          attendanceRecordsCreated += batchData.length;
          console.log(`✅ Created ${attendanceRecordsCreated} student attendance records so far...`);
        } catch (error) {
          console.log(`⚠️ Batch insert failed, continuing...`);
        }
        batchData = [];
      }
    }
  }
  
  // Process remaining batch
  if (batchData.length > 0) {
    try {
      await prisma.studentPeriodAttendance.createMany({
        data: batchData,
        skipDuplicates: true
      });
      attendanceRecordsCreated += batchData.length;
    } catch (error) {
      console.log(`⚠️ Final batch insert failed`);
    }
  }
  
  console.log(`✅ Created ${attendanceRecordsCreated} student attendance records`);
}

async function generateTeacherAttendance() {
  console.log('👨‍🏫 Generating teacher attendance...');
  
  const teachers = await prisma.teacher.findMany({
    where: { branchId: BRANCH_ID }
  });
  
  const dates = generateDateRange(30);
  console.log(`Generating teacher attendance for ${teachers.length} teachers over ${dates.length} days`);
  
  let batchData = [];
  let teacherAttendanceCreated = 0;
  
  for (const teacher of teachers) {
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic teacher attendance
      const random = Math.random();
      let status = 'PRESENT';
      let checkIn = '08:00';
      let checkOut = '15:30';
      let leaveType = null;
      let remarks = null;
      
      if (random < 0.02) { // 2% absent
        status = 'ABSENT';
        checkIn = null;
        checkOut = null;
        remarks = 'Sick leave';
      } else if (random < 0.04) { // 2% on leave
        status = 'ON_LEAVE';
        leaveType = ['CASUAL', 'SICK', 'EARNED'][Math.floor(Math.random() * 3)];
        checkIn = null;
        checkOut = null;
      } else if (random < 0.08) { // 4% late
        status = 'LATE';
        const lateMinutes = Math.floor(Math.random() * 60) + 10;
        const lateHour = Math.floor(lateMinutes / 60);
        const lateMins = lateMinutes % 60;
        checkIn = `${8 + lateHour}:${String(lateMins).padStart(2, '0')}`;
        remarks = 'Traffic/Personal reason';
      } else if (random < 0.12) { // 4% half day
        status = 'HALF_DAY';
        if (Math.random() < 0.5) {
          checkIn = '08:00';
          checkOut = '11:30';
          remarks = 'Half day - morning';
        } else {
          checkIn = '11:30';
          checkOut = '15:30';
          remarks = 'Half day - afternoon';
        }
      }
      
      batchData.push({
        branchId: BRANCH_ID,
        teacherId: teacher.id,
        date: dateStr,
        checkIn: checkIn,
        checkOut: checkOut,
        status: status,
        leaveType: leaveType,
        remarks: remarks
      });
      
      // Process in batches of 200
      if (batchData.length >= 200) {
        try {
          await prisma.teacherAttendance.createMany({
            data: batchData,
            skipDuplicates: true
          });
          teacherAttendanceCreated += batchData.length;
          console.log(`✅ Created ${teacherAttendanceCreated} teacher attendance records so far...`);
        } catch (error) {
          console.log(`⚠️ Teacher attendance batch insert failed, continuing...`);
        }
        batchData = [];
      }
    }
  }
  
  // Process remaining batch
  if (batchData.length > 0) {
    try {
      await prisma.teacherAttendance.createMany({
        data: batchData,
        skipDuplicates: true
      });
      teacherAttendanceCreated += batchData.length;
    } catch (error) {
      console.log(`⚠️ Final teacher attendance batch failed`);
    }
  }
  
  console.log(`✅ Created ${teacherAttendanceCreated} teacher attendance records`);
}

async function validateAttendanceData() {
  console.log('🔍 Validating attendance data...');
  
  const stats = {
    attendanceSessions: await prisma.attendanceSession.count({ where: { branchId: BRANCH_ID } }),
    studentAttendance: await prisma.studentPeriodAttendance.count(),
    teacherAttendance: await prisma.teacherAttendance.count({ where: { branchId: BRANCH_ID } }),
    students: await prisma.student.count({ where: { branchId: BRANCH_ID, status: 'active' } }),
    teachers: await prisma.teacher.count({ where: { branchId: BRANCH_ID } })
  };
  
  console.log('📊 FINAL ATTENDANCE DATA SUMMARY:');
  console.log('='.repeat(40));
  console.log(`📋 Attendance Sessions: ${stats.attendanceSessions.toLocaleString()}`);
  console.log(`👥 Student Attendance Records: ${stats.studentAttendance.toLocaleString()}`);
  console.log(`👨‍🏫 Teacher Attendance Records: ${stats.teacherAttendance.toLocaleString()}`);
  console.log(`👨‍🎓 Active Students: ${stats.students.toLocaleString()}`);
  console.log(`👩‍🏫 Teachers: ${stats.teachers.toLocaleString()}`);
  
  console.log('\n✅ ATTENDANCE DATA GENERATION COMPLETE!');
  console.log('🎯 Both student and teacher attendance endpoints should now have data');
}

async function main() {
  console.log('⚡ COMPLETING ATTENDANCE DATA GENERATION');
  console.log('='.repeat(50));
  console.log(`🏫 Target Branch: ${BRANCH_ID}`);
  
  try {
    // Generate student attendance records (optimized batch processing)
    await generateStudentPeriodAttendance();
    
    // Generate teacher attendance records
    await generateTeacherAttendance();
    
    // Validate the completed data
    await validateAttendanceData();
    
    console.log('\n🎉 ATTENDANCE DATA COMPLETION SUCCESS!');
    console.log('✨ All attendance endpoints should now return comprehensive data');
    
  } catch (error) {
    console.error('❌ Error completing attendance data:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Completion failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });