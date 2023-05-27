import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { EntityTransformInterceptor } from '../utils/entity_transform.interceptor';
import { Attendee } from './entities/attendee.entity';
import { AttendeeResponse } from './types';

@Controller('attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Post()
  @UseInterceptors(EntityTransformInterceptor<Attendee, AttendeeResponse>)
  create(@Body() createAttendeeDto: CreateAttendeeDto) {
    return this.attendeesService.create(createAttendeeDto);
  }

  @Post('attend')
  @UseInterceptors(EntityTransformInterceptor<Attendee, AttendeeResponse>)
  attendEvent(
    @Query('event_id') event_id: string,
    @Query('student_id') student_id: string,
  ) {
    return this.attendeesService.attendEvent(event_id, student_id);
  }

  @Get()
  findAll() {
    return this.attendeesService.findAll();
  }

  @Get(':event_id')
  findOne(@Param('event_id') event_id: string) {
    return this.attendeesService.findEventAttendees(event_id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.attendeesService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendeesService.remove(+id);
  }
}
