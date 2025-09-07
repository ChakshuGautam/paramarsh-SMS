import { Module } from '@nestjs/common';
import { StudentPeriodAttendanceController } from './student-period-attendance.controller';
import { StudentPeriodAttendanceService } from './student-period-attendance.service';

@Module({
  controllers: [StudentPeriodAttendanceController],
  providers: [StudentPeriodAttendanceService],
  exports: [StudentPeriodAttendanceService]
})
export class StudentPeriodAttendanceModule {}