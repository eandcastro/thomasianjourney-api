import { DateTimeType, Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../base.entity';

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

  @Property({ length: 2046 })
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
  event_student_attendee_count?: string;

  // TODO: make relation here to user entity
  @Property()
  event_posted_by_user_id!: string;

  // TODO: make this enum
  @Property()
  event_category_name!: string;

  @Property()
  event_points!: number;
}
