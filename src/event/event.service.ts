import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import QrCode from 'qrcode';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { FilterQuery, wrap } from '@mikro-orm/core';
import { User } from '../user/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { AttendeesService } from '../attendees/attendees.service';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { EmailService } from '../email/email.service';
import fs from 'fs/promises';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private readonly attendeeService = new AttendeesService(this.em);
  // private readonly emailService = new EmailService();
  constructor(
    // @InjectRepository(Event)
    // private readonly eventRepository: EntityRepository<Event>, // private readonly orm: MikroORM,
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    imageBuffer: Buffer,
    filename: string,
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
    newEvent.event_start_date = new Date();
    newEvent.event_end_date = new Date();
    newEvent.event_description = createEventDto.event_description;
    newEvent.event_status = 'UPCOMING';
    newEvent.event_image = filename;
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

    await this.uploadEventQrCode(createEvent.id, createdEvent.event_name);

    const uploadedImage = await this.uploadFile(
      imageBuffer,
      filename,
      createdEvent.id,
    );

    if (!uploadedImage) {
      this.logger.log(`Failed to upload: ${JSON.stringify(uploadedImage)} `);
    }

    // TODO: add rollback here if it fails
    wrap(createdEvent).assign({
      event_qr: `${createdEvent.event_name}.png`,
      event_image: filename,
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
          this.attendeeService.create({
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
    const s3 = new S3();
    const uploadResult = await s3
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
      throw new BadRequestException('Invalid event ID', {
        cause: new Error(),
        description: 'Event ID is not a v4 uuid',
      });
    }

    this.logger.log(`Finding Event ID: ${id}`);

    const existingEvent = await this.em.findOne(
      Event,
      Object.assign({}, where, { id }),
      { filters: [] },
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

  async testEmail(event_name: string, broadcast_message) {
    this.emailService.sendNewEventNotification(
      'eanj.dcastro@gmail.com',
      event_name,
      broadcast_message,
      broadcast_message,
    );
  }

  async uploadEventQrCode(event_id: string, event_name: string) {
    const filename = `${event_id}${event_name}-qr.png`;
    await QrCode.toFile(
      `${__dirname}/temp/${filename}`,
      `${JSON.stringify({
        event_id,
      })}`,
      {
        color: {
          dark: '#FFFFFF',
          light: '#0000',
        },
      },
    );

    const buffer = await fs.readFile(`${__dirname}/temp/${filename}`);
    await this.uploadFile(buffer, filename, event_id);
    await fs.unlink(`${__dirname}/temp/${filename}`);
  }

  // THIS IS FOR TESTING PURPOSES ONLY
  async testQrCode(event_name: string) {
    await QrCode.toFile(
      `${__dirname}/temp/${event_name}.png`,
      `${JSON.stringify({
        event_name,
      })}`,
      {
        color: {
          dark: '#FFFFFF', // Blue dots
          light: '#0000', // Transparent background
        },
      },
    );

    const text = await fs.readFile(`${__dirname}/temp/${event_name}.png`);

    await this.uploadFile(text, `${event_name}.png`, 'abc');
    await fs.unlink(`${__dirname}/temp/${event_name}.png`);
  }
}
