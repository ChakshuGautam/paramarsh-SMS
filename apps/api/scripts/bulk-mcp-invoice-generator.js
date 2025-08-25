#!/usr/bin/env node

/**
 * MCP-based Bulk Invoice and Payment Generator
 * Creates large volumes of realistic data using batch operations
 */

const crypto = require('crypto');

// Fee amounts by class
const CLASS_FEES = {
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

// Payment methods with Indian context
const PAYMENT_METHODS = [
  { method: 'UPI', weight: 35, gateways: ['PhonePe', 'GPay', 'Paytm', 'BHIM UPI', 'Amazon Pay', 'Google Pay'] },
  { method: 'NEFT', weight: 20, gateways: ['SBI Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'PNB', 'Kotak'] },
  { method: 'CASH', weight: 15, gateways: ['School Office', 'Cash Counter', 'Admin Office', 'Fee Counter'] },
  { method: 'CHEQUE', weight: 12, gateways: ['Bank Cheque', 'Demand Draft', 'Pay Order', 'Banker Cheque'] },
  { method: 'NETBANKING', weight: 10, gateways: ['SBI Online', 'HDFC NetBanking', 'ICICI iMobile', 'Axis Online'] },
  { method: 'CARD', weight: 5, gateways: ['Visa Card', 'Mastercard', 'RuPay Card', 'Maestro'] },
  { method: 'RTGS', weight: 3, gateways: ['Bank Transfer', 'Wire Transfer', 'Swift Transfer'] }
];

// Periods for 2024-25 academic year
const PERIODS = [
  'April-2024', 'May-2024', 'June-2024', 'July-2024', 'August-2024',
  'September-2024', 'October-2024', 'November-2024', 'December-2024',
  'Term-1-2024', 'Term-2-2024', 'Term-3-2025'
];

// Sample students from our query
const STUDENTS = [
  { studentId: "10104634-1521-4cb4-860b-4d4ee6cca740", firstName: "Yash", lastName: "Bhat", classId: "610d2e86-0689-4c10-abd2-a52861fa550b" },
  { studentId: "a91563f7-46a5-4b04-a9f3-cf6879a48dd4", firstName: "Nikhil", lastName: "Kumar", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
  { studentId: "ae3d9b42-bb50-43d9-ba2e-8be1563e9168", firstName: "Amit", lastName: "Shetty", classId: "db27e7c3-45a6-4cf2-801a-aed0b754c0bc" },
  { studentId: "32fd26c5-a326-4d80-9337-edfd8092e265", firstName: "Anika", lastName: "Shetty", classId: "610d2e86-0689-4c10-abd2-a52861fa550b" },
  { studentId: "95f355c5-7dc5-4590-ad62-e76b35517fae", firstName: "Om", lastName: "Iyer", classId: "c7b5da49-be27-4b3c-9dc5-b21e3629e70b" },
  { studentId: "ee9037ec-dae4-4898-9ca9-5ad39332c1ce", firstName: "Arjun", lastName: "Desai", classId: "83e65f94-662a-490f-b872-9888b1d7e52d" },
  { studentId: "9eb661d9-0fd8-4fa7-815e-ed6981fa6923", firstName: "Saanvi", lastName: "Jain", classId: "49812877-2c5c-4920-b566-7e2532997e6f" },
  { studentId: "c7aa1219-9cf1-4a38-93fe-6954f32c52b8", firstName: "Vihaan", lastName: "Singh", classId: "49812877-2c5c-4920-b566-7e2532997e6f" },
  { studentId: "00af9c17-f6d0-43d9-9dec-c6d4527f1aab", firstName: "Meera", lastName: "Bhat", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
  { studentId: "b28f0492-96c6-4dd9-99d3-71c96c6ea13b", firstName: "Yash", lastName: "Naidu", classId: "610d2e86-0689-4c10-abd2-a52861fa550b" },
  { studentId: "49530d18-754d-4154-93b1-7991ea4189da", firstName: "Arjun", lastName: "Shah", classId: "8e308a71-c379-4d30-adf2-099bca9112e9" },
  { studentId: "8b755d2f-f877-49f0-96c3-4cf862001fda", firstName: "Ayaan", lastName: "Agarwal", classId: "db27e7c3-45a6-4cf2-801a-aed0b754c0bc" },
  { studentId: "40843a99-51b0-450c-aa4b-4e0131e161b5", firstName: "Meera", lastName: "Nair", classId: "4aa1f3f1-7342-47cf-ab4a-6db6c4df3f86" },
  { studentId: "5aa06371-5858-4e31-a09f-bdc2a8818044", firstName: "Om", lastName: "Agarwal", classId: "83e65f94-662a-490f-b872-9888b1d7e52d" },
  { studentId: "c1b9fe40-6cb3-45f7-9516-dda99edd15ce", firstName: "Vikram", lastName: "Pillai", classId: "add38914-5638-4a64-8e29-1fb52a1e3f1e" },
  { studentId: "a497f468-464d-4e34-a4f2-7ae318b7b9f7", firstName: "Diya", lastName: "Patel", classId: "610d2e86-0689-4c10-abd2-a52861fa550b" },
  { studentId: "dce6b735-cdf9-4d93-863a-830c21a18a61", firstName: "Arjun", lastName: "Rao", classId: "610d2e86-0689-4c10-abd2-a52861fa550b" },
  { studentId: "12823e97-6059-4b2c-ac68-2dee06d59822", firstName: "Riya", lastName: "Iyer", classId: "8e308a71-c379-4d30-adf2-099bca9112e9" },
  { studentId: "818849fa-c839-426b-a0a7-2587a499f44a", firstName: "Neha", lastName: "Desai", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
  { studentId: "f067edfd-2351-40aa-8aa8-b1a47e1e08ed", firstName: "Sakshi", lastName: "Nair", classId: "2c29718d-9bab-4ebf-a585-42805e2422cd" },
  { studentId: "5b288c97-2a73-4397-bcf2-0ca5cda5547c", firstName: "Tanvi", lastName: "Rao", classId: "6429d462-e58c-416d-8cdc-5adf6ac6401c" },
  { studentId: "3029a1ba-db29-4191-a2f2-889dcea600d8", firstName: "Sai", lastName: "Naidu", classId: "8e308a71-c379-4d30-adf2-099bca9112e9" },
  { studentId: "a21b9acc-875c-4fef-bd8e-38526f30bfe8", firstName: "Nikhil", lastName: "Desai", classId: "2506e17f-c6b3-410a-867c-71c2694dc537" },
  { studentId: "45690614-72f9-4fac-ba08-f30ed12aeda3", firstName: "Aarav", lastName: "Shah", classId: "8e308a71-c379-4d30-adf2-099bca9112e9" },
  { studentId: "89a38b48-6e37-405a-857d-5a25f8917ccf", firstName: "Pooja", lastName: "Bhat", classId: "c7b5da49-be27-4b3c-9dc5-b21e3629e70b" },
];

class BulkMCPGenerator {
  constructor() {
    this.invoiceStatements = [];
    this.paymentStatements = [];
    this.invoiceCount = 0;
    this.paymentCount = 0;
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

  generateBulkMCPStatements() {
    console.log('🏫 Generating bulk MCP insert statements...');

    for (const student of STUDENTS) {
      const baseFee = CLASS_FEES[student.classId] || 5000;
      const useMonthlyBilling = Math.random() < 0.7;

      if (useMonthlyBilling) {
        // Monthly billing
        const monthlyPeriods = PERIODS.filter(p => !p.includes('Term'));
        for (const period of monthlyPeriods) {
          if (Math.random() < 0.9) {
            this.createInvoiceAndPayments(student, period, baseFee);
          }
        }
      } else {
        // Term billing
        const termPeriods = PERIODS.filter(p => p.includes('Term'));
        for (const period of termPeriods) {
          if (Math.random() < 0.85) {
            const termFee = baseFee * 3;
            this.createInvoiceAndPayments(student, period, termFee);
          }
        }
      }
    }

    console.log(`✅ Generated ${this.invoiceCount} invoices and ${this.paymentCount} payments`);
  }

  createInvoiceAndPayments(student, period, amount) {
    const invoiceId = this.generateUUID();
    const dueDate = this.getDueDate(period);
    
    // Determine invoice status
    const statusRandom = Math.random();
    let status;
    if (statusRandom < 0.6) status = 'PAID';
    else if (statusRandom < 0.75) status = 'PARTIAL';
    else if (statusRandom < 0.9) status = 'PENDING';
    else status = 'OVERDUE';

    // Create invoice statement
    const invoiceStatement = {
      id: invoiceId,
      studentId: student.studentId,
      period: period,
      dueDate: dueDate,
      amount: amount,
      status: status,
      branchId: 'branch1'
    };

    this.invoiceStatements.push(invoiceStatement);
    this.invoiceCount++;

    // Create corresponding payments
    this.createPaymentStatements(invoiceStatement);
  }

  createPaymentStatements(invoice) {
    switch (invoice.status) {
      case 'PAID':
        this.addPaymentStatement(invoice, invoice.amount, 'SUCCESS', 'ontime');
        break;
        
      case 'PARTIAL':
        const partialAmount = Math.round(invoice.amount * (0.3 + Math.random() * 0.4));
        this.addPaymentStatement(invoice, partialAmount, 'SUCCESS', 'ontime');
        
        if (Math.random() < 0.4) {
          const remainingAmount = Math.min(invoice.amount - partialAmount, 
                                         Math.round(invoice.amount * 0.3));
          this.addPaymentStatement(invoice, remainingAmount, 'SUCCESS', 'late');
        }
        break;
        
      case 'OVERDUE':
        if (Math.random() < 0.3) {
          const lateAmount = Math.round(invoice.amount * (0.5 + Math.random() * 0.5));
          this.addPaymentStatement(invoice, lateAmount, 'SUCCESS', 'very_late');
        }
        break;
        
      case 'PENDING':
        if (Math.random() < 0.1) {
          this.addPaymentStatement(invoice, invoice.amount, 'FAILED', 'ontime');
        }
        break;
    }
  }

  addPaymentStatement(invoice, amount, status, timing) {
    const { method, gateway } = this.getRandomPaymentMethod();
    const paymentDate = this.getPaymentDate(invoice.dueDate, timing);

    const paymentStatement = {
      id: this.generateUUID(),
      branchId: 'branch1',
      invoiceId: invoice.id,
      gateway: gateway,
      amount: amount,
      status: status,
      reference: this.generateTransactionReference(method),
      method: method,
      createdAt: paymentDate,
      updatedAt: paymentDate
    };

    this.paymentStatements.push(paymentStatement);
    this.paymentCount++;
  }

  getDueDate(period) {
    if (period.includes('Term-1')) return '2024-04-15';
    if (period.includes('Term-2')) return '2024-08-15';
    if (period.includes('Term-3')) return '2024-12-15';
    
    const monthMap = {
      'April-2024': '2024-04-10',
      'May-2024': '2024-05-10',
      'June-2024': '2024-06-10',
      'July-2024': '2024-07-10',
      'August-2024': '2024-08-10',
      'September-2024': '2024-09-10',
      'October-2024': '2024-10-10',
      'November-2024': '2024-11-10',
      'December-2024': '2024-12-10'
    };
    
    return monthMap[period] || '2024-04-10';
  }

  getPaymentDate(dueDate, timing) {
    const due = new Date(dueDate);
    let paymentDate = new Date(due);

    switch (timing) {
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

  generateReport() {
    console.log('\n📊 BULK MCP GENERATION REPORT');
    console.log('==============================');
    console.log(`📚 Students Processed: ${STUDENTS.length}`);
    console.log(`📋 Invoice Statements: ${this.invoiceStatements.length}`);
    console.log(`💳 Payment Statements: ${this.paymentStatements.length}`);

    // Status distribution
    const statusCounts = this.invoiceStatements.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Invoice Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = ((count / this.invoiceStatements.length) * 100).toFixed(1);
      console.log(`  ${status}: ${count} (${percentage}%)`);
    });

    // Payment method distribution
    const methodCounts = this.paymentStatements.reduce((acc, pay) => {
      acc[pay.method] = (acc[pay.method] || 0) + 1;
      return acc;
    }, {});

    console.log('\n💳 Payment Method Distribution:');
    Object.entries(methodCounts).forEach(([method, count]) => {
      const percentage = ((count / this.paymentStatements.length) * 100).toFixed(1);
      console.log(`  ${method}: ${count} (${percentage}%)`);
    });

    // Financial summary
    const totalInvoiced = this.invoiceStatements.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = this.paymentStatements
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, pay) => sum + pay.amount, 0);
    const collectionRate = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : '0.0';

    console.log('\n💰 Financial Summary:');
    console.log(`  Total Invoiced: ₹${totalInvoiced.toLocaleString('en-IN')}`);
    console.log(`  Total Collected: ₹${totalPaid.toLocaleString('en-IN')}`);
    console.log(`  Collection Rate: ${collectionRate}%`);
    console.log(`  Outstanding: ₹${(totalInvoiced - totalPaid).toLocaleString('en-IN')}`);

    console.log('\n✅ MCP Statement Generation Complete!');
  }

  // Get data for MCP operations
  getStatements() {
    return {
      invoices: this.invoiceStatements,
      payments: this.paymentStatements
    };
  }
}

// Execute generator
const generator = new BulkMCPGenerator();
generator.generateBulkMCPStatements();
generator.generateReport();

console.log('\n📄 Ready for MCP-based database insertion');
console.log('Use the returned statements for MCP PostgreSQL Server operations');

module.exports = { generator };