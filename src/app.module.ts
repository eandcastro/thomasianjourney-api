import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [UserModule, EventModule, StudentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
