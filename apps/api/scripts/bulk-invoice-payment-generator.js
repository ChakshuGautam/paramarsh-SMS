#!/usr/bin/env node

/**
 * Bulk Invoice and Payment Generator for Paramarsh SMS
 * Generates comprehensive seed data with Indian context
 */

const crypto = require('crypto');

// Indian payment methods distribution
const PAYMENT_METHODS = [
  { method: 'UPI', weight: 35, gateways: ['PhonePe', 'GPay', 'Paytm', 'BHIM UPI', 'Amazon Pay'] },
  { method: 'NEFT', weight: 20, gateways: ['SBI Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'PNB'] },
  { method: 'CASH', weight: 15, gateways: ['School Office', 'Cash Counter', 'Admin Office'] },
  { method: 'CHEQUE', weight: 12, gateways: ['Bank Cheque', 'Demand Draft', 'Pay Order'] },
  { method: 'NETBANKING', weight: 10, gateways: ['SBI Online', 'HDFC NetBanking', 'ICICI iMobile', 'Axis Online'] },
  { method: 'CARD', weight: 5, gateways: ['Visa Card', 'Mastercard', 'RuPay Card'] },
  { method: 'RTGS', weight: 3, gateways: ['Bank Transfer', 'Wire Transfer', 'Swift Transfer'] }
];

// Academic periods
const PERIODS = [
  { period: 'April-2024', month: 4, dueDay: 10 },
  { period: 'May-2024', month: 5, dueDay: 10 },
  { period: 'June-2024', month: 6, dueDay: 10 },
  { period: 'July-2024', month: 7, dueDay: 10 },
  { period: 'August-2024', month: 8, dueDay: 10 },
  { period: 'September-2024', month: 9, dueDay: 10 },
  { period: 'October-2024', month: 10, dueDay: 10 },
  { period: 'November-2024', month: 11, dueDay: 10 },
  { period: 'December-2024', month: 12, dueDay: 10 },
  { period: 'Term-1-2024', month: 4, dueDay: 15 },
  { period: 'Term-2-2024', month: 8, dueDay: 15 },
  { period: 'Term-3-2025', month: 12, dueDay: 15 }
];

// Sample student data from our previous query
const STUDENTS = [
  { studentId: "dcd8ac41-ba7b-4d32-a536-a01fdbf2dd79", firstName: "Anika", lastName: "Agarwal", classId: "add38914-5638-4a64-8e29-1fb52a1e3f1e" },
  { studentId: "051cb446-45d2-45b5-be06-ecde3ffe0829", firstName: "Nikhil", lastName: "Hegde", classId: "4639adea-f65b-4648-9762-aa7a83081f30" },
  { studentId: "c278faba-2371-425f-8af1-d6758f8ac31c", firstName: "Nidhi", lastName: "Shetty", classId: "f2ff6ae0-8815-4622-af47-b7136664e73f" },
  { studentId: "30c253d5-4f40-4f15-a202-34aa96104987", firstName: "Vihaan", lastName: "Verma", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
  { studentId: "9ada0204-771f-4c1a-8835-929328b160f3", firstName: "Riya", lastName: "Bhat", classId: "4aa1f3f1-7342-47cf-ab4a-6db6c4df3f86" },
  { studentId: "5f13f400-4b00-4265-b05b-3f2ca5dc0c1e", firstName: "Anika", lastName: "Shetty", classId: "8e308a71-c379-4d30-adf2-099bca9112e9" },
  { studentId: "af265d5b-e774-4137-9e22-12d9c79be000", firstName: "Anika", lastName: "Agarwal", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
  { studentId: "d262800f-8b82-4b5a-94e6-1b9e85d07afa", firstName: "Sai", lastName: "Desai", classId: "610d2e86-0689-4c10-abd2-a52861fa550b" },
  { studentId: "8336f76f-e3c6-4d2e-a9eb-2917d2cd6776", firstName: "Ayaan", lastName: "Mehta", classId: "2c29718d-9bab-4ebf-a585-42805e2422cd" },
  { studentId: "09d919b9-f37f-4a47-a4e5-defcd1eebc96", firstName: "Simran", lastName: "Sharma", classId: "c7b5da49-be27-4b3c-9dc5-b21e3629e70b" },
  { studentId: "b5ba690b-b834-48d8-ae72-dbcceb26e123", firstName: "Sai", lastName: "Reddy", classId: "c7b5da49-be27-4b3c-9dc5-b21e3629e70b" },
  { studentId: "92f7b0ac-3caa-4472-ad62-93bae8867c7b", firstName: "Anika", lastName: "Patel", classId: "8e308a71-c379-4d30-adf2-099bca9112e9" },
  { studentId: "671bf753-66ed-4785-af91-69e490870b13", firstName: "Ishika", lastName: "Verma", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
  { studentId: "f928c47a-7be4-44ae-8b48-d3d3e79577ed", firstName: "Aditi", lastName: "Hegde", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
  { studentId: "95d13749-e165-4b23-9dc5-4f4336a052ff", firstName: "Ishaan", lastName: "Desai", classId: "c7b5da49-be27-4b3c-9dc5-b21e3629e70b" },
  { studentId: "73d0559b-bb0a-493a-90a7-582700d324b6", firstName: "Saanvi", lastName: "Patel", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
  { studentId: "3d16d895-440a-4bc3-a0b9-bb7f23c8bf0d", firstName: "Sai", lastName: "Naidu", classId: "4639adea-f65b-4648-9762-aa7a83081f30" },
  { studentId: "aa589dc2-6fec-493a-abab-c6edbb6d047b", firstName: "Rohan", lastName: "Shah", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
  { studentId: "07aa6022-ef36-4b47-9429-2221272ff15c", firstName: "Tanvi", lastName: "Gupta", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
  { studentId: "cc27a638-902b-437a-af1e-9098c274fc70", firstName: "Aditi", lastName: "Singh", classId: "c7b5da49-be27-4b3c-9dc5-b21e3629e70b" },
  { studentId: "348a7f6f-f7ff-4f28-bb49-9a778fe7cd97", firstName: "Nikhil", lastName: "Mehta", classId: "49812877-2c5c-4920-b566-7e2532997e6f" },
  { studentId: "ecb9c2b1-9ba6-4242-81fa-dd07bdf19f19", firstName: "Pooja", lastName: "Iyer", classId: "8e308a71-c379-4d30-adf2-099bca9112e9" },
  { studentId: "a14ac154-7a88-48d0-bc43-92f804a3d12d", firstName: "Riya", lastName: "Shetty", classId: "4639adea-f65b-4648-9762-aa7a83081f30" },
  { studentId: "f1b93922-16dd-42b9-8a12-9c687ddfd7a0", firstName: "Pooja", lastName: "Rao", classId: "4639adea-f65b-4648-9762-aa7a83081f30" },
  { studentId: "4e722518-a9a9-4479-bf45-88e3006aa452", firstName: "Pooja", lastName: "Shetty", classId: "c7b5da49-be27-4b3c-9dc5-b21e3629e70b" },
];

class BulkDataGenerator {
  constructor() {
    this.invoices = [];
    this.payments = [];
    this.counter = 0;
  }

  generateUUID() {
    return crypto.randomUUID();
  }

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

  getFeeAmount(classId) {
    // Fee structure based on class level
    const classMap = {
      "6429d462-e58c-416d-8cdc-5adf6ac6401c": 3000, // Nursery
      "f2ff6ae0-8815-4622-af47-b7136664e73f": 3500, // LKG
      "2506e17f-c6b3-410a-867c-71c2694dc537": 4000, // UKG
      "4aa1f3f1-7342-47cf-ab4a-6db6c4df3f86": 4500, // Class 1
      "4639adea-f65b-4648-9762-aa7a83081f30": 5000, // Class 2
      "2c29718d-9bab-4ebf-a585-42805e2422cd": 5500, // Class 3
      "83e65f94-662a-490f-b872-9888b1d7e52d": 6000, // Class 4
      "49812877-2c5c-4920-b566-7e2532997e6f": 6500, // Class 5
      "add38914-5638-4a64-8e29-1fb52a1e3f1e": 7000, // Class 6
      "8e308a71-c379-4d30-adf2-099bca9112e9": 7500, // Class 7
      "db27e7c3-45a6-4cf2-801a-aed0b754c0bc": 8000, // Class 8
      "610d2e86-0689-4c10-abd2-a52861fa550b": 8500, // Class 9
      "c7b5da49-be27-4b3c-9dc5-b21e3629e70b": 9000  // Class 10
    };
    
    return classMap[classId] || 5000;
  }

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

  generateBulkData() {
    console.log('🏫 Generating bulk invoice and payment data...');
    
    let invoiceCount = 0;
    let paymentCount = 0;

    for (const student of STUDENTS) {
      const baseFee = this.getFeeAmount(student.classId);
      const useMonthlyBilling = Math.random() < 0.7; // 70% monthly, 30% quarterly

      if (useMonthlyBilling) {
        // Monthly billing pattern
        for (let month = 4; month <= 12; month++) {
          if (Math.random() < 0.9) { // 90% completion rate
            const period = PERIODS.find(p => p.month === month && !p.period.includes('Term'));
            if (period) {
              const invoice = this.createInvoice(student, period, baseFee);
              this.invoices.push(invoice);
              invoiceCount++;

              // Generate payments for this invoice
              const invoicePayments = this.createPaymentsForInvoice(invoice);
              this.payments.push(...invoicePayments);
              paymentCount += invoicePayments.length;
            }
          }
        }
      } else {
        // Quarterly/Term billing
        const termPeriods = PERIODS.filter(p => p.period.includes('Term'));
        for (const period of termPeriods) {
          if (Math.random() < 0.85) { // 85% completion rate
            const termFee = baseFee * 3; // 3 months per term
            const invoice = this.createInvoice(student, period, termFee);
            this.invoices.push(invoice);
            invoiceCount++;

            const invoicePayments = this.createPaymentsForInvoice(invoice);
            this.payments.push(...invoicePayments);
            paymentCount += invoicePayments.length;
          }
        }
      }
    }

    console.log(`✅ Generated ${invoiceCount} invoices and ${paymentCount} payments`);
    return { invoices: this.invoices, payments: this.payments };
  }

  createInvoice(student, period, amount) {
    const dueDate = new Date(2024, period.month - 1, period.dueDay);
    
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

  generateReport() {
    console.log('\n📊 BULK DATA GENERATION REPORT');
    console.log('==============================');
    console.log(`📚 Students Processed: ${STUDENTS.length}`);
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

    console.log('\n✅ Bulk Data Generation Complete!');
  }

  // Export data for SQL insertion
  exportForBulkInsert() {
    const invoiceInserts = this.invoices.map(inv => 
      `INSERT INTO Invoice (id, studentId, period, dueDate, amount, status, branchId) VALUES ('${inv.id}', '${inv.studentId}', '${inv.period}', '${inv.dueDate}', ${inv.amount}, '${inv.status}', '${inv.branchId}');`
    ).join('\n');

    const paymentInserts = this.payments.map(pay => 
      `INSERT INTO Payment (id, branchId, invoiceId, gateway, amount, status, reference, method, createdAt, updatedAt) VALUES ('${pay.id}', '${pay.branchId}', '${pay.invoiceId}', '${pay.gateway}', ${pay.amount}, '${pay.status}', '${pay.reference}', '${pay.method}', '${pay.createdAt}', '${pay.updatedAt}');`
    ).join('\n');

    return { invoiceInserts, paymentInserts };
  }
}

// Execute the generator
const generator = new BulkDataGenerator();
const data = generator.generateBulkData();
generator.generateReport();

// Export the SQL statements
const sqlStatements = generator.exportForBulkInsert();
console.log('\n📄 SQL statements generated for bulk insertion');
console.log(`Invoice statements: ${generator.invoices.length}`);
console.log(`Payment statements: ${generator.payments.length}`);

// Return data for further processing
module.exports = { generator, data, sqlStatements };