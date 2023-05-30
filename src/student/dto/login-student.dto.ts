import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginStudentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  email: string;
}
