import { FilesService } from './files.service';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  DeleteObjectCommand: jest.fn().mockImplementation((args) => ({ __type: 'DeleteObjectCommand', args })),
  ListObjectsV2Command: jest.fn().mockImplementation((args) => ({ __type: 'ListObjectsV2Command', args })),
  GetObjectCommand: jest.fn().mockImplementation((args) => ({ __type: 'GetObjectCommand', args })),
  PutObjectCommand: jest.fn().mockImplementation((args) => ({ __type: 'PutObjectCommand', args })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('FilesService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv, S3_BUCKET: 'test-bucket', AWS_REGION: 'ap-south-1' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('presignUpload returns uploadUrl and headers', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('https://signed-upload');
    const service = new FilesService();
    const res = await service.presignUpload({ key: 'invoices/1/a.pdf', contentType: 'application/pdf' });
    expect(res).toEqual(expect.objectContaining({ key: 'invoices/1/a.pdf', uploadUrl: 'https://signed-upload' }));
    expect(res.headers['Content-Type']).toBe('application/pdf');
    expect(S3Client).toHaveBeenCalled();
    expect((PutObjectCommand as unknown as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({ Bucket: 'test-bucket', Key: 'invoices/1/a.pdf', ContentType: 'application/pdf' })
    );
  });

  it('presignDownload returns URL', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('https://signed-download');
    const service = new FilesService();
    const res = await service.presignDownload('key');
    expect(res).toEqual({ url: 'https://signed-download', expiresIn: 900 });
    expect((GetObjectCommand as unknown as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({ Bucket: 'test-bucket', Key: 'key' })
    );
  });

  it('deleteObject sends DeleteObjectCommand', async () => {
    const service = new FilesService();
    const sendMock = jest.fn().mockResolvedValue({});
    (service as any).s3 = { send: sendMock };
    await service.deleteObject('key');
    expect((DeleteObjectCommand as unknown as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({ Bucket: 'test-bucket', Key: 'key' })
    );
    expect(sendMock).toHaveBeenCalled();
  });

  it('list maps S3 contents', async () => {
    const service = new FilesService();
    const sendMock = jest.fn().mockResolvedValue({
      Contents: [
        { Key: 'a/b/c.pdf', Size: 123, LastModified: new Date('2020-01-01T00:00:00Z') },
        { Key: 'a/b/d.pdf', Size: 456, LastModified: new Date('2020-01-02T00:00:00Z') },
      ],
    });
    (service as any).s3 = { send: sendMock };
    const res = await service.list('a/b/');
    expect((ListObjectsV2Command as unknown as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({ Bucket: 'test-bucket', Prefix: 'a/b/' })
    );
    expect(res.data).toHaveLength(2);
    expect(res.data[0]).toEqual(
      expect.objectContaining({ key: 'a/b/c.pdf', size: 123, createdAt: '2020-01-01T00:00:00.000Z' })
    );
  });
});
