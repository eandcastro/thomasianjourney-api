import { Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ abstract: true })
export class BaseUser extends BaseEntity {
  @Enum(() => UserRole)
  role!: string;

  @Property({ nullable: true, hidden: true, unique: true })
  fcm_token?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  STUDENT = 'student',
}
