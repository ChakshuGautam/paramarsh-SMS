import { Module } from '@nestjs/common';
import { AttendanceSessionsController } from './attendance-sessions.controller';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceSessionsController],
  providers: [AttendanceSessionsService],
  exports: [AttendanceSessionsService]
})
export class AttendanceSessionsModule {}