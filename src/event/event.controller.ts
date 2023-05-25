import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EntityTransformInterceptor } from '../utils/entity_transform.interceptor';
import { Event } from './entities/event.entity';
import { EventResponse } from './types';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Body() createEventDto?: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @UseInterceptors(EntityTransformInterceptor<Event, EventResponse>)
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  @UseInterceptors(EntityTransformInterceptor<Event, EventResponse>)
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
