import { PartialType } from '@nestjs/swagger';
import { CreateStudentPeriodAttendanceDto } from './create-student-period-attendance.dto';

export class UpdateStudentPeriodAttendanceDto extends PartialType(CreateStudentPeriodAttendanceDto) {
  // All fields from CreateStudentPeriodAttendanceDto are now optional
  // This allows partial updates while maintaining the same validation rules
}