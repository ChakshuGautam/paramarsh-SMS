import { InvoicesService } from './invoices.service';
import { PrismaService } from '../../prisma/prisma.service';
import PdfPrinter from 'pdfmake';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// We'll override service.printer directly instead of relying on module mock

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  const send = jest.fn().mockResolvedValue({});
  const ClientMock = jest.fn().mockImplementation(() => ({ send }));
  return {
    ...actual,
    S3Client: ClientMock,
    PutObjectCommand: jest.fn().mockImplementation((args) => ({ __type: 'PutObjectCommand', args })),
  };
});

describe('InvoicesService exportPdfAndUpload', () => {
  const prisma = {
      invoice: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

  const service = new InvoicesService(prisma);

  beforeEach(() => {
    jest.resetAllMocks();
    (service as any).bucket = 'test-bucket';
    // inject a fake pdfmake printer that returns a minimal event emitter-like doc
    (service as any).printer = {
      createPdfKitDocument: (_def: any) => {
        const listeners: Record<string, any[]> = {};
        return {
          on: (event: string, cb: any) => {
            listeners[event] = listeners[event] || [];
            listeners[event].push(cb);
          },
          end: () => {
            // emit a single data chunk, then end
            (listeners['data'] || []).forEach((cb) => cb(Buffer.from('%PDF-1.4')));
            (listeners['end'] || []).forEach((cb) => cb());
          },
        } as any;
      },
    } as unknown as PdfPrinter;
  });

  it('uploads generated PDF to S3', async () => {
    (prisma.invoice.findUnique as jest.Mock).mockResolvedValue({
      id: 'inv1', studentId: 'stu1', amount: 1000, status: 'issued', period: '2025-06', dueDate: '2025-06-30'
    });

    const res = await service.exportPdfAndUpload('inv1');

    expect(res.key).toBe('invoices/inv1/invoice-inv1.pdf');
    expect((PutObjectCommand as unknown as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({ Bucket: 'test-bucket', Key: 'invoices/inv1/invoice-inv1.pdf', ContentType: 'application/pdf' })
    );
    // Ensure PutObjectCommand was instantiated implying S3Client.send was used
    expect((PutObjectCommand as unknown as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('throws when invoice not found', async () => {
    (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.exportPdfAndUpload('missing')).rejects.toThrow('Invoice not found');
  });
});
