import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Event } from './entities/event.entity';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: EntityRepository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const newEvent = new Event();

    newEvent.id = 1;
    newEvent.event_title = createEventDto.eventTitle;
    newEvent.created_at = new Date();
    newEvent.updated_at = new Date();
    // newEvent.student = {
    //   id: 1,
    //   studentName: 'ean',
    //   created_at: new Date(),
    //   updated_at: new Date(),
    // };

    await this.eventRepository.upsert(newEvent);
    // await this.eventRepository.flush();

    // return 'This action adds a new event';
  }

  findAll() {
    return `This action returns all event`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
