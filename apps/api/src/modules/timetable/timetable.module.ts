import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SubjectsController, RoomsController, TimetableController],
  providers: [SubjectsService, RoomsService, TimetableService],
  exports: [SubjectsService, RoomsService, TimetableService],
})
export class TimetableModule {}