import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { StudentModule } from './student/student.module';
import mikroOrmConfig from './mikro-orm.config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { AttendeesModule } from './attendees/attendees.module';
@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    // Set this to true to ignore env file
    ConfigModule.forRoot({
      ignoreEnvFile: false,
    }),
    UserModule,
    EventModule,
    StudentModule,
    AttendeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
