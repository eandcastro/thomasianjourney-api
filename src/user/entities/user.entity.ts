import { Entity, Property } from '@mikro-orm/core';
import { BaseUser } from '../../base-user.entity';

@Entity()
export class User extends BaseUser {
  @Property()
  first_name!: string;

  @Property()
  last_name!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ unique: true })
  username!: string;

  @Property({ hidden: true })
  password!: string;

  @Property()
  office!: string;

  @Property()
  contact_person_first_name!: string;

  @Property()
  contact_person_last_name!: string;
}
