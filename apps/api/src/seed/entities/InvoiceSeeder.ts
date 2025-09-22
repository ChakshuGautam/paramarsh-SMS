/**
 * InvoiceSeeder Entity
 * Creates invoices for students based on fee schedules
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class InvoiceSeeder extends BaseSeeder {
  public entityName = 'invoices';
  public dependencies = ['students', 'feeSchedules', 'enrollments']; 
  public priority = 73; // After fee schedules and enrollments

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const invoices: any[] = [];
    const errors: string[] = [];

    try {
      // Check if invoices already exist
      const existingInvoices = await context.prisma.invoice.findMany({
        where: { branchId: context.branchId },
        take: 1
      });
      
      if (existingInvoices.length > 0) {
        // Invoices already exist
        context.createdEntities.set('invoices', existingInvoices);
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

      // Get students
      const students = await context.prisma.student.findMany({
        where: { branchId: context.branchId }
      });

      if (students.length === 0) {
        throw new Error('No students found');
      }

      // Get fee schedules
      const schedules = await context.prisma.feeSchedule.findMany({
        where: { branchId: context.branchId },
        include: {
          feeStructure: {
            include: {
              components: true
            }
          }
        }
      });

      console.log(`Found ${schedules.length} fee schedules for branch ${context.branchId}`);
      
      if (schedules.length === 0) {
        console.log('No fee schedules found, returning early');
        // Return success with 0 records instead of throwing error
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

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      let invoiceCounter = 1;

      // Create invoices for each student based on schedules
      for (const student of students.slice(0, 100)) { // Limit to 100 students for testing
        try {
          // Get the class for this student
          const enrollment = await context.prisma.enrollment.findFirst({
            where: { 
              studentId: student.id,
              status: 'active'
            },
            include: {
              section: {
                include: {
                  class: true
                }
              }
            }
          });

          if (!enrollment) continue;

          // Find applicable fee schedule for student's class
          const applicableSchedule = schedules.find(schedule => {
            const matches = schedule.feeStructure?.gradeId === enrollment.section.classId;  // Use classId 
            if (!matches && students.indexOf(student) === 0) {
              console.log(`No match: schedule.feeStructure?.gradeId=${schedule.feeStructure?.gradeId}, section.classId=${enrollment.section.classId}`);
            }
            return matches;
          });

          if (!applicableSchedule) {
            if (students.indexOf(student) < 3) {
              console.log(`No applicable schedule for student ${student.id}, class ID: ${enrollment.section.classId}`);
            }
            continue;
          }

          // Generate invoices based on schedule type
          const invoicesToCreate = this.generateInvoicesForSchedule(
            applicableSchedule,
            currentYear,
            currentMonth
          );

          for (const invoiceData of invoicesToCreate) {
            // Check if invoice already exists for this period
            const existingInvoice = await context.prisma.invoice.findUnique({
              where: {
                studentId_period: {
                  studentId: student.id,
                  period: invoiceData.period
                }
              }
            });

            if (existingInvoice) {
              invoices.push(existingInvoice);
              continue;
            }

            // Calculate total amount from components or use default
            let totalAmount = 0;
            if (applicableSchedule.feeStructure?.components?.length > 0) {
              totalAmount = applicableSchedule.feeStructure.components.reduce(
                (sum, component) => {
                  // Include mandatory components and some optional ones
                  if (component.type === 'mandatory' || Math.random() > 0.5) {
                    return sum + (component.amount || 0);
                  }
                  return sum;
                },
                0
              );
            } else {
              // Use totalAmount from schedule or generate default
              totalAmount = applicableSchedule.totalAmount || this.generateDefaultAmount(applicableSchedule);
            }

            // Generate invoice number
            const invoiceNumber = `INV-${context.branchId.toUpperCase()}-${currentYear}-${String(invoiceCounter).padStart(5, '0')}`;
            invoiceCounter++;

            const invoice = await context.prisma.invoice.create({
              data: {
                branchId: context.branchId,
                invoiceNumber: invoiceNumber,
                studentId: student.id,
                period: invoiceData.period,
                dueDate: invoiceData.dueDate,
                amount: totalAmount,
                status: invoiceData.status
              }
            });

            invoices.push(invoice);
          }

        } catch (error) {
          const errorMsg = `Failed to create invoices for student ${student.id}: ${error}`;
          errors.push(errorMsg);
        }
      }

      // Store created invoices in context
      context.createdEntities.set('invoices', invoices);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: invoices.length,
          successCount: invoices.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: invoices,
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
        errors: [new Error(`Critical error in InvoiceSeeder: ${error}`)],
        data: [],
        warnings: []
      };
    }
  }

  /**
   * Generate invoices based on schedule recurrence
   */
  private generateInvoicesForSchedule(
    schedule: any,
    currentYear: number,
    currentMonth: number
  ): Array<{period: string, dueDate: string, status: string}> {
    const invoices: Array<{period: string, dueDate: string, status: string}> = [];
    
    if (schedule.recurrence === 'monthly') {
      // Generate for current and previous 2 months
      for (let i = 2; i >= 0; i--) {
        const month = currentMonth - i;
        const year = month <= 0 ? currentYear - 1 : currentYear;
        const adjustedMonth = month <= 0 ? 12 + month : month;
        
        const period = `${year}-${String(adjustedMonth).padStart(2, '0')}`;
        const dueDate = `${year}-${String(adjustedMonth).padStart(2, '0')}-${String(schedule.dueDayOfMonth || 5).padStart(2, '0')}`;
        
        // Past invoices are paid, current month pending
        const status = i === 0 ? 'pending' : Math.random() > 0.1 ? 'paid' : 'overdue';
        
        invoices.push({ period, dueDate, status });
      }
    } else if (schedule.recurrence === 'quarterly') {
      // Generate for current quarter
      const quarter = Math.floor((currentMonth - 1) / 3) + 1;
      const period = `${currentYear}-Q${quarter}`;
      const quarterStartMonth = (quarter - 1) * 3 + 1;
      const dueDate = `${currentYear}-${String(quarterStartMonth).padStart(2, '0')}-${String(schedule.dueDayOfMonth || 10).padStart(2, '0')}`;
      
      invoices.push({ 
        period, 
        dueDate, 
        status: quarter === Math.floor((currentMonth - 1) / 3) + 1 ? 'pending' : 'paid'
      });
    } else if (schedule.recurrence === 'one-time') {
      // One-time fee at start of academic year
      const period = `${currentYear}-ADMISSION`;
      const dueDate = `${currentYear}-04-${String(schedule.dueDayOfMonth || 15).padStart(2, '0')}`;
      
      invoices.push({ period, dueDate, status: 'paid' });
    }
    
    return invoices;
  }

  /**
   * Generate default amount when components are missing
   */
  private generateDefaultAmount(schedule: any): number {
    // Generate amount based on recurrence type
    if (schedule.recurrence === 'monthly') {
      return 5000 + Math.floor(Math.random() * 3000); // 5000-8000 per month
    } else if (schedule.recurrence === 'quarterly') {
      return 15000 + Math.floor(Math.random() * 10000); // 15000-25000 per quarter
    } else if (schedule.recurrence === 'annual') {
      return 60000 + Math.floor(Math.random() * 40000); // 60000-100000 per year
    } else {
      return 10000 + Math.floor(Math.random() * 5000); // 10000-15000 one-time
    }
  }
}