#!/usr/bin/env tsx

/**
 * Grade-Appropriate Subject Assignment Validation
 * 
 * This script validates that no inappropriate subject-class assignments exist
 * in the database after seeding. It checks for issues like Geography being 
 * assigned to Nursery classes.
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
  // Early Childhood (Nursery=0, LKG=1, UKG=2)
  { name: 'English', minGrade: 0, maxGrade: 14 },
  { name: 'Hindi', minGrade: 0, maxGrade: 14 },
  { name: 'Mathematics', minGrade: 0, maxGrade: 14 },
  { name: 'Art & Craft', minGrade: 0, maxGrade: 14 },
  { name: 'Music', minGrade: 0, maxGrade: 14 },
  { name: 'Physical Education', minGrade: 0, maxGrade: 14 },
  { name: 'Environmental Science', minGrade: 0, maxGrade: 4 },

  // Primary Grades (Class 1-5 = grade 3-7)
  { name: 'Science', minGrade: 3, maxGrade: 7 },
  { name: 'Social Studies', minGrade: 3, maxGrade: 7 },
  { name: 'Computer Science', minGrade: 3, maxGrade: 14 },
  { name: 'Sanskrit', minGrade: 5, maxGrade: 14 },

  // Middle Grades (Class 6-8 = grade 8-10)  
  { name: 'History', minGrade: 6, maxGrade: 14 },
  { name: 'Geography', minGrade: 6, maxGrade: 14 },

  // Secondary Grades (Class 9-12 = grade 11-14)
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
  if (!rule) return true; // Allow unknown subjects for now
  
  return gradeLevel >= rule.minGrade && gradeLevel <= rule.maxGrade;
}

async function validateGradeAppropriateSubjects() {
  console.log('🔍 GRADE-APPROPRIATE SUBJECT VALIDATION');
  console.log('=' .repeat(60));
  console.log(`📅 Generated: ${new Date().toISOString()}\n`);

  try {
    // Get all timetable periods with subject, class, and section information
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

    console.log(`📊 Found ${periods.length} timetable periods to validate\n`);

    const inappropriateAssignments = [];
    const appropriateAssignments = [];
    const branchSummary: Record<string, any> = {};

    for (const period of periods) {
      if (!period.subject || !period.section?.class) continue;

      const className = period.section.class.name;
      const subjectName = period.subject.name;
      const sectionName = period.section.name;
      const branchId = period.branchId;
      const gradeLevel = period.section.class.gradeLevel || getGradeLevelFromClassName(className);

      // Initialize branch summary
      if (!branchSummary[branchId]) {
        branchSummary[branchId] = {
          total: 0,
          appropriate: 0,
          inappropriate: 0,
          issues: []
        };
      }
      branchSummary[branchId].total++;

      const isAppropriate = isSubjectAppropriateForGrade(subjectName, gradeLevel);

      if (isAppropriate) {
        appropriateAssignments.push({
          branchId,
          className,
          sectionName,
          subjectName,
          gradeLevel
        });
        branchSummary[branchId].appropriate++;
      } else {
        const rule = SUBJECT_GRADE_RULES.find(r => r.name === subjectName);
        const minGradeName = Object.keys(GRADE_LEVEL_MAPPING).find(k => GRADE_LEVEL_MAPPING[k] === rule?.minGrade) || `Grade ${rule?.minGrade}`;
        
        inappropriateAssignments.push({
          branchId,
          className,
          sectionName,
          subjectName,
          gradeLevel,
          issue: `${subjectName} should start from ${minGradeName}, not ${className}`,
          dayOfWeek: period.dayOfWeek,
          periodNumber: period.periodNumber
        });
        branchSummary[branchId].inappropriate++;
        branchSummary[branchId].issues.push(`${className}-${sectionName}: ${subjectName}`);
      }
    }

    // Print detailed results
    console.log('📊 VALIDATION RESULTS');
    console.log('-'.repeat(40));
    console.log(`✅ Appropriate Assignments: ${appropriateAssignments.length}`);
    console.log(`❌ Inappropriate Assignments: ${inappropriateAssignments.length}`);
    console.log(`📈 Success Rate: ${((appropriateAssignments.length / (appropriateAssignments.length + inappropriateAssignments.length)) * 100).toFixed(1)}%\n`);

    // Branch-wise summary
    console.log('🏫 BRANCH-WISE SUMMARY');
    console.log('-'.repeat(40));
    Object.entries(branchSummary).forEach(([branchId, summary]) => {
      const successRate = (summary.appropriate / summary.total * 100).toFixed(1);
      const status = summary.inappropriate === 0 ? '✅' : '❌';
      console.log(`${status} ${branchId}: ${successRate}% (${summary.appropriate}/${summary.total})`);
      
      if (summary.inappropriate > 0) {
        console.log(`   Issues: ${summary.issues.slice(0, 5).join(', ')}${summary.issues.length > 5 ? `, +${summary.issues.length - 5} more` : ''}`);
      }
    });

    if (inappropriateAssignments.length > 0) {
      console.log('\n❌ INAPPROPRIATE ASSIGNMENTS FOUND:');
      console.log('-'.repeat(50));
      
      // Group by issue type for better reporting
      const issueTypes: Record<string, any[]> = {};
      inappropriateAssignments.forEach(assignment => {
        const key = `${assignment.subjectName} → ${assignment.className}`;
        if (!issueTypes[key]) issueTypes[key] = [];
        issueTypes[key].push(assignment);
      });

      Object.entries(issueTypes).forEach(([issueType, assignments]) => {
        console.log(`\n🚨 ${issueType} (${assignments.length} cases):`);
        assignments.slice(0, 10).forEach(assignment => {
          console.log(`   📍 ${assignment.branchId} → ${assignment.className}-${assignment.sectionName}`);
        });
        if (assignments.length > 10) {
          console.log(`   ... and ${assignments.length - 10} more cases`);
        }
      });

      console.log('\n💡 RECOMMENDATIONS:');
      console.log('-'.repeat(25));
      console.log('1. Update seed data to use grade-appropriate subject filtering');
      console.log('2. Remove inappropriate assignments from existing data');
      console.log('3. Implement validation in timetable creation API');
      console.log('4. Add grade-level checks in frontend forms');
    } else {
      console.log('\n🎉 PERFECT! No inappropriate subject assignments found!');
      console.log('✅ All timetable periods use grade-appropriate subjects');
    }

    // Sample of appropriate assignments for verification
    console.log('\n📋 SAMPLE APPROPRIATE ASSIGNMENTS:');
    console.log('-'.repeat(40));
    const sampleByGrade: Record<string, string[]> = {};
    
    appropriateAssignments.forEach(assignment => {
      const key = assignment.className;
      if (!sampleByGrade[key]) sampleByGrade[key] = [];
      if (sampleByGrade[key].length < 3) {
        sampleByGrade[key].push(assignment.subjectName);
      }
    });

    Object.entries(sampleByGrade).slice(0, 8).forEach(([className, subjects]) => {
      console.log(`✅ ${className}: ${subjects.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation
validateGradeAppropriateSubjects().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});