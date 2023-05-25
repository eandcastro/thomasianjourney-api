import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  last_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  password: string;

  @IsNotEmpty()
  @IsEnum(() => UserRole)
  @ApiProperty({
    required: true,
    enum: () => UserRole,
    example: () => UserRole.ADMIN,
  })
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  office: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  contact_person_first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  contact_person_last_name: string;
}

export enum UserRole {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}
