#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleCheck() {
  try {
    console.log('🔍 Checking ClassSubjectTeacher table...');
    
    const count = await prisma.classSubjectTeacher.count();
    console.log(`📊 Total ClassSubjectTeacher records: ${count}`);
    
    if (count > 0) {
      // Get a few sample records
      const samples = await prisma.classSubjectTeacher.findMany({
        take: 5,
        include: {
          class: true,
          subject: true,
          teacher: {
            include: {
              staff: true
            }
          }
        }
      });
      
      console.log('\n📚 Sample records:');
      samples.forEach((record, index) => {
        console.log(`${index + 1}. Branch: ${record.branchId}`);
        console.log(`   Class: ${record.class.name} (Grade ${record.class.gradeLevel})`);
        console.log(`   Subject: ${record.subject.name}`);
        console.log(`   Teacher: ${record.teacher.staff?.firstName} ${record.teacher.staff?.lastName}`);
        console.log('');
      });
      
      console.log('✅ ClassSubjectTeacher relationships are working!');
    } else {
      console.log('❌ No ClassSubjectTeacher records found');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleCheck();