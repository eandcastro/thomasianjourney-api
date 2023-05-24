import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Metadata } from './metadata.dto';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  eventTitle: string;

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ required: true })
  @Type(() => Metadata)
  metadata: Metadata;
}
