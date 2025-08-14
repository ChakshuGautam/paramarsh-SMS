import { PartialType } from '@nestjs/swagger';
import { CreateTimeSlotDto } from './create-timeslot.dto';

export class UpdateTimeSlotDto extends PartialType(CreateTimeSlotDto) {}