import { Module } from '@nestjs/common';
import { FeeSchedulesService } from './fee-schedules.service';
import { FeeSchedulesController } from './fee-schedules.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [FeeSchedulesController],
  providers: [FeeSchedulesService, PrismaService],
  exports: [FeeSchedulesService],
})
export class FeeSchedulesModule {}
