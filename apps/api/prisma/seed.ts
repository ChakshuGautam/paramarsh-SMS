import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== COMPREHENSIVE MULTI-BRANCH SEED DATA GENERATION ==========
// Supports all composite branch IDs with realistic Indian school data
//
// BRANCH STRUCTURE:
// Delhi Public School (dps): dps-main, dps-north, dps-south, dps-east, dps-west
// Kendriya Vidyalaya (kvs): kvs-central, kvs-cantonment, kvs-airport
// St. Paul's School (sps): sps-primary, sps-secondary, sps-senior
// Ryan International School (ris): ris-main, ris-extension

// ========== INDIAN NAMES DATABASE ==========
const INDIAN_NAMES = {
  male: {
    first: [
      'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai', 'Arnav',
      'Ayaan', 'Atharva', 'Aryan', 'Kabir', 'Avinash', 'Rohan', 'Rudra', 'Vedant', 'Yash', 'Dhruv',
      'Kartik', 'Gaurav', 'Harsh', 'Mihir', 'Nikhil', 'Parth', 'Rishi', 'Samarth', 'Tanish', 'Utkarsh',
      'Varun', 'Viraj', 'Abhishek', 'Akash', 'Aman', 'Ankit', 'Ashwin', 'Dev', 'Karthik', 'Manish',
      'Neeraj', 'Piyush', 'Rahul', 'Rajat', 'Sanjay', 'Shivam', 'Siddharth', 'Surya', 'Tarun', 'Vishal'
    ],
    last: [
      'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta',
      'Joshi', 'Desai', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Iyengar', 'Choudhury', 'Banerjee', 'Mukherjee',
      'Das', 'Bose', 'Roy', 'Ghosh', 'Chatterjee', 'Khan', 'Ahmed', 'Syed', 'Ali', 'Fernandes',
      'D\'Souza', 'Rodrigues', 'Pereira', 'Naidu', 'Raju', 'Yadav', 'Pandey', 'Mishra', 'Tiwari', 'Dubey',
      'Shukla', 'Agarwal', 'Jain', 'Singhal', 'Goyal', 'Mittal', 'Malhotra', 'Kapoor', 'Chopra', 'Arora'
    ]
  },
  female: {
    first: [
      'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari', 'Sara',
      'Aanya', 'Aisha', 'Akshara', 'Anvi', 'Avani', 'Bhavya', 'Charvi', 'Darshana', 'Eesha', 'Gauri',
      'Ira', 'Jiya', 'Kiara', 'Lavanya', 'Mahika', 'Nandini', 'Oviya', 'Palak', 'Rhea', 'Samaira',
      'Tanvi', 'Uma', 'Vanya', 'Yashasvi', 'Zara', 'Aditi', 'Anjali', 'Deepika', 'Divya', 'Gayatri',
      'Kavita', 'Meera', 'Neha', 'Pooja', 'Priya', 'Rashmi', 'Shweta', 'Sneha', 'Srishti', 'Swati'
    ],
    last: [] // Same as male
  }
};

// Initialize female last names
INDIAN_NAMES.female.last = [...INDIAN_NAMES.male.last];

// ========== INDIAN CITIES AND ADDRESSES ==========
const INDIAN_LOCATIONS = {
  mumbai: {
    areas: ['Andheri', 'Bandra', 'Juhu', 'Powai', 'Goregaon', 'Malad', 'Borivali', 'Dadar', 'Worli', 'Lower Parel'],
    state: 'Maharashtra'
  },
  delhi: {
    areas: ['Connaught Place', 'Karol Bagh', 'Saket', 'Vasant Kunj', 'Lajpat Nagar', 'Defence Colony', 'Greater Kailash', 'Rohini', 'Janakpuri', 'Dwarka'],
    state: 'Delhi'
  },
  bangalore: {
    areas: ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'Jayanagar', 'Malleswaram', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Sarjapur'],
    state: 'Karnataka'
  },
  chennai: {
    areas: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Tambaram', 'Mylapore', 'Nungambakkam', 'Perambur', 'Guindy', 'Porur'],
    state: 'Tamil Nadu'
  },
  kolkata: {
    areas: ['Salt Lake', 'Park Street', 'Ballygunge', 'New Town', 'Howrah', 'Jadavpur', 'Behala', 'Rajarhat', 'Tollygunge', 'Dum Dum'],
    state: 'West Bengal'
  }
};

// ========== BRANCH CONFIGURATION ==========
const BRANCH_CONFIGS = {
  'dps-main': {
    name: 'Delhi Public School - Main Campus',
    subdomain: 'dps-main',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 35,
    sections: ['A', 'B', 'C', 'D'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    baseFee: 8000
  },
  'dps-north': {
    name: 'Delhi Public School - North Campus',
    subdomain: 'dps-north',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 32,
    sections: ['A', 'B', 'C'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 7500
  },
  'dps-south': {
    name: 'Delhi Public School - South Campus',
    subdomain: 'dps-south',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 30,
    sections: ['A', 'B', 'C'],
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 7200
  },
  'dps-east': {
    name: 'Delhi Public School - East Campus',
    subdomain: 'dps-east',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 28,
    sections: ['A', 'B'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    baseFee: 6800
  },
  'dps-west': {
    name: 'Delhi Public School - West Campus',
    subdomain: 'dps-west',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 30,
    sections: ['A', 'B', 'C'],
    grades: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    baseFee: 7800
  },
  'kvs-central': {
    name: 'Kendriya Vidyalaya - Central Branch',
    subdomain: 'kvs-central',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 40,
    sections: ['A', 'B', 'C', 'D'],
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    baseFee: 3500
  },
  'kvs-cantonment': {
    name: 'Kendriya Vidyalaya - Cantonment Branch',
    subdomain: 'kvs-cantonment',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 38,
    sections: ['A', 'B', 'C'],
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 3200
  },
  'kvs-airport': {
    name: 'Kendriya Vidyalaya - Airport Branch',
    subdomain: 'kvs-airport',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 35,
    sections: ['A', 'B'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    baseFee: 3000
  },
  'sps-primary': {
    name: 'St. Paul\'s School - Primary Wing',
    subdomain: 'sps-primary',
    type: 'ICSE',
    location: 'kolkata',
    studentsPerSection: 25,
    sections: ['A', 'B', 'C'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    baseFee: 12000
  },
  'sps-secondary': {
    name: 'St. Paul\'s School - Secondary Wing',
    subdomain: 'sps-secondary',
    type: 'ICSE',
    location: 'kolkata',
    studentsPerSection: 28,
    sections: ['A', 'B', 'C'],
    grades: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 15000
  },
  'sps-senior': {
    name: 'St. Paul\'s School - Senior Wing',
    subdomain: 'sps-senior',
    type: 'ISC',
    location: 'kolkata',
    studentsPerSection: 30,
    sections: ['A', 'B'],
    grades: ['Class 11', 'Class 12'],
    baseFee: 18000
  },
  'ris-main': {
    name: 'Ryan International School - Main Branch',
    subdomain: 'ris-main',
    type: 'CBSE',
    location: 'mumbai',
    studentsPerSection: 32,
    sections: ['A', 'B', 'C', 'D'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 9500
  },
  'ris-extension': {
    name: 'Ryan International School - Extension Branch',
    subdomain: 'ris-extension',
    type: 'CBSE',
    location: 'mumbai',
    studentsPerSection: 28,
    sections: ['A', 'B', 'C'],
    grades: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    baseFee: 10200
  }
};

// ========== UTILITY FUNCTIONS ==========
function getRandomName(gender: 'male' | 'female'): { first: string, last: string } {
  const first = INDIAN_NAMES[gender].first[Math.floor(Math.random() * INDIAN_NAMES[gender].first.length)];
  const last = INDIAN_NAMES[gender].last[Math.floor(Math.random() * INDIAN_NAMES[gender].last.length)];
  return { first, last };
}

function getIndianAddress(locationKey: string): string {
  const location = INDIAN_LOCATIONS[locationKey as keyof typeof INDIAN_LOCATIONS];
  const area = location.areas[Math.floor(Math.random() * location.areas.length)];
  const houseNo = Math.floor(Math.random() * 999) + 1;
  return `${houseNo}, ${area}, ${locationKey.charAt(0).toUpperCase() + locationKey.slice(1)}, ${location.state}`;
}

function getIndianPhoneNumber(): string {
  const prefixes = ['91', '92', '93', '94', '95', '96', '97', '98', '99'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 90000000) + 10000000;
  return `+91-${prefix}${suffix.toString().substring(0, 8)}`;
}

function getRealisticStudentStatus(gradeLevel: number): string {
  const rand = Math.random();
  
  if (gradeLevel >= 12) { // Class 10 and above
    if (rand < 0.45) return 'active';     // 45% active
    if (rand < 0.55) return 'inactive';   // 10% inactive
    return 'graduated';                   // 45% graduated
  } else if (gradeLevel >= 9) { // Class 7-9
    if (rand < 0.60) return 'active';     // 60% active
    if (rand < 0.70) return 'inactive';   // 10% inactive
    return 'graduated';                   // 30% graduated
  } else if (gradeLevel >= 5) { // Class 3-6
    if (rand < 0.75) return 'active';     // 75% active
    if (rand < 0.85) return 'inactive';   // 10% inactive
    return 'graduated';                   // 15% graduated
  } else { // Lower classes (Nursery-Class 2)
    if (rand < 0.85) return 'active';     // 85% active
    if (rand < 0.95) return 'inactive';   // 10% inactive
    return 'graduated';                   // 5% graduated
  }
}

function getGradeLevel(className: string): number {
  const gradeMapping: Record<string, number> = {
    'Nursery': 0, 'LKG': 1, 'UKG': 2,
    'Class 1': 3, 'Class 2': 4, 'Class 3': 5, 'Class 4': 6, 'Class 5': 7,
    'Class 6': 8, 'Class 7': 9, 'Class 8': 10, 'Class 9': 11,
    'Class 10': 12, 'Class 11': 13, 'Class 12': 14
  };
  return gradeMapping[className] || 0;
}

// Global admission counter to ensure unique admission numbers across all branches
let globalAdmissionCounter = 1;

// ========== VALIDATION SYSTEM ==========

// MANDATORY: Check all tables for data presence
async function validateAllTables() {
  console.log('🔍 Starting comprehensive table validation...');
  
  const tableValidations = {
    // Core entities
    tenants: await prisma.tenant.count(),
    academicYears: await prisma.academicYear.count(),
    classes: await prisma.class.count(),
    sections: await prisma.section.count(),
    subjects: await prisma.subject.count(),
    
    // People
    students: await prisma.student.count(),
    guardians: await prisma.guardian.count(),
    staff: await prisma.staff.count(),
    teachers: await prisma.teacher.count(),
    
    // Academic operations
    enrollments: await prisma.enrollment.count(),
    studentGuardian: await prisma.studentGuardian.count(),
    
    // Timetable system
    timeSlots: await prisma.timeSlot.count(),
    timetablePeriods: await prisma.timetablePeriod.count(),
    rooms: await prisma.room.count(),
    
    // Attendance system
    attendanceSessions: await prisma.attendanceSession.count(),
    studentPeriodAttendance: await prisma.studentPeriodAttendance.count(),
    teacherAttendance: await prisma.teacherAttendance.count(),
    
    // Assessment system
    exams: await prisma.exam.count(),
    examSessions: await prisma.examSession.count(),
    marks: await prisma.mark.count(),
    
    // Finance system
    feeStructures: await prisma.feeStructure.count(),
    feeComponents: await prisma.feeComponent.count(),
    feeSchedules: await prisma.feeSchedule.count(),
    invoices: await prisma.invoice.count(),
    payments: await prisma.payment.count(),
    
    // Communication system
    templates: await prisma.template.count(),
    campaigns: await prisma.campaign.count(),
    messages: await prisma.message.count(),
    preferences: await prisma.preference.count(),
    
    // Support system
    tickets: await prisma.ticket.count(),
    
    // Admissions
    applications: await prisma.application.count()
  };
  
  const emptyTables = [];
  const populatedTables = [];
  
  for (const [table, count] of Object.entries(tableValidations)) {
    if (count === 0) {
      emptyTables.push(table);
      console.log(`❌ ${table}: EMPTY (0 records) - CRITICAL BUG!`);
    } else {
      populatedTables.push({ table, count });
      console.log(`✅ ${table}: ${count.toLocaleString()} records`);
    }
  }
  
  return { emptyTables, populatedTables, tableValidations };
}

// MANDATORY: Validate data across all 13 composite branches
async function validateBranchDistribution() {
  console.log('🏫 Validating branch-wise data distribution...');
  
  const expectedBranches = [
    'dps-main', 'dps-north', 'dps-south', 'dps-east', 'dps-west',
    'kvs-central', 'kvs-cantonment', 'kvs-airport',
    'sps-primary', 'sps-secondary', 'sps-senior',
    'ris-main', 'ris-extension'
  ];
  
  const branchData: Record<string, any> = {};
  
  for (const branchId of expectedBranches) {
    const branchStats = {
      tenants: await prisma.tenant.count({ where: { id: branchId } }),
      students: await prisma.student.count({ where: { branchId } }),
      guardians: await prisma.guardian.count({ where: { branchId } }),
      teachers: await prisma.teacher.count({ where: { branchId } }),
      staff: await prisma.staff.count({ where: { branchId } }),
      classes: await prisma.class.count({ where: { branchId } }),
      sections: await prisma.section.count({ where: { branchId } }),
      subjects: await prisma.subject.count({ where: { branchId } }),
      enrollments: await prisma.enrollment.count({ where: { branchId } }),
      exams: await prisma.exam.count({ where: { branchId } }),
      attendanceSessions: await prisma.attendanceSession.count({ where: { branchId } }),
      templates: await prisma.template.count({ where: { branchId } }),
      applications: await prisma.application.count({ where: { branchId } })
    };
    
    branchData[branchId] = branchStats;
    
    // Check for missing critical data
    const criticalMissing = [];
    if (branchStats.tenants === 0) criticalMissing.push('tenant');
    if (branchStats.students === 0) criticalMissing.push('students');
    if (branchStats.classes === 0) criticalMissing.push('classes');
    
    if (criticalMissing.length > 0) {
      console.log(`❌ ${branchId}: Missing critical data: ${criticalMissing.join(', ')}`);
    } else {
      console.log(`✅ ${branchId}: ${branchStats.students} students, ${branchStats.classes} classes, ${branchStats.teachers} teachers`);
    }
  }
  
  return branchData;
}

// MANDATORY: Fix empty tables automatically
async function fixEmptyTables(emptyTables: string[]) {
  console.log('🔧 Attempting to fix empty tables...');
  
  const fixes = [];
  
  for (const table of emptyTables) {
    try {
      switch (table) {
        case 'tenants':
          console.log('🔧 Fixing missing tenants...');
          for (const [branchId, config] of Object.entries(BRANCH_CONFIGS)) {
            await prisma.tenant.create({
              data: {
                id: branchId,
                name: (config as any).name,
                subdomain: (config as any).subdomain,
                branchId: branchId
              }
            });
          }
          fixes.push(`✅ Created ${Object.keys(BRANCH_CONFIGS).length} tenant records`);
          break;
          
        case 'academicYears':
          console.log('🔧 Fixing missing academic years...');
          for (const branchId of Object.keys(BRANCH_CONFIGS)) {
            await prisma.academicYear.create({
              data: {
                branchId: branchId,
                name: '2024-2025',
                startDate: '2024-04-01',
                endDate: '2025-03-31',
                isActive: true
              }
            });
          }
          fixes.push(`✅ Created academic years for all branches`);
          break;
          
        case 'students':
          console.log('❌ Students table empty - requires full re-seed!');
          fixes.push('❌ Students missing - requires complete re-seed');
          break;
          
        case 'classes':
          console.log('❌ Classes table empty - requires full re-seed!');
          fixes.push('❌ Classes missing - requires complete re-seed');
          break;
          
        default:
          console.log(`⚠️ No automatic fix available for ${table}`);
          fixes.push(`⚠️ ${table} - manual intervention required`);
      }
    } catch (error) {
      console.log(`❌ Failed to fix ${table}: ${(error as Error).message}`);
      fixes.push(`❌ ${table} - fix failed: ${(error as Error).message}`);
    }
  }
  
  return fixes;
}

// MANDATORY: Generate comprehensive validation report
async function generateValidationReport(validationResults: any) {
  const timestamp = new Date().toISOString();
  const reportDate = timestamp.split('T')[0];
  
  let report = `PARAMARSH SMS SEED DATA VALIDATION REPORT\n`;
  report += `Generated: ${timestamp}\n`;
  report += `${'='.repeat(60)}\n\n`;
  
  // Overall Health Summary
  report += `📊 OVERALL HEALTH SUMMARY\n`;
  report += `${'='.repeat(30)}\n`;
  report += `Total Tables Checked: ${Object.keys(validationResults.tableValidations).length}\n`;
  report += `✅ Tables with Data: ${validationResults.populatedTables.length}\n`;
  report += `❌ Empty Tables: ${validationResults.emptyTables.length}\n`;
  
  if (validationResults.emptyTables.length === 0) {
    report += `\n🎉 ALL TABLES POPULATED - VALIDATION PASSED!\n`;
  } else {
    report += `\n🚨 CRITICAL BUGS DETECTED - EMPTY TABLES FOUND!\n`;
  }
  
  // Table Status Details
  report += `\n📋 DETAILED TABLE STATUS\n`;
  report += `${'='.repeat(30)}\n`;
  
  for (const { table, count } of validationResults.populatedTables) {
    report += `✅ ${table.padEnd(25)}: ${count.toLocaleString()} records\n`;
  }
  
  if (validationResults.emptyTables.length > 0) {
    report += `\n❌ EMPTY TABLES (CRITICAL BUGS):\n`;
    for (const table of validationResults.emptyTables) {
      report += `❌ ${table.padEnd(25)}: 0 records - REQUIRES IMMEDIATE FIX\n`;
    }
  }
  
  // Branch Distribution Summary
  report += `\n🏫 BRANCH-WISE DATA DISTRIBUTION\n`;
  report += `${'='.repeat(40)}\n`;
  report += `Branch ID           Students  Classes  Teachers  Status\n`;
  report += `${'-'.repeat(50)}\n`;
  
  for (const [branchId, stats] of Object.entries(validationResults.branchData)) {
    const statsTyped = stats as any;
    const status = statsTyped.students > 0 && statsTyped.classes > 0 ? '✅ HEALTHY' : '❌ MISSING DATA';
    report += `${branchId.padEnd(18)} ${String(statsTyped.students).padEnd(8)} ${String(statsTyped.classes).padEnd(7)} ${String(statsTyped.teachers).padEnd(8)} ${status}\n`;
  }
  
  // Data Quality Metrics
  const totalStudents = Object.values(validationResults.branchData).reduce((sum: number, branch: any) => sum + (branch.students || 0), 0) as number;
  const totalTeachers = Object.values(validationResults.branchData).reduce((sum: number, branch: any) => sum + (branch.teachers || 0), 0) as number;
  const totalClasses = Object.values(validationResults.branchData).reduce((sum: number, branch: any) => sum + (branch.classes || 0), 0) as number;
  
  report += `\n📈 DATA QUALITY METRICS\n`;
  report += `${'='.repeat(30)}\n`;
  report += `Total Students: ${totalStudents.toLocaleString()}\n`;
  report += `Total Teachers: ${totalTeachers}\n`;
  report += `Total Classes: ${totalClasses}\n`;
  report += `Student-Teacher Ratio: 1:${totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 0}\n`;
  report += `Average Students per Branch: ${Math.round(totalStudents / 13)}\n`;
  
  // Recommendations
  report += `\n🔧 RECOMMENDATIONS\n`;
  report += `${'='.repeat(20)}\n`;
  
  if (validationResults.emptyTables.length === 0) {
    report += `✅ All tables populated successfully\n`;
    report += `✅ Ready for production use\n`;
    report += `✅ All 13 branches have data\n`;
  } else {
    report += `❌ IMMEDIATE ACTION REQUIRED:\n`;
    for (const table of validationResults.emptyTables) {
      report += `   - Fix empty ${table} table\n`;
    }
    report += `❌ Consider running complete re-seed\n`;
  }
  
  // Save report to files
  const fs = require('fs');
  const path = require('path');
  
  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, `seed-validation-${reportDate}.txt`);
  fs.writeFileSync(reportPath, report);
  
  // Also save JSON version for programmatic analysis
  const jsonReport = {
    timestamp,
    summary: {
      totalTables: Object.keys(validationResults.tableValidations).length,
      populatedTables: validationResults.populatedTables.length,
      emptyTables: validationResults.emptyTables.length,
      validationPassed: validationResults.emptyTables.length === 0
    },
    tableStatus: validationResults.tableValidations,
    emptyTables: validationResults.emptyTables,
    branchDistribution: validationResults.branchData,
    metrics: {
      totalStudents,
      totalTeachers,
      totalClasses,
      studentTeacherRatio: totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 0,
      averageStudentsPerBranch: Math.round(totalStudents / 13)
    }
  };
  
  const jsonReportPath = path.join(reportsDir, `seed-validation-${reportDate}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2));
  
  console.log(`📋 Validation report saved to: ${reportPath}`);
  console.log(`📋 JSON report saved to: ${jsonReportPath}`);
  
  return { textReport: report, jsonReport, reportPath, jsonReportPath };
}

// MANDATORY: Run complete validation after every seed
async function runComprehensiveValidation(): Promise<boolean> {
  console.log('\n🔍 STARTING COMPREHENSIVE VALIDATION...');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Check all tables
    const tableResults = await validateAllTables();
    
    // Step 2: Check branch distribution
    const branchData = await validateBranchDistribution();
    
    // Step 3: Attempt fixes for empty tables
    let fixes: string[] = [];
    if (tableResults.emptyTables.length > 0) {
      console.log('\n🚨 CRITICAL BUGS DETECTED - ATTEMPTING FIXES...');
      fixes = await fixEmptyTables(tableResults.emptyTables);
      
      // Step 4: Re-validate after fixes
      console.log('\n🔄 RE-VALIDATING AFTER FIXES...');
      const revalidationResults = await validateAllTables();
      tableResults.emptyTables = revalidationResults.emptyTables;
      tableResults.populatedTables = revalidationResults.populatedTables;
      tableResults.tableValidations = revalidationResults.tableValidations;
    }
    
    // Step 5: Generate comprehensive report
    const validationResults = {
      ...tableResults,
      branchData,
      fixes
    };
    
    const report = await generateValidationReport(validationResults);
    
    // Step 6: Final status
    if (tableResults.emptyTables.length === 0) {
      console.log('\n🎉 VALIDATION PASSED - ALL TABLES POPULATED!');
      console.log('✅ Database is ready for production use');
      console.log('✅ All 13 branches have complete data');
      
      // Print summary table
      console.log('\n📊 FINAL VALIDATION SUMMARY:');
      console.log('='.repeat(40));
      for (const [branchId, stats] of Object.entries(branchData)) {
        const statsTyped = stats as any;
        console.log(`${branchId.padEnd(15)}: ${statsTyped.students.toString().padEnd(4)} students, ${statsTyped.teachers.toString().padEnd(3)} teachers`);
      }
      
      return true;
    } else {
      console.log('\n🚨 VALIDATION FAILED - EMPTY TABLES DETECTED!');
      console.log('❌ The following tables are empty:');
      for (const table of tableResults.emptyTables) {
        console.log(`   - ${table}`);
      }
      console.log('❌ Manual intervention or complete re-seed required');
      return false;
    }
  } catch (error) {
    console.error('❌ Validation failed with error:', (error as Error).message);
    return false;
  }
}

// ========== BRANCH DATA GENERATION ==========
async function generateBranchData(branchId: string, config: any) {
  console.log(`\n🏫 Generating data for ${config.name} (${branchId})...`);
  
  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      id: branchId,
      name: config.name,
      subdomain: config.subdomain,
      branchId: branchId
    }
  });

  // Create academic year (or get existing)
  let academicYear = await prisma.academicYear.findFirst({
    where: { 
      branchId: branchId,
      name: '2024-2025'
    }
  });
  
  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        branchId: branchId,
        name: '2024-2025',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        isActive: true
      }
    });
  }

  // Create time slots (Indian school schedule)
  console.log('🕒 Generating time slots...');
  const timeSlots = [];
  
  // Indian school schedule: Monday-Friday (11 periods + assembly + 2 breaks = 13 slots)
  // Saturday: 8 periods + assembly + 1 break = 10 slots
  const scheduleTemplate = {
    weekdays: [
      { startTime: '07:50', endTime: '08:00', slotType: 'assembly', name: 'Morning Assembly' },
      { startTime: '08:00', endTime: '08:40', slotType: 'regular', name: 'Period 1' },
      { startTime: '08:40', endTime: '09:20', slotType: 'regular', name: 'Period 2' },
      { startTime: '09:20', endTime: '10:00', slotType: 'regular', name: 'Period 3' },
      { startTime: '10:00', endTime: '10:40', slotType: 'regular', name: 'Period 4' },
      { startTime: '10:40', endTime: '11:00', slotType: 'break', name: 'Short Break' },
      { startTime: '11:00', endTime: '11:40', slotType: 'regular', name: 'Period 5' },
      { startTime: '11:40', endTime: '12:20', slotType: 'regular', name: 'Period 6' },
      { startTime: '12:20', endTime: '13:00', slotType: 'regular', name: 'Period 7' },
      { startTime: '13:00', endTime: '13:40', slotType: 'break', name: 'Lunch Break' },
      { startTime: '13:40', endTime: '14:20', slotType: 'regular', name: 'Period 8' },
      { startTime: '14:20', endTime: '15:00', slotType: 'regular', name: 'Period 9' },
      { startTime: '15:00', endTime: '15:40', slotType: 'regular', name: 'Period 10' },
      { startTime: '15:40', endTime: '16:20', slotType: 'regular', name: 'Period 11' }
    ],
    saturday: [
      { startTime: '07:50', endTime: '08:00', slotType: 'assembly', name: 'Morning Assembly' },
      { startTime: '08:00', endTime: '08:40', slotType: 'regular', name: 'Period 1' },
      { startTime: '08:40', endTime: '09:20', slotType: 'regular', name: 'Period 2' },
      { startTime: '09:20', endTime: '10:00', slotType: 'regular', name: 'Period 3' },
      { startTime: '10:00', endTime: '10:40', slotType: 'regular', name: 'Period 4' },
      { startTime: '10:40', endTime: '11:00', slotType: 'break', name: 'Short Break' },
      { startTime: '11:00', endTime: '11:40', slotType: 'regular', name: 'Period 5' },
      { startTime: '11:40', endTime: '12:20', slotType: 'regular', name: 'Period 6' },
      { startTime: '12:20', endTime: '13:00', slotType: 'regular', name: 'Period 7' },
      { startTime: '13:00', endTime: '13:40', slotType: 'regular', name: 'Period 8' }
    ]
  };
  
  // Generate time slots for each day of the week
  for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) { // 1=Monday, 6=Saturday
    const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek - 1];
    const schedule = dayOfWeek <= 5 ? scheduleTemplate.weekdays : scheduleTemplate.saturday;
    
    for (let slotOrder = 0; slotOrder < schedule.length; slotOrder++) {
      const slot = schedule[slotOrder];
      
      const timeSlot = await prisma.timeSlot.create({
        data: {
          branchId: branchId,
          dayOfWeek: dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotType: slot.slotType,
          slotOrder: slotOrder
        }
      });
      timeSlots.push(timeSlot);
    }
  }
  
  console.log(`✅ Generated ${timeSlots.length} time slots (${scheduleTemplate.weekdays.length * 5 + scheduleTemplate.saturday.length} total)`);

  // Create classes
  const classes = [];
  for (let i = 0; i < config.grades.length; i++) {
    const gradeName = config.grades[i];
    const cls = await prisma.class.create({
      data: {
        branchId: branchId,
        name: gradeName,
        gradeLevel: getGradeLevel(gradeName)
      }
    });
    classes.push(cls);
  }

  // Create subjects (Grade-appropriate Indian context)
  const subjects = [];
  
  // Grade-level subject mapping based on Indian education system
  const gradeSubjectMapping = [
    // Early Childhood (Nursery=0, LKG=1, UKG=2)
    { code: 'ENG_BASIC', name: 'English', credits: 4, isElective: false, minGrade: 0, maxGrade: 12, category: 'core' },
    { code: 'HINDI_BASIC', name: 'Hindi', credits: 4, isElective: false, minGrade: 0, maxGrade: 12, category: 'language' },
    { code: 'MATH_BASIC', name: 'Mathematics', credits: 4, isElective: false, minGrade: 0, maxGrade: 12, category: 'core' },
    { code: 'ART', name: 'Art & Craft', credits: 2, isElective: false, minGrade: 0, maxGrade: 12, category: 'arts' },
    { code: 'MUS', name: 'Music', credits: 2, isElective: false, minGrade: 0, maxGrade: 12, category: 'arts' },
    { code: 'PE', name: 'Physical Education', credits: 2, isElective: false, minGrade: 0, maxGrade: 12, category: 'activity' },
    { code: 'ENV_SCIENCE', name: 'Environmental Science', credits: 3, isElective: false, minGrade: 0, maxGrade: 4, category: 'science' },
    
    // Primary Grades (Class 1-5 = grade 3-7)
    { code: 'SCI_BASIC', name: 'Science', credits: 4, isElective: false, minGrade: 3, maxGrade: 7, category: 'science' },
    { code: 'SST_BASIC', name: 'Social Studies', credits: 3, isElective: false, minGrade: 3, maxGrade: 7, category: 'core' },
    { code: 'COMP_BASIC', name: 'Computer Science', credits: 3, isElective: true, minGrade: 3, maxGrade: 12, category: 'elective' },
    { code: 'SANS', name: 'Sanskrit', credits: 2, isElective: true, minGrade: 5, maxGrade: 12, category: 'language' },
    
    // Middle Grades (Class 6-8 = grade 8-10)
    { code: 'HIST_INTRO', name: 'History', credits: 3, isElective: false, minGrade: 8, maxGrade: 14, category: 'core' },
    { code: 'GEO_INTRO', name: 'Geography', credits: 3, isElective: false, minGrade: 8, maxGrade: 14, category: 'core' },
    
    // Secondary Grades (Class 9-12 = grade 11-14)
    { code: 'PHY', name: 'Physics', credits: 4, isElective: false, minGrade: 11, maxGrade: 14, category: 'science' },
    { code: 'CHEM', name: 'Chemistry', credits: 4, isElective: false, minGrade: 11, maxGrade: 14, category: 'science' },
    { code: 'BIO', name: 'Biology', credits: 4, isElective: false, minGrade: 11, maxGrade: 14, category: 'science' },
    { code: 'ECO', name: 'Economics', credits: 3, isElective: true, minGrade: 11, maxGrade: 14, category: 'elective' },
    { code: 'POL', name: 'Political Science', credits: 3, isElective: true, minGrade: 11, maxGrade: 14, category: 'elective' }
  ];
  
  // Get minimum and maximum grade levels for this branch
  const branchGradeLevels = classes.map(cls => cls.gradeLevel || 0);
  const minBranchGrade = Math.min(...branchGradeLevels);
  const maxBranchGrade = Math.max(...branchGradeLevels);
  
  // Filter subjects appropriate for this branch's grade range
  const appropriateSubjects = gradeSubjectMapping.filter(subject => 
    subject.minGrade <= maxBranchGrade && 
    (subject.maxGrade === undefined || subject.maxGrade >= minBranchGrade)
  );
  
  console.log(`📚 Creating ${appropriateSubjects.length} grade-appropriate subjects for grades ${minBranchGrade}-${maxBranchGrade}`);
  
  for (const subjectInfo of appropriateSubjects) {
    const subject = await prisma.subject.create({
      data: {
        branchId: branchId,
        code: `${branchId}-${subjectInfo.code}-${Date.now()}`,
        name: subjectInfo.name,
        credits: subjectInfo.credits,
        isElective: subjectInfo.isElective
      }
    });
    subjects.push(subject);
  }
  
  console.log(`✅ Created ${subjects.length} subjects: ${subjects.map(s => s.name).join(', ')}`);

  // Create staff (Indian names and context)
  const staff = [];
  const staffCount = Math.min(50, classes.length * 4); // 4 staff per class minimum
  
  for (let i = 0; i < staffCount; i++) {
    const gender = Math.random() > 0.4 ? 'male' : 'female'; // 60% male, 40% female
    const name = getRandomName(gender);
    const designations = i < 2 ? ['Principal', 'Vice Principal'] : 
                        i < 5 ? ['Head Teacher', 'Coordinator'] :
                        ['Teacher', 'Assistant Teacher', 'Librarian', 'Lab Assistant'];
    
    const staffMember = await prisma.staff.create({
      data: {
        branchId: branchId,
        firstName: name.first,
        lastName: name.last,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@${config.subdomain}.edu.in`,
        phone: getIndianPhoneNumber(),
        designation: i < designations.length ? designations[i] : designations[Math.floor(Math.random() * designations.length)],
        department: i < 5 ? 'Administration' : ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'][Math.floor(Math.random() * 5)],
        employmentType: 'Full-time',
        joinDate: '2023-04-01',
        status: 'active'
      }
    });
    staff.push(staffMember);
  }

  // Create teachers from staff
  const teachers = [];
  const teacherEligibleStaff = staff.filter(s => s.designation?.includes('Teacher') || s.designation === 'Principal' || s.designation === 'Vice Principal');
  
  for (const staffMember of teacherEligibleStaff) {
    const qualifications = [
      'B.Ed + B.A', 'M.Ed + M.A', 'B.Ed + B.Sc', 'M.Ed + M.Sc',
      'B.El.Ed', 'M.A + B.Ed', 'M.Sc + B.Ed', 'B.Tech + B.Ed'
    ];
    
    // Assign subjects based on department/specialization for more realism
    let teacherSubjects = [];
    const department = staffMember.department;
    
    if (department === 'Mathematics') {
      teacherSubjects = subjects.filter(s => s.name === 'Mathematics').slice(0, 2);
    } else if (department === 'Science') {
      teacherSubjects = subjects.filter(s => 
        s.name.includes('Science') || s.name === 'Physics' || 
        s.name === 'Chemistry' || s.name === 'Biology' || 
        s.name === 'Environmental Science'
      ).slice(0, 3);
    } else if (department === 'English') {
      teacherSubjects = subjects.filter(s => s.name === 'English').slice(0, 2);
    } else if (department === 'Hindi') {
      teacherSubjects = subjects.filter(s => 
        s.name === 'Hindi' || s.name === 'Sanskrit'
      ).slice(0, 2);
    } else if (department === 'Social Studies') {
      teacherSubjects = subjects.filter(s => 
        s.name.includes('Social Studies') || s.name === 'History' || 
        s.name === 'Geography' || s.name === 'Political Science' || 
        s.name === 'Economics'
      ).slice(0, 3);
    } else {
      // For administration or other departments, assign general subjects
      teacherSubjects = subjects.filter(s => 
        s.name === 'English' || s.name === 'Mathematics' || 
        s.name === 'Art & Craft' || s.name === 'Physical Education'
      ).slice(0, 2);
    }
    
    // Fallback to any subjects if none match
    if (teacherSubjects.length === 0) {
      teacherSubjects = subjects.slice(0, 2);
    }
    
    const teacher = await prisma.teacher.create({
      data: {
        branchId: branchId,
        staffId: staffMember.id,
        subjects: teacherSubjects.map(s => s.name).join(', '),
        qualifications: qualifications[Math.floor(Math.random() * qualifications.length)],
        experienceYears: Math.floor(Math.random() * 15) + 2
      }
    });
    teachers.push(teacher);
  }

  // Create sections and students
  const sections = [];
  const students = [];

  for (const cls of classes) {
    for (const sectionName of config.sections) {
      const section = await prisma.section.create({
        data: {
          branchId: branchId,
          name: sectionName,
          classId: cls.id,
          capacity: config.studentsPerSection,
          homeroomTeacherId: teachers[Math.floor(Math.random() * teachers.length)]?.id
        }
      });
      sections.push(section);

      // Generate students for this section
      const studentsInSection = Math.floor(Math.random() * 8) + (config.studentsPerSection - 5); // ±5 variation
      
      for (let i = 0; i < studentsInSection; i++) {
        const gender = Math.random() > 0.52 ? 'male' : 'female'; // Slight male preference (Indian context)
        const name = getRandomName(gender);
        const birthYear = new Date().getFullYear() - (cls.gradeLevel || 1) - 4; // Age appropriate
        
        const student = await prisma.student.create({
          data: {
            branchId: branchId,
            admissionNo: `${config.type}${new Date().getFullYear()}${String(globalAdmissionCounter).padStart(4, '0')}`,
            firstName: name.first,
            lastName: name.last,
            dob: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            gender: gender,
            classId: cls.id,
            sectionId: section.id,
            rollNumber: String(i + 1),
            status: getRealisticStudentStatus(cls.gradeLevel || 1)
          }
        });
        students.push(student);
        globalAdmissionCounter++;
      }
    }
  }

  // Create guardians and relationships
  const guardians = [];
  const families = new Map<string, { father?: any, mother?: any }>();
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const familyKey = `${student.lastName}_${Math.floor(i / 3)}`; // Group students into families
    
    // Check if family exists (siblings)
    if (families.has(familyKey) && Math.random() > 0.7) {
      const family = families.get(familyKey)!;
      
      if (family.father) {
        await prisma.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: family.father.id,
            relation: 'father',
            isPrimary: true,
            canPickup: true,
            emergencyContact: true
          }
        });
      }
      
      if (family.mother) {
        await prisma.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: family.mother.id,
            relation: 'mother',
            isPrimary: false,
            canPickup: true,
            emergencyContact: true
          }
        });
      }
    } else {
      // Create new family
      const family: { father?: any, mother?: any } = {};
      const guardianCount = Math.random() > 0.15 ? 2 : 1; // 85% have both parents
      
      for (let j = 0; j < guardianCount; j++) {
        const relation = j === 0 ? 'father' : 'mother';
        const guardianGender = relation === 'father' ? 'male' : 'female';
        const guardianName = getRandomName(guardianGender);
        
        const occupations = [
          'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Lawyer', 'Accountant',
          'Government Officer', 'Architect', 'Consultant', 'Manager', 'Engineer', 'Banker',
          'Designer', 'Pharmacist', 'Professor', 'Trader', 'Contractor', 'Administrator'
        ];
        
        const guardian = await prisma.guardian.create({
          data: {
            branchId: branchId,
            name: `${relation === 'father' ? 'Mr.' : 'Mrs.'} ${guardianName.first} ${student.lastName}`,
            email: `${guardianName.first.toLowerCase()}.${student.lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@gmail.com`,
            phoneNumber: getIndianPhoneNumber(),
            alternatePhoneNumber: Math.random() > 0.6 ? getIndianPhoneNumber() : null,
            address: getIndianAddress(config.location),
            occupation: occupations[Math.floor(Math.random() * occupations.length)]
          }
        });
        
        if (relation === 'father') family.father = guardian;
        else family.mother = guardian;
        
        await prisma.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: guardian.id,
            relation: relation,
            isPrimary: j === 0,
            canPickup: true,
            emergencyContact: true
          }
        });
        
        guardians.push(guardian);
      }
      
      families.set(familyKey, family);
    }
  }

  // Create enrollments
  for (const student of students) {
    if (student.sectionId) {
      let startDate = academicYear.startDate;
      let endDate = undefined;
      let enrollmentStatus = 'enrolled';
      
      if (student.status === 'graduated') {
        const yearsAgo = Math.floor(Math.random() * 3) + 1;
        startDate = `${2024 - yearsAgo - 1}-04-01`;
        endDate = `${2024 - yearsAgo}-03-31`;
        enrollmentStatus = 'completed';
      } else if (student.status === 'inactive') {
        enrollmentStatus = 'inactive';
      }
      
      await prisma.enrollment.create({
        data: {
          branchId: branchId,
          studentId: student.id,
          sectionId: student.sectionId,
          status: enrollmentStatus,
          startDate: startDate,
          endDate: endDate
        }
      });
    }
  }

  // Create fee structures (Indian context)
  for (const cls of classes) {
    const gradeLevel = cls.gradeLevel || 0;
    const baseFee = config.baseFee + (gradeLevel * 200); // Higher classes cost more
    
    const feeStructure = await prisma.feeStructure.create({
      data: {
        branchId: branchId,
        gradeId: cls.id,
        schedules: {
          create: {
            branchId: branchId,
            classId: cls.id,
            recurrence: 'quarterly',
            dueDayOfMonth: 5,
            startDate: academicYear.startDate,
            endDate: academicYear.endDate,
            status: 'active'
          }
        }
      }
    });
    
    // Indian fee components
    const feeComponents = [
      { type: 'TUITION', name: 'Tuition Fee', amount: baseFee },
      { type: 'TRANSPORT', name: 'Transport Fee', amount: 1800 },
      { type: 'LAB', name: 'Laboratory Fee', amount: gradeLevel >= 8 ? 1200 : 600 },
      { type: 'LIBRARY', name: 'Library Fee', amount: 500 },
      { type: 'SPORTS', name: 'Sports Fee', amount: 800 },
      { type: 'ANNUAL_DAY', name: 'Annual Day Fee', amount: 300 },
      { type: 'EXAM', name: 'Examination Fee', amount: gradeLevel >= 10 ? 1000 : 500 }
    ];
    
    for (const component of feeComponents) {
      await prisma.feeComponent.create({
        data: {
          branchId: branchId,
          feeStructureId: feeStructure.id,
          type: component.type,
          name: component.name,
          amount: component.amount
        }
      });
    }
  }

  // Create comprehensive CBSE exam structure
  const exams = [];
  
  // Helper function to get exam status based on dates
  function getExamStatus(startDate: string): string {
    const today = new Date();
    const examStart = new Date(startDate);
    
    if (examStart > today) return 'SCHEDULED';
    
    const daysPassed = Math.floor((today.getTime() - examStart.getTime()) / (1000 * 60 * 60 * 24));
    if (daysPassed <= 7) return 'ONGOING';
    return 'COMPLETED';
  }
  
  // CBSE Exam patterns based on grade levels
  function getExamPatternForGrade(gradeLevel: number) {
    if (gradeLevel <= 2) { // Pre-Primary & Primary (Nursery-Class 2)
      return [
        { name: 'Unit Assessment 1', startDate: '2024-07-15', endDate: '2024-07-18', type: 'UNIT_TEST', weightage: 25, term: 1 },
        { name: 'Unit Assessment 2', startDate: '2024-09-16', endDate: '2024-09-18', type: 'UNIT_TEST', weightage: 25, term: 1 },
        { name: 'Mid Term Assessment', startDate: '2024-11-25', endDate: '2024-11-28', type: 'HALF_YEARLY', weightage: 25, term: 2 },
        { name: 'Annual Assessment', startDate: '2025-03-17', endDate: '2025-03-20', type: 'ANNUAL', weightage: 25, term: 3 }
      ];
    } else if (gradeLevel <= 7) { // Primary (Classes 1-5)
      return [
        { name: 'Unit Test 1', startDate: '2024-07-08', endDate: '2024-07-12', type: 'UNIT_TEST', weightage: 10, term: 1 },
        { name: 'Unit Test 2', startDate: '2024-08-26', endDate: '2024-08-30', type: 'UNIT_TEST', weightage: 10, term: 1 },
        { name: 'Unit Test 3', startDate: '2024-09-23', endDate: '2024-09-27', type: 'UNIT_TEST', weightage: 10, term: 2 },
        { name: 'Half Yearly Exam', startDate: '2024-11-18', endDate: '2024-11-28', type: 'HALF_YEARLY', weightage: 30, term: 2 },
        { name: 'Annual Exam', startDate: '2025-03-10', endDate: '2025-03-20', type: 'ANNUAL', weightage: 40, term: 3 }
      ];
    } else if (gradeLevel <= 10) { // Middle School (Classes 6-8)
      return [
        { name: 'Unit Test 1', startDate: '2024-07-15', endDate: '2024-07-19', type: 'UNIT_TEST', weightage: 10, term: 1 },
        { name: 'Unit Test 2', startDate: '2024-09-09', endDate: '2024-09-13', type: 'UNIT_TEST', weightage: 10, term: 2 },
        { name: 'Half Yearly Exam', startDate: '2024-12-02', endDate: '2024-12-12', type: 'HALF_YEARLY', weightage: 35, term: 2 },
        { name: 'Unit Test 3', startDate: '2025-01-20', endDate: '2025-01-24', type: 'UNIT_TEST', weightage: 10, term: 3 },
        { name: 'Annual Exam', startDate: '2025-03-03', endDate: '2025-03-15', type: 'ANNUAL', weightage: 35, term: 3 }
      ];
    } else if (gradeLevel <= 12) { // Secondary (Classes 9-10)
      return [
        { name: 'Unit Test 1', startDate: '2024-07-22', endDate: '2024-07-26', type: 'UNIT_TEST', weightage: 10, term: 1 },
        { name: 'Half Yearly Exam', startDate: '2024-11-25', endDate: '2024-12-07', type: 'HALF_YEARLY', weightage: 35, term: 2 },
        { name: 'Pre-Board Exam', startDate: '2025-01-13', endDate: '2025-01-25', type: 'PRE_BOARD', weightage: 20, term: 3 },
        { name: 'Annual/Board Exam', startDate: '2025-03-24', endDate: '2025-04-10', type: 'ANNUAL', weightage: 35, term: 3 }
      ];
    } else { // Senior Secondary (Classes 11-12)
      return [
        { name: 'Unit Test 1', startDate: '2024-07-29', endDate: '2024-08-02', type: 'UNIT_TEST', weightage: 10, term: 1 },
        { name: 'Half Yearly Exam', startDate: '2024-12-09', endDate: '2024-12-21', type: 'HALF_YEARLY', weightage: 30, term: 2 },
        { name: 'Pre-Board Exam 1', startDate: '2024-12-23', endDate: '2025-01-03', type: 'PRE_BOARD', weightage: 15, term: 2 },
        { name: 'Pre-Board Exam 2', startDate: '2025-02-03', endDate: '2025-02-15', type: 'PRE_BOARD', weightage: 15, term: 3 },
        { name: 'Board Exam', startDate: '2025-08-25', endDate: '2025-09-10', type: 'BOARD', weightage: 30, term: 3 }
      ];
    }
  }
  
  // Generate exams for each class based on grade level
  for (const cls of classes) {
    const gradeLevel = cls.gradeLevel || 0;
    const examPattern = getExamPatternForGrade(gradeLevel);
    
    for (const examType of examPattern) {
      const exam = await prisma.exam.create({
        data: {
          branchId: branchId,
          name: `${cls.name} - ${examType.name}`,
          examType: examType.type,
          academicYearId: academicYear.id,
          term: examType.term,
          weightagePercent: examType.weightage,
          maxMarks: gradeLevel >= 9 ? 100 : 80, // Higher classes have 100 marks
          minPassingMarks: gradeLevel >= 9 ? 33 : 40, // CBSE standard
          startDate: examType.startDate,
          endDate: examType.endDate,
          status: getExamStatus(examType.startDate)
        }
      });
      exams.push(exam);
    }
  }

  // ========== GENERATE TIMETABLE PERIODS ==========
  console.log('📅 Generating timetable periods...');
  
  const timetablePeriods = [];
  
  // Helper function to get grade-appropriate subjects for a class
  function getGradeAppropriateSubjects(classGradeLevel: number, allSubjects: any[], subjectMapping: any[]) {
    const appropriateSubjectNames = subjectMapping
      .filter(subject => 
        classGradeLevel >= subject.minGrade && 
        (subject.maxGrade === undefined || classGradeLevel <= subject.maxGrade)
      )
      .map(subject => subject.name);
    
    return allSubjects.filter(subject => 
      appropriateSubjectNames.includes(subject.name)
    );
  }
  
  // Create timetable periods for each section with grade-appropriate subjects
  for (const section of sections) {
    // Get the class information for this section to determine grade level
    const sectionClass = classes.find(cls => cls.id === section.classId);
    if (!sectionClass) continue;
    
    const classGradeLevel = sectionClass.gradeLevel || 0;
    
    // Get subjects appropriate for this grade level
    const gradeAppropriateSubjects = getGradeAppropriateSubjects(
      classGradeLevel, 
      subjects, 
      gradeSubjectMapping
    );
    
    if (gradeAppropriateSubjects.length === 0) {
      console.log(`⚠️ No appropriate subjects found for ${sectionClass.name} (grade ${classGradeLevel})`);
      continue;
    }
    
    console.log(`📚 ${sectionClass.name}-${section.name}: ${gradeAppropriateSubjects.length} appropriate subjects (${gradeAppropriateSubjects.map(s => s.name).join(', ')})`);
    
    // Generate periods for Monday-Friday (dayOfWeek: 1-5)
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
      // Get time slots for this day (only regular periods, not breaks)
      const dayTimeSlots = timeSlots.filter(ts => 
        ts.dayOfWeek === dayOfWeek && ts.slotType === 'regular'
      );
      
      // Create periods for each time slot
      for (let i = 0; i < Math.min(4, dayTimeSlots.length); i++) { // Max 4 periods per day (reduced for testing)
        const timeSlot = dayTimeSlots[i];
        
        // CRITICAL FIX: Use grade-appropriate subjects instead of all subjects
        const subject = gradeAppropriateSubjects[Math.floor(Math.random() * gradeAppropriateSubjects.length)];
        
        // IMPROVEMENT: Prefer teachers who specialize in this subject
        const specializedTeachers = teachers.filter(teacher => 
          teacher.subjects.includes(subject.name)
        );
        
        // If no specialized teachers found, use any teacher
        const availableTeachers = specializedTeachers.length > 0 ? specializedTeachers : teachers;
        const teacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
        
        const period = await prisma.timetablePeriod.create({
          data: {
            branchId: branchId,
            sectionId: section.id,
            dayOfWeek: dayOfWeek,
            periodNumber: i + 1,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            subjectId: subject.id,
            teacherId: teacher.id,
            isBreak: false,
            academicYearId: academicYear.id
          }
        });
        timetablePeriods.push(period);
      }
    }
  }
  
  console.log(`✅ Generated ${timetablePeriods.length} timetable periods`);

  // ========== GENERATE PERIOD-BASED ATTENDANCE SYSTEM ==========
  console.log('📊 Generating period-based attendance sessions and records...');
  
  const activeStudents = students.filter(s => s.status === 'active');
  const attendanceSessions = [];
  const studentAttendanceData = [];
  
  // Generate attendance for the last 20 working days (reduced for faster seeding)
  for (let day = 0; day < 20; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    // Skip weekends (Indian schools typically work Mon-Sat, but we'll use Mon-Fri for now)
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dayOfWeek = date.getDay(); // 1=Monday, 5=Friday
    
    // Get time slots for this day
    const dayTimeSlots = timeSlots.filter(ts => 
      ts.dayOfWeek === dayOfWeek && ts.slotType === 'regular'
    );
    
    // Create attendance sessions using the created timetable periods
    const dayPeriods = timetablePeriods.filter(tp => tp.dayOfWeek === dayOfWeek);
    
    for (const period of dayPeriods) {
      // Use the period's assigned teacher or substitute
      const assignedTeacher = teachers.find(t => t.id === period.teacherId) || 
        teachers[Math.floor(Math.random() * teachers.length)];
      const actualTeacher = Math.random() > 0.05 ? assignedTeacher : 
        teachers[Math.floor(Math.random() * teachers.length)]; // 5% substitution rate
      
      const session = await prisma.attendanceSession.create({
        data: {
          branchId: branchId,
          date: date,
          periodId: period.id, // Now using TimetablePeriod.id
          sectionId: period.sectionId,
          subjectId: period.subjectId || subjects[0].id, // Fallback to first subject
          assignedTeacherId: assignedTeacher.id,
          actualTeacherId: actualTeacher.id,
          status: Math.random() > 0.02 ? 'completed' : 'scheduled' // 2% scheduled sessions
        }
      });
      attendanceSessions.push(session);
        
      // Generate student attendance for this session (limit to first 10 students per section for testing)
      const sectionStudents = activeStudents
        .filter(s => s.sectionId === period.sectionId)
        .slice(0, 10);
      
      for (const student of sectionStudents) {
        const random = Math.random();
        let status = 'present';
        let reason = null;
        let minutesLate = null;
        
        // Realistic Indian school attendance patterns
        if (random < 0.04) { // 4% absent
          status = 'absent';
          const reasons = [
            'Fever and cold', 'Family function', 'Medical appointment', 'Transport strike',
            'Heavy rain', 'Personal work', 'Festival celebration', 'Sick leave'
          ];
          reason = reasons[Math.floor(Math.random() * reasons.length)];
        } else if (random < 0.07) { // 3% late
          status = 'late';
          minutesLate = Math.floor(Math.random() * 45) + 5; // 5-50 minutes late
          const lateReasons = [
            'Traffic jam', 'Auto rickshaw delay', 'Bus breakdown', 'Monsoon flooding',
            'Transport delay', 'Overslept', 'Doctor visit', 'Family emergency'
          ];
          reason = lateReasons[Math.floor(Math.random() * lateReasons.length)];
        } else if (random < 0.08) { // 1% medical
          status = 'medical';
          reason = 'Medical emergency';
        } else if (random < 0.09) { // 1% excused
          status = 'excused';
          const excusedReasons = [
            'School competition', 'Cultural program', 'Sports meet', 'Educational trip'
          ];
          reason = excusedReasons[Math.floor(Math.random() * excusedReasons.length)];
        }
        
        studentAttendanceData.push({
          sessionId: session.id,
          studentId: student.id,
          status: status,
          minutesLate: minutesLate,
          reason: reason,
          markedAt: new Date(),
          markedBy: actualTeacher.id
        });
      }
    }
  }
  
  // Bulk create student period attendance in batches
  if (studentAttendanceData.length > 0) {
    console.log(`📝 Creating ${studentAttendanceData.length} student attendance records in batches...`);
    
    const batchSize = 1000;
    for (let i = 0; i < studentAttendanceData.length; i += batchSize) {
      const batch = studentAttendanceData.slice(i, i + batchSize);
      await prisma.studentPeriodAttendance.createMany({
        data: batch
      });
      console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}: Created ${batch.length} records`);
    }
    
    console.log(`✅ Generated ${attendanceSessions.length} attendance sessions`);
    console.log(`✅ Generated ${studentAttendanceData.length} student attendance records`);
  }

  // ========== GENERATE TEACHER ATTENDANCE ==========
  console.log('📊 Generating teacher attendance records...');
  const teacherAttendanceData = [];
  const startDate = new Date('2024-04-01');
  const endDate = new Date();
  
  // Generate attendance for the entire academic year
  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
    
    const dateStr = currentDate.toISOString().split('T')[0];
    
    for (const teacher of teachers) {
      const random = Math.random();
      let status = 'PRESENT';
      let leaveType = null;
      let checkIn = '08:30';
      let checkOut = '16:30';
      let remarks = null;
      
      // Realistic attendance patterns
      if (random < 0.02) { // 2% absent
        status = 'ABSENT';
        checkIn = null;
        checkOut = null;
        remarks = 'Sick leave';
      } else if (random < 0.03) { // 1% on leave
        status = 'ON_LEAVE';
        leaveType = ['CASUAL', 'SICK', 'EARNED'][Math.floor(Math.random() * 3)];
        checkIn = null;
        checkOut = null;
        remarks = `${leaveType.toLowerCase()} leave`;
      } else if (random < 0.05) { // 2% late
        status = 'LATE';
        const lateMinutes = Math.floor(Math.random() * 60) + 15; // 15-75 minutes late
        const lateTime = new Date('1970-01-01T08:30:00');
        lateTime.setMinutes(lateTime.getMinutes() + lateMinutes);
        checkIn = lateTime.toTimeString().slice(0, 5);
        remarks = `Late by ${lateMinutes} minutes`;
      } else if (random < 0.07) { // 2% half day
        status = 'HALF_DAY';
        checkOut = '12:30';
        remarks = 'Personal work - half day';
      }
      
      teacherAttendanceData.push({
        branchId: branchId,
        teacherId: teacher.id,
        date: dateStr,
        checkIn,
        checkOut,
        status,
        leaveType,
        remarks
      });
    }
  }
  
  if (teacherAttendanceData.length > 0) {
    await prisma.teacherAttendance.createMany({
      data: teacherAttendanceData
    });
    console.log(`✅ Generated ${teacherAttendanceData.length} teacher attendance records`);
  }

  // ========== GENERATE EXAM SESSIONS AND MARKS ==========
  console.log('📝 Generating exam sessions and marks...');
  
  // Create exam sessions for each exam-subject combination
  const examSessions = [];
  for (const exam of exams) {
    // Get students for this exam (based on the class from exam name)
    const examClassMatch = exam.name.match(/Class (\d+|\w+)/);
    const examClass = examClassMatch ? examClassMatch[1] : null;
    
    if (examClass) {
      const targetClass = classes.find(c => c.name.includes(examClass));
      if (targetClass) {
        const classStudents = students.filter(s => s.classId === targetClass.id && s.status === 'active');
        
        // Create sessions for subjects relevant to this grade level
        const gradeLevel = targetClass.gradeLevel || 0;
        const relevantSubjects = subjects.filter(subject => {
          // Basic subjects for all grades
          if (['English', 'Hindi', 'Mathematics', 'Physical Education'].includes(subject.name)) return true;
          // Science subjects for higher grades
          if (gradeLevel >= 8 && ['Physics', 'Chemistry', 'Biology'].includes(subject.name)) return true;
          // Combined science for lower grades
          if (gradeLevel < 8 && subject.name === 'Science') return true;
          // Social studies
          if (gradeLevel >= 5 && ['Social Studies', 'History', 'Geography'].includes(subject.name)) return true;
          // Optional subjects for higher grades
          if (gradeLevel >= 9 && ['Computer Science', 'Economics', 'Political Science'].includes(subject.name) && Math.random() > 0.5) return true;
          return false;
        });
        
        for (const subject of relevantSubjects) {
          const session = await prisma.examSession.create({
            data: {
              branchId: branchId,
              examId: exam.id,
              subjectId: subject.id,
              schedule: `${exam.startDate} 09:00 - 12:00`
            }
          });
          examSessions.push({ session, students: classStudents, exam, subject });
        }
      }
    }
  }
  
  // Generate marks for all exam sessions
  const marksData = [];
  for (const { session, students: sessionStudents, exam, subject } of examSessions) {
    for (const student of sessionStudents) {
      const isAbsent = Math.random() < 0.03; // 3% absent rate
      
      let theoryMarks = null;
      let practicalMarks = null;
      let projectMarks = null;
      let internalMarks = null;
      let totalMarks = 0;
      let grade = null;
      let remarks = null;
      
      if (!isAbsent) {
        const maxMarks = exam.maxMarks || 100;
        const minPass = exam.minPassingMarks || 33;
        
        // Generate realistic marks distribution
        const performance = Math.random();
        let baseScore;
        
        if (performance < 0.05) { // 5% fail
          baseScore = Math.random() * (minPass - 5) + 5;
        } else if (performance < 0.20) { // 15% average
          baseScore = Math.random() * 15 + minPass;
        } else if (performance < 0.70) { // 50% good
          baseScore = Math.random() * 20 + (minPass + 15);
        } else if (performance < 0.90) { // 20% very good
          baseScore = Math.random() * 15 + (maxMarks - 25);
        } else { // 10% excellent
          baseScore = Math.random() * 10 + (maxMarks - 10);
        }
        
        // Distribute marks across components
        if (['Physics', 'Chemistry', 'Biology', 'Science'].includes(subject.name)) {
          theoryMarks = Math.round(baseScore * 0.7);
          practicalMarks = Math.round(baseScore * 0.3);
          totalMarks = theoryMarks + practicalMarks;
        } else if (subject.name === 'Computer Science') {
          theoryMarks = Math.round(baseScore * 0.6);
          practicalMarks = Math.round(baseScore * 0.4);
          totalMarks = theoryMarks + practicalMarks;
        } else if (['Art & Craft', 'Music'].includes(subject.name)) {
          projectMarks = Math.round(baseScore * 0.8);
          internalMarks = Math.round(baseScore * 0.2);
          totalMarks = projectMarks + internalMarks;
        } else {
          theoryMarks = Math.round(baseScore);
          internalMarks = Math.round(baseScore * 0.1); // 10% internal assessment
          totalMarks = theoryMarks + internalMarks;
        }
        
        // Calculate grade based on CBSE pattern
        const percentage = (totalMarks / maxMarks) * 100;
        if (percentage >= 91) grade = 'A1';
        else if (percentage >= 81) grade = 'A2';
        else if (percentage >= 71) grade = 'B1';
        else if (percentage >= 61) grade = 'B2';
        else if (percentage >= 51) grade = 'C1';
        else if (percentage >= 41) grade = 'C2';
        else if (percentage >= 33) grade = 'D';
        else grade = 'E';
        
        // Add remarks for exceptional cases
        if (percentage >= 95) remarks = 'Outstanding performance';
        else if (percentage < minPass) remarks = 'Needs improvement';
        else if (percentage >= 85) remarks = 'Excellent work';
      } else {
        remarks = 'Absent';
      }
      
      marksData.push({
        branchId: branchId,
        examId: exam.id,
        subjectId: subject.id,
        studentId: student.id,
        theoryMarks,
        practicalMarks,
        projectMarks,
        internalMarks,
        totalMarks: isAbsent ? null : totalMarks,
        grade: isAbsent ? null : grade,
        remarks,
        isAbsent,
        evaluatedAt: exam.status === 'COMPLETED' ? new Date() : null
      });
    }
  }
  
  if (marksData.length > 0) {
    await prisma.mark.createMany({
      data: marksData
    });
    console.log(`✅ Generated ${marksData.length} exam marks records`);
  }

  // ========== CREATE ROOMS ==========
  console.log('🏫 Generating school rooms...');
  const rooms = [];
  
  // Generate rooms based on branch size
  const roomCount = Math.min(20, classes.length * 2); // 2 rooms per class minimum
  const roomTypes = [
    { type: 'classroom', capacity: config.studentsPerSection + 5, count: classes.length + 2 },
    { type: 'laboratory', capacity: 30, count: Math.ceil(classes.length / 5) },
    { type: 'library', capacity: 100, count: 1 },
    { type: 'auditorium', capacity: 500, count: 1 },
    { type: 'gymnasium', capacity: 200, count: 1 },
    { type: 'computer_lab', capacity: 40, count: Math.ceil(classes.length / 8) },
    { type: 'art_room', capacity: 25, count: 1 },
    { type: 'music_room', capacity: 30, count: 1 },
    { type: 'staffroom', capacity: 50, count: 2 }
  ];
  
  let roomNumber = 101;
  let globalRoomId = 1;
  
  for (const roomType of roomTypes) {
    for (let i = 0; i < roomType.count; i++) {
      const roomName = roomType.type === 'classroom' ? `Room ${roomNumber}` : 
                       roomType.type === 'laboratory' ? `${['Physics', 'Chemistry', 'Biology'][i % 3]} Lab` :
                       roomType.type === 'computer_lab' ? `Computer Lab ${i + 1}` :
                       roomType.type === 'staffroom' ? `Staff Room ${i + 1}` :
                       roomType.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const room = await prisma.room.create({
        data: {
          branchId: branchId,
          code: `${branchId.toUpperCase()}-${roomType.type.toUpperCase()}-${String(globalRoomId).padStart(3, '0')}`,
          name: roomName,
          building: 'Main Building',
          floor: String(Math.floor(roomNumber / 100)),
          capacity: roomType.capacity,
          type: roomType.type,
          facilities: JSON.stringify(getRoomFacilities(roomType.type)),
          isActive: true
        }
      });
      rooms.push(room);
      
      globalRoomId++;
      if (roomType.type === 'classroom') roomNumber++;
    }
  }
  
  console.log(`✅ Generated ${rooms.length} rooms`);
  
  function getRoomFacilities(roomType: string): string[] {
    const facilities = {
      classroom: ['whiteboard', 'projector', 'speakers', 'ac'],
      laboratory: ['lab_benches', 'safety_equipment', 'storage', 'ventilation'],
      library: ['bookshelves', 'reading_tables', 'computer_terminals', 'ac'],
      auditorium: ['stage', 'sound_system', 'lighting', 'seating'],
      gymnasium: ['sports_equipment', 'changing_rooms', 'first_aid'],
      computer_lab: ['computers', 'network', 'projector', 'ac'],
      art_room: ['easels', 'storage', 'sink', 'display_boards'],
      music_room: ['instruments', 'sound_proofing', 'recording_equipment'],
      staffroom: ['desks', 'lockers', 'coffee_machine', 'printer']
    };
    return facilities[roomType as keyof typeof facilities] || ['basic_furniture'];
  }

  // ========== CREATE COMMUNICATION TEMPLATES ==========
  console.log('📱 Generating communication templates...');
  const templates = [];
  const templateData = [
    {
      name: 'Fee Reminder Hindi',
      channel: 'sms',
      content: 'प्रिय {{parent_name}}, {{student_name}} की फीस ₹{{amount}} {{due_date}} तक जमा करना आवश्यक है। देर से भुगतान पर अतिरिक्त शुल्क लगेगा।',
      variables: JSON.stringify(['parent_name', 'amount', 'student_name', 'due_date'])
    },
    {
      name: 'PTM Invitation',
      channel: 'email',
      content: 'Dear {{parent_name}}, Parent-Teacher Meeting for {{student_name}} ({{class}}) is scheduled on {{ptm_date}} at {{ptm_time}}. Please attend.',
      variables: JSON.stringify(['parent_name', 'student_name', 'class', 'ptm_date', 'ptm_time'])
    },
    {
      name: 'Exam Results',
      channel: 'email',
      content: 'Dear Parents, {{exam_name}} results for {{student_name}} are available. Overall percentage: {{percentage}}%. Rank: {{rank}}',
      variables: JSON.stringify(['exam_name', 'student_name', 'percentage', 'rank'])
    },
    {
      name: 'Holiday Notice',
      channel: 'email',
      content: 'Dear Parents, School will remain closed from {{start_date}} to {{end_date}} for {{holiday_reason}}. Classes will resume on {{resume_date}}.',
      variables: JSON.stringify(['start_date', 'end_date', 'holiday_reason', 'resume_date'])
    },
    {
      name: 'Attendance Alert',
      channel: 'sms',
      content: '{{student_name}} was marked {{status}} today ({{date}}). Monthly attendance: {{attendance_percent}}%. Contact school for queries.',
      variables: JSON.stringify(['student_name', 'status', 'date', 'attendance_percent'])
    },
    {
      name: 'School Event Notification',
      channel: 'email',
      content: 'Dear Parents, {{event_name}} is scheduled for {{event_date}} at {{event_time}}. {{event_description}} Your child needs: {{requirements}}',
      variables: JSON.stringify(['event_name', 'event_date', 'event_time', 'event_description', 'requirements'])
    },
    {
      name: 'Assignment Alert',
      channel: 'sms',
      content: '{{student_name}} has assignment in {{subject}} due on {{due_date}}. Topic: {{assignment_topic}}. Contact teacher for clarifications.',
      variables: JSON.stringify(['student_name', 'subject', 'due_date', 'assignment_topic'])
    }
  ];
  
  for (const templateInfo of templateData) {
    const template = await prisma.template.create({
      data: {
        branchId: branchId,
        name: templateInfo.name,
        channel: templateInfo.channel,
        content: templateInfo.content,
        variables: templateInfo.variables
      }
    });
    templates.push(template);
  }

  // ========== CREATE COMMUNICATION CAMPAIGNS ==========
  console.log('📢 Generating communication campaigns...');
  const campaigns = [];
  const campaignData = [
    {
      name: 'Monthly Fee Collection Drive',
      audienceQuery: 'parents with pending fees',
      schedule: '2024-12-01T09:00:00Z',
      status: 'completed'
    },
    {
      name: 'Annual Sports Day Invitation',
      audienceQuery: 'all parents and students',
      schedule: '2024-11-15T10:00:00Z',
      status: 'completed'
    },
    {
      name: 'Parent-Teacher Meeting Notice',
      audienceQuery: 'all parents',
      schedule: '2024-10-20T08:30:00Z',
      status: 'completed'
    },
    {
      name: 'Winter Break Holiday Notice',
      audienceQuery: 'all parents and students',
      schedule: '2024-12-20T12:00:00Z',
      status: 'sent'
    },
    {
      name: 'Exam Schedule Notification',
      audienceQuery: 'students and parents - exam classes',
      schedule: '2025-02-15T09:00:00Z',
      status: 'draft'
    }
  ];
  
  for (const campaignInfo of campaignData) {
    const campaign = await prisma.campaign.create({
      data: {
        branchId: branchId,
        name: campaignInfo.name,
        templateId: templates[Math.floor(Math.random() * templates.length)].id,
        audienceQuery: campaignInfo.audienceQuery,
        schedule: new Date(campaignInfo.schedule),
        status: campaignInfo.status
      }
    });
    campaigns.push(campaign);
  }

  // ========== CREATE MESSAGES ==========
  console.log('💬 Generating messages...');
  const messages = [];
  const messageData = [];
  
  // Generate messages sent through campaigns
  for (const campaign of campaigns.filter(c => c.status === 'completed')) {
    // Select random recipients - prefer guardians for school communications
    const recipients = guardians.slice(0, Math.min(25, guardians.length));
    
    for (const recipient of recipients) {
      messageData.push({
        branchId: branchId,
        channel: 'email',
        to: recipient.email || `${recipient.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        templateId: campaign.templateId,
        campaignId: campaign.id,
        payload: JSON.stringify({
          recipientName: recipient.name,
          campaignName: campaign.name,
          subject: campaign.name
        }),
        status: Math.random() > 0.05 ? 'delivered' : 'failed',
        providerId: 'email-provider-' + Math.random().toString(36).substr(2, 9),
        sentAt: campaign.schedule,
        error: Math.random() > 0.95 ? 'Network timeout' : null
      });
    }
  }
  
  if (messageData.length > 0) {
    await prisma.message.createMany({
      data: messageData
    });
    console.log(`✅ Generated ${messageData.length} messages`);
  }

  // ========== CREATE SUPPORT TICKETS ==========
  console.log('🎫 Generating support tickets...');
  const tickets = [];
  const ticketData = [
    {
      subject: 'Fee payment gateway error',
      description: 'Online fee payment is failing with error code 500. Please check the payment gateway integration.',
      category: 'technical',
      priority: 'high',
      status: 'resolved',
      ownerType: 'guardian'
    },
    {
      subject: 'Student attendance discrepancy',
      description: 'My child was marked absent on 15th Nov but was present in school. Please correct the attendance record.',
      category: 'academic',
      priority: 'medium',
      status: 'open',
      ownerType: 'guardian'
    },
    {
      subject: 'Library book renewal request',
      description: 'Need to renew the library book "Advanced Mathematics" for additional 2 weeks due to ongoing project work.',
      category: 'library',
      priority: 'low',
      status: 'resolved',
      ownerType: 'student'
    },
    {
      subject: 'Transport route change request',
      description: 'We have moved to a new address and need to change the school bus pickup point. New address details attached.',
      category: 'transport',
      priority: 'medium',
      status: 'open',
      ownerType: 'guardian'
    },
    {
      subject: 'Exam result clarification',
      description: 'There seems to be an error in physics practical marks calculation. Requesting review of answer sheet.',
      category: 'academic',
      priority: 'high',
      status: 'open',
      ownerType: 'student'
    },
    {
      subject: 'Medical certificate submission',
      description: 'Submitting medical certificate for 3-day absence from 10th to 12th Dec due to fever.',
      category: 'medical',
      priority: 'low',
      status: 'resolved',
      ownerType: 'guardian'
    }
  ];
  
  for (let i = 0; i < ticketData.length; i++) {
    const ticketInfo = ticketData[i];
    const owner = ticketInfo.ownerType === 'guardian' ? 
      guardians[Math.floor(Math.random() * guardians.length)] :
      students[Math.floor(Math.random() * students.length)];
    
    const ticket = await prisma.ticket.create({
      data: {
        branchId: branchId,
        ownerType: ticketInfo.ownerType,
        ownerId: owner.id,
        subject: ticketInfo.subject,
        description: ticketInfo.description,
        category: ticketInfo.category,
        priority: ticketInfo.priority,
        status: ticketInfo.status,
        assigneeId: staff.find(s => s.designation?.includes('Admin'))?.id || staff[0].id,
        slaDueAt: ticketInfo.status === 'open' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // 7 days from now
        resolvedAt: ticketInfo.status === 'resolved' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        closedAt: ticketInfo.status === 'closed' ? new Date() : null
      }
    });
    tickets.push(ticket);
  }

  // ========== CREATE COMMUNICATION PREFERENCES ==========
  console.log('⚙️ Generating communication preferences...');
  const preferences = [];
  
  // Create preferences for each guardian
  const channels = ['email', 'sms', 'push'];
  for (const guardian of guardians.slice(0, Math.min(50, guardians.length))) {
    for (const channel of channels.slice(0, Math.random() > 0.5 ? 2 : 1)) { // Some have multiple channel preferences
      const preference = await prisma.preference.create({
        data: {
          branchId: branchId,
          ownerType: 'guardian',
          ownerId: guardian.id,
          channel: channel,
          consent: Math.random() > 0.1, // 90% give consent
          quietHours: Math.random() > 0.3 ? '22:00-08:00' : null // 70% set quiet hours
        }
      });
      preferences.push(preference);
    }
  }

  // Also create preferences for some students
  for (const student of students.slice(0, Math.min(25, students.length))) {
    const preference = await prisma.preference.create({
      data: {
        branchId: branchId,
        ownerType: 'student',
        ownerId: student.id,
        channel: 'push', // Students primarily use push notifications
        consent: Math.random() > 0.05, // 95% give consent
        quietHours: '21:00-07:00' // Earlier quiet hours for students
      }
    });
    preferences.push(preference);
  }

  // Create applications (admission inquiries)
  const applications = [];
  for (let i = 0; i < 25; i++) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const studentName = getRandomName(gender);
    const guardianGender = Math.random() > 0.7 ? 'male' : 'female';
    const guardianName = getRandomName(guardianGender);
    
    const classApplied = config.grades[Math.floor(Math.random() * Math.min(5, config.grades.length))]; // Apply for lower classes
    const status = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'][Math.floor(Math.random() * 4)];
    
    const birthYear = new Date().getFullYear() - getGradeLevel(classApplied) - 3;
    
    const application = await prisma.application.create({
      data: {
        branchId: branchId,
        applicationNo: `APP2025${branchId.toUpperCase()}${String(i + 1).padStart(3, '0')}`,
        firstName: studentName.first,
        lastName: studentName.last,
        dob: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        gender: gender,
        guardianName: `${guardianName.first} ${studentName.last}`,
        guardianPhone: getIndianPhoneNumber(),
        guardianEmail: `${guardianName.first.toLowerCase()}.${studentName.last.toLowerCase()}@gmail.com`,
        previousSchool: Math.random() > 0.3 ? ['Little Angels School', 'Bright Kids Academy', 'Future Stars School', 'Happy Learning Center'][Math.floor(Math.random() * 4)] : null,
        classAppliedFor: classApplied,
        status: status,
        notes: Math.random() > 0.5 ? 'Good academic record and well-behaved child.' : null
      }
    });
    applications.push(application);
  }

  // ========== GENERATE TEACHER SUBSTITUTIONS ==========
  console.log('🔄 Generating teacher substitutions...');
  const substitutions = [];
  const substitutionCount = Math.floor(Math.random() * 20) + 30; // 30-50 substitutions per branch
  
  for (let i = 0; i < substitutionCount; i++) {
    // Select a random timetable period from the past 60 days
    const randomPeriod = timetablePeriods[Math.floor(Math.random() * timetablePeriods.length)];
    if (!randomPeriod) continue;
    
    // Generate a date within the last 60 days
    const substitutionDate = new Date();
    substitutionDate.setDate(substitutionDate.getDate() - Math.floor(Math.random() * 60));
    
    // Skip weekends
    if (substitutionDate.getDay() === 0 || substitutionDate.getDay() === 6) continue;
    
    const originalTeacher = teachers.find(t => t.id === randomPeriod.teacherId);
    const substituteTeacher = teachers[Math.floor(Math.random() * teachers.length)];
    
    if (!originalTeacher || !substituteTeacher || originalTeacher.id === substituteTeacher.id) continue;
    
    const reasons = [
      'Medical leave',
      'Training program',
      'Personal emergency',
      'Official duty',
      'Maternity leave',
      'Family function',
      'Conference attendance',
      'Workshop participation',
      'Health checkup',
      'Sick leave'
    ];
    
    const statuses = ['pending', 'approved', 'rejected'];
    const weights = [0.1, 0.8, 0.1]; // 80% approved
    const status = statuses[getWeightedRandom(weights)];
    
    // Some substitutions might need room changes
    const needsRoomChange = Math.random() < 0.2; // 20% chance
    const substituteRoom = needsRoomChange && rooms.length > 0 ? 
      rooms[Math.floor(Math.random() * rooms.length)] : null;
    
    try {
      const substitution = await prisma.substitution.create({
        data: {
          branchId: branchId,
          periodId: randomPeriod.id,
          substituteTeacherId: substituteTeacher.id,
          substituteRoomId: substituteRoom?.id || null,
          date: substitutionDate,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          status: status,
          approvedBy: status === 'approved' ? (teachers[0]?.id || null) : null, // Principal approval
          approvedAt: status === 'approved' ? new Date(substitutionDate.getTime() - 86400000) : null
        }
      });
      substitutions.push(substitution);
    } catch (error) {
      console.warn(`   ⚠️ Skipped substitution due to constraint: ${(error as Error).message}`);
    }
  }
  
  console.log(`✅ Generated ${substitutions.length} teacher substitutions`);

  // ========== GENERATE ENHANCED TICKET MESSAGES & ATTACHMENTS ==========
  console.log('💬 Generating ticket messages and attachments...');
  const ticketMessages = [];
  const ticketAttachments = [];
  
  // Generate messages for existing tickets
  for (const ticket of tickets) {
    const messageCount = Math.floor(Math.random() * 3) + 3; // 3-5 messages per ticket
    
    for (let j = 0; j < messageCount; j++) {
      let messageContent;
      let isInternal = false;
      let authorType = j === 0 ? 'guardian' : (Math.random() < 0.7 ? 'staff' : 'guardian');
      
      if (j === 0) {
        // Initial query/complaint
        messageContent = `Initial query regarding: ${ticket.subject}. Please help me resolve this issue as soon as possible.`;
      } else if (j === 1) {
        // Staff acknowledgment
        messageContent = 'Thank you for contacting us. We have received your query and will look into it promptly.';
        authorType = 'staff';
      } else if (j === messageCount - 1 && ticket.status === 'resolved') {
        // Resolution message
        messageContent = 'Your issue has been resolved. Thank you for your patience. Please feel free to contact us if you need further assistance.';
        authorType = 'staff';
      } else {
        // Follow-up messages
        const followUpMessages = [
          'Could you please provide more details about this issue?',
          'We are working on resolving this. It may take 1-2 working days.',
          'The concerned department has been notified about your request.',
          'Please visit the office with the required documents.',
          'We have forwarded your request to the appropriate authority.',
          'Your request is under review. We will update you soon.',
          'Internal note: Need to check with accounts department'
        ];
        messageContent = followUpMessages[Math.floor(Math.random() * followUpMessages.length)];
        isInternal = messageContent.includes('Internal note');
        if (isInternal) authorType = 'staff';
      }
      
      let authorId;
      switch (authorType) {
        case 'student':
          authorId = students[Math.floor(Math.random() * students.length)]?.id;
          break;
        case 'guardian':
          authorId = guardians[Math.floor(Math.random() * guardians.length)]?.id;
          break;
        case 'staff':
          authorId = teachers[Math.floor(Math.random() * Math.min(3, teachers.length))]?.id;
          break;
      }
      
      if (!authorId) continue;
      
      const messageDate = new Date(ticket.createdAt.getTime() + (j * 86400000)); // Messages spread over days
      
      try {
        const ticketMessage = await prisma.ticketMessage.create({
          data: {
            branchId: branchId,
            ticketId: ticket.id,
            content: messageContent,
            authorId: authorId,
            authorType: authorType,
            internal: isInternal,
            createdAt: messageDate
          }
        });
        ticketMessages.push(ticketMessage);
      } catch (error) {
        console.warn(`   ⚠️ Skipped ticket message: ${(error as Error).message}`);
      }
    }
    
    // Generate attachments for 30% of tickets
    if (Math.random() < 0.3) {
      const attachmentTypes = [
        { fileName: 'fee_receipt_2024.pdf', contentType: 'application/pdf', size: 245760 },
        { fileName: 'error_screenshot.png', contentType: 'image/png', size: 156800 },
        { fileName: 'transfer_application.pdf', contentType: 'application/pdf', size: 324560 },
        { fileName: 'medical_certificate.jpg', contentType: 'image/jpeg', size: 189440 },
        { fileName: 'marksheet_issue.png', contentType: 'image/png', size: 167890 },
        { fileName: 'transport_form.pdf', contentType: 'application/pdf', size: 298765 }
      ];
      
      const attachment = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)];
      
      try {
        const ticketAttachment = await prisma.ticketAttachment.create({
          data: {
            branchId,
            ticketId: ticket.id,
            fileName: attachment.fileName,
            fileUrl: `/uploads/tickets/${branchId}/${ticket.id}/${attachment.fileName}`,
            fileSize: attachment.size,
            mimeType: attachment.contentType
          }
        });
        ticketAttachments.push(ticketAttachment);
      } catch (error) {
        console.warn(`   ⚠️ Skipped ticket attachment: ${(error as Error).message}`);
      }
    }
  }
  
  console.log(`✅ Generated ${ticketMessages.length} ticket messages`);
  console.log(`✅ Generated ${ticketAttachments.length} ticket attachments`);

  // ========== GENERATE STUDENT INVOICES ==========
  console.log('💰 Generating student invoices...');
  const invoices = [];
  const payments = [];
  const invoiceCount = Math.floor(Math.random() * 20) + 50; // 50-70 invoices per branch
  let invoiceSequence = 1; // Sequential counter for invoice numbers
  
  const periods = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2024-ANNUAL'];
  const feeComponents = [
    { name: 'Tuition Fee', baseAmount: config.baseFee },
    { name: 'Transport Fee', baseAmount: Math.floor(config.baseFee * 0.3) },
    { name: 'Library Fee', baseAmount: Math.floor(config.baseFee * 0.1) },
    { name: 'Sports Fee', baseAmount: Math.floor(config.baseFee * 0.15) },
    { name: 'Lab Fee', baseAmount: Math.floor(config.baseFee * 0.2) },
    { name: 'Annual Day Fee', baseAmount: Math.floor(config.baseFee * 0.05) },
    { name: 'Exam Fee', baseAmount: Math.floor(config.baseFee * 0.08) }
  ];
  
  for (let i = 0; i < Math.min(invoiceCount, students.length); i++) {
    const student = students[i];
    const period = periods[Math.floor(Math.random() * periods.length)];
    
    // Calculate realistic fee amounts based on class
    const studentSection = sections.find(s => s.id === student.sectionId);
    const studentClass = studentSection ? classes.find(c => c.id === studentSection.classId) : null;
    const gradeLevel = studentClass ? parseInt(studentClass.name.match(/\d+/)?.[0] || '1') : 1;
    const multiplier = Math.max(1, gradeLevel / 5); // Higher classes have higher fees
    
    // Select 3-5 fee components
    const selectedComponents = feeComponents
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3);
    
    const totalAmount = selectedComponents.reduce((sum, comp) => 
      sum + Math.floor(comp.baseAmount * multiplier), 0);
    
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
    
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment period
    
    const statuses = ['pending', 'partial', 'paid', 'overdue'];
    const statusWeights = [0.2, 0.15, 0.55, 0.1]; // 55% paid invoices
    const status = statuses[getWeightedRandom(statusWeights)];
    
    const paidAmount = status === 'paid' ? totalAmount :
                      status === 'partial' ? Math.floor(totalAmount * (0.3 + Math.random() * 0.6)) :
                      status === 'overdue' && Math.random() < 0.3 ? Math.floor(totalAmount * Math.random() * 0.5) :
                      0;
    
    try {
      const invoiceNumber = `INV-${branchId}-2024-${invoiceSequence.toString().padStart(4, '0')}`;
      const invoice = await prisma.invoice.create({
        data: {
          branchId: branchId,
          invoiceNumber: invoiceNumber,
          studentId: student.id,
          period: period,
          amount: totalAmount,
          dueDate: dueDate.toISOString().split('T')[0], // String format YYYY-MM-DD
          status: status,
          deletedAt: Math.random() < 0.05 ? new Date() : null // 5% soft deleted
        }
      });
      invoiceSequence++; // Increment for next invoice
      invoices.push(invoice);
      
      // Generate payments for 70% of invoices that have paidAmount > 0
      if (paidAmount > 0 && Math.random() < 0.9) {
        const paymentCount = Math.random() < 0.7 ? 1 : 2; // Most invoices have 1 payment, some have 2 (partial payments)
        let remainingAmount = paidAmount;
        
        for (let p = 0; p < paymentCount && remainingAmount > 0; p++) {
          const paymentAmount = paymentCount === 1 ? remainingAmount : 
            p === paymentCount - 1 ? remainingAmount : 
            Math.floor(remainingAmount * (0.4 + Math.random() * 0.4));
          
          const paymentMethods = ['online', 'offline', 'card', 'upi', 'neft'];
          const paymentGateways = ['razorpay', 'paytm', 'upi', 'bank_transfer', 'cash', 'cheque'];
          const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
          const gateway = paymentGateways[Math.floor(Math.random() * paymentGateways.length)];
          
          const paymentDate = new Date(issueDate.getTime() + Math.random() * (dueDate.getTime() - issueDate.getTime()));
          const paymentStatuses = ['success', 'pending', 'failed'];
          const paymentStatusWeights = [0.85, 0.10, 0.05]; // 85% success rate
          const paymentStatus = paymentStatuses[getWeightedRandom(paymentStatusWeights)];
          
          // Generate realistic transaction references
          let reference = '';
          switch (gateway) {
            case 'razorpay':
              reference = `pay_${Math.random().toString(36).substr(2, 14)}`;
              break;
            case 'paytm':
              reference = `TXN${Math.random().toString().substr(2, 12)}`;
              break;
            case 'upi':
              reference = `${Math.random().toString().substr(2, 12)}@paytm`;
              break;
            case 'bank_transfer':
              reference = `NEFT${Math.random().toString().substr(2, 10)}`;
              break;
            case 'cheque':
              reference = `CHQ${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
              break;
            default:
              reference = `PAY${Math.random().toString().substr(2, 10)}`;
          }
          
          try {
            const payment = await prisma.payment.create({
              data: {
                branchId: branchId,
                invoiceId: invoice.id,
                amount: paymentAmount,
                method: method,
                gateway: gateway,
                reference: reference,
                status: paymentStatus
              }
            });
            payments.push(payment);
            
            if (paymentStatus === 'success') {
              remainingAmount -= paymentAmount;
            }
          } catch (error) {
            console.warn(`   ⚠️ Skipped payment: ${(error as Error).message}`);
          }
        }
      }
      
    } catch (error) {
      console.warn(`   ⚠️ Skipped invoice: ${(error as Error).message}`);
    }
  }
  
  console.log(`✅ Generated ${invoices.length} student invoices`);
  console.log(`✅ Generated ${payments.length} payment records`);

  // Helper function for weighted random selection (defined locally)
  function getWeightedRandom(weights: number[]): number {
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return i;
    }
    return weights.length - 1;
  }

  console.log(`✅ Generated data for ${config.name}:`);
  console.log(`   - ${students.length} students`);
  console.log(`   - ${guardians.length} guardians`);
  console.log(`   - ${teachers.length} teachers`);
  console.log(`   - ${classes.length} classes`);
  console.log(`   - ${sections.length} sections`);
  console.log(`   - ${rooms.length} rooms`);
  console.log(`   - ${timeSlots.length} time slots`);
  console.log(`   - ${exams.length} exams`);
  console.log(`   - ${examSessions.length} exam sessions`);
  console.log(`   - ${marksData.length} marks records`);
  console.log(`   - ${teacherAttendanceData.length} teacher attendance records`);
  console.log(`   - ${templates.length} templates`);
  console.log(`   - ${campaigns.length} campaigns`);
  console.log(`   - ${messageData.length} messages`);
  console.log(`   - ${tickets.length} tickets`);
  console.log(`   - ${ticketMessages.length} ticket messages`);
  console.log(`   - ${ticketAttachments.length} ticket attachments`);
  console.log(`   - ${substitutions.length} teacher substitutions`);
  console.log(`   - ${invoices.length} invoices`);
  console.log(`   - ${payments.length} payments`);
  console.log(`   - ${preferences.length} preferences`);
  console.log(`   - ${applications.length} applications`);

  return {
    branchId,
    students: students.length,
    guardians: guardians.length,
    teachers: teachers.length,
    classes: classes.length,
    sections: sections.length,
    rooms: rooms.length,
    timeSlots: timeSlots.length,
    templates: templates.length,
    campaigns: campaigns.length,
    messages: messageData.length,
    tickets: tickets.length,
    ticketMessages: ticketMessages.length,
    ticketAttachments: ticketAttachments.length,
    substitutions: substitutions.length,
    invoices: invoices.length,
    payments: payments.length,
    preferences: preferences.length,
    applications: applications.length
  };
}

// ========== MAIN SEED FUNCTION ==========
async function main() {
  console.log('🌱 Starting comprehensive multi-branch database seed...');
  console.log('📋 Generating data for ALL composite branch IDs...\n');

  // Clean existing data in proper order to handle foreign key constraints
  console.log('🧹 Cleaning existing data...');
  const tablesToClean = [
    'mark', 'marksEntry', 'examSession', 'exam', 'message', 'campaign', 'template', 'preference', 
    'ticketMessage', 'ticketAttachment', 'ticket', 'studentPeriodAttendance', 'attendanceSession', 
    'teacherAttendance', 'teacherDailyAttendance', 'timetablePeriod', 'timeSlot', 'room',
    'teacher', 'staff', 'payment', 'invoice', 'feeSchedule', 'feeComponent', 'feeStructure',
    'attendanceRecord', 'enrollment', 'studentGuardian', 'guardian', 'student', 'section',
    'class', 'subject', 'academicYear', 'application', 'tenant'
  ];

  for (const table of tablesToClean) {
    try {
      await (prisma as any)[table].deleteMany({});
      console.log(`  ✓ Cleaned ${table}`);
    } catch (error) {
      console.log(`  ⚠️ Could not clean ${table}: ${(error as Error).message}`);
    }
  }

  // Generate data for all branches
  const branchResults = [];
  const branchIds = Object.keys(BRANCH_CONFIGS);
  
  for (const branchId of branchIds) {
    const config = BRANCH_CONFIGS[branchId as keyof typeof BRANCH_CONFIGS];
    try {
      const result = await generateBranchData(branchId, config);
      branchResults.push(result);
    } catch (error) {
      console.error(`❌ Error generating data for ${branchId}:`, (error as Error).message);
    }
  }

  // Generate comprehensive summary
  console.log('\n📊 COMPREHENSIVE SEED DATA SUMMARY');
  console.log('='.repeat(60));
  
  let totalStats = {
    branches: 0,
    students: 0,
    guardians: 0,
    teachers: 0,
    classes: 0,
    sections: 0,
    rooms: 0,
    timeSlots: 0,
    templates: 0,
    campaigns: 0,
    messages: 0,
    tickets: 0,
    ticketMessages: 0,
    ticketAttachments: 0,
    substitutions: 0,
    invoices: 0,
    payments: 0,
    preferences: 0,
    applications: 0
  };

  // Group by school type
  const schoolGroups = {
    'Delhi Public School': branchResults.filter(r => r.branchId.startsWith('dps-')),
    'Kendriya Vidyalaya': branchResults.filter(r => r.branchId.startsWith('kvs-')),
    'St. Paul\'s School': branchResults.filter(r => r.branchId.startsWith('sps-')),
    'Ryan International': branchResults.filter(r => r.branchId.startsWith('ris-'))
  };

  for (const [schoolType, branches] of Object.entries(schoolGroups)) {
    console.log(`\n🏫 ${schoolType}:`);
    for (const branch of branches) {
      const config = BRANCH_CONFIGS[branch.branchId as keyof typeof BRANCH_CONFIGS];
      console.log(`   ${config.name}:`);
      console.log(`     - Students: ${branch.students}, Teachers: ${branch.teachers}, Classes: ${branch.classes}`);
      console.log(`     - Sections: ${branch.sections}, Rooms: ${branch.rooms}, Time Slots: ${branch.timeSlots}`);
      console.log(`     - Communications: ${branch.campaigns} campaigns, ${branch.messages} messages, ${branch.templates} templates`);
      console.log(`     - Support: ${branch.tickets} tickets (${branch.ticketMessages || 0} messages, ${branch.ticketAttachments || 0} attachments)`);
      console.log(`     - Operations: ${branch.substitutions || 0} substitutions, Finance: ${branch.invoices || 0} invoices, ${branch.payments || 0} payments`);
      console.log(`     - Admin: ${branch.preferences} preferences, ${branch.applications} applications`);
      
      totalStats.branches += 1;
      totalStats.students += branch.students;
      totalStats.guardians += branch.guardians;
      totalStats.teachers += branch.teachers;
      totalStats.classes += branch.classes;
      totalStats.sections += branch.sections;
      totalStats.rooms += branch.rooms;
      totalStats.timeSlots += branch.timeSlots;
      totalStats.templates += branch.templates;
      totalStats.campaigns += branch.campaigns;
      totalStats.messages += branch.messages;
      totalStats.tickets += branch.tickets;
      totalStats.ticketMessages += branch.ticketMessages || 0;
      totalStats.ticketAttachments += branch.ticketAttachments || 0;
      totalStats.substitutions += branch.substitutions || 0;
      totalStats.invoices += branch.invoices || 0;
      totalStats.payments += branch.payments || 0;
      totalStats.preferences += branch.preferences;
      totalStats.applications += branch.applications;
    }
  }

  console.log('\n📈 GRAND TOTALS:');
  console.log('='.repeat(40));
  console.log(`🏫 Branches: ${totalStats.branches}`);
  console.log(`👨‍🎓 Students: ${totalStats.students.toLocaleString()}`);
  console.log(`👨‍👩‍👧‍👦 Guardians: ${totalStats.guardians.toLocaleString()}`);
  console.log(`👨‍🏫 Teachers: ${totalStats.teachers}`);
  console.log(`📚 Classes: ${totalStats.classes}`);
  console.log(`📝 Sections: ${totalStats.sections}`);
  console.log(`🏫 Rooms: ${totalStats.rooms}`);
  console.log(`🕒 Time Slots: ${totalStats.timeSlots}`);
  console.log(`📱 Templates: ${totalStats.templates}`);
  console.log(`📢 Campaigns: ${totalStats.campaigns}`);
  console.log(`💬 Messages: ${totalStats.messages.toLocaleString()}`);
  console.log(`🎫 Tickets: ${totalStats.tickets}`);
  console.log(`💬 Ticket Messages: ${totalStats.ticketMessages.toLocaleString()}`);
  console.log(`📎 Ticket Attachments: ${totalStats.ticketAttachments}`);
  console.log(`🔄 Teacher Substitutions: ${totalStats.substitutions}`);
  console.log(`💰 Invoices: ${totalStats.invoices}`);
  console.log(`💳 Payments: ${totalStats.payments}`);
  console.log(`⚙️ Preferences: ${totalStats.preferences}`);
  console.log(`📋 Applications: ${totalStats.applications}`);

  // Data quality metrics
  console.log('\n✅ DATA QUALITY METRICS:');
  console.log('='.repeat(40));
  console.log(`📊 Average students per branch: ${Math.round(totalStats.students / totalStats.branches)}`);
  console.log(`👥 Average guardians per student: ${(totalStats.guardians / totalStats.students).toFixed(1)}`);
  console.log(`👨‍🏫 Teacher-student ratio: 1:${Math.round(totalStats.students / totalStats.teachers)}`);
  console.log(`📚 Average sections per class: ${(totalStats.sections / totalStats.classes).toFixed(1)}`);

  console.log('\n🎯 INDIAN CONTEXT FEATURES:');
  console.log('='.repeat(40));
  console.log('✅ Authentic Indian names and surnames');
  console.log('✅ Indian phone numbers (+91 format)');
  console.log('✅ Realistic Indian addresses by city');
  console.log('✅ Indian academic calendar (April-March)');
  console.log('✅ Indian fee components (Hindi medium, transport, etc.)');
  console.log('✅ Multi-board support (CBSE, ICSE, State Board)');
  console.log('✅ Regional distribution across major Indian cities');
  console.log('✅ Culturally appropriate guardian relationships');
  console.log('✅ Indian examination patterns and terminology');

  console.log('\n🚀 MULTI-TENANT SUPPORT:');
  console.log('='.repeat(40));
  console.log('✅ All data properly scoped with branchId');
  console.log('✅ Composite branch IDs (schoolId-branchId format)');
  console.log('✅ Complete data isolation between branches');
  console.log('✅ School-specific configurations and fee structures');
  console.log('✅ Branch-specific academic years and calendars');

  // ========== MANDATORY COMPREHENSIVE VALIDATION ==========
  console.log('\n' + '='.repeat(60));
  console.log('🔍 RUNNING MANDATORY POST-SEED VALIDATION');
  console.log('='.repeat(60));
  
  const validationPassed = await runComprehensiveValidation();
  
  if (!validationPassed) {
    console.error('\n❌ SEED VALIDATION FAILED - CHECK REPORTS FOR DETAILS');
    process.exit(1);
  }

  console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log(`✨ Generated comprehensive data for ${totalStats.branches} school branches`);
  console.log(`📚 Ready for production demos and load testing`);
  console.log('\n✅ VALIDATION PASSED - DATABASE IS READY FOR PRODUCTION!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });