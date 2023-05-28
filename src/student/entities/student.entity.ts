import { Entity, Property } from '@mikro-orm/core';
import { BaseUser } from '../../base-user.entity';

@Entity()
export class Student extends BaseUser {
  @Property()
  student_name!: string;

  @Property()
  student_email!: string;

  @Property()
  student_college_name!: string;

  @Property()
  student_year_level!: number;

  @Property()
  student_mobile_number!: string;

  @Property()
  student_accumulated_points!: number;
}
