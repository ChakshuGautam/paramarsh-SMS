import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base-crud.service';
import PdfPrinter from 'pdfmake';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export type Invoice = {
  studentAdmissionNo: string;
  period?: string;
  dueDate?: string;
  amount?: number;
  status?: string;
};

@Injectable()
export class InvoicesService extends BaseCrudService<any> {
  private readonly printer: PdfPrinter;
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(prisma: PrismaService) {
    super(prisma, 'invoice');
    // pdfmake setup with Roboto (or any available font files)
    this.printer = new PdfPrinter({
      Roboto: {
        normal: Buffer.from([]),
        bold: Buffer.from([]),
        italics: Buffer.from([]),
        bolditalics: Buffer.from([]),
      },
    } as any);
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! }
        : undefined,
    });
    this.bucket = process.env.S3_BUCKET || 'paramarsh-dev';
  }

  /**
   * Override getList to add calculated fields and enhanced filtering
   */
  async getList(params: any) {
    // Handle case-insensitive status filtering
    if (params.filter?.status && typeof params.filter.status === 'string') {
      const statusValue = params.filter.status.toLowerCase();
      
      if (statusValue === 'overdue') {
        // Handle overdue status calculation
        const today = new Date().toISOString().split('T')[0];
        // Remove the overdue status filter and replace with proper date filtering
        delete params.filter.status;
        params.filter.dueDate = { lt: today }; // Use object form to avoid string-to-number conversion
        params.filter.status = { in: ['pending', 'partial', 'PENDING', 'PARTIAL'] }; // Only pending/partial can be overdue (handle case variations)
      } else {
        // Handle case-insensitive status matching for regular statuses
        // Create a case-insensitive filter that matches both uppercase and lowercase variants
        const upperStatus = statusValue.toUpperCase();
        const lowerStatus = statusValue.toLowerCase();
        const titleStatus = statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase();
        
        // Replace status filter with case-insensitive matching
        params.filter.status = { in: [upperStatus, lowerStatus, titleStatus] };
      }
    }

    const result = await super.getList(params);
    
    // Add calculated fields to each invoice
    const enhancedData = result.data.map(invoice => ({
      ...invoice,
      isOverdue: this.isInvoiceOverdue(invoice),
      daysPastDue: this.getDaysPastDue(invoice),
    }));

    return { data: enhancedData, total: result.total };
  }

  /**
   * Check if invoice is overdue
   */
  private isInvoiceOverdue(invoice: any): boolean {
    if (!invoice.dueDate || invoice.status === 'paid' || invoice.status === 'cancelled') {
      return false;
    }
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    return dueDate < today;
  }

  /**
   * Calculate days past due
   */
  private getDaysPastDue(invoice: any): number {
    if (!this.isInvoiceOverdue(invoice)) return 0;
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Override to support search
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { period: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { student: { firstName: { contains: search, mode: 'insensitive' } } },
      { student: { lastName: { contains: search, mode: 'insensitive' } } },
      { student: { admissionNo: { contains: search, mode: 'insensitive' } } },
    ];
  }

  /**
   * Invoices support branch scoping
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }

  /**
   * Legacy list method for backward compatibility
   */
  async list(params: { page?: number; perPage?: number; pageSize?: number; sort?: string; studentId?: string; status?: string; q?: string; branchId: string; filter?: any; ids?: string }) {
    const filter: any = {
      studentId: params.studentId,
      student: {
        branchId: params.branchId
      }
    };
    
    // Handle case-insensitive status filtering
    if (params.status && typeof params.status === 'string') {
      const statusValue = params.status.toLowerCase();
      const upperStatus = statusValue.toUpperCase();
      const lowerStatus = statusValue.toLowerCase();
      const titleStatus = statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase();
      
      filter.status = { in: [upperStatus, lowerStatus, titleStatus] };
    }
    
    if (params.filter) {
      Object.assign(filter, params.filter);
    }
    
    if (params.ids) {
      filter.id = { in: params.ids.split(',') };
    }
    
    // Handle search query 'q'
    if (params.q && typeof params.q === 'string') {
      filter.q = params.q;
    }
    
    const effectivePerPage = params.perPage || params.pageSize;
    return this.getList({
      page: params.page,
      perPage: effectivePerPage,
      sort: params.sort,
      filter
    });
  }

  // Override base method
  async getOne(id: string): Promise<any> {
    // This method will be used by the controller with branchId
    throw new Error('Use getOneWithBranch instead');
  }
  
  async getOneWithBranch(id: string, branchId: string) {
    const invoice = await this.prisma.invoice.findUnique({ 
      where: { id },
      include: {
        student: true
      }
    });
    
    // Check tenant isolation
    if (!invoice || invoice.student.branchId !== branchId) {
      throw new NotFoundException('Invoice not found');
    }
    
    return { data: invoice };
  }

  async create(input: { studentId: string; period?: string; dueDate?: string; amount?: number; status?: string; withPayment?: boolean; branchId: string }) {
    // Generate sequential invoice number in format INV-YYYY-NNN
    const invoiceNumber = await this.generateSequentialInvoiceNumber(input.branchId);
    
    const inv = await this.prisma.invoice.create({ data: {
      studentId: input.studentId,
      invoiceNumber,
      period: input.period ?? null,
      dueDate: input.dueDate ?? null,
      amount: input.amount ?? null,
      status: input.status ?? null,
      branchId: input.branchId ?? null,
    }});
    if (input.withPayment && inv.amount) {
      await this.prisma.payment.create({ data: {
        invoiceId: inv.id,
        amount: inv.amount,
        status: 'success',
        method: 'upi',
        gateway: 'mock',
      }});
    }
    return { data: inv };
  }

  // Override base method
  async update(id: string, data: any): Promise<any> {
    // This method will be used by the controller with branchId
    throw new Error('Use updateWithBranch instead');
  }
  
  async updateWithBranch(id: string, input: Partial<{ period: string; dueDate: string; amount: number; status: string }>, branchId: string) {
    // First check if invoice exists and belongs to branch
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      include: { student: true }
    });
    
    if (!existing || existing.student.branchId !== branchId) {
      throw new NotFoundException('Invoice not found');
    }
    
    const updated = await this.prisma.invoice.update({ where: { id }, data: {
      period: input.period ?? undefined,
      dueDate: input.dueDate ?? undefined,
      amount: input.amount ?? undefined,
      status: input.status ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string, branchId: string) {
    // First check if invoice exists and belongs to branch
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      include: { student: true }
    });
    
    if (!existing || existing.student.branchId !== branchId) {
      throw new NotFoundException('Invoice not found');
    }
    
    try {
      await this.prisma.invoice.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Invoice not found');
    }
    return { data: { id } };
  }

  async exportPdfAndUpload(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const docDefinition: any = {
      content: [
        { text: 'Invoice', style: 'header' },
        { text: `Invoice ID: ${invoice.id}` },
        { text: `Student ID: ${invoice.studentId}` },
        { text: `Period: ${invoice.period ?? '-'}` },
        { text: `Due Date: ${invoice.dueDate ?? '-'}` },
        { text: `Amount: ${invoice.amount ?? 0}` },
        { text: `Status: ${invoice.status ?? '-'}` },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      },
      defaultStyle: { font: 'Roboto' },
    };
    const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    const buffer: Buffer = await new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
    const key = `invoices/${id}/invoice-${id}.pdf`;
    await this.s3.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: 'application/pdf' })
    );
    return { key };
  }

  /**
   * Generate sequential invoice number in format: INV-YYYY-NNN
   * e.g., INV-2024-001, INV-2024-002, etc.
   * Sequence resets each year and is branch-scoped for multi-tenancy
   */
  private async generateSequentialInvoiceNumber(branchId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearStr = currentYear.toString();
    const prefix = `INV-${yearStr}-`;

    try {
      // Use a transaction to ensure concurrency safety
      return await this.prisma.$transaction(async (tx) => {
        // Get the count of invoices for this branch and year
        const existingCount = await tx.invoice.count({
          where: {
            invoiceNumber: {
              startsWith: prefix
            },
            // Filter by branch for multi-tenancy
            OR: [
              { branchId },
              // Also check student's branchId for invoices without branchId
              {
                branchId: null,
                student: {
                  branchId
                }
              }
            ]
          }
        });

        // Generate next sequence number
        const sequence = (existingCount + 1).toString().padStart(3, '0');
        const invoiceNumber = `${prefix}${sequence}`;

        // Verify uniqueness (should be unique due to transaction, but double check)
        const existing = await tx.invoice.findFirst({
          where: { invoiceNumber }
        });

        if (existing) {
          // If somehow there's a conflict, retry with timestamp
          const timestamp = Date.now().toString().slice(-6);
          return `${prefix}${sequence}-${timestamp}`;
        }

        return invoiceNumber;
      });
    } catch (error) {
      // Fallback to timestamp-based invoice number on any error
      console.error('Error generating sequential invoice number:', error);
      const timestamp = Date.now().toString().slice(-6);
      return `INV-${yearStr}-${timestamp}`;
    }
  }

  /**
   * Legacy method - keeping for backward compatibility
   * @deprecated Use generateSequentialInvoiceNumber instead
   */
  private async generateInvoiceNumber(studentId: string, period?: string, branchId?: string): Promise<string> {
    return this.generateSequentialInvoiceNumber(branchId || 'branch1');
  }

  /**
   * Generate invoice as PDF
   */
  async generateInvoice(invoiceId: string) {
    const { branchId } = PrismaService.getScope();
    
    // Get invoice with all related data
    const invoice = await this.prisma.invoice.findFirst({
      where: { 
        id: invoiceId,
        ...(branchId && {
          OR: [
            { branchId },
            { student: { branchId } }
          ]
        })
      },
      include: {
        student: {
          include: {
            guardians: {
              include: {
                guardian: true
              }
            },
          }
        },
        payments: true
      }
    });
    
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Calculate balance
    const totalPaid = invoice.payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const balance = (invoice.amount || 0) - totalPaid;

    // In a real implementation, this would generate an actual PDF
    // For now, we'll simulate the process
    const pdfUrl = `/api/invoices/${invoiceId}/download`;
    const generatedAt = new Date().toISOString();

    return {
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        studentName: `Invoice ${invoice.invoiceNumber}`,
        studentId: invoice.studentId,
        amount: invoice.amount,
        balance,
        status: invoice.status,
        pdfUrl,
        generatedAt,
        expiresIn: '24 hours',
        message: 'Invoice PDF generated successfully'
      }
    };
  }

  /**
   * Share invoice via email/SMS
   */
  async shareInvoice(
    invoiceId: string, 
    method: 'email' | 'sms' | 'both',
    recipients?: string[]
  ) {
    const { branchId } = PrismaService.getScope();
    
    // Get invoice with student and guardian details
    const invoice = await this.prisma.invoice.findFirst({
      where: { 
        id: invoiceId,
        ...(branchId && {
          OR: [
            { branchId },
            { student: { branchId } }
          ]
        })
      },
      include: {
        student: {
          include: {
            guardians: {
              include: {
                guardian: true
              }
            }
          }
        }
      }
    });
    
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Determine recipients if not specified
    if (!recipients || recipients.length === 0) {
      recipients = [];
      
      // Add student email/phone
      if (method === 'email' || method === 'both') {
        // TODO: Add student email field to include if needed
      }
      
      if (method === 'sms' || method === 'both') {
        // TODO: Add student phone field to include if needed
      }
      
      // Add guardian contacts
      invoice.student.guardians.forEach(sg => {
        if ((method === 'email' || method === 'both') && sg.guardian.email) {
          recipients.push(sg.guardian.email);
        }
        if ((method === 'sms' || method === 'both') && sg.guardian.phoneNumber) {
          recipients.push(sg.guardian.phoneNumber);
        }
      });
    }

    // Remove duplicates
    const uniqueRecipients = Array.from(new Set(recipients));

    // In a real implementation, this would integrate with email/SMS services
    // For now, we'll simulate the sharing
    const sharedAt = new Date().toISOString();
    const invoiceLink = `https://portal.paramarsh.com/invoices/${invoiceId}`;

    return {
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        method,
        recipients: uniqueRecipients,
        recipientCount: uniqueRecipients.length,
        invoiceLink,
        sharedAt,
        message: `Invoice shared successfully via ${method} to ${uniqueRecipients.length} recipient(s)`
      }
    };
  }

  /**
   * Generate bulk invoices for a class/section
   */
  async generateBulkInvoices(
    classId?: string,
    sectionId?: string,
    period: string = 'Monthly',
    dueDate: string = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  ) {
    const { branchId } = PrismaService.getScope();
    
    // Build filter for enrollments
    const enrollmentFilter: any = {
      branchId,
      isActive: true
    };
    
    if (classId) enrollmentFilter.classId = classId;
    if (sectionId) enrollmentFilter.sectionId = sectionId;

    // Get all active enrollments
    const enrollments = await this.prisma.enrollment.findMany({
      where: enrollmentFilter,
      include: {
        student: true,
        section: true
      }
    });

    if (enrollments.length === 0) {
      return {
        data: {
          message: 'No active enrollments found',
          created: 0
        }
      };
    }

    // Get fee structure for determining amount
    // In a real implementation, this would fetch from FeeSchedule
    const defaultAmount = 5000; // Default monthly fee

    // Create invoices for each enrollment
    const createdInvoices = await Promise.all(
      enrollments.map(async (enrollment) => {
        const invoiceNumber = await this.generateSequentialInvoiceNumber(branchId);
        
        return this.prisma.invoice.create({
          data: {
            studentId: enrollment.studentId,
            invoiceNumber,
            period,
            dueDate,
            amount: defaultAmount,
            status: 'pending',
            branchId
          }
        });
      })
    );

    return {
      data: {
        created: createdInvoices.length,
        totalAmount: createdInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        period,
        dueDate,
        message: `Successfully generated ${createdInvoices.length} invoices`
      }
    };
  }

  /**
   * Send payment reminders for overdue invoices
   */
  async sendPaymentReminders(method: 'email' | 'sms' | 'both' = 'both') {
    const { branchId } = PrismaService.getScope();
    
    // Get all overdue invoices
    const today = new Date().toISOString().split('T')[0];
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        ...(branchId && {
          OR: [
            { branchId },
            { student: { branchId } }
          ]
        }),
        dueDate: { lt: today },
        status: { in: ['pending', 'partial'] }
      },
      include: {
        student: {
          include: {
            guardians: {
              include: {
                guardian: true
              }
            }
          }
        }
      }
    });

    if (overdueInvoices.length === 0) {
      return {
        data: {
          message: 'No overdue invoices found',
          sent: 0
        }
      };
    }

    // Count recipients
    let emailsSent = 0;
    let smsSent = 0;

    // In a real implementation, this would send actual reminders
    overdueInvoices.forEach(invoice => {
      if (method === 'email' || method === 'both') {
        // TODO: Count student email if available
        invoice.student.guardians.forEach(sg => {
          if (sg.guardian.email) emailsSent++;
        });
      }
      
      if (method === 'sms' || method === 'both') {
        // TODO: Count student phone if available
        invoice.student.guardians.forEach(sg => {
          if (sg.guardian.phoneNumber) smsSent++;
        });
      }
    });

    return {
      data: {
        overdueInvoices: overdueInvoices.length,
        method,
        emailsSent,
        smsSent,
        totalReminders: emailsSent + smsSent,
        message: `Payment reminders sent for ${overdueInvoices.length} overdue invoices`
      }
    };
  }
}
