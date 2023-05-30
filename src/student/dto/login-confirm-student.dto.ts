import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  is_new_sso?: boolean;
}
