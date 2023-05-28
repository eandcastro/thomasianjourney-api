import { Entity, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ abstract: true })
export class BaseUser extends BaseEntity {
  @Enum(() => UserRole)
  role!: string;
}

export enum UserRole {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  STUDENT = 'student',
}
