#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function main() {
  try {
    console.log('Checking database...');
    
    const count = await prisma.attendanceSession.count();
    console.log('AttendanceSession count:', count);
    
    const periods = await prisma.timetablePeriod.count();
    console.log('TimetablePeriod count:', periods);
    
    const sections = await prisma.section.count();
    console.log('Section count:', sections);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();