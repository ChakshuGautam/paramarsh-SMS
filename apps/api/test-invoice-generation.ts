import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInvoiceGeneration() {
  console.log('🔍 Testing Invoice Generation Issue\n');
  
  try {
    // Check if we have students
    const studentCount = await prisma.student.count();
    console.log(`✅ Students in database: ${studentCount}`);
    
    if (studentCount === 0) {
      console.log('❌ No students found - cannot generate invoices');
      return;
    }
    
    // Check if we have fee structures
    const feeStructureCount = await prisma.feeStructure.count();
    console.log(`✅ Fee Structures: ${feeStructureCount}`);
    
    // Check if we have fee components
    const feeComponentCount = await prisma.feeComponent.count();
    console.log(`✅ Fee Components: ${feeComponentCount}`);
    
    // Check if we have fee schedules
    const feeScheduleCount = await prisma.feeSchedule.count();
    console.log(`✅ Fee Schedules: ${feeScheduleCount}`);
    
    // Get a sample student
    const student = await prisma.student.findFirst({
      where: { branchId: 'dps-main' }
    });
    
    if (!student) {
      console.log('❌ No student found for dps-main branch');
      return;
    }
    
    console.log(`\n📝 Attempting to create invoice for student: ${student.firstName} ${student.lastName}`);
    
    // Try to create a single invoice
    try {
      const invoice = await prisma.invoice.create({
        data: {
          branchId: 'dps-main',
          invoiceNumber: `INV-TEST-2024-${Date.now()}`,
          studentId: student.id,
          period: '2024-Q1',
          amount: 5000,
          status: 'pending',
          dueDate: '2024-03-31'
        }
      });
      
      console.log('✅ Successfully created test invoice:', invoice.invoiceNumber);
      
      // Clean up
      await prisma.invoice.delete({ where: { id: invoice.id } });
      console.log('🧹 Test invoice cleaned up');
      
    } catch (error) {
      console.log('❌ Failed to create invoice:', error);
    }
    
    // Check existing invoices
    const existingInvoices = await prisma.invoice.count();
    console.log(`\n📊 Existing invoices in database: ${existingInvoices}`);
    
    // Check if there's a unique constraint issue
    const duplicateCheck = await prisma.invoice.findMany({
      where: {
        studentId: student.id,
        period: '2024-Q1'
      }
    });
    
    if (duplicateCheck.length > 0) {
      console.log(`⚠️ Found ${duplicateCheck.length} existing invoices for this student-period combination`);
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInvoiceGeneration();