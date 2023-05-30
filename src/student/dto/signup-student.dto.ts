import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SignupStudentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  student_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  student_email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  student_college_name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ required: true })
  student_year_level: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  student_mobile_number: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  fcm_token: string;
}
