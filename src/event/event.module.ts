import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Event } from './entities/event.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { StudentModule } from '../student/student.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { ReportsService } from 'src/reports/reports.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Event, User, Student]),
    UserModule,
    StudentModule,
    ConfigModule,
    EmailModule,
  ],
  controllers: [EventController],
  providers: [EventService, ReportsService],
})
export class EventModule {}
