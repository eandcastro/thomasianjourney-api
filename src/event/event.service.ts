import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import QrCode from 'qrcode';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { FilterQuery, wrap } from '@mikro-orm/core';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    // @InjectRepository(Event)
    // private readonly eventRepository: EntityRepository<Event>, // private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const newEvent = new Event();

    newEvent.event_name = createEventDto.event_name;
    newEvent.event_start_date = new Date();
    newEvent.event_end_date = new Date();
    newEvent.event_description = createEventDto.event_description;
    newEvent.event_status = 'UPCOMING';
    newEvent.event_image = createEventDto.event_image;
    newEvent.event_qr = createEventDto.event_qr;
    newEvent.event_venue = createEventDto.event_venue;
    newEvent.event_lead_office = createEventDto.event_lead_office;
    newEvent.event_broadcast_message = createEventDto.event_broadcast_message;
    newEvent.event_college_attendee = createEventDto.event_college_attendee;
    newEvent.event_year_level_attendee =
      createEventDto.event_year_level_attendee;
    newEvent.event_posted_by_user_id = createEventDto.event_posted_by_user_id;
    newEvent.event_category_name = createEventDto.event_category_name;
    newEvent.event_points = createEventDto.event_points;

    this.logger.log(`Creating new event: ${JSON.stringify(newEvent)}`);

    const dataUrl = await QrCode.toDataURL(
      `${JSON.stringify({
        eventId: 'abc',
      })}`,
    );

    const createEvent = this.em.create(Event, newEvent);
    const createdEvent = await this.em.upsert(createEvent);
    await this.em.flush();

    // TODO: add rollback here
    wrap(createdEvent).assign({ event_qr: dataUrl });
    await this.em.persistAndFlush(createdEvent);

    return {
      message: 'success',
    };
  }

  async findAll(where: FilterQuery<Event> = {}) {
    const events = await this.em.find(Event, where, {});
    return events;
  }

  async findOne(id: string, where: FilterQuery<Event> = {}) {
    if (!uuidValidate(id) || uuidVersion(id) !== 4) {
      throw new BadRequestException('Invalid student ID', {
        cause: new Error(),
        description: 'Student ID is not a v4 uuid',
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

  remove(id: string) {
    return this.em.remove(this.em.getReference(Event, id)).flush();
  }
}
