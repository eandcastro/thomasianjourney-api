import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../base.entity';
import { Student } from '../../student/entities/student.entity';
import { Event } from '../../event/entities/event.entity';

@Entity()
export class Attendee extends BaseEntity {
  @ManyToOne()
  student!: Student;

  @ManyToOne()
  event!: Event;

  @Property()
  has_attended = false;
}
