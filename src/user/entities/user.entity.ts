import { Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../base.entity';

@Entity()
export class User extends BaseEntity {
  @Property()
  first_name!: string;

  @Property()
  last_name!: string;

  @Property()
  email!: string;

  @Property()
  username!: string;

  @Property()
  password!: string;

  @Enum(() => UserRole)
  role!: string;

  @Property()
  office!: string;

  @Property()
  contact_person_first_name!: string;

  @Property()
  contact_person_last_name!: string;
}

export enum UserRole {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}
