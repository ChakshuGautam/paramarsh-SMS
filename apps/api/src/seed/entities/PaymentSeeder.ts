/**
 * PaymentSeeder Entity
 * Creates payment records for invoices
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class PaymentSeeder extends BaseSeeder {
  public entityName = 'payments';
  public dependencies = ['invoices']; 
  public priority = 74; // After invoices

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const payments: any[] = [];
    const errors: string[] = [];

    try {
      // Check if payments already exist
      const existingPayments = await context.prisma.payment.findMany({
        where: { branchId: context.branchId },
        take: 1
      });
      
      if (existingPayments.length > 0) {
        // Payments already exist
        context.createdEntities.set('payments', existingPayments);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
            duration: Date.now() - startTime
          }
        };
      }

      // Get paid invoices to create payments for
      const paidInvoices = await context.prisma.invoice.findMany({
        where: { 
          branchId: context.branchId,
          status: 'paid'
        },
        include: {
          student: true
        }
      });

      if (paidInvoices.length === 0) {
        // No paid invoices, nothing to do
        context.createdEntities.set('payments', []);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
            duration: Date.now() - startTime
          }
        };
      }

      let paymentCounter = 1;
      const currentYear = new Date().getFullYear();

      // Create payments for paid invoices
      for (const invoice of paidInvoices) {
        try {
          // Check if payment already exists for this invoice
          const existingPayment = await context.prisma.payment.findFirst({
            where: { invoiceId: invoice.id }
          });

          if (existingPayment) {
            payments.push(existingPayment);
            continue;
          }

          // Generate payment details
          const paymentMethod = this.getPaymentMethod();
          const gateway = this.getPaymentGateway(paymentMethod);
          
          // Generate unique reference number
          const reference = `PAY-${context.branchId.toUpperCase()}-${currentYear}-${String(paymentCounter).padStart(6, '0')}`;
          paymentCounter++;

          const payment = await context.prisma.payment.create({
            data: {
              branchId: context.branchId,
              invoiceId: invoice.id,
              gateway: gateway,
              amount: invoice.amount || 0,
              status: 'completed',
              reference: reference,
              method: paymentMethod,
              createdAt: this.generatePaymentDate(invoice.dueDate)
            }
          });

          payments.push(payment);

        } catch (error) {
          const errorMsg = `Failed to create payment for invoice ${invoice.id}: ${error}`;
          errors.push(errorMsg);
        }
      }

      // Create partial payments for some pending invoices
      const pendingInvoices = await context.prisma.invoice.findMany({
        where: { 
          branchId: context.branchId,
          status: 'pending'
        },
        take: 10 // Create partial payments for 10 pending invoices
      });

      for (const invoice of pendingInvoices) {
        try {
          // 30% chance of having a partial payment
          if (Math.random() > 0.3) continue;

          // Check if payment already exists
          const existingPayment = await context.prisma.payment.findFirst({
            where: { invoiceId: invoice.id }
          });

          if (existingPayment) {
            payments.push(existingPayment);
            continue;
          }

          const paymentMethod = this.getPaymentMethod();
          const gateway = this.getPaymentGateway(paymentMethod);
          
          // Generate unique reference
          const reference = `PAY-${context.branchId.toUpperCase()}-${currentYear}-${String(paymentCounter).padStart(6, '0')}`;
          paymentCounter++;

          // Partial payment (30-70% of invoice amount)
          const partialAmount = Math.floor((invoice.amount || 0) * (0.3 + Math.random() * 0.4));

          const payment = await context.prisma.payment.create({
            data: {
              branchId: context.branchId,
              invoiceId: invoice.id,
              gateway: gateway,
              amount: partialAmount,
              status: 'completed',
              reference: reference,
              method: paymentMethod
            }
          });

          payments.push(payment);

        } catch (error) {
          const errorMsg = `Failed to create partial payment for invoice ${invoice.id}: ${error}`;
          errors.push(errorMsg);
        }
      }

      // Store created payments in context
      context.createdEntities.set('payments', payments);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: payments.length,
          successCount: payments.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: payments,
        errors: errors.length > 0 ? errors.map(e => typeof e === "string" ? new Error(e) : e) : [],
        warnings: []
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        errors: [new Error(`Critical error in PaymentSeeder: ${error}`)],
        data: [],
        warnings: []
      };
    }
  }

  /**
   * Get a random payment method
   */
  private getPaymentMethod(): string {
    const methods = [
      'online_banking',
      'credit_card',
      'debit_card',
      'upi',
      'cash',
      'cheque',
      'neft',
      'rtgs'
    ];
    
    // UPI is most common in India
    const weights = [0.15, 0.1, 0.15, 0.35, 0.1, 0.05, 0.05, 0.05];
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < methods.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return methods[i];
      }
    }
    
    return 'upi'; // Default
  }

  /**
   * Get payment gateway based on method
   */
  private getPaymentGateway(method: string): string {
    const gateways: Record<string, string[]> = {
      'online_banking': ['razorpay', 'paytm', 'phonepe'],
      'credit_card': ['razorpay', 'stripe', 'paytm'],
      'debit_card': ['razorpay', 'paytm', 'phonepe'],
      'upi': ['gpay', 'phonepe', 'paytm', 'bhim'],
      'cash': ['manual'],
      'cheque': ['manual'],
      'neft': ['bank_transfer'],
      'rtgs': ['bank_transfer']
    };
    
    const availableGateways = gateways[method] || ['manual'];
    return availableGateways[Math.floor(Math.random() * availableGateways.length)];
  }

  /**
   * Generate a payment date based on due date
   */
  private generatePaymentDate(dueDate: string | null): Date {
    if (!dueDate) {
      // If no due date, payment was made recently
      const daysAgo = Math.floor(Math.random() * 30);
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - daysAgo);
      return paymentDate;
    }
    
    // Payment made around due date (before or slightly after)
    const dueDateObj = new Date(dueDate);
    const daysDiff = Math.floor(Math.random() * 10) - 5; // -5 to +5 days from due date
    dueDateObj.setDate(dueDateObj.getDate() + daysDiff);
    return dueDateObj;
  }
}