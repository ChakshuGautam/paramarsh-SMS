import { Module } from '@nestjs/common';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { TeacherAttendanceController } from './teacher-attendance.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherAttendanceController],
  providers: [TeacherAttendanceService],
  exports: [TeacherAttendanceService],
})
export class TeacherAttendanceModule {}