import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../user/user.enums';

export class GetAllUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  @ApiProperty({
    required: false,
    nullable: true,
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  role?: UserRole;

  @IsOptional()
  @ApiProperty({
    required: false,
    nullable: true,
    example: 'CICS',
  })
  office?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    nullable: true,
    example: '["active"]',
  })
  filters?: string[];
}
