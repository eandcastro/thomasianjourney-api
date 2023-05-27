import { DateTimeType, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Event extends BaseEntity {
  @Property()
  event_name!: string;

  @Property({ type: DateTimeType, nullable: true })
  event_start_date!: Date;

  @Property({ type: DateTimeType, nullable: true })
  event_end_date!: Date;

  @Property()
  event_description!: string;

  // TODO: make this enum
  @Property()
  event_status!: string;

  @Property()
  event_image!: string;

  @Property({ length: 3000 })
  event_qr!: string;

  @Property()
  event_venue!: string;

  @Property()
  event_lead_office!: string;

  @Property()
  event_broadcast_message!: string;

  @Property()
  event_college_attendee!: string[];

  @Property()
  event_year_level_attendee!: number[];

  @Property({ nullable: true })
  event_attendee_count?: string;

  @ManyToOne()
  user!: User;

  // TODO: figure out how to create event record with nullable many to many relationship to student
  // @ManyToMany(() => Student, null, { nullable: true })
  // student?: Student;

  // TODO: make this enum
  @Property()
  event_category_name!: string;

  @Property()
  event_points!: number;
}
