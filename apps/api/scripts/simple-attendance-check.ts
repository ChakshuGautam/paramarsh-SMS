#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAttendanceData() {
  try {
    console.log('🔍 Checking Teacher Attendance Data...');
    
    // Check total records
    const totalRecords = await prisma.teacherAttendance.count({
      where: { branchId: 'dps-main' }
    });
    
    console.log(`📊 Total Attendance Records: ${totalRecords}`);
    
    if (totalRecords > 0) {
      // Get sample records
      const sampleRecords = await prisma.teacherAttendance.findMany({
        where: { branchId: 'dps-main' },
        take: 5,
        orderBy: { date: 'desc' }
      });
      
      console.log('\n📝 Sample Records:');
      for (const record of sampleRecords) {
        console.log(`   Date: ${record.date}, Status: ${record.status}, Check-in: ${record.checkIn}, Check-out: ${record.checkOut}`);
      }
      
      // Check status distribution
      const statusCounts = await prisma.teacherAttendance.groupBy({
        by: ['status'],
        where: { branchId: 'dps-main' },
        _count: { status: true }
      });
      
      console.log('\n📈 Status Distribution:');
      for (const status of statusCounts) {
        const percentage = ((status._count.status / totalRecords) * 100).toFixed(1);
        console.log(`   ${status.status}: ${status._count.status} (${percentage}%)`);
      }
      
    } else {
      console.log('❌ No attendance records found for dps-main branch');
      
      // Check if teachers exist
      const teacherCount = await prisma.teacher.count({
        where: { branchId: 'dps-main' }
      });
      
      console.log(`👥 Teachers in dps-main branch: ${teacherCount}`);
      
      if (teacherCount > 0) {
        console.log('📋 Teachers found, but no attendance data. Please run the attendance generator.');
      } else {
        console.log('❌ No teachers found in dps-main branch. Please check your data.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAttendanceData();