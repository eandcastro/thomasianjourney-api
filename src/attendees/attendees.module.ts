import { Module } from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { AttendeesController } from './attendees.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Attendee } from './entities/attendee.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { Event } from '../event/entities/event.entity';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Attendee, User, Event]),
    UserModule,
    EventModule,
  ],
  controllers: [AttendeesController],
  providers: [AttendeesService],
})
export class AttendeesModule {}
