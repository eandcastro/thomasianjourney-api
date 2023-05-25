import { v4 } from 'uuid';
import { Entity, Filter, PrimaryKey } from '@mikro-orm/core';
import { Timestamps } from './timestamps.entity';

@Entity({ abstract: true })
@Filter({ name: 'active', cond: { deleted_at: null } })
export abstract class BaseEntity extends Timestamps {
  @PrimaryKey({ columnType: 'uuid', unique: true })
  id: string = v4();
}
