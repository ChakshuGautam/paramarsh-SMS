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
    // Handle overdue status calculation
    if (params.filter?.status === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      params.filter.dueDate_lt = today;
      params.filter.status = { in: ['pending', 'partial'] }; // Only pending/partial can be overdue
      delete params.filter.status; // Remove to use the object form
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
  async list(params: { page?: number; perPage?: number; sort?: string; studentId?: string; status?: string; branchId: string; filter?: any; ids?: string }) {
    const filter: any = {
      studentId: params.studentId,
      status: params.status,
      student: {
        branchId: params.branchId
      }
    };
    
    if (params.filter) {
      Object.assign(filter, params.filter);
    }
    
    if (params.ids) {
      filter.id = { in: params.ids.split(',') };
    }
    
    return this.getList({
      page: params.page,
      perPage: params.perPage,
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
    const inv = await this.prisma.invoice.create({ data: {
      studentId: input.studentId,
      period: input.period ?? null,
      dueDate: input.dueDate ?? null,
      amount: input.amount ?? null,
      status: input.status ?? null,
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
}
