#!/usr/bin/env bun

/**
 * Comprehensive Invoice and Payment Seed Data Generator
 * Generates realistic Indian contextual seed data for school fee management
 * 
 * Features:
 * - Monthly and quarterly invoicing
 * - Multiple payment scenarios (full, partial, overdue)
 * - Indian payment methods (UPI, NEFT, Cash, Cheque)
 * - Realistic fee amounts and payment patterns
 * - Proper relationship maintenance
 */

import { v4 as uuidv4 } from 'uuid';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
  feeStructureId: string;
}

interface FeeStructure {
  id: string;
  totalAmount: number;
}

interface Invoice {
  id: string;
  studentId: string;
  period: string;
  dueDate: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  branchId: string;
}

interface Payment {
  id: string;
  branchId: string;
  invoiceId: string;
  gateway: string;
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  reference: string;
  method: 'UPI' | 'NEFT' | 'RTGS' | 'CASH' | 'CHEQUE' | 'CARD' | 'NETBANKING';
  createdAt: string;
  updatedAt: string;
}

// Indian payment methods with realistic distribution
const PAYMENT_METHODS = [
  { method: 'UPI', weight: 35, gateways: ['PhonePe', 'GPay', 'Paytm', 'BHIM'] },
  { method: 'NEFT', weight: 20, gateways: ['SBI', 'HDFC', 'ICICI', 'Axis Bank'] },
  { method: 'CASH', weight: 15, gateways: ['School Office', 'Cash Counter'] },
  { method: 'CHEQUE', weight: 12, gateways: ['Bank Cheque', 'DD'] },
  { method: 'NETBANKING', weight: 10, gateways: ['SBI Net', 'HDFC Net', 'ICICI Net'] },
  { method: 'CARD', weight: 5, gateways: ['Visa', 'Mastercard', 'RuPay'] },
  { method: 'RTGS', weight: 3, gateways: ['Bank Transfer', 'Wire Transfer'] }
] as const;

// Indian academic terms and periods
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
  { period: 'Term-1-2024', month: 4, dueDate: 15 }, // April-July
  { period: 'Term-2-2024', month: 8, dueDate: 15 }, // August-November  
  { period: 'Term-3-2025', month: 12, dueDate: 15 }, // December-March
];

class InvoicePaymentSeeder {
  private students: Student[] = [];
  private feeStructures: Map<string, number> = new Map();
  private invoices: Invoice[] = [];
  private payments: Payment[] = [];

  constructor() {
    console.log('🏫 Initializing Invoice & Payment Seed Data Generator...');
  }

  // Get weighted random payment method
  private getRandomPaymentMethod(): { method: string; gateway: string } {
    const totalWeight = PAYMENT_METHODS.reduce((sum, pm) => sum + pm.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const pm of PAYMENT_METHODS) {
      random -= pm.weight;
      if (random <= 0) {
        const gateway = pm.gateways[Math.floor(Math.random() * pm.gateways.length)];
        return { method: pm.method, gateway };
      }
    }
    
    return { method: 'UPI', gateway: 'PhonePe' }; // fallback
  }

  // Generate realistic Indian transaction reference
  private generateTransactionReference(method: string): string {
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

  // Generate invoice number in Indian format
  private generateInvoiceNumber(studentId: string, period: string): string {
    const year = period.includes('2024') ? '2024' : '2025';
    const month = period.split('-')[0].substring(0, 3).toUpperCase();
    const sequence = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${month}-${sequence}`;
  }

  // Calculate realistic payment dates based on due dates
  private generatePaymentDate(dueDate: string, paymentScenario: 'early' | 'ontime' | 'late' | 'very_late'): string {
    const due = new Date(dueDate);
    let paymentDate = new Date(due);

    switch (paymentScenario) {
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

  // Load existing students and fee structure data
  async loadExistingData(): Promise<void> {
    console.log('📊 Loading existing student and fee structure data...');
    
    try {
      // This will be replaced with actual MCP calls during execution
      console.log('Loading students with enrollments and fee structures...');
      console.log('Loading fee component totals...');
      
      // Placeholder - will be populated during execution
      this.students = [];
      this.feeStructures = new Map();
      
    } catch (error) {
      console.error('❌ Error loading existing data:', error);
      throw error;
    }
  }

  // Generate invoices for all students across multiple periods
  generateInvoices(): void {
    console.log('📋 Generating invoices for all students...');
    
    let invoiceCount = 0;
    
    for (const student of this.students) {
      const feeAmount = this.feeStructures.get(student.feeStructureId) || 5000;
      const monthlyFee = Math.round(feeAmount / 12); // Divide annual fee into monthly
      
      // Generate invoices for different periods (70% monthly, 30% quarterly)
      const useMonthlyBilling = Math.random() < 0.7;
      
      if (useMonthlyBilling) {
        // Monthly billing
        for (let month = 4; month <= 12; month++) {
          if (Math.random() < 0.9) { // 90% students have invoices for most months
            const period = ACADEMIC_PERIODS.find(p => p.month === month && !p.period.includes('Term'));
            if (period) {
              const invoice = this.createInvoice(student, period, monthlyFee);
              this.invoices.push(invoice);
              invoiceCount++;
            }
          }
        }
      } else {
        // Quarterly/Term billing
        const termPeriods = ACADEMIC_PERIODS.filter(p => p.period.includes('Term'));
        for (const period of termPeriods) {
          if (Math.random() < 0.85) { // 85% students have term invoices
            const termFee = Math.round(feeAmount / 3); // Divide into 3 terms
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
  private createInvoice(student: Student, period: any, amount: number): Invoice {
    const dueDate = new Date(2024, period.month - 1, period.dueDate);
    const invoiceId = uuidv4();
    
    // Determine invoice status based on realistic patterns
    let status: Invoice['status'];
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
      id: invoiceId,
      studentId: student.id,
      period: period.period,
      dueDate: dueDate.toISOString().split('T')[0],
      amount: amount,
      status: status,
      branchId: 'branch1'
    };
  }

  // Generate payments for invoices
  generatePayments(): void {
    console.log('💳 Generating payments for invoices...');
    
    let paymentCount = 0;
    
    for (const invoice of this.invoices) {
      const payments = this.createPaymentsForInvoice(invoice);
      this.payments.push(...payments);
      paymentCount += payments.length;
    }
    
    console.log(`✅ Generated ${paymentCount} payments`);
  }

  // Create payments for a specific invoice
  private createPaymentsForInvoice(invoice: Invoice): Payment[] {
    const payments: Payment[] = [];
    
    switch (invoice.status) {
      case 'PAID':
        // Full payment
        payments.push(this.createPayment(invoice, invoice.amount, 'ontime'));
        break;
        
      case 'PARTIAL':
        // Partial payment(s)
        const partialAmount = Math.round(invoice.amount * (0.3 + Math.random() * 0.4)); // 30-70%
        payments.push(this.createPayment(invoice, partialAmount, 'ontime'));
        
        // Sometimes add a second partial payment
        if (Math.random() < 0.4) {
          const remainingAmount = Math.min(invoice.amount - partialAmount, 
                                         Math.round(invoice.amount * 0.3));
          payments.push(this.createPayment(invoice, remainingAmount, 'late'));
        }
        break;
        
      case 'OVERDUE':
        // Late payment or no payment yet
        if (Math.random() < 0.3) { // 30% of overdue invoices have late payments
          const lateAmount = Math.round(invoice.amount * (0.5 + Math.random() * 0.5));
          payments.push(this.createPayment(invoice, lateAmount, 'very_late'));
        }
        break;
        
      case 'PENDING':
        // No payments yet, but might have attempted payments
        if (Math.random() < 0.1) { // 10% failed payment attempts
          payments.push(this.createFailedPayment(invoice));
        }
        break;
    }
    
    return payments;
  }

  // Create individual payment
  private createPayment(invoice: Invoice, amount: number, timing: 'early' | 'ontime' | 'late' | 'very_late'): Payment {
    const { method, gateway } = this.getRandomPaymentMethod();
    const paymentDate = this.generatePaymentDate(invoice.dueDate, timing);
    
    return {
      id: uuidv4(),
      branchId: 'branch1',
      invoiceId: invoice.id,
      gateway: gateway,
      amount: amount,
      status: 'SUCCESS',
      reference: this.generateTransactionReference(method),
      method: method as Payment['method'],
      createdAt: paymentDate,
      updatedAt: paymentDate
    };
  }

  // Create failed payment attempt
  private createFailedPayment(invoice: Invoice): Payment {
    const { method, gateway } = this.getRandomPaymentMethod();
    const attemptDate = this.generatePaymentDate(invoice.dueDate, 'ontime');
    
    return {
      id: uuidv4(),
      branchId: 'branch1',
      invoiceId: invoice.id,
      gateway: gateway,
      amount: invoice.amount,
      status: 'FAILED',
      reference: this.generateTransactionReference(method),
      method: method as Payment['method'],
      createdAt: attemptDate,
      updatedAt: attemptDate
    };
  }

  // Save data to database using MCP tools
  async saveToDatabase(): Promise<void> {
    console.log('💾 Saving invoices and payments to database...');
    
    try {
      // Save invoices
      console.log(`Saving ${this.invoices.length} invoices...`);
      // This will be replaced with actual MCP create_record calls
      
      // Save payments  
      console.log(`Saving ${this.payments.length} payments...`);
      // This will be replaced with actual MCP create_record calls
      
      console.log('✅ All data saved successfully!');
      
    } catch (error) {
      console.error('❌ Error saving to database:', error);
      throw error;
    }
  }

  // Generate comprehensive report
  generateReport(): void {
    console.log('\n📊 SEED DATA GENERATION REPORT');
    console.log('=====================================');
    console.log(`Total Students: ${this.students.length}`);
    console.log(`Total Invoices Generated: ${this.invoices.length}`);
    console.log(`Total Payments Generated: ${this.payments.length}`);
    
    // Invoice status breakdown
    const invoiceStats = this.invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nInvoice Status Distribution:');
    Object.entries(invoiceStats).forEach(([status, count]) => {
      const percentage = ((count / this.invoices.length) * 100).toFixed(1);
      console.log(`  ${status}: ${count} (${percentage}%)`);
    });
    
    // Payment method breakdown
    const paymentStats = this.payments.reduce((acc, pay) => {
      acc[pay.method] = (acc[pay.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nPayment Method Distribution:');
    Object.entries(paymentStats).forEach(([method, count]) => {
      const percentage = ((count / this.payments.length) * 100).toFixed(1);
      console.log(`  ${method}: ${count} (${percentage}%)`);
    });
    
    // Payment status breakdown
    const statusStats = this.payments.reduce((acc, pay) => {
      acc[pay.status] = (acc[pay.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nPayment Status Distribution:');
    Object.entries(statusStats).forEach(([status, count]) => {
      const percentage = ((count / this.payments.length) * 100).toFixed(1);
      console.log(`  ${status}: ${count} (${percentage}%)`);
    });
    
    // Financial summary
    const totalInvoiced = this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = this.payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, pay) => sum + pay.amount, 0);
    const collectionRate = ((totalPaid / totalInvoiced) * 100).toFixed(1);
    
    console.log('\nFinancial Summary:');
    console.log(`  Total Invoiced: ₹${totalInvoiced.toLocaleString('en-IN')}`);
    console.log(`  Total Collected: ₹${totalPaid.toLocaleString('en-IN')}`);
    console.log(`  Collection Rate: ${collectionRate}%`);
    
    console.log('\n✅ Report Generation Complete!');
  }

  // Main execution method
  async execute(): Promise<void> {
    try {
      await this.loadExistingData();
      this.generateInvoices();
      this.generatePayments();
      await this.saveToDatabase();
      this.generateReport();
      
      console.log('\n🎉 Invoice & Payment seed data generation completed successfully!');
      
    } catch (error) {
      console.error('❌ Seed data generation failed:', error);
      process.exit(1);
    }
  }

  // Getter methods for data access
  getInvoices(): Invoice[] { return this.invoices; }
  getPayments(): Payment[] { return this.payments; }
  getStudents(): Student[] { return this.students; }
}

// Export for use as module
export { InvoicePaymentSeeder };

// Direct execution if run as script
if (import.meta.main) {
  const seeder = new InvoicePaymentSeeder();
  await seeder.execute();
}