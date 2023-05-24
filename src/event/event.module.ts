import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Event } from './entities/event.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Event])],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
