import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Event } from './entities/event.entity';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: EntityRepository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const newEvent = new Event();

    // TODO: Make id auto increment and auto generated
    newEvent.id = 1;
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
    await this.eventRepository.upsert(newEvent);
    // await this.eventRepository.flush();

    // return 'This action adds a new event';
  }

  findAll() {
    return `This action returns all event`;
  }

  findOne(id: number) {
    this.logger.log(`id: ${JSON.stringify({ id })}`);
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event ${updateEventDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
