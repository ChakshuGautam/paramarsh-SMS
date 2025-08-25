import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Indian context data
const indianFirstNamesMale = [
  'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai', 'Arnav',
  'Ayaan', 'Atharva', 'Aryan', 'Kabir', 'Avinash', 'Rohan', 'Rudra', 'Vedant', 'Yash', 'Dhruv',
  'Kartik', 'Gaurav', 'Harsh', 'Mihir', 'Nikhil', 'Parth', 'Rishi', 'Samarth', 'Tanish', 'Utkarsh'
];

const indianFirstNamesFemale = [
  'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari', 'Sara',
  'Aanya', 'Aisha', 'Akshara', 'Anvi', 'Avani', 'Bhavya', 'Charvi', 'Darshana', 'Eesha', 'Gauri'
];

const indianLastNames = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta',
  'Joshi', 'Desai', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Khan', 'Ahmed', 'Syed', 'Ali'
];

const occupations = [
  'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Officer', 'Bank Manager',
  'Chartered Accountant', 'Lawyer', 'Architect', 'Civil Engineer', 'Professor', 'Consultant'
];

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateIndianPhone(): string {
  const prefix = getRandomElement(['9', '8', '7', '6']);
  const number = Math.floor(100000000 + Math.random() * 900000000);
  return `+91-${prefix}${number}`;
}

function generateIndianAddress(): string {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];
  const areas = ['Andheri', 'Bandra', 'Koramangala', 'Indiranagar', 'Banjara Hills', 'MG Road'];
  const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Telangana', 'West Bengal'];
  
  const houseNo = Math.floor(1 + Math.random() * 999);
  const area = getRandomElement(areas);
  const city = getRandomElement(cities);
  const state = getRandomElement(states);
  const pincode = Math.floor(100000 + Math.random() * 900000);
  
  return `${houseNo}, ${area}, ${city}, ${state} - ${pincode}`;
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

function getWeightedPaymentMethod() {
  const totalWeight = indianPaymentMethods.reduce((sum, pm) => sum + pm.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const pm of indianPaymentMethods) {
    random -= pm.weight;
    if (random <= 0) {
      return pm;
    }
  }
  return indianPaymentMethods[0];
}

function generateUPIReference(): string {
  const upiId = Math.random().toString(36).substring(2, 15);
  return `UPI${upiId.toUpperCase()}`;
}

function generateBankReference(): string {
  return `NEFT${Math.floor(100000000000 + Math.random() * 900000000000)}`;
}

async function main() {
  console.log('🌱 Starting comprehensive invoice and payment seed generation...');

  // Create tenant
  console.log('🏢 Creating school branch...');
  const tenant = await prisma.tenant.create({
    data: {
      id: 'branch1',
      name: 'Delhi Public School - Main Branch',
      subdomain: 'dps-main'
    }
  });

  // Create classes
  console.log('📚 Creating classes...');
  const classData = [
    { name: 'Class 1', gradeLevel: 1 },
    { name: 'Class 2', gradeLevel: 2 },
    { name: 'Class 3', gradeLevel: 3 },
    { name: 'Class 4', gradeLevel: 4 },
    { name: 'Class 5', gradeLevel: 5 },
    { name: 'Class 6', gradeLevel: 6 },
    { name: 'Class 7', gradeLevel: 7 },
    { name: 'Class 8', gradeLevel: 8 },
    { name: 'Class 9', gradeLevel: 9 },
    { name: 'Class 10', gradeLevel: 10 }
  ];

  const classes = [];
  const sections = [];

  for (const cls of classData) {
    const createdClass = await prisma.class.create({
      data: {
        branchId: 'branch1',
        name: cls.name,
        gradeLevel: cls.gradeLevel
      }
    });
    classes.push(createdClass);

    // Create 2 sections per class
    for (const sectionName of ['A', 'B']) {
      const section = await prisma.section.create({
        data: {
          branchId: 'branch1',
          name: `${cls.name} - ${sectionName}`,
          classId: createdClass.id,
          capacity: 40
        }
      });
      sections.push(section);
    }
  }

  // Create fee structures for each class
  console.log('💰 Creating fee structures...');
  const feeStructures = [];
  
  // Indian school fee components with realistic amounts
  const getClassBasedFees = (gradeLevel: number) => {
    const baseFees = {
      primary: { tuition: 4500, transport: 2000, lab: 400, library: 200, sports: 400, annual: 12000 },
      middle: { tuition: 6000, transport: 2200, lab: 600, library: 250, sports: 500, annual: 15000 },
      secondary: { tuition: 8500, transport: 2500, lab: 800, library: 300, sports: 600, annual: 20000 }
    };

    if (gradeLevel <= 5) return baseFees.primary;
    if (gradeLevel <= 8) return baseFees.middle;
    return baseFees.secondary;
  };

  for (const cls of classes) {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        branchId: 'branch1',
        gradeId: cls.id
      }
    });
    feeStructures.push({ ...feeStructure, class: cls });

    const fees = getClassBasedFees(cls.gradeLevel!);

    const feeComponentData = [
      { name: 'Tuition Fee', amount: fees.tuition, type: 'MONTHLY' },
      { name: 'Transport Fee', amount: fees.transport, type: 'MONTHLY' },
      { name: 'Lab Fee', amount: fees.lab, type: 'MONTHLY' },
      { name: 'Library Fee', amount: fees.library, type: 'MONTHLY' },
      { name: 'Sports Fee', amount: fees.sports, type: 'MONTHLY' },
      { name: 'Annual Charges', amount: fees.annual, type: 'ANNUAL' }
    ];

    for (const component of feeComponentData) {
      await prisma.feeComponent.create({
        data: {
          branchId: 'branch1',
          feeStructureId: feeStructure.id,
          name: component.name,
          amount: component.amount,
          type: component.type
        }
      });
    }
  }

  // Create students and guardians
  console.log('👨‍👩‍👧‍👦 Creating students and guardians...');
  const students = [];
  const guardians = [];
  let admissionNumber = 2024001;

  // Create 25 students per section (500 total)
  for (const section of sections) {
    const className = section.name.split(' - ')[0];
    const gradeLevel = classes.find(c => c.name === className)?.gradeLevel || 5;
    
    for (let i = 0; i < 25; i++) {
      const gender = Math.random() > 0.5 ? 'M' : 'F';
      const firstName = gender === 'M' 
        ? getRandomElement(indianFirstNamesMale)
        : getRandomElement(indianFirstNamesFemale);
      const lastName = getRandomElement(indianLastNames);
      
      // Calculate birth year based on grade level
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - (gradeLevel + 5); // Approximate age
      const dob = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
      
      const student = await prisma.student.create({
        data: {
          branchId: 'branch1',
          admissionNo: `2024/${String(admissionNumber++).padStart(4, '0')}`,
          rollNumber: String(i + 1).padStart(2, '0'),
          firstName: firstName,
          lastName: lastName,
          dob: dob,
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
          branchId: 'branch1',
          studentId: student.id,
          sectionId: section.id,
          startDate: '2024-04-01',
          status: 'active'
        }
      });

      // Create guardians (Father and Mother)
      const familyAddress = generateIndianAddress();
      
      const father = await prisma.guardian.create({
        data: {
          branchId: 'branch1',
          name: `${getRandomElement(indianFirstNamesMale)} ${lastName}`,
          email: `${lastName.toLowerCase()}.father@gmail.com`,
          phoneNumber: generateIndianPhone(),
          alternatePhoneNumber: generateIndianPhone(),
          address: familyAddress,
          occupation: getRandomElement(occupations)
        }
      });
      guardians.push(father);

      const mother = await prisma.guardian.create({
        data: {
          branchId: 'branch1',
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

  console.log(`✅ Created ${students.length} students and ${guardians.length} guardians`);

  // ============================================================================
  // CREATE COMPREHENSIVE INVOICES AND PAYMENTS
  // ============================================================================

  console.log('🧾 Creating comprehensive invoices with Indian fee structures...');
  
  const invoices = [];
  const payments = [];
  let invoiceSequence = 1; // Sequential counter for invoice numbers
  
  // Create invoices for all students for 6 months (April to September 2024)
  for (const student of students) {
    const studentClass = classes.find(c => c.id === student.classId);
    const fees = getClassBasedFees(studentClass?.gradeLevel || 5);
    
    // Create invoices for 6 months
    for (let month = 4; month <= 9; month++) {
      const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'];
      const monthName = monthNames[month];
      
      // Monthly fees (tuition + transport + lab + library + sports)
      const monthlyAmount = fees.tuition + fees.transport + fees.lab + fees.library + fees.sports;
      
      // Add annual charges in April
      const totalAmount = month === 4 ? monthlyAmount + fees.annual : monthlyAmount;
      
      const invoiceNumber = `INV-branch1-2024-${invoiceSequence.toString().padStart(4, '0')}`;
      const invoice = await prisma.invoice.create({
        data: {
          branchId: 'branch1',
          invoiceNumber: invoiceNumber,
          studentId: student.id,
          period: `${monthName} 2024`,
          amount: totalAmount,
          dueDate: `2024-${String(month).padStart(2, '0')}-10`,
          status: 'PENDING' // Will be updated based on payment
        }
      });
      invoiceSequence++; // Increment for next invoice
      invoices.push({ ...invoice, month, studentId: student.id, gradeLevel: studentClass?.gradeLevel });
    }
  }

  console.log(`✅ Created ${invoices.length} invoices`);

  // ============================================================================
  // CREATE REALISTIC INDIAN PAYMENT SCENARIOS
  // ============================================================================
  
  console.log('💳 Creating realistic Indian payment scenarios...');
  
  // Payment scenarios with realistic Indian distribution
  const paymentScenarios = {
    fullPayment: 0.60,    // 60% pay full amount
    partialPayment: 0.20, // 20% pay partially
    latePayment: 0.10,    // 10% pay late
    advancePayment: 0.05, // 5% pay in advance
    pending: 0.05         // 5% remain pending
  };

  let paymentStats = {
    full: 0,
    partial: 0,
    late: 0,
    advance: 0,
    pending: 0,
    failed: 0
  };

  for (const invoice of invoices) {
    const scenario = Math.random();
    
    if (scenario < paymentScenarios.fullPayment) {
      // Full payment scenario
      const paymentMethod = getWeightedPaymentMethod();
      const paymentDate = new Date(invoice.dueDate!);
      paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 8 + 1)); // Pay 1-8 days early
      
      let reference = '';
      if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else if (paymentMethod.method === 'NEFT' || paymentMethod.method === 'RTGS') {
        reference = generateBankReference();
      } else if (paymentMethod.method === 'CHEQUE') {
        reference = `CHQ${Math.floor(100000 + Math.random() * 900000)}`;
      } else if (paymentMethod.method === 'CASH') {
        reference = `CASH${Math.floor(1000 + Math.random() * 9000)}`;
      } else {
        reference = `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const payment = await prisma.payment.create({
        data: {
          branchId: 'branch1',
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
      paymentStats.full++;
      
    } else if (scenario < paymentScenarios.fullPayment + paymentScenarios.partialPayment) {
      // Partial payment scenario
      const partialAmount = Math.floor(invoice.amount! * (0.5 + Math.random() * 0.4)); // 50-90% of total
      const paymentMethod = getWeightedPaymentMethod();
      
      let reference = '';
      if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else if (paymentMethod.method === 'CASH') {
        reference = `CASH${Math.floor(1000 + Math.random() * 9000)}`;
      } else {
        reference = `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const payment = await prisma.payment.create({
        data: {
          branchId: 'branch1',
          invoiceId: invoice.id,
          amount: partialAmount,
          gateway: paymentMethod.gateway,
          method: paymentMethod.method,
          reference: reference,
          status: 'SUCCESS',
          createdAt: new Date(invoice.dueDate!)
        }
      });
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PARTIAL' }
      });
      
      payments.push(payment);
      paymentStats.partial++;
      
    } else if (scenario < paymentScenarios.fullPayment + paymentScenarios.partialPayment + paymentScenarios.latePayment) {
      // Late payment scenario (with late fee)
      const paymentMethod = getWeightedPaymentMethod();
      const paymentDate = new Date(invoice.dueDate!);
      paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 20 + 5)); // 5-25 days late
      
      // Add late fee (₹100-500 based on amount)
      const lateFee = Math.min(500, Math.max(100, Math.floor(invoice.amount! * 0.05)));
      const totalWithLateFee = invoice.amount! + lateFee;
      
      let reference = '';
      if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else if (paymentMethod.method === 'CASH') {
        reference = `CASH${Math.floor(1000 + Math.random() * 9000)}`;
      } else {
        reference = `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const payment = await prisma.payment.create({
        data: {
          branchId: 'branch1',
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
      paymentStats.late++;
      
    } else if (scenario < paymentScenarios.fullPayment + paymentScenarios.partialPayment + paymentScenarios.latePayment + paymentScenarios.advancePayment) {
      // Advance payment scenario
      const paymentMethod = getWeightedPaymentMethod();
      const paymentDate = new Date(invoice.dueDate!);
      paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 15 + 10)); // 10-25 days early
      
      let reference = '';
      if (paymentMethod.method === 'UPI') {
        reference = generateUPIReference();
      } else if (paymentMethod.method === 'NEFT') {
        reference = generateBankReference();
      } else {
        reference = `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const payment = await prisma.payment.create({
        data: {
          branchId: 'branch1',
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
      paymentStats.advance++;
      
    } else {
      // Pending payment scenario
      paymentStats.pending++;
    }
  }

  // Create some failed payment attempts (common with UPI)
  console.log('💔 Creating failed payment attempts...');
  const failedPayments = Math.floor(payments.length * 0.03); // 3% failed attempts
  
  for (let i = 0; i < failedPayments; i++) {
    const randomInvoice = invoices[Math.floor(Math.random() * invoices.length)];
    const paymentMethod = getWeightedPaymentMethod();
    
    await prisma.payment.create({
      data: {
        branchId: 'branch1',
        invoiceId: randomInvoice.id,
        amount: randomInvoice.amount,
        gateway: paymentMethod.gateway,
        method: paymentMethod.method,
        reference: `FAIL${Math.floor(100000000 + Math.random() * 900000000)}`,
        status: 'FAILED',
        createdAt: new Date(randomInvoice.dueDate!)
      }
    });
    paymentStats.failed++;
  }

  console.log('✅ Invoice and payment generation completed!');
  console.log('📊 Summary:');
  console.log(`   🏫 Students: ${students.length}`);
  console.log(`   👨‍👩‍👦‍👦 Guardians: ${guardians.length}`);
  console.log(`   📚 Classes: ${classes.length}`);
  console.log(`   🏛️ Sections: ${sections.length}`);
  console.log(`   💰 Fee Structures: ${feeStructures.length}`);
  console.log(`   🧾 Invoices: ${invoices.length}`);
  console.log(`   💳 Payments: ${payments.length + failedPayments}`);
  
  console.log('📈 Payment Statistics:');
  console.log(`   ✅ Full Payments: ${paymentStats.full}`);
  console.log(`   🟡 Partial Payments: ${paymentStats.partial}`);
  console.log(`   🔴 Late Payments: ${paymentStats.late}`);
  console.log(`   ⚡ Advance Payments: ${paymentStats.advance}`);
  console.log(`   ⏳ Pending: ${paymentStats.pending}`);
  console.log(`   💔 Failed: ${paymentStats.failed}`);

  // Payment method distribution
  const methodCounts: Record<string, number> = {};
  for (const payment of payments) {
    const key = `${payment.method} (${payment.gateway})`;
    methodCounts[key] = (methodCounts[key] || 0) + 1;
  }
  
  console.log('💳 Payment Method Distribution:');
  Object.entries(methodCounts).forEach(([method, count]) => {
    const percentage = ((count / payments.length) * 100).toFixed(1);
    console.log(`   ${method}: ${count} (${percentage}%)`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });