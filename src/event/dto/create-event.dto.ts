import { ApiProperty } from '@nestjs/swagger';
// import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
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
  event_image: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_qr: string;

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
  @IsString()
  @ApiProperty({ required: true, isArray: true })
  event_college_attendee: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, isArray: true })
  event_year_level_attendee: number[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_posted_by_user_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_category_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_points: number;

  // @IsNotEmpty()
  // @ValidateNested()
  // @ApiProperty({ required: true })
  // @Type(() => Metadata)
  // metadata: Metadata;
}
