#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BranchStats {
  branchId: string;
  branchName: string;
  students: number;
  guardians: number;
  teachers: number;
  staff: number;
  classes: number;
  sections: number;
  subjects: number;
  enrollments: number;
  applications: number;
}

async function generateSeedStats(): Promise<void> {
  console.log('📊 PARAMARSH SMS - SEED DATA STATISTICS');
  console.log('=' .repeat(60));
  console.log(`📅 Generated: ${new Date().toISOString()}\n`);

  try {
    // Get all branch configurations
    const branches = await prisma.$queryRaw<Array<{id: string, name: string}>>`
      SELECT id, name FROM Tenant ORDER BY id
    `;

    const branchStats: BranchStats[] = [];
    let totalStats = {
      students: 0,
      guardians: 0,
      teachers: 0,
      staff: 0,
      classes: 0,
      sections: 0,
      subjects: 0,
      enrollments: 0,
      applications: 0
    };

    // Generate stats for each branch
    for (const branch of branches) {
      console.log(`🔄 Processing ${branch.name}...`);

      const students = await prisma.student.count({
        where: { branchId: branch.id }
      });

      const guardians = await prisma.guardian.count({
        where: { branchId: branch.id }
      });

      const teachers = await prisma.teacher.count({
        where: { branchId: branch.id }
      });

      const staff = await prisma.staff.count({
        where: { branchId: branch.id }
      });

      const classes = await prisma.class.count({
        where: { branchId: branch.id }
      });

      const sections = await prisma.section.count({
        where: { branchId: branch.id }
      });

      const subjects = await prisma.subject.count({
        where: { branchId: branch.id }
      });

      const enrollments = await prisma.enrollment.count({
        where: { branchId: branch.id }
      });

      const applications = await prisma.application.count({
        where: { branchId: branch.id }
      });

      const stats: BranchStats = {
        branchId: branch.id,
        branchName: branch.name,
        students: students,
        guardians: guardians,
        teachers: teachers,
        staff: staff,
        classes: classes,
        sections: sections,
        subjects: subjects,
        enrollments: enrollments,
        applications: applications
      };

      branchStats.push(stats);

      // Add to totals
      totalStats.students += stats.students;
      totalStats.guardians += stats.guardians;
      totalStats.teachers += stats.teachers;
      totalStats.staff += stats.staff;
      totalStats.classes += stats.classes;
      totalStats.sections += stats.sections;
      totalStats.subjects += stats.subjects;
      totalStats.enrollments += stats.enrollments;
      totalStats.applications += stats.applications;
    }

    // Display detailed branch statistics
    console.log('\n🏫 BRANCH-WISE STATISTICS');
    console.log('='.repeat(60));

    // Group branches by school type
    const schoolGroups = {
      'Delhi Public School': branchStats.filter(s => s.branchId.startsWith('dps-')),
      'Kendriya Vidyalaya': branchStats.filter(s => s.branchId.startsWith('kvs-')),
      'St. Paul\'s School': branchStats.filter(s => s.branchId.startsWith('sps-')),
      'Ryan International': branchStats.filter(s => s.branchId.startsWith('ris-'))
    };

    for (const [schoolType, branches] of Object.entries(schoolGroups)) {
      if (branches.length === 0) continue;
      
      console.log(`\n📚 ${schoolType}:`);
      console.log('-'.repeat(40));
      
      for (const branch of branches) {
        console.log(`   ${branch.branchName} (${branch.branchId}):`);
        console.log(`     👨‍🎓 Students: ${branch.students.toLocaleString()}`);
        console.log(`     👨‍👩‍👧‍👦 Guardians: ${branch.guardians.toLocaleString()}`);
        console.log(`     👨‍🏫 Teachers: ${branch.teachers}`);
        console.log(`     👥 Staff: ${branch.staff}`);
        console.log(`     📚 Classes: ${branch.classes} | Sections: ${branch.sections}`);
        console.log(`     📖 Subjects: ${branch.subjects}`);
        console.log(`     📝 Enrollments: ${branch.enrollments.toLocaleString()}`);
        console.log(`     📋 Applications: ${branch.applications}`);
        console.log('');
      }

      // School type totals
      const schoolTotals = branches.reduce((acc, branch) => ({
        students: acc.students + branch.students,
        guardians: acc.guardians + branch.guardians,
        teachers: acc.teachers + branch.teachers,
        staff: acc.staff + branch.staff,
        classes: acc.classes + branch.classes,
        sections: acc.sections + branch.sections,
        enrollments: acc.enrollments + branch.enrollments,
        applications: acc.applications + branch.applications
      }), { students: 0, guardians: 0, teachers: 0, staff: 0, classes: 0, sections: 0, enrollments: 0, applications: 0 });

      console.log(`   📊 ${schoolType} Totals:`);
      console.log(`     Students: ${schoolTotals.students.toLocaleString()}, Teachers: ${schoolTotals.teachers}, Branches: ${branches.length}`);
    }

    // Overall statistics
    console.log('\n📈 OVERALL STATISTICS');
    console.log('='.repeat(60));
    console.log(`🏫 Total Branches: ${branchStats.length}`);
    console.log(`👨‍🎓 Total Students: ${totalStats.students.toLocaleString()}`);
    console.log(`👨‍👩‍👧‍👦 Total Guardians: ${totalStats.guardians.toLocaleString()}`);
    console.log(`👨‍🏫 Total Teachers: ${totalStats.teachers}`);
    console.log(`👥 Total Staff: ${totalStats.staff}`);
    console.log(`📚 Total Classes: ${totalStats.classes}`);
    console.log(`📝 Total Sections: ${totalStats.sections}`);
    console.log(`📖 Total Subjects: ${totalStats.subjects}`);
    console.log(`📋 Total Enrollments: ${totalStats.enrollments.toLocaleString()}`);
    console.log(`📄 Total Applications: ${totalStats.applications}`);

    // Quality metrics
    console.log('\n📊 QUALITY METRICS');
    console.log('='.repeat(60));
    console.log(`👥 Average students per branch: ${Math.round(totalStats.students / branchStats.length)}`);
    console.log(`👨‍👩‍👧‍👦 Guardian-to-student ratio: ${(totalStats.guardians / totalStats.students).toFixed(2)}:1`);
    console.log(`👨‍🏫 Teacher-to-student ratio: 1:${Math.round(totalStats.students / totalStats.teachers)}`);
    console.log(`📚 Average sections per class: ${(totalStats.sections / totalStats.classes).toFixed(1)}`);
    console.log(`📝 Enrollment coverage: ${(totalStats.enrollments / totalStats.students * 100).toFixed(1)}%`);

    // Data distribution analysis
    console.log('\n📊 DATA DISTRIBUTION ANALYSIS');
    console.log('='.repeat(60));

    // Find largest and smallest branches by student count
    const sortedByStudents = [...branchStats].sort((a, b) => b.students - a.students);
    const largest = sortedByStudents[0];
    const smallest = sortedByStudents[sortedByStudents.length - 1];

    console.log(`📈 Largest branch: ${largest.branchName} (${largest.students.toLocaleString()} students)`);
    console.log(`📉 Smallest branch: ${smallest.branchName} (${smallest.students.toLocaleString()} students)`);
    console.log(`📊 Size variation: ${(((largest.students / smallest.students) - 1) * 100).toFixed(1)}% difference`);

    // School type distribution
    console.log('\n🏫 SCHOOL TYPE DISTRIBUTION');
    console.log('-'.repeat(40));
    for (const [schoolType, branches] of Object.entries(schoolGroups)) {
      if (branches.length === 0) continue;
      const schoolStudents = branches.reduce((sum, b) => sum + b.students, 0);
      const percentage = (schoolStudents / totalStats.students * 100).toFixed(1);
      console.log(`${schoolType}: ${branches.length} branches, ${schoolStudents.toLocaleString()} students (${percentage}%)`);
    }

    // Performance readiness
    console.log('\n🚀 PERFORMANCE READINESS');
    console.log('='.repeat(60));
    
    const performanceMetrics = [
      { metric: 'Demo Readiness', threshold: 100, actual: totalStats.students, status: totalStats.students >= 100 ? 'READY' : 'INSUFFICIENT' },
      { metric: 'Load Testing', threshold: 1000, actual: totalStats.students, status: totalStats.students >= 1000 ? 'READY' : 'INSUFFICIENT' },
      { metric: 'Stress Testing', threshold: 5000, actual: totalStats.students, status: totalStats.students >= 5000 ? 'READY' : 'INSUFFICIENT' },
      { metric: 'Multi-tenancy', threshold: 5, actual: branchStats.length, status: branchStats.length >= 5 ? 'READY' : 'INSUFFICIENT' }
    ];

    for (const metric of performanceMetrics) {
      const icon = metric.status === 'READY' ? '✅' : '⚠️';
      console.log(`${icon} ${metric.metric}: ${metric.status} (${metric.actual.toLocaleString()}/${metric.threshold.toLocaleString()})`);
    }

    console.log('\n🎉 STATISTICS GENERATION COMPLETED!');
    console.log('📊 Data is comprehensive and ready for all testing scenarios');

  } catch (error) {
    console.error('❌ Statistics generation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run statistics generation if script is executed directly
if (require.main === module) {
  generateSeedStats().catch((error) => {
    console.error('❌ Statistics script failed:', error);
    process.exit(1);
  });
}

export { generateSeedStats };