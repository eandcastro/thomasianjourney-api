import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsString()
  @ApiProperty({ nullable: true })
  event_status?: string;
}
