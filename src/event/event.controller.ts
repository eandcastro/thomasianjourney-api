import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EntityTransformInterceptor } from '../utils/entity_transform.interceptor';
import { Event } from './entities/event.entity';
import { EventResponse } from './types';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { TestDTO } from './dto/test-data.dto';
import fs from 'fs/promises';
import { Response } from 'express';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiConsumes('multipart/form-data')
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        event_name: {
          type: 'string',
        },
        event_description: {
          type: 'string',
        },
        event_venue: {
          type: 'string',
        },
        event_lead_office: {
          type: 'string',
        },
        event_broadcast_message: {
          type: 'string',
        },
        event_college_attendee: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        event_year_level_attendee: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        event_grouped_emails: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        event_posted_by_user_id: {
          type: 'string',
        },
        event_category_name: {
          type: 'string',
        },
        event_points: {
          type: 'number',
        },
        event_start_date: {
          type: 'string',
          format: 'date-time',
        },
        event_end_date: {
          type: 'string',
          format: 'date-time',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file?: Express.MulterS3.File,
  ) {
    return this.eventService.create(
      createEventDto,
      file?.buffer,
      file?.originalname,
    );
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

  // @Post('/attendee')
  // createEventAttendee(
  //   @Query('event_id') event_id: string,
  //   @Query('student_id') student_id: string,
  // ) {
  //   return this.eventService.attendEvent(event_id, student_id);
  // }

  @Post('/test-email')
  createEventAttendee(@Body() createEventDto: CreateEventDto) {
    return this.eventService.testEmail(
      createEventDto.event_name,
      createEventDto.event_broadcast_message,
    );
  }

  @Post('/test-qr')
  testQrCode(@Body() createEventDto: TestDTO) {
    return this.eventService.testQrCode(createEventDto.event_name);
  }

  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/pdf')
  @Post('/generate/qr-doc')
  async generateQrDocument(
    @Query('event_id') event_id: string,
    @Res() response: Response,
  ) {
    try {
      const result = await this.eventService.generateQrDocument(event_id);

      const file = await fs.readFile(result.pdf_file_path);

      response.contentType('application/pdf');
      response.attachment(`${result.id}-qr.pdf`);
      response.send(file);

      await fs.unlink(result.pdf_file_path);
    } catch (error) {
      throw new BadRequestException(error, {
        cause: new Error(),
        description: 'Error occurred while generating qr document',
      });
    }
  }

  // This cron job will automate updating event status to ONGOING or DONE
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleEventCron() {
    await this.eventService.handleEventCron();
  }
}
