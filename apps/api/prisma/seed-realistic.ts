import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Indian names data for more realistic school data
const indianFirstNames = {
  male: ['Aarav', 'Aditya', 'Arjun', 'Ayaan', 'Dev', 'Dhruv', 'Ishaan', 'Kabir', 'Krishna', 'Pranav', 
         'Rohan', 'Rudra', 'Sahil', 'Shaurya', 'Vedant', 'Vihaan', 'Yash', 'Arnav', 'Atharv', 'Daksh',
         'Harsh', 'Karan', 'Kartik', 'Nikhil', 'Parth', 'Raj', 'Rishi', 'Sai', 'Siddharth', 'Tanish'],
  female: ['Aadhya', 'Aanya', 'Aditi', 'Ananya', 'Aria', 'Avni', 'Diya', 'Ishika', 'Kavya', 'Kiara',
           'Myra', 'Navya', 'Pari', 'Prisha', 'Saanvi', 'Sara', 'Shanaya', 'Shreya', 'Tanvi', 'Zara',
           'Aisha', 'Akshara', 'Ira', 'Jhanvi', 'Khushi', 'Mira', 'Nisha', 'Pooja', 'Riya', 'Simran']
};

const indianLastNames = ['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Shah', 
                         'Mehta', 'Rao', 'Joshi', 'Nair', 'Pillai', 'Iyer', 'Agarwal', 'Pandey',
                         'Mishra', 'Khan', 'Chopra', 'Bansal', 'Malhotra', 'Kapoor', 'Thakur',
                         'Chauhan', 'Desai', 'Jain', 'Bhatt', 'Kulkarni', 'Sinha', 'Saxena'];

const subjectSpecializations = {
  'Mathematics': ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
  'Science': ['Physics', 'Chemistry', 'Biology', 'Environmental Science'],
  'English': ['Literature', 'Grammar', 'Creative Writing', 'Communication'],
  'Social Studies': ['History', 'Geography', 'Civics', 'Economics'],
  'Languages': ['Hindi', 'Sanskrit', 'French', 'Spanish'],
  'Arts': ['Drawing', 'Painting', 'Sculpture', 'Digital Art'],
  'Physical Education': ['Athletics', 'Team Sports', 'Yoga', 'Swimming'],
  'Computer Science': ['Programming', 'Web Development', 'Data Science', 'Robotics'],
  'Music': ['Vocal', 'Instrumental', 'Classical', 'Western']
};

const qualifications = [
  'B.Ed, M.A (English)', 'B.Ed, M.Sc (Mathematics)', 'B.Ed, M.Sc (Physics)',
  'B.Ed, M.A (History)', 'B.P.Ed, M.P.Ed', 'B.Ed, M.C.A', 'B.Ed, M.A (Hindi)',
  'B.Ed, M.Sc (Chemistry)', 'B.Ed, M.A (Economics)', 'B.Ed, M.Sc (Biology)',
  'B.Ed, M.A (Political Science)', 'B.Ed, M.Com', 'B.Ed, M.F.A', 'B.Ed, B.Tech'
];

const schoolActivities = [
  'Annual Day Celebration', 'Science Fair', 'Sports Day', 'Math Olympiad',
  'Debate Competition', 'Art Exhibition', 'Music Concert', 'Drama Festival',
  'Quiz Competition', 'Essay Writing Competition', 'Spell Bee', 'Dance Competition'
];

const examTypes = ['Unit Test', 'Mid-Term', 'Final', 'Quarterly', 'Half-Yearly'];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomName(gender: 'MALE' | 'FEMALE'): { firstName: string; lastName: string } {
  const firstNames = gender === 'MALE' ? indianFirstNames.male : indianFirstNames.female;
  return {
    firstName: getRandomItem(firstNames),
    lastName: getRandomItem(indianLastNames)
  };
}

function generatePhoneNumber(): string {
  const prefixes = ['98', '97', '96', '95', '94', '93', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80', '79', '78', '77', '76', '75', '74', '73', '72', '71', '70'];
  return `+91${getRandomItem(prefixes)}${Math.floor(Math.random() * 90000000 + 10000000)}`;
}

function generateAddress(): string {
  const houseNumbers = Array.from({ length: 999 }, (_, i) => i + 1);
  const streets = ['MG Road', 'Gandhi Nagar', 'Nehru Street', 'Park Avenue', 'Lake View', 
                  'Green Park', 'Station Road', 'Temple Street', 'School Lane', 'Market Road'];
  const areas = ['Koramangala', 'Indiranagar', 'Jayanagar', 'Whitefield', 'HSR Layout',
                'BTM Layout', 'Marathahalli', 'Electronic City', 'Hebbal', 'Yelahanka'];
  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];
  
  return `${getRandomItem(houseNumbers)}, ${getRandomItem(streets)}, ${getRandomItem(areas)}, ${getRandomItem(cities)}`;
}

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...');
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.feeSchedule.deleteMany({});
  await prisma.feeComponent.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.marksEntry.deleteMany({});
  await prisma.examSession.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.tenant.deleteMany({});
}

async function main() {
  console.log('🌱 Starting realistic school database seed...');

  await cleanDatabase();

  // Create tenant - Springfield International School
  console.log('🏫 Creating Springfield International School...');
  const tenant = await prisma.tenant.create({
    data: {
      id: 'springfield_intl',
      name: 'Springfield International School',
      subdomain: 'springfield'
    }
  });

  // Create academic year classes
  console.log('📚 Creating classes...');
  const classes = [];
  const classNames = [
    'Nursery', 'LKG', 'UKG', 
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11 Science', 'Grade 11 Commerce', 'Grade 12 Science', 'Grade 12 Commerce'
  ];
  
  for (let i = 0; i < classNames.length; i++) {
    const cls = await prisma.class.create({
      data: {
        name: classNames[i],
        gradeLevel: i < 3 ? 0 : i - 2  // Nursery, LKG, UKG = 0, then 1-12
      }
    });
    classes.push(cls);
  }

  // Create sections with traditional naming (A, B, C, etc.)
  console.log('📝 Creating sections...');
  const sections = [];
  
  for (const cls of classes) {
    const numSections = cls.name.includes('Nursery') || cls.name.includes('LKG') || cls.name.includes('UKG') ? 2 : 
                       cls.name.includes('11') || cls.name.includes('12') ? 3 : 4;
    
    for (let i = 0; i < numSections; i++) {
      const section = await prisma.section.create({
        data: {
          name: String.fromCharCode(65 + i), // A, B, C, D, etc.
          classId: cls.id,
          capacity: cls.name.includes('Nursery') || cls.name.includes('KG') ? 25 : 35
        }
      });
      sections.push(section);
    }
  }

  // Create staff members with realistic names and roles
  console.log('👥 Creating staff members...');
  const staff = [];
  const departments = ['Academic', 'Administration', 'Support', 'Library', 'IT', 'Sports', 'Arts'];
  const designations = [
    'Principal', 'Vice Principal', 'Academic Director', 'Senior Teacher', 'Teacher',
    'Assistant Teacher', 'Lab Assistant', 'Librarian', 'Sports Coach', 'Music Teacher',
    'Art Teacher', 'Administrative Officer', 'Accountant', 'Receptionist', 'Counselor'
  ];
  
  // Create Principal first
  const principal = await prisma.staff.create({
    data: {
      firstName: 'Dr. Rajesh',
      lastName: 'Krishnamurthy',
      email: 'principal@springfield.edu.in',
      phone: generatePhoneNumber(),
      department: 'Administration',
      designation: 'Principal',
      employmentType: 'FULL_TIME',
      joinDate: '2015-04-01',
      status: 'ACTIVE'
    }
  });
  staff.push(principal);

  // Create Vice Principals
  for (let i = 0; i < 2; i++) {
    const gender = i === 0 ? 'MALE' : 'FEMALE';
    const name = getRandomName(gender as any);
    const vp = await prisma.staff.create({
      data: {
        firstName: i === 0 ? 'Mr. Suresh' : 'Mrs. Priya',
        lastName: i === 0 ? 'Menon' : 'Sharma',
        email: `vp${i + 1}@springfield.edu.in`,
        phone: generatePhoneNumber(),
        department: 'Administration',
        designation: 'Vice Principal',
        employmentType: 'FULL_TIME',
        joinDate: faker.date.between({ from: '2016-01-01', to: '2018-12-31' }).toISOString().split('T')[0],
        status: 'ACTIVE'
      }
    });
    staff.push(vp);
  }

  // Create other staff members
  for (let i = 0; i < 80; i++) {
    const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
    const name = getRandomName(gender as any);
    const isTeaching = i < 60; // First 60 are teaching staff
    
    const staffMember = await prisma.staff.create({
      data: {
        firstName: gender === 'MALE' ? `Mr. ${name.firstName}` : `Ms. ${name.firstName}`,
        lastName: name.lastName,
        email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@springfield.edu.in`,
        phone: generatePhoneNumber(),
        department: isTeaching ? 'Academic' : getRandomItem(departments.filter(d => d !== 'Academic')),
        designation: isTeaching ? getRandomItem(['Senior Teacher', 'Teacher', 'Assistant Teacher']) : 
                    getRandomItem(designations.filter(d => !['Principal', 'Vice Principal', 'Teacher', 'Senior Teacher', 'Assistant Teacher'].includes(d))),
        employmentType: Math.random() > 0.9 ? 'PART_TIME' : 'FULL_TIME',
        joinDate: faker.date.between({ from: '2018-01-01', to: '2024-01-01' }).toISOString().split('T')[0],
        status: Math.random() > 0.95 ? 'ON_LEAVE' : 'ACTIVE'
      }
    });
    staff.push(staffMember);
  }

  // Create teachers from teaching staff
  console.log('👩‍🏫 Creating teacher profiles...');
  const teachers = [];
  const teachingStaff = staff.filter(s => 
    ['Teacher', 'Senior Teacher', 'Assistant Teacher', 'Music Teacher', 'Art Teacher', 'Sports Coach'].includes(s.designation)
  );
  
  for (const staffMember of teachingStaff) {
    const subjectKeys = Object.keys(subjectSpecializations);
    const primarySubject = getRandomItem(subjectKeys);
    const specialization = getRandomItem(subjectSpecializations[primarySubject as keyof typeof subjectSpecializations]);
    
    const teacher = await prisma.teacher.create({
      data: {
        staffId: staffMember.id,
        subjects: `${primarySubject} (${specialization})`,
        qualifications: getRandomItem(qualifications),
        experienceYears: Math.floor(Math.random() * 20) + 1
      }
    });
    teachers.push(teacher);
  }

  // Create realistic students with families
  console.log('👨‍👩‍👧‍👦 Creating students and families...');
  const students = [];
  const guardians = [];
  let admissionCounter = 2020001;
  
  for (const section of sections) {
    const studentsPerSection = section.capacity - Math.floor(Math.random() * 5); // Leave some seats empty
    
    for (let i = 0; i < studentsPerSection; i++) {
      const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
      const name = getRandomName(gender as any);
      const birthYear = 2024 - (section.classId.includes('Nursery') ? 3 : 
                               section.classId.includes('LKG') ? 4 :
                               section.classId.includes('UKG') ? 5 :
                               section.classId.includes('Grade') ? 
                               parseInt(section.classId.match(/\d+/)?.[0] || '1') + 5 : 18);
      
      const student = await prisma.student.create({
        data: {
          admissionNo: `SF${admissionCounter++}`,
          firstName: name.firstName,
          lastName: name.lastName,
          dob: faker.date.between({ 
            from: `${birthYear}-01-01`, 
            to: `${birthYear}-12-31` 
          }).toISOString().split('T')[0],
          gender: gender,
          classId: section.classId,
          sectionId: section.id
        }
      });
      students.push(student);

      // Create father
      const studentAddress = generateAddress();
      const father = await prisma.guardian.create({
        data: {
          studentId: student.id,
          name: `Mr. ${getRandomItem(indianFirstNames.male)} ${name.lastName}`,
          relation: 'Father',
          email: `${name.lastName.toLowerCase()}.${admissionCounter}@gmail.com`,
          phone: generatePhoneNumber(),
          address: studentAddress
        }
      });
      guardians.push(father);

      // Create mother (80% chance)
      if (Math.random() > 0.2) {
        const mother = await prisma.guardian.create({
          data: {
            studentId: student.id,
            name: `Mrs. ${getRandomItem(indianFirstNames.female)} ${name.lastName}`,
            relation: 'Mother',
            email: `${name.lastName.toLowerCase()}.m${admissionCounter}@gmail.com`,
            phone: generatePhoneNumber(),
            address: studentAddress
          }
        });
        guardians.push(mother);
      }
    }
  }

  // Create enrollments for current academic year
  console.log('📋 Creating enrollments...');
  for (const student of students) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        sectionId: student.sectionId,
        startDate: '2024-04-01',
        status: 'ACTIVE'
      }
    });
  }

  // Create admission applications for next year
  console.log('📄 Creating admission applications...');
  for (let i = 0; i < 150; i++) {
    const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
    const name = getRandomName(gender as any);
    
    await prisma.application.create({
      data: {
        studentProfileRef: `APP2025${String(i + 1).padStart(4, '0')}`,
        status: getRandomItem(['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED', 'PENDING', 'PENDING']), // More pending
        score: Math.floor(Math.random() * 40) + 60, // 60-100 score
        priorityTag: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.5 ? 'MEDIUM' : 'LOW'
      }
    });
  }

  // Create subjects
  console.log('📖 Creating subjects...');
  const subjectList = [];
  const subjectData = [
    { name: 'Mathematics', code: 'MATH', credits: 5, description: 'Core mathematics curriculum' },
    { name: 'English Language', code: 'ENG', credits: 5, description: 'English language and literature' },
    { name: 'Science', code: 'SCI', credits: 5, description: 'General science for primary classes' },
    { name: 'Physics', code: 'PHY', credits: 4, description: 'Physics for senior classes' },
    { name: 'Chemistry', code: 'CHEM', credits: 4, description: 'Chemistry for senior classes' },
    { name: 'Biology', code: 'BIO', credits: 4, description: 'Biology for senior classes' },
    { name: 'Social Studies', code: 'SST', credits: 4, description: 'History, Geography, and Civics' },
    { name: 'Hindi', code: 'HIN', credits: 3, description: 'Hindi language' },
    { name: 'Computer Science', code: 'CS', credits: 3, description: 'Computer applications and programming' },
    { name: 'Physical Education', code: 'PE', credits: 2, description: 'Sports and physical fitness' },
    { name: 'Art & Craft', code: 'ART', credits: 2, description: 'Visual arts and crafts' },
    { name: 'Music', code: 'MUS', credits: 2, description: 'Vocal and instrumental music' },
    { name: 'Environmental Science', code: 'EVS', credits: 2, description: 'Environmental studies' },
    { name: 'Sanskrit', code: 'SAN', credits: 2, description: 'Sanskrit language (optional)' },
    { name: 'French', code: 'FR', credits: 2, description: 'French language (optional)' }
  ];
  
  for (const subject of subjectData) {
    const sub = await prisma.subject.create({ data: subject });
    subjectList.push(sub);
  }

  // Create realistic attendance records
  console.log('✅ Creating attendance records...');
  const today = new Date();
  const attendanceStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE']; // 80% present
  
  // Create attendance for last 30 working days
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    
    // Skip weekends and holidays
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Sample of students (not all - realistic)
    const attendanceStudents = students.filter(() => Math.random() > 0.1); // 90% students have records
    
    for (const student of attendanceStudents) {
      const status = getRandomItem(attendanceStatuses);
      await prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          date: date.toISOString().split('T')[0],
          status: status as any,
          reason: status === 'ABSENT' ? getRandomItem(['Fever', 'Family emergency', 'Medical appointment', null]) :
                 status === 'LATE' ? getRandomItem(['Traffic', 'Car breakdown', 'Overslept', null]) : null
        }
      });
    }
  }

  // Create exams with realistic scheduling
  console.log('📊 Creating examination schedule...');
  const exams = [];
  const currentYear = 2024;
  
  // Unit Tests - Monthly
  for (const cls of classes.filter(c => !c.name.includes('Nursery') && !c.name.includes('KG'))) {
    for (const month of [7, 9, 11, 1, 3]) { // July, Sept, Nov, Jan, March
      const exam = await prisma.exam.create({
        data: {
          name: `${cls.name} Unit Test - ${month < 4 ? 'Term 2' : 'Term 1'}`,
          startDate: `${month < 4 ? currentYear + 1 : currentYear}-${String(month).padStart(2, '0')}-15`,
          endDate: `${month < 4 ? currentYear + 1 : currentYear}-${String(month).padStart(2, '0')}-20`
        }
      });
      exams.push(exam);
    }
  }

  // Mid-term and Final exams
  for (const cls of classes.filter(c => !c.name.includes('Nursery'))) {
    // Mid-term exam
    const midTerm = await prisma.exam.create({
      data: {
        name: `${cls.name} Mid-Term Examination`,
        startDate: '2024-10-01',
        endDate: '2024-10-10'
      }
    });
    exams.push(midTerm);

    // Final exam
    const finalExam = await prisma.exam.create({
      data: {
        name: `${cls.name} Final Examination`,
        startDate: '2025-03-01',
        endDate: '2025-03-15'
      }
    });
    exams.push(finalExam);
  }

  // Create exam sessions for major exams
  console.log('📝 Creating exam sessions...');
  const majorExams = exams.filter(e => e.name.includes('Mid-Term') || e.name.includes('Final'));
  
  for (const exam of majorExams.slice(0, 10)) {
    const relevantSubjects = exam.name.includes('Grade 1') || exam.name.includes('Grade 2') ? 
                            subjectList.filter(s => ['MATH', 'ENG', 'EVS', 'HIN'].includes(s.code)) :
                            exam.name.includes('11') || exam.name.includes('12') ?
                            subjectList.filter(s => ['MATH', 'ENG', 'PHY', 'CHEM', 'BIO', 'CS'].includes(s.code)) :
                            subjectList.filter(s => ['MATH', 'ENG', 'SCI', 'SST', 'HIN'].includes(s.code));
    
    for (const subject of relevantSubjects) {
      await prisma.examSession.create({
        data: {
          examId: exam.id,
          subjectId: subject.id,
          schedule: getRandomItem(['9:00 AM - 12:00 PM', '9:30 AM - 12:30 PM', '2:00 PM - 5:00 PM'])
        }
      });
    }
  }

  // Create marks entries with realistic distribution
  console.log('✏️ Creating marks entries...');
  const sessions = await prisma.examSession.findMany({ take: 50 });
  
  for (const session of sessions) {
    const examStudents = students.filter(() => Math.random() > 0.05); // 95% students appeared
    
    for (const student of examStudents.slice(0, 30)) {
      // Bell curve distribution for marks
      const baseScore = 65; // Average
      const variation = (Math.random() - 0.5) * 40; // ±20 points
      const rawMarks = Math.max(30, Math.min(100, Math.round(baseScore + variation)));
      
      let grade: string;
      if (rawMarks >= 90) grade = 'A+';
      else if (rawMarks >= 80) grade = 'A';
      else if (rawMarks >= 70) grade = 'B+';
      else if (rawMarks >= 60) grade = 'B';
      else if (rawMarks >= 50) grade = 'C+';
      else if (rawMarks >= 40) grade = 'C';
      else if (rawMarks >= 33) grade = 'D';
      else grade = 'F';
      
      await prisma.marksEntry.create({
        data: {
          studentId: student.id,
          sessionId: session.id,
          rawMarks,
          grade
        }
      });
    }
  }

  // Create fee structures
  console.log('💰 Creating fee structures...');
  for (const cls of classes) {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        gradeId: cls.id
      }
    });
    
    // Create fee schedule separately
    await prisma.feeSchedule.create({
      data: {
        classId: cls.id,
        feeStructureId: feeStructure.id,
        recurrence: 'quarterly',
        dueDayOfMonth: 5,
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        status: 'active'
      }
    });
  }

  // Create invoices with realistic payment patterns
  console.log('📜 Creating fee invoices...');
  const quarters = [
    { period: 'Q1 2024-25', dueDate: '2024-04-05', months: 'Apr-Jun' },
    { period: 'Q2 2024-25', dueDate: '2024-07-05', months: 'Jul-Sep' },
    { period: 'Q3 2024-25', dueDate: '2024-10-05', months: 'Oct-Dec' },
    { period: 'Q4 2024-25', dueDate: '2025-01-05', months: 'Jan-Mar' }
  ];
  
  for (const student of students.slice(0, 200)) { // First 200 students
    for (const quarter of quarters.slice(0, 2)) { // First 2 quarters
      const baseAmount = student.classId.includes('Nursery') || student.classId.includes('KG') ? 11250 :
                        student.classId.includes('Grade 1') || student.classId.includes('Grade 2') || student.classId.includes('Grade 3') ? 13750 :
                        student.classId.includes('Grade 4') || student.classId.includes('Grade 5') ? 15000 :
                        student.classId.includes('Grade 6') || student.classId.includes('Grade 7') || student.classId.includes('Grade 8') ? 17500 :
                        student.classId.includes('Grade 9') || student.classId.includes('Grade 10') ? 20000 : 23750;
      
      const invoice = await prisma.invoice.create({
        data: {
          studentId: student.id,
          period: quarter.period,
          amount: baseAmount,
          dueDate: quarter.dueDate,
          status: Math.random() > 0.15 ? 'PAID' : Math.random() > 0.5 ? 'PENDING' : 'OVERDUE'
        }
      });

      // Create payment for paid invoices
      if (invoice.status === 'PAID') {
        const paymentDate = faker.date.between({ 
          from: quarter.dueDate, 
          to: new Date(new Date(quarter.dueDate).getTime() + 30 * 24 * 60 * 60 * 1000) 
        });
        
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: invoice.amount || baseAmount,
            gateway: getRandomItem(['RAZORPAY', 'PAYTM', 'STRIPE']),
            method: getRandomItem(['CARD', 'UPI', 'NET_BANKING', 'WALLET']),
            reference: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            status: 'COMPLETED'
          }
        });
      }
    }
  }

  // Display summary
  console.log('\n✅ Realistic school data seed completed successfully!');
  console.log('\n🏫 Springfield International School - Database Summary:');
  console.log(`  📚 Classes: ${classes.length}`);
  console.log(`  📝 Sections: ${sections.length}`);
  console.log(`  👥 Staff Members: ${staff.length}`);
  console.log(`  👩‍🏫 Teachers: ${teachers.length}`);
  console.log(`  🎓 Students: ${students.length}`);
  console.log(`  👨‍👩‍👧 Guardians: ${guardians.length}`);
  console.log(`  📋 Enrollments: ${await prisma.enrollment.count()}`);
  console.log(`  📄 Applications: ${await prisma.application.count()}`);
  console.log(`  ✅ Attendance Records: ${await prisma.attendanceRecord.count()}`);
  console.log(`  📖 Subjects: ${subjectList.length}`);
  console.log(`  📊 Examinations: ${exams.length}`);
  console.log(`  📝 Exam Sessions: ${await prisma.examSession.count()}`);
  console.log(`  ✏️ Marks Entries: ${await prisma.marksEntry.count()}`);
  console.log(`  💰 Fee Structures: ${await prisma.feeStructure.count()}`);
  console.log(`  📅 Fee Schedules: ${await prisma.feeSchedule.count()}`);
  console.log(`  📜 Invoices: ${await prisma.invoice.count()}`);
  console.log(`  💳 Payments: ${await prisma.payment.count()}`);
  
  console.log('\n📊 Sample Data:');
  const sampleStudent = students[0];
  console.log(`  Student: ${sampleStudent.firstName} ${sampleStudent.lastName} (${sampleStudent.admissionNo})`);
  const sampleTeacher = await prisma.staff.findFirst({ where: { id: teachers[0].staffId } });
  console.log(`  Teacher: ${sampleTeacher?.firstName} ${sampleTeacher?.lastName} - ${teachers[0].subjects}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });