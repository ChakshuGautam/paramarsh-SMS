#!/usr/bin/env node

/**
 * Comprehensive Invoice and Payment Data Generator
<<<<<<< HEAD
 * Generates realistic Indian school fee management data using MCP PostgreSQL Server tools
=======
 * Generates realistic Indian school fee management data using MCP SQLite Server tools
>>>>>>> origin/main
 * 
 * Features:
 * - Monthly and quarterly invoicing patterns
 * - Multiple payment scenarios (full, partial, overdue)
 * - Indian payment methods (UPI, NEFT, Cash, Cheque, etc.)
 * - Realistic fee amounts and payment timing
 * - Proper relationship maintenance
 */

const crypto = require('crypto');

// Indian payment methods with realistic distribution
const PAYMENT_METHODS = [
  { method: 'UPI', weight: 35, gateways: ['PhonePe', 'GPay', 'Paytm', 'BHIM UPI'] },
  { method: 'NEFT', weight: 20, gateways: ['SBI Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'] },
  { method: 'CASH', weight: 15, gateways: ['School Office', 'Cash Counter'] },
  { method: 'CHEQUE', weight: 12, gateways: ['Bank Cheque', 'Demand Draft'] },
  { method: 'NETBANKING', weight: 10, gateways: ['SBI Online', 'HDFC NetBanking', 'ICICI iMobile'] },
  { method: 'CARD', weight: 5, gateways: ['Visa Card', 'Mastercard', 'RuPay Card'] },
  { method: 'RTGS', weight: 3, gateways: ['Bank Transfer', 'Wire Transfer'] }
];

// Academic periods for 2024-25
const ACADEMIC_PERIODS = [
  { period: 'April-2024', month: 4, dueDate: 10 },
  { period: 'May-2024', month: 5, dueDate: 10 },
  { period: 'June-2024', month: 6, dueDate: 10 },
  { period: 'July-2024', month: 7, dueDate: 10 },
  { period: 'August-2024', month: 8, dueDate: 10 },
  { period: 'September-2024', month: 9, dueDate: 10 },
  { period: 'October-2024', month: 10, dueDate: 10 },
  { period: 'November-2024', month: 11, dueDate: 10 },
  { period: 'December-2024', month: 12, dueDate: 10 },
  { period: 'Term-1-2024', month: 4, dueDate: 15 },
  { period: 'Term-2-2024', month: 8, dueDate: 15 },
  { period: 'Term-3-2025', month: 12, dueDate: 15 },
];

class InvoicePaymentGenerator {
  constructor() {
    this.students = [];
    this.feeStructures = new Map();
    this.invoices = [];
    this.payments = [];
    this.batchSize = 50; // Process in batches
  }

  // Generate UUID
  generateUUID() {
    return crypto.randomUUID();
  }

  // Get weighted random payment method
  getRandomPaymentMethod() {
    const totalWeight = PAYMENT_METHODS.reduce((sum, pm) => sum + pm.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const pm of PAYMENT_METHODS) {
      random -= pm.weight;
      if (random <= 0) {
        const gateway = pm.gateways[Math.floor(Math.random() * pm.gateways.length)];
        return { method: pm.method, gateway };
      }
    }
    
    return { method: 'UPI', gateway: 'PhonePe' };
  }

  // Generate realistic Indian transaction reference
  generateTransactionReference(method) {
    const timestamp = Date.now().toString().slice(-8);
    
    switch (method) {
      case 'UPI':
        return `UPI${timestamp}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      case 'NEFT':
        return `NEFT${timestamp}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      case 'RTGS':
        return `RTGS${timestamp}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      case 'CHEQUE':
        return `CHQ${Math.floor(100000 + Math.random() * 900000)}`;
      case 'CASH':
        return `CASH${timestamp}`;
      case 'CARD':
        return `CARD${timestamp}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
      case 'NETBANKING':
        return `NET${timestamp}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      default:
        return `TXN${timestamp}`;
    }
  }

  // Calculate realistic payment dates
  generatePaymentDate(dueDate, scenario) {
    const due = new Date(dueDate);
    let paymentDate = new Date(due);

    switch (scenario) {
      case 'early':
        paymentDate.setDate(due.getDate() - Math.floor(Math.random() * 5) - 1);
        break;
      case 'ontime':
        paymentDate.setDate(due.getDate() + Math.floor(Math.random() * 3));
        break;
      case 'late':
        paymentDate.setDate(due.getDate() + Math.floor(Math.random() * 15) + 5);
        break;
      case 'very_late':
        paymentDate.setDate(due.getDate() + Math.floor(Math.random() * 30) + 15);
        break;
    }

    return paymentDate.toISOString();
  }

  // Load sample students (first 100 for testing)
  async loadSampleStudents() {
    console.log('📊 Loading sample students for testing...');
    
    // Sample student data based on our earlier query
    this.students = [
      { studentId: "c8640dba-3a82-4914-81e5-b25b5ec750d4", firstName: "Aadhya", lastName: "Pillai", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
      { studentId: "e8a2d631-19f0-4a32-ba95-ad593c8446dd", firstName: "Aadhya", lastName: "Iyer", classId: "f2ff6ae0-8815-4622-af47-b7136664e73f" },
      { studentId: "524b4971-553e-483f-befe-7205ef784075", firstName: "Aadhya", lastName: "Jain", classId: "f2ff6ae0-8815-4622-af47-b7136664e73f" },
      { studentId: "0527c7dc-a8a6-4145-8f31-b5165aa389ba", firstName: "Aadhya", lastName: "Jain", classId: "f2ff6ae0-8815-4622-af47-b7136664e73f" },
      { studentId: "48810d42-00ea-49a9-8b8a-7d143a9c9fba", firstName: "Aadhya", lastName: "Shetty", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
      { studentId: "e0f24e53-60cd-497f-b7ad-75dfeab2b3d1", firstName: "Aadhya", lastName: "Verma", classId: "4aa1f3f1-7342-47cf-ab4a-6db6c4df3f86" },
      { studentId: "bdd061d0-3854-4433-8e5c-2a7046f7d377", firstName: "Aadhya", lastName: "Reddy", classId: "4639adea-f65b-4648-9762-aa7a83081f30" },
      { studentId: "9b19db20-4d47-491e-9d38-bbcd0f76b1c7", firstName: "Aadhya", lastName: "Iyer", classId: "4639adea-f65b-4648-9762-aa7a83081f30" },
      { studentId: "cabe3e5b-ca57-4ffe-b0d6-ecb68229b383", firstName: "Aadhya", lastName: "Gupta", classId: "2c29718d-9bab-4ebf-a585-42805e2422cd" },
      { studentId: "83264d90-cbaa-4c0e-a999-1de488b2fa8d", firstName: "Aadhya", lastName: "Reddy", classId: "2c29718d-9bab-4ebf-a585-42805e2422cd" },
      { studentId: "95df127d-a095-469f-a9bc-de3a5bc9010a", firstName: "Aarav", lastName: "Sharma", classId: "f2ff6ae0-8815-4622-af47-b7136664e73f" },
      { studentId: "0bf5b793-deb4-4d5d-8260-22d7dc44dad3", firstName: "Aarav", lastName: "Hegde", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
      { studentId: "329c4db7-d024-47a4-8230-1a14429d01fe", firstName: "Aarav", lastName: "Sharma", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
      { studentId: "15d33ab6-e520-4c6c-a8af-283fb8633886", firstName: "Aarav", lastName: "Singh", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
      { studentId: "b541b67f-a83a-4dc9-b747-6c77cd0caa0f", firstName: "Aarav", lastName: "Agarwal", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
      { studentId: "dfa356cc-9689-4690-9e1f-212f403c5377", firstName: "Aarav", lastName: "Gupta", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
      { studentId: "fe8e5450-4c46-4e46-9e8d-a73ef988e0f0", firstName: "Aarav", lastName: "Reddy", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
      { studentId: "09238ae8-bc43-4c5e-8cff-cdfde1330b78", firstName: "Aarav", lastName: "Bhat", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
      { studentId: "f928c47a-7be4-44ae-8b48-d3d3e79577ed", firstName: "Aditi", lastName: "Hegde", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
      { studentId: "eb721fcc-0730-4c46-89e3-3b2b6c579e34", firstName: "Aditi", lastName: "Shah", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
      // Adding more diverse students for comprehensive testing
      { studentId: "28046dd8-6456-46c5-999a-5762ded498bc", firstName: "Akash", lastName: "Desai", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
      { studentId: "f860d997-d49c-48a2-9a25-1b49da9e3d3d", firstName: "Amit", lastName: "Rao", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
      { studentId: "0300809a-4328-4d1d-b977-49b45ba0ccf1", firstName: "Ananya", lastName: "Hegde", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
      { studentId: "af265d5b-e774-4137-9e22-12d9c79be000", firstName: "Anika", lastName: "Agarwal", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
      { studentId: "30f1f84e-01a7-468f-bdb6-c75be1a04272", firstName: "Aditya", lastName: "Patel", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" }
    ];

    // Set realistic fee amounts based on class level
    for (const student of this.students) {
      // Fee amounts vary by class level
      let baseFee = 5000; // Base monthly fee
      if (student.classId === "6429d462-e58c-416d-8cdc-5adf6ac6401c") baseFee = 3000; // Nursery
      else if (student.classId === "f2ff6ae0-8815-4622-af47-b7136664e73f") baseFee = 3500; // LKG
      else if (student.classId === "2506e17f-c6b3-410a-867c-71c2694dc537") baseFee = 4000; // UKG
      else if (student.classId === "4aa1f3f1-7342-47cf-ab4a-6db6c4df3f86") baseFee = 4500; // Class 1
      else if (student.classId.includes("4639adea")) baseFee = 5000; // Class 2
      else if (student.classId.includes("2c29718d")) baseFee = 5500; // Class 3
      else baseFee = 6000; // Higher classes
      
      this.feeStructures.set(student.studentId, baseFee);
    }

    console.log(`✅ Loaded ${this.students.length} students with fee structures`);
  }

  // Generate invoices for students
  generateInvoices() {
    console.log('📋 Generating invoices for students...');
    
    let invoiceCount = 0;
    
    for (const student of this.students) {
      const baseFee = this.feeStructures.get(student.studentId) || 5000;
      
      // 70% get monthly billing, 30% get quarterly
      const useMonthlyBilling = Math.random() < 0.7;
      
      if (useMonthlyBilling) {
        // Generate monthly invoices (April to December 2024)
        for (let month = 4; month <= 12; month++) {
          if (Math.random() < 0.9) { // 90% completion rate
            const period = ACADEMIC_PERIODS.find(p => p.month === month && !p.period.includes('Term'));
            if (period) {
              const invoice = this.createInvoice(student, period, baseFee);
              this.invoices.push(invoice);
              invoiceCount++;
            }
          }
        }
      } else {
        // Generate term-wise invoices
        const termPeriods = ACADEMIC_PERIODS.filter(p => p.period.includes('Term'));
        for (const period of termPeriods) {
          if (Math.random() < 0.85) { // 85% completion rate
            const termFee = Math.round(baseFee * 3); // 3 months per term
            const invoice = this.createInvoice(student, period, termFee);
            this.invoices.push(invoice);
            invoiceCount++;
          }
        }
      }
    }
    
    console.log(`✅ Generated ${invoiceCount} invoices`);
  }

  // Create individual invoice
  createInvoice(student, period, amount) {
    const dueDate = new Date(2024, period.month - 1, period.dueDate);
    
    // Realistic status distribution
    let status;
    const random = Math.random();
    
    if (random < 0.6) {
      status = 'PAID';
    } else if (random < 0.75) {
      status = 'PARTIAL';
    } else if (random < 0.9) {
      status = 'PENDING';
    } else {
      status = 'OVERDUE';
    }
    
    return {
      id: this.generateUUID(),
      studentId: student.studentId,
      period: period.period,
      dueDate: dueDate.toISOString().split('T')[0],
      amount: amount,
      status: status,
      branchId: 'branch1'
    };
  }

  // Generate payments for invoices
  generatePayments() {
    console.log('💳 Generating payments for invoices...');
    
    let paymentCount = 0;
    
    for (const invoice of this.invoices) {
      const payments = this.createPaymentsForInvoice(invoice);
      this.payments.push(...payments);
      paymentCount += payments.length;
    }
    
    console.log(`✅ Generated ${paymentCount} payments`);
  }

  // Create payments for specific invoice
  createPaymentsForInvoice(invoice) {
    const payments = [];
    
    switch (invoice.status) {
      case 'PAID':
        payments.push(this.createPayment(invoice, invoice.amount, 'ontime'));
        break;
        
      case 'PARTIAL':
        const partialAmount = Math.round(invoice.amount * (0.3 + Math.random() * 0.4));
        payments.push(this.createPayment(invoice, partialAmount, 'ontime'));
        
        if (Math.random() < 0.4) {
          const remainingAmount = Math.min(invoice.amount - partialAmount, 
                                         Math.round(invoice.amount * 0.3));
          payments.push(this.createPayment(invoice, remainingAmount, 'late'));
        }
        break;
        
      case 'OVERDUE':
        if (Math.random() < 0.3) {
          const lateAmount = Math.round(invoice.amount * (0.5 + Math.random() * 0.5));
          payments.push(this.createPayment(invoice, lateAmount, 'very_late'));
        }
        break;
        
      case 'PENDING':
        if (Math.random() < 0.1) {
          payments.push(this.createFailedPayment(invoice));
        }
        break;
    }
    
    return payments;
  }

  // Create individual payment
  createPayment(invoice, amount, timing) {
    const { method, gateway } = this.getRandomPaymentMethod();
    const paymentDate = this.generatePaymentDate(invoice.dueDate, timing);
    
    return {
      id: this.generateUUID(),
      branchId: 'branch1',
      invoiceId: invoice.id,
      gateway: gateway,
      amount: amount,
      status: 'SUCCESS',
      reference: this.generateTransactionReference(method),
      method: method,
      createdAt: paymentDate,
      updatedAt: paymentDate
    };
  }

  // Create failed payment attempt
  createFailedPayment(invoice) {
    const { method, gateway } = this.getRandomPaymentMethod();
    const attemptDate = this.generatePaymentDate(invoice.dueDate, 'ontime');
    
    return {
      id: this.generateUUID(),
      branchId: 'branch1',
      invoiceId: invoice.id,
      gateway: gateway,
      amount: invoice.amount,
      status: 'FAILED',
      reference: this.generateTransactionReference(method),
      method: method,
      createdAt: attemptDate,
      updatedAt: attemptDate
    };
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 COMPREHENSIVE DATA GENERATION REPORT');
    console.log('=====================================');
    console.log(`📚 Total Students: ${this.students.length}`);
    console.log(`📋 Total Invoices: ${this.invoices.length}`);
    console.log(`💳 Total Payments: ${this.payments.length}`);
    
    // Invoice status breakdown
    const invoiceStats = this.invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Invoice Status Distribution:');
    Object.entries(invoiceStats).forEach(([status, count]) => {
      const percentage = ((count / this.invoices.length) * 100).toFixed(1);
      console.log(`  ${status}: ${count} (${percentage}%)`);
    });
    
    // Payment method breakdown
    const paymentMethodStats = this.payments.reduce((acc, pay) => {
      acc[pay.method] = (acc[pay.method] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n💳 Payment Method Distribution:');
    Object.entries(paymentMethodStats).forEach(([method, count]) => {
      const percentage = ((count / this.payments.length) * 100).toFixed(1);
      console.log(`  ${method}: ${count} (${percentage}%)`);
    });
    
    // Financial summary
    const totalInvoiced = this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = this.payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, pay) => sum + pay.amount, 0);
    const collectionRate = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : '0.0';
    
    console.log('\n💰 Financial Summary:');
    console.log(`  Total Invoiced: ₹${totalInvoiced.toLocaleString('en-IN')}`);
    console.log(`  Total Collected: ₹${totalPaid.toLocaleString('en-IN')}`);
    console.log(`  Collection Rate: ${collectionRate}%`);
    console.log(`  Outstanding: ₹${(totalInvoiced - totalPaid).toLocaleString('en-IN')}`);
    
    console.log('\n✅ Data Generation Report Complete!');
  }

  // Main execution method
  async execute() {
    try {
      console.log('🏫 Starting Invoice & Payment Data Generation...\n');
      
      await this.loadSampleStudents();
      this.generateInvoices();
      this.generatePayments();
      this.generateReport();
      
      console.log('\n🎉 Data generation completed successfully!');
<<<<<<< HEAD
      console.log('📄 Ready to save data using MCP PostgreSQL Server tools.');
=======
      console.log('📄 Ready to save data using MCP SQLite Server tools.');
>>>>>>> origin/main
      console.log(`📊 Generated ${this.invoices.length} invoices and ${this.payments.length} payments.`);
      
      // Return data for MCP-based saving
      return {
        invoices: this.invoices,
        payments: this.payments,
        summary: {
          studentCount: this.students.length,
          invoiceCount: this.invoices.length,
          paymentCount: this.payments.length
        }
      };
      
    } catch (error) {
      console.error('❌ Data generation failed:', error);
      throw error;
    }
  }
}

// Export for use as module
module.exports = { InvoicePaymentGenerator };

// Direct execution if run as script
if (require.main === module) {
  const generator = new InvoicePaymentGenerator();
  generator.execute().then(() => {
    console.log('Script execution completed.');
  }).catch(console.error);
}