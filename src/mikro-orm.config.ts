import { Options } from '@mikro-orm/core';
import { Event } from './event/entities/event.entity';
import { Student } from './student/entities/student.entity';
import { User } from './user/entities/user.entity';
import { Logger } from '@nestjs/common';
import { BaseEntity } from './base.entity';
import { Timestamps } from './timestamps.entity';
import { Attendee } from './attendees/entities/attendee.entity';

const logger = new Logger('MikroORM');
const config: Options = {
  entities: [BaseEntity, Timestamps, Event, Student, User, Attendee], // no need for `entitiesTs` this way
  dbName: 'thomasianjourney',
  debug: true,
  logger: logger.log.bind(logger),
  type: 'postgresql', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
};

export default config;
