import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Metadata {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  eventDescription: string;
}
