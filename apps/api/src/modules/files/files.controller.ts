import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { randomUUID } from 'crypto';

@ApiTags('Files')
@Controller()
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('files/presign-upload')
  async presignUpload(
    @Body()
    body: { filename: string; contentType: string; prefix?: string; metadata?: Record<string, string> },
  ) {
    const prefix = body.prefix?.replace(/^\/+|\/+$/g, '');
    const key = `${prefix ? prefix + '/' : ''}${randomUUID()}-${body.filename}`;
    return this.files.presignUpload({ key, contentType: body.contentType, metadata: body.metadata });
  }

  @Get('files/:key/presign-download')
  async presignDownload(@Param('key') key: string) {
    return this.files.presignDownload(key);
  }

  @Get('files')
  async list(@Query('prefix') prefix?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.files.list(prefix, page, pageSize);
  }

  @Delete('files/:key')
  async delete(@Param('key') key: string) {
    return this.files.deleteObject(key);
  }
}
