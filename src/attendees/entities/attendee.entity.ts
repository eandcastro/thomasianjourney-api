import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../base.entity';

@Entity()
export class Attendee extends BaseEntity {
  @Property({ columnType: 'uuid' })
  student_id!: string;

  @Property({ columnType: 'uuid' })
  event_id!: string;
}
