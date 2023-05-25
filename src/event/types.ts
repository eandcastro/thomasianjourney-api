import { EntityDTO } from '@mikro-orm/core';
import { Event } from './entities/event.entity';

export type EventResponse = EntityDTO<Event>;
