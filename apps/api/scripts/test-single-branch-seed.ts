#!/usr/bin/env tsx

/**
 * Test Single Branch Seed with Grade-Appropriate Subjects
 * 
 * This script tests the seed process for a single branch to verify
 * that grade-appropriate subjects are correctly assigned from the start.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSingleBranchSeed() {
  console.log('🧪 TESTING SINGLE BRANCH SEED - GRADE-APPROPRIATE SUBJECTS');
  console.log('=' .repeat(60));
  console.log(`📅 Started: ${new Date().toISOString()}\n`);

  // Test with a branch that has wide grade range: sps-primary (Nursery-Class 5)
  const testBranchId = 'sps-primary';
  
  try {
    // Clean test branch data first
    console.log('🧹 Cleaning test branch data...');
    await prisma.timetablePeriod.deleteMany({ where: { branchId: testBranchId } });
    await prisma.subject.deleteMany({ where: { branchId: testBranchId } });
    await prisma.class.deleteMany({ where: { branchId: testBranchId } });
    await prisma.tenant.deleteMany({ where: { id: testBranchId } });
    
    // Create tenant
    console.log('🏫 Creating test tenant...');
    await prisma.tenant.create({
      data: {
        id: testBranchId,
        name: 'St. Paul\'s School - Primary Wing',
        subdomain: 'sps-primary'
      }
    });
    
    // Create academic year
    console.log('📅 Creating academic year...');
    const academicYear = await prisma.academicYear.create({
      data: {
        branchId: testBranchId,
        name: '2024-2025',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        isActive: true
      }
    });

    // Create classes (Nursery to Class 5)
    console.log('📚 Creating classes...');
    const classGrades = [
      { name: 'Nursery', gradeLevel: 0 },
      { name: 'LKG', gradeLevel: 1 },
      { name: 'UKG', gradeLevel: 2 },
      { name: 'Class 1', gradeLevel: 3 },
      { name: 'Class 2', gradeLevel: 4 },
      { name: 'Class 3', gradeLevel: 5 },
      { name: 'Class 4', gradeLevel: 6 },
      { name: 'Class 5', gradeLevel: 7 }
    ];

    const classes = [];
    for (const classInfo of classGrades) {
      const cls = await prisma.class.create({
        data: {
          branchId: testBranchId,
          name: classInfo.name,
          gradeLevel: classInfo.gradeLevel
        }
      });
      classes.push(cls);
    }

    // Grade-level subject mapping
    const gradeSubjectMapping = [
      // Early Childhood (Nursery=0, LKG=1, UKG=2)
      { code: 'ENG_BASIC', name: 'English', minGrade: 0, maxGrade: 14 },
      { code: 'HINDI_BASIC', name: 'Hindi', minGrade: 0, maxGrade: 14 },
      { code: 'MATH_BASIC', name: 'Mathematics', minGrade: 0, maxGrade: 14 },
      { code: 'ART', name: 'Art & Craft', minGrade: 0, maxGrade: 14 },
      { code: 'MUS', name: 'Music', minGrade: 0, maxGrade: 14 },
      { code: 'PE', name: 'Physical Education', minGrade: 0, maxGrade: 14 },
      { code: 'ENV_SCIENCE', name: 'Environmental Science', minGrade: 0, maxGrade: 4 },
      
      // Primary Grades (Class 1-5 = grade 3-7)
      { code: 'SCI_BASIC', name: 'Science', minGrade: 3, maxGrade: 7 },
      { code: 'SST_BASIC', name: 'Social Studies', minGrade: 3, maxGrade: 7 },
      { code: 'COMP_BASIC', name: 'Computer Science', minGrade: 3, maxGrade: 14 },
      { code: 'SANS', name: 'Sanskrit', minGrade: 5, maxGrade: 14 },
      
      // Subjects that should NOT appear in primary school
      { code: 'HIST_INTRO', name: 'History', minGrade: 8, maxGrade: 14 },
      { code: 'GEO_INTRO', name: 'Geography', minGrade: 8, maxGrade: 14 },
      { code: 'PHY', name: 'Physics', minGrade: 11, maxGrade: 14 },
      { code: 'CHEM', name: 'Chemistry', minGrade: 11, maxGrade: 14 },
      { code: 'BIO', name: 'Biology', minGrade: 11, maxGrade: 14 },
      { code: 'ECO', name: 'Economics', minGrade: 11, maxGrade: 14 },
      { code: 'POL', name: 'Political Science', minGrade: 11, maxGrade: 14 }
    ];

    // Get grade range for this branch
    const branchGradeLevels = classes.map(cls => cls.gradeLevel || 0);
    const minBranchGrade = Math.min(...branchGradeLevels);
    const maxBranchGrade = Math.max(...branchGradeLevels);
    
    console.log(`🎯 Branch grade range: ${minBranchGrade}-${maxBranchGrade}`);

    // Filter subjects appropriate for this branch
    const appropriateSubjects = gradeSubjectMapping.filter(subject => 
      subject.minGrade <= maxBranchGrade && 
      (subject.maxGrade === undefined || subject.maxGrade >= minBranchGrade)
    );

    console.log(`📚 Creating ${appropriateSubjects.length} grade-appropriate subjects:`);
    console.log(`   Expected: ${appropriateSubjects.map(s => s.name).join(', ')}\n`);

    // Create subjects
    const subjects = [];
    for (const subjectInfo of appropriateSubjects) {
      const subject = await prisma.subject.create({
        data: {
          branchId: testBranchId,
          code: `${testBranchId}-${subjectInfo.code}-${Date.now()}`,
          name: subjectInfo.name,
          credits: 3,
          isElective: false
        }
      });
      subjects.push(subject);
    }

    // Create sections and test timetable assignments
    console.log('📋 Creating sections and testing timetable assignments...');
    
    const results = [];
    
    for (const cls of classes) {
      const section = await prisma.section.create({
        data: {
          branchId: testBranchId,
          name: 'A',
          classId: cls.id,
          capacity: 25
        }
      });

      // Helper function to get grade-appropriate subjects
      function getGradeAppropriateSubjects(classGradeLevel: number) {
        const appropriateSubjectNames = gradeSubjectMapping
          .filter(subject => 
            classGradeLevel >= subject.minGrade && 
            (subject.maxGrade === undefined || classGradeLevel <= subject.maxGrade)
          )
          .map(subject => subject.name);
        
        return subjects.filter(subject => 
          appropriateSubjectNames.includes(subject.name)
        );
      }

      const gradeAppropriateSubjects = getGradeAppropriateSubjects(cls.gradeLevel || 0);
      
      const result = {
        className: cls.name,
        gradeLevel: cls.gradeLevel,
        expectedSubjects: gradeAppropriateSubjects.map(s => s.name),
        totalAppropriate: gradeAppropriateSubjects.length,
        inappropriateFound: []
      };

      // Check if any inappropriate subjects would be available
      const allSubjectNames = subjects.map(s => s.name);
      const inappropriateForThisGrade = allSubjectNames.filter(name => {
        const rule = gradeSubjectMapping.find(r => r.name === name);
        if (!rule) return false;
        return (cls.gradeLevel || 0) < rule.minGrade || (cls.gradeLevel || 0) > rule.maxGrade;
      });
      
      result.inappropriateFound = inappropriateForThisGrade;
      results.push(result);
    }

    // Display results
    console.log('🎯 GRADE-APPROPRIATE SUBJECT ASSIGNMENT TEST RESULTS:');
    console.log('-'.repeat(60));
    
    let allCorrect = true;
    
    for (const result of results) {
      const status = result.inappropriateFound.length === 0 ? '✅' : '❌';
      console.log(`${status} ${result.className} (Grade ${result.gradeLevel}):`);
      console.log(`   📚 Appropriate subjects (${result.totalAppropriate}): ${result.expectedSubjects.join(', ')}`);
      
      if (result.inappropriateFound.length > 0) {
        console.log(`   ❌ Inappropriate subjects found: ${result.inappropriateFound.join(', ')}`);
        allCorrect = false;
      }
      console.log('');
    }

    if (allCorrect) {
      console.log('🎉 PERFECT! All grade-subject assignments are appropriate!');
      console.log('✅ No inappropriate subjects found for any grade level');
      console.log('✅ Grade-appropriate filtering is working correctly');
    } else {
      console.log('❌ Issues found with grade-subject assignments');
    }

    // Verify specific expectations
    console.log('\n🔍 SPECIFIC VALIDATION CHECKS:');
    console.log('-'.repeat(40));
    
    const nurserySubjects = results.find(r => r.className === 'Nursery')?.expectedSubjects || [];
    const class5Subjects = results.find(r => r.className === 'Class 5')?.expectedSubjects || [];
    
    console.log('✅ Nursery should NOT have: Physics, Chemistry, Geography, History');
    const nurseryBadSubjects = nurserySubjects.filter(s => ['Physics', 'Chemistry', 'Geography', 'History'].includes(s));
    if (nurseryBadSubjects.length === 0) {
      console.log('   ✅ PASS: Nursery has no inappropriate advanced subjects');
    } else {
      console.log(`   ❌ FAIL: Nursery has inappropriate subjects: ${nurseryBadSubjects.join(', ')}`);
    }

    console.log('✅ Class 5 should have: Science, Social Studies');
    const class5ExpectedSubjects = ['Science', 'Social Studies'];
    const class5HasExpected = class5ExpectedSubjects.every(s => class5Subjects.includes(s));
    if (class5HasExpected) {
      console.log('   ✅ PASS: Class 5 has expected primary subjects');
    } else {
      console.log(`   ❌ FAIL: Class 5 missing expected subjects`);
    }

    console.log('✅ Primary grades should NOT have: Physics, Chemistry, Biology, Economics');
    const advancedSubjects = ['Physics', 'Chemistry', 'Biology', 'Economics'];
    const hasAdvanced = results.some(r => 
      r.gradeLevel <= 7 && 
      r.expectedSubjects.some(s => advancedSubjects.includes(s))
    );
    if (!hasAdvanced) {
      console.log('   ✅ PASS: No advanced subjects in primary grades');
    } else {
      console.log('   ❌ FAIL: Advanced subjects found in primary grades');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSingleBranchSeed().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});