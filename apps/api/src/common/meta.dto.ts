import { ApiProperty } from '@nestjs/swagger';

export class MetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  hasNext!: boolean;
}
