import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  new_password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  confirm_password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  token: string;
}
