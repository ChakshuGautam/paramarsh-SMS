import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class ProblemDto {
  @ApiPropertyOptional()
  type?: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  status!: number;

  @ApiPropertyOptional()
  detail?: string | Record<string, any>;

  @ApiPropertyOptional()
  instance?: string;

  @ApiPropertyOptional()
  code?: string;
}
