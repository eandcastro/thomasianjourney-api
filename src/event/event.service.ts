import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import fs from 'fs/promises';
import { Readable } from 'stream';
import QrCode from 'qrcode';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  FilterQuery,
  MikroORM,
  UseRequestContext,
  wrap,
} from '@mikro-orm/core';
import { User } from '../user/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { AttendeesService } from '../attendees/attendees.service';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { EmailService } from '../email/email.service';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  // private readonly attendeeService = new AttendeesService(this.em);
  private readonly s3 = new S3();
  constructor(
    // @InjectRepository(Event)
    // private readonly eventRepository: EntityRepository<Event>,

    // orm is being used in @UseRequestContext()
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
    private emailService: EmailService,
    private readonly reportsService: ReportsService,
    private readonly attendeesService: AttendeesService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    imageBuffer?: Buffer,
    filename?: string,
  ) {
    const newEvent = new Event();

    const stringifiedColleges: any = `${createEventDto.event_college_attendee}`;
    const parsedColleges: string[] = stringifiedColleges
      .split(',')
      .map((item: string) => {
        return item.toString();
      });

    const stringifiedYearLevels: any = `${createEventDto.event_year_level_attendee}`;
    const parsedYearLevels: number[] = stringifiedYearLevels
      .split(',')
      .map((item: number) => {
        return item;
      });

    const stringifiedGroupedEmails: any = `${createEventDto.event_grouped_emails}`;
    const parsedGroupedEmails: string[] = stringifiedGroupedEmails
      .split(',')
      .map((item: string) => {
        return item;
      });

    newEvent.event_name = createEventDto.event_name;
    newEvent.event_start_date = new Date(createEventDto.event_start_date);
    newEvent.event_end_date = new Date(createEventDto.event_end_date);
    newEvent.event_description = createEventDto.event_description;
    newEvent.event_status = 'UPCOMING';
    newEvent.event_image =
      filename ||
      'https://tj-static-images.s3.ap-southeast-1.amazonaws.com/UST.jpg';
    newEvent.event_qr = createEventDto.event_name;
    newEvent.event_venue = createEventDto.event_venue;
    newEvent.event_lead_office = createEventDto.event_lead_office;
    newEvent.event_broadcast_message = createEventDto.event_broadcast_message;
    newEvent.event_college_attendee = parsedColleges;
    newEvent.event_year_level_attendee = parsedYearLevels;
    newEvent.event_grouped_emails = parsedGroupedEmails;
    newEvent.user = this.em.getReference(
      User,
      createEventDto.event_posted_by_user_id,
    );

    newEvent.event_category_name = createEventDto.event_category_name;
    newEvent.event_points = createEventDto.event_points;

    // Create event record
    const createEvent = this.em.create(Event, newEvent);
    this.logger.log(`Creating event: ${JSON.stringify(createEvent)}`);

    const createdEvent = await this.em.upsert(createEvent);
    await this.em.flush();

    // Generate and upload qr code to S3 bucket
    const qrCodeFilename = `${createdEvent.id}${createdEvent.event_name}-qr.png`;
    await this.uploadEventQrCode(createEvent.id, qrCodeFilename);

    if (imageBuffer && filename) {
      const uploadedImage = await this.uploadFile(
        imageBuffer,
        filename,
        createdEvent.id,
      );

      if (!uploadedImage) {
        this.logger.log(`Failed to upload: ${JSON.stringify(uploadedImage)} `);
      }
    }

    // TODO: add rollback here if it fails
    wrap(createdEvent).assign({
      event_qr: qrCodeFilename,
    });
    await this.em.persistAndFlush(createdEvent);

    // Create event attendees by college and year level
    for (let i = 0; i < createdEvent.event_college_attendee.length; i++) {
      for (let j = 0; j < createdEvent.event_year_level_attendee.length; j++) {
        const where: FilterQuery<Student> = {
          student_college_name: createdEvent.event_college_attendee[i],
          student_year_level: createdEvent.event_year_level_attendee[j],
        };

        const existingStudents = await this.em.find(Student, where, {
          filters: ['active'],
        });

        if (!existingStudents) {
          continue;
        }

        existingStudents.map((existingStudent) => {
          this.attendeesService.create({
            event_id: createEvent.id,
            student_id: existingStudent.id,
          });
        });
      }
    }

    createdEvent.event_grouped_emails.map(async (emailRecipient: string) => {
      await this.emailService.sendNewEventNotification(
        emailRecipient,
        createdEvent.event_name,
        createdEvent.event_broadcast_message,
        createdEvent.event_qr,
      );
    });

    return createdEvent;
  }

  async uploadFile(dataBuffer: Buffer, filename: string, event_id: string) {
    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${event_id}/${filename}`,
      })
      .promise();

    return uploadResult;
  }

  async findAll(where: FilterQuery<Event> = {}) {
    const events = await this.em.find(Event, where, { filters: ['active'] });
    return events;
  }

  async findOne(id: string, where: FilterQuery<Event> = {}) {
    if (!uuidValidate(id) || uuidVersion(id) !== 4) {
      throw new BadRequestException(`Invalid event ID`, {
        cause: new Error(),
        description: 'Event ID is not a v4 uuid',
      });
    }

    this.logger.log(`Finding Event ID: ${id}`);

    const existingEvent = await this.em.findOne(
      Event,
      Object.assign({}, where, { id }),
      { filters: ['active'] },
    );

    if (!existingEvent) {
      throw new BadRequestException('Event ID does not exists', {
        cause: new Error(),
        description: 'Event ID does not exists',
      });
    }

    return existingEvent;
  }

  // TODO: aside from updating event, also update or remove attendees for this event
  async update(id: string, updateEventDto: UpdateEventDto) {
    if (!uuidValidate(id) || uuidVersion(id) !== 4) {
      throw new BadRequestException('Invalid student ID', {
        cause: new Error(),
        description: 'Student ID is not a v4 uuid',
      });
    }

    this.logger.log(`Updating Event ID: ${id}`);

    const existingEvent = await this.em.findOne(Event, { id }, {});

    if (!existingEvent) {
      throw new BadRequestException('Event ID does not exists', {
        cause: new Error(),
        description: 'Event ID does not exists',
      });
    }

    wrap(existingEvent).assign(updateEventDto);
    await this.em.persistAndFlush(existingEvent);

    return existingEvent;
  }

  // TODO: aside from removing event, also remove attendees for this event
  async remove(id: string) {
    const existingEvent = this.em.getReference(Event, id);

    if (!existingEvent) {
      throw new BadRequestException('Event ID does not exists', {
        cause: new Error(),
        description: 'Event ID does not exists',
      });
    }

    return this.em.remove(existingEvent).flush();
  }

  async testEmail(event_name: string, broadcast_message: string) {
    this.emailService.sendNewEventNotification(
      'eanj.dcastro@gmail.com',
      event_name,
      broadcast_message,
      broadcast_message,
    );
  }

  async uploadEventQrCode(event_id: string, filename: string) {
    await QrCode.toFile(
      `${__dirname}/temp-upload/${filename}`,
      `${JSON.stringify({
        event_id,
      })}`,
    );

    const buffer = await fs.readFile(`${__dirname}/temp-upload/${filename}`);
    await this.uploadFile(buffer, filename, event_id);
    await fs.unlink(`${__dirname}/temp-upload/${filename}`);
  }

  // THIS IS FOR TESTING PURPOSES ONLY
  async testQrCode(event_name: string) {
    await QrCode.toFile(
      `${__dirname}/temp/${event_name}.png`,
      `${JSON.stringify({
        event_name,
      })}`,
      // {
      //   color: {
      //     dark: '#FFFFFF', // Blue dots
      //     light: '#0000', // Transparent background
      //   },
      // },
    );

    const text = await fs.readFile(
      `${__dirname}/temp-upload/${event_name}.png`,
    );

    await this.uploadFile(text, `${event_name}.png`, 'abc');
    await fs.unlink(`${__dirname}/temp-upload/${event_name}.png`);
  }

  timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generateQrDocument(
    event_id: string,
  ): Promise<{ id: string; pdf_file_path: string }> {
    const existingEvent = await this.findOne(event_id);

    const response = await this.s3
      .getObject({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: `${existingEvent.id}/${existingEvent.event_qr}`,
      })
      .promise();

    const stream = Readable.from(response.Body as Buffer);
    await fs.writeFile(
      `${__dirname}/temp-download/${existingEvent.event_qr}`,
      stream,
    );

    await this.reportsService.createEventPdf(
      existingEvent.id,
      existingEvent.event_name,
      `${__dirname}/temp-download/${existingEvent.event_qr}`,
      `${__dirname}/temp-download`,
    );

    await fs.unlink(`${__dirname}/temp-download/${existingEvent.event_qr}`);

    return {
      id: existingEvent.id,
      pdf_file_path: `${__dirname}/temp-download/${existingEvent.id}-qr_doc.pdf`,
    };
  }

  // We can use the @UseRequestContext() decorator. It requires us to first inject the MikroORM instance to current context,
  // it will be then used to create the context for us.
  // Under the hood, the decorator will register new request context for our method and execute it inside the context.
  // This decorator will wrap the underlying method in RequestContext.createAsync() call.
  // Every call to such method will create new context (new EntityManager fork) which will be used inside.
  @UseRequestContext()
  async handleEventCron() {
    //  ValidationError: Using global EntityManager instance methods for context specific actions is disallowed, USE getContext() instead

    this.logger.debug(`[CRON] Running cron job for event status update >`);
    const events = await this.em
      .getContext()
      .find(
        Event,
        { $and: [{ event_status: { $in: ['UPCOMING', 'ONGOING'] } }] },
        { filters: ['active'] },
      );

    this.logger.log(`Getting all events: ${JSON.stringify(events)}`);

    const currentDateTime = new Date().getTime();
    for (let i = 0; i < events.length; i++) {
      if (events[i].event_status === 'UPCOMING') {
        const startDateTimeStamp = new Date(
          events[i].event_start_date,
        ).getTime();
        if (currentDateTime >= startDateTimeStamp) {
          this.logger.log(`Event ${events[i].id}: Start Date is done.`);
          const event = await this.em
            .getContext()
            .findOne(Event, { id: events[i].id }, {});

          this.logger.log(`Getting event: ${JSON.stringify(events[i])}`);
          event.event_status = 'ONGOING';
          await this.em.getContext().flush();
        }
      }

      if (events[i].event_status === 'ONGOING') {
        const endDateTimeStamp = new Date(events[i].event_end_date).getTime();
        if (currentDateTime >= endDateTimeStamp) {
          this.logger.log(`Event ${events[i].id}: End Date is done.`);
          const event = await this.em
            .getContext()
            .findOne(Event, { id: events[i].id }, {});

          event.event_status = 'DONE';
          await this.em.getContext().flush();
        }
      }
    }
  }
}
