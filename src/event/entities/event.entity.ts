import { Entity, ManyToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../base.entity';
import { Student } from '../../student/entities/student.entity';

@Entity()
export class Event extends BaseEntity {
  @Property()
  event_title!: string;

  // @ManyToMany({
  //   primary: true,
  //   unique: true,
  // })
  // student!: Student;
}
