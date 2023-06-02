import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinDate,
} from 'class-validator';
// import { Metadata } from './metadata.dto';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_venue: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_lead_office: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_broadcast_message: string;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ required: true, isArray: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  event_college_attendee: string[];

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ required: true, isArray: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  event_year_level_attendee: number[];

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ required: true, isArray: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  event_grouped_emails: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_posted_by_user_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_category_name: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: true })
  event_points: number;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  event_start_date: Date;

  // TODO: make event_start_date as the min date for event_end_date
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  event_end_date: Date;

  // @IsNotEmpty()
  // @ValidateNested()
  // @ApiProperty({ required: true })
  // @Type(() => Metadata)
  // metadata: Metadata;
}
