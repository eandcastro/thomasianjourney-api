import { DateTimeType, Entity, Filter, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
@Filter({ name: 'active', cond: { deleted_at: null } })
export class Timestamps {
  @Property({ type: DateTimeType })
  created_at = new Date();

  @Property({
    type: DateTimeType,
    onUpdate: () => new Date(),
  })
  updated_at = new Date();

  @Property({ type: DateTimeType, nullable: true })
  deleted_at?: Date;
}
