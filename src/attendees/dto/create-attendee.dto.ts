import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateAttendeeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  student_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  event_id: string;

  @IsBoolean()
  @ApiProperty()
  has_attended?: boolean;
}
