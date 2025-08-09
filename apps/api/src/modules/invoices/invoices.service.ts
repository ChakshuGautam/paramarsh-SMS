import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
export class InvoicesService {
  private readonly printer: PdfPrinter;
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly prisma: PrismaService) {
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

  async list(params: { page?: number; pageSize?: number; sort?: string; studentId?: string; status?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    if (params.status) where.status = params.status;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: { studentId: string; period?: string; dueDate?: string; amount?: number; status?: string; withPayment?: boolean }) {
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

  async update(id: string, input: Partial<{ period: string; dueDate: string; amount: number; status: string }>) {
    const updated = await this.prisma.invoice.update({ where: { id }, data: {
      period: input.period ?? undefined,
      dueDate: input.dueDate ?? undefined,
      amount: input.amount ?? undefined,
      status: input.status ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.invoice.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Invoice not found');
    }
    return { success: true };
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
