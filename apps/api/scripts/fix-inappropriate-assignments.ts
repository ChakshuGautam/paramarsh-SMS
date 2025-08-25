#!/usr/bin/env tsx

/**
 * Fix Inappropriate Subject-Grade Assignments
 * 
 * This script removes inappropriate timetable period assignments and replaces
 * them with grade-appropriate subjects.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Grade level mapping for Indian education system
const GRADE_LEVEL_MAPPING: Record<string, number> = {
  'Nursery': 0,
  'LKG': 1, 
  'UKG': 2,
  'Class 1': 3,
  'Class 2': 4,
  'Class 3': 5,
  'Class 4': 6,
  'Class 5': 7,
  'Class 6': 8,
  'Class 7': 9,
  'Class 8': 10,
  'Class 9': 11,
  'Class 10': 12,
  'Class 11': 13,
  'Class 12': 14
};

// Expected subject-grade mapping based on Indian education system
const SUBJECT_GRADE_RULES = [
  { name: 'English', minGrade: 0, maxGrade: 14 },
  { name: 'Hindi', minGrade: 0, maxGrade: 14 },
  { name: 'Mathematics', minGrade: 0, maxGrade: 14 },
  { name: 'Art & Craft', minGrade: 0, maxGrade: 14 },
  { name: 'Music', minGrade: 0, maxGrade: 14 },
  { name: 'Physical Education', minGrade: 0, maxGrade: 14 },
  { name: 'Environmental Science', minGrade: 0, maxGrade: 4 },
  { name: 'Science', minGrade: 3, maxGrade: 7 },
  { name: 'Social Studies', minGrade: 3, maxGrade: 7 },
  { name: 'Computer Science', minGrade: 3, maxGrade: 14 },
  { name: 'Sanskrit', minGrade: 5, maxGrade: 14 },
  { name: 'History', minGrade: 8, maxGrade: 14 },
  { name: 'Geography', minGrade: 8, maxGrade: 14 },
  { name: 'Physics', minGrade: 11, maxGrade: 14 },
  { name: 'Chemistry', minGrade: 11, maxGrade: 14 },
  { name: 'Biology', minGrade: 11, maxGrade: 14 },
  { name: 'Economics', minGrade: 11, maxGrade: 14 },
  { name: 'Political Science', minGrade: 11, maxGrade: 14 }
];

function getGradeLevelFromClassName(className: string): number {
  return GRADE_LEVEL_MAPPING[className] || 0;
}

function isSubjectAppropriateForGrade(subjectName: string, gradeLevel: number): boolean {
  const rule = SUBJECT_GRADE_RULES.find(r => r.name === subjectName);
  if (!rule) return true;
  
  return gradeLevel >= rule.minGrade && gradeLevel <= rule.maxGrade;
}

function getAppropriateSubjectsForGrade(gradeLevel: number): string[] {
  return SUBJECT_GRADE_RULES
    .filter(rule => gradeLevel >= rule.minGrade && gradeLevel <= rule.maxGrade)
    .map(rule => rule.name);
}

async function fixInappropriateAssignments() {
  console.log('🔧 FIXING INAPPROPRIATE SUBJECT-GRADE ASSIGNMENTS');
  console.log('=' .repeat(60));
  console.log(`📅 Started: ${new Date().toISOString()}\n`);

  try {
    // Get all timetable periods with inappropriate assignments
    const periods = await prisma.timetablePeriod.findMany({
      include: {
        subject: true,
        section: {
          include: {
            class: true
          }
        }
      }
    });

    console.log(`📊 Found ${periods.length} timetable periods to check\n`);

    const inappropriatePeroids = [];
    const fixes = [];

    for (const period of periods) {
      if (!period.subject || !period.section?.class) continue;

      const className = period.section.class.name;
      const subjectName = period.subject.name;
      const gradeLevel = period.section.class.gradeLevel || getGradeLevelFromClassName(className);
      const branchId = period.branchId;

      const isAppropriate = isSubjectAppropriateForGrade(subjectName, gradeLevel);

      if (!isAppropriate) {
        inappropriatePeroids.push(period);
        
        // Find appropriate subjects for this grade level in this branch
        const appropriateSubjectNames = getAppropriateSubjectsForGrade(gradeLevel);
        const availableSubjects = await prisma.subject.findMany({
          where: {
            branchId: branchId,
            name: { in: appropriateSubjectNames }
          }
        });

        if (availableSubjects.length > 0) {
          const newSubject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
          fixes.push({
            periodId: period.id,
            oldSubject: subjectName,
            newSubject: newSubject.name,
            newSubjectId: newSubject.id,
            className: className,
            gradeLevel: gradeLevel
          });
        }
      }
    }

    console.log(`❌ Found ${inappropriatePeroids.length} inappropriate assignments`);
    console.log(`🔧 Can fix ${fixes.length} assignments\n`);

    if (fixes.length === 0) {
      console.log('✅ No inappropriate assignments found or no fixes available');
      return;
    }

    // Group fixes by issue type for better reporting
    const fixesByIssue: Record<string, any[]> = {};
    fixes.forEach(fix => {
      const key = `${fix.oldSubject} → ${fix.className}`;
      if (!fixesByIssue[key]) fixesByIssue[key] = [];
      fixesByIssue[key].push(fix);
    });

    console.log('🔧 FIXES TO BE APPLIED:');
    console.log('-'.repeat(30));
    Object.entries(fixesByIssue).forEach(([issueType, fixList]) => {
      console.log(`📝 ${issueType}: ${fixList.length} cases`);
      const sampleFixes = fixList.slice(0, 3);
      sampleFixes.forEach(fix => {
        console.log(`   ➜ Replace ${fix.oldSubject} with ${fix.newSubject}`);
      });
      if (fixList.length > 3) {
        console.log(`   ... and ${fixList.length - 3} more`);
      }
    });

    console.log('\n🚀 Applying fixes...');
    let fixedCount = 0;

    for (const fix of fixes) {
      try {
        await prisma.timetablePeriod.update({
          where: { id: fix.periodId },
          data: { subjectId: fix.newSubjectId }
        });
        fixedCount++;

        if (fixedCount % 50 === 0) {
          console.log(`   ✅ Fixed ${fixedCount}/${fixes.length} assignments...`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to fix period ${fix.periodId}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully fixed ${fixedCount}/${fixes.length} assignments`);

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const remainingIssues = await prisma.timetablePeriod.findMany({
      where: {
        id: { in: fixes.map(f => f.periodId) }
      },
      include: {
        subject: true,
        section: {
          include: {
            class: true
          }
        }
      }
    });

    let stillInappropriate = 0;
    for (const period of remainingIssues) {
      if (!period.subject || !period.section?.class) continue;
      
      const gradeLevel = period.section.class.gradeLevel || getGradeLevelFromClassName(period.section.class.name);
      if (!isSubjectAppropriateForGrade(period.subject.name, gradeLevel)) {
        stillInappropriate++;
      }
    }

    if (stillInappropriate === 0) {
      console.log('🎉 All inappropriate assignments have been fixed!');
    } else {
      console.log(`⚠️  ${stillInappropriate} assignments still inappropriate after fixes`);
    }

  } catch (error) {
    console.error('❌ Fix process failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixInappropriateAssignments().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});