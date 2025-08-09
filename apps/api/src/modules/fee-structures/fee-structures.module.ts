import { Module } from '@nestjs/common';
import { FeeStructuresController } from './fee-structures.controller';
import { FeeStructuresService } from './fee-structures.service';

@Module({
  controllers: [FeeStructuresController],
  providers: [FeeStructuresService],
})
export class FeeStructuresModule {}
