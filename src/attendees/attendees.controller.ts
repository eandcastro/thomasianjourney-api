import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { EntityTransformInterceptor } from '../utils/entity_transform.interceptor';
import { Attendee } from './entities/attendee.entity';
import { AttendeeResponse } from './types';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

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

  // This will be used by the admin
  @Get()
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(EntityTransformInterceptor<Attendee, AttendeeResponse>)
  findAll() {
    return this.attendeesService.findAll();
  }

  // This will be used by the admin for getting attendees for an event
  @Get('event/:event_id')
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(EntityTransformInterceptor<Attendee, AttendeeResponse>)
  findEventAttendees(@Param('event_id') event_id: string) {
    return this.attendeesService.findEventAttendees(event_id);
  }

  // This will be used by the student for getting events assigned to him/her
  @Get('student/:student_id')
  @UseInterceptors(EntityTransformInterceptor<Attendee, AttendeeResponse>)
  findEventsByAttendee(@Param('student_id') student_id: string) {
    console.log('HEREEE', student_id);
    return this.attendeesService.findEventsByAttendee(student_id);
  }
}
