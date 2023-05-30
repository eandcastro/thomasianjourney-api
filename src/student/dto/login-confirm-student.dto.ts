import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginConfirmStudentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  email: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ required: true, maxLength: 6 })
  otp: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  fcm_token: string;
}
