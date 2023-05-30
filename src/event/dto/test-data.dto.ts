import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
// import { Metadata } from './metadata.dto';

export class TestDTO {
  @IsString()
  @ApiProperty()
  event_name?: string;
}
