#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateClassSubjectTeacher() {
  console.log('🔍 Validating ClassSubjectTeacher junction table relationships...\n');
  
  try {
    // 1. Check total ClassSubjectTeacher records
    const totalCount = await prisma.classSubjectTeacher.count();
    console.log(`📊 Total ClassSubjectTeacher records: ${totalCount}`);
    
    // 2. Check distribution by branch
    const branches = await prisma.tenant.findMany();
    console.log('\n🏫 Branch-wise ClassSubjectTeacher distribution:');
    console.log('Branch ID'.padEnd(20) + 'Assignments'.padEnd(12) + 'Classes'.padEnd(10) + 'Teachers'.padEnd(10) + 'Subjects');
    console.log('-'.repeat(60));
    
    for (const branch of branches) {
      const assignments = await prisma.classSubjectTeacher.count({
        where: { branchId: branch.id }
      });
      
      const classes = await prisma.class.count({
        where: { branchId: branch.id }
      });
      
      const teachers = await prisma.teacher.count({
        where: { branchId: branch.id }
      });
      
      const subjects = await prisma.subject.count({
        where: { branchId: branch.id }
      });
      
      console.log(
        branch.id.padEnd(20) + 
        String(assignments).padEnd(12) + 
        String(classes).padEnd(10) + 
        String(teachers).padEnd(10) + 
        String(subjects)
      );
    }
    
    // 3. Sample some records with details
    console.log('\n📚 Sample ClassSubjectTeacher assignments (first 10 records):');
    const sampleRecords = await prisma.classSubjectTeacher.findMany({
      take: 10,
      include: {
        class: { select: { name: true, gradeLevel: true } },
        subject: { select: { name: true } },
        teacher: { 
          include: { 
            staff: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
    
    console.log('\nClass'.padEnd(15) + 'Subject'.padEnd(20) + 'Teacher'.padEnd(25) + 'Branch');
    console.log('-'.repeat(75));
    
    for (const record of sampleRecords) {
      const teacherName = record.teacher.staff ? 
        `${record.teacher.staff.firstName} ${record.teacher.staff.lastName}` : 
        'Unknown Teacher';
      
      console.log(
        record.class.name.padEnd(15) + 
        record.subject.name.padEnd(20) + 
        teacherName.padEnd(25) + 
        record.branchId
      );
    }
    
    // 4. Validate relationships integrity
    console.log('\n🔗 Validating relationship integrity...');
    
    const orphanedAssignments = await prisma.classSubjectTeacher.count({
      where: {
        OR: [
          { class: null },
          { subject: null },
          { teacher: null }
        ]
      }
    });
    
    console.log(`✅ Orphaned assignments: ${orphanedAssignments} (should be 0)`);
    
    // 5. Check for duplicate assignments
    console.log('\n🔍 Checking for duplicate assignments...');
    const duplicates = await prisma.$queryRaw<{ count: number; classId: string; subjectId: string; teacherId: string }[]>`
      SELECT COUNT(*) as count, "classId", "subjectId", "teacherId"
      FROM "ClassSubjectTeacher"
      GROUP BY "classId", "subjectId", "teacherId"
      HAVING COUNT(*) > 1
    `;
    
    console.log(`✅ Duplicate assignments found: ${duplicates.length} (should be 0)`);
    
    // 6. Grade-appropriate subject assignment check
    console.log('\n📚 Checking grade-appropriate subject assignments...');
    
    const inappropriateAssignments = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM "ClassSubjectTeacher" cst
      JOIN "Class" c ON cst."classId" = c.id
      JOIN "Subject" s ON cst."subjectId" = s.id
      WHERE 
        (c."gradeLevel" <= 5 AND s.name IN ('Physics', 'Chemistry', 'Biology', 'Economics', 'Political Science')) OR
        (c."gradeLevel" <= 8 AND s.name IN ('Economics', 'Political Science')) OR
        (c."gradeLevel" >= 11 AND s.name IN ('Environmental Science'))
    `;
    
    const inappropriateCount = inappropriateAssignments[0]?.count || 0;
    console.log(`✅ Grade-inappropriate assignments: ${inappropriateCount} (should be 0)`);
    
    // 7. Summary
    console.log('\n📋 VALIDATION SUMMARY:');
    console.log(`✅ Total ClassSubjectTeacher records: ${totalCount}`);
    console.log(`✅ All ${branches.length} branches have assignments: ${branches.every(b => branches.length > 0) ? 'YES' : 'NO'}`);
    console.log(`✅ No orphaned relationships: ${orphanedAssignments === 0 ? 'YES' : 'NO'}`);
    console.log(`✅ No duplicate assignments: ${duplicates.length === 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Grade-appropriate assignments: ${inappropriateCount === 0 ? 'YES' : 'NO'}`);
    
    if (totalCount > 0 && orphanedAssignments === 0 && duplicates.length === 0 && inappropriateCount === 0) {
      console.log('\n🎉 VALIDATION PASSED: ClassSubjectTeacher relationships are properly implemented!');
    } else {
      console.log('\n❌ VALIDATION FAILED: Issues found with ClassSubjectTeacher relationships');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation
validateClassSubjectTeacher().catch(console.error);