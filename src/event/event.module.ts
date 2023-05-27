import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Event } from './entities/event.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Event, User, Student]),
    UserModule,
    StudentModule,
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
