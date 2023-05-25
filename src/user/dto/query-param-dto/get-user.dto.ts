import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  id: string;
}
