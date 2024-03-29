import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { StudentModule } from './student/student.module';
import mikroOrmConfig from './mikro-orm.config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AttendeesModule } from './attendees/attendees.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    // Set this to true to ignore env file
    ConfigModule.forRoot({
      ignoreEnvFile: false,
    }),
    // This will be used for cron jobs/task scheduling
    ScheduleModule.forRoot(),
    UserModule,
    EventModule,
    StudentModule,
    AttendeesModule,
    AuthModule,
    EmailModule,
    ReportsModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
