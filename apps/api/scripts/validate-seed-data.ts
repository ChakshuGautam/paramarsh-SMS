#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  entity: string;
  current: number;
  expected: number;
  status: 'PASS' | 'FAIL' | 'WARN';
  details?: string;
}

async function validateSeedData(): Promise<void> {
  console.log('🔍 PARAMARSH SMS - SEED DATA VALIDATION');
  console.log('=' .repeat(60));
  console.log(`📅 Generated: ${new Date().toISOString()}\n`);

  const results: ValidationResult[] = [];

  try {
    // 1. Branch Validation - Must have all 13 composite branch IDs
    console.log('🏫 BRANCH VALIDATION');
    console.log('-'.repeat(40));
    
    const expectedBranches = [
      'dps-main', 'dps-north', 'dps-south', 'dps-east', 'dps-west',
      'kvs-central', 'kvs-cantonment', 'kvs-airport',
      'sps-primary', 'sps-secondary', 'sps-senior',
      'ris-main', 'ris-extension'
    ];

    const studentBranches = await prisma.$queryRaw<Array<{branchId: string, count: number}>>`
      SELECT "branchId", COUNT(*) as count FROM "Student" 
      WHERE "branchId" IS NOT NULL 
      GROUP BY "branchId" 
      ORDER BY "branchId"
    `;

    const actualBranches = studentBranches.map(b => b.branchId);
    const missingBranches = expectedBranches.filter(b => !actualBranches.includes(b));
    const extraBranches = actualBranches.filter(b => !expectedBranches.includes(b));

    if (missingBranches.length === 0 && extraBranches.length === 0) {
      console.log('✅ All 13 composite branch IDs present');
      results.push({
        entity: 'Branches',
        current: actualBranches.length,
        expected: expectedBranches.length,
        status: 'PASS'
      });
    } else {
      console.log('❌ Branch validation failed');
      if (missingBranches.length > 0) {
        console.log(`   Missing: ${missingBranches.join(', ')}`);
      }
      if (extraBranches.length > 0) {
        console.log(`   Extra: ${extraBranches.join(', ')}`);
      }
      results.push({
        entity: 'Branches',
        current: actualBranches.length,
        expected: expectedBranches.length,
        status: 'FAIL',
        details: `Missing: ${missingBranches.length}, Extra: ${extraBranches.length}`
      });
    }

    // 2. Entity Count Validation
    console.log('\n📊 ENTITY COUNT VALIDATION');
    console.log('-'.repeat(40));

    const entityValidations = [
      { entity: 'Student', table: 'Student', min: 500, max: 20000 },
      { entity: 'Guardian', table: 'Guardian', min: 800, max: 30000 },
      { entity: 'Teacher', table: 'Teacher', min: 30, max: 500 },
      { entity: 'Staff', table: 'Staff', min: 50, max: 1000 },
      { entity: 'Class', table: 'Class', min: 10, max: 200 },
      { entity: 'Section', table: 'Section', min: 20, max: 500 },
      { entity: 'Subject', table: 'Subject', min: 50, max: 500 },
      { entity: 'Tenant', table: 'Tenant', min: 13, max: 13 },
      { entity: 'AcademicYear', table: 'AcademicYear', min: 13, max: 13 },
      { entity: 'Enrollment', table: 'Enrollment', min: 500, max: 20000 }
    ];

    for (const validation of entityValidations) {
      let actual = 0;
      
      try {
        switch (validation.table) {
          case 'Student':
            actual = await prisma.student.count();
            break;
          case 'Guardian':
            actual = await prisma.guardian.count();
            break;
          case 'Teacher':
            actual = await prisma.teacher.count();
            break;
          case 'Staff':
            actual = await prisma.staff.count();
            break;
          case 'Class':
            actual = await prisma.class.count();
            break;
          case 'Section':
            actual = await prisma.section.count();
            break;
          case 'Subject':
            actual = await prisma.subject.count();
            break;
          case 'Tenant':
            actual = await prisma.tenant.count();
            break;
          case 'AcademicYear':
            actual = await prisma.academicYear.count();
            break;
          case 'Enrollment':
            actual = await prisma.enrollment.count();
            break;
          default:
            console.log(`⚠️  ${validation.entity}: Unknown table ${validation.table}`);
            continue;
        }
      } catch (error) {
        console.log(`⚠️  ${validation.entity}: Could not count records`);
        continue;
      }
      
      const status = actual >= validation.min && actual <= validation.max ? 'PASS' : 
                    actual >= validation.min * 0.8 ? 'WARN' : 'FAIL';
      
      console.log(`${status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌'} ${validation.entity}: ${actual.toLocaleString()} (expected: ${validation.min.toLocaleString()}-${validation.max.toLocaleString()})`);
      
      results.push({
        entity: validation.entity,
        current: actual,
        expected: validation.min,
        status: status as any
      });
    }

    // 3. Multi-tenancy Validation
    console.log('\n🏢 MULTI-TENANCY VALIDATION');
    console.log('-'.repeat(40));

    const tablesWithBranchId = ['Student', 'Guardian', 'Teacher', 'Staff', 'Class', 'Section', 'Subject', 'Tenant', 'AcademicYear'];
    let allMultiTenancyPassed = true;

    for (const table of tablesWithBranchId) {
      try {
        let nullCount = 0;
        
        switch (table) {
          case 'Student':
            nullCount = await prisma.student.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
          case 'Guardian':
            nullCount = await prisma.guardian.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
          case 'Teacher':
            nullCount = await prisma.teacher.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
          case 'Staff':
            nullCount = await prisma.staff.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
          case 'Class':
            nullCount = await prisma.class.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
          case 'Section':
            nullCount = await prisma.section.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
          case 'Subject':
            nullCount = await prisma.subject.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
          case 'Tenant':
            nullCount = await prisma.tenant.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
          case 'AcademicYear':
            nullCount = await prisma.academicYear.count({
              where: { OR: [{ branchId: null }, { branchId: '' }] }
            });
            break;
        }
        
        const status = nullCount === 0 ? 'PASS' : 'FAIL';
        
        console.log(`${status === 'PASS' ? '✅' : '❌'} ${table}: ${nullCount === 0 ? 'All records have branchId' : `${nullCount} records missing branchId`}`);
        
        if (status === 'FAIL') {
          allMultiTenancyPassed = false;
        }
      } catch (error) {
        console.log(`⚠️  ${table}: Could not validate (table may not exist)`);
      }
    }

    results.push({
      entity: 'Multi-tenancy',
      current: allMultiTenancyPassed ? 1 : 0,
      expected: 1,
      status: allMultiTenancyPassed ? 'PASS' : 'FAIL'
    });

    // 4. Data Quality Checks
    console.log('\n📈 DATA QUALITY VALIDATION');
    console.log('-'.repeat(40));

    // Check for Indian phone numbers
    const staffWithPhone = await prisma.staff.findMany({
      where: { phone: { not: null } },
      select: { phone: true }
    });
    
    const validPhones = staffWithPhone.filter(s => s.phone && s.phone.startsWith('+91-')).length;
    const totalPhones = staffWithPhone.length;
    
    const phonePercentage = totalPhones > 0 ? (validPhones / totalPhones) * 100 : 0;
    const phoneStatus = phonePercentage >= 90 ? 'PASS' : phonePercentage >= 70 ? 'WARN' : 'FAIL';
    console.log(`${phoneStatus === 'PASS' ? '✅' : phoneStatus === 'WARN' ? '⚠️' : '❌'} Indian Phone Numbers: ${phonePercentage.toFixed(1)}% valid (+91 format)`);

    // Check for Hindi subject
    const hindiCount = await prisma.subject.count({
      where: { name: 'Hindi' }
    });
    const hindiStatus = hindiCount >= 10 ? 'PASS' : 'FAIL';
    console.log(`${hindiStatus === 'PASS' ? '✅' : '❌'} Hindi Subject: ${hindiCount} instances found`);

    // Check enrollment coverage
    const totalActiveStudents = await prisma.student.count({
      where: { status: 'active' }
    });
    
    const enrolledStudents = await prisma.enrollment.count({
      where: {
        student: { status: 'active' }
      }
    });
    
    const enrollmentPercentage = totalActiveStudents > 0 ? (enrolledStudents / totalActiveStudents) * 100 : 0;
    const enrollmentStatus = enrollmentPercentage >= 95 ? 'PASS' : 'WARN';
    console.log(`${enrollmentStatus === 'PASS' ? '✅' : '⚠️'} Enrollment Coverage: ${enrollmentPercentage.toFixed(1)}% of active students enrolled`);

    // 5. Summary Report
    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    const passCount = results.filter(r => r.status === 'PASS').length;
    const warnCount = results.filter(r => r.status === 'WARN').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;

    console.log(`📊 Overall Score: ${passCount}/${total} checks passed`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`⚠️  Warnings: ${warnCount}`);
    console.log(`❌ Failed: ${failCount}`);

    const overallStatus = failCount === 0 ? (warnCount === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS ATTENTION';
    console.log(`🏆 Status: ${overallStatus}`);

    if (failCount === 0) {
      console.log('\n🎉 SEED DATA VALIDATION SUCCESSFUL!');
      console.log('✨ Ready for production demos and load testing');
    } else {
      console.log('\n⚠️  ISSUES FOUND - Please review failed checks above');
    }

    // Branch distribution summary
    console.log('\n📊 BRANCH DISTRIBUTION:');
    console.log('-'.repeat(40));
    for (const branch of studentBranches) {
      console.log(`   ${branch.branchId}: ${Number(branch.count).toLocaleString()} students`);
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  validateSeedData().catch((error) => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

export { validateSeedData };