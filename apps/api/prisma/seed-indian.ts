import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Indian name databases
const indianFirstNamesMale = [
  'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai', 'Arnav',
  'Ayaan', 'Atharva', 'Aryan', 'Kabir', 'Avinash', 'Rohan', 'Rudra', 'Vedant', 'Yash', 'Dhruv',
  'Kartik', 'Gaurav', 'Harsh', 'Mihir', 'Nikhil', 'Parth', 'Rishi', 'Samarth', 'Tanish', 'Utkarsh',
  'Varun', 'Viraj', 'Abhishek', 'Akash', 'Aman', 'Ankit', 'Ashwin', 'Dev', 'Karthik', 'Manish',
  'Neeraj', 'Piyush', 'Rahul', 'Rajat', 'Sanjay', 'Shivam', 'Siddharth', 'Surya', 'Tarun', 'Vishal'
];

const indianFirstNamesFemale = [
  'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari', 'Sara',
  'Aanya', 'Aisha', 'Akshara', 'Anvi', 'Avani', 'Bhavya', 'Charvi', 'Darshana', 'Eesha', 'Gauri',
  'Ira', 'Jiya', 'Kiara', 'Lavanya', 'Mahika', 'Nandini', 'Oviya', 'Palak', 'Rhea', 'Samaira',
  'Tanvi', 'Uma', 'Vanya', 'Yashasvi', 'Zara', 'Aditi', 'Anjali', 'Deepika', 'Divya', 'Gayatri',
  'Kavita', 'Meera', 'Neha', 'Pooja', 'Priya', 'Rashmi', 'Shweta', 'Sneha', 'Srishti', 'Swati'
];

const indianLastNames = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta',
  'Joshi', 'Desai', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Iyengar', 'Choudhury', 'Banerjee', 'Mukherjee',
  'Das', 'Bose', 'Roy', 'Ghosh', 'Chatterjee', 'Khan', 'Ahmed', 'Syed', 'Ali', 'Fernandes',
  'D\'Souza', 'Rodrigues', 'Pereira', 'Naidu', 'Raju', 'Yadav', 'Pandey', 'Mishra', 'Tiwari', 'Dubey',
  'Shukla', 'Agarwal', 'Jain', 'Singhal', 'Goyal', 'Mittal', 'Malhotra', 'Kapoor', 'Chopra', 'Arora'
];

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Surat', 'Agra', 'Nashik',
  'Mysore', 'Coimbatore', 'Kochi', 'Chandigarh', 'Gurgaon', 'Noida', 'Faridabad', 'Bhubaneswar'
];

const indianAreas = [
  'Andheri', 'Bandra', 'Juhu', 'Koramangala', 'Indiranagar', 'Whitefield', 'Banjara Hills',
  'Jubilee Hills', 'Salt Lake', 'Park Street', 'Connaught Place', 'Karol Bagh', 'Saket',
  'Vasant Kunj', 'MG Road', 'Brigade Road', 'Anna Nagar', 'T Nagar', 'Civil Lines', 'Gomti Nagar'
];

const indianStates = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Rajasthan', 'Uttar Pradesh',
  'West Bengal', 'Telangana', 'Andhra Pradesh', 'Kerala', 'Punjab', 'Haryana', 'Bihar',
  'Madhya Pradesh', 'Odisha', 'Assam', 'Jharkhand', 'Uttarakhand', 'Goa'
];

const occupations = [
  'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Officer', 'Bank Manager',
  'Chartered Accountant', 'Lawyer', 'Architect', 'Civil Engineer', 'Professor', 'Scientist',
  'Defense Personnel', 'Police Officer', 'Entrepreneur', 'Consultant', 'Marketing Manager',
  'Sales Executive', 'HR Manager', 'Pharmacist'
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Others'];
const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateIndianPhone(): string {
  const prefix = getRandomElement(['9', '8', '7', '6']);
  const number = faker.number.int({ min: 100000000, max: 999999999 });
  return `+91-${prefix}${number}`;
}

function generateIndianAddress(): string {
  const houseNo = faker.number.int({ min: 1, max: 999 });
  const area = getRandomElement(indianAreas);
  const city = getRandomElement(indianCities);
  const state = getRandomElement(indianStates);
  const pincode = faker.number.int({ min: 100000, max: 999999});
  
  return `${houseNo}, ${area}, ${city}, ${state} - ${pincode}`;
}

function getAgeForClass(className: string): Date {
  const currentYear = new Date().getFullYear();
  let birthYear = currentYear;
  
  switch(className) {
    case 'Nursery': birthYear -= 4; break;
    case 'LKG': birthYear -= 5; break;
    case 'UKG': birthYear -= 6; break;
    case 'Class 1': birthYear -= 7; break;
    case 'Class 2': birthYear -= 8; break;
    case 'Class 3': birthYear -= 9; break;
    case 'Class 4': birthYear -= 10; break;
    case 'Class 5': birthYear -= 11; break;
    case 'Class 6': birthYear -= 12; break;
    case 'Class 7': birthYear -= 13; break;
    case 'Class 8': birthYear -= 14; break;
    case 'Class 9': birthYear -= 15; break;
    case 'Class 10': birthYear -= 16; break;
    case 'Class 11': birthYear -= 17; break;
    case 'Class 12': birthYear -= 18; break;
    default: birthYear -= 10;
  }
  
  // Random month and day
  const month = faker.number.int({ min: 0, max: 11 });
  const day = faker.number.int({ min: 1, max: 28 });
  
  return new Date(birthYear, month, day);
}

// Indian payment methods with realistic distribution
const indianPaymentMethods = [
  { method: 'UPI', gateway: 'PhonePe', weight: 30 },
  { method: 'UPI', gateway: 'GooglePay', weight: 25 },
  { method: 'UPI', gateway: 'Paytm', weight: 15 },
  { method: 'NEFT', gateway: 'Bank Transfer', weight: 10 },
  { method: 'RTGS', gateway: 'Bank Transfer', weight: 5 },
  { method: 'CASH', gateway: 'Cash Counter', weight: 8 },
  { method: 'CHEQUE', gateway: 'Bank Cheque', weight: 4 },
  { method: 'CARD', gateway: 'Razorpay', weight: 3 }
];

// Weighted random selection for payment methods
function getWeightedPaymentMethod() {
  const totalWeight = indianPaymentMethods.reduce((sum, pm) => sum + pm.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const pm of indianPaymentMethods) {
    random -= pm.weight;
    if (random <= 0) {
      return pm;
    }
  }
  return indianPaymentMethods[0]; // fallback
}

// Generate UPI transaction IDs
function generateUPIReference() {
  const upiId = Math.random().toString(36).substring(2, 15);
  return `UPI${upiId.toUpperCase()}`;
}

// Generate bank reference numbers
function generateBankReference() {
  return `NEFT${faker.number.int({ min: 100000000000, max: 999999999999 })}`;
}

// Calculate class-based fee amounts (realistic Indian school fees)
function getClassBasedFees(gradeLevel: number) {
  const baseFees = {
    nursery: { tuition: 3500, transport: 1800, lab: 200, library: 150, sports: 300, annual: 8000 },
    primary: { tuition: 4500, transport: 2000, lab: 400, library: 200, sports: 400, annual: 12000 },
    middle: { tuition: 6000, transport: 2200, lab: 600, library: 250, sports: 500, annual: 15000 },
    secondary: { tuition: 8500, transport: 2500, lab: 800, library: 300, sports: 600, annual: 20000 }
  };

  if (gradeLevel <= 2) return baseFees.nursery;
  if (gradeLevel <= 7) return baseFees.primary;
  if (gradeLevel <= 10) return baseFees.middle;
  return baseFees.secondary;
}

async function main() {
  console.log('🌱 Starting Indian contextual database seed...');

  // Clean existing data safely using Prisma client methods
  console.log('🧹 Cleaning existing data...');
  
  // Use Prisma client methods to safely delete data
  try {
    await prisma.marksEntry.deleteMany({});
    await prisma.examSession.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.feeComponent.deleteMany({});
    await prisma.feeStructure.deleteMany({});
    await prisma.enrollment.deleteMany({});
    await prisma.studentGuardian.deleteMany({});
    await prisma.guardian.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.tenant.deleteMany({});
    await prisma.application.deleteMany({});
    console.log('✅ Successfully cleaned existing data');
  } catch (error) {
    console.log('⚠️ Some tables were already empty or don\'t exist, continuing...');
  }

  // Create multiple tenants/branches for realistic multi-tenant setup
  console.log('🏢 Creating school branches...');
  const branches = [];
  const branchData = [
    { id: 'branch1', name: 'Delhi Public School - Main Branch', subdomain: 'dps-main' },
    { id: 'branch2', name: 'Delhi Public School - East Branch', subdomain: 'dps-east' },
    { id: 'branch3', name: 'Delhi Public School - Bangalore', subdomain: 'dps-blr' }
  ];

  for (const branch of branchData) {
    const tenant = await prisma.tenant.create({ data: branch });
    branches.push(tenant);
  }

  // Focus on main branch for detailed seeding
  const mainBranch = branches[0];

  // Create academic years
  console.log('📅 Creating academic years...');
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2024-2025',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      isActive: true,
      branchId: mainBranch.id
    }
  });

  // Create classes
  console.log('📚 Creating classes...');
  const classData = [
    { name: 'Nursery', gradeLevel: 0, sections: ['A', 'B'] },
    { name: 'LKG', gradeLevel: 1, sections: ['A', 'B'] },
    { name: 'UKG', gradeLevel: 2, sections: ['A', 'B'] },
    { name: 'Class 1', gradeLevel: 3, sections: ['A', 'B', 'C'] },
    { name: 'Class 2', gradeLevel: 4, sections: ['A', 'B', 'C'] },
    { name: 'Class 3', gradeLevel: 5, sections: ['A', 'B', 'C'] },
    { name: 'Class 4', gradeLevel: 6, sections: ['A', 'B', 'C'] },
    { name: 'Class 5', gradeLevel: 7, sections: ['A', 'B', 'C'] },
    { name: 'Class 6', gradeLevel: 8, sections: ['A', 'B', 'C'] },
    { name: 'Class 7', gradeLevel: 9, sections: ['A', 'B', 'C'] },
    { name: 'Class 8', gradeLevel: 10, sections: ['A', 'B', 'C'] },
    { name: 'Class 9', gradeLevel: 11, sections: ['A', 'B'] },
    { name: 'Class 10', gradeLevel: 12, sections: ['A', 'B'] }
  ];

  const classes = [];
  const sections = [];

  for (const cls of classData) {
    const createdClass = await prisma.class.create({
      data: {
        branchId: mainBranch.id,
        name: cls.name,
        gradeLevel: cls.gradeLevel
      }
    });
    classes.push(createdClass);

    // Create sections for each class
    for (const sectionName of cls.sections) {
      const section = await prisma.section.create({
        data: {
          branchId: mainBranch.id,
          name: `${cls.name} - ${sectionName}`,
          classId: createdClass.id,
          capacity: 40
        }
      });
      sections.push(section);
    }
  }

  // Create staff members
  console.log('👨‍💼 Creating staff members...');
  const staffMembers = [];
  
  // Principal
  const principal = await prisma.staff.create({
    data: {
      branchId: mainBranch.id,
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      email: 'principal@dps.edu.in',
      phone: generateIndianPhone(),
      designation: 'Principal',
      department: 'Administration',
      joinDate: '2015-04-01',
      status: 'active'
    }
  });
  staffMembers.push(principal);

  // Vice Principal
  const vicePrincipal = await prisma.staff.create({
    data: {
      branchId: mainBranch.id,
      firstName: 'Mrs. Sunita',
      lastName: 'Verma',
      email: 'vice.principal@dps.edu.in',
      phone: generateIndianPhone(),
      designation: 'Vice Principal',
      department: 'Administration',
      joinDate: '2018-04-01',
      status: 'active'
    }
  });
  staffMembers.push(vicePrincipal);

  // Create more staff
  const designations = [
    { title: 'Academic Coordinator', dept: 'Academic' },
    { title: 'Admin Officer', dept: 'Administration' },
    { title: 'Accountant', dept: 'Finance' },
    { title: 'Librarian', dept: 'Library' },
    { title: 'Sports Coach', dept: 'Sports' },
    { title: 'Lab Assistant', dept: 'Laboratory' },
    { title: 'Nurse', dept: 'Medical' },
    { title: 'Counselor', dept: 'Student Welfare' }
  ];

  for (let i = 0; i < designations.length; i++) {
    const des = designations[i];
    const gender = faker.datatype.boolean() ? 'M' : 'F';
    const firstName = gender === 'M' 
      ? getRandomElement(indianFirstNamesMale)
      : getRandomElement(indianFirstNamesFemale);
    
    const staff = await prisma.staff.create({
      data: {
        branchId: mainBranch.id,
        firstName: firstName,
        lastName: getRandomElement(indianLastNames),
        email: `${firstName.toLowerCase()}@dps.edu.in`,
        phone: generateIndianPhone(),
        designation: des.title,
        department: des.dept,
        joinDate: faker.date.between({ from: '2019-01-01', to: '2024-01-01' }).toISOString().split('T')[0],
        status: 'active'
      }
    });
    staffMembers.push(staff);
  }

  // Create teachers
  console.log('👩‍🏫 Creating teachers...');
  const teachers = [];
  const teacherSubjects = {
    'Primary': ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer Science'],
    'Middle': ['English', 'Hindi', 'Sanskrit', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'],
    'Secondary': ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science']
  };

  // Create subjects first
  console.log('📖 Creating subjects...');
  const subjects = [];
  const allSubjects = Array.from(new Set(Object.values(teacherSubjects).flat()));
  
  for (const subjectName of allSubjects) {
    const subject = await prisma.subject.create({
      data: {
        branchId: mainBranch.id,
        name: subjectName,
        code: subjectName.substring(0, 3).toUpperCase(),
        description: `${subjectName} curriculum`,
        credits: faker.number.int({ min: 2, max: 5 })
      }
    });
    subjects.push(subject);
  }

  // Create 40 teachers
  for (let i = 0; i < 40; i++) {
    const gender = faker.datatype.boolean() ? 'M' : 'F';
    const firstName = gender === 'M'
      ? getRandomElement(indianFirstNamesMale)
      : getRandomElement(indianFirstNamesFemale);
    
    const staff = await prisma.staff.create({
      data: {
        branchId: mainBranch.id,
        firstName: firstName,
        lastName: getRandomElement(indianLastNames),
        email: `${firstName.toLowerCase()}.teacher@dps.edu.in`,
        phone: generateIndianPhone(),
        designation: 'Teacher',
        department: 'Academic',
        joinDate: faker.date.between({ from: '2018-01-01', to: '2024-01-01' }).toISOString().split('T')[0],
        status: 'active'
      }
    });

    const teacher = await prisma.teacher.create({
      data: {
        branchId: mainBranch.id,
        staffId: staff.id,
        subjects: getRandomElement(allSubjects),
        qualifications: 'B.Ed',
        experienceYears: faker.number.int({ min: 1, max: 20 })
      }
    });
    teachers.push(teacher);
  }

  // Create students and guardians
  console.log('👨‍👩‍👧‍👦 Creating students and guardians...');
  const students = [];
  const guardians = [];
  let studentCount = 0;
  let admissionNumber = 2024001;

  // Distribution: More students in lower classes
  const studentDistribution = {
    'Nursery': 15,
    'LKG': 15,
    'UKG': 15,
    'Class 1': 20,
    'Class 2': 20,
    'Class 3': 20,
    'Class 4': 18,
    'Class 5': 18,
    'Class 6': 16,
    'Class 7': 16,
    'Class 8': 15,
    'Class 9': 14,
    'Class 10': 14
  };

  for (const section of sections) {
    const className = section.name.split(' - ')[0];
    const studentsPerSection = Math.floor((studentDistribution[className as keyof typeof studentDistribution] || 15) / 
      classData.find(c => c.name === className)!.sections.length);

    for (let i = 0; i < studentsPerSection; i++) {
      studentCount++;
      const gender = faker.datatype.boolean() ? 'M' : 'F';
      const firstName = gender === 'M'
        ? getRandomElement(indianFirstNamesMale)
        : getRandomElement(indianFirstNamesFemale);
      const lastName = getRandomElement(indianLastNames);
      
      // Create student
      const student = await prisma.student.create({
        data: {
          branchId: mainBranch.id,
          admissionNo: `2024/${String(admissionNumber++).padStart(4, '0')}`,
          rollNumber: String(i + 1).padStart(2, '0'),
          firstName: firstName,
          lastName: lastName,
          dob: getAgeForClass(className).toISOString().split('T')[0],
          gender: gender.toLowerCase(),
          classId: section.classId,
          sectionId: section.id,
          status: 'active'
        }
      });
      students.push(student);

      // Create enrollment
      await prisma.enrollment.create({
        data: {
          branchId: mainBranch.id,
          studentId: student.id,
          sectionId: section.id,
          startDate: academicYear.startDate,
          status: 'active'
        }
      });

      // Create guardians (Father and Mother)
      const familyAddress = generateIndianAddress();
      const familyPhone = generateIndianPhone();

      // Father
      const father = await prisma.guardian.create({
        data: {
          branchId: mainBranch.id,
          name: `${getRandomElement(indianFirstNamesMale)} ${lastName}`,
          email: `${lastName.toLowerCase()}.father@gmail.com`,
          phoneNumber: familyPhone,
          alternatePhoneNumber: generateIndianPhone(),
          address: familyAddress,
          occupation: getRandomElement(occupations)
        }
      });
      guardians.push(father);

      // Mother
      const mother = await prisma.guardian.create({
        data: {
          branchId: mainBranch.id,
          name: `${getRandomElement(indianFirstNamesFemale)} ${lastName}`,
          email: `${lastName.toLowerCase()}.mother@gmail.com`,
          phoneNumber: generateIndianPhone(),
          address: familyAddress,
          occupation: getRandomElement([...occupations, 'Homemaker'])
        }
      });
      guardians.push(mother);

      // Link guardians to student
      await prisma.studentGuardian.create({
        data: {
          studentId: student.id,
          guardianId: father.id,
          relation: 'father',
          isPrimary: true
        }
      });

      await prisma.studentGuardian.create({
        data: {
          studentId: student.id,
          guardianId: mother.id,
          relation: 'mother',
          isPrimary: false
        }
      });
    }
  }

  // Create fee structures
  console.log('💰 Creating fee structures...');
  const feeStructures = [];
  const feeCategories = [
    { name: 'Tuition Fee', type: 'MONTHLY' },
    { name: 'Transport Fee', type: 'MONTHLY' },
    { name: 'Lab Fee', type: 'MONTHLY' },
    { name: 'Library Fee', type: 'MONTHLY' },
    { name: 'Sports Fee', type: 'MONTHLY' },
    { name: 'Annual Charges', type: 'ANNUAL' },
    { name: 'Development Fee', type: 'ANNUAL' }
  ];

  for (const cls of classes) {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        branchId: mainBranch.id,
        gradeId: cls.id
      }
    });
    feeStructures.push(feeStructure);

    // Get class-based fees
    const fees = getClassBasedFees(cls.gradeLevel!);

    // Create fee components
    const feeComponentData = [
      { name: 'Tuition Fee', amount: fees.tuition, type: 'MONTHLY' },
      { name: 'Transport Fee', amount: fees.transport, type: 'MONTHLY' },
      { name: 'Lab Fee', amount: fees.lab, type: 'MONTHLY' },
      { name: 'Library Fee', amount: fees.library, type: 'MONTHLY' },
      { name: 'Sports Fee', amount: fees.sports, type: 'MONTHLY' },
      { name: 'Annual Charges', amount: fees.annual, type: 'ANNUAL' }
    ];

    for (const category of feeComponentData) {
      await prisma.feeComponent.create({
        data: {
          branchId: mainBranch.id,
          feeStructureId: feeStructure.id,
          name: category.name,
          amount: category.amount,
          type: category.type
        }
      });
    }
  }

  // ============================================================================
  // COMPREHENSIVE INVOICES AND PAYMENTS WITH INDIAN PAYMENT SCENARIOS
  // ============================================================================
  
  console.log('🧾 Creating comprehensive invoices and payments...');
  
  // Create invoices for all students
  let invoiceCounter = 1;
  const invoices = [];
  const payments = [];
  
  console.log(`📊 Creating invoices for ${students.length} students across 6 months...`);
  
  for (const student of students) {
    // Get student's class to determine fees
    const studentClass = classes.find(c => c.id === student.classId);
    const fees = getClassBasedFees(studentClass?.gradeLevel || 5);
    
    // Create invoices for 6 months (April to September 2024)
    for (let month = 4; month <= 9; month++) {
      const monthName = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'][month];
      
      // Monthly fees (tuition + transport + lab + library + sports)
      const monthlyAmount = fees.tuition + fees.transport + fees.lab + fees.library + fees.sports;
      
      // Add annual charges in April
      const totalAmount = month === 4 ? monthlyAmount + fees.annual : monthlyAmount;
      
      const invoice = await prisma.invoice.create({
        data: {
          branchId: mainBranch.id,
          studentId: student.id,
          period: `${monthName} 2024`,
          amount: totalAmount,
          dueDate: `2024-${String(month).padStart(2, '0')}-10`,
          status: 'PENDING' // Will be updated based on payment scenarios
        }
      });
      invoices.push({ ...invoice, month, studentId: student.id, gradeLevel: studentClass?.gradeLevel });
      invoiceCounter++;
    }
  }

  console.log(`✅ Created ${invoices.length} invoices`);
  console.log('💳 Creating realistic Indian payment scenarios...');

  // Payment scenarios with Indian context
  const paymentScenarios = {
    fullPayment: 0.65,    // 65% pay full amount on time
    partialPayment: 0.15, // 15% pay partially
    latePayment: 0.12,    // 12% pay late
    advancePayment: 0.03, // 3% pay in advance
    pending: 0.05         // 5% remain pending
  };

  let paidInvoices = 0;
  let partialPaidInvoices = 0;
  let overduePaidInvoices = 0;
  let advancePaidInvoices = 0;
  let pendingInvoices = 0;

  for (const invoice of invoices) {
    const scenario = Math.random();
    
    if (scenario < paymentScenarios.fullPayment) {
      // Full payment scenario
      const paymentMethod = getWeightedPaymentMethod();
      const paymentDate = new Date(invoice.dueDate!);
      paymentDate.setDate(paymentDate.getDate() - faker.number.int({ min: 1, max: 8 })); // Pay 1-8 days early
      
      let reference = '';
      if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else if (paymentMethod.method === 'NEFT' || paymentMethod.method === 'RTGS') {
        reference = generateBankReference();
      } else if (paymentMethod.method === 'CHEQUE') {
        reference = `CHQ${faker.number.int({ min: 100000, max: 999999 })}`;
      } else if (paymentMethod.method === 'CASH') {
        reference = `CASH${faker.number.int({ min: 1000, max: 9999 })}`;
      } else {
        reference = `TXN${Date.now()}${faker.number.int({ min: 1000, max: 9999 })}`;
      }

      const payment = await prisma.payment.create({
        data: {
          branchId: mainBranch.id,
          invoiceId: invoice.id,
          amount: invoice.amount,
          gateway: paymentMethod.gateway,
          method: paymentMethod.method,
          reference: reference,
          status: 'SUCCESS',
          createdAt: paymentDate
        }
      });
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID' }
      });
      
      payments.push(payment);
      paidInvoices++;
      
    } else if (scenario < paymentScenarios.fullPayment + paymentScenarios.partialPayment) {
      // Partial payment scenario - Very common in Indian schools
      const partialAmount = Math.floor(invoice.amount! * (0.5 + Math.random() * 0.4)); // 50-90% of total
      const paymentMethod = getWeightedPaymentMethod();
      const paymentDate = new Date(invoice.dueDate!);
      paymentDate.setDate(paymentDate.getDate() - faker.number.int({ min: 0, max: 5 }));
      
      let reference = '';
      if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else if (paymentMethod.method === 'NEFT') {
        reference = generateBankReference();
      } else if (paymentMethod.method === 'CASH') {
        reference = `CASH${faker.number.int({ min: 1000, max: 9999 })}`;
      } else {
        reference = `TXN${Date.now()}${faker.number.int({ min: 1000, max: 9999 })}`;
      }

      const payment = await prisma.payment.create({
        data: {
          branchId: mainBranch.id,
          invoiceId: invoice.id,
          amount: partialAmount,
          gateway: paymentMethod.gateway,
          method: paymentMethod.method,
          reference: reference,
          status: 'SUCCESS',
          createdAt: paymentDate
        }
      });
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PARTIAL' }
      });
      
      payments.push(payment);
      partialPaidInvoices++;
      
    } else if (scenario < paymentScenarios.fullPayment + paymentScenarios.partialPayment + paymentScenarios.latePayment) {
      // Late payment scenario (overdue but paid) - Common in Indian context
      const paymentMethod = getWeightedPaymentMethod();
      const paymentDate = new Date(invoice.dueDate!);
      paymentDate.setDate(paymentDate.getDate() + faker.number.int({ min: 5, max: 25 })); // 5-25 days late
      
      // Add late fee (₹100-500 based on amount)
      const lateFee = Math.min(500, Math.max(100, Math.floor(invoice.amount! * 0.05)));
      const totalWithLateFee = invoice.amount! + lateFee;
      
      let reference = '';
      if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else if (paymentMethod.method === 'CASH') {
        reference = `CASH${faker.number.int({ min: 1000, max: 9999 })}`;
      } else if (paymentMethod.method === 'NEFT') {
        reference = generateBankReference();
      } else {
        reference = `TXN${Date.now()}${faker.number.int({ min: 1000, max: 9999 })}`;
      }

      const payment = await prisma.payment.create({
        data: {
          branchId: mainBranch.id,
          invoiceId: invoice.id,
          amount: totalWithLateFee,
          gateway: paymentMethod.gateway,
          method: paymentMethod.method,
          reference: reference,
          status: 'SUCCESS',
          createdAt: paymentDate
        }
      });
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE_PAID' }
      });
      
      payments.push(payment);
      overduePaidInvoices++;
      
    } else if (scenario < paymentScenarios.fullPayment + paymentScenarios.partialPayment + paymentScenarios.latePayment + paymentScenarios.advancePayment) {
      // Advance payment scenario - Some parents pay early
      const paymentMethod = getWeightedPaymentMethod();
      const paymentDate = new Date(invoice.dueDate!);
      paymentDate.setDate(paymentDate.getDate() - faker.number.int({ min: 10, max: 20 })); // 10-20 days early
      
      let reference = '';
      if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else if (paymentMethod.method === 'NEFT') {
        reference = generateBankReference();
      } else if (paymentMethod.method === 'RTGS') {
        reference = generateBankReference();
      } else {
        reference = `TXN${Date.now()}${faker.number.int({ min: 1000, max: 9999 })}`;
      }

      const payment = await prisma.payment.create({
        data: {
          branchId: mainBranch.id,
          invoiceId: invoice.id,
          amount: invoice.amount,
          gateway: paymentMethod.gateway,
          method: paymentMethod.method,
          reference: reference,
          status: 'SUCCESS',
          createdAt: paymentDate
        }
      });
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID_EARLY' }
      });
      
      payments.push(payment);
      advancePaidInvoices++;
      
    } else {
      // Pending payment scenario - Realistic for Indian schools
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PENDING' }
      });
      pendingInvoices++;
    }
  }

  // ============================================================================
  // ADVANCED PAYMENT SCENARIOS - Indian Context
  // ============================================================================
  
  console.log('🏦 Creating advanced Indian payment scenarios...');
  
  // Create some failed payment attempts (very common with UPI/Cards)
  const failedPayments = Math.floor(payments.length * 0.05); // 5% failed attempts
  
  for (let i = 0; i < failedPayments; i++) {
    const randomInvoice = getRandomElement(invoices.filter(inv => inv.status === 'PENDING'));
    if (randomInvoice) {
      const paymentMethod = getWeightedPaymentMethod();
      
      const failedPayment = await prisma.payment.create({
        data: {
          branchId: mainBranch.id,
          invoiceId: randomInvoice.id,
          amount: randomInvoice.amount,
          gateway: paymentMethod.gateway,
          method: paymentMethod.method,
          reference: `FAIL${faker.number.int({ min: 100000000, max: 999999999 })}`,
          status: 'FAILED',
          createdAt: new Date(randomInvoice.dueDate!)
        }
      });
      
      await prisma.invoice.update({
        where: { id: randomInvoice.id },
        data: { status: 'PAYMENT_FAILED' }
      });
    }
  }
  
  // Create installment payments (very common in Indian schools)
  console.log('📝 Creating installment payments...');
  
  const installmentInvoices = invoices.filter(inv => inv.amount && inv.amount > 15000); // High-value invoices
  const installmentCount = Math.floor(installmentInvoices.length * 0.20); // 20% go for installments
  
  for (let i = 0; i < installmentCount; i++) {
    const invoice = installmentInvoices[i];
    if (invoice && invoice.status === 'PENDING') {
      
      // Create 2-3 installments
      const numInstallments = faker.number.int({ min: 2, max: 3 });
      const baseAmount = Math.floor(invoice.amount! / numInstallments);
      let remainingAmount = invoice.amount!;
      
      for (let j = 0; j < numInstallments; j++) {
        const isLastInstallment = j === numInstallments - 1;
        const installmentAmount = isLastInstallment ? remainingAmount : baseAmount;
        remainingAmount -= installmentAmount;
        
        const paymentMethod = getWeightedPaymentMethod();
        const paymentDate = new Date(invoice.dueDate!);
        paymentDate.setDate(paymentDate.getDate() + (j * 15)); // 15 days apart
        
        let reference = '';
        if (paymentMethod.method === 'UPI') {
          reference = generateUPIReference();
        } else if (paymentMethod.method === 'CASH') {
          reference = `CASH${faker.number.int({ min: 1000, max: 9999 })}`;
        } else if (paymentMethod.method === 'CHEQUE') {
          reference = `CHQ${faker.number.int({ min: 100000, max: 999999 })}`;
        } else {
          reference = `TXN${Date.now()}${faker.number.int({ min: 1000, max: 9999 })}`;
        }
        
        await prisma.payment.create({
          data: {
            branchId: mainBranch.id,
            invoiceId: invoice.id,
            amount: installmentAmount,
            gateway: paymentMethod.gateway,
            method: paymentMethod.method,
            reference: `${reference}-INST${j+1}`,
            status: 'SUCCESS',
            createdAt: paymentDate
          }
        });
      }
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID_INSTALLMENTS' }
      });
    }
  }
  
  // Create bulk payments (parents paying multiple months together)
  console.log('💰 Creating bulk payments...');
  
  const groupedByStudent = invoices.reduce((acc, inv) => {
    if (!acc[inv.studentId]) acc[inv.studentId] = [];
    acc[inv.studentId].push(inv);
    return acc;
  }, {} as Record<string, typeof invoices>);
  
  const bulkPaymentStudents = Object.keys(groupedByStudent).slice(0, Math.floor(Object.keys(groupedByStudent).length * 0.15)); // 15% do bulk payments
  
  for (const studentId of bulkPaymentStudents) {
    const studentInvoices = groupedByStudent[studentId].filter(inv => inv.status === 'PENDING').slice(0, 3); // Pay up to 3 months
    
    if (studentInvoices.length >= 2) {
      const totalAmount = studentInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const paymentMethod = getWeightedPaymentMethod();
      
      let reference = '';
      if (paymentMethod.method === 'NEFT') {
        reference = generateBankReference();
      } else if (paymentMethod.method === 'RTGS') {
        reference = generateBankReference();
      } else if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else {
        reference = `BULK${faker.number.int({ min: 100000000, max: 999999999 })}`;
      }
      
      // Create one bulk payment for multiple invoices
      const bulkPayment = await prisma.payment.create({
        data: {
          branchId: mainBranch.id,
          invoiceId: studentInvoices[0].id, // Link to first invoice
          amount: totalAmount,
          gateway: paymentMethod.gateway,
          method: paymentMethod.method,
          reference: `${reference}-BULK`,
          status: 'SUCCESS',
          createdAt: new Date()
        }
      });
      
      // Update all invoices as paid
      for (const invoice of studentInvoices) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'PAID_BULK' }
        });
      }
    }
  }

  console.log(`✅ Payment processing completed:`);
  console.log(`   📊 Payment Statistics:`);
  console.log(`      💚 Full Payments: ${paidInvoices}`);
  console.log(`      🟡 Partial Payments: ${partialPaidInvoices}`);
  console.log(`      🔴 Late Payments: ${overduePaidInvoices}`);
  console.log(`      ⚡ Advance Payments: ${advancePaidInvoices}`);
  console.log(`      ⏳ Pending Payments: ${pendingInvoices}`);
  console.log(`      💳 Total Payments Created: ${payments.length + failedPayments}`);
  console.log(`      🧾 Total Invoices: ${invoices.length}`);
  
  // Payment method distribution report
  const methodCounts: Record<string, number> = {};
  for (const payment of payments) {
    const key = `${payment.method} (${payment.gateway})`;
    methodCounts[key] = (methodCounts[key] || 0) + 1;
  }
  console.log(`   💳 Payment Method Distribution:`);
  Object.entries(methodCounts).forEach(([method, count]) => {
    console.log(`      ${method}: ${count}`);
  });

  // ============================================================================
  // COMPREHENSIVE EXAM SYSTEM WITH MARKS GENERATION
  // ============================================================================
  
  console.log('📝 Creating comprehensive exam system...');
  const examTypes = [
    { name: 'Unit Test 1', month: 5, weightage: 10, examTypeCode: 'UNIT_TEST_1' },
    { name: 'Mid Term Examination', month: 7, weightage: 30, examTypeCode: 'MID_TERM' },
    { name: 'Unit Test 2', month: 9, weightage: 10, examTypeCode: 'UNIT_TEST_2' },
    { name: 'Annual Examination', month: 2, weightage: 50, examTypeCode: 'ANNUAL' }
  ];

  const exams = [];
  const examSessions = [];
  
  for (const examType of examTypes) {
    console.log(`Creating ${examType.name}...`);
    
    const exam = await prisma.exam.create({
      data: {
        branchId: mainBranch.id,
        name: examType.name,
        academicYearId: academicYear.id,
        startDate: `2024-${String(examType.month).padStart(2, '0')}-15`,
        endDate: `2024-${String(examType.month).padStart(2, '0')}-25`,
        examType: examType.examTypeCode,
        weightagePercent: examType.weightage,
        maxMarks: 100,
        minPassingMarks: 35
      }
    });
    exams.push(exam);

    // Create exam sessions for each subject and class
    for (const cls of classes.slice(3)) { // From Class 1 onwards (skip nursery classes)
      const relevantSubjects = subjects.filter(subj => {
        // Match subjects to class levels
        if (cls.gradeLevel! <= 7) { // Primary classes
          return ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer Science'].includes(subj.name!);
        } else if (cls.gradeLevel! <= 10) { // Middle classes
          return ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'].includes(subj.name!);
        } else { // Secondary classes
          return ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'].includes(subj.name!);
        }
      });
      
      for (const subject of relevantSubjects) {
        const examSession = await prisma.examSession.create({
          data: {
            branchId: mainBranch.id,
            examId: exam.id,
            subjectId: subject.id,
            schedule: `2024-${String(examType.month).padStart(2, '0')}-${faker.number.int({ min: 15, max: 25 })} 09:00-12:00`
          }
        });
        examSessions.push({ ...examSession, classId: cls.id, gradeLevel: cls.gradeLevel });
      }
    }
  }
  
  console.log(`✅ Created ${exams.length} exams with ${examSessions.length} exam sessions`);
  
  // ============================================================================
  // REALISTIC MARKS GENERATION WITH INDIAN GRADING PATTERNS
  // ============================================================================
  
  console.log('📊 Generating realistic marks with Indian distribution patterns...');
  
  const marksEntries = [];
  let marksCount = 0;
  
  // Grade distribution patterns (realistic for Indian schools)
  const gradeDistribution = {
    excellent: 0.15,  // 90-100 marks (15%)
    good: 0.25,       // 75-89 marks (25%)
    average: 0.35,    // 60-74 marks (35%)
    below_average: 0.20, // 40-59 marks (20%)
    failing: 0.05     // 0-39 marks (5%)
  };
  
  function generateRealisticMarks(maxMarks: number = 100): number {
    const rand = Math.random();
    
    if (rand < gradeDistribution.excellent) {
      return faker.number.int({ min: 90, max: maxMarks });
    } else if (rand < gradeDistribution.excellent + gradeDistribution.good) {
      return faker.number.int({ min: 75, max: 89 });
    } else if (rand < gradeDistribution.excellent + gradeDistribution.good + gradeDistribution.average) {
      return faker.number.int({ min: 60, max: 74 });
    } else if (rand < gradeDistribution.excellent + gradeDistribution.good + gradeDistribution.average + gradeDistribution.below_average) {
      return faker.number.int({ min: 40, max: 59 });
    } else {
      return faker.number.int({ min: 15, max: 39 }); // Failing but not zero (realistic)
    }
  }
  
  // Generate marks for all students in all exam sessions
  for (const student of students) {
    const studentClass = classes.find(c => c.id === student.classId);
    if (!studentClass || studentClass.gradeLevel! < 3) continue; // Skip nursery classes
    
    // Get exam sessions for this student's class
    const studentExamSessions = examSessions.filter(es => es.classId === studentClass.id);
    
    for (const examSession of studentExamSessions) {
      const marks = generateRealisticMarks(100);
      const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : marks >= 60 ? 'B' : marks >= 50 ? 'C+' : marks >= 40 ? 'C' : marks >= 35 ? 'D' : 'F';
      
      const marksEntry = await prisma.marksEntry.create({
        data: {
          branchId: mainBranch.id,
          studentId: student.id,
          examSessionId: examSession.id,
          marksObtained: marks,
          maxMarks: 100,
          grade: grade,
          remarks: marks < 35 ? 'Needs improvement' : marks >= 90 ? 'Excellent performance' : marks >= 75 ? 'Good work' : 'Satisfactory'
        }
      });
      
      marksEntries.push(marksEntry);
      marksCount++;
      
      // Progress logging for large dataset
      if (marksCount % 1000 === 0) {
        console.log(`   📈 Generated ${marksCount} marks entries...`);
      }
    }
  }
  
  console.log(`✅ Generated ${marksCount} marks entries with realistic Indian grade distribution`);
  
  // Marks distribution report
  const marksStats = marksEntries.reduce((acc, entry) => {
    if (entry.marksObtained! >= 90) acc.excellent++;
    else if (entry.marksObtained! >= 75) acc.good++;
    else if (entry.marksObtained! >= 60) acc.average++;
    else if (entry.marksObtained! >= 35) acc.below_average++;
    else acc.failing++;
    return acc;
  }, { excellent: 0, good: 0, average: 0, below_average: 0, failing: 0 });
  
  console.log('   📊 Marks Distribution:');
  console.log(`      🏆 Excellent (90-100): ${marksStats.excellent} (${((marksStats.excellent/marksCount)*100).toFixed(1)}%)`);
  console.log(`      ⭐ Good (75-89): ${marksStats.good} (${((marksStats.good/marksCount)*100).toFixed(1)}%)`);
  console.log(`      ✅ Average (60-74): ${marksStats.average} (${((marksStats.average/marksCount)*100).toFixed(1)}%)`);
  console.log(`      ⚠️  Below Average (35-59): ${marksStats.below_average} (${((marksStats.below_average/marksCount)*100).toFixed(1)}%)`);
  console.log(`      ❌ Failing (<35): ${marksStats.failing} (${((marksStats.failing/marksCount)*100).toFixed(1)}%)`);

  // ============================================================================
  // COMPREHENSIVE ATTENDANCE SYSTEM
  // ============================================================================
  
  console.log('📋 Creating comprehensive attendance records...');
  
  // Define attendance period (last 60 days for realistic data)
  const today = new Date();
  const attendanceStartDate = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  let attendanceCount = 0;
  const attendanceStats = {
    present: 0,
    absent: 0,
    late: 0,
    holiday: 0
  };
  
  // Indian school holidays (realistic for the period)
  const holidays = [
    '2024-08-15', // Independence Day
    '2024-07-17', // Muharram
    '2024-06-17', // Eid
    '2024-05-23', // Buddha Purnima
    '2024-05-01', // Labour Day
  ];
  
  console.log(`Generating attendance for ${students.length} students over 60 days...`);
  
  for (const student of students) {
    let studentAttendanceCount = 0;
    
    for (let d = new Date(attendanceStartDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Skip Sundays and holidays
      if (d.getDay() === 0 || holidays.includes(dateStr)) {
        continue;
      }
      
      // Realistic attendance patterns
      let status = 'present';
      let reason = undefined;
      
      const attendanceRand = Math.random();
      
      // Different attendance patterns based on student age/grade
      const studentClass = classes.find(c => c.id === student.classId);
      const gradeLevel = studentClass?.gradeLevel || 5;
      
      let absenteeRate = 0.08; // Base 8% absence rate
      if (gradeLevel <= 2) absenteeRate = 0.12; // Nursery kids more absent
      else if (gradeLevel >= 11) absenteeRate = 0.06; // Senior students more regular
      
      let lateRate = 0.05; // 5% late rate
      
      if (attendanceRand < absenteeRate) {
        status = 'absent';
        reason = getRandomElement([
          'Sick/Fever',
          'Family function',
          'Medical appointment',
          'Out of station',
          'Weather/Transport issues',
          'Festival celebration'
        ]);
        attendanceStats.absent++;
      } else if (attendanceRand < absenteeRate + lateRate) {
        status = 'late';
        reason = getRandomElement([
          'Traffic jam',
          'Bus delay',
          'Overslept',
          'Medical checkup',
          'Family emergency'
        ]);
        attendanceStats.late++;
      } else {
        status = 'present';
        attendanceStats.present++;
      }
      
      await prisma.attendanceRecord.create({
        data: {
          branchId: mainBranch.id,
          studentId: student.id,
          date: dateStr,
          status: status,
          reason: reason
        }
      });
      
      attendanceCount++;
      studentAttendanceCount++;
    }
    
    // Progress logging
    if (attendanceCount % 5000 === 0) {
      console.log(`   📊 Generated ${attendanceCount} attendance records...`);
    }
  }
  
  console.log(`✅ Generated ${attendanceCount} attendance records`);
  console.log('   📈 Attendance Distribution:');
  console.log(`      ✅ Present: ${attendanceStats.present} (${((attendanceStats.present/attendanceCount)*100).toFixed(1)}%)`);
  console.log(`      ❌ Absent: ${attendanceStats.absent} (${((attendanceStats.absent/attendanceCount)*100).toFixed(1)}%)`);
  console.log(`      ⏰ Late: ${attendanceStats.late} (${((attendanceStats.late/attendanceCount)*100).toFixed(1)}%)`);

  // Create communication templates
  console.log('📧 Creating communication templates...');
  const templates = [
    {
      name: 'Attendance Alert',
      channel: 'sms',
      content: 'Dear Parent, your ward {{studentName}} was marked {{status}} today. - DPS'
    },
    {
      name: 'Fee Reminder',
      channel: 'sms',
      content: 'Dear Parent, fee payment of Rs.{{amount}} for {{studentName}} is due on {{dueDate}}. - DPS'
    },
    {
      name: 'PTM Invitation',
      channel: 'email',
      content: 'Dear Parent, You are invited to the Parent-Teacher Meeting on {{date}} at {{time}}. Please confirm your attendance.'
    },
    {
      name: 'Holiday Notice',
      channel: 'sms',
      content: 'Dear Parent, School will remain closed on {{date}} on account of {{reason}}. - DPS'
    },
    {
      name: 'Exam Schedule',
      channel: 'email',
      content: 'Dear Parent, {{examName}} examinations will be conducted from {{startDate}} to {{endDate}}. Detailed schedule attached.'
    },
    {
      name: 'Payment Success',
      channel: 'sms',
      content: 'Payment of Rs.{{amount}} received successfully for {{studentName}}. Reference: {{reference}}. Thank you! - DPS'
    },
    {
      name: 'Payment Overdue',
      channel: 'email',
      content: 'Dear Parent, Fee payment of Rs.{{amount}} for {{studentName}} is overdue. Please pay immediately to avoid late fees.'
    }
  ];

  for (const template of templates) {
    await prisma.template.create({
      data: {
        branchId: mainBranch.id,
        ...template
      }
    });
  }

  // Create campaigns
  console.log('📢 Creating campaigns...');
  const campaigns = [
    {
      name: 'Fee Payment Reminder - April 2024',
      status: 'completed',
      schedule: new Date('2024-04-05')
    },
    {
      name: 'PTM Announcement - May 2024',
      status: 'completed',
      schedule: new Date('2024-05-01')
    },
    {
      name: 'Summer Vacation Notice',
      status: 'sent',
      schedule: new Date('2024-05-15')
    },
    {
      name: 'Exam Schedule Distribution',
      status: 'scheduled',
      schedule: new Date('2024-08-01')
    }
  ];

  for (const campaign of campaigns) {
    await prisma.campaign.create({
      data: {
        branchId: mainBranch.id,
        name: campaign.name,
        status: campaign.status,
        schedule: campaign.schedule
      }
    });
  }

  // Create support tickets
  console.log('🎫 Creating support tickets...');
  const ticketSubjects = [
    'Fee payment not reflecting in system',
    'Request for transport route change',
    'Query about exam schedule and syllabus',
    'Leave application for family function',
    'Uniform size change request',
    'Bus timing change request',
    'Medical certificate submission',
    'Scholarship application query',
    'Academic performance discussion',
    'Complaint about teacher behavior'
  ];

  for (let i = 0; i < 25; i++) {
    const guardian = getRandomElement(guardians);
    const priority = getRandomElement(['low', 'normal', 'high']);
    const status = getRandomElement(['open', 'in_progress', 'resolved', 'closed']);
    
    await prisma.ticket.create({
      data: {
        branchId: mainBranch.id,
        ownerType: 'guardian',
        ownerId: guardian.id,
        category: getRandomElement(['academic', 'fees', 'technical', 'general']),
        priority: priority,
        status: status,
        subject: getRandomElement(ticketSubjects),
        description: faker.lorem.paragraph(),
        assigneeId: getRandomElement(staffMembers).id,
        createdAt: faker.date.between({ from: '2024-04-01', to: '2024-08-22' }),
        resolvedAt: status === 'resolved' || status === 'closed' ? faker.date.recent({ days: 30 }) : undefined,
        closedAt: status === 'closed' ? faker.date.recent({ days: 15 }) : undefined
      }
    });
  }

  console.log('✅ Indian contextual seed completed successfully!');
  console.log(`📊 Final Summary:
    🏢 Branches: ${branches.length}
    📚 Classes: ${classes.length}
    📝 Sections: ${sections.length}
    👨‍👩‍👧‍👦 Students: ${students.length}
    👨‍👩‍👦‍👦 Guardians: ${guardians.length}
    👨‍💼 Staff: ${staffMembers.length}
    👩‍🏫 Teachers: ${teachers.length}
    📖 Subjects: ${subjects.length}
    💰 Fee Structures: ${feeStructures.length}
    🧾 Invoices: ${invoices.length}
    💳 Payments: ${payments.length + failedPayments}
    📧 Templates: ${templates.length}
    📢 Campaigns: ${campaigns.length}
    🎫 Support Tickets: 25
    
    💡 Indian Payment Methods Distribution:
    • UPI (PhonePe, GPay, Paytm): 70%
    • Bank Transfers (NEFT/RTGS): 15%  
    • Cash: 8%
    • Cheque: 4%
    • Card: 3%
    
    📈 Payment Scenarios:
    • Full/On-time: 65%
    • Partial: 15%
    • Late (with fees): 12%
    • Advance: 3%
    • Failed/Pending: 5%
    
    📝 Academic Data:
    🎯 Exams: ${exams.length}
    📋 Exam Sessions: ${examSessions.length}
    📊 Marks Entries: ${marksCount}
    📅 Attendance Records: ${attendanceCount}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });