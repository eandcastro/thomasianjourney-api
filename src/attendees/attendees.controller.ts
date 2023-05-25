import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';

@Controller('attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Post()
  create(@Body() createAttendeeDto: CreateAttendeeDto) {
    return this.attendeesService.create(createAttendeeDto);
  }

  @Get()
  findAll() {
    return this.attendeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendeesService.findOne(+id);
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
