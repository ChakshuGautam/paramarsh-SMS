import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
<<<<<<< HEAD
import { TimeslotsController } from './timeslots.controller';
=======
>>>>>>> origin/main
import { PeriodsService } from './periods.service';
import { PeriodsController } from './periods.controller';

@Module({
  imports: [PrismaModule],
<<<<<<< HEAD
  controllers: [SubjectsController, RoomsController, TimetableController, TimeslotsController, PeriodsController],
=======
  controllers: [SubjectsController, RoomsController, TimetableController, PeriodsController],
>>>>>>> origin/main
  providers: [SubjectsService, RoomsService, TimetableService, PeriodsService],
  exports: [SubjectsService, RoomsService, TimetableService, PeriodsService],
})
export class TimetableModule {}