import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== INDIAN NAMES DATABASE ==========
const INDIAN_NAMES = {
  male: {
    first: [
      'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai', 'Arnav',
      'Ayaan', 'Atharva', 'Aryan', 'Kabir', 'Avinash', 'Rohan', 'Rudra', 'Vedant', 'Yash', 'Dhruv',
      'Kartik', 'Gaurav', 'Harsh', 'Mihir', 'Nikhil', 'Parth', 'Rishi', 'Samarth', 'Tanish', 'Utkarsh',
      'Varun', 'Viraj', 'Abhishek', 'Akash', 'Aman', 'Ankit', 'Ashwin', 'Dev', 'Karthik', 'Manish'
    ],
    last: [
      'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta',
      'Joshi', 'Desai', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Iyengar', 'Choudhury', 'Banerjee', 'Mukherjee'
    ]
  },
  female: {
    first: [
      'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari', 'Sara',
      'Aanya', 'Aisha', 'Akshara', 'Anvi', 'Avani', 'Bhavya', 'Charvi', 'Darshana', 'Eesha', 'Gauri',
      'Ira', 'Jiya', 'Kiara', 'Lavanya', 'Mahika', 'Nandini', 'Oviya', 'Palak', 'Rhea', 'Samaira'
    ],
    last: [
      'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta'
    ]
  }
};

// ========== UTILITY FUNCTIONS ==========
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomIndianName(gender: 'male' | 'female') {
  const firstName = getRandomElement(INDIAN_NAMES[gender].first);
  const lastName = getRandomElement(INDIAN_NAMES[gender].last);
  return { firstName, lastName };
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateIndianPhoneNumber(): string {
  const prefixes = ['9', '8', '7', '6'];
  const prefix = getRandomElement(prefixes);
  const number = prefix + Math.floor(100000000 + Math.random() * 900000000);
  return `+91-${number}`;
}

// ========== SEED DATA GENERATORS ==========

async function seedSubstitutions() {
  console.log('🔄 Seeding Substitutions...');
  
  // Get existing data for foreign key relationships
  const timetablePeriods = await prisma.timetablePeriod.findMany({
    select: { id: true, branchId: true, teacherId: true, subjectId: true }
  });
  
  const teachers = await prisma.teacher.findMany({
    include: { 
      staff: { 
        select: { firstName: true, lastName: true } 
      } 
    }
  });
  
  const rooms = await prisma.room.findMany({
    select: { id: true, branchId: true }
  });
  
  const staff = await prisma.staff.findMany({
    select: { id: true, branchId: true, firstName: true, lastName: true }
  });
  
  console.log(`📊 Reference data: ${timetablePeriods.length} periods, ${teachers.length} teachers, ${rooms.length} rooms`);
  
  // Group data by branch for proper isolation
  const branchData: Record<string, { 
    periods: any[], 
    teachers: any[], 
    rooms: any[], 
    staff: any[] 
  }> = {};
  
  // Initialize branch data
  timetablePeriods.forEach(period => {
    if (!branchData[period.branchId]) {
      branchData[period.branchId] = { periods: [], teachers: [], rooms: [], staff: [] };
    }
    branchData[period.branchId].periods.push(period);
  });
  
  teachers.forEach(teacher => {
    if (branchData[teacher.branchId]) {
      branchData[teacher.branchId].teachers.push(teacher);
    }
  });
  
  rooms.forEach(room => {
    if (branchData[room.branchId]) {
      branchData[room.branchId].rooms.push(room);
    }
  });
  
  staff.forEach(staffMember => {
    if (branchData[staffMember.branchId]) {
      branchData[staffMember.branchId].staff.push(staffMember);
    }
  });
  
  const substitutionReasons = [
    'Medical leave',
    'Training workshop',
    'Personal emergency',
    'Official duty',
    'Maternity leave',
    'Sick leave',
    'Conference attendance',
    'Family function',
    'Government work',
    'Health checkup'
  ];
  
  const statuses = ['pending', 'approved', 'rejected'];
  
  let totalSubstitutions = 0;
  const academicYearStart = new Date('2024-04-01');
  const academicYearEnd = new Date('2025-03-31');
  
  // Generate substitutions for each branch
  for (const [branchId, data] of Object.entries(branchData)) {
    if (data.periods.length === 0 || data.teachers.length === 0) {
      console.log(`⚠️ Skipping ${branchId} - insufficient data`);
      continue;
    }
    
    // Generate 30-50 substitutions per branch
    const substitutionCount = 30 + Math.floor(Math.random() * 21);
    console.log(`📝 Generating ${substitutionCount} substitutions for ${branchId}...`);
    
    for (let i = 0; i < substitutionCount; i++) {
      try {
        const period = getRandomElement(data.periods);
        const originalTeacher = data.teachers.find(t => t.id === period.teacherId) || getRandomElement(data.teachers);
        const substituteTeacher = getRandomElement(data.teachers.filter(t => t.id !== originalTeacher.id));
        const reason = getRandomElement(substitutionReasons);
        const status = getRandomElement(statuses);
        const substitutionDate = getRandomDate(academicYearStart, new Date());
        
        // Some substitutions have room changes
        const substituteRoom = Math.random() < 0.3 && data.rooms.length > 0 ? 
          getRandomElement(data.rooms) : null;
        
        // Approval details for approved/rejected substitutions
        let approvedBy = null;
        let approvedAt = null;
        if (status !== 'pending' && data.staff.length > 0) {
          approvedBy = getRandomElement(data.staff).id;
          approvedAt = new Date(substitutionDate.getTime() + Math.random() * 24 * 60 * 60 * 1000); // Up to 24 hours later
        }
        
        await prisma.substitution.create({
          data: {
            branchId: branchId,
            periodId: period.id,
            substituteTeacherId: substituteTeacher.id,
            substituteRoomId: substituteRoom?.id || null,
            date: substitutionDate,
            reason: reason,
            status: status,
            approvedBy: approvedBy,
            approvedAt: approvedAt
          }
        });
        
        totalSubstitutions++;
      } catch (error) {
        console.error(`❌ Error creating substitution for ${branchId}:`, error.message);
      }
    }
  }
  
  console.log(`✅ Created ${totalSubstitutions} substitution records across all branches`);
}

async function seedTicketMessages() {
  console.log('💬 Seeding Ticket Messages...');
  
  // Get all existing tickets
  const tickets = await prisma.ticket.findMany();
  
  console.log(`🎫 Found ${tickets.length} existing tickets to add messages to`);
  
  // Get staff members for internal messages  
  const staffMembers = await prisma.staff.findMany({
    select: { id: true, branchId: true, firstName: true, lastName: true, designation: true }
  });
  
  const messageTemplates = {
    initial: [
      'I am facing an issue with {issue}. Please help me resolve this matter urgently.',
      'Need assistance regarding {issue}. Kindly provide guidance on how to proceed.',
      'There seems to be a problem with {issue}. Could you please look into this?',
      'I would like to report an issue related to {issue}. Please investigate.',
      'Requesting support for {issue}. This is affecting my child\'s studies.'
    ],
    staff_response: [
      'Thank you for reaching out. We have received your query and are looking into the matter.',
      'We acknowledge your concern. Our team is investigating this issue and will get back to you soon.',
      'Your request has been logged. We will resolve this within 24-48 hours.',
      'Thank you for bringing this to our attention. We are working on a solution.',
      'We understand your concern and are prioritizing this matter for quick resolution.'
    ],
    follow_up: [
      'Could you please provide more details about this issue?',
      'For faster resolution, please share any relevant documents or screenshots.',
      'We need additional information to process your request effectively.',
      'Please confirm if this issue is still persisting.',
      'Can you verify the details you provided earlier?'
    ],
    resolution: [
      'This issue has been resolved. Please check and confirm if everything is working properly.',
      'We have fixed the problem. The changes should be reflected in your account now.',
      'Your request has been processed successfully. Thank you for your patience.',
      'Issue resolved. Please let us know if you face any further problems.',
      'Problem solved! Feel free to contact us if you need any more assistance.'
    ],
    internal: [
      'Assigned to technical team for investigation.',
      'Escalating to principal for approval.',
      'Coordinating with accounts department.',
      'Following up with IT support team.',
      'Requires management approval for processing.'
    ]
  };
  
  let totalMessages = 0;
  
  // Generate 3-5 messages per ticket
  for (const ticket of tickets) {
    const messageCount = 3 + Math.floor(Math.random() * 3); // 3-5 messages
    const ticketStaff = staffMembers.filter(s => s.branchId === ticket.branchId);
    
    if (ticketStaff.length === 0) {
      console.log(`⚠️ No staff found for branch ${ticket.branchId}, skipping ticket ${ticket.id}`);
      continue;
    }
    
    // Since we don't have the owner details directly loaded, we'll use the ticket title instead
    const ownerName = `Ticket #${ticket.id.substring(0, 8)}`;
    
    // Create conversation flow
    for (let i = 0; i < messageCount; i++) {
      try {
        let messageContent: string;
        let isInternal = false;
        let senderId: string;
        let senderType: 'student' | 'guardian' | 'staff';
        
        if (i === 0) {
          // Initial message from ticket owner
          messageContent = getRandomElement(messageTemplates.initial)
            .replace('{issue}', ticket.subject.toLowerCase());
          senderId = ticket.ownerId;
          senderType = ticket.ownerType as 'student' | 'guardian' | 'staff';
        } else if (i === messageCount - 1) {
          // Final resolution message from staff
          messageContent = getRandomElement(messageTemplates.resolution);
          const staffMember = getRandomElement(ticketStaff);
          senderId = staffMember.id;
          senderType = 'staff';
        } else if (i % 2 === 1) {
          // Staff response
          if (Math.random() < 0.2) {
            // 20% chance of internal message
            messageContent = getRandomElement(messageTemplates.internal);
            isInternal = true;
          } else {
            messageContent = i === 1 ? 
              getRandomElement(messageTemplates.staff_response) :
              getRandomElement(messageTemplates.follow_up);
          }
          const staffMember = getRandomElement(ticketStaff);
          senderId = staffMember.id;
          senderType = 'staff';
        } else {
          // Follow-up from owner
          messageContent = `Thank you for your response. ${getRandomElement([
            'I have shared the additional details as requested.',
            'Please let me know if you need any more information.',
            'Looking forward to a quick resolution.',
            'I hope this can be resolved soon.',
            'Thank you for your assistance in this matter.'
          ])}`;
          senderId = ticket.ownerId;
          senderType = ticket.ownerType as 'student' | 'guardian' | 'staff';
        }
        
        const messageDate = new Date(ticket.createdAt.getTime() + (i * 2 * 60 * 60 * 1000)); // 2 hours between messages
        
        await prisma.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            branchId: ticket.branchId,
            authorId: senderId,
            authorType: senderType,
            content: messageContent,
            internal: isInternal,
            createdAt: messageDate
          }
        });
        
        totalMessages++;
      } catch (error) {
        console.error(`❌ Error creating message for ticket ${ticket.id}:`, error.message);
      }
    }
  }
  
  console.log(`✅ Created ${totalMessages} ticket messages across ${tickets.length} tickets`);
}

async function seedTicketAttachments() {
  console.log('📎 Seeding Ticket Attachments...');
  
  // Get all existing tickets and their messages
  const tickets = await prisma.ticket.findMany({
    include: {
      messages: { select: { id: true } }
    }
  });
  
  console.log(`🎫 Found ${tickets.length} tickets for potential attachments`);
  
  // Only add attachments to 30% of tickets (realistic percentage)
  const ticketsWithAttachments = tickets.filter(() => Math.random() < 0.3);
  console.log(`📎 Adding attachments to ${ticketsWithAttachments.length} tickets`);
  
  const fileTypes = {
    fee_receipt: {
      extensions: ['pdf', 'jpg', 'png'],
      mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      sizes: [150000, 500000, 800000] // 150KB to 800KB
    },
    screenshot: {
      extensions: ['png', 'jpg'],
      mimeTypes: ['image/png', 'image/jpeg'],
      sizes: [200000, 1000000, 2000000] // 200KB to 2MB
    },
    document: {
      extensions: ['pdf', 'doc', 'docx'],
      mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      sizes: [100000, 2000000, 5000000] // 100KB to 5MB
    },
    id_card: {
      extensions: ['jpg', 'png', 'pdf'],
      mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      sizes: [300000, 800000, 1500000] // 300KB to 1.5MB
    }
  };
  
  const attachmentTemplates = {
    fee_receipt: ['fee_receipt_2024_q1.pdf', 'payment_confirmation.jpg', 'fee_payment_receipt.pdf', 'transaction_receipt.png'],
    screenshot: ['error_screenshot.png', 'login_issue.jpg', 'app_error.png', 'website_problem.jpg'],
    document: ['transfer_application.pdf', 'medical_certificate.pdf', 'leave_application.doc', 'complaint_letter.pdf'],
    id_card: ['student_id_copy.jpg', 'parent_id_proof.pdf', 'identity_document.png', 'id_card_scan.jpg']
  };
  
  let totalAttachments = 0;
  
  for (const ticket of ticketsWithAttachments) {
    // Each ticket can have 1-3 attachments
    const attachmentCount = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < attachmentCount; i++) {
      try {
        // Choose attachment type based on ticket category
        let fileType: keyof typeof fileTypes;
        if (ticket.category === 'fees') {
          fileType = getRandomElement(['fee_receipt', 'document']);
        } else if (ticket.category === 'technical') {
          fileType = getRandomElement(['screenshot', 'document']);
        } else if (ticket.category === 'admission') {
          fileType = getRandomElement(['document', 'id_card']);
        } else {
          fileType = getRandomElement(Object.keys(fileTypes)) as keyof typeof fileTypes;
        }
        
        const typeConfig = fileTypes[fileType];
        const extension = getRandomElement(typeConfig.extensions);
        const mimeType = typeConfig.mimeTypes[typeConfig.extensions.indexOf(extension)];
        const fileSize = getRandomElement(typeConfig.sizes);
        const fileName = getRandomElement(attachmentTemplates[fileType]).replace(/\.\w+$/, `.${extension}`);
        
        // Generate file path
        const filePath = `/uploads/tickets/${ticket.branchId}/${ticket.id}/${fileName}`;
        
        // Most attachments are direct ticket attachments
        // (TicketAttachment schema doesn't have messageId field based on what we saw)
        
        await prisma.ticketAttachment.create({
          data: {
            ticketId: ticket.id,
            branchId: ticket.branchId,
            fileName: fileName,
            fileUrl: filePath,
            fileSize: fileSize,
            mimeType: mimeType,
            createdAt: new Date(ticket.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) // Within 24 hours of ticket
          }
        });
        
        totalAttachments++;
      } catch (error) {
        console.error(`❌ Error creating attachment for ticket ${ticket.id}:`, error.message);
      }
    }
  }
  
  console.log(`✅ Created ${totalAttachments} ticket attachments for ${ticketsWithAttachments.length} tickets`);
}

// ========== MAIN SEEDING FUNCTION ==========
async function seedMissingModules() {
  console.log('🌱 PARAMARSH SMS - MISSING MODULES SEED DATA GENERATOR');
  console.log('=' .repeat(60));
  console.log(`📅 Started at: ${new Date().toISOString()}\n`);
  
  const startTime = Date.now();
  
  try {
    // Seed Substitutions (currently 0 records)
    await seedSubstitutions();
    console.log('');
    
    // Seed TicketMessages (currently 0 records)  
    await seedTicketMessages();
    console.log('');
    
    // Seed TicketAttachments (currently 0 records)
    await seedTicketAttachments();
    console.log('');
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    
    // Final validation
    console.log('\n🔍 FINAL VALIDATION');
    console.log('-'.repeat(30));
    
    const finalCounts = {
      substitutions: await prisma.substitution.count(),
      ticketMessages: await prisma.ticketMessage.count(),
      ticketAttachments: await prisma.ticketAttachment.count()
    };
    
    console.log(`✅ Substitutions: ${finalCounts.substitutions} records`);
    console.log(`✅ TicketMessages: ${finalCounts.ticketMessages} records`);
    console.log(`✅ TicketAttachments: ${finalCounts.ticketAttachments} records`);
    
    console.log('\n🎯 MISSION ACCOMPLISHED!');
    console.log('All missing modules now have comprehensive seed data');
    console.log('Database is ready for production demos');
    
  } catch (error) {
    console.error('❌ SEED FAILED:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedMissingModules();