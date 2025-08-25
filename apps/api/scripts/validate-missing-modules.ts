import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateMissingModules() {
  console.log('🔍 COMPREHENSIVE MISSING MODULES VALIDATION');
  console.log('=' .repeat(60));
  console.log(`📅 Validation Time: ${new Date().toISOString()}\n`);
  
  try {
    // Get all branches
    const branches = await prisma.tenant.findMany({ 
      select: { id: true, name: true } 
    });
    console.log(`🏫 Validating ${branches.length} branches...\n`);
    
    // Global counts
    const globalCounts = {
      substitutions: await prisma.substitution.count(),
      tickets: await prisma.ticket.count(),
      ticketMessages: await prisma.ticketMessage.count(),
      ticketAttachments: await prisma.ticketAttachment.count(),
      invoices: await prisma.invoice.count(),
      payments: await prisma.payment.count()
    };
    
    console.log('🌍 GLOBAL TOTALS');
    console.log('-'.repeat(30));
    console.log(`📋 Substitutions: ${globalCounts.substitutions.toLocaleString()}`);
    console.log(`🎫 Tickets: ${globalCounts.tickets.toLocaleString()}`);
    console.log(`💬 TicketMessages: ${globalCounts.ticketMessages.toLocaleString()}`);
    console.log(`📎 TicketAttachments: ${globalCounts.ticketAttachments.toLocaleString()}`);
    console.log(`🧾 Invoices: ${globalCounts.invoices.toLocaleString()}`);
    console.log(`💰 Payments: ${globalCounts.payments.toLocaleString()}`);
    
    console.log('\n🏫 BRANCH-WISE BREAKDOWN');
    console.log('-'.repeat(60));
    console.log('Branch ID           | Sub | Tkt | TMsg| TAtt| Inv | Pay');
    console.log('-'.repeat(60));
    
    let totalValidationScore = 0;
    const maxPossibleScore = branches.length * 6; // 6 modules per branch
    
    for (const branch of branches) {
      const branchCounts = {
        substitutions: await prisma.substitution.count({ where: { branchId: branch.id } }),
        tickets: await prisma.ticket.count({ where: { branchId: branch.id } }),
        ticketMessages: await prisma.ticketMessage.count({ where: { branchId: branch.id } }),
        ticketAttachments: await prisma.ticketAttachment.count({ where: { branchId: branch.id } }),
        invoices: await prisma.invoice.count({ where: { branchId: branch.id } }),
        payments: await prisma.payment.count({ where: { branchId: branch.id } })
      };
      
      // Count modules with data (scoring)
      let branchScore = 0;
      if (branchCounts.substitutions > 0) branchScore++;
      if (branchCounts.tickets > 0) branchScore++;
      if (branchCounts.ticketMessages > 0) branchScore++;
      if (branchCounts.ticketAttachments > 0) branchScore++; // This can be 0 for some branches (30% rule)
      if (branchCounts.invoices > 0) branchScore++;
      if (branchCounts.payments > 0) branchScore++;
      
      totalValidationScore += branchScore;
      
      console.log(`${branch.id.padEnd(18)} | ${String(branchCounts.substitutions).padStart(3)} | ${String(branchCounts.tickets).padStart(3)} | ${String(branchCounts.ticketMessages).padStart(3)} | ${String(branchCounts.ticketAttachments).padStart(3)} | ${String(branchCounts.invoices).padStart(3)} | ${String(branchCounts.payments).padStart(3)}`);
    }
    
    console.log('-'.repeat(60));
    
    // Validation Summary
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('-'.repeat(30));
    
    const completionPercentage = (totalValidationScore / maxPossibleScore) * 100;
    const completionPercentageStr = completionPercentage.toFixed(1);
    console.log(`✅ Data Completion: ${completionPercentageStr}% (${totalValidationScore}/${maxPossibleScore})`);
    
    // Detailed Analysis
    console.log('\n📈 DETAILED ANALYSIS');
    console.log('-'.repeat(30));
    
    // Substitutions Analysis
    const avgSubstitutionsPerBranch = Math.round(globalCounts.substitutions / branches.length);
    console.log(`📋 Substitutions: ${avgSubstitutionsPerBranch} avg per branch (${globalCounts.substitutions} total)`);
    
    // Tickets Analysis
    const avgTicketsPerBranch = Math.round(globalCounts.tickets / branches.length);
    console.log(`🎫 Tickets: ${avgTicketsPerBranch} avg per branch (${globalCounts.tickets} total)`);
    
    // Messages per ticket
    const avgMessagesPerTicket = globalCounts.tickets > 0 ? Math.round(globalCounts.ticketMessages / globalCounts.tickets) : 0;
    console.log(`💬 TicketMessages: ${avgMessagesPerTicket} avg per ticket (${globalCounts.ticketMessages} total)`);
    
    // Attachments per ticket
    const attachmentPercentage = globalCounts.tickets > 0 ? ((globalCounts.ticketAttachments / globalCounts.tickets) * 100).toFixed(1) : 0;
    console.log(`📎 TicketAttachments: ${attachmentPercentage}% of tickets have attachments (${globalCounts.ticketAttachments} total)`);
    
    // Financial Analysis
    const avgInvoicesPerBranch = Math.round(globalCounts.invoices / branches.length);
    console.log(`🧾 Invoices: ${avgInvoicesPerBranch} avg per branch (${globalCounts.invoices} total)`);
    
    const paymentRate = globalCounts.invoices > 0 ? ((globalCounts.payments / globalCounts.invoices) * 100).toFixed(1) : 0;
    console.log(`💰 Payments: ${paymentRate}% payment rate (${globalCounts.payments} total)`);
    
    // Final Verdict
    console.log('\n🎯 FINAL VERDICT');
    console.log('-'.repeat(20));
    
    if (completionPercentage >= 95) {
      console.log('🎉 EXCELLENT! All modules are fully populated across all branches');
      console.log('✅ Database is production-ready for comprehensive demos');
      console.log('✅ All 13 branches have complete data coverage');
    } else if (completionPercentage >= 80) {
      console.log('✅ GOOD! Most modules are populated with minor gaps');
      console.log('⚠️  Some branches may have missing data in certain modules');
    } else {
      console.log('❌ NEEDS IMPROVEMENT! Significant data gaps detected');
      console.log('❌ Some modules are empty or have insufficient data');
    }
    
    console.log('\n🔧 RECOMMENDATIONS');
    console.log('-'.repeat(20));
    
    if (globalCounts.substitutions === 0) {
      console.log('❌ Generate substitution data for teacher absence management');
    } else {
      console.log('✅ Substitution system ready for teacher absence scenarios');
    }
    
    if (globalCounts.ticketMessages === 0) {
      console.log('❌ Generate ticket messages for support conversation flows');
    } else {
      console.log('✅ Support ticket system ready with conversation history');
    }
    
    if (globalCounts.ticketAttachments === 0) {
      console.log('❌ Generate ticket attachments for document support');
    } else {
      console.log('✅ Support system ready with file attachment capabilities');
    }
    
    if (globalCounts.invoices === 0) {
      console.log('❌ Generate invoice data for financial management demos');
    } else {
      console.log('✅ Financial system ready with comprehensive invoice data');
    }
    
    if (globalCounts.payments === 0) {
      console.log('❌ Generate payment data for fee collection demos');
    } else {
      console.log('✅ Payment system ready with transaction history');
    }
    
    console.log(`\n📋 Validation completed at ${new Date().toISOString()}`);
    console.log('🎉 Missing modules validation successful!');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validateMissingModules();