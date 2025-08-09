import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FilesService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          }
        : undefined,
    });
    this.bucket = process.env.S3_BUCKET || 'paramarsh-dev';
    this.publicBaseUrl = process.env.S3_PUBLIC_BASE_URL; // optional CDN or bucket website URL
  }

  async presignUpload(params: {
    key: string;
    contentType: string;
    metadata?: Record<string, string>;
  }) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
      Metadata: params.metadata,
    });
    const uploadUrl = await getSignedUrl(this.s3, cmd, { expiresIn: 900 });
    return {
      key: params.key,
      uploadUrl,
      url: this.publicBaseUrl
        ? `${this.publicBaseUrl}/${params.key}`
        : undefined,
      headers: {
        'Content-Type': params.contentType,
      },
    };
  }

  async presignDownload(key: string, expiresIn = 900) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.s3, cmd, { expiresIn });
    return { url, expiresIn };
  }

  async deleteObject(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    return { success: true };
  }

  async list(prefix?: string, page?: number, pageSize?: number) {
    const cmd = new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, MaxKeys: pageSize ?? 1000 });
    const out = await this.s3.send(cmd);
    const data = (out.Contents || []).map((o) => ({
      key: o.Key!,
      bucket: this.bucket,
      url: this.publicBaseUrl ? `${this.publicBaseUrl}/${o.Key}` : undefined,
      size: o.Size ?? 0,
      createdAt: o.LastModified?.toISOString(),
      contentType: undefined,
      metadata: {},
    }));
    return { data, meta: { page: 1, pageSize: data.length, total: data.length, hasNext: false } };
  }
}
