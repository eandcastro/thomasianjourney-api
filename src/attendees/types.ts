import { EntityDTO } from '@mikro-orm/core';
import { Attendee } from './entities/attendee.entity';

export type AttendeeResponse = EntityDTO<Attendee>;
