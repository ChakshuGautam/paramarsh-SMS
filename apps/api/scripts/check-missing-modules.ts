import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMissingModules() {
  console.log('🔍 Checking Missing Modules Status...\n');
  
  try {
    // Check Substitutions
    const substitutions = await prisma.substitution.count();
    console.log(`📋 Substitutions: ${substitutions} records`);
    
    // Check Tickets
    const tickets = await prisma.ticket.count();
    console.log(`🎫 Tickets: ${tickets} records`);
    
    // Check TicketMessages
    const ticketMessages = await prisma.ticketMessage.count();
    console.log(`💬 TicketMessages: ${ticketMessages} records`);
    
    // Check TicketAttachments
    const ticketAttachments = await prisma.ticketAttachment.count();
    console.log(`📎 TicketAttachments: ${ticketAttachments} records`);
    
    // Check Invoices
    const invoices = await prisma.invoice.count();
    console.log(`🧾 Invoices: ${invoices} records`);
    
    // Check Payments
    const payments = await prisma.payment.count();
    console.log(`💰 Payments: ${payments} records`);
    
    // Check branches for reference data
    console.log('\n🏫 Reference Data Check:');
    const tenants = await prisma.tenant.count();
    const students = await prisma.student.count();
    const teachers = await prisma.teacher.count();
    const timetablePeriods = await prisma.timetablePeriod.count();
    const rooms = await prisma.room.count();
    const staff = await prisma.staff.count();
    const guardians = await prisma.guardian.count();
    
    console.log(`   Tenants: ${tenants}`);
    console.log(`   Students: ${students}`);
    console.log(`   Teachers: ${teachers}`);  
    console.log(`   Staff: ${staff}`);
    console.log(`   Guardians: ${guardians}`);
    console.log(`   TimetablePeriods: ${timetablePeriods}`);
    console.log(`   Rooms: ${rooms}`);
    
    // Show which modules need seeding
    console.log('\n📊 Missing Data Analysis:');
    const missing = [];
    if (substitutions === 0) missing.push('Substitutions');
    if (ticketMessages === 0) missing.push('TicketMessages');
    if (ticketAttachments === 0) missing.push('TicketAttachments');
    
    if (missing.length > 0) {
      console.log(`❌ Empty modules requiring seed data: ${missing.join(', ')}`);
    } else {
      console.log('✅ All critical modules have data');
    }
    
    console.log('\n✅ Module check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking modules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingModules();