#!/usr/bin/env tsx

/**
 * Quick test script to verify StudentPeriodAttendance creation works
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAttendanceCreation() {
  console.log('🧪 Testing StudentPeriodAttendance creation...');
  
  try {
    // Find an existing attendance session
    const session = await prisma.attendanceSession.findFirst({
      include: {
        section: {
          select: { id: true }
        }
      }
    });
    
    if (!session) {
      console.log('❌ No attendance sessions found');
      return;
    }
    
    console.log(`✅ Found attendance session: ${session.id}`);
    
    // Find a student in this section
    const student = await prisma.student.findFirst({
      where: { sectionId: session.sectionId }
    });
    
    if (!student) {
      console.log('❌ No students found in section');
      return;
    }
    
    console.log(`✅ Found student: ${student.firstName} ${student.lastName}`);
    
    // Find a teacher
    const teacher = await prisma.teacher.findFirst();
    
    if (!teacher) {
      console.log('❌ No teachers found');
      return;
    }
    
    console.log(`✅ Found teacher: ${teacher.id}`);
    
    // Test creating a single StudentPeriodAttendance record
    const attendanceRecord = await prisma.studentPeriodAttendance.create({
      data: {
        sessionId: session.id,
        studentId: student.id,
        status: 'present',
        minutesLate: null,
        reason: null,
        markedAt: new Date(),
        markedBy: teacher.id
      }
    });
    
    console.log(`✅ Successfully created StudentPeriodAttendance: ${attendanceRecord.id}`);
    console.log(`   Status: ${attendanceRecord.status}`);
    console.log(`   Marked at: ${attendanceRecord.markedAt}`);
    
    // Clean up the test record
    await prisma.studentPeriodAttendance.delete({
      where: { id: attendanceRecord.id }
    });
    
    console.log('✅ Test record cleaned up successfully');
    console.log('🎉 StudentPeriodAttendance creation test PASSED');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testAttendanceCreation();
}